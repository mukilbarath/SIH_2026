'use client';
import React from 'react';
import { Play, RotateCcw, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function MissionReplay({ currentScenario, setScenario }: { currentScenario: string, setScenario: (s: string) => void }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Play size={18} /> Mission Simulation & Replay
        </div>
      </div>
      
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Select a dataset scenario to inject into the CAN bus telemetry stream. This allows testing of the Digital Twin behavior under different mission profiles.
      </p>

      <div className="flex-col" style={{ gap: '1rem' }}>
        <button 
          className="btn" 
          style={{ 
            borderColor: currentScenario === 'healthy' ? 'var(--accent-green)' : 'var(--border-color)',
            background: currentScenario === 'healthy' ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
          }}
          onClick={() => setScenario('healthy')}
        >
          <CheckCircle2 size={16} className={currentScenario === 'healthy' ? 'status-healthy' : ''} />
          Nominal Mission Profile (train_healthy.csv)
        </button>

        <button 
          className="btn"
          style={{ 
            borderColor: currentScenario === 'faults' ? 'var(--accent-red)' : 'var(--border-color)',
            background: currentScenario === 'faults' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
          }}
          onClick={() => setScenario('faults')}
        >
          <AlertOctagon size={16} className={currentScenario === 'faults' ? 'status-critical' : ''} />
          Degradation Profile (train_faults.csv)
        </button>

        <button 
          className="btn"
          style={{ 
            borderColor: currentScenario === 'scenarios' ? 'var(--accent-orange)' : 'var(--border-color)',
            background: currentScenario === 'scenarios' ? 'rgba(245, 158, 11, 0.1)' : 'transparent'
          }}
          onClick={() => setScenario('scenarios')}
        >
          <RotateCcw size={16} className={currentScenario === 'scenarios' ? 'status-warning' : ''} />
          Complex Mission Scenarios (test_scenarios.csv)
        </button>
      </div>
    </div>
  );
}
