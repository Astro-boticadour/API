<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\utilise;
use App\Models\session;
use App\Models\ressource;

class UtiliseController extends Controller
{
    // On fait un crud pour les utilise

    public function index()
    {
        $utilises = utilise::all();
        return sendResponse('success', $utilises,200);
    }


    public function show($id)
    {
        $utilise = utilise::find($id);

        if (is_null($utilise)) {
            return sendError("utilisation non trouvé", 404);
        }
        return sendResponse("success", $utilise,200);
    }


    public function store(Request $request)
    {
        try {
            $request->validate([
                'idRessource' => 'required | exists:ressources,id',
                'idSession' => 'required | exists:sessions,id',
                'horodatageDebutUtilisation' => 'required | integer',

            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendError($e->errors(), 400);
        }

        // On recupere la session pour voir si elle est pas fermée
        if (session::find($request['idSession'])->is_closed()) {
            return sendResponse('error', "La session est déjà fermée", 400);
        }




        # Il faut vérifier que l'horodatage de début d'utilisation est positif et qu'il possède 10 chiffres
        if ($request['horodatageDebutUtilisation'] < 0  || strlen($request['horodatageDebutUtilisation']) != 10) {
            return sendError("L'horodatage de début d'utilisation doit être positif", 400);
        }


        # Avant de créer une utilisation, on vérifie que la ressource n'est pas déjà utilisée (horodatageDebutUtilisation et horodatageFinUtilisation)
        # Si elle est déjà utilisée, on vérifie si les deux sessions travaillent sur le même projet
        # Il faut aussi vérifier que cette utilisation existe deja  (tout les champs sauf horodatageFinUtilisation sont identiques)
        $utilise = utilise::where('idRessource', $request['idRessource'])->whereNull('horodatageFinUtilisation')->first();
        if (!is_null($utilise)) {
            $session1 = session::find($utilise['idSession']);
            $session2 = session::find($request['idSession']);
            if ($session1['idProjet'] != $session2['idProjet']) {
                return sendError("La ressource est déjà utilisée par une autre session qui travaille sur un autre projet", 400);
            }
            if ($utilise['idSession'] == $request['idSession']) {
                return sendError("L'utilisation similaire en cours est déjà enregristrée", 400);
            }
        }
        
        $utilise = utilise::create($request->all());

        // On met à jour le champ estUtilise de la ressource
        $check = utilise::where('idRessource', $utilise['idRessource'])->get();
        if ($check->whereNull('horodatageFinUtilisation')->count()){
            $ressource = ressource::find($utilise['idRessource']);
            $ressource->estUtilise = 1;
            $ressource->save();
        }
        else{
            $ressource = ressource::find($utilise['idRessource']);
            $ressource->estUtilise = 0;
            $ressource->save();
        }
        return sendResponse('success', $utilise,200);
    }


    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'horodatageDebutUtilisation' => ' integer',
                'horodatageFinUtilisation' => 'required | integer',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendError($e->errors(), 400);
        }


        # Il faut vérifier que l'horodatage de début d'utilisation est positif et qu'il possède 10 chiffres
        if ($request['horodatageDebutUtilisation'] && ($request['horodatageDebutUtilisation'] < 0  || strlen($request['horodatageDebutUtilisation']) != 10)) {
            return sendError("L'horodatage de début d'utilisation doit être positif", 400);
        }

        # Il faut vérifier que l'horodatage de fin d'utilisation est positif et qu'il possède 10 chiffres
        if ($request['horodatageFinUtilisation'] < 0  || strlen($request['horodatageFinUtilisation']) != 10) {
            return sendError("L'horodatage de fin d'utilisation doit être positif", 400);
        }

        $utilise = utilise::find($id);
        if (is_null($utilise)) {
            return sendError("utilisation non trouvé", 404);
        }

        // On recupere la session pour voir si elle est pas fermée
        if (session::find($utilise['idSession'])->is_closed()) {
            return sendResponse('error', "La session est déjà fermée", 400);
        }

        $utilise->update($request->all());
        // On met à jour le champ estUtilise de la ressource
        $check = utilise::where('idRessource', $utilise['idRessource'])->get();
        if ($check->whereNull('horodatageFinUtilisation')->count()){
            $ressource = ressource::find($utilise['idRessource']);
            $ressource->estUtilise = 1;
            $ressource->save();
        }
        else{
            $ressource = ressource::find($utilise['idRessource']);
            $ressource->estUtilise = 0;
            $ressource->save();
        }
        return sendResponse('success', $utilise,200);
    }


    public function destroy($id)
    {
        $utilise = utilise::find($id);
        if (is_null($utilise)) {
            return sendError("utilisation non trouvé", 404);
        }
        $utilise->delete();
        // On met à jour le champ estUtilise de la ressource
        $check = utilise::where('idRessource', $utilise['idRessource'])->get();
        if ($check->whereNull('horodatageFinUtilisation')->count()){
            $ressource = ressource::find($utilise['idRessource']);
            $ressource->estUtilise = 1;
            $ressource->save();
        }
        else{
            $ressource = ressource::find($utilise['idRessource']);
            $ressource->estUtilise = 0;
            $ressource->save();
        }


        return sendResponse('success', $utilise,200);
    }
}
