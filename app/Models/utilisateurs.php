<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class utilisateurs extends Model
{
    use HasFactory;
    protected $table = 'utilisateurs';
    protected $primaryKey = 'login';
    public $incrementing = false;
    protected $keyType = 'string';


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
