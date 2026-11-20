'use client';
import React from 'react';
import { Settings } from 'lucide-react';
function EngineControls({ currentThrottle, setThrottle, disabled }: {
  currentThrottle: number; setThrottle: (v: number) => void; disabled: boolean;
}) {
  return <section className="panel">
    <h2 className="panel-title"><Settings size={18} /> Engine Controls</h2>
    <p>Adjust the simulated throttle in physics mode. Values reflect server telemetry.</p>
    <label htmlFor="throttle">Throttle command: {currentThrottle.toFixed(0)}%</label>
    <input id="throttle" type="range" min="0" max="100" step="1" value={currentThrottle}
      disabled={disabled} onChange={event => setThrottle(Number(event.target.value))}
      style={{ width: '100%', accentColor: 'var(--accent-blue)' }} />
    {disabled && <p>Connect to physics mode to enable throttle control.</p>}
  </section>;
}

export default React.memo(EngineControls);
