import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Activity, Session, ActiveSession, UserProfile } from './types';
import { ACTIVITIES, USER_PROFILES } from './constants';
import { getInsightsFromGemini } from './services/geminiService';

import { ActivitySelection, ActiveSessionDisplay } from './components/ActivityTracker';
import SessionLog from './components/SessionLog';
import Insights from './components/Insights';
import AllotmentSettings from './components/AllotmentSettings';
import ProfileSwitcher from './components/ProfileSwitcher';

type User = 'MS' | 'Ali';

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const App: React.FC = () => {
  const [activities] = useState<Activity[]>(ACTIVITIES);
  const [currentUser, setCurrentUser] = useState<User>(getInitialState('currentUser', 'MS'));

  const [sessions, setSessions] = useState<Record<User, Session[]>>(getInitialState('sessions', { MS: [], Ali: [] }));
  const [activeSession, setActiveSession] = useState<Record<User, ActiveSession | null>>(getInitialState('activeSession', { MS: null, Ali: null }));
  const [dailyAllotments, setDailyAllotments] = useState<Record<User, Record<string, number>>>(getInitialState('dailyAllotments', { MS: {}, Ali: {} }));
  
  const [insights, setInsights] = useState<Record<User, string | null>>({ MS: null, Ali: null });
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => { localStorage.setItem('currentUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('activeSession', JSON.stringify(activeSession)); }, [activeSession]);
  useEffect(() => { localStorage.setItem('dailyAllotments', JSON.stringify(dailyAllotments)); }, [dailyAllotments]);

  const handleStartSession = useCallback((activityId: string) => {
    setActiveSession(prev => ({ ...prev, [currentUser]: { activityId, startTime: Date.now() } }));
  }, [currentUser]);

  const handleStopSession = useCallback(() => {
    setActiveSession(prev => {
        const currentActive = prev[currentUser];
        if (currentActive) {
            const newSession: Session = {
                id: Date.now().toString(),
                activityId: currentActive.activityId,
                startTime: currentActive.startTime,
                endTime: Date.now(),
                duration: Date.now() - currentActive.startTime,
            };
            setSessions(p => ({ ...p, [currentUser]: [...p[currentUser], newSession] }));
        }
        return { ...prev, [currentUser]: null };
    });
  }, [currentUser]);
  
  const fetchInsights = useCallback(async () => {
    setIsLoadingInsights(true);
    setError(null);
    try {
        const result = await getInsightsFromGemini();
        setInsights(prev => ({...prev, [currentUser]: result}));
    } catch (e) {
        setError('Brainy the Owl is sleeping! Could not fetch insights.');
    } finally {
        setIsLoadingInsights(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!insights[currentUser]) {
      fetchInsights();
    }
  }, [currentUser, insights, fetchInsights]);

  const handleSaveAllotments = useCallback((newAllotments: Record<string, number>) => {
    setDailyAllotments(prev => ({ ...prev, [currentUser]: newAllotments }));
  }, [currentUser]);

  const { totalTimeToday, todayAllotmentMs } = useMemo(() => {
    const todayKey = new Date().toLocaleDateString('en-CA');
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const total = (sessions[currentUser] || [])
      .filter(s => new Date(s.startTime).toLocaleDateString('en-CA') === todayKey)
      .reduce((acc, curr) => acc + curr.duration, 0);

    const allotmentHours = (dailyAllotments[currentUser] || {})[dayName];
    const allotmentMs = allotmentHours > 0 ? allotmentHours * 60 * 60 * 1000 : 0;
    
    return { totalTimeToday: total, todayAllotmentMs: allotmentMs };
  }, [sessions, dailyAllotments, currentUser]);

  const CurrentUserProfile = USER_PROFILES[currentUser];
  const activeSess = activeSession[currentUser];
  const activeAct = activeSess ? activities.find(a => a.id === activeSess.activityId) : null;

  return (
    <div className="max-w-md mx-auto font-sans">
      {isSettingsOpen && (
        <AllotmentSettings
          allotments={dailyAllotments[currentUser]}
          onSave={handleSaveAllotments}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
      <main className="p-4 space-y-8">
        {/* Profile Section */}
        <section>
          <ProfileSwitcher currentUser={currentUser} onSwitchUser={setCurrentUser} />
          <div className="bg-brand-green rounded-3xl p-4 flex items-center mt-4 space-x-4">
            <div className="w-20 h-20 bg-white/50 rounded-full flex-shrink-0">
              <CurrentUserProfile.character />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-bold text-brand-text-dark">{CurrentUserProfile.name}</h2>
              <p className="text-3xl font-extrabold text-brand-text-dark leading-tight">{formatTime(totalTimeToday)}</p>
              <p className="text-xs text-brand-text-light">used today</p>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="flex-shrink-0 bg-white/50 w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </section>

        {/* Insights Section */}
        <section>
             <h2 className="text-2xl font-extrabold text-brand-text-dark mb-4">Brainy's Corner</h2>
            <Insights insights={insights[currentUser]} isLoading={isLoadingInsights} error={error} />
        </section>

        {/* Activity Tracker Section */}
        <section>
            <h2 className="text-2xl font-extrabold text-brand-text-dark mb-4">Let's Play!</h2>
            {activeAct && activeSess ? (
              <ActiveSessionDisplay
                activity={activeAct}
                startTime={activeSess.startTime}
                onStop={handleStopSession}
                totalTimeToday={totalTimeToday}
                todayAllotment={todayAllotmentMs}
              />
            ) : (
                <ActivitySelection
                    activities={activities}
                    onStartSession={handleStartSession}
                    disabled={!!activeSess}
                />
            )}
        </section>
        
        {/* Session Log Section */}
        {sessions[currentUser].length > 0 && (
            <section>
                <h2 className="text-2xl font-extrabold text-brand-text-dark mb-4">Activity Log</h2>
                <SessionLog sessions={sessions[currentUser]} activities={activities} />
            </section>
        )}
        
      </main>
    </div>
  );
};

export default App;
