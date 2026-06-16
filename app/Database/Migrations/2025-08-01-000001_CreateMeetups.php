<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateMeetups extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'title' => ['type' => 'VARCHAR', 'constraint' => 120],
            'spot' => ['type' => 'VARCHAR', 'constraint' => 120],
            'region' => ['type' => 'VARCHAR', 'constraint' => 80],
            'date' => ['type' => 'DATE'],
            'time' => ['type' => 'TIME'],
            'experience_level' => ['type' => 'VARCHAR', 'constraint' => 80],
            'max_participants' => ['type' => 'INT', 'unsigned' => true],
            'description' => ['type' => 'TEXT'],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'offen'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->createTable('meetups');
    }

    public function down()
    {
        $this->forge->dropTable('meetups');
    }
}
