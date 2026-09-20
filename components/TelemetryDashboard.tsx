'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Droplets, Wind, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TelemetryDashboard({ dataHistory, currentData }: { dataHistory: any[], currentData: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="panel flex-center">Loading charts...</div>;
  if (!currentData) return <div className="panel flex-center">Waiting for telemetry...</div>;

  return (
    <div className="grid-container">
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="panel">
          <div className="panel-title"><Activity size={18} className="status-healthy" /> RPM</div>
          <div className="data-value mt-2">{currentData.rpm?.toFixed(0) || 0} <span className="data-unit">rpm</span></div>
        </div>
        <div className="panel">
          <div className="panel-title"><Thermometer size={18} className="status-warning" /> Avg CHT</div>
          <div className="data-value mt-2">
            {((currentData.cht_1_c + currentData.cht_2_c + currentData.cht_3_c + currentData.cht_4_c) / 4).toFixed(1)} 
            <span className="data-unit">°C</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-title"><Thermometer size={18} className="status-critical" /> Avg EGT</div>
          <div className="data-value mt-2">
            {((currentData.egt_1_c + currentData.egt_2_c + currentData.egt_3_c + currentData.egt_4_c) / 4).toFixed(1)} 
            <span className="data-unit">°C</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-title"><Droplets size={18} className="status-healthy" /> Fuel Flow</div>
          <div className="data-value mt-2">{currentData.fuel_flow_lph?.toFixed(2) || 0} <span className="data-unit">L/h</span></div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="panel" style={{ height: '300px' }}>
        <div className="panel-header">
          <div className="panel-title">Engine Speed (RPM)</div>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={dataHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="time_s" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
            <Line type="monotone" dataKey="rpm" stroke="var(--accent-blue)" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="panel" style={{ height: '250px' }}>
          <div className="panel-header">
            <div className="panel-title">Cylinder Head Temperatures (°C)</div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={dataHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="time_s" hide />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
              <Line type="monotone" dataKey="cht_1_c" stroke="#3b82f6" dot={false} />
              <Line type="monotone" dataKey="cht_2_c" stroke="#10b981" dot={false} />
              <Line type="monotone" dataKey="cht_3_c" stroke="#f59e0b" dot={false} />
              <Line type="monotone" dataKey="cht_4_c" stroke="#ef4444" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel" style={{ height: '250px' }}>
          <div className="panel-header">
            <div className="panel-title">Exhaust Gas Temperatures (°C)</div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={dataHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="time_s" hide />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
              <Line type="monotone" dataKey="egt_1_c" stroke="#3b82f6" dot={false} />
              <Line type="monotone" dataKey="egt_2_c" stroke="#10b981" dot={false} />
              <Line type="monotone" dataKey="egt_3_c" stroke="#f59e0b" dot={false} />
              <Line type="monotone" dataKey="egt_4_c" stroke="#ef4444" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
