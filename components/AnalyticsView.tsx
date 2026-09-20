'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Activity } from 'lucide-react';

export default function AnalyticsView({ dataHistory }: { dataHistory: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !dataHistory || dataHistory.length === 0) {
    return (
      <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', flexDirection: 'column', gap: '1rem' }}>
        <Activity size={48} style={{ color: 'var(--text-secondary)' }} />
        <h2 style={{ color: 'var(--text-secondary)' }}>Awaiting telemetry data...</h2>
      </div>
    );
  }

  // Derived metrics
  const bsfcData = dataHistory.map(d => ({
    rpm: d.rpm,
    fuel_flow: d.fuel_flow_lph,
    bsfc: d.rpm > 500 ? (d.fuel_flow_lph / (d.rpm * 0.05)) : 0 // mockup BSFC
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
      
      {/* BSFC Curve */}
      <div className="panel" style={{ gridColumn: 'span 8' }}>
        <div className="panel-header">
          <div className="panel-title">Brake Specific Fuel Consumption (BSFC) vs RPM</div>
        </div>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" dataKey="rpm" name="RPM" stroke="#888" domain={['auto', 'auto']} />
              <YAxis type="number" dataKey="bsfc" name="BSFC" stroke="#888" domain={['auto', 'auto']} />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'rgba(20,20,25,0.9)', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Scatter name="BSFC Curve" data={bsfcData} fill="var(--accent-purple)" isAnimationActive={false} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temp Deltas */}
      <div className="panel" style={{ gridColumn: 'span 4' }}>
        <div className="panel-header">
          <div className="panel-title">Thermal Equilibrium (CHT Deltas)</div>
        </div>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time_s" tick={false} stroke="#888" />
              <YAxis stroke="#888" domain={['auto', 'auto']} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(20,20,25,0.9)', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey="cht_1_c" stroke="#ff7300" dot={false} strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="cht_4_c" stroke="#82ca9d" dot={false} strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* RUL Curve */}
      <div className="panel" style={{ gridColumn: 'span 12' }}>
        <div className="panel-header">
          <div className="panel-title">Remaining Useful Life (RUL) Degradation Curve</div>
        </div>
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRul" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time_s" tick={false} stroke="#888" />
              <YAxis domain={['auto', 'auto']} stroke="#888" />
              <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(20,20,25,0.9)', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="rul_hours" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorRul)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
