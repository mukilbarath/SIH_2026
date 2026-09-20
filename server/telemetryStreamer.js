const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const PORT = 3001;
const DATA_FILE = path.join(__dirname, '..', 'train_healthy.csv');
const FAULT_FILE = path.join(__dirname, '..', 'train_faults.csv');
const SCENARIO_FILE = path.join(__dirname, '..', 'test_scenarios.csv');

const io = new Server(PORT, {
  cors: {
    origin: "*", // allow all for prototype
    methods: ["GET", "POST"]
  }
});

let currentDataSource = DATA_FILE;
let streamingInterval = null;
let currentData = [];
let currentIndex = 0;
const HZ = 10; // 10 Hz

function loadData(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) return reject(err);
      Papa.parse(data, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (err) => reject(err)
      });
    });
  });
}

async function startStream() {
  if (streamingInterval) clearInterval(streamingInterval);
  try {
    console.log(`Loading data from ${currentDataSource}...`);
    currentData = await loadData(currentDataSource);
    currentIndex = 0;
    
    streamingInterval = setInterval(() => {
      if (currentIndex >= currentData.length) {
        currentIndex = 0; // loop back
      }
      
      const row = currentData[currentIndex];
      // Broadcast simulated CAN/MAVLink payload
      io.emit('telemetry', row);
      
      currentIndex++;
    }, 1000 / HZ);
    console.log(`Streaming started at ${HZ}Hz.`);
  } catch (error) {
    console.error('Error starting stream:', error);
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Client can request to change the scenario
  socket.on('set_scenario', async (scenarioType) => {
    console.log(`Client requested scenario: ${scenarioType}`);
    switch (scenarioType) {
      case 'healthy':
        currentDataSource = DATA_FILE;
        break;
      case 'faults':
        currentDataSource = FAULT_FILE;
        break;
      case 'scenarios':
        currentDataSource = SCENARIO_FILE;
        break;
      default:
        currentDataSource = DATA_FILE;
    }
    await startStream();
    io.emit('scenario_changed', scenarioType);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

console.log(`Digital Twin Simulation Server running on ws://localhost:${PORT}`);
startStream();
