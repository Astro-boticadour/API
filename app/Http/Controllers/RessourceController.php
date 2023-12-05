<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RessourceController extends Controller
{
    // On fait un crud pour les ressources
    
    public function index()
    {
        return sendResponse("success",ressource::all(),200);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'nom' => 'required',
                'type' => 'required',
                'modele' => 'required'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendError($e->errors(), 400);
        }
        

        $ressource = ressource::create($request->all());
        return sendResponse('success', $ressource,200);
    }

    public function show($id)
    {
        $ressource = ressource::find($id);
        if (is_null($ressource)) {
            return sendError("ressource non trouvé", 404);
        }
        return sendResponse("success", $ressource,200);
    }


    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'nom' => 'string',
                'type' => 'string',
                'modele' => 'string'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendError($e->errors(), 400);
        }
        $ressource = ressource::find($id);
        if (is_null($ressource)) {
            return sendError('ressource non trouvé', 404);
        }
        $ressource->update($request->all());
        return sendResponse('success', $ressource,200);
    }


    public function destroy($id)
    {
        $ressource = ressource::find($id);
        if (is_null($ressource)) {
            return sendError('ressource non trouvé', 404);
        }
        $ressource->delete();
        return sendResponse('success', $ressource,200);
    }
}
