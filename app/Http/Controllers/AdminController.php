<?php

namespace App\Http\Controllers;

use App\Models\admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class AdminController extends Controller
{
    // CREATION DE L'ADMIN
    public function store(Request $request)
    {
            $this->validate($request, [
                'login' => 'required|unique:admins',
                'password' => 'required',
            ]);
            $admin = new Admin();
            $admin->name = $request->name;
            $admin->email = $request->email;
            $admin->password =  Hash::make($request->password);
            $admin->save();
            return sendResponse('success', 'Nouvel administrateur créé', 201);

    }


    // CONNEXION DE L'ADMIN
    public function login(Request $request)
    {
        // On utilise un basic auth pour se connecter, pour ca on va chercher dans "authorization" du header de la requete 
        try {
            $authorization = base64_decode(explode(" ",$request->header('authorization'))[1]);
        }
        catch (\Exception $e) {
            return sendError('Erreur dans les credentials', 401);
        }


        list($login, $password) = explode(':', $authorization);


        
        // On verifie que l'admin existe
        $admin = Admin::where('login', $login)->first();
        if ($admin) {
            // On verifie que le mot de passe est correct
            if (Hash::check($password, $admin->password)) {
                // On delete les tokens de l'admin pour ne pas en avoir plusieurs
                $admin->tokens()->delete();

                // On crée un token valide 12h
                $date = now()->addHours(12);
                $token = $admin->createToken('admin',["*"], $date)->plainTextToken;
                // On renvoie le token
                return sendResponse('success', $token, 200);
            }
        }
        return sendError('Utilisateur ou mot de passe incorrect', 401);
    }
}
