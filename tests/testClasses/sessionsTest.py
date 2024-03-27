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

class TestSessionRoutes(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # on connecte le websocket
        cls.ws = websocketHandler.WebSocketClient(f"{BASE_URL.replace('http', 'ws')}/sessions")
        cls.ws.start()
        print("Connecting to websocket [Sessions]")
        time.sleep(1)

    @classmethod
    def tearDownClass(cls):
        # on ferme le websocket
        cls.ws.close()
        print("Closing websocket [Sessions]")
        time.sleep(1)

    def test_01_unauthenticated_access_to_delete_endpoint(self):
        res = requests.delete(BASE_URL + '/sessions')
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Invalid token')
        
    def test_02_method_not_allowed_for_put_endpoint(self):
        # Testez la méthode non autorisée pour le point de terminaison PUT /sessions
        res = requests.put(BASE_URL + '/sessions')
        self.assertEqual(res.status_code, 405)

    def test_03_create_session_with_missing_field_startTime_should_not_work(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        
        res = requests.post(BASE_URL + '/sessions', headers={'Authorization': ADMIN_AUTH_HEADER}, json={})
        self.assertEqual(res.json()['message'], '"startTime" is required')

    def test_04_create_session_with_invalid_startTime_format_should_not_work(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # date must be in the format "startTime" must be in [YYYY-MM-DD HH:mm:ss] format
        res = requests.post(BASE_URL + '/sessions', headers={'Authorization': ADMIN_AUTH_HEADER}, json={'startTime': '2021-12-12'})
        self.assertEqual(res.json()['message'], '"startTime" must be in [YYYY-MM-DD HH:mm:ss] format')
    
    def test_05_create_session_with_missing_field_idProject_should_not_work(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # "idProject" is required
        res = requests.post(BASE_URL + '/sessions', headers={'Authorization': ADMIN_AUTH_HEADER}, json={'startTime': '2021-12-12 12:12:12'})
        self.assertEqual(res.json()['message'], '"idProject" is required')
    
    def test_06_create_session_with_missing_field_loginUser_should_not_be_possible(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # "loginUser" is required
        res = requests.post(BASE_URL + '/sessions', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'startTime': '2021-12-12 12:12:12', 'idProject': 1})
        self.assertEqual(res.json()['message'], '"loginUser" is required')

    def test_07_create_session_with_invalid_idProject_should_not_work(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # There is project with id 404
        res = requests.post(BASE_URL + '/sessions', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'startTime': '2021-12-12 12:12:12', 'idProject': 404, 'loginUser': 'admin'})
        self.assertEqual(res.json()['message'], 'Project not found')

    def test_08_create_session_with_invalid_loginUser_should_not_work(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        project_id = config.project_id
        userLogin = config.userLogin
        # create a project to test the next test
        res = requests.post(BASE_URL + '/projects', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'name': 'TestProject', 'startDate': '2021-12-12', 'endDate': '2021-12-12'})
        self.assertEqual(res.status_code, 201)
        project_id = res.json()['result']['id']
        userLogin = config.userLogin
        config.project_id = project_id

        # There is no user with login "404"
        res = requests.post(BASE_URL + '/sessions', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'startTime': '2021-12-12 12:12:12', 'idProject': project_id, 'loginUser': '404'})
        self.assertEqual(res.json()['message'], 'User not found')

        # create a user to test the next test
        res = requests.post(BASE_URL + '/users', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'login': userLogin, 'firstName': 'user1', 'lastName': 'user1', 'pole': 'pole1'})
        self.assertIn(res.status_code, [201, 409])
    
    def test_09_create_session_with_invalid_endTime_should_not_work(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        project_id = config.project_id
        userLogin = config.userLogin

        # "endTime" must be in [YYYY-MM-DD HH:mm:ss] format
        res = requests.post(BASE_URL + '/sessions', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'startTime': '2021-12-12 12:12:12', 'idProject': project_id, 'loginUser': userLogin, 'endTime': '2021-12-12'})
        self.assertEqual(res.json()['message'], '"endTime" must be in [YYYY-MM-DD HH:mm:ss] format')

    def test_10_create_session_with_endTime_greater_than_startTime_should_not_work(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        project_id = config.project_id
        userLogin = config.userLogin
        # "endTime" must be greater than "startTime"
        res = requests.post(BASE_URL + '/sessions', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'startTime': '2021-12-12 12:12:12', 'idProject': project_id, 'loginUser': userLogin, 'endTime': '2021-12-12 12:12:11'})
        self.assertEqual(res.json()['message'], 'endTime must be greater than startTime')

    def test_11_create_session(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.post(BASE_URL + '/sessions', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'startTime': '2021-12-12 12:12:12', 'idProject': config.project_id, 'loginUser': config.userLogin})

        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['projectId'], config.project_id)
        self.assertEqual(res.json()['result']['userLogin'], config.userLogin)

        config.session_id = res.json()['result']['id']
        # We check if the websocket has received the message
        time.sleep(0.2)
        self.assertEqual(self.ws.latest_message['reason'], 'created')
        self.assertEqual(self.ws.latest_message['data']['projectId'], config.project_id)
        self.assertEqual(self.ws.latest_message['data']['userLogin'], config.userLogin)
        self.assertEqual(self.ws.latest_message['data']['id'], config.session_id)
        self.ws.latest_message = None

    def test_12_get_active_session_from_existing_user_with_session(self):
        res = requests.get(BASE_URL + '/sessions/activeSession/' + config.userLogin)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['userLogin'], config.userLogin)
        self.assertEqual(res.json()['result']['projectId'], config.project_id)
        self.assertEqual(res.json()['result']['id'], config.session_id)

    def test_13_create_session_for_user_with_existing_session_should_not_work(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken

        # Doing it again should return 409
        res = requests.post(BASE_URL + '/sessions', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'startTime': '2021-12-12 12:12:12', 'idProject': config.project_id, 'loginUser': config.userLogin})
        self.assertEqual(res.status_code, 409)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'User already has a session')
        time.sleep(0.2)
        self.assertIsNone(self.ws.latest_message)

    def test_14_get_sessions(self):
        # Testez l'accès authentifié au point de terminaison GET /sessions
        res = requests.get(BASE_URL + '/sessions')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(type(res.json()['result']), list)

    def test_15_get_specific_session(self):
        # Testez l'accès authentifié au point de terminaison GET /sessions/testid
        res = requests.get(BASE_URL + '/sessions/' + str(config.session_id))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['projectId'], config.project_id)
        self.assertEqual(res.json()['result']['userLogin'], config.userLogin)

    def test_16_get_specific_session_not_existing(self):
        res = requests.get(BASE_URL + '/sessions/404')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Session not found')
    
    def test_17_updating_else_than_endTime_is_not_allowed(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # startTime n'est pas autorisé à être modifié
        res = requests.patch(BASE_URL + '/sessions/' + str(config.session_id), headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'startTime': '2021-12-12 12:12:13'
        })
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], '"startTime" is not allowed')
    
    def test_18_updating_with_invalid_endTime_format_should_not_work(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken

        # endTime doit être en format [YYYY-MM-DD HH:mm:ss]
        res = requests.patch(BASE_URL + '/sessions/' + str(config.session_id), headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'endTime': '2021-12-12'
        })
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], '"endTime" must be in [YYYY-MM-DD HH:mm:ss] format')

    def test_19_updating_with_endTime_less_than_startTime_should_not_work(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken


        # endTime doit être supérieur à startTime
        res = requests.patch(BASE_URL + '/sessions/' + str(config.session_id), headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'endTime': '2020-12-12 12:12:11'
        })
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'endTime must be greater than startTime')

    def test_20_updating_a_session_that_does_not_exist(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.patch(BASE_URL + '/sessions/404', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'endTime': '2021-12-12 12:12:13'})
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Session not found')
        
    def test_21_updating_session(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # On ferme la session
        res = requests.patch(BASE_URL + '/sessions/' + str(config.session_id), headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'endTime': '2021-12-12 15:12:13'
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['projectId'], config.project_id)
        self.assertEqual(res.json()['result']['userLogin'], config.userLogin)
        self.assertEqual(res.json()['result']['endTime'], '2021-12-12T15:12:13.000Z')

        # On vérifie que le websocket a bien reçu le message
        time.sleep(0.2)
        self.assertEqual(self.ws.latest_message['reason'], 'updated')
        self.assertEqual(self.ws.latest_message['data']['projectId'], config.project_id)
        self.assertEqual(self.ws.latest_message['data']['userLogin'], config.userLogin)
        self.assertEqual(self.ws.latest_message['data']['endTime'], '2021-12-12T15:12:13.000Z')
        self.ws.latest_message = None

    def test_22_updating_closed_session_should_not_be_possible(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # On ne peut pas modifier une session fermée
        res = requests.patch(BASE_URL + '/sessions/' + str(config.session_id), headers={'Authorization': ADMIN_AUTH_HEADER}, json={
            'endTime': '2021-12-12 15:12:13'
        })
        self.assertEqual(res.status_code, 409)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Session is already closed')

    def test_23_authenticated_access_to_delete_endpoint_with_invalid_sessionid(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison DELETE /sessions
        res = requests.delete(BASE_URL + '/sessions/404', headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Session not found')

    def test_24_authenticated_access_to_delete_endpoint(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        # Testez l'accès authentifié au point de terminaison DELETE /sessions
        res = requests.delete(BASE_URL + '/sessions/testid', headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Session not found')
        
        res = requests.delete(BASE_URL + '/sessions/' + str(config.session_id), headers={'Authorization': ADMIN_AUTH_HEADER})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['id'], config.session_id)
        time.sleep(0.2)
        self.assertEqual(self.ws.latest_message['reason'], 'deleted')
        self.assertEqual(self.ws.latest_message['data']['id'], config.session_id)
        self.ws.latest_message = None
        config.session_id = None

    def test_25_get_active_session_from_not_existing_user(self):
        res = requests.get(BASE_URL + '/sessions/activeSession/notExistingUser')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'User not found')
    
    def test_26_get_active_session_from_existing_user_with_no_session(self):
        res = requests.get(BASE_URL + '/sessions/activeSession/' + config.userLogin)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result'], None)
    
    def test_27_create_session_for_later(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.post(BASE_URL + '/sessions', headers
        =
        {'Authorization': ADMIN_AUTH_HEADER}, json={'startTime': '2024-02-12 12:12:12', 'idProject': config.project_id, 'loginUser': config.userLogin})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['projectId'], config.project_id)
        self.assertEqual(res.json()['result']['userLogin'], config.userLogin)
        config.session_id = res.json()['result']['id']
        time.sleep(0.2)
        self.assertEqual(self.ws.latest_message['reason'], 'created')
        self.assertEqual(self.ws.latest_message['data']['projectId'], config.project_id)
        self.assertEqual(self.ws.latest_message['data']['userLogin'], config.userLogin)
        self.assertEqual(self.ws.latest_message['data']['id'], config.session_id)
        self.ws.latest_message = None
        
    def test_28_check_OPTIONS(self):
        res = requests.options(BASE_URL + '/sessions')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result'], ['GET', 'POST','PATCH','DELETE'])

    def test_29_get_all_sessions(self):
        res = requests.get(BASE_URL + '/sessions')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertTrue('result' in res.json())
        self.assertTrue(isinstance(res.json()['result'], list))
        self.assertTrue('id' in res.json()['result'][0])
        self.assertTrue('startTime' in res.json()['result'][0])
        self.assertTrue('endTime' in res.json()['result'][0])
        self.assertTrue('projectId' in res.json()['result'][0])
        self.assertTrue('userLogin' in res.json()['result'][0])
    
    def test_30_get_session_by_id(self):
        res = requests.get(BASE_URL + '/sessions/' + str(config.session_id))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertTrue('result' in res.json())
        self.assertTrue('id' in res.json()['result'])
        self.assertTrue('startTime' in res.json()['result'])
        self.assertTrue('endTime' in res.json()['result'])
        self.assertTrue('projectId' in res.json()['result'])
        self.assertTrue('userLogin' in res.json()['result'])
        self.assertEqual(res.json()['result']['id'], config.session_id)

    def test_31_get_session_by_invalid_id(self):
        res = requests.get(BASE_URL + '/sessions/0')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Session not found')
    
    def test_32_update_session_with_invalid_id(self):
        ADMIN_AUTH_HEADER = 'Bearer ' + config.adminToken
        res = requests.patch(BASE_URL + '/sessions/0', headers
        ={'Authorization': ADMIN_AUTH_HEADER}, json={'endTime': '2024-12-12 12:15:13'})
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'Session not found')
    
    def test_33_get_active_session_from_not_existing_user(self):
        res = requests.get(BASE_URL + '/sessions/activeSession/notExistingUser')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'User not found')


    def test_35_get_active_session_from_existing_user_with_session(self):
        res = requests.get(BASE_URL + '/sessions/activeSession/' + config.userLogin)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertEqual(res.json()['result']['userLogin'], config.userLogin)
        self.assertEqual(res.json()['result']['projectId'], config.project_id)
        self.assertEqual(res.json()['result']['id'], config.session_id)


    def test_36_get_all_sessions_from_user(self):
        user_id = config.userLogin
        res = requests.get(BASE_URL + f'/sessions/allFromUser/' + user_id)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertTrue('result' in res.json())
        self.assertTrue(isinstance(res.json()['result'], list))
        self.assertTrue(res.json()['result'][0]['userLogin'], user_id)


    def test_37_get_all_sessions_from_user_not_existing(self):
        user_id = 'notExistingUser'
        res = requests.get(BASE_URL + f'/sessions/allFromUser/' + user_id)
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()['status'], 'error')
        self.assertEqual(res.json()['message'], 'User not found')
    
    def test_38_get_usage_from_session(self):
        res = requests.get(BASE_URL + '/sessions/usage/'+str(config.session_id))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'success')
        self.assertTrue('result' in res.json())
        print(res.json()['result'])
















    

