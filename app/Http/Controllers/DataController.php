<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ressource;
use App\Models\utilise;
use App\Models\projet;




class DataController extends Controller
{

    public function get_ressource_timesheet(Request $request)
    {
        try {
            $request->validate([
                'idRessource' => 'required | exists:ressources,id',
                'month' => 'required | date_format:m-Y'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendError($e->errors(), 400);
        }

        // On recupere juste le mois et l'année
        $request_month = explode('-', $request['month'])[0];
        $request_year = explode('-', $request['month'])[1];

        // On regarde si on est pas en train de demander un mois dans le futur
        if ($request_year > date('Y') || ($request_year == date('Y') && $request_month > date('m'))) {
            return sendError("Vous ne pouvez pas demander un mois dans le futur", 400);
        }

        // On transforme le numero du mois en nom
        $request_month = date('F', mktime(0, 0, 0, $request_month, 10));

        $results = Ressource::select(
            'ressources.nom as ressource_nom',
            'projets.nom as projet_nom',
            \DB::raw('SUM(utilise.horodatageFinUtilisation - utilise.horodatageDebutUtilisation) % 3600 as duree_utilisation')
        )
        ->join('utilise', 'ressources.id', '=', 'utilise.idRessource') // Corrected join condition
        ->join('sessions', 'utilise.idSession', '=', 'sessions.id')
        ->join('projets', 'sessions.idProjet', '=', 'projets.id')
        ->where('ressources.id', $request['idRessource'])
        ->where('utilise.horodatageDebutUtilisation', '>=', strtotime("first day of $request_month $request_year"))
        ->where('utilise.horodatageDebutUtilisation', '<=', strtotime("last day of $request_month $request_year 23:59:59"))
        ->groupBy('ressources.nom', 'projets.nom')
        ->get();
        


        // On affiche le body de la requête
        return sendResponse('success', $results,200);
    }
}
