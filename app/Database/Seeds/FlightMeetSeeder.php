<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class FlightMeetSeeder extends Seeder
{
    public function run()
    {
        $now = date('Y-m-d H:i:s');

        $this->db->table('meetups')->insertBatch([
            [
                'id' => 1,
                'title' => 'Thermiktraining am Tegelberg',
                'spot' => 'Tegelberg',
                'region' => 'Bayern',
                'date' => '2026-08-12',
                'time' => '10:00:00',
                'experience_level' => 'Fortgeschritten',
                'max_participants' => 6,
                'description' => 'Gemeinsames Thermiktraining mit Briefing, Wettercheck und sicherem Abschluss.',
                'status' => 'offen',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'title' => 'Einsteiger-Flugtag im Sauerland',
                'spot' => 'Willingen',
                'region' => 'NRW',
                'date' => '2026-08-15',
                'time' => '09:30:00',
                'experience_level' => 'Einsteiger',
                'max_participants' => 8,
                'description' => 'Ruhiger Flugtag für neue Pilotinnen und Piloten mit Startplatzbesprechung.',
                'status' => 'offen',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'title' => 'Abendsoaring an der Küste',
                'spot' => 'Sankt Peter-Ording',
                'region' => 'Schleswig-Holstein',
                'date' => '2026-08-18',
                'time' => '17:00:00',
                'experience_level' => 'Alle Level',
                'max_participants' => 5,
                'description' => 'Lockeres Küstensoaring bei passendem Wind mit anschließendem Austausch.',
                'status' => 'offen',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $this->db->table('participants')->insertBatch([
            ['meetup_id' => 1, 'pilot_name' => 'Mara', 'created_at' => $now, 'updated_at' => $now],
            ['meetup_id' => 1, 'pilot_name' => 'Jonas', 'created_at' => $now, 'updated_at' => $now],
            ['meetup_id' => 2, 'pilot_name' => 'Lea', 'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->db->table('groups')->insertBatch([
            [
                'id' => 1,
                'name' => 'Thermik-Jäger Süd',
                'region' => 'Bayern',
                'description' => 'Gruppe für spontane Thermikflüge und Wochenendtreffen.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'name' => 'Küstenflieger',
                'region' => 'Schleswig-Holstein',
                'description' => 'Austausch zu Küstensoaring, Wind und Sicherheit.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'name' => 'Einsteiger FlightMeet',
                'region' => 'Deutschlandweit',
                'description' => 'Treffen, Fragen und Tipps für neue Pilotinnen und Piloten.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $this->db->table('group_members')->insertBatch([
            ['group_id' => 1, 'pilot_name' => 'Mara', 'created_at' => $now, 'updated_at' => $now],
            ['group_id' => 1, 'pilot_name' => 'Jonas', 'created_at' => $now, 'updated_at' => $now],
            ['group_id' => 2, 'pilot_name' => 'Lea', 'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->db->table('messages')->insertBatch([
            ['author' => 'Mara', 'text' => 'Wer ist am Wochenende am Tegelberg?', 'group_id' => null, 'meetup_id' => null, 'created_at' => $now, 'updated_at' => $now],
            ['author' => 'Jonas', 'text' => 'Ich bin dabei, wenn der Wind passt.', 'group_id' => null, 'meetup_id' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
