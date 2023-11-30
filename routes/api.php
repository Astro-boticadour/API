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


use App\Http\Controllers\UtilisateurController;
// Free access
Route::get('/utilisateur', [UtilisateurController::class, 'index']);
Route::get('/utilisateur/{login}', [UtilisateurController::class, 'show']);


// Admin authentification needed
Route::post('/utilisateur', [UtilisateurController::class, 'store'])->middleware('auth:sanctum');
Route::put('/utilisateur/{login}', [UtilisateurController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/utilisateur/{login}', [UtilisateurController::class, 'delete'])->middleware('auth:sanctum');
Route::post('/utilisateur/login', [UtilisateurController::class, 'login'])->middleware('auth:sanctum');


use App\Http\Controllers\AdminController;
// on peut utiliser le middleware sanctum pour verifier que l'admin utilise un token valide


Route::post('/admin', [AdminController::class, 'store'])->middleware('auth:sanctum');
Route::post('/admin/login', [AdminController::class, 'login']);