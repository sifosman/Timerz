import React from 'react';
import { USER_PROFILES } from '../constants';

type User = 'MS' | 'Ali';

interface ProfileSwitcherProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
}

const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ currentUser, onSwitchUser }) => {
  const users: User[] = ['MS', 'Ali'];

  return (
    <div className="flex items-center justify-center space-x-4 my-4">
      {users.map(user => {
        const profile = USER_PROFILES[user];
        const isActive = currentUser === user;
        return (
          <button
            key={user}
            onClick={() => onSwitchUser(user)}
            className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-300 w-1/2 ${isActive ? 'bg-brand-green' : 'bg-transparent hover:bg-gray-100'}`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform ${isActive ? 'scale-110' : 'scale-100 opacity-70'}`}>
              <profile.character />
            </div>
            <span className={`mt-2 font-bold ${isActive ? 'text-brand-text-dark' : 'text-brand-text-light'}`}>{profile.name}</span>
          </button>
        )
      })}
    </div>
  );
};

export default ProfileSwitcher;