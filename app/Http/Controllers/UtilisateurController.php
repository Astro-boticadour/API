<?php

namespace App\Http\Controllers;

use App\Models\utilisateur;
use Illuminate\Http\Request;

class UtilisateurController extends Controller
{
    // On fait un crud pour les utilisateur

    public function index()
    {
        return sendResponse("success",utilisateur::all(),200);

    }

    public function show($login)
    {
        $utilisateur = utilisateur::find($login);
        if (is_null($utilisateur)) {
            return sendError("utilisateur non trouvé", 404);
        }
        return sendResponse("success", $utilisateur,200);
    }


    public function store(Request $request)
    {
        try {
            $request->validate([
                'login' => 'required|unique:utilisateur',
                'nom' => 'required',
                'prenom' => 'required',
                'pole' => 'required',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendError($e->errors(), 400);
        }
        
        $utilisateur = utilisateur::create($request->all());
        return sendResponse('success', $utilisateur,200);
    }

    public function update(Request $request, $login)
    {
        $utilisateur = utilisateur::find($login);
        if (is_null($utilisateur)) {
            return sendError('utilisateur non trouvé', 404);
        }

        $utilisateur->update($request->all());        
        $utilisateur->save();
        
        return sendResponse('success', $utilisateur,200);
    }

    public function delete(Request $request, $login)
    {
        $utilisateur = utilisateur::find($login);
        if (is_null($utilisateur)) {
            return sendError('utilisateur non trouvé', 404);
        }
        $utilisateur->delete();
        return sendResponse('success', $utilisateur,200);
    }

}
