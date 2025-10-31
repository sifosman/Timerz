import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Activity, Session, ActiveSession, UIUserProfile, DbUserProfile } from './types';
import { ACTIVITIES, USER_PROFILES } from './constants';
import { getInsightsFromGemini } from './services/geminiService';
import { getSupabaseClient, isSupabaseConfigured } from './services/supabaseClient';

import { ActivitySelection, ActiveSessionDisplay } from './components/ActivityTracker';
import SessionLog from './components/SessionLog';
import Insights from './components/Insights';
import AllotmentSettings from './components/AllotmentSettings';
import ProfileSwitcher from './components/ProfileSwitcher';

// A custom hook to persist state to localStorage
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null
      ? JSON.parse(stickyValue)
      : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}


const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const initialProfiles: DbUserProfile[] = [
    { id: 'ms_profile', name: 'MS', created_at: new Date().toISOString() },
    { id: 'ali_profile', name: 'Ali', created_at: new Date().toISOString() }
];

const App: React.FC = () => {
  const [activities] = useState<Activity[]>(ACTIVITIES);
  const [dbProfiles, setDbProfiles] = useState<DbUserProfile[]>(initialProfiles);
  
  const [sessions, setSessions] = useStickyState<Record<string, Session[]>>({}, 'screen-time-sessions');
  const [activeSession, setActiveSession] = useStickyState<ActiveSession | null>(null, 'screen-time-active-session');
  const [dailyAllotments, setDailyAllotments] = useStickyState<Record<string, Record<string, number>>>({}, 'screen-time-allotments');
  const [currentUser, setCurrentUser] = useStickyState<DbUserProfile>(initialProfiles[0], 'screen-time-current-user');

  const [insights, setInsights] = useStickyState<Record<string, string | null>>({}, 'screen-time-insights');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const supabase = useMemo(() => getSupabaseClient(), []);
  const supaEnabled = useMemo(() => isSupabaseConfigured(), []);

  // Ensure Supabase profiles exist for MS and Ali and load their UUIDs
  useEffect(() => {
    if (!supaEnabled || !supabase) return;
    let cancelled = false;
    const ensureProfiles = async () => {
      // Upsert by unique name constraint
      await supabase.from('st_profiles').upsert([
        { name: 'MS' },
        { name: 'Ali' }
      ], { onConflict: 'name' });
      const { data } = await supabase.from('st_profiles').select('*').in('name', ['MS', 'Ali']).order('created_at');
      if (!cancelled && data) {
        const mapped: DbUserProfile[] = data.map((p: any) => ({ id: p.id, name: p.name, created_at: p.created_at }));
        setDbProfiles(mapped);
        // If currentUser is not set to one of these, default to first
        setCurrentUser(prev => {
          if (!prev || !mapped.find(m => m.id === prev.id)) {
            return mapped[0];
          }
          return prev;
        });
      }
    };
    ensureProfiles();
    return () => { cancelled = true; };
  }, [supaEnabled, supabase, setDbProfiles, setCurrentUser]);

  const handleStartSession = useCallback(async (activityId: string) => {
    if (!currentUser) return;
    const startTime = Date.now();
    setActiveSession({ activityId, startTime });
    if (supaEnabled && supabase) {
      await supabase.from('st_sessions').insert({
        profile_id: currentUser.id,
        activity_id: activityId,
        start_time: new Date(startTime).toISOString(),
        end_time: null,
        duration_ms: null,
      });
    }
  }, [currentUser, setActiveSession, supaEnabled, supabase]);

  const handleStopSession = useCallback(async () => {
    if (!activeSession || !currentUser) return;
    const endTime = Date.now();
    const newSession: Session = {
      id: `${currentUser.id}-${Date.now()}`,
      profile_id: currentUser.id,
      activity_id: activeSession.activityId,
      start_time: new Date(activeSession.startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      duration_ms: endTime - activeSession.startTime,
    };
    setSessions(prev => ({
        ...prev,
        [currentUser.id]: [...(prev[currentUser.id] || []), newSession]
    }));
    setActiveSession(null);
    if (supaEnabled && supabase) {
      // Update the most recent open session for this profile
      const { data: openRows } = await supabase
        .from('st_sessions')
        .select('*')
        .eq('profile_id', currentUser.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1);
      const open = openRows && openRows[0];
      if (open) {
        await supabase
          .from('st_sessions')
          .update({ end_time: new Date(endTime).toISOString(), duration_ms: endTime - new Date(open.start_time).getTime() })
          .eq('id', open.id);
      }
    }
  }, [activeSession, currentUser, setSessions, setActiveSession, supaEnabled, supabase]);
  
  const fetchInsights = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingInsights(true);
    try {
        const result = await getInsightsFromGemini();
        setInsights(prev => ({...prev, [currentUser.id]: result}));
    } catch (e) {
        setInsights(prev => ({...prev, [currentUser.id]: 'Brainy the Owl is sleeping! Could not fetch insights.'}));
    } finally {
        setIsLoadingInsights(false);
    }
  }, [currentUser, setInsights]);

  useEffect(() => {
    if (currentUser && !insights[currentUser.id]) {
      fetchInsights();
    }
  }, [currentUser, insights, fetchInsights]);

  useEffect(() => {
    if (!supaEnabled || !supabase || !currentUser) return;
    let ignore = false;
    const loadInitial = async () => {
      // Load completed sessions
      const { data: sessionRows } = await supabase
        .from('st_sessions')
        .select('*')
        .eq('profile_id', currentUser.id)
        .order('start_time', { ascending: true });
      if (!ignore && sessionRows) {
        const completed = (sessionRows as any[]).filter(r => r.end_time !== null).map(r => ({
          id: String(r.id),
          profile_id: r.profile_id,
          activity_id: r.activity_id,
          start_time: r.start_time,
          end_time: r.end_time,
          duration_ms: r.duration_ms,
        })) as Session[];
        setSessions(prev => ({ ...prev, [currentUser.id]: completed }));
        // Set active if there is an open session
        const open = (sessionRows as any[]).find(r => r.end_time === null);
        if (open) {
          setActiveSession({ activityId: open.activity_id, startTime: new Date(open.start_time).getTime() });
        } else {
          setActiveSession(null);
        }
      }
    };
    loadInitial();

    const channel = supabase.channel(`rt:st_sessions:${currentUser.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'st_sessions', filter: `profile_id=eq.${currentUser.id}` }, (payload) => {
        const row: any = payload.new;
        if (row.end_time === null) {
          // Active session started on another device
          setActiveSession({ activityId: row.activity_id, startTime: new Date(row.start_time).getTime() });
        } else {
          // Completed session inserted (unlikely pattern), but handle anyway
          const s: Session = {
            id: String(row.id),
            profile_id: row.profile_id,
            activity_id: row.activity_id,
            start_time: row.start_time,
            end_time: row.end_time,
            duration_ms: row.duration_ms,
          };
          setSessions(prev => ({ ...prev, [currentUser.id]: [...(prev[currentUser.id] || []), s] }));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'st_sessions', filter: `profile_id=eq.${currentUser.id}` }, (payload) => {
        const row: any = payload.new;
        // If an open session was completed
        if (row.end_time !== null) {
          setActiveSession(prev => prev && row.activity_id === prev.activityId ? null : prev);
          const s: Session = {
            id: String(row.id),
            profile_id: row.profile_id,
            activity_id: row.activity_id,
            start_time: row.start_time,
            end_time: row.end_time,
            duration_ms: row.duration_ms,
          };
          setSessions(prev => ({ ...prev, [currentUser.id]: [...(prev[currentUser.id] || []), s] }));
        }
      })
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [supaEnabled, supabase, currentUser, setActiveSession, setSessions]);

  const handleSaveAllotments = useCallback((newAllotments: Record<string, number>) => {
    if (!currentUser) return;
    setDailyAllotments(prev => ({
        ...prev,
        [currentUser.id]: newAllotments
    }));
    setIsSettingsOpen(false);
  }, [currentUser, setDailyAllotments]);

  const currentUserSessions = useMemo(() => sessions[currentUser.id] || [], [sessions, currentUser]);
  const activeActivity = useMemo(() => activeSession ? activities.find(a => a.id === activeSession.activityId) : null, [activities, activeSession]);

  const today = new Date();
  const todayKey = today.toLocaleDateString('en-CA');
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const totalTimeToday = useMemo(() => {
    return currentUserSessions
      .filter(s => new Date(s.start_time).toLocaleDateString('en-CA') === todayKey && s.duration_ms)
      .reduce((acc, s) => acc + (s.duration_ms || 0), 0);
  }, [currentUserSessions, todayKey]);

  const todayAllotment = useMemo(() => {
    if (!currentUser || !dailyAllotments[currentUser.id]) return 0;
    const hours = dailyAllotments[currentUser.id]?.[dayOfWeek] || 0;
    return hours * 3600 * 1000;
  }, [currentUser, dailyAllotments, dayOfWeek]);

  return (
    <div className="min-h-screen bg-brand-background font-sans text-brand-text-dark">
      <div className="container mx-auto max-w-6xl p-4 lg:p-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          
          <main className="space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
                <ProfileSwitcher 
                    profiles={dbProfiles}
                    currentUser={currentUser}
                    onSwitchUser={(user) => {
                      if (activeSession) {
                        alert("Please stop the active session before switching profiles.");
                        return;
                      }
                      setCurrentUser(user);
                    }}
                />
                <div className="text-center mt-2 border-t border-gray-100 pt-3">
                    <h1 className="text-xl font-bold text-brand-text-dark">Time Today: {formatTime(totalTimeToday)}</h1>
                    {todayAllotment > 0 && 
                        <p className="text-sm text-brand-text-light">Limit: {formatTime(todayAllotment)}</p>
                    }
                </div>
            </div>
            
            <Insights insights={insights[currentUser.id]} isLoading={isLoadingInsights} error={null} />
            
            <h2 className="text-xl font-bold">Let's Play!</h2>
            {activeSession && activeActivity ? (
              <ActiveSessionDisplay
                activity={activeActivity}
                startTime={activeSession.startTime}
                onStop={handleStopSession}
                totalTimeToday={totalTimeToday}
                todayAllotment={todayAllotment}
              />
            ) : (
              <ActivitySelection
                activities={activities}
                onStartSession={handleStartSession}
                disabled={!!activeSession}
              />
            )}
          </main>
          
          <aside className="mt-8 lg:mt-0">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Activity Log</h2>
                <button onClick={() => setIsSettingsOpen(true)} className="text-sm font-bold text-brand-accent-brown hover:underline">
                    Set Daily Limits
                </button>
            </div>
            <SessionLog sessions={currentUserSessions} activities={activities} />
          </aside>
        </div>
      </div>
      
      {isSettingsOpen && (
          <AllotmentSettings 
              allotments={dailyAllotments[currentUser.id] || {}}
              onSave={handleSaveAllotments}
              onClose={() => setIsSettingsOpen(false)}
          />
      )}
    </div>
  );
};

export default App;