'use client';
import React from 'react';
import { AlertTriangle, CheckCircle, ActivitySquare, Clock } from 'lucide-react';

export default function DiagnosticsPanel({ currentData }: { currentData: any }) {
  if (!currentData) return <div className="panel">Waiting for data...</div>;

  const isHealthy = currentData.fault_label === 'HEALTHY' || !currentData.fault_label;
  
  return (
    <div className="grid-container">
      <div className="panel" style={{ borderColor: isHealthy ? 'var(--border-color)' : 'var(--accent-red)', boxShadow: isHealthy ? 'none' : '0 0 20px rgba(239, 68, 68, 0.2)' }}>
        <div className="panel-header">
          <div className="panel-title">
            <ActivitySquare size={18} /> Health Status
          </div>
          <div className={`data-value ${isHealthy ? 'status-healthy' : 'status-critical animate-pulse'}`} style={{ fontSize: '1.2rem' }}>
            {isHealthy ? 'NOMINAL' : 'FAULT DETECTED'}
          </div>
        </div>
        
        <div className="flex-col" style={{ gap: '1rem', marginTop: '1rem' }}>
          <div className="flex-between">
            <span className="data-label">Current Phase</span>
            <span className="data-value" style={{ fontSize: '1rem' }}>{currentData.phase || 'N/A'}</span>
          </div>
          
          {!isHealthy && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', borderRadius: '6px', padding: '1rem', marginTop: '0.5rem' }}>
              <div className="flex-between" style={{ color: 'var(--accent-red)', fontWeight: 600, marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={16} /> 
                  <span>{currentData.fault_label}</span>
                </div>
                <span>Sev: {(currentData.fault_severity * 100).toFixed(0)}%</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                Anomaly detected in operating parameters. Immediate analysis recommended.
              </p>
            </div>
          )}

          {isHealthy && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-green)', borderRadius: '6px', padding: '1rem', marginTop: '0.5rem' }}>
              <div className="flex-between" style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> 
                  <span>All Systems Normal</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Clock size={18} /> Predictive Analytics
          </div>
        </div>
        <div className="flex-col" style={{ gap: '1.5rem', marginTop: '1rem' }}>
          <div>
            <div className="flex-between mb-1" style={{ marginBottom: '0.5rem' }}>
              <span className="data-label">Estimated RUL (Remaining Useful Life)</span>
              <span className="data-value" style={{ fontSize: '1.2rem', color: currentData.rul_hours < 50 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                {currentData.rul_hours ? currentData.rul_hours.toFixed(1) : '--'} <span className="data-unit">hrs</span>
              </span>
            </div>
            <div style={{ width: '100%', background: 'var(--bg-primary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: currentData.rul_hours < 50 ? 'var(--accent-red)' : (currentData.rul_hours < 200 ? 'var(--accent-orange)' : 'var(--accent-green)'), 
                  width: `${Math.min(100, Math.max(0, (currentData.rul_hours / 500) * 100))}%`,
                  transition: 'width 0.5s ease'
                }} 
              />
            </div>
          </div>
          
          <div className="flex-between">
            <span className="data-label">Maintenance Rec</span>
            <span style={{ fontSize: '0.9rem', color: currentData.rul_hours < 50 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
              {currentData.rul_hours < 50 ? 'Schedule Overhaul' : 'Standard Check'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
