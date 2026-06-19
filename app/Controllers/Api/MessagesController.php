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
            $row['group_id'] = $row['group_id'] !== null ? (int) $row['group_id'] : null;
            $row['meetup_id'] = $row['meetup_id'] !== null ? (int) $row['meetup_id'] : null;
        }

        return $this->ok($rows);
    }

    public function create()
    {
        $payload = $this->jsonPayload();

        $data = [
            'author'    => trim((string) ($payload['author'] ?? '')),
            'text'      => trim((string) ($payload['text'] ?? '')),
            'group_id'  => isset($payload['group_id']) && $payload['group_id'] !== '' ? (int) $payload['group_id'] : null,
            'meetup_id' => isset($payload['meetup_id']) && $payload['meetup_id'] !== '' ? (int) $payload['meetup_id'] : null,
        ];

        if (!$this->messages->insert($data)) {
            return $this->failValidation($this->messages->errors());
        }

        return $this->ok($this->messages->find($this->messages->getInsertID()), 'Nachricht wurde gesendet', 201);
    }

    public function delete($id = null)
    {
        if (!$this->messages->find((int) $id)) {
            return $this->failNotFoundMessage('Nachricht nicht gefunden');
        }

        $this->messages->delete((int) $id);

        return $this->ok(null, 'Nachricht wurde gelöscht');
    }
}
