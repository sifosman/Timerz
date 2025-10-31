import React from 'react';
import { USER_PROFILES } from '../constants';
import { DbUserProfile } from '../types';

interface ProfileSwitcherProps {
  profiles: DbUserProfile[];
  currentUser: DbUserProfile;
  onSwitchUser: (user: DbUserProfile) => void;
}

const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ profiles, currentUser, onSwitchUser }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      {profiles.map(profile => {
        const uiProfile = USER_PROFILES[profile.name as 'MS' | 'Ali'];
        if (!uiProfile) return null;
        
        const isActive = currentUser.id === profile.id;
        return (
          <button
            key={profile.id}
            onClick={() => onSwitchUser(profile)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-1/2 ${isActive ? 'bg-brand-green' : 'bg-transparent hover:bg-gray-100'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform ${isActive ? 'scale-105' : 'scale-100 opacity-80'}`}>
              <uiProfile.character />
            </div>
            <span className={`mt-1 font-bold text-sm ${isActive ? 'text-brand-text-dark' : 'text-brand-text-light'}`}>{uiProfile.name}</span>
          </button>
        )
      })}
    </div>
  );
};

export default ProfileSwitcher;