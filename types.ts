import type { ReactElement, FC } from 'react';

export interface Activity {
  id: string;
  name: string;
  color: string;
  icon: ReactElement;
  illustration: ReactElement;
}

export interface Session {
  id: string;
  activityId: string;
  startTime: number;
  endTime: number;
  duration: number; // in milliseconds
}

export interface ActiveSession {
  activityId: string;
  startTime: number;
}

export interface UserProfile {
    name: string;
    character: FC;
}