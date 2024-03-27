import asyncio
import websockets
import threading
import json
class WebSocketClient:
    def __init__(self, url):
        self.url = url
        self.websocket = None
        self.latest_message = None
        self.thread = None
        self.RUNNING = False

    async def handle_message(self, message):
        # Fonction pour traiter les messages reçus
        parsed_message = json.loads(message)
        self.latest_message = parsed_message

    async def listen_websocket(self):
        async with websockets.connect(self.url) as websocket:
            self.websocket = websocket
            while self.RUNNING:
                while self.RUNNING:
                    try:
                        message = await asyncio.wait_for(websocket.recv(), timeout=0.01)
                        await self.handle_message(message)
                    except asyncio.TimeoutError:
                        pass
                    except Exception as e:
                        pass
                await websocket.close()

    def start(self):
        self.RUNNING = True
        self.thread = threading.Thread(target=self.start_websocket)
        self.thread.start()

    def start_websocket(self):
        asyncio.run(self.listen_websocket())

    def close(self):
        self.RUNNING = False
        if self.thread:
            self.thread.join()
        

