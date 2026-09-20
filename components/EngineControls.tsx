'use client';
import React, { useState } from 'react';
import { Settings, Zap } from 'lucide-react';

export default function EngineControls({ currentThrottle, setThrottle }: { currentThrottle: number, setThrottle: (v: number) => void }) {
  const [localThrottle, setLocalThrottle] = useState(currentThrottle || 0);

  const handleThrottleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalThrottle(val);
    setThrottle(val);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Settings size={18} /> Engine Controls
        </div>
      </div>
      
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Interactive MAVLink command interface. Adjust the throttle to manipulate the physical simulation of the engine.
      </p>

      <div className="flex-col" style={{ gap: '1rem' }}>
        <div className="flex-between">
          <span className="data-label">Throttle Command</span>
          <span className="data-value" style={{ fontSize: '1.2rem', color: 'var(--accent-blue)' }}>{localThrottle}%</span>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="1"
          value={localThrottle}
          onChange={handleThrottleChange}
          style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
        />
        
        <div className="flex-between" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>Idle (0%)</span>
          <span>Max Power (100%)</span>
        </div>
      </div>
    </div>
  );
}
