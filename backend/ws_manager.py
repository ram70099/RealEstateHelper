from fastapi import WebSocket
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        # Use lock to prevent concurrency issues
        async def _remove():
            async with self.lock:
                self.active_connections.remove(websocket)
        asyncio.create_task(_remove())

    async def broadcast(self, message: dict):
        async with self.lock:
            for connection in self.active_connections:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass  # Ignore failed sends

manager = ConnectionManager()
