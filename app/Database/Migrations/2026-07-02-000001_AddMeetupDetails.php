<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddMeetupDetails extends Migration
{
    public function up()
    {
        $this->forge->addColumn('meetups', [
            'latitude'          => ['type' => 'DECIMAL', 'constraint' => '10,7', 'null' => true, 'after' => 'region'],
            'longitude'         => ['type' => 'DECIMAL', 'constraint' => '10,7', 'null' => true, 'after' => 'latitude'],
            'takeoff_direction' => ['type' => 'VARCHAR', 'constraint' => 16, 'null' => true, 'after' => 'experience_level'],
            'tags'              => ['type' => 'VARCHAR', 'constraint' => 200, 'null' => true, 'after' => 'description'],
            'end_time'          => ['type' => 'TIME', 'null' => true, 'after' => 'time'],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('meetups', ['latitude', 'longitude', 'takeoff_direction', 'tags', 'end_time']);
    }
}
