import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { io } from 'socket.io-client';

test('legacy Socket.IO replays and validates scenario changes', {timeout:20000}, async () => {
  const child=spawn(process.execPath,['server/telemetryStreamer.js'],{stdio:['ignore','pipe','pipe']});
  let socket;
  let stderr = '';
  child.stderr.on('data', data => { stderr += String(data); });
  try {
    await new Promise((resolve,reject) => {
      const timer=setTimeout(() => reject(new Error('Legacy server startup timeout')),10000);
      child.once('error',reject);
      child.stdout.on('data',data => {if(String(data).includes('Legacy local')) {clearTimeout(timer);resolve();}});
      child.once('exit',code => {clearTimeout(timer);reject(new Error('Server exited '+code+': '+stderr));});
    });
    socket=io('http://127.0.0.1:3001',{extraHeaders:{Origin:'http://127.0.0.1:3000'},reconnection:false});
    await once(socket,'connect');
    const [sample]=await once(socket,'telemetry');
    assert.equal(sample.provenance,'SIMULATED');
    socket.emit('set_scenario','faults');
    const [mode]=await once(socket,'scenario_changed');
    assert.equal(mode,'faults');
    socket.emit('set_scenario','../../secret');
    const [error]=await once(socket,'control_error');
    assert.equal(error,'Unknown scenario');
  } finally {socket?.close();if (child.exitCode === null) { child.kill(); await once(child,'exit'); }}
});
