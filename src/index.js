// Importer le module Express
const express = require('express');

// Créer une instance de l'application Express
const app = express();

// Définir une route pour la racine de l'URL
app.get('/', (req, res) => {
  res.send('Hello, World!'); // Répondre avec le message "Hello, World!"
});

// Définir le port sur lequel le serveur écoutera les requêtes
const port = 3000;

// Démarrer le serveur et écouter les requêtes sur le port spécifié
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
