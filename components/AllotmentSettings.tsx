import React, { useState } from 'react';

interface AllotmentSettingsProps {
    allotments: Record<string, number>; // day -> hours
    onSave: (newAllotments: Record<string, number>) => void;
    onClose: () => void;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AllotmentSettings: React.FC<AllotmentSettingsProps> = ({ allotments, onSave, onClose }) => {
    const [localAllotments, setLocalAllotments] = useState(allotments);

    const handleHoursChange = (day: string, hours: string) => {
        const numericHours = parseFloat(hours);
        setLocalAllotments(prev => ({
            ...prev,
            [day.toLowerCase()]: isNaN(numericHours) || numericHours < 0 ? 0 : numericHours,
        }));
    };

    const handleSave = () => {
        onSave(localAllotments);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-brand-card rounded-2xl shadow-2xl w-full max-w-sm p-6 m-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-brand-text-dark text-center">Set Daily Time Limits</h2>
                <div className="space-y-4">
                    {daysOfWeek.map(day => (
                        <div key={day} className="flex items-center justify-between">
                            <label htmlFor={day} className="text-lg text-brand-text-light">{day}</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    id={day}
                                    min="0"
                                    step="0.5"
                                    value={localAllotments[day.toLowerCase()] || ''}
                                    onChange={(e) => handleHoursChange(day, e.target.value)}
                                    className="w-24 bg-stone-100 border border-stone-300 rounded-md px-3 py-2 text-brand-text-dark text-center focus:ring-2 focus:ring-brand-accent-brown focus:outline-none"
                                    placeholder="e.g., 2"
                                />
                                <span className="text-brand-text-light">hours</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-gray-200 text-brand-text-light font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-300">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="bg-brand-accent-brown text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity duration-300">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllotmentSettings;