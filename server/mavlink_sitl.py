"""Compatibility entry point: JSON WebSocket simulator, not MAVLink."""
import asyncio
import json
import logging
import os
import time
from websockets.asyncio.server import serve
from websockets.exceptions import ConnectionClosed
try:
    from .engine import Engine
except ImportError:
    from engine import Engine

DEFAULT_ORIGINS = ('http://localhost:3000', 'http://127.0.0.1:3000')


class TelemetryServer:
    def __init__(self, engine=None):
        self.engine = engine if engine is not None else Engine()
        self.clients = set()

    async def handler(self, websocket):
        if len(self.clients) >= 16:
            await websocket.close(1013, 'Local demo client limit reached')
            return
        self.clients.add(websocket)
        window, commands = time.monotonic(), 0
        try:
            async for message in websocket:
                now = time.monotonic()
                if now - window >= 1:
                    window, commands = now, 0
                commands += 1
                if commands > 30:
                    await websocket.close(1008, 'Command rate exceeded')
                    break
                try:
                    if not isinstance(message, str):
                        raise ValueError('Text JSON commands required')
                    data = json.loads(message)
                    self.engine.command(data)
                    await websocket.send(json.dumps({'type': 'ack', 'command': data['type'], 'value': data['value']}))
                except (ValueError, TypeError):
                    await websocket.send(json.dumps({'type': 'error', 'message': 'Invalid command or unavailable control'}))
        except ConnectionClosed:
            pass
        finally:
            self.clients.discard(websocket)

    async def send(self, client, message):
        try:
            await asyncio.wait_for(client.send(message), timeout=0.05)
        except (TimeoutError, ConnectionClosed):
            await client.close(1013, 'Telemetry consumer too slow')

    async def engine_loop(self):
        while True:
            started = asyncio.get_running_loop().time()
            message = json.dumps(self.engine.step(), allow_nan=False)
            await asyncio.gather(*(self.send(client, message) for client in tuple(self.clients)))
            await asyncio.sleep(max(0, 0.1 - (asyncio.get_running_loop().time() - started)))


async def main():
    host = os.getenv('TELEMETRY_HOST', '127.0.0.1')
    if host not in ('127.0.0.1', 'localhost', '::1'):
        raise ValueError('This unauthenticated demo must bind to a loopback host')
    port = int(os.getenv('TELEMETRY_PORT', '3002'))
    origins = [x.strip() for x in os.getenv('TELEMETRY_ORIGINS', ','.join(DEFAULT_ORIGINS)).split(',') if x.strip()]
    server = TelemetryServer()
    async with serve(server.handler, host, port, origins=origins, max_size=1024,
                     max_queue=8, compression=None, ping_interval=10, ping_timeout=10, close_timeout=1):
        logging.info('Local simulated telemetry on ws://%s:%s', host, port)
        await server.engine_loop()


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
