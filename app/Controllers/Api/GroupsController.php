<?php

namespace App\Controllers\Api;

use App\Models\GroupModel;
use App\Models\GroupMemberModel;

class GroupsController extends BaseApiController
{
    private GroupModel $groups;
    private GroupMemberModel $members;

    public function __construct()
    {
        $this->groups = new GroupModel();
        $this->members = new GroupMemberModel();
    }

    public function index()
    {
        $rows = $this->groups
            ->orderBy('name', 'ASC')
            ->findAll();

        foreach ($rows as &$group) {
            $group['member_count'] = $this->members
                ->where('group_id', (int) $group['id'])
                ->countAllResults();
            $group['id'] = (int) $group['id'];
        }

        return $this->ok($rows);
    }

    public function show($id = null)
    {
        $group = $this->groups->find((int) $id);

        if (!$group) {
            return $this->failNotFoundMessage('Gruppe nicht gefunden');
        }

        $group['id'] = (int) $group['id'];
        $group['members'] = $this->members
            ->where('group_id', (int) $id)
            ->orderBy('pilot_name', 'ASC')
            ->findAll();
        $group['member_count'] = count($group['members']);

        return $this->ok($group);
    }

    public function create()
    {
        $payload = $this->jsonPayload();

        $data = [
            'name'        => trim((string) ($payload['name'] ?? '')),
            'region'      => trim((string) ($payload['region'] ?? '')),
            'description' => trim((string) ($payload['description'] ?? '')),
        ];

        if (!$this->groups->insert($data)) {
            return $this->failValidation($this->groups->errors());
        }

        return $this->ok($this->groups->find($this->groups->getInsertID()), 'Gruppe wurde erstellt', 201);
    }

    public function join($id = null)
    {
        $payload = $this->jsonPayload();
        $pilotName = trim((string) ($payload['pilot_name'] ?? ''));

        if ($pilotName === '') {
            return $this->failValidation(['pilot_name' => 'Bitte gib einen Pilotennamen ein.']);
        }

        if (!$this->groups->find((int) $id)) {
            return $this->failNotFoundMessage('Gruppe nicht gefunden');
        }

        $existing = $this->members
            ->where('group_id', (int) $id)
            ->where('pilot_name', $pilotName)
            ->first();

        if (!$existing) {
            $this->members->insert([
                'group_id'   => (int) $id,
                'pilot_name' => $pilotName,
            ]);
        }

        return $this->show($id);
    }

    public function leave($id = null)
    {
        $payload = $this->jsonPayload();
        $pilotName = trim((string) ($payload['pilot_name'] ?? ''));

        if ($pilotName === '') {
            return $this->failValidation(['pilot_name' => 'Bitte gib einen Pilotennamen ein.']);
        }

        if (!$this->groups->find((int) $id)) {
            return $this->failNotFoundMessage('Gruppe nicht gefunden');
        }

        $member = $this->members
            ->where('group_id', (int) $id)
            ->where('pilot_name', $pilotName)
            ->first();

        if ($member) {
            $this->members->delete($member['id']);
        }

        return $this->show($id);
    }
}
