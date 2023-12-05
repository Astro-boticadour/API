<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\projet;

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
                'dateDebut' => 'date|required',
                'dateFin' => 'date|required',
                'estClos' => 'boolean',
                'description' => 'string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendError($e->errors(), 400);
        }
        

        $request['dateDebut'] = date('Y-m-d', strtotime($request['dateDebut']));
        $request['dateFin'] = date('Y-m-d', strtotime($request['dateFin']))." 23:59:59";
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
        try {
            $request->validate([
                'nom' => 'unique:projets,nom,'.$id,
                'dateDebut' => 'date',
                'dateFin' => 'date',
                'estClos' => 'boolean',
                'description' => 'string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return sendError($e->errors(), 400);
        }
        $projet = projet::find($id);
        if (is_null($projet)) {
            return sendError('projet non trouvé', 404);
        }
        if ($request->has('dateDebut')) {
            $request['dateDebut'] = date('Y-m-d', strtotime($request['dateDebut']));
        }
        if ($request->has('dateFin')) {
            $request['dateFin'] = date('Y-m-d', strtotime($request['dateFin']))." 23:59:59";
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
        return sendResponse('success',$projet,200);
    }
}
