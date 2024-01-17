<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\session;
use App\Models\utilisateur;
use App\Models\utilise;
use App\Models\ressource;

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
        
        // Si l'utilisateur a deja une session en cours, on ne peut pas en créer une autre
        if (!is_null(session::get_user_session($request['loginUtilisateur']))) {
            return sendError("L'utilisateur a déjà une session en cours", 400);
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
                'idProjet' => 'exists:projets,id',
                'loginUtilisateur' => 'exists:utilisateurs,login'
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
        // Si on a un horodatage de fin,
        //  On recupere toutes les utilisations lié a cette session 
        // et on met l'horodatage de fin de session et on met toutes les ressources en non utilisé

        if ($request->has('horodatageFin')){
            $utilise = utilise::where('idSession', $id)->whereNull('horodatageFinUtilisation')->get();
            // On recupere toutes les ressources utilisé par cette session
            $array=ressource::whereIn('id', $utilise->pluck('idRessource'))->get();
            // On met toutes les ressources en non utilisé
            foreach ($array as $ressource) {
                $ressource->update(['estUtilise' => false]);
            }
            // On met l'horodatage de fin de chaque utilisation
            foreach ($utilise as $utilisation) {
                $utilisation->update(['horodatageFinUtilisation' => $request['horodatageFin']]);
            }
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
