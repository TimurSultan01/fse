<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $allowedFields = ['display_name', 'email', 'password_hash'];
    protected $useTimestamps = true;

    protected $validationRules = [
        'display_name'  => 'required|min_length[2]|max_length[80]',
        'email'         => 'required|valid_email|max_length[190]|is_unique[users.email,id,{id}]',
        'password_hash' => 'required|max_length[255]',
    ];

    protected $validationMessages = [
        'email' => [
            'is_unique' => 'Diese E-Mail-Adresse ist bereits registriert.',
        ],
    ];
}
