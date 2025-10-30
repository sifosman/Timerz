import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="p-6">
      <h1 className="text-3xl font-extrabold text-brand-text-dark">
        {title}
      </h1>
    </header>
  );
};

export default Header;