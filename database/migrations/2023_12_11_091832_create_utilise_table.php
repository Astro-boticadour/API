<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('utilise', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idSession')->constrained('sessions');
            $table->foreignId('idRessource')->constrained('ressources');
            $table->integer('horodatageDebutUtilisation');
            $table->integer('horodatageFinUtilisation')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilise');
    }
};
