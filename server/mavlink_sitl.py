import asyncio
import time
import math
import json
import csv
import websockets
import os
from pymavlink import mavutil

# --- Engine Physics Model State ---
state = {
    'mode': 'physics',  # physics, healthy, faults, scenarios
    'throttle_pct': 0.0,
    'rpm': 0.0,
    'cht': [150.0, 150.0, 150.0, 150.0],
    'egt': [700.0, 700.0, 700.0, 700.0],
    'fuel_flow': 0.0,
    'engine_load': 0.0,
    'fault_label': 'HEALTHY',
    'fault_severity': 0.0,
    'rul_hours': 500.0,
    'is_running': False
}

connected_clients = set()
csv_data_cache = {}
csv_index = 0

def load_csv(filename):
    if filename in csv_data_cache:
        return csv_data_cache[filename]
        
    filepath = os.path.join(os.path.dirname(__file__), '..', filename)
    data = []
    try:
        with open(filepath, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert numeric fields
                for k in row:
                    try:
                        row[k] = float(row[k])
                    except ValueError:
                        pass
                data.append(row)
        csv_data_cache[filename] = data
        print(f"Loaded {len(data)} rows from {filename}")
    except Exception as e:
        print(f"Error loading {filename}: {e}")
    return data

def get_csv_filename(mode):
    if mode == 'healthy': return 'train_healthy.csv'
    if mode == 'faults': return 'train_faults.csv'
    if mode == 'scenarios': return 'test_scenarios.csv'
    return None

def update_physics(dt):
    # Basic target calculations
    target_rpm = state['throttle_pct'] * 50.0  # Max 5000 RPM at 100%
    if state['throttle_pct'] > 5 and not state['is_running']:
        state['is_running'] = True
    elif state['throttle_pct'] <= 5:
        target_rpm = 0.0
        state['is_running'] = False

    # RPM interpolation (lag)
    state['rpm'] += (target_rpm - state['rpm']) * (dt / 1.5)
    
    # Engine Load is roughly proportional to throttle when running
    state['engine_load'] = state['throttle_pct'] if state['is_running'] else 0.0
    
    # Fuel flow (L/hr)
    state['fuel_flow'] = (state['rpm'] / 5000.0) * 30.0 + (5.0 if state['is_running'] else 0.0)
    
    # Temperatures
    target_cht = 150.0 + (state['rpm'] / 5000.0) * 60.0  # Up to 210C
    target_egt = 700.0 + (state['rpm'] / 5000.0) * 150.0 # Up to 850C
    
    # Add random noise and smooth transition
    for i in range(4):
        state['cht'][i] += (target_cht - state['cht'][i] + (math.sin(time.time() * 2 + i) * 2.0)) * (dt / 10.0)
        state['egt'][i] += (target_egt - state['egt'][i] + (math.cos(time.time() * 5 + i) * 5.0)) * (dt / 2.0)
        
    # Degradation
    if state['rpm'] > 4500:
        state['rul_hours'] -= (dt / 3600.0) * 10.0  # Degrade 10x faster at high RPM
    elif state['is_running']:
        state['rul_hours'] -= (dt / 3600.0)
        
    if state['rul_hours'] < 50:
        state['fault_label'] = 'WEAR_WARNING'
        state['fault_severity'] = 0.8
    else:
        state['fault_label'] = 'HEALTHY'
        state['fault_severity'] = 0.0

async def engine_loop():
    global csv_index
    print("Starting Physics Engine Loop (10Hz)...")
    last_time = time.time()
    
    while True:
        current_time = time.time()
        dt = current_time - last_time
        last_time = current_time
        
        telemetry_payload = None
        
        if state['mode'] == 'physics':
            update_physics(dt)
            
            # Physics mode payload
            telemetry_payload = {
                'type': 'telemetry',
                'time_s': current_time,
                'throttle_pct': state['throttle_pct'],
                'rpm': state['rpm'],
                'fuel_flow_lph': state['fuel_flow'],
                'cht_1_c': state['cht'][0],
                'cht_2_c': state['cht'][1],
                'cht_3_c': state['cht'][2],
                'cht_4_c': state['cht'][3],
                'egt_1_c': state['egt'][0],
                'egt_2_c': state['egt'][1],
                'egt_3_c': state['egt'][2],
                'egt_4_c': state['egt'][3],
                'fault_label': state['fault_label'],
                'fault_severity': state['fault_severity'],
                'rul_hours': state['rul_hours'],
                'mode': 'physics',
                # Mock physics extras
                'vibration_x_g': 0.1 if state['is_running'] else 0.0,
                'vibration_y_g': 0.1 if state['is_running'] else 0.0,
                'vibration_z_g': 0.1 if state['is_running'] else 0.0,
                'oil_pressure_bar': 4.2 if state['is_running'] else 0.0,
                'oil_temp_c': 90.0 if state['is_running'] else 20.0,
            }
        else:
            filename = get_csv_filename(state['mode'])
            data = load_csv(filename)
            if data and len(data) > 0:
                if csv_index >= len(data):
                    csv_index = 0
                row = data[csv_index]
                
                state['throttle_pct'] = row.get('throttle_pct', 0)
                state['rpm'] = row.get('rpm', 0)
                
                telemetry_payload = {
                    'type': 'telemetry',
                    'time_s': current_time,
                    'throttle_pct': row.get('throttle_pct', 0),
                    'rpm': row.get('rpm', 0),
                    'fuel_flow_lph': row.get('fuel_flow_lph', 0),
                    'cht_1_c': row.get('cht_1_c', 0),
                    'cht_2_c': row.get('cht_2_c', 0),
                    'cht_3_c': row.get('cht_3_c', 0),
                    'cht_4_c': row.get('cht_4_c', 0),
                    'egt_1_c': row.get('egt_1_c', 0),
                    'egt_2_c': row.get('egt_2_c', 0),
                    'egt_3_c': row.get('egt_3_c', 0),
                    'egt_4_c': row.get('egt_4_c', 0),
                    'fault_label': row.get('fault_label', 'HEALTHY'),
                    'fault_severity': row.get('fault_severity', 0),
                    'rul_hours': row.get('rul_hours', 500),
                    'mode': state['mode'],
                    # Dataset extras
                    'vibration_x_g': row.get('vibration_x_g', 0),
                    'vibration_y_g': row.get('vibration_y_g', 0),
                    'vibration_z_g': row.get('vibration_z_g', 0),
                    'oil_pressure_bar': row.get('oil_pressure_bar', 0),
                    'oil_temp_c': row.get('oil_temp_c', 0)
                }
                csv_index += 1
            else:
                state['mode'] = 'physics'
                
        if telemetry_payload and connected_clients:
            message = json.dumps(telemetry_payload)
            websockets.broadcast(connected_clients, message)
            
        await asyncio.sleep(0.1) # 10Hz

async def handler(websocket):
    print(f"Client connected")
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            data = json.loads(message)
            if data.get('type') == 'set_throttle':
                throttle = float(data.get('value', 0))
                print(f"Client set throttle to {throttle}%")
                state['throttle_pct'] = throttle
            elif data.get('type') == 'set_mode':
                mode = data.get('value', 'physics')
                print(f"Client set mode to {mode}")
                state['mode'] = mode
                global csv_index
                csv_index = 0 # reset replay
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        print("Client disconnected")
        connected_clients.remove(websocket)

async def main():
    asyncio.create_task(engine_loop())
    print("Digital Twin MAVLink SITL Server running on ws://localhost:3002")
    async with websockets.serve(handler, "localhost", 3002):
        await asyncio.Future()  # run forever

if __name__ == '__main__':
    asyncio.run(main())
