import unittest
import requests
import base64
import sys
import os
import time
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import config
import websocketHandler

# Définir l'URL de base
BASE_URL = config.BASE_URL
ADMIN_NAME = config.ADMIN_NAME
ADMIN_PASSWORD = config.ADMIN_PASSWORD

class TestUserRoutes(unittest.TestCase):

    current_test_data = {
        'login': 'testuser',
        'firstName': 'Test',
        'lastName': 'User',
        'pole': 'Test Pole'
    }


    @classmethod
    def setUpClass(self):
        self.ws = websocketHandler.WebSocketClient(f"{BASE_URL.replace('http', 'ws')}/users")
        self.ws.start()
        print("Connecting to websocket [Users]")
        time.sleep(1)


    @classmethod
    def tearDownClass(self):
        # We close the websocket connection
        self.ws.close()
        print("Closing websocket [Users]")
        time.sleep(1)



    def test_01_unauthenticated_access_to_endpoints(self):
        # Liste des méthodes et des endpoints nécessitant une authentification
        methods_endpoints = {
            'POST': '/users',
            'PATCH': '/users/testuser',
            'DELETE': '/users/testuser'
        }
        
        for method, endpoint in methods_endpoints.items():
            # Envoyer la requête sans authentification
            res = requests.request(method, BASE_URL + endpoint)
            # Assurez-vous que le code de réponse est 401 Unauthorized
            self.assertEqual(res.status_code, 401)
            # Assurez-vous que le message d'erreur est correct
            self.assertEqual(res.json()['status'], 'error')
            self.assertEqual(res.json()['message'], 'Invalid token')

    def test_02_method_not_allowed_endpoint(self):
        method_not_allowed_endpoints = {
            'PUT': '/users'
        }
        for method, endpoint in method_not_allowed_endpoints.items():
            # Envoyer la requête sans authentification
            res = requests.request(method, BASE_URL + endpoint)
            # Assurez-vous que le code de réponse est 405 Method Not Allowed
            self.assertEqual(res.status_code, 405)
            # Assurez-vous que le message d'erreur est correct
            self.assertEqual(res.json()['status'], 'error')
            self.assertEqual(res.json()['message'], 'Method not allowed')

    def test_03_create_user_with_wrong_fields(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken

        # Données de test fournies
        
        current_keys = []
        i=0
        current_test_data = self.current_test_data.copy()
        missing_keys = list(current_test_data.keys())
        current_keys = []

        while missing_keys != []:
            res = requests.post(BASE_URL + '/users', headers={'Authorization': ADMIN_AUTH_HEADER}, json={key: current_test_data[key] for key in current_keys})
            self.assertEqual(res.status_code, 400)
            self.assertEqual(res.json()['status'], 'error')
            self.assertEqual(res.json()['message'], f"\"{missing_keys[0]}\" is required")
            current_keys.append(missing_keys[0])
            missing_keys.pop(0)



        # On test avec tous les champs et un de plus
        current_test_data['extra'] = 'extra'
        current_keys.append('extra')
        res = requests.post(BASE_URL + '/users', headers={'Authorization': ADMIN_AUTH_HEADER}, json={key: current_test_data[key] for key in current_keys})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], '\"extra\" is not allowed')

    def test_04_create_user(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison POST /users
        res = requests.post(BASE_URL + '/users', headers={'Authorization': ADMIN_AUTH_HEADER}, json=self.current_test_data)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['login'], 'testuser')
        time.sleep(0.2)
        self.assertEqual(self.ws.latest_message['reason'], 'created')
        self.assertEqual(self.ws.latest_message['data']['login'], 'testuser')
        self.assertEqual(self.ws.latest_message['data']['firstName'], 'Test')
        self.assertEqual(self.ws.latest_message['data']['lastName'], 'User')
        self.assertEqual(self.ws.latest_message['data']['pole'], 'Test Pole')

        self.ws.latest_message==None

    def test_05_create_user_with_existing_login(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison POST /users
        res = requests.post(BASE_URL + '/users', headers={'Authorization': ADMIN_AUTH_HEADER}, json=self.current_test_data)
        self.assertEqual(res.status_code, 409)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'User already exists')
    
    def test_06_get_specific_user(self):
        # Testez l'accès authentifié au point de terminaison GET /users/testuser
        res = requests.get(BASE_URL + '/users/testuser')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['login'], 'testuser')

    def test_07_get_specific_user_not_found(self):
        res = requests.get(BASE_URL + '/users/testusernotfound')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'User not found')

    def test_08_get_all_users(self):
        # Testez l'accès authentifié au point de terminaison GET /users
        res = requests.get(BASE_URL + '/users')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertTrue(type(res.json()['result']) == list)
        self.assertTrue(len(res.json()['result']) > 0)

    def test_09_authenticated_access_to_patch_endpoint_user_not_found(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison PATCH /users
        res = requests.patch(BASE_URL + '/users/testusernotfound', headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'firstName': 'TestUpdated'
        })
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'User not found')

    def test_10_authenticated_access_to_patch_endpoint(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison PATCH /users
        res = requests.patch(BASE_URL + '/users/testuser', headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'firstName': 'TestUpdated'
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['firstName'], 'TestUpdated')
        time.sleep(0.2)
        self.assertEqual(self.ws.latest_message['reason'], 'updated')
        self.assertEqual(self.ws.latest_message['data']['login'], 'testuser')
        self.assertEqual(self.ws.latest_message['data']['firstName'], 'TestUpdated')
        self.ws.latest_message==None

    def test_11_authenticated_access_to_patch_endpoint_with_extra_fields(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison PATCH /users
        res = requests.patch(BASE_URL + '/users/testuser', headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'extra': 'extra'
        })
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], '\"extra\" is not allowed')
    
    def test_12_authenticated_access_to_patch_endpoint_with_invalid_data(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison PATCH /users
        res = requests.patch(BASE_URL + '/users/testuser', headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'firstName': 123
        })
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], '\"firstName\" must be a string')

    def test_13_authenticated_access_to_delete_endpoint(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison DELETE /users
        res = requests.delete(BASE_URL + '/users/testuser', headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['login'], 'testuser')
        time.sleep(0.2)
        self.assertEqual(self.ws.latest_message['reason'], 'deleted')
        self.assertEqual(self.ws.latest_message['data']['login'], 'testuser')
        self.ws.latest_message==None

    def test_14_authenticated_access_to_delete_endpoint_user_not_found(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison DELETE /users
        res = requests.delete(BASE_URL + '/users/testuser', headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'User not found')
        


if __name__ == '__main__':
    unittest.main(verbosity=2)
