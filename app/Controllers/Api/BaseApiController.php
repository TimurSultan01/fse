<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class BaseApiController extends ResourceController
{
    protected $format = 'json';

    protected function ok(mixed $data = null, string $message = 'OK', int $status = 200)
    {
        return $this->respond([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    protected function failValidation(array|string $errors, string $message = 'Validierung fehlgeschlagen')
    {
        return $this->respond([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], 422);
    }

    protected function failNotFoundMessage(string $message = 'Eintrag nicht gefunden')
    {
        return $this->respond([
            'success' => false,
            'message' => $message,
        ], 404);
    }
}
