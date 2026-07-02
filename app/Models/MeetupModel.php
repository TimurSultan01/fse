<?php

namespace App\Models;

use CodeIgniter\Model;

class MeetupModel extends Model
{
    protected $table = 'meetups';
    protected $primaryKey = 'id';
    protected $returnType = 'array';

    protected $allowedFields = [
        'creator_user_id',
        'title',
        'spot',
        'region',
        'latitude',
        'longitude',
        'date',
        'time',
        'end_time',
        'experience_level',
        'takeoff_direction',
        'max_participants',
        'description',
        'tags',
        'status',
    ];

    protected $useTimestamps = true;

    protected $validationRules = [
        'title'            => 'required|min_length[3]|max_length[120]',
        'spot'             => 'required|min_length[2]|max_length[120]',
        'region'           => 'required|max_length[80]',
        'date'             => 'required|valid_date[Y-m-d]',
        'time'             => 'required',
        'experience_level' => 'required|max_length[80]',
        'max_participants' => 'required|integer|greater_than[0]',
        'description'      => 'required|min_length[10]',
        'latitude'         => 'permit_empty|decimal',
        'longitude'        => 'permit_empty|decimal',
        'end_time'         => 'permit_empty',
        'takeoff_direction' => 'permit_empty|max_length[16]',
        'tags'             => 'permit_empty|max_length[200]',
    ];

    protected $validationMessages = [
        'date' => [
            'valid_date' => 'Bitte gib ein gültiges Datum im Format JJJJ-MM-TT ein.',
        ],
    ];
}
