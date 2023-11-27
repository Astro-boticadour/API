<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class admin extends Model
{   
    use HasFactory, HasApiTokens;
    protected $table = 'admin';



    protected $fillable = [
        'login',
        'password',
    ];

    protected $hidden = [
        'password',
        'created_at',
        'updated_at',
        "id"
    ];


    
}
