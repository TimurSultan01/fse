<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateMessages extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'author' => ['type' => 'VARCHAR', 'constraint' => 80],
            'text' => ['type' => 'VARCHAR', 'constraint' => 500],
            'group_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'meetup_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('group_id', 'groups', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('meetup_id', 'meetups', 'id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('messages', true);
    }

    public function down()
    {
        $this->forge->dropTable('messages', true);
    }
}
