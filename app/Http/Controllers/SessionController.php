<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\session;

class SessionController extends Controller
{
    // On fait un crud pour les sessions

    public function index()
    {
        // On affiche les date Debut et date Fin en timestamp
        $sessions = session::all();
        return sendResponse('success', $sessions,200);
    }

    public function store(Request $request)
    {

        // Si l'utilisateur a deja une session en cours, on ne peut pas en créer une autre
        $session = session::where('loginUtilisateur', $request['loginUtilisateur'])->whereNull('horodatageFin')->first();
        if (!is_null($session)) {
            return sendError("L'utilisateur a déjà une session en cours", 400);
        }


        try {
            $request->validate([
                // On veut une date au format timestamp
                'horodatageDebut' => 'required | integer',
                'idProjet' => 'required | exists:projets,id',
                'loginUtilisateur' => 'required | exists:utilisateurs,login'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendError($e->errors(), 400);
        }
        
        // On vérifie que le timestamp est bien bon format
        if ($request['horodatageDebut'] < 0  || strlen($request['horodatageDebut']) != 10){
            return sendError("horodatageDebut doit être un timestamp valide", 400);
        }


        $session = session::create($request->all());
        return sendResponse('success', $session,200);
    }

    public function show($id)
    {
        $session = session::find($id);

        if (is_null($session)) {
            return sendError("session non trouvé", 404);
        }
        return sendResponse("success", $session,200);
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                // On veut que la date soit au format Y-m-d H:i:s
                'horodatageDebut' => 'integer',
                'horodatageFin' => 'integer',
                'idProjet' => 'required',
                'loginUtilisateur' => 'required'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendError($e->errors(), 400);
        }

        // On vérifie que le timestamp est bien bon format
        if ($request-> has('horodatageDebut') && ($request['horodatageDebut'] < 0  || strlen($request['horodatageDebut']) != 10)){
            return sendError("horodatageDebut doit être un timestamp valide", 400);
        }

        // On vérifie que le timestamp est bien bon format
        if ($request-> has('horodatageFin') && ($request['horodatageFin'] < 0  || strlen($request['horodatageFin']) != 10)){
            return sendError("horodatageFin doit être un timestamp valide", 400);
        }

        $session = session::find($id);
        if (is_null($session)) {
            return sendError('session non trouvé', 404);
        }
        $session->update($request->all());
        return sendResponse('success', $session,200);
    }

    public function destroy($id)
    {
        $session = session::find($id);
        if (is_null($session)) {
            return sendError('session non trouvé', 404);
        }
        $session->delete();
        return sendResponse('success', $session,200);
    }



    
}
