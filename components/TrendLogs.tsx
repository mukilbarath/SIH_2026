'use client';
import { download, telemetryCsv, isHealthy, type Telemetry } from '@/lib/telemetry';
import React from 'react';
import { Download } from 'lucide-react';

function TrendLogsComponent({ dataHistory }: { dataHistory: Telemetry[] }) {
  // Create a reversed copy for the table so newest is on top
  const tableData = React.useMemo(() => [...dataHistory].reverse(), [dataHistory]);

  return (
    <div className="panel">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="panel-title">Raw Telemetry Trend Logs</div>
        <button disabled={!dataHistory.length} onClick={() => download(telemetryCsv(dataHistory), 'simulated-telemetry.csv', 'text/csv')} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Timestamp</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Mode</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>RPM</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Fuel Flow</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Avg CHT</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Fault Label</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>RUL (hrs)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No data available</td>
              </tr>
            ) : tableData.map((row, idx) => {
              const avgCht = (row.cht_1_c + row.cht_2_c + row.cht_3_c + row.cht_4_c) / 4;
              return (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{row.time_s?.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem' }}>{row.mode}</td>
                  <td style={{ padding: '0.75rem' }}>{row.rpm?.toFixed(0)}</td>
                  <td style={{ padding: '0.75rem' }}>{row.fuel_flow_lph?.toFixed(1)} L/h</td>
                  <td style={{ padding: '0.75rem' }}>{avgCht.toFixed(1)} °C</td>
                  <td style={{ padding: '0.75rem', color: isHealthy(row) ? 'var(--accent-green)' : 'var(--accent-red)' }}>{row.fault_label}</td>
                  <td style={{ padding: '0.75rem' }}>{row.rul_hours?.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.memo(TrendLogsComponent);
