<?php

namespace App\Controllers\Api;

use App\Models\MessageModel;

class MessagesController extends BaseApiController
{
    private MessageModel $messages;

    public function __construct()
    {
        $this->messages = new MessageModel();
    }

    public function index()
    {
        $groupId = $this->request->getGet('group_id');
        $meetupId = $this->request->getGet('meetup_id');

        $builder = $this->messages->builder();

        if ($groupId !== null && $groupId !== '') {
            $builder->where('group_id', (int) $groupId);
        }

        if ($meetupId !== null && $meetupId !== '') {
            $builder->where('meetup_id', (int) $meetupId);
        }

        $rows = $builder
            ->orderBy('created_at', 'ASC')
            ->get()
            ->getResultArray();

        foreach ($rows as &$row) {
            $row['id'] = (int) $row['id'];
            $row['user_id'] = $row['user_id'] !== null ? (int) $row['user_id'] : null;
            $row['group_id'] = $row['group_id'] !== null ? (int) $row['group_id'] : null;
            $row['meetup_id'] = $row['meetup_id'] !== null ? (int) $row['meetup_id'] : null;
        }

        return $this->ok($rows);
    }

    public function create()
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        $payload = $this->jsonPayload();

        $data = [
            'user_id'   => (int) $user['id'],
            'author'    => $user['display_name'],
            'text'      => trim((string) ($payload['text'] ?? '')),
            'group_id'  => isset($payload['group_id']) && $payload['group_id'] !== '' ? (int) $payload['group_id'] : null,
            'meetup_id' => isset($payload['meetup_id']) && $payload['meetup_id'] !== '' ? (int) $payload['meetup_id'] : null,
        ];

        if (!$this->messages->insert($data)) {
            return $this->failValidation($this->messages->errors());
        }

        $message = $this->messages->find($this->messages->getInsertID());
        $message['id'] = (int) $message['id'];
        $message['user_id'] = $message['user_id'] !== null ? (int) $message['user_id'] : null;
        $message['group_id'] = $message['group_id'] !== null ? (int) $message['group_id'] : null;
        $message['meetup_id'] = $message['meetup_id'] !== null ? (int) $message['meetup_id'] : null;

        return $this->ok($message, 'Nachricht wurde gesendet', 201);
    }

    public function delete($id = null)
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        $message = $this->messages->find((int) $id);
        if (!$message) {
            return $this->failNotFoundMessage('Nachricht nicht gefunden');
        }

        $ownsMessage = (int) ($message['user_id'] ?? 0) === (int) $user['id']
            || (($message['user_id'] ?? null) === null && strtolower($message['author']) === strtolower($user['display_name']));

        if (!$ownsMessage) {
            return $this->respond([
                'success' => false,
                'message' => 'Du kannst nur deine eigenen Nachrichten löschen.',
            ], 403);
        }

        $this->messages->delete((int) $id);

        return $this->ok(null, 'Nachricht wurde gelöscht');
    }
}
