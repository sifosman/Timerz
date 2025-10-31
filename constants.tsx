import React from 'react';
import { Activity, UIUserProfile } from './types';

const MsCharacter: React.FC = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g>
        <circle cx="50" cy="50" r="45" fill="#B0B8BF"/>
        <circle cx="35" cy="45" r="7" fill="#4F4A45"/>
        <circle cx="65" cy="45" r="7" fill="#4F4A45"/>
        {/* FIX: Removed invalid property 'cy_comment' from <ellipse> element. */}
        <ellipse cx="50" cy="62" rx="12" ry="8" fill="#6A5C51"/>
        <circle cx="20" cy="25" r="15" fill="#9CA3AF"/>
        <circle cx="80" cy="25" r="15" fill="#9CA3AF"/>
        <circle cx="35" cy="45" r="2" fill="white"/>
        <circle cx="65" cy="45" r="2" fill="white"/>
      </g>
    </svg>
);

const AliCharacter: React.FC = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g>
        <circle cx="50" cy="50" r="45" fill="#F59E0B"/>
        <path d="M 50,50 Q 20,95 50,90 Q 80,95 50,50 Z" fill="white"/>
        <circle cx="35" cy="45" r="7" fill="#4F4A45"/>
        <circle cx="65" cy="45" r="7" fill="#4F4A45"/>
        <polygon points="50,55 45,65 55,65" fill="#4F4A45"/>
        <path d="M 25,5 L 5,30 L 45,20 Z" fill="#F59E0B"/>
        <path d="M 75,5 L 95,30 L 55,20 Z" fill="#F59E0B"/>
        <circle cx="35" cy="45" r="2" fill="white"/>
        <circle cx="65" cy="45" r="2" fill="white"/>
      </g>
    </svg>
);

export const USER_PROFILES: Record<'MS' | 'Ali', UIUserProfile> = {
    MS: { name: 'MS', character: MsCharacter },
    Ali: { name: 'Ali', character: AliCharacter },
};


export const ACTIVITIES: Activity[] = [
  {
    id: 'roblox',
    name: 'Roblox',
    color: 'bg-red-200',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-800" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 16.5L12 14l2.5 2.5L12 11.5 9.5 9l2.5-2.5L12 9l2.5-2.5L17 9l-2.5 2.5L17 14l-2.5-2.5L12 14l-2.5 2.5z"/>
      </svg>
    ),
    illustration: (
        <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16"><rect x="10" y="10" width="60" height="60" rx="10" ry="10" fill="#E53E3E"/><path transform="translate(20 20) scale(1.6)" fill="white" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 16.5L12 14l2.5 2.5L12 11.5 9.5 9l2.5-2.5L12 9l2.5-2.5L17 9l-2.5 2.5L17 14l-2.5-2.5L12 14l-2.5 2.5z"/></svg>
    )
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: 'bg-red-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-900" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.73,18.78 17.93,18.84C17.13,18.91 16.44,18.94 15.84,18.94L12,19C9.81,19 8.2,18.84 7.17,18.56C6.27,18.31 5.69,17.73 5.44,16.83C5.31,16.36 5.22,15.73 5.16,14.93C5.09,14.13 5.06,13.44 5.06,12.84L5,12C5,9.81 5.16,8.2 5.44,7.17C5.69,6.27 6.27,5.69 7.17,5.44C7.64,5.31 8.27,5.22 9.07,5.16C9.87,5.09 10.56,5.06 11.16,5.06L12,5C14.19,5 15.8,5.16 16.83,5.44C17.73,5.69 18.31,6.27 18.56,7.17Z" />
      </svg>
    ),
    illustration: (
        <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16"><rect x="10" y="10" width="60" height="60" rx="10" ry="10" fill="#C53030"/><path transform="translate(20 20) scale(1.6)" fill="white" d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.73,18.78 17.93,18.84C17.13,18.91 16.44,18.94 15.84,18.94L12,19C9.81,19 8.2,18.84 7.17,18.56C6.27,18.31 5.69,17.73 5.44,16.83C5.31,16.36 5.22,15.73 5.16,14.93C5.09,14.13 5.06,13.44 5.06,12.84L5,12C5,9.81 5.16,8.2 5.44,7.17C5.69,6.27 6.27,5.69 7.17,5.44C7.64,5.31 8.27,5.22 9.07,5.16C9.87,5.09 10.56,5.06 11.16,5.06L12,5C14.19,5 15.8,5.16 16.83,5.44C17.73,5.69 18.31,6.27 18.56,7.17Z" /></svg>
    )
  },
  {
    id: 'other',
    name: 'Other',
    color: 'bg-blue-200',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
      </svg>
    ),
    illustration: (
        <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16"><rect x="10" y="10" width="60" height="60" rx="10" ry="10" fill="#63B3ED"/><path transform="translate(20 20) scale(1.6)" fill="white" d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
    )
  },
];
