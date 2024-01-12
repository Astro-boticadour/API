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

        $timestamp_debut_du_mois= mktime(0, 0, 0, $request_month, 1, $request_year);
        $timestamp_fin_du_mois= mktime(23, 59, 59, $request_month, date('t', $timestamp_debut_du_mois), $request_year);

        $results = utilise::selectRaw('projets.nom as projectName, SUM((utilise.horodatageFinUtilisation - utilise.horodatageDebutUtilisation)/3600) as durationInHours, DAY(FROM_UNIXTIME(utilise.horodatageDebutUtilisation)) AS dayOfMonth')
            ->join('sessions', 'utilise.idSession', '=', 'sessions.id')
            ->join('projets', 'sessions.idProjet', '=', 'projets.id')
            ->where('utilise.idRessource', $request['idRessource'])
            ->whereBetween('utilise.horodatageDebutUtilisation', [$timestamp_debut_du_mois, $timestamp_fin_du_mois])
            ->groupBy('projectName', 'dayOfMonth')
            ->get()->groupBy('projectName');
        

        // code sql de la requête : 

        $results = $results->map(function ($item, $key) {
            return [
                'projectName' => $key,
                'workingDays' => $item->map(function ($item, $key) {
                    return [
                        'dayOfMonth' => $item['dayOfMonth'],
                        'durationInHours' => $item['durationInHours']
                    ];
                })->values() // Extract the values as a list
            ];
        })->values(); // Extract the values as a list
        
        // On affiche le body de la requête
        return sendResponse('success', $results, 200);

    }
}
