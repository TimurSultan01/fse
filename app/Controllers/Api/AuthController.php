<?php

namespace App\Controllers\Api;

use App\Models\UserModel;

class AuthController extends BaseApiController
{
    private UserModel $users;

    public function __construct()
    {
        $this->users = new UserModel();
    }

    public function me()
    {
        return $this->ok($this->currentUser());
    }

    public function register()
    {
        $payload = $this->jsonPayload();

        $displayName = trim((string) ($payload['display_name'] ?? ''));
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');

        if (strlen($password) < 8) {
            return $this->failValidation(['password' => 'Das Passwort muss mindestens 8 Zeichen lang sein.']);
        }

        $userId = $this->users->insert([
            'display_name'  => $displayName,
            'email'         => $email,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ], true);

        if (!$userId) {
            return $this->failValidation($this->users->errors());
        }

        $user = $this->users->find($userId);
        $this->startUserSession($user);

        return $this->ok($this->presentUser($user), 'Registrierung erfolgreich', 201);
    }

    public function login()
    {
        $payload = $this->jsonPayload();
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');

        $user = $this->users->where('email', $email)->first();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return $this->respond([
                'success' => false,
                'message' => 'E-Mail oder Passwort ist falsch.',
            ], 401);
        }

        $this->startUserSession($user);

        return $this->ok($this->presentUser($user), 'Login erfolgreich');
    }

    public function logout()
    {
        session()->remove('user_id');
        session()->regenerate(true);

        return $this->ok(null, 'Logout erfolgreich');
    }

    private function startUserSession(array $user): void
    {
        session()->regenerate(true);
        session()->set('user_id', (int) $user['id']);
    }
}
