<?php

namespace App\Models;

use CodeIgniter\Model;

class GroupMemberModel extends Model
{
    protected $table = 'group_members';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $allowedFields = ['group_id', 'pilot_name'];
    protected $useTimestamps = true;

    protected $validationRules = [
        'group_id'   => 'required|integer',
        'pilot_name' => 'required|min_length[2]|max_length[80]',
    ];
}
