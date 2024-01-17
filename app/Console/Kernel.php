<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\session;
use App\Models\utilise;
use App\Models\ressource;
class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // On veut fermer les sessions où horodatageFin est null
        // $schedule->call(function () {

        //     $sessions = session::whereNull('horodatageFin')->get();
        //     foreach ($sessions as $session) {
        //         $session->horodatageFin = time();
        //         $session->save();
        //     }

        //     // On veut fermer les utilisations où horodatageFinUtilisation est null
        //     $utilises = utilise::whereNull('horodatageFinUtilisation')->get();
        //     foreach ($utilises as $utilise) {
        //         $utilise->horodatageFinUtilisation = time();
        //         $utilise->save();
        //     }

        //     // On met toutes les ressources en non utilisé
        //     $ressources = ressource::where('estUtilise', true)->get();
        //     foreach ($ressources as $ressource) {
        //         $ressource->estUtilise = false;
        //         $ressource->save();
        //     }
        // })->everyTenSeconds()
        // ->timezone('Europe/Paris')
        // ->name('fermetureSessions');
    
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
