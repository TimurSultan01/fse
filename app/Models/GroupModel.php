<?php

namespace App\Models;

use CodeIgniter\Model;

class GroupModel extends Model
{
    protected $table = 'groups';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $allowedFields = ['creator_user_id', 'name', 'region', 'description'];
    protected $useTimestamps = true;

    protected $validationRules = [
        'name'        => 'required|min_length[3]|max_length[120]',
        'region'      => 'required|max_length[80]',
        'description' => 'required|min_length[10]|max_length[1000]',
    ];
}
