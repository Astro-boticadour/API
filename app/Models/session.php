<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class session extends Model
{
    use HasFactory;
    protected $fillable = [
        'horodatageDebut',
        'horodatageFin',
        'idProjet',
        'loginUtilisateur'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function projet()
    {
        return $this->belongsTo(projet::class, 'idProjet');
    }

    public function utilisateur()
    {
        return $this->belongsTo(utilisateur::class, 'idUtilisateur');
    }

    public function is_closed(){
        return !is_null($this->horodatageFin);
    }

    public static function get_user_session($login){
        return session::where('loginUtilisateur', $login)->whereNull('horodatageFin')->first();
    }
}

