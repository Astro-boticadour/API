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

        // On recuepre le nombre de jour dans le mois
        $number_of_days = cal_days_in_month(CAL_GREGORIAN, explode('-', $request['month'])[0], explode('-', $request['month'])[1]);
        
        for ($i = 1; $i <= $number_of_days; $i++) {
            $results[$i] = Ressource::select(
                'ressources.nom as ressource_nom',
                'projets.nom as projet_nom',
                \DB::raw('SUM(utilise.horodatageFinUtilisation - utilise.horodatageDebutUtilisation) / 3600 as duree_utilisation')
            )
            ->join('utilise', 'ressources.id', '=', 'utilise.idRessource') // Corrected join condition
            ->join('sessions', 'utilise.idSession', '=', 'sessions.id')
            ->join('projets', 'sessions.idProjet', '=', 'projets.id')
            ->where('ressources.id', $request['idRessource'])
            ->where('utilise.horodatageDebutUtilisation', '>=', strtotime("$i $request_month $request_year"))
            ->where('utilise.horodatageDebutUtilisation', '<=', strtotime("$i $request_month $request_year 23:59:59"))
            ->groupBy('ressources.nom', 'projets.nom')
            ->get();
        }
        $new_results = [];
        foreach ($results as $key => $value) {
            foreach ($value as $key2 => $value2) {
                $new_results[$value2['projet_nom']][$key] = $value2['duree_utilisation'];
            }
        }

        // On rajoute les autres jours a chaque projet et on met 0
        foreach ($new_results as $key => $value) {
            for ($i = 1; $i <= $number_of_days; $i++) {
                if (!isset($value[$i])) {
                    $new_results[$key][$i] = "0";
                }
            }
        }
         
        



        // On affiche le body de la requête
        return sendResponse('success', $new_results,200);
    }
}
