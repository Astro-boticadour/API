import unittest
import sys
from testClasses.adminTest import TestAdminRoutes
from testClasses.userTest import TestUserRoutes
from testClasses.projectsTest import TestProjectRoutes
from testClasses.ressourcesTest import TestRessourcesRoutes
from testClasses.sessionsTest import TestSessionRoutes
from testClasses.generalTest import TestGeneral

if __name__ == '__main__':
    # Créer une suite de tests
    suite = unittest.TestSuite()

    # Ajouter les tests pour les routes administratives
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestAdminRoutes))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestUserRoutes))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestProjectRoutes))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestRessourcesRoutes))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestSessionRoutes))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestGeneral))


    # Exécuter la suite de tests
    runner = unittest.TextTestRunner(verbosity=2)
    ret = not runner.run(suite).wasSuccessful()
    sys.exit(ret)
