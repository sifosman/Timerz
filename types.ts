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
  profile_id: string;
  activity_id: string;
  start_time: string; // ISO 8601 string
  end_time: string | null; // ISO 8601 string or null for active sessions
  duration_ms: number | null;
}

export interface ActiveSession {
  activityId: string;
  startTime: number;
}

export interface UIUserProfile {
    name: string;
    character: FC;
}

export interface DbUserProfile {
    id: string;
    name: string;
    created_at: string;
}