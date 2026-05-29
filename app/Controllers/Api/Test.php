<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;

class Test extends BaseController
{
    public function index()
    {
        return $this->response->setJSON([
            'success' => true,
            'message' => 'Backend antwortet!',
            'time' => date('Y-m-d H:i:s'),
        ]);
    }
}