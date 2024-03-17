import unittest
import requests
import base64
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# Ajouter le chemin du répertoire parent au chemin de recherche des modules
import config

BASE_URL = config.BASE_URL
ADMIN_NAME = config.ADMIN_NAME
ADMIN_PASSWORD = config.ADMIN_PASSWORD
adminToken = config.adminToken



class TestAdminRoutes(unittest.TestCase):

    def test_01_must_authenticate_with_basic_or_bearer(self):
        res = requests.post(BASE_URL + '/login')
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Must authenticate with Basic or Bearer')

    def test_02_methods_not_allowed(self):
        methods = ['get', 'patch', 'put', 'delete']
        for method in methods:
            res = requests.request(method.upper(), BASE_URL + '/login')
            self.assertEqual(res.status_code, 405)
            self.assertEqual(res.json()['status'], 'error')
            self.assertEqual(res.json()['message'], 'Method not allowed')

    def test_03_invalid_credentials(self):
        auth_header = 'Basic ' + base64.b64encode('admin:wrongpassword'.encode()).decode()
        res = requests.post(BASE_URL + '/login', headers={'Authorization': auth_header})
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Invalid credentials')

    def test_04_valid_credentials(self):
        auth_header = 'Basic ' + base64.b64encode((ADMIN_NAME + ':' + ADMIN_PASSWORD).encode()).decode()
        res = requests.post(BASE_URL + '/login', headers={'Authorization': auth_header})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertTrue('token' in res.json()['result'])
        config.adminToken = res.json()['result']['token']

if __name__ == '__main__':
    unittest.main(verbosity=2)
