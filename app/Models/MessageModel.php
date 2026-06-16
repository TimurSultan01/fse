<?php

namespace App\Models;

use CodeIgniter\Model;

class MessageModel extends Model
{
    protected $table = 'messages';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $allowedFields = ['author', 'text'];
    protected $useTimestamps = true;

    protected $validationRules = [
        'author' => 'required|min_length[2]|max_length[80]',
        'text'   => 'required|min_length[1]|max_length[500]',
    ];
}
