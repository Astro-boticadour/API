<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Admin;
use App\Models\Utilisateur;
use App\Models\Projet;
use App\Models\Ressource;

use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        // On crée un administrateur par défaut avec le mot de passe 'admin'
        Admin::create([
            'login' => 'admin',
            'password' => Hash::make('admin'),
        ]);

        Utilisateur::create([
            'login' => 'pdavid003',
            'nom' => 'David',
            'prenom' => 'Paul',
            'pole' => 'DSI',
        ]);

        Projet::create([
            'nom' => 'Projet Airbus',
            'description' => 'Description du projet 1',
            'dateDebut' => '2021-01-01',
            'dateFin' => '2021-12-31',
            'estClos' => false,
        ]);

        Ressource::create([
            'nom' => 'sami',
            'modele' => 'K7376',
            'type' => 'sauce',
        ]);
            
        
    }
}
