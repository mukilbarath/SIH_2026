'use client';
import React from 'react';
import { Database, Play, Square, Activity } from 'lucide-react';

export default function DatasetManager({ setMode, currentMode }: { setMode: (mode: string) => void, currentMode: string }) {
  
  const datasets = [
    { id: 'physics', name: 'Live Physics Engine', description: 'Real-time mathematical MAVLink SITL simulation. Control with throttle.' },
    { id: 'healthy', name: 'train_healthy.csv', description: 'Playback of normal operating conditions.' },
    { id: 'faults', name: 'train_faults.csv', description: 'Playback of recorded fault signatures (misfires, leaks).' },
    { id: 'scenarios', name: 'test_scenarios.csv', description: 'Evaluation dataset with dynamic state changes.' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
      <div className="panel" style={{ gridColumn: 'span 12' }}>
        <div className="panel-header">
          <div className="panel-title">Data Source Management</div>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Select the data stream for the Digital Twin. You can switch seamlessly between the live predictive physics engine and historical CSV playback.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {datasets.map(dataset => (
            <div 
              key={dataset.id} 
              style={{ 
                padding: '1.5rem', 
                borderRadius: '8px', 
                background: currentMode === dataset.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0,0,0,0.2)',
                border: currentMode === dataset.id ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setMode(dataset.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentMode === dataset.id ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                  {dataset.id === 'physics' ? <Activity size={18} /> : <Database size={18} />}
                  {dataset.name}
                </h3>
                {currentMode === dataset.id ? (
                  <span style={{ fontSize: '0.75rem', background: 'var(--accent-blue)', color: '#000', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>ACTIVE</span>
                ) : (
                  <Play size={18} style={{ color: 'var(--text-secondary)' }} />
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dataset.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
