<?php

namespace App\Controllers\Api;

use CodeIgniter\Controller;
use CodeIgniter\API\ResponseTrait;
use App\Models\UserModel;

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

    protected function failUnauthorized(string $message = 'Bitte melde dich zuerst an.')
    {
        return $this->respond([
            'success' => false,
            'message' => $message,
        ], 401);
    }

    protected function failForbidden(string $message = 'Du darfst diese Aktion nicht ausführen.')
    {
        return $this->respond([
            'success' => false,
            'message' => $message,
        ], 403);
    }

    protected function jsonPayload(): array
    {
        return $this->request->getJSON(true) ?? $this->request->getPost() ?? [];
    }

    protected function currentUser(): ?array
    {
        $userId = session()->get('user_id');

        if (!$userId) {
            return null;
        }

        $user = (new UserModel())->find((int) $userId);

        return $user ? $this->presentUser($user) : null;
    }

    protected function requireUser(): ?array
    {
        return $this->currentUser();
    }

    protected function presentUser(array $user): array
    {
        return [
            'id'           => (int) $user['id'],
            'display_name' => $user['display_name'],
            'email'        => $user['email'],
            'created_at'   => $user['created_at'] ?? null,
        ];
    }
}
