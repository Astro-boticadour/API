<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\session;
use App\Models\utilisateur;
use App\Models\utilise;

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

        /*
    *   Retourne les sessions d'un utilisateur, si il en a une
    *   Pour ca on regarde dans la table session si l'idUtilisateur est égal à l'id de l'utilisateur
    */
    public function activesessions($login)
    {
        $utilisateur = utilisateur::find($login);
        if (is_null($utilisateur)) {
            return sendError('utilisateur non trouvé', 404);
        }
        // On ne retourne que les sessions qui ont un horodatage de fin de session null (donc en cours)
        $sessions = session::where('loginUtilisateur', $login)->whereNull('horodatageFin')->get();
        // On renvois un objet json avec working = true si il y a une session en cours, false sinon et l'objet session ,'en a qu'un
        if (count($sessions) == 0) {
            return sendResponse('success', ['working' => false],200);
        }
        return sendResponse('success', ['working' => true, 'session' => $sessions[0]],200);

    }

    public function all_sessions($login)
    // Retourne toutes les sessions d'un utilisateur, finies ou non
    {
        $utilisateur = utilisateur::find($login);
        if (is_null($utilisateur)) {
            return sendError('utilisateur non trouvé', 404);
        }
        // On ne retourne que les sessions qui ont un horodatage de fin de session non null (donc terminée)
        $sessions = session::where('loginUtilisateur', $login)->get();
        return sendResponse('success', $sessions,200);
    }

    public function usage($idSession)
    // Retourne tout les occurences de la table utilise qui ont l'idSession en paramètre
    {   
        // Et horodatageFinUtilisation est null (donc en cours)
        $utilise = utilise::where('idSession', $idSession)->whereNull('horodatageFinUtilisation')->get();
        return sendResponse('success', $utilise,200);
    }



    
}
