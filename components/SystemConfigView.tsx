'use client';
import React, { useState } from 'react';
import { Save, Server, Settings2, BellRing, Link, SlidersHorizontal, AlertTriangle } from 'lucide-react';

export default function SystemConfigView() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [config, setConfig] = useState({
    wsUrl: 'ws://localhost:3002',
    pollingRate: 10,
    engineModel: 'MALE UAV Inline-4 Aero',
    maxRpm: 5000,
    noiseFactor: 5,
    maxCht: 200,
    maxEgt: 800,
    minOil: 2.0,
    autoAlerts: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate network save
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div className="panel-header" style={{ marginBottom: '2rem' }}>
        <div className="panel-title" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings2 size={24} color="var(--accent-blue)" />
          System Configuration
        </div>
      </div>

      <form onSubmit={handleSave}>
        
        {/* Connection Settings */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <Server size={18} /> Network & Telemetry
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>MAVLink WebSocket URL</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.5rem' }}>
                <Link size={16} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
                <input 
                  type="text" 
                  name="wsUrl"
                  value={config.wsUrl} 
                  onChange={handleChange}
                  style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }} 
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Polling Rate (Hz)</label>
              <input 
                type="number" 
                name="pollingRate"
                value={config.pollingRate} 
                onChange={handleChange}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.65rem', color: 'white', width: '100%', outline: 'none' }} 
              />
            </div>
          </div>
        </div>

        {/* Engine Parameters */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <SlidersHorizontal size={18} /> Simulation Parameters
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Engine Model</label>
              <select 
                name="engineModel"
                value={config.engineModel}
                onChange={handleChange}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.65rem', color: 'white', width: '100%', outline: 'none' }}
              >
                <option value="MALE UAV Inline-4 Aero">MALE UAV Inline-4 Aero</option>
                <option value="Rotax 914 F">Rotax 914 F (Simulated)</option>
                <option value="Generic Flat-4">Generic Flat-4</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Max RPM Limit</label>
              <input 
                type="number" 
                name="maxRpm"
                value={config.maxRpm} 
                onChange={handleChange}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.65rem', color: 'white', width: '100%', outline: 'none' }} 
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Sensor Noise Factor: {config.noiseFactor}%</label>
              <input 
                type="range" 
                name="noiseFactor"
                min="0" 
                max="20" 
                value={config.noiseFactor}
                onChange={handleChange}
                style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Adds gaussian noise to physical sensor outputs (CHT, EGT, Vibration).</span>
            </div>
          </div>
        </div>

        {/* Thresholds */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <BellRing size={18} /> Alarm Thresholds
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-red)' }}>Max CHT (°C)</label>
              <input 
                type="number" 
                name="maxCht"
                value={config.maxCht} 
                onChange={handleChange}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--accent-red)', borderRadius: '4px', padding: '0.65rem', color: 'white', width: '100%', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-red)' }}>Max EGT (°C)</label>
              <input 
                type="number" 
                name="maxEgt"
                value={config.maxEgt} 
                onChange={handleChange}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--accent-red)', borderRadius: '4px', padding: '0.65rem', color: 'white', width: '100%', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-blue)' }}>Min Oil Pressure (Bar)</label>
              <input 
                type="number" 
                name="minOil"
                value={config.minOil} 
                onChange={handleChange}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--accent-blue)', borderRadius: '4px', padding: '0.65rem', color: 'white', width: '100%', outline: 'none' }} 
              />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input 
              type="checkbox" 
              name="autoAlerts"
              id="autoAlerts" 
              checked={config.autoAlerts}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-green)' }} 
            />
            <label htmlFor="autoAlerts" style={{ fontSize: '0.95rem' }}>Enable visual dashboard alerts when thresholds are exceeded</label>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          {showSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)' }}>
              <AlertTriangle size={18} /> Configuration applied to Digital Twin
            </div>
          )}
          <button 
            type="submit" 
            disabled={isSaving}
            style={{ 
              background: 'var(--accent-blue)', 
              color: 'white', 
              border: 'none', 
              padding: '0.75rem 2rem', 
              borderRadius: '6px', 
              fontSize: '1rem', 
              fontWeight: 600, 
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Apply Configuration'}
          </button>
        </div>

      </form>
    </div>
  );
}
