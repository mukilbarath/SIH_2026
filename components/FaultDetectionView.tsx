'use client';
import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function FaultDetectionView({ currentData, dataHistory }: { currentData: any, dataHistory: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !currentData) return <div className="panel flex-center">Loading Fault Detection Engine...</div>;

  // AI Diagnostic Radar Model (simulated values based on physical sensors)
  const isHealthy = currentData.fault_severity < 0.5;
  
  let vibrationScore = 90;
  let tempScore = 95;
  let fuelScore = 85;
  let lubeScore = 90;
  let combustionScore = 95;

  if (!isHealthy) {
    const label = currentData.fault_label || '';
    if (label.includes('VIBRATION')) vibrationScore = 20;
    if (label.includes('COOLING') || label.includes('EGT')) tempScore = 20;
    if (label.includes('MIXTURE')) { fuelScore = 20; combustionScore = 40; }
    if (label.includes('OIL')) lubeScore = 20;
    if (label.includes('MISFIRE') || label.includes('TURBO')) combustionScore = 20;
    
    // Decrease other scores slightly to reflect global engine stress
    if (vibrationScore !== 20) vibrationScore = 70;
    if (tempScore !== 20) tempScore = 75;
    if (fuelScore !== 20) fuelScore = 65;
    if (lubeScore !== 20) lubeScore = 80;
    if (combustionScore !== 20 && combustionScore !== 40) combustionScore = 75;
  }
  
  const radarData = [
    { subject: 'Vibration', A: vibrationScore, fullMark: 100 },
    { subject: 'Thermal', A: tempScore, fullMark: 100 },
    { subject: 'Fuel Sys', A: fuelScore, fullMark: 100 },
    { subject: 'Lubrication', A: lubeScore, fullMark: 100 },
    { subject: 'Combustion', A: combustionScore, fullMark: 100 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
      
      {/* Subsystem Health Radar */}
      <div className="panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div className="panel-title">Subsystem AI Isolation Forest</div>
        </div>
        <div style={{ flex: 1, minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#aaa', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Health Score" dataKey="A" stroke={isHealthy ? "var(--accent-green)" : "var(--accent-red)"} fill={isHealthy ? "var(--accent-green)" : "var(--accent-red)"} fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Anomaly Detection Timeline */}
      <div className="panel" style={{ gridColumn: 'span 8' }}>
        <div className="panel-header">
          <div className="panel-title">Anomaly Detection Probability (Autoencoder)</div>
        </div>
        
        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isHealthy ? (
            <>
              <ShieldCheck size={32} style={{ color: 'var(--accent-green)' }} />
              <div>
                <h3 style={{ margin: 0, color: 'var(--accent-green)' }}>System Normal</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>All telemetry parameters are within operational thresholds.</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle size={32} style={{ color: 'var(--accent-red)' }} />
              <div>
                <h3 style={{ margin: 0, color: 'var(--accent-red)' }}>Fault Detected: {currentData.fault_label}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Severity: {(currentData.fault_severity * 100).toFixed(1)}%</p>
              </div>
            </>
          )}
        </div>

        <div style={{ height: '250px', width: '100%' }}>
          <ResponsiveContainer>
            <ComposedChart data={dataHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time_s" tick={false} stroke="#888" />
              <YAxis domain={[0, 1]} stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(20,20,25,0.9)', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Bar dataKey="fault_severity" barSize={20} fill="var(--accent-red)" />
              <Line type="monotone" dataKey="fault_severity" stroke="var(--accent-purple)" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
