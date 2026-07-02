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
        $groupId  = $this->request->getGet('group_id');
        $meetupId = $this->request->getGet('meetup_id');

        $builder = $this->messages->builder();

        // Ein Chat gehört genau zu einer Gruppe, einem Flugtreffen – oder ist der
        // allgemeine Chat. Ohne diese Trennung würden Gruppen-/Treffen-Nachrichten
        // im allgemeinen Chat auftauchen.
        if ($groupId !== null && $groupId !== '') {
            $builder->where('group_id', (int) $groupId);
        } elseif ($meetupId !== null && $meetupId !== '') {
            $builder->where('meetup_id', (int) $meetupId);
        } else {
            $builder->where('group_id', null)->where('meetup_id', null);
        }

        $rows = $builder
            ->orderBy('created_at', 'ASC')
            ->get()
            ->getResultArray();

        return $this->ok(array_map([$this, 'presentMessage'], $rows));
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

        $message = $this->presentMessage($this->messages->find($this->messages->getInsertID()));

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

        if ((int) ($message['user_id'] ?? 0) !== (int) $user['id']) {
            return $this->failForbidden('Du kannst nur deine eigenen Nachrichten löschen.');
        }

        $this->messages->delete((int) $id);

        return $this->ok(null, 'Nachricht wurde gelöscht');
    }

    /**
     * Normalisiert eine Nachricht-Zeile in konsistente Typen für das Frontend.
     */
    private function presentMessage(array $row): array
    {
        $row['id']        = (int) $row['id'];
        $row['user_id']   = ($row['user_id'] ?? null) !== null ? (int) $row['user_id'] : null;
        $row['group_id']  = ($row['group_id'] ?? null) !== null ? (int) $row['group_id'] : null;
        $row['meetup_id'] = ($row['meetup_id'] ?? null) !== null ? (int) $row['meetup_id'] : null;

        return $row;
    }
}
