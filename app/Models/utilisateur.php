<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class utilisateur extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    protected $table = "utilisateurs";
    protected $primaryKey = "login";
    protected $fillable = [
        'login',
        'nom',
        'prenom',
        'pole',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];
}
