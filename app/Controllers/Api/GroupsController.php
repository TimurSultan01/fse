<?php

namespace App\Controllers\Api;

class GroupsController extends BaseApiController
{
    public function index()
    {
        return $this->ok([
            [
                'id' => 1,
                'name' => 'Thermik-Jäger Süd',
                'region' => 'Bayern',
                'description' => 'Gruppe für spontane Thermikflüge und Wochenendtreffen.',
                'members' => 18,
            ],
            [
                'id' => 2,
                'name' => 'Küstenflieger',
                'region' => 'Schleswig-Holstein',
                'description' => 'Austausch zu Küstensoaring, Wind und Sicherheit.',
                'members' => 11,
            ],
            [
                'id' => 3,
                'name' => 'Einsteiger FlightMeet',
                'region' => 'Deutschlandweit',
                'description' => 'Treffen, Fragen und Tipps für neue Pilotinnen und Piloten.',
                'members' => 27,
            ],
        ]);
    }
}
