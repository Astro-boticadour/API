import asyncio
import websockets

BASE_URL = 'ws://localhost:3000'  # URL de base du serveur WebSocket

async def listen_websocket(endpoint):
    print(f'Listening on endpoint: {endpoint}')
    async with websockets.connect(f'{BASE_URL}/{endpoint}') as websocket:
        while True:
            message = await websocket.recv()
            print(f"Received message from {endpoint}: {message}")

async def main():
    endpoints = ['users', 'projects', 'ressources',"sessions"]  # Liste des endpoints à écouter

    # Créer une tâche asynchrone pour chaque endpoint
    tasks = [asyncio.create_task(listen_websocket(endpoint)) for endpoint in endpoints]

    # Attendre que toutes les tâches soient terminées
    await asyncio.gather(*tasks)

asyncio.run(main())