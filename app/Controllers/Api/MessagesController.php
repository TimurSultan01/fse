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
        $rows = $this->messages
            ->orderBy('created_at', 'ASC')
            ->findAll();

        return $this->ok($rows);
    }

    public function create()
    {
        $payload = $this->request->getJSON(true) ?? [];

        $data = [
            'author' => trim((string) ($payload['author'] ?? 'Gastpilot')),
            'text'   => trim((string) ($payload['text'] ?? '')),
        ];

        if (!$this->messages->insert($data)) {
            return $this->failValidation($this->messages->errors());
        }

        return $this->ok($this->messages->find($this->messages->getInsertID()), 'Nachricht wurde gesendet', 201);
    }
}
