<?php

namespace App\Http\Controllers;

use App\Models\utilisateurs;
use Illuminate\Http\Request;

class UtilisateursController extends Controller
{
    // On fait un crud pour les utilisateurs

    public function index()
    {
        return response()->json(utilisateurs::all(), 200);

    }

    public function show($login)
    {
        $utilisateur = utilisateurs::find($login);
        if (is_null($utilisateur)) {
            return response()->json(['message' => 'utilisateur non trouvé'], 404);
        }
        return response()->json($utilisateur::find($login), 200);
    }


    public function store(Request $request)
    {
        try {
            $request->validate([
                'login' => 'required|unique:utilisateurs',
                'nom' => 'required',
                'prenom' => 'required',
                'badge_token' => 'unique:utilisateurs',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendResponse("error", $e->errors(), 400);
        }
        
        $utilisateur = utilisateurs::create($request->all());
        return response($utilisateur, 201);
    }

    public function update(Request $request, $login)
    {
        $utilisateur = utilisateurs::find($login);
        if (is_null($utilisateur)) {
            return response()->json(['message' => 'utilisateur non trouvé'], 404);
        }
        $utilisateur->update($request->all());
        return response($utilisateur, 200);
    }

    public function delete(Request $request, $login)
    {
        $utilisateur = utilisateurs::find($login);
        if (is_null($utilisateur)) {
            return response()->json(['message' => 'utilisateur non trouvé'], 404);
        }
        $utilisateur->delete();
        return response()->json(null, 204);
    }

}
