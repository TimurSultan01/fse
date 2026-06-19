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

    public function updateProfile()
    {
        $currentUser = $this->requireUser();
        if (!$currentUser) {
            return $this->failUnauthorized();
        }

        $payload = $this->jsonPayload();
        $displayName = trim((string) ($payload['display_name'] ?? ''));
        $email = strtolower(trim((string) ($payload['email'] ?? '')));

        if (strlen($displayName) < 2 || strlen($displayName) > 80) {
            return $this->failValidation(['display_name' => 'Der Name muss zwischen 2 und 80 Zeichen lang sein.']);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
            return $this->failValidation(['email' => 'Bitte gib eine gültige E-Mail-Adresse ein.']);
        }

        $duplicate = $this->users
            ->where('email', $email)
            ->where('id !=', (int) $currentUser['id'])
            ->first();

        if ($duplicate) {
            return $this->failValidation(['email' => 'Diese E-Mail-Adresse ist bereits registriert.']);
        }

        $this->users->skipValidation(true)->update((int) $currentUser['id'], [
            'display_name' => $displayName,
            'email'        => $email,
        ]);

        $this->syncDisplayName((int) $currentUser['id'], $displayName);

        return $this->ok($this->presentUser($this->users->find((int) $currentUser['id'])), 'Profil wurde gespeichert');
    }

    public function changePassword()
    {
        $currentUser = $this->requireUser();
        if (!$currentUser) {
            return $this->failUnauthorized();
        }

        $payload = $this->jsonPayload();
        $currentPassword = (string) ($payload['current_password'] ?? '');
        $newPassword = (string) ($payload['new_password'] ?? '');
        $confirmPassword = (string) ($payload['confirm_password'] ?? '');
        $user = $this->users->find((int) $currentUser['id']);

        if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
            return $this->respond([
                'success' => false,
                'message' => 'Das aktuelle Passwort ist falsch.',
            ], 401);
        }

        if (strlen($newPassword) < 8) {
            return $this->failValidation(['new_password' => 'Das neue Passwort muss mindestens 8 Zeichen lang sein.']);
        }

        if ($newPassword !== $confirmPassword) {
            return $this->failValidation(['confirm_password' => 'Die Passwortbestätigung stimmt nicht überein.']);
        }

        $this->users->skipValidation(true)->update((int) $currentUser['id'], [
            'password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
        ]);

        session()->regenerate(true);
        session()->set('user_id', (int) $currentUser['id']);

        return $this->ok(null, 'Passwort wurde geändert');
    }

    private function startUserSession(array $user): void
    {
        session()->regenerate(true);
        session()->set('user_id', (int) $user['id']);
    }

    private function syncDisplayName(int $userId, string $displayName): void
    {
        $db = db_connect();

        $db->table('participants')
            ->where('user_id', $userId)
            ->update(['pilot_name' => $displayName]);
        $db->table('group_members')
            ->where('user_id', $userId)
            ->update(['pilot_name' => $displayName]);
        $db->table('messages')
            ->where('user_id', $userId)
            ->update(['author' => $displayName]);
    }
}
