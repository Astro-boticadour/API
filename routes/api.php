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


use App\Http\Controllers\UtilisateursController;
// Free access
Route::get('/utilisateurs', [UtilisateursController::class, 'index']);
Route::get('/utilisateurs/{login}', [UtilisateursController::class, 'show']);


// Admin authentification needed
Route::post('/utilisateurs', [UtilisateursController::class, 'store'])->middleware('auth:sanctum');
Route::put('/utilisateurs/{login}', [UtilisateursController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/utilisateurs/{login}', [UtilisateursController::class, 'delete'])->middleware('auth:sanctum');
Route::post('/utilisateurs/login', [UtilisateursController::class, 'login'])->middleware('auth:sanctum');


use App\Http\Controllers\AdminController;
// on peut utiliser le middleware sanctum pour verifier que l'admin utilise un token valide


Route::post('/admin', [AdminController::class, 'store'])->middleware('auth:sanctum');
Route::post('/admin/login', [AdminController::class, 'login']);