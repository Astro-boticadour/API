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

    def test_00_delete_all_test_objects(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        users=["temp_user",config.userLogin]

        for user in users:
            res = requests.delete(BASE_URL + '/users/' + user, headers={'Authorization': ADMIN_AUTH_HEADER})
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json()['status'], 'success')
        
        #Delete the project
        res = requests.delete(BASE_URL + '/projects/' + str(config.project_id), headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 200)

        #Delete the first ressource
        res = requests.delete(BASE_URL + '/ressources/' + str(config.first_ressource_id), headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 200)

        #Delete the second ressource
        res = requests.delete(BASE_URL + '/ressources/' + str(config.second_ressource_id), headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 200)


    
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
