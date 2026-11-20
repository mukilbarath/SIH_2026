import asyncio
import contextlib
import csv
import json
import tempfile
import unittest
from functools import lru_cache
from pathlib import Path
from server.engine import Engine, DATASETS, DATA_ROOT, NUMERIC_FIELDS, load_dataset
from server.mavlink_sitl import TelemetryServer, DEFAULT_ORIGINS
from websockets.asyncio.server import serve
from websockets.asyncio.client import connect
from websockets.exceptions import InvalidStatus, ConnectionClosed


@lru_cache(maxsize=1)
def datasets():
    return {mode: load_dataset(DATA_ROOT / filename) for mode, filename in DATASETS.items()}


class EngineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.datasets = datasets()

    def setUp(self):
        self.engine = Engine(self.datasets)

    def test_all_repository_rows_validate(self):
        self.assertEqual({k: len(v) for k, v in self.datasets.items()}, {'healthy': 12000, 'faults': 43950, 'scenarios': 22000})
        for rows in self.datasets.values():
            for row in rows:
                self.assertEqual(row['provenance'], 'SIMULATED')

    def test_invalid_commands_do_not_mutate_state(self):
        bad = [None, [], {}, {'type': 'no', 'value': 0}, {'type': 'set_mode', 'value': []},
               {'type': 'set_mode', 'value': '../secret'}]
        bad += [{'type': 'set_throttle', 'value': x} for x in [-1, 101, float('nan'), float('inf'), True, '50', None]]
        for command in bad:
            with self.subTest(command=command), self.assertRaises(ValueError):
                self.engine.command(command)
            self.assertEqual(self.engine.mode, 'physics')
            self.assertEqual(self.engine.throttle, 0)

    def test_model_is_deterministic_bounded_and_degrades_only_when_running(self):
        self.engine.step()
        self.assertEqual(self.engine.rul, 500)
        other = Engine(self.datasets)
        other.step()
        for engine in (self.engine, other):
            engine.command({'type': 'set_throttle', 'value': 100})
        for _ in range(100):
            a, b = self.engine.step(), other.step()
            self.assertEqual(a, b)
            self.assertTrue(0 <= a['rpm'] <= 5000)
            json.dumps(a, allow_nan=False)
        self.assertLess(a['rul_hours'], 500)
        self.engine.rul = 0.000001
        self.assertEqual(self.engine.step()['rul_hours'], 0)
        self.engine.command({'type': 'set_throttle', 'value': 0})
        for _ in range(200): self.engine.step()
        self.assertLess(self.engine.rpm, 0.1)

    def test_replay_preserves_fields_wraps_and_resets(self):
        for mode in DATASETS:
            self.engine.command({'type': 'set_mode', 'value': mode})
            result = self.engine.step()
            row = self.datasets[mode][0]
            for key in NUMERIC_FIELDS: self.assertEqual(result[key], row[key])
            self.assertEqual(result['phase'], row['phase'])
            self.assertEqual(result['source_time_s'], row['time_s'])
            with self.assertRaises(ValueError): self.engine.command({'type': 'set_throttle', 'value': 50})
            self.engine.index = len(self.datasets[mode]) - 1
            self.engine.step()
            self.assertEqual(self.engine.step()['source_time_s'], row['time_s'])
        self.engine.command({'type': 'set_mode', 'value': 'physics'})
        self.assertEqual(self.engine.rul, 500)
        self.assertEqual(self.engine.rpm, 0)

    def test_malformed_csv_is_rejected(self):
        row = dict(self.datasets['healthy'][0])
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'bad.csv'
            for value in ['NaN', '', 'not-a-number']:
                with path.open('w', newline='') as f:
                    writer = csv.DictWriter(f, fieldnames=row.keys()); writer.writeheader()
                    writer.writerow({**row, 'rpm': value})
                with self.assertRaises(ValueError): load_dataset(path)
            path.write_text('rpm\n1\n')
            with self.assertRaises(ValueError): load_dataset(path)


class WebSocketTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.app = TelemetryServer(Engine(datasets()))
        self.server = await serve(self.app.handler, '127.0.0.1', 0, origins=DEFAULT_ORIGINS,
                                  max_size=1024, close_timeout=0.1)
        self.url = f'ws://127.0.0.1:{self.server.sockets[0].getsockname()[1]}'
        self.producer = asyncio.create_task(self.app.engine_loop())

    async def asyncTearDown(self):
        self.producer.cancel()
        with contextlib.suppress(asyncio.CancelledError): await self.producer
        self.server.close(); await self.server.wait_closed()

    async def receive_type(self, ws, kind):
        async with asyncio.timeout(3):
            while True:
                data = json.loads(await ws.recv())
                if data['type'] == kind: return data

    async def test_commands_and_all_modes_over_real_socket(self):
        async with connect(self.url, origin=DEFAULT_ORIGINS[0], proxy=None) as ws:
            for mode in ('physics', *DATASETS):
                await ws.send(json.dumps({'type': 'set_mode', 'value': mode}))
                await self.receive_type(ws, 'ack')
                sample = await self.receive_type(ws, 'telemetry')
                self.assertEqual(sample['mode'], mode)
            await ws.send('{broken')
            await self.receive_type(ws, 'error')
            await ws.send('[]')
            await self.receive_type(ws, 'error')
            self.assertEqual((await self.receive_type(ws, 'telemetry'))['mode'], 'scenarios')

    async def test_untrusted_and_missing_origins_rejected(self):
        for origin in ('https://untrusted.example', None):
            with self.assertRaises(InvalidStatus):
                async with connect(self.url, origin=origin, proxy=None): pass

    async def test_oversized_message_closes_only_sender(self):
        async with connect(self.url, origin=DEFAULT_ORIGINS[0], proxy=None) as ws:
            await ws.send('x' * 2048)
            with self.assertRaises(ConnectionClosed):
                while True: await ws.recv()
        async with connect(self.url, origin=DEFAULT_ORIGINS[0], proxy=None) as ws:
            self.assertEqual((await self.receive_type(ws, 'telemetry'))['type'], 'telemetry')

    async def test_two_clients_share_controls(self):
        async with connect(self.url, origin=DEFAULT_ORIGINS[0], proxy=None) as first, connect(self.url, origin=DEFAULT_ORIGINS[0], proxy=None) as second:
            await first.send(json.dumps({'type': 'set_throttle', 'value': 50}))
            await self.receive_type(first, 'ack')
            sample = await self.receive_type(second, 'telemetry')
            self.assertEqual(sample['throttle_pct'], 50)


if __name__ == '__main__': unittest.main()
