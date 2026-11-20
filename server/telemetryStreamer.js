// Optional legacy Socket.IO replay. The dashboard uses the Python server instead.
async function main() {
  const { Server } = await import('socket.io');
  const { createServer } = await import('node:http');
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { default: Papa } = await import('papaparse');
  const origins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const datasets = {};
  for (const [mode, filename] of Object.entries({healthy: 'train_healthy.csv', faults: 'train_faults.csv', scenarios: 'test_scenarios.csv'})) {
    const parsed = Papa.parse(await readFile(fileURLToPath(new URL('../' + filename, import.meta.url)), 'utf8'), {
      header: true, dynamicTyping: true, skipEmptyLines: true,
    });
    if (parsed.errors.length || !parsed.data.length || parsed.data.some(row => !Number.isFinite(row.rpm) || row.provenance?.trim() !== 'SIMULATED')) {
      throw new Error('Invalid dataset: ' + filename);
    }
    datasets[mode] = parsed.data;
  }
  const http = createServer();
  const io = new Server(http, {
    cors: { origin: origins }, maxHttpBufferSize: 1024,
    allowRequest: (request, callback) => callback(null, origins.includes(request.headers.origin)),
  });
  let mode = 'healthy';
  let index = 0;
  const interval = setInterval(() => {
    io.emit('telemetry', datasets[mode][index]);
    index = (index + 1) % datasets[mode].length;
  }, 100);
  io.on('connection', socket => {
    let lastChange = 0;
    socket.on('set_scenario', value => {
      if (typeof value !== 'string' || !Object.hasOwn(datasets, value)) {
        socket.emit('control_error', 'Unknown scenario'); return;
      }
      if (Date.now() - lastChange < 250) return;
      lastChange = Date.now(); mode = value; index = 0;
      io.emit('scenario_changed', mode);
    });
  });
  http.listen(3001, '127.0.0.1', () => console.log('Legacy local Socket.IO replay on port 3001'));
  const stop = () => { clearInterval(interval); io.close(); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
