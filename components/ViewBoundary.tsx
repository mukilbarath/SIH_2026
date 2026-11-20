'use client';
import { Component, type ReactNode } from 'react';
export default class ViewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="panel" role="status">3D view unavailable. Telemetry and controls remain available.</div> : this.props.children;
  }
}
