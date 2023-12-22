<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class utilise extends Model
{
    use HasFactory;
    protected $table = 'utilise';
    protected $fillable = [
        'idSession',
        'idRessource',
        'horodatageDebutUtilisation',
        'horodatageFinUtilisation'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function session()
    {
        return $this->belongsTo(session::class, 'idSession');
    }

    public function ressource()
    {
        return $this->belongsTo(ressource::class, 'idRessource');
    }


}
