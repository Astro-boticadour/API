import unittest
import requests
import base64
import time
import datetime
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# Ajouter le chemin du répertoire parent au chemin de recherche des modules
import config

BASE_URL = config.BASE_URL
ADMIN_NAME = config.ADMIN_NAME
ADMIN_PASSWORD = config.ADMIN_PASSWORD
adminToken = config.adminToken



class testUtilisationsRoutes(unittest.TestCase):
    current_test_data = {
        "usageStartDate" : "2024-05-06 23:15:20",
        "sessionId" : 2,
        "ressourceId" : 22
    }
    

    def test_01_unauthenticated_access_to_endpoints(self):
        res = requests.delete(BASE_URL + '/utilisations')
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Invalid token')

    def test_02_method_not_allowed_for_put_endpoint(self):
        res = requests.put(BASE_URL + '/utilisations')
        self.assertEqual(res.status_code, 405)
        
    def test_03_create_utilisation_with_missing_fields(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken

        # Données de test fournies
        current_keys = []
        current_test_data = self.current_test_data.copy()
        missing_keys = list(current_test_data.keys())
        current_keys = []

        while missing_keys != []:
            res = requests.post(BASE_URL + '/utilisations', headers={'Authorization': ADMIN_AUTH_HEADER}, json={key: current_test_data[key] for key in current_keys})
            self.assertEqual(res.status_code, 400)
            self.assertEqual(res.json()['status'], 'error')
            self.assertEqual(res.json()['message'], f"\"{missing_keys[0]}\" is required")
            current_keys.append(missing_keys[0])
            missing_keys.pop(0)

    def test_04_create_utilisation_with_invalid_session_id(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        current_test_data = self.current_test_data.copy()
        current_test_data['sessionId'] = 0
        res = requests.post(BASE_URL + '/utilisations', headers={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.json()['message'], 'Session not found')
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 404)


    def test_05_create_utilisation_with_invalid_ressource_id(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        current_test_data = self.current_test_data.copy()
        current_test_data['sessionId'] = config.session_id
        current_test_data['ressourceId'] = 0
        res = requests.post(BASE_URL + '/utilisations', headers={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.json()['message'], 'Ressource not found')
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 404)

    def test_06_create_utilisation_with_too_early_date(self):
        #Create a new utilisation with first_ressource_id and session_id
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        current_test_data = {}
        # 20 minutes in thhe future
        current_test_data["usageStartDate"] = (datetime.datetime.strptime(time.strftime("%Y-%m-%d %H:%M:%S"), "%Y-%m-%d %H:%M:%S") + datetime.timedelta(minutes=21)).strftime("%Y-%m-%d %H:%M:%S")
        current_test_data['sessionId'] = config.session_id
        current_test_data['ressourceId'] = config.first_ressource_id
        res = requests.post(BASE_URL + '/utilisations', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.json()['message'], "usageStartDate can't be in the future")
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 400)


    def test_07_create_utilisation_with_date_before_session_start_date(self):
        current_test_data = {}
        # 20 minutes in thhe future
        current_test_data["usageStartDate"] = "2023-05-06 23:15:20"
        current_test_data['sessionId'] = config.session_id
        current_test_data['ressourceId'] = config.first_ressource_id
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.post(BASE_URL + '/utilisations', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.json()['message'], "usageStartDate must be after the session start")
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 400)

        
        

    def test_08_create_utilisation_with_valid_data(self):
        current_test_data = {}
        # 20 minutes in thhe future
        current_test_data["usageStartDate"] = (datetime.datetime.strptime(time.strftime("%Y-%m-%d %H:%M:%S"), "%Y-%m-%d %H:%M:%S") + datetime.timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S")
        current_test_data['sessionId'] = config.session_id
        current_test_data['ressourceId'] = config.first_ressource_id
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.post(BASE_URL + '/utilisations', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.status_code, 201)
        self.assertTrue('result' in res.json())
        self.assertTrue('id' in res.json()['result'])
        self.assertTrue('usageStartDate' in res.json()['result'])
        self.assertTrue('usageEndDate' in res.json()['result'])
        self.assertTrue('ressourceId' in res.json()['result'])
        self.assertTrue('sessionId' in res.json()['result'])

        config.utilisation_id = res.json()['result']['id']
        
    def test_09_check_OPTIONS(self):
        res = requests.options(BASE_URL + '/utilisations')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result'], ['GET', 'POST','PATCH','DELETE'])

    def test_10_get_all_utilisations(self):
        res = requests.get(BASE_URL + '/utilisations')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertTrue('result' in res.json())
        self.assertTrue(isinstance(res.json()['result'], list))
        self.assertTrue('id' in res.json()['result'][0])
        self.assertTrue('usageStartDate' in res.json()['result'][0])
        self.assertTrue('usageEndDate' in res.json()['result'][0])
        self.assertTrue('ressourceId' in res.json()['result'][0])
    
    def test_11_get_utilisation_by_id(self):
        res = requests.get(BASE_URL + '/utilisations/1')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertTrue('result' in res.json())
        self.assertTrue('id' in res.json()['result'])
        self.assertTrue('usageStartDate' in res.json()['result'])
        self.assertTrue('usageEndDate' in res.json()['result'])
        self.assertTrue('ressourceId' in res.json()['result'])
        self.assertTrue('sessionId' in res.json()['result'])
        self.assertEqual(res.json()['result']['id'], 1)
    
    def test_12_get_utilisation_by_invalid_id(self):
        res = requests.get(BASE_URL + '/utilisations/0')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Utilisation not found')

    def test_13_update_utilisation_with_invalid_id(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.patch(BASE_URL + '/utilisations/999', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'usageEndDate': '2024-05-06 23:15:20'})
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Utilisation not found')

    

    def test_14_get_usage_from_session(self):
        res = requests.get(BASE_URL + '/utilisations/usage/'+str(config.session_id))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertTrue('result' in res.json())
    
    def test_15_get_usage_from_invalid_session(self):
        res = requests.get(BASE_URL + '/utilisations/usage/999')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Session not found')
    
    def test_16_use_ressource_already_used(self):
        current_test_data = {
            'sessionId': config.session_id,
            'ressourceId': config.first_ressource_id,
            'usageStartDate': '2024-05-06 23:15:20',
        }
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.post(BASE_URL + '/utilisations', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 409)
        self.assertEqual(res.json()['message'], 'Ressource is already used')
    
    def test_17_create_utilisation_with_session_already_closed(self):
        # create a user
        # create a session
        # close the session
        # create a utilisation

        # create a user
        res = requests.post(BASE_URL + '/users', headers
        ={'Authorization': 'Bearer ' + config.adminToken}, json={'login': 'temp_user', 'firstName': 'temp', 'lastName': 'user', 'pole': 'temp'})
        self.assertEqual(res.status_code, 201)

        # create a session
        res = requests.post(BASE_URL + '/sessions', headers
        ={'Authorization': 'Bearer ' + config.adminToken}, json={'loginUser': 'temp_user','idProject' : config.project_id, 'startTime': '2024-05-06 23:15:15', 'endTime': '2024-05-06 23:15:20'})
        self.assertEqual(res.status_code, 201)
        tmpid=res.json()['result']['id']    

        # create a utilisation
        res = requests.post(BASE_URL + '/utilisations', headers
        ={'Authorization': 'Bearer ' + config.adminToken}, json={'usageStartDate': '2024-05-06 23:15:25', 'sessionId':tmpid, 'ressourceId': config.second_ressource_id})
        self.assertEqual(res.status_code, 409)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Session is closed')


    def test_18_create_utilisation_with_end_date_before_start_date(self):
        current_test_data = {
            'sessionId': config.session_id,
            'ressourceId': config.second_ressource_id,
            'usageStartDate': (datetime.datetime.strptime(time.strftime("%Y-%m-%d %H:%M:%S"), "%Y-%m-%d %H:%M:%S") + datetime.timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S"),
            'usageEndDate':  (datetime.datetime.strptime(time.strftime("%Y-%m-%d %H:%M:%S"), "%Y-%m-%d %H:%M:%S") + datetime.timedelta(minutes=1)).strftime("%Y-%m-%d %H:%M:%S")
        }
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.post(BASE_URL + '/utilisations', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.json()['message'], 'usageEndDate must be greater than usageStartDate')
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 400)

    def test_19_utilisation_start_date_cannot_be_in_the_future(self):
        current_test_data = {
            'sessionId': config.session_id,
            'ressourceId': config.second_ressource_id,
            'usageStartDate': '2054-05-06 23:15:25',
        }
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.post(BASE_URL + '/utilisations', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['message'], "usageStartDate can't be in the future")
                             

    def test_20_update_utilisation_that_does_not_exist(self):
        current_test_data = {
            'usageEndDate': '2024-05-06 23:15:20'
        }
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.patch(BASE_URL + '/utilisations/999', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['message'], 'Utilisation not found')

    def test_21_update_utilisation_with_invalid_end_date(self):
        current_test_data = {
            'usageEndDate': '2023-05-06 23:15:20'
        }
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.patch(BASE_URL + '/utilisations/1', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['message'], 'usageEndDate must be greater than usageStartDate')

    def test_22_update_utilisation_with_end_date_in_the_future(self):
        current_test_data = {
            'usageEndDate': (datetime.datetime.strptime(time.strftime("%Y-%m-%d %H:%M:%S"), "%Y-%m-%d %H:%M:%S") + datetime.timedelta(minutes=59)).strftime("%Y-%m-%d %H:%M:%S"),
        }
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.patch(BASE_URL + '/utilisations/1', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json=current_test_data)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['message'], 'usageEndDate can\'t be in the future')

    
    
    def test_23_update_utilisation_with_valid_data(self):
        current_test_data = {
            'usageEndDate': (datetime.datetime.strptime(time.strftime("%Y-%m-%d %H:%M:%S"), "%Y-%m-%d %H:%M:%S") + datetime.timedelta(minutes=19)).strftime("%Y-%m-%d %H:%M:%S")
        }
        res = requests.patch(BASE_URL + '/utilisations/'+str(config.utilisation_id),json=current_test_data)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.status_code, 200)
        self.assertTrue('result' in res.json())
        self.assertTrue('id' in res.json()['result'])


    def test_24_finish_utilisation_already_finished(self):
        current_test_data = {
            'usageEndDate': (datetime.datetime.strptime(time.strftime("%Y-%m-%d %H:%M:%S"), "%Y-%m-%d %H:%M:%S") + datetime.timedelta(minutes=19)).strftime("%Y-%m-%d %H:%M:%S")
        }
        res = requests.patch(BASE_URL + '/utilisations/'+str(config.utilisation_id),json=current_test_data)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 409)
        self.assertEqual(res.json()['message'], 'Utilisation is already finished')

    def test_25_delete_utilisation_that_does_not_exist(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.delete(BASE_URL + '/utilisations/999', headers
        ={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['message'], 'Utilisation not found')
    


    def test_26_delete_utilisation(self):
        res = requests.delete(BASE_URL + '/utilisations/'+str(config.utilisation_id), headers={'Authorization': 'Bearer ' + config.adminToken})
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.status_code, 200)
        self.assertTrue('result' in res.json())
        self.assertTrue('id' in res.json()['result'])
        self.assertEqual(res.json()['result']['id'], config.utilisation_id)

    def test_27_close_session_should_free_ressources_and_utilisations(self):
        res = requests.patch(BASE_URL + '/sessions/'+str(config.session_id), headers
        ={'Authorization': 'Bearer ' + config.adminToken}, json={'endTime': (datetime.datetime.strptime(time.strftime("%Y-%m-%d %H:%M:%S"), "%Y-%m-%d %H:%M:%S") + datetime.timedelta(minutes=11)).strftime("%Y-%m-%d %H:%M:%S")})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertTrue('result' in res.json())
        self.assertTrue('id' in res.json()['result'])
        self.assertTrue('startTime' in res.json()['result'])
        self.assertTrue('endTime' in res.json()['result'])
        self.assertTrue('userLogin' in res.json()['result'])






    




if __name__ == '__main__':
    unittest.main(verbosity=2)
