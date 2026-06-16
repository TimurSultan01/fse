<?php

namespace App\Models;

use CodeIgniter\Model;

class ParticipantModel extends Model
{
    protected $table = 'participants';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $allowedFields = ['meetup_id', 'pilot_name'];
    protected $useTimestamps = true;
}
