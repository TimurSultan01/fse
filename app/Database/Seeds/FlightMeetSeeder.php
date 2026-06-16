<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class FlightMeetSeeder extends Seeder
{
    public function run()
    {
        $this->db->table('meetups')->insertBatch([
            [
                'title' => 'Thermiktraining am Tegelberg',
                'spot' => 'Tegelberg',
                'region' => 'Bayern',
                'date' => '2025-08-12',
                'time' => '10:00:00',
                'experience_level' => 'Fortgeschritten',
                'max_participants' => 6,
                'description' => 'Gemeinsames Thermiktraining mit Briefing, Wettercheck und sicherem Abschluss.',
                'status' => 'offen',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'title' => 'Einsteiger-Flugtag im Sauerland',
                'spot' => 'Willingen',
                'region' => 'NRW',
                'date' => '2025-08-15',
                'time' => '09:30:00',
                'experience_level' => 'Einsteiger',
                'max_participants' => 8,
                'description' => 'Ruhiger Flugtag für neue Pilotinnen und Piloten mit Startplatzbesprechung.',
                'status' => 'offen',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'title' => 'Abendsoaring an der Küste',
                'spot' => 'Sankt Peter-Ording',
                'region' => 'Schleswig-Holstein',
                'date' => '2025-08-18',
                'time' => '17:00:00',
                'experience_level' => 'Alle Level',
                'max_participants' => 5,
                'description' => 'Lockeres Küstensoaring bei passendem Wind mit anschließendem Austausch.',
                'status' => 'offen',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ]);

        $this->db->table('participants')->insertBatch([
            ['meetup_id' => 1, 'pilot_name' => 'Mara', 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')],
            ['meetup_id' => 1, 'pilot_name' => 'Jonas', 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')],
            ['meetup_id' => 2, 'pilot_name' => 'Lea', 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')],
        ]);

        $this->db->table('messages')->insertBatch([
            ['author' => 'Mara', 'text' => 'Wer ist am Wochenende am Tegelberg?', 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')],
            ['author' => 'Jonas', 'text' => 'Ich bin dabei, wenn der Wind passt.', 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')],
        ]);
    }
}
