'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Settings, Cpu, Gauge, Activity, AlertCircle, BarChart3, Database, Box } from 'lucide-react';
import styles from './page.module.css';

import TelemetryDashboard from '@/components/TelemetryDashboard';
import DiagnosticsPanel from '@/components/DiagnosticsPanel';
import EngineControls from '@/components/EngineControls';
import AnalyticsView from '@/components/AnalyticsView';
import FaultDetectionView from '@/components/FaultDetectionView';
import DatasetManager from '@/components/DatasetManager';
import TrendLogs from '@/components/TrendLogs';
import Engine3DView from '@/components/Engine3DView';
import SystemConfigView from '@/components/SystemConfigView';

const MAX_HISTORY = 50;

export default function Home() {
  const wsRef = useRef<WebSocket | null>(null);
  const [currentData, setCurrentData] = useState<any>(null);
  const [dataHistory, setDataHistory] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [currentThrottle, setCurrentThrottle] = useState(0);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002');
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('Connected to Telemetry Link');
    };

    ws.onclose = () => {
      setConnectionStatus('Disconnected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'telemetry') {
        setCurrentData(data);
        setCurrentThrottle(data.throttle_pct);
        setDataHistory(prev => {
          const newHistory = [...prev, data];
          if (newHistory.length > MAX_HISTORY) {
            return newHistory.slice(newHistory.length - MAX_HISTORY);
          }
          return newHistory;
        });
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleThrottleChange = (throttle: number) => {
    setCurrentThrottle(throttle);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'set_throttle',
        value: throttle
      }));
    }
  };

  const handleModeChange = (mode: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'set_mode',
        value: mode
      }));
    }
  };

  const navItems = [
    { id: 'Dashboard', icon: <Gauge size={20} /> },
    { id: 'Real-time Analytics', icon: <Activity size={20} /> },
    { id: 'Fault Detection', icon: <AlertCircle size={20} /> },
    { id: 'Trend Logs', icon: <BarChart3 size={20} /> },
    { id: 'Datasets', icon: <Database size={20} /> },
    { id: 'System Config', icon: <Settings size={20} />, bottom: true }
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Cpu className="status-healthy" /> 
          <span>Digital Twin Core</span>
        </div>
        
        <nav className={styles.nav}>
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
              style={item.bottom ? { marginTop: 'auto' } : {}}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon} {item.id}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>MALE UAV Aero Piston Engine</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: connectionStatus.includes('Connected') ? 'var(--accent-green)' : 'var(--accent-red)' 
              }} />
              <span className="data-label">{connectionStatus}</span>
            </div>
          </div>
          
          <div className={styles.headerControls}>
             <button className="btn btn-primary">Export Report</button>
          </div>
        </header>

        {activeTab === 'Dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 3D Engine takes full width at the top, height reduced to keep controls visible */}
            <Engine3DView currentData={currentData} height="360px" />

            <div className={styles.dashboardGrid}>
              <div className={styles.colSpan4} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <EngineControls currentThrottle={currentThrottle} setThrottle={handleThrottleChange} />
                <DiagnosticsPanel currentData={currentData} />
              </div>

              <div className={styles.colSpan8} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <TelemetryDashboard dataHistory={dataHistory} currentData={currentData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Real-time Analytics' && (
          <AnalyticsView dataHistory={dataHistory} />
        )}

        {activeTab === 'Fault Detection' && (
          <FaultDetectionView currentData={currentData} dataHistory={dataHistory} />
        )}

        {activeTab === 'Trend Logs' && (
          <TrendLogs dataHistory={dataHistory} />
        )}

        {activeTab === 'Datasets' && (
          <DatasetManager setMode={handleModeChange} currentMode={currentData?.mode || 'physics'} />
        )}

        {activeTab === 'System Config' && (
          <SystemConfigView />
        )}
      </main>
    </div>
  );
}
