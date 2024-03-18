import unittest
import requests
import base64
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# Ajouter le chemin du répertoire parent au chemin de recherche des modules
import config

BASE_URL = config.BASE_URL



class TestGeneral(unittest.TestCase):
    
    def test_01_invalid_route_should_return_404(self):
        res = requests.post(BASE_URL + '/invalidroute')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Not found')
    
    def test_02_healthcheck(self):
        res = requests.get(BASE_URL + '/healthcheck')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result'], 'Service is healthy')
    
    def test_03_should_not_offer_coffee(self):
        res = requests.get(BASE_URL + '/coffee')
        self.assertEqual(res.status_code, 418)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], "no coffee available")

    def test_04_shutdown(self):
        res = requests.post(BASE_URL + '/shutdown')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result'], 'Service is shutting down')




if __name__ == '__main__':
    unittest.main(verbosity=2)
