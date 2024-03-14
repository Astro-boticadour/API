import asyncio
import websockets
import json

BASE_URL = 'ws://192.168.0.253:3000/users'

async def handle_message(message):
    # Fonction pour traiter les messages reçus
    parsed_message = json.loads(message)
    formatted_message = json.dumps(parsed_message, indent=4)
    print(f"Received message:\n{formatted_message}")

async def handle_error(error):
    # Fonction pour traiter les erreurs
    print(f"Error occurred: {error}")
    exit(1)

async def listen_websocket():
    async with websockets.connect(BASE_URL) as websocket:
        while True:
            try:
                message = await websocket.recv()
                await handle_message(message)
            except Exception as e:
                await handle_error(e)

asyncio.run(listen_websocket())