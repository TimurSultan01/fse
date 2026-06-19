<?php

namespace App\Controllers\Api;

use App\Models\GroupModel;
use App\Models\GroupMemberModel;
use App\Models\UserModel;

class GroupsController extends BaseApiController
{
    private GroupModel $groups;
    private GroupMemberModel $members;
    private UserModel $users;

    public function __construct()
    {
        $this->groups = new GroupModel();
        $this->members = new GroupMemberModel();
        $this->users = new UserModel();
    }

    public function index()
    {
        $rows = $this->groups
            ->orderBy('name', 'ASC')
            ->findAll();

        foreach ($rows as &$group) {
            $members = $this->members
                ->where('group_id', (int) $group['id'])
                ->orderBy('pilot_name', 'ASC')
                ->findAll();
            $creator = ($group['creator_user_id'] ?? null) !== null
                ? $this->users->find((int) $group['creator_user_id'])
                : null;

            foreach ($members as &$member) {
                $member['id'] = (int) $member['id'];
                $member['group_id'] = (int) $member['group_id'];
                $member['user_id'] = ($member['user_id'] ?? null) !== null ? (int) $member['user_id'] : null;
            }

            $group['id'] = (int) $group['id'];
            $group['creator_user_id'] = ($group['creator_user_id'] ?? null) !== null ? (int) $group['creator_user_id'] : null;
            $group['creator_display_name'] = $creator['display_name'] ?? 'Unbekannt';
            $group['members'] = $members;
            $group['member_count'] = count($members);
            $group['can_manage'] = false;
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
        $group['creator_user_id'] = ($group['creator_user_id'] ?? null) !== null ? (int) $group['creator_user_id'] : null;
        $creator = $group['creator_user_id'] !== null ? $this->users->find((int) $group['creator_user_id']) : null;
        $currentUser = $this->currentUser();
        $group['creator_display_name'] = $creator['display_name'] ?? 'Unbekannt';
        $group['can_manage'] = $currentUser !== null && $this->isCreator($group, (int) $currentUser['id']);
        $group['members'] = $this->members
            ->where('group_id', (int) $id)
            ->orderBy('pilot_name', 'ASC')
            ->findAll();

        foreach ($group['members'] as &$member) {
            $member['id'] = (int) $member['id'];
            $member['group_id'] = (int) $member['group_id'];
            $member['user_id'] = $member['user_id'] !== null ? (int) $member['user_id'] : null;
        }

        $group['member_count'] = count($group['members']);

        return $this->ok($group);
    }

    public function create()
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        $payload = $this->jsonPayload();

        $data = [
            'creator_user_id' => (int) $user['id'],
            'name'            => trim((string) ($payload['name'] ?? '')),
            'region'          => trim((string) ($payload['region'] ?? '')),
            'description'     => trim((string) ($payload['description'] ?? '')),
        ];

        $groupId = $this->groups->insert($data, true);

        if (!$groupId) {
            return $this->failValidation($this->groups->errors());
        }

        return $this->show($groupId);
    }

    public function update($id = null)
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        $group = $this->groups->find((int) $id);
        if (!$group) {
            return $this->failNotFoundMessage('Gruppe nicht gefunden');
        }

        if (!$this->isCreator($group, (int) $user['id'])) {
            return $this->failForbidden('Nur der Ersteller kann diese Gruppe bearbeiten.');
        }

        $payload = $this->jsonPayload();

        $data = [
            'name'        => trim((string) ($payload['name'] ?? $group['name'])),
            'region'      => trim((string) ($payload['region'] ?? $group['region'])),
            'description' => trim((string) ($payload['description'] ?? $group['description'])),
        ];

        if (!$this->groups->update((int) $id, $data)) {
            return $this->failValidation($this->groups->errors());
        }

        return $this->show($id);
    }

    public function delete($id = null)
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        $group = $this->groups->find((int) $id);
        if (!$group) {
            return $this->failNotFoundMessage('Gruppe nicht gefunden');
        }

        if (!$this->isCreator($group, (int) $user['id'])) {
            return $this->failForbidden('Nur der Ersteller kann diese Gruppe löschen.');
        }

        $this->groups->delete((int) $id);

        return $this->ok(null, 'Gruppe wurde gelöscht');
    }

    public function join($id = null)
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        $pilotName = $user['display_name'];

        if (!$this->groups->find((int) $id)) {
            return $this->failNotFoundMessage('Gruppe nicht gefunden');
        }

        $existing = $this->members
            ->where('group_id', (int) $id)
            ->where('user_id', (int) $user['id'])
            ->first();

        if (!$existing) {
            $this->members->insert([
                'group_id'   => (int) $id,
                'user_id'    => (int) $user['id'],
                'pilot_name' => $pilotName,
            ]);
        }

        return $this->show($id);
    }

    public function leave($id = null)
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        if (!$this->groups->find((int) $id)) {
            return $this->failNotFoundMessage('Gruppe nicht gefunden');
        }

        $member = $this->members
            ->where('group_id', (int) $id)
            ->where('user_id', (int) $user['id'])
            ->first();

        if ($member) {
            $this->members->delete($member['id']);
        }

        return $this->show($id);
    }

    private function isCreator(array $group, int $userId): bool
    {
        return isset($group['creator_user_id']) && (int) $group['creator_user_id'] === $userId;
    }
}
