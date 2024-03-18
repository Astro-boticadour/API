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


class TestProjectRoutes(unittest.TestCase):
    current_test_data = {
        'name': 'Test Project',
        'dateDebut': '2024-03-17',
        'dateFin': '2024-03-24',
        'isClosed': False,
        'description': 'Test Description'
    }

    @classmethod
    def setUpClass(self):
        # on connecte le websocket
        self.ws = websocketHandler.WebSocketClient(f"{BASE_URL.replace('http', 'ws')}/projects")
        self.ws.start()
        print("Connecting to websocket [Projects]")
        time.sleep(1)


    @classmethod
    def tearDownClass(self):
        # on ferme le websocket
        self.ws.close()
        print("Closing websocket [Projects]")
        time.sleep(1)

    def test_01_unauthenticated_access_to_endpoints(self):
        # Liste des méthodes et des endpoints nécessitant une authentification
        methods_endpoints = {
            'POST': '/projects',
            'PATCH': '/projects/testid',
            'DELETE': '/projects/testid'
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
        # Testez la méthode non autorisée pour le point de terminaison PUT /projects
        res = requests.put(BASE_URL + '/projects')
        self.assertEqual(res.status_code, 405)

    def test_03_create_project_with_missing_fields(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken

        # Données de test fournies
        current_keys = []
        current_test_data = self.current_test_data.copy()
        # On enleve le champs description et isClosed vu qu'ils sont optionnels
        current_test_data.pop('description')
        current_test_data.pop('isClosed')
        missing_keys = list(current_test_data.keys())
        current_keys = []

        while missing_keys != []:
            res = requests.post(BASE_URL + '/projects', headers={'Authorization': ADMIN_AUTH_HEADER}, json={key: current_test_data[key] for key in current_keys})
            self.assertEqual(res.status_code, 400)
            self.assertEqual(res.json()['status'], 'error')
            self.assertEqual(res.json()['message'], f"\"{missing_keys[0]}\" is required")
            current_keys.append(missing_keys[0])
            missing_keys.pop(0)
        
    def test_04_create_project_with_extra_fields_should_not_work(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        current_test_data = self.current_test_data.copy()
        current_test_data['extra'] = 'extra'
        res = requests.post(BASE_URL + '/projects', headers={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], '\"extra\" is not allowed')

    def test_05_create_project_with_invalid_date(self):
        # On tests le cas ou DateDebut < DateFin
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        current_test_data = self.current_test_data.copy()
        current_test_data['dateDebut'] = '2024-03-24'
        current_test_data['dateFin'] = '2024-03-17'
        res = requests.post(BASE_URL + '/projects', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'dateFin must be after dateDebut')




    def test_06_create_project(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison POST /projects
        res = requests.post(BASE_URL + '/projects', headers={'Authorization': ADMIN_AUTH_HEADER}, json=self.current_test_data)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['name'], 'Test Project')
        global test_id
        test_id = str(res.json()['result']['id'])

    
    def test_07_get_all_projects(self):
        # Testez l'accès authentifié au point de terminaison GET /projects
        res = requests.get(BASE_URL + '/projects')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(type(res.json()['result']), list)
        self.assertTrue(len(res.json()['result']) > 0)



    def test_08_get_specific_project(self):
        # Testez l'accès authentifié au point de terminaison GET /projects/testid
        global test_id

        res = requests.get(BASE_URL + '/projects/'+test_id)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['name'], 'Test Project')
        self.assertEqual(res.json()['result']['id'], int(test_id))

    def test_09_get_specific_project_not_found(self):
        # Testez l'accès authentifié au point de terminaison GET /projects/testid
        res = requests.get(BASE_URL + '/projects/testid')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Project not found')


    def test_10_authenticated_access_to_patch_endpoint(self):
        global test_id
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison PATCH /projects
        res = requests.patch(BASE_URL + '/projects/'+test_id, headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'name': 'Updated Test Project'
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['name'], 'Updated Test Project')
        self.assertEqual(res.json()['result']['id'], int(test_id))

    def test_11_authenticated_access_to_patch_endpoint_not_found(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison PATCH /projects
        res = requests.patch(BASE_URL + '/projects/testid', headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'name': 'Updated Test Project'
        })
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Project not found')
    
    def test_12_authenticated_access_to_patch_endpoint_with_invalid_date(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison PATCH /projects
        res = requests.patch(BASE_URL + '/projects/'+test_id, headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'dateDebut': '2024-03-24',
            'dateFin': '2024-03-17'
        })
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'dateFin must be after dateDebut')


    def test_13_authenticated_access_to_delete_endpoint(self):
        global test_id
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison DELETE /projects
        res = requests.delete(BASE_URL + '/projects/'+test_id, headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['id'], int(test_id))

    def test_14_authenticated_access_to_delete_endpoint_not_found(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison DELETE /projects
        res = requests.delete(BASE_URL + '/projects/testid', headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Project not found')
    


if __name__ == '__main__':
    unittest.main(verbosity=2)
