<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ressource extends Model
{
    use HasFactory;
    protected $table = "ressources";
    protected $fillable = [
        "nom",
        "type",
        "modele",
        "estUtilise"
        ];
    
    protected $hidden = [
        "created_at",
        "updated_at"
        ];
        
}
