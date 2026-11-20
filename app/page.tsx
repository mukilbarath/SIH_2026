'use client';

import React, { useState, useCallback } from 'react';
import { Settings, Cpu, Gauge, Activity, AlertCircle, BarChart3, Database } from 'lucide-react';
import styles from './page.module.css';

import TelemetryDashboard from '@/components/TelemetryDashboard';
import DiagnosticsPanel from '@/components/DiagnosticsPanel';
import EngineControls from '@/components/EngineControls';
import AnalyticsView from '@/components/AnalyticsView';
import FaultDetectionView from '@/components/FaultDetectionView';
import DatasetManager from '@/components/DatasetManager';
import TrendLogs from '@/components/TrendLogs';
import dynamic from 'next/dynamic';
import { useTelemetry } from '@/hooks/useTelemetry';
import { download, type Mode } from '@/lib/telemetry';
import ViewBoundary from '@/components/ViewBoundary';
const Engine3DView = dynamic(() => import('@/components/Engine3DView'), { ssr: false, loading: () => <div className="panel">Loading 3D view…</div> });
import SystemConfigView from '@/components/SystemConfigView';

export default function Home() {
  const { currentData, dataHistory, status: connectionStatus, error, send, connected } = useTelemetry();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const currentThrottle = currentData?.throttle_pct ?? 0;
  const handleThrottleChange = useCallback((value: number) => send({ type: 'set_throttle', value }), [send]);
  const handleModeChange = useCallback((value: Mode) => send({ type: 'set_mode', value }), [send]);
  const exportReport = () => download(JSON.stringify({
    title: 'SIH 2026 simulated telemetry snapshot', exported_at: new Date().toISOString(),
    disclaimer: 'Simulated data; not validated aircraft monitoring or maintenance guidance.',
    sample_count: dataHistory.length, samples: dataHistory,
  }, null, 2), 'sih-2026-report.json', 'application/json');

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
            <button type="button" aria-pressed={activeTab === item.id}
              key={item.id}
              suppressHydrationWarning
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
              style={item.bottom ? { marginTop: 'auto' } : {}}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon} {item.id}
            </button>
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
                background: connected ? 'var(--accent-green)' : 'var(--accent-red)'
              }} />
              <span className="data-label" role="status">{connectionStatus}</span>
            </div>
          </div>

          <div className={styles.headerControls}>
            <button className="btn btn-primary" suppressHydrationWarning disabled={!dataHistory.length} onClick={exportReport}>Export Report</button>
          </div>
        </header>

        {error && <p role="alert">{error}</p>}
        {activeTab === 'Dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ViewBoundary><Engine3DView currentData={currentData} height="360px" /></ViewBoundary>

            <div className={styles.dashboardGrid}>
              <div className={styles.colSpan4} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <EngineControls currentThrottle={currentThrottle} setThrottle={handleThrottleChange} disabled={!connected || currentData?.mode !== 'physics'} />
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
          <DatasetManager disabled={!connected} setMode={handleModeChange} currentMode={currentData?.mode || 'physics'} />
        )}

        {activeTab === 'System Config' && (
          <SystemConfigView />
        )}
      </main>
    </div>
  );
}
