<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    
    return $request->user();

});


use App\Http\Controllers\AdminController;
// on peut utiliser le middleware sanctum pour verifier que l'admin utilise un token valide


Route::post('/admin', [AdminController::class, 'store'])->middleware('auth:sanctum');
Route::post('/admin/login', [AdminController::class, 'login']);



use App\Http\Controllers\UtilisateurController;
// Free access
Route::get('/utilisateur', [UtilisateurController::class, 'index']);
Route::get('/utilisateur/{login}', [UtilisateurController::class, 'show']);
Route::get('/utilisateur/{login}/sessions', [UtilisateurController::class, 'sessions']);

// Admin authentification needed
Route::post('/utilisateur', [UtilisateurController::class, 'store'])->middleware('auth:sanctum');
Route::put('/utilisateur/{login}', [UtilisateurController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/utilisateur/{login}', [UtilisateurController::class, 'destroy'])->middleware('auth:sanctum');
Route::post('/utilisateur/login', [UtilisateurController::class, 'login'])->middleware('auth:sanctum');



use App\Http\Controllers\ProjetController;
// Free access
Route::get('/projet', [ProjetController::class, 'index']);
Route::get('/projet/{id}', [ProjetController::class, 'show']);

// Admin authentification needed
Route::post('/projet', [ProjetController::class, 'store'])->middleware('auth:sanctum');
Route::put('/projet/{id}', [ProjetController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/projet/{id}', [ProjetController::class, 'destroy'])->middleware('auth:sanctum');



use App\Http\Controllers\RessourceController;
// Free access
Route::get('/ressource', [RessourceController::class, 'index']);
Route::get('/ressource/{id}', [RessourceController::class, 'show']);

// Admin authentification needed
Route::post('/ressource', [RessourceController::class, 'store'])->middleware('auth:sanctum');
Route::put('/ressource/{id}', [RessourceController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/ressource/{id}', [RessourceController::class, 'destroy'])->middleware('auth:sanctum');


use App\Http\Controllers\SessionController;
// Free access
Route::get('/session', [SessionController::class, 'index']);
Route::get('/session/{id}', [SessionController::class, 'show']);
Route::post('/session', [SessionController::class, 'store']);
Route::put('/session/{id}', [SessionController::class, 'update']);
route::get('/session/activesessions/{login}', [SessionController::class, 'activesessions']);
route::get('/session/user/{login}', [SessionController::class, 'all_sessions']);
route::get('/session/usage/{id}', [SessionController::class, 'usage']);

// Admin authentification needed
Route::delete('/session/{id}', [SessionController::class, 'destroy'])->middleware('auth:sanctum');


use App\Http\Controllers\UtiliseController;
// Free access
Route::get('/utilise', [UtiliseController::class, 'index']);
Route::get('/utilise/{id}', [UtiliseController::class, 'show']);
Route::post('/utilise', [UtiliseController::class, 'store']);
Route::put('/utilise/{id}', [UtiliseController::class, 'update']);

// Admin authentification needed
Route::delete('/utilise/{id}', [UtiliseController::class, 'destroy'])->middleware('auth:sanctum');



use App\Http\Controllers\DataController;
// Free access
Route::get('/data/get_ressource_timesheet', [DataController::class, 'get_ressource_timesheet']);