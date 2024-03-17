import unittest
import sys
from routes.adminTest import TestAdminRoutes
from routes.userTest import TestUserRoutes
from routes.projectsTest import TestProjectRoutes
from routes.ressourcesTest import TestRessourcesRoutes
from routes.sessionsTest import TestSessionRoutes

if __name__ == '__main__':
    # Créer une suite de tests
    suite = unittest.TestSuite()

    # Ajouter les tests pour les routes administratives
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestAdminRoutes))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestUserRoutes))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestProjectRoutes))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestRessourcesRoutes))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestSessionRoutes))


    # Exécuter la suite de tests
    runner = unittest.TextTestRunner(verbosity=2)
    ret = not runner.run(suite).wasSuccessful()
    sys.exit(ret)
