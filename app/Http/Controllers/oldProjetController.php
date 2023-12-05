<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProjetController extends Controller
{
    // On fait un crud pour les projets
    public function index()
    {
        return sendResponse("success",projet::all(),200);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'nom' => 'required|unique:projets',
                'dateDebut ' => 'date|required',
                'dateFin' => 'date|required',
                'estClos' => 'boolean',
                'description' => 'string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendError($e->errors(), 400);
        }
        
        $projet = projet::create($request->all());
        return sendResponse('success', $projet,200);
    }

    public function show($id)
    {
        $projet = projet::find($id);
        if (is_null($projet)) {
            return sendError("projet non trouvé", 404);
        }
        return sendResponse("success", $projet,200);
    }

    public function update(Request $request, $id)
    {
        $projet = projet::find($id);
        if (is_null($projet)) {
            return sendError('projet non trouvé', 404);
        }

        $projet->update($request->all());        
        $projet->save();
        
        return sendResponse('success', $projet,200);
    }

    public function destroy($id)
    {
        $projet = projet::find($id);
        if (is_null($projet)) {
            return sendError('projet non trouvé', 404);
        }
        $projet->delete();
        return sendResponse('success', 'projet supprimé',200);
    }
}

