<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddCreatorsToMeetupsAndGroups extends Migration
{
    public function up()
    {
        $this->forge->addColumn('meetups', [
            'creator_user_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true, 'after' => 'id'],
        ]);

        $this->forge->addColumn('groups', [
            'creator_user_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true, 'after' => 'id'],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('groups', 'creator_user_id');
        $this->forge->dropColumn('meetups', 'creator_user_id');
    }
}
