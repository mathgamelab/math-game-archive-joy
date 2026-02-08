
import React, { useState, useEffect } from 'react';

const StatusBar: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const textColor = dark ? 'text-white' : 'text-gray-900';
  const batteryColor = dark ? 'bg-white' : 'bg-gray-900';
  const batteryBorder = dark ? 'border-white' : 'border-gray-900';

  return (
    <div className={`h-11 flex justify-between items-center px-6 pt-1 text-xs font-semibold ${textColor}`}>
      <div>{time}</div>
      <div className="flex items-center gap-1.5">
        <div className="flex items-end gap-0.5 h-3">
          <div className={`w-0.5 h-1 ${batteryColor} rounded-full`}></div>
          <div className={`w-0.5 h-2 ${batteryColor} rounded-full`}></div>
          <div className={`w-0.5 h-2.5 ${batteryColor} rounded-full`}></div>
          <div className={`w-0.5 h-3 ${batteryColor} rounded-full`}></div>
        </div>
        <span>LTE</span>
        <div className={`w-6 h-3 border ${batteryBorder} rounded-sm relative p-0.5`}>
          <div className={`h-full w-4/5 ${batteryColor} rounded-sm`}></div>
          <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-1.5 ${batteryColor} rounded-r-full`}></div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
