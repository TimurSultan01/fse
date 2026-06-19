<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateGroupMembers extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'group_id' => ['type' => 'INT', 'unsigned' => true],
            'pilot_name' => ['type' => 'VARCHAR', 'constraint' => 80],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['group_id', 'pilot_name']);
        $this->forge->addForeignKey('group_id', 'groups', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('group_members', true);
    }

    public function down()
    {
        $this->forge->dropTable('group_members', true);
    }
}
