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


class TestDataRoutes(unittest.TestCase):

        
    def test_01_check_data_with_unkown_firstObjectType_should_return_400(self):
        res = requests.get(BASE_URL + '/data?firstObjectType=unkown')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], '\"firstObjectType\" must be one of [user, ressource, project]')
    
    def test_02_check_data_with_unkown_secondaryObjectType_should_return_400(self):
        res = requests.get(BASE_URL + '/data?firstObjectType=user&secondaryObjectType=unkown&firstFieldId=1')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], '"secondaryObjectType" must be one of [user, ressource, project]')
    
    def test_03_valid_data_should_return_200_and_list(self):
        res = requests.get(BASE_URL + '/data?firstObjectType=user&secondaryObjectType=user&firstFieldId=1&month=1&year=2024')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertIsInstance(res.json()['result'], list)
        
    def test_04_not_allowed_method_for_post(self):
        not_allowed_methods = ['POST','PUT', 'PATCH', 'DELETE']
        for method in not_allowed_methods:
            res = requests.request(method, BASE_URL + '/data')
            self.assertEqual(res.status_code, 405)
            self.assertEqual(res.json()['status'], 'error')
            self.assertEqual(res.json()['message'], 'Method not allowed')
        


if __name__ == '__main__':
    unittest.main(verbosity=2)
