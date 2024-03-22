import unittest
import requests
import sys
import os
import time
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import config
import websocketHandler

# Définir l'URL de base
BASE_URL = config.BASE_URL
global test_id


class TestRessourcesRoutes(unittest.TestCase):
    current_test_data = {
        'name': 'Test Ressource',
        'model': 'Test Model',
        'type': 'Test Type',
    }

    @classmethod
    def setUpClass(cls):
        # on connecte le websocket
        cls.ws = websocketHandler.WebSocketClient(f"{BASE_URL.replace('http', 'ws')}/ressources")
        cls.ws.start()
        print("Connecting to websocket [Ressources]")
        time.sleep(1)

    @classmethod
    def tearDownClass(cls):
        # on ferme le websocket
        cls.ws.close()
        print("Closing websocket [Ressources]")
        time.sleep(1)

    def test_01_unauthenticated_access_to_endpoints(self):
        # Liste des méthodes et des endpoints nécessitant une authentification
        methods_endpoints = {
            'POST': '/ressources',
            'PATCH': '/ressources/testid',
            'DELETE': '/ressources/testid'
        }
        
        for method, endpoint in methods_endpoints.items():
            # Envoyer la requête sans authentification
            res = requests.request(method, BASE_URL + endpoint)
            # Assurez-vous que le code de réponse est 401 Unauthorized
            self.assertEqual(res.status_code, 401)
            # Assurez-vous que le message d'erreur est correct
            self.assertEqual(res.json()['status'], 'error')
            self.assertEqual(res.json()['message'], 'Invalid token')

    def test_02_method_not_allowed_for_put_endpoint(self):
        # Testez la méthode non autorisée pour le point de terminaison PUT /ressources
        res = requests.put(BASE_URL + '/ressources')
        self.assertEqual(res.status_code, 405)

    def test_03_create_ressource_with_missing_fields(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken

        # Données de test fournies
        current_keys = []
        current_test_data = self.current_test_data.copy()
        missing_keys = list(current_test_data.keys())
        current_keys = []

        while missing_keys != []:
            res = requests.post(BASE_URL + '/ressources', headers={'Authorization': ADMIN_AUTH_HEADER}, json={key: current_test_data[key] for key in current_keys})
            self.assertEqual(res.status_code, 400)
            self.assertEqual(res.json()['status'], 'error')
            self.assertEqual(res.json()['message'], f"\"{missing_keys[0]}\" is required")
            current_keys.append(missing_keys[0])
            missing_keys.pop(0)

    def test_04_create_ressource(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison POST /ressources
        res = requests.post(BASE_URL + '/ressources', headers={'Authorization': ADMIN_AUTH_HEADER}, json=self.current_test_data)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['name'], 'Test Ressource')
        self.assertEqual(res.json()['result']['model'], 'Test Model')
        self.assertEqual(res.json()['result']['type'], 'Test Type')
        self.assertEqual(res.json()['result']['isUsed'], False)
        time.sleep(0.2)
        self.assertEqual(self.ws.latest_message['reason'], 'created')
        self.assertEqual(self.ws.latest_message['data']['name'], 'Test Ressource')
        self.assertEqual(self.ws.latest_message['data']['model'], 'Test Model')
        self.assertEqual(self.ws.latest_message['data']['type'], 'Test Type')
        self.assertEqual(self.ws.latest_message['data']['isUsed'], False)
        global test_id
        test_id = res.json()['result']['id']
        self.ws.latest_message = None

    def test_05_get_all_ressources(self):
        res = requests.get(BASE_URL + '/ressources')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(type(res.json()['result']), list)
        self.assertGreater(len(res.json()['result']), 0)
        
    def test_06_get_specific_ressource(self):
        # Testez l'accès authentifié au point de terminaison GET /ressources/testid
        res = requests.get(BASE_URL + '/ressources/testid')
        self.assertEqual(res.status_code, 404)  # Ressource not found, expected 404 status code

        res = requests.get(BASE_URL + f'/ressources/{test_id}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['name'], 'Test Ressource')
        self.assertEqual(res.json()['result']['model'], 'Test Model')
        self.assertEqual(res.json()['result']['type'], 'Test Type')
        self.assertEqual(res.json()['result']['isUsed'], False)

    def test_07_get_specific_ressource_not_found(self):
        # Testez l'accès authentifié au point de terminaison GET /ressources/testid
        res = requests.get(BASE_URL + '/ressources/testid')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Ressource not found')

    def test_08_authenticated_access_to_patch_endpoint_not_found(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison PATCH /ressources
        res = requests.patch(BASE_URL + '/ressources/testid', headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'name': 'Updated Test Ressource'
        })
        self.assertEqual(res.status_code, 404)  # Ressource not found, expected 404 status code

    def test_09_authenticated_access_to_patch_endpoint(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.patch(BASE_URL + f'/ressources/{test_id}', headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'name': 'Updated Test Ressource'
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['name'], 'Updated Test Ressource')
        self.assertEqual(res.json()['result']['model'], 'Test Model')
        self.assertEqual(res.json()['result']['type'], 'Test Type')
        self.assertEqual(res.json()['result']['isUsed'], False)
        time.sleep(0.2)
        self.assertEqual(self.ws.latest_message['reason'], 'updated')
        self.assertEqual(self.ws.latest_message['data']['name'], 'Updated Test Ressource')
        self.assertEqual(self.ws.latest_message['data']['model'], 'Test Model')
        self.assertEqual(self.ws.latest_message['data']['type'], 'Test Type')
        self.assertEqual(self.ws.latest_message['data']['isUsed'], False)
        self.ws.latest_message = None
    
    def test_10_authenticated_access_to_patch_endpoint_with_invalid_data(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison PATCH /ressources
        res = requests.patch(BASE_URL + f'/ressources/{test_id}', headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'name': 1
        })
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], '"name" must be a string')

    def test_11_authenticated_access_to_delete_endpoint(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison DELETE /ressources
        res = requests.delete(BASE_URL + '/ressources/testid', headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 404)  # Ressource not found, expected 404 status code

        res = requests.delete(BASE_URL + f'/ressources/{test_id}', headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['id'], test_id)
        time.sleep(0.2)
        self.assertEqual(self.ws.latest_message['reason'], 'deleted')
        self.assertEqual(self.ws.latest_message['data']['id'], test_id)
        self.ws.latest_message = None

    def test_13_create_ressources_for_later_tests(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        first_ressource = {
            'name': 'First Ressource',
            'model': 'First Model',
            'type': 'First Type',
        }
        res = requests.post(BASE_URL + '/ressources', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=first_ressource)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['name'], 'First Ressource')
        self.assertEqual(res.json()['result']['model'], 'First Model')
        self.assertEqual(res.json()['result']['type'], 'First Type')
        self.assertEqual(res.json()['result']['isUsed'], False)
        config.first_ressource_id = res.json()['result']['id']

        second_ressource = {
            'name': 'Second Ressource',
            'model': 'Second Model',
            'type': 'Second Type',
        }
        res = requests.post(BASE_URL + '/ressources', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=second_ressource)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['name'], 'Second Ressource')
        self.assertEqual(res.json()['result']['model'], 'Second Model')
        self.assertEqual(res.json()['result']['type'], 'Second Type')
        self.assertEqual(res.json()['result']['isUsed'], False)
        config.second_ressource_id = res.json()['result']['id']

    def test_14_check_OPTIONS(self):
        res = requests.options(BASE_URL + '/ressources')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result'], ['GET', 'POST','PATCH','DELETE'])



if __name__ == '__main__':
    unittest.main(verbosity=2)
