<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateParticipants extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'meetup_id' => ['type' => 'INT', 'unsigned' => true],
            'pilot_name' => ['type' => 'VARCHAR', 'constraint' => 80],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('meetup_id', 'meetups', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('participants');
    }

    public function down()
    {
        $this->forge->dropTable('participants');
    }
}
