<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUsers extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'display_name' => ['type' => 'VARCHAR', 'constraint' => 80],
            'email' => ['type' => 'VARCHAR', 'constraint' => 190],
            'password_hash' => ['type' => 'VARCHAR', 'constraint' => 255],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('email');
        $this->forge->createTable('users', true);

        $this->forge->addColumn('participants', [
            'user_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true, 'after' => 'meetup_id'],
        ]);
        $this->forge->addColumn('group_members', [
            'user_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true, 'after' => 'group_id'],
        ]);
        $this->forge->addColumn('messages', [
            'user_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true, 'after' => 'id'],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('messages', 'user_id');
        $this->forge->dropColumn('group_members', 'user_id');
        $this->forge->dropColumn('participants', 'user_id');
        $this->forge->dropTable('users', true);
    }
}
