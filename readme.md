![example workflow](https://github.com/Astro-boticadour/API/actions/workflows/ci.yaml/badge.svg)

# API REST de l'application A.S.T.R.O
## Introduction
Ce document décrit l'API REST de l'application A.S.T.R.O. Il est destiné aux développeurs qui souhaitent intégrer de nouvelles fonctionnalités à l'application ou maintenir son code source.

## Objets
- `User` : un employé de l'entreprise
- `Project` : un projet sur lequel un utilisateur peut travailler
- `Session` : une session de travail d'un utilisateur sur un projet
- `Ressource` : une ressource physique qui peut être utilisée par un utilisateur lors d'une session de travail
- `Utilisation` : une utilisation d'une ressource par une session de travail


## Modèle de données
### User
- `login` : identifiant unique de l'utilisateur (ex: `p.david`)
- `firstName` : prénom de l'utilisateur (ex: `Pierre`)
- `lastName` : nom de l'utilisateur (ex: `David`)
- `pole` : pôle de l'utilisateur (ex: `Robotique`)

### Project
- `id` : identifiant unique du projet (ex: `1`)
- `name` : nom du projet (ex: `Projet A`)
- `isClosed` : indique si le projet est terminé ou non (ex: `false`)
- `startDate` : date de début du projet (ex: `2021-01-01`)
- `endDate` : date de fin du projet (ex: `2021-12-31`)
- `description` : description du projet (ex: `Projet de recherche sur la robotique`)

### Ressource
- `id` : identifiant unique de la ressource (ex: `1`)
- `name` : nom de la ressource (ex: `Sully`)
- `type` : type de la ressource (ex: `Robot`)
- `model` : modèle de la ressource (ex: `Staubli TX90`)
- `isUsed` : indique si la ressource est utilisée ou non (ex: `false`)

### Session
- `id` : identifiant unique de la session (ex: `1`)
- `startTime` : date et heure de début de la session (ex: `2021-01-01 08:00:00`)
- `endTime` : date et heure de fin de la session (ex: `2021-01-01 12:00:00`)
- `projectId` : identifiant du projet sur lequel la session a lieu (ex: `1`)
- `userLogin` : identifiant de l'utilisateur qui a effectué la session (ex: `p.david`) 

### Utilisation
- `id` : identifiant unique de l'utilisation (ex: `1`)
- `usageStartDate` : date et heure de début de l'utilisation (ex: `2021-01-01 08:00:00`)
- `usageEndDate` : date et heure de fin de l'utilisation (ex: `2021-01-01 10:00:00`)
- `sessionId` : identifiant de la session à laquelle l'utilisation est associée (ex: `1`)
- `ressourceId` : identifiant de la ressource utilisée (ex: `1`)



## Endpoints
L'API REST de l'application A.S.T.R.O expose les endpoints suivants avec les méthodes HTTP associées :<br>

- Utilisateurs
    - `/users` : 
        - `GET` : récupérer la liste des utilisateurs
        - `POST` : créer un nouvel utilisateur*
    - `/users/{login}` :
        - `GET` : récupérer un utilisateur par son identifiant
        - `PATCH` : mettre à jour un utilisateur*
        - `DELETE` : supprimer un utilisateur*
- Projets
    - `/projects` : 
        - `GET` : récupérer la liste des projets
        - `POST` : créer un nouveau projet*
    - `/projects/{id}` :
        - `GET` : récupérer un projet par son identifiant
        - `PATCH` : mettre à jour un projet*
        - `DELETE` : supprimer un projet*
- Ressources
    - `/ressources` : 
        - `GET` : récupérer la liste des ressources
        - `POST` : créer une nouvelle ressource*
    - `/ressources/{id}` :
        - `GET` : récupérer une ressource par son identifiant
        - `PATCH` : mettre à jour une ressource*
        - `DELETE` : supprimer une ressource*
- Sessions
    - `/sessions` : 
        - `GET` : récupérer la liste des sessions
        - `POST` : créer une nouvelle session
    - `/sessions/{id}` :
        - `GET` : récupérer une session par son identifiant
        - `PATCH` : mettre à jour une session
        - `DELETE` : supprimer une session*
- Utilisations
    - `/utilisations` : 
        - `GET` : récupérer la liste des utilisations
        - `POST` : créer une nouvelle utilisation
    - `/utilisations/{id}` :
        - `GET` : récupérer une utilisation par son identifiant
        - `PATCH` : mettre à jour une utilisation
        - `DELETE` : supprimer une utilisation*


- Data
    - `/data` :
        - `GET` : Renvois un un tableau de données contenant les informations sur les utilisateurs, les projets, les ressources, les sessions et les utilisations par rapport à une date afin de pouvoir les afficher dans un graphique.

- Login
    - `/login` :
        - `POST` : permet à un administrateur de se connecter et de récupérer un token d'authentification en utilisant une entête `Authorization` avec la valeur `Basic nom:motdepasse` encodée en base64. Si un token est fourni, il vérifie si le token est valide et renvoie une réponse indiquant si le token est valide ou non.

**Necessite un token d'authentification administrateur*


## Configuration
La configuration est définie dans le fichier `src/config.js`. Il contient les informations suivantes :
- `app.port` : le port sur lequel l'application écoute les requêtes HTTP
- `app.env` : l'environnement de l'application (ex: `development`, `production`)
- `app.close_cron` : le pattern cron pour fermer toutes les sessions actives
- `database.timezone` : le fuseau horaire de la base de données
- `database.db_name` : le nom de la base de données
- `database.username` : le nom d'utilisateur de la base de données
- `database.password` : le mot de passe de la base de données
- `database.options.host` : l'hôte de la base de données
- `database.options.dialect` : le dialecte de la base de données (ex: `mysql`, `postgres`)
- `database.options.logging` : active ou désactive les logs de la base de données
- `jwt.iss` : l'émetteur du token JWT
- `jwt.secret` : la clé secrète pour signer le token JWT
- `jwt.duration` : la durée de validité du token JWT en secondes
- `admin.login` : le login de l'administrateur
- `admin.password` : le mot de passe de l'administrateur

```javascript
module.exports = async (app) => {
  app.set('config',
  {
    app : {
      port: process.env.PORT || 3000,
      env: process.env.NODE_ENV || 'development',
      // The cron pattern to close all active sessions
      close_cron: process.env.CLOSE_CRON || '0 23 * * *',
    },

    
    database : {
      timezone: 'local',
      db_name: process.env.DB_NAME || 'astro',
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'notSecureChangeMe',
      options: {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql' ,
        logging : process.env.DB_LOGGING || false,
      }
    },
    jwt :{
      iss : 'Astro',
      secret : process.env.JWT_SECRET || 'secret',
      duration : Number(process.env.JWT_DURATION) || 3600
    },

    admin : {
      login: process.env.ADMIN_LOGIN || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin',
    }

})  
}
```
Toutes les variables de configuration peuvent être surchargées par des variables d'environnement.
```env
PORT=3000
NODE_ENV=development
CLOSE_CRON=0 23 * * *
DB_NAME=astro
DB_USERNAME=root
DB_PASSWORD=notSecureChangeMe
DB_HOST=localhost
DB_LOGGING=false
JWT_SECRET=secret
JWT_DURATION=3600
ADMIN_LOGIN=admin
ADMIN_PASSWORD=admin
```

## Scripts
- `yarn install` : installer les dépendances (requiert `yarn`)
- `yarn start` : démarrer l'application
- `yarn dev` : démarrer l'application en mode développement avec un rechargement automatique
- `yarn test` : exécuter les tests unitaires (necessite python3 et pip install -r tests/requirements.txt)
- `yarn coverage` : générer le rapport de couverture des tests (neccessite de lancer yarn test dans un autre terminal)


## Application de developpement
Pour tester rapidement les endpoints de l'API, vous pouvez utiliser l'application de développement [Bruno](https://github.com/usebruno/bruno) et ouvrir le dossier `bruno/express`, selectionner l'environnement de développement, vous pourrez alors tester les endpoints de l'API.


## Tests et couverture
Afin de garantir la qualité du code, des tests unitaires sont écrits pour chaque endpoint de l'API. Les tests sont exécutés à chaque commit dans un pipeline CI/CD github action. Le pipeline est considere comme réussi si tous les tests passent et que la couverture du code est supérieure à 97%.






