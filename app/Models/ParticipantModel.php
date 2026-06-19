<?php

namespace App\Models;

use CodeIgniter\Model;

class ParticipantModel extends Model
{
    protected $table = 'participants';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $allowedFields = ['meetup_id', 'user_id', 'pilot_name'];
    protected $useTimestamps = true;

    protected $validationRules = [
        'meetup_id'  => 'required|integer',
        'pilot_name' => 'required|min_length[2]|max_length[80]',
    ];
}
