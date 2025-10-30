import React, { useState, useEffect, useRef } from 'react';
import { Activity, ActiveSession } from '../types';
import { generateSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audioUtils';

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const ActivityCard: React.FC<{ activity: Activity; onStart: () => void; disabled: boolean }> = ({ activity, onStart, disabled }) => (
  <div className="w-[calc(50%-0.5rem)] flex-grow">
    <div className={`${activity.color} p-4 rounded-t-2xl flex justify-center`}>
      {activity.illustration}
    </div>
    <div className="bg-white p-4 rounded-b-2xl shadow-md">
      <h4 className="font-bold text-brand-text-dark">{activity.name}</h4>
      <button 
        onClick={!disabled ? onStart : undefined}
        disabled={disabled}
        className="mt-2 w-full bg-brand-accent-brown text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        Let's Go
      </button>
    </div>
  </div>
);

export const ActivitySelection: React.FC<{
    activities: Activity[];
    onStartSession: (activityId: string) => void;
    disabled: boolean;
}> = ({ activities, onStartSession, disabled }) => (
    <div className="bg-brand-orange p-4 rounded-2xl">
        <div className="flex flex-wrap gap-4 justify-center">
            {activities.map(activity => (
                <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    onStart={() => onStartSession(activity.id)} 
                    disabled={disabled} 
                />
            ))}
        </div>
    </div>
);


export const ActiveSessionDisplay: React.FC<{
    activity: Activity;
    startTime: number;
    onStop: () => void;
    totalTimeToday: number;
    todayAllotment: number;
}> = ({ activity, startTime, onStop, totalTimeToday, todayAllotment }) => {
    const [elapsedTime, setElapsedTime] = useState(Date.now() - startTime);
    const [isTestingAlarm, setIsTestingAlarm] = useState(false);
    const triggeredAlarmsRef = useRef<Set<string>>(new Set());

    const handleTestAlarm = async () => {
        if (isTestingAlarm) return;
        setIsTestingAlarm(true);
        const testMessage = "This is a test of the alarm system! Hoo-hoo!";
        try {
            const audioData = await generateSpeech(`Hey! Just a friendly reminder: ${testMessage}`);
            if (audioData) playAudio(audioData);
        } finally {
            setIsTestingAlarm(false);
        }
    };

    useEffect(() => {
        triggeredAlarmsRef.current.clear();
    }, [startTime]);

    useEffect(() => {
        const playAlarm = async (text: string, key: string) => {
            if (triggeredAlarmsRef.current.has(key)) return;
            triggeredAlarmsRef.current.add(key);
            const audioData = await generateSpeech(`Hey! Just a friendly reminder: ${text}`);
            if (audioData) playAudio(audioData);
        };

        const timer = setInterval(() => {
            const currentElapsedTime = Date.now() - startTime;
            setElapsedTime(currentElapsedTime);
            const elapsedMinutes = Math.floor(currentElapsedTime / 60000);

            if (todayAllotment > 0) {
                const totalUsedSoFar = totalTimeToday + currentElapsedTime;
                const remainingMs = todayAllotment - totalUsedSoFar;
                const remainingMinutes = Math.round(remainingMs / 60000);

                if (remainingMinutes === 60) playAlarm('you have 1 hour left!', 'rem-60');
                else if (remainingMinutes === 30) playAlarm('you have 30 minutes left!', 'rem-30');
                else if (remainingMinutes === 10) playAlarm('just 10 minutes left!', 'rem-10');
                else if (remainingMs < 0 && !triggeredAlarmsRef.current.has('rem-0')) playAlarm('your screen time is up!', 'rem-0');
            } else {
                if (elapsedMinutes === 30) playAlarm('you have been on screen for 30 minutes!', 'dur-30');
                else if (elapsedMinutes === 45) playAlarm('you have been on screen for 45 minutes!', 'dur-45');
                else if (elapsedMinutes === 60) playAlarm('you have been on screen for 1 hour!', 'dur-60');
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime, todayAllotment, totalTimeToday]);

  return (
    <div className="bg-brand-green p-6 rounded-2xl shadow-lg flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full bg-white/50`}>
          {activity.icon}
        </div>
        <h3 className="text-xl font-bold text-brand-text-dark">{activity.name} in Progress</h3>
      </div>
      <div className="text-5xl font-mono tracking-widest text-brand-text-dark bg-white/70 px-6 py-2 rounded-lg">
        {formatTime(elapsedTime)}
      </div>
      <button 
        onClick={onStop}
        className="w-full bg-brand-accent-maroon text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300"
      >
        Stop Session
      </button>
      <button
        onClick={handleTestAlarm}
        disabled={isTestingAlarm}
        className="w-full bg-black/10 text-brand-text-light font-bold py-2 px-4 rounded-lg hover:bg-black/20 transition-colors duration-300 text-sm mt-2 disabled:opacity-50"
      >
        {isTestingAlarm ? 'Generating...' : 'Test Alarm'}
      </button>
    </div>
  );
};