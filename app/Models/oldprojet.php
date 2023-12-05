<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class projet extends Model
{
    use HasFactory;
    protected $table = "projets";
    protected $fillable = [
        "nom",
        "dateDebut",
        "dateFin",
        "estClos",
        "description"
        ];

    protected $hidden = [
        "created_at",
        "updated_at"
        ];
    }
?>




