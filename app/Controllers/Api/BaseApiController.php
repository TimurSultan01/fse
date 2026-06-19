<?php

namespace App\Controllers\Api;

use CodeIgniter\Controller;
use CodeIgniter\API\ResponseTrait;

class BaseApiController extends Controller
{
    use ResponseTrait;

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

    protected function jsonPayload(): array
    {
        return $this->request->getJSON(true) ?? $this->request->getPost() ?? [];
    }
}
