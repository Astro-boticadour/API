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
        Schema::create('sessions', function (Blueprint $table) {
            $table->id();
            // On veut une date au format timestamp
            $table->integer('horodatageDebut');
            $table->integer('horodatageFin')->nullable();
            $table->string('loginUtilisateur');
            $table->foreignId('idProjet')->constrained('projets')->onDelete('cascade');
            $table->foreign('loginUtilisateur')->references('login')->on('utilisateurs')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }


};
