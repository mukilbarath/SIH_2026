'use client';
import React from 'react';
import { AlertTriangle, CheckCircle, ActivitySquare, Clock, Info, Wrench } from 'lucide-react';

const FAULT_DICTIONARY: Record<string, { reason: string, measures: string }> = {
  'LEAN_MIXTURE_CYL3': {
    reason: 'Fuel injector blockage or intake manifold leak affecting Cylinder 3, causing a lean air-fuel ratio.',
    measures: 'Inspect and clean fuel injector 3; check intake manifold for vacuum leaks.'
  },
  'COOLING_DEGRADATION_CYL2': {
    reason: 'Localized coolant flow restriction or failing water pump affecting Cylinder 2, leading to overheating.',
    measures: 'Flush coolant passages for Cylinder 2; inspect water pump and thermostat.'
  },
  'BEARING_WEAR_VIBRATION': {
    reason: 'Main or rod bearing wear leading to increased clearance and abnormal vibration patterns.',
    measures: 'Conduct oil analysis for metal shavings; schedule lower engine rebuild if confirmed.'
  },
  'RICH_MIXTURE_CYL1': {
    reason: 'Leaking fuel injector or faulty spark plug in Cylinder 1, causing unburnt fuel in exhaust.',
    measures: 'Replace fuel injector 1; inspect and gap/replace spark plug.'
  },
  'ELECTRICAL_VOLTAGE_SAG': {
    reason: 'Alternator degradation or failing voltage regulator under high load conditions.',
    measures: 'Test alternator output; inspect electrical connections and replace regulator if necessary.'
  },
  'TURBO_BOOST_DEFICIENCY': {
    reason: 'Wastegate stuck open, boost leak, or compressor wheel damage.',
    measures: 'Inspect wastegate actuator, check intercooler piping for leaks, and inspect turbocharger blades.'
  },
  'SENSOR_FAULT_EGT3': {
    reason: 'EGT thermocouple failure or wiring harness degradation on Cylinder 3.',
    measures: 'Replace EGT sensor on Cylinder 3; check wiring harness for shorts or breaks.'
  },
  'CYLINDER_MISFIRE_TIMING': {
    reason: 'Ignition timing misalignment or failing ignition coil.',
    measures: 'Re-calibrate ignition timing; test and replace faulty ignition coils.'
  },
  'OIL_PRESSURE_LOSS': {
    reason: 'Failing oil pump, clogged oil filter, or severe bearing wear leading to pressure drop.',
    measures: 'Immediately shut down engine; replace oil filter; inspect oil pump and bearings.'
  },
  'EXHAUST_VALVE_LEAK_CYL4': {
    reason: 'Exhaust valve on Cylinder 4 failing to seat properly, causing loss of compression and cooler unburnt exhaust.',
    measures: 'Perform leak-down test on Cylinder 4; inspect valve seat and spring; rebuild cylinder head if necessary.'
  },
  'SPARK_PLUG_FOULING_CYL2': {
    reason: 'Carbon buildup or oil contamination on spark plug in Cylinder 2 leading to intermittent misfires and high vibration.',
    measures: 'Remove and inspect spark plug on Cylinder 2; replace plug and check for oil blow-by.'
  },
  'FUEL_PUMP_DEGRADATION': {
    reason: 'Fuel pump failing to maintain adequate pressure, causing global lean mixture and RPM drop.',
    measures: 'Test fuel line pressure; inspect fuel filter for clogs; replace fuel pump.'
  },
  'WEAR_WARNING': {
    reason: 'Remaining Useful Life (RUL) has fallen below critical threshold due to high RPM usage or age.',
    measures: 'Schedule comprehensive engine overhaul.'
  }
};

export default function DiagnosticsPanel({ currentData }: { currentData: any }) {
  if (!currentData) return <div className="panel">Waiting for data...</div>;

  const isHealthy = currentData.fault_label === 'HEALTHY' || !currentData.fault_label;
  const faultDetails = FAULT_DICTIONARY[currentData.fault_label];
  
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
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', borderRadius: '6px', padding: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex-between" style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={16} /> 
                  <span>{currentData.fault_label}</span>
                </div>
                <span>Sev: {(currentData.fault_severity * 100).toFixed(0)}%</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#fca5a5', margin: 0 }}>
                Anomaly detected in operating parameters. Immediate analysis recommended.
              </p>
              
              {faultDetails && (
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(239, 68, 68, 0.3)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                      <Info size={14} /> Reason:
                    </div>
                    {faultDetails.reason}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                      <Wrench size={14} /> Measures:
                    </div>
                    {faultDetails.measures}
                  </div>
                </div>
              )}
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
              <span className="data-value" style={{ fontSize: '1.2rem', color: typeof currentData.rul_hours === 'number' && currentData.rul_hours < 50 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                {typeof currentData.rul_hours === 'number' ? currentData.rul_hours.toFixed(1) : '--'} <span className="data-unit">hrs</span>
              </span>
            </div>
            <div style={{ width: '100%', background: 'var(--bg-primary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: currentData.rul_hours < 50 ? 'var(--accent-red)' : (currentData.rul_hours < 200 ? 'var(--accent-orange)' : 'var(--accent-green)'), 
                  width: `${Math.min(100, Math.max(0, ((currentData.rul_hours || 0) / 500) * 100))}%`,
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
