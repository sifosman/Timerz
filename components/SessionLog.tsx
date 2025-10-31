import React, { useMemo } from 'react';
import { Session, Activity } from '../types';

const formatDuration = (ms: number | null): string => {
  if (ms === null || ms < 0) return "In progress";
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return "< 1 min";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let str = '';
  if (hours > 0) str += `${hours}h `;
  if (minutes > 0) str += `${minutes}m`;
  return str.trim();
};

const formatDateHeader = (dateKey: string): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayKey = today.toLocaleDateString('en-CA');
    const yesterdayKey = yesterday.toLocaleDateString('en-CA');
    
    const displayDate = new Date(`${dateKey}T00:00:00`);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'long', day: 'numeric' };

    if (dateKey === todayKey) return `Today`;
    if (dateKey === yesterdayKey) return `Yesterday`;
    return displayDate.toLocaleDateString('en-US', options);
};

const SessionLog: React.FC<{ sessions: Session[]; activities: Activity[] }> = ({ sessions, activities }) => {
  const activityMap = useMemo(() => new Map(activities.map(a => [a.id, a])), [activities]);

  const sessionsByDay = useMemo(() => {
    return sessions.reduce((acc, session) => {
        const dateKey = new Date(session.start_time).toLocaleDateString('en-CA');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(session);
        return acc;
    }, {} as Record<string, Session[]>);
  }, [sessions]);

  const sortedDays = useMemo(() => {
    return Object.keys(sessionsByDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [sessionsByDay]);

  return (
    <>
      {sessions.length === 0 ? (
        <div className="text-center py-10 text-brand-text-light">
          <p className="font-bold">No sessions recorded yet!</p>
          <p className="text-sm">Start an activity to begin tracking.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDays.map(dayKey => {
            const daySessions = sessionsByDay[dayKey];
            const dayTotal = daySessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);

            return (
              <div key={dayKey}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-brand-text-dark">{formatDateHeader(dayKey)}</h3>
                  <span className="text-sm font-bold text-brand-text-light">{formatDuration(dayTotal)}</span>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-3 space-y-2">
                  {[...daySessions].reverse().map(session => {
                    const activity = activityMap.get(session.activity_id);
                    return (
                      <div key={session.id} className="flex justify-between items-center p-2 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${activity?.color || 'bg-gray-200'}`}>
                            {activity?.icon}
                          </div>
                          <div>
                             <span className="font-bold text-brand-text-dark">{activity?.name || 'Unknown'}</span>
                             <p className="text-xs text-brand-text-light">{new Date(session.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit'})}</p>
                          </div>
                        </div>
                        <span className="font-bold text-brand-text-dark text-lg">{formatDuration(session.duration_ms)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default SessionLog;