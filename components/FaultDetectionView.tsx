'use client';
import { isHealthy as sampleIsHealthy, type Telemetry } from '@/lib/telemetry';
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

function FaultDetectionView({ currentData, dataHistory }: { currentData: Telemetry | null, dataHistory: Telemetry[] }) {

  // AI Diagnostic Radar Model (simulated values based on physical sensors)
  const isHealthy = currentData ? sampleIsHealthy(currentData) : false;
  const faultLabel = currentData?.fault_label || '';

  const radarData = React.useMemo(() => {
    let vibrationScore = 90;
    let tempScore = 95;
    let fuelScore = 85;
    let lubeScore = 90;
    let combustionScore = 95;

    if (!isHealthy) {
      if (faultLabel.includes('VIBRATION')) vibrationScore = 20;
      if (faultLabel.includes('COOLING') || faultLabel.includes('EGT')) tempScore = 20;
      if (faultLabel.includes('MIXTURE')) { fuelScore = 20; combustionScore = 40; }
      if (faultLabel.includes('OIL')) lubeScore = 20;
      if (faultLabel.includes('MISFIRE') || faultLabel.includes('TURBO')) combustionScore = 20;

      // Decrease other scores slightly to reflect global engine stress
      if (vibrationScore !== 20) vibrationScore = 70;
      if (tempScore !== 20) tempScore = 75;
      if (fuelScore !== 20) fuelScore = 65;
      if (lubeScore !== 20) lubeScore = 80;
      if (combustionScore !== 20 && combustionScore !== 40) combustionScore = 75;
    }

    return [
      { subject: 'Vibration', A: vibrationScore, fullMark: 100 },
      { subject: 'Thermal', A: tempScore, fullMark: 100 },
      { subject: 'Fuel Sys', A: fuelScore, fullMark: 100 },
      { subject: 'Lubrication', A: lubeScore, fullMark: 100 },
      { subject: 'Combustion', A: combustionScore, fullMark: 100 },
    ];
  }, [isHealthy, faultLabel]);

  if (!currentData) return <div className="panel flex-center">Loading Fault Detection Engine...</div>;


  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>

      {/* Subsystem Health Radar */}
      <div className="panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div className="panel-title">Illustrative Subsystem Scores</div>
        </div>
        <div style={{ flex: 1, minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#aaa', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Health Score" dataKey="A" stroke={isHealthy ? "var(--accent-green)" : "var(--accent-red)"} fill={isHealthy ? "var(--accent-green)" : "var(--accent-red)"} fillOpacity={0.6} isAnimationActive={false} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Anomaly Detection Timeline */}
      <div className="panel" style={{ gridColumn: 'span 8' }}>
        <div className="panel-header">
          <div className="panel-title">Source Fault Severity</div>
        </div>

        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isHealthy ? (
            <>
              <ShieldCheck size={32} style={{ color: 'var(--accent-green)' }} />
              <div>
                <h3 style={{ margin: 0, color: 'var(--accent-green)' }}>System Normal</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>The current simulated sample has no fault label or severity.</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle size={32} style={{ color: 'var(--accent-red)' }} />
              <div>
                <h3 style={{ margin: 0, color: 'var(--accent-red)' }}>Source Fault: {currentData.fault_label}</h3>
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
              <Bar dataKey="fault_severity" barSize={20} fill="var(--accent-red)" isAnimationActive={false} />
              <Line type="linear" dataKey="fault_severity" stroke="var(--accent-purple)" dot={false} strokeWidth={2} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default React.memo(FaultDetectionView);
