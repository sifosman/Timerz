import React from 'react';

interface InsightsProps {
  insights: string | null;
  isLoading: boolean;
  error: string | null;
}

const BrainyTheOwl: React.FC = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 flex-shrink-0">
        <g>
            <path d="M 50 90 C 20 90, 20 50, 50 50 C 80 50, 80 90, 50 90" fill="#A98A73" />
            <circle cx="50" cy="45" r="30" fill="#6A5C51" />
            <circle cx="38" cy="45" r="10" fill="white" />
            <circle cx="38" cy="45" r="5" fill="#4F4A45" />
            <circle cx="62" cy="45" r="10" fill="white" />
            <circle cx="62" cy="45" r="5" fill="#4F4A45" />
            <polygon points="50,55 45,65 55,65" fill="#F59E0B" />
            <path d="M 40 20 Q 50 10, 60 20" stroke="#6A5C51" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
    </svg>
);


const Insights: React.FC<InsightsProps> = ({ insights, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2 text-brand-text-light">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-accent-brown"></div>
          <span>Thinking...</span>
        </div>
      );
    }
    
    if (error) {
        return <p className="text-red-500 text-sm">{error}</p>;
    }

    if (insights) {
      return (
        <p className="text-brand-text-dark text-sm italic">"{insights}"</p>
      );
    }

    return null;
  };
  
  return (
    <div className="bg-brand-orange p-4 rounded-2xl flex items-center space-x-4">
      <BrainyTheOwl />
      <div className="flex-1 min-w-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default Insights;