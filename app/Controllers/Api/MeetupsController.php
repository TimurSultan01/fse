<?php

namespace App\Controllers\Api;

use App\Models\MeetupModel;
use App\Models\ParticipantModel;
use App\Models\UserModel;

class MeetupsController extends BaseApiController
{
    private MeetupModel $meetups;
    private ParticipantModel $participants;
    private UserModel $users;

    public function __construct()
    {
        $this->meetups = new MeetupModel();
        $this->participants = new ParticipantModel();
        $this->users = new UserModel();
    }

    public function index()
    {
        $search   = trim((string) $this->request->getGet('search'));
        $region   = trim((string) $this->request->getGet('region'));
        $level    = trim((string) $this->request->getGet('level'));
        $dateFrom = trim((string) $this->request->getGet('date_from'));
        $sort     = trim((string) $this->request->getGet('sort'));

        $builder = $this->meetups->builder();

        if ($search !== '') {
            $builder->groupStart()
                ->like('title', $search)
                ->orLike('spot', $search)
                ->orLike('region', $search)
                ->orLike('description', $search)
                ->groupEnd();
        }

        if ($region !== '') {
            $builder->where('region', $region);
        }

        if ($level !== '') {
            $builder->where('experience_level', $level);
        }

        if ($dateFrom !== '') {
            $builder->where('date >=', $dateFrom);
        }

        if ($sort === 'created_desc') {
            $builder->orderBy('created_at', 'DESC');
        } else {
            $builder->orderBy('date', 'ASC')->orderBy('time', 'ASC');
        }

        $rows = $builder->get()->getResultArray();

        return $this->ok($this->withComputedFields($rows));
    }

    public function filters()
    {
        // Für jede Abfrage eine frische Model-Instanz, damit sich select()/distinct()
        // nicht über den geteilten Query Builder gegenseitig beeinflussen.
        $regions = (new MeetupModel())
            ->select('region')
            ->distinct()
            ->orderBy('region', 'ASC')
            ->findAll();

        $levels = (new MeetupModel())
            ->select('experience_level')
            ->distinct()
            ->orderBy('experience_level', 'ASC')
            ->findAll();

        return $this->ok([
            'regions' => array_values(array_map(static fn ($row) => $row['region'], $regions)),
            'levels'  => array_values(array_map(static fn ($row) => $row['experience_level'], $levels)),
        ]);
    }

    public function show($id = null)
    {
        $meetup = $this->meetups->find((int) $id);

        if (!$meetup) {
            return $this->failNotFoundMessage('Flugtreffen nicht gefunden');
        }

        $meetup = $this->withComputedFields([$meetup])[0];
        $meetup['participants'] = $this->participants
            ->where('meetup_id', (int) $id)
            ->orderBy('pilot_name', 'ASC')
            ->findAll();

        foreach ($meetup['participants'] as &$participant) {
            $participant['id'] = (int) $participant['id'];
            $participant['meetup_id'] = (int) $participant['meetup_id'];
            $participant['user_id'] = $participant['user_id'] !== null ? (int) $participant['user_id'] : null;
        }

        return $this->ok($meetup);
    }

    public function create()
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        $payload = $this->request->getJSON(true);

        if (!$payload) {
            $payload = $this->request->getPost();
        }

        $data = [
            'creator_user_id'  => (int) $user['id'],
            'title'            => trim((string) ($payload['title'] ?? '')),
            'spot'             => trim((string) ($payload['spot'] ?? '')),
            'region'           => trim((string) ($payload['region'] ?? '')),
            'date'             => $payload['date'] ?? '',
            'time'             => $payload['time'] ?? '',
            'experience_level' => trim((string) ($payload['experience_level'] ?? '')),
            'max_participants' => (int) ($payload['max_participants'] ?? 0),
            'description'      => trim((string) ($payload['description'] ?? '')),
            'status'           => 'offen',
        ];

        $newId = $this->meetups->insert($data, true);

        if (!$newId) {
            return $this->failValidation($this->meetups->errors());
        }

        $created = $this->withComputedFields([$this->meetups->find($newId)])[0];

        return $this->ok($created, 'Flugtreffen wurde erstellt', 201);
    }

    public function update($id = null)
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        $meetup = $this->meetups->find((int) $id);
        if (!$meetup) {
            return $this->failNotFoundMessage('Flugtreffen nicht gefunden');
        }

        if (!$this->isCreator($meetup, (int) $user['id'])) {
            return $this->failForbidden('Nur der Ersteller kann dieses Flugtreffen bearbeiten.');
        }

        $payload = $this->jsonPayload();

        $data = [
            'title'            => trim((string) ($payload['title'] ?? $meetup['title'])),
            'spot'             => trim((string) ($payload['spot'] ?? $meetup['spot'])),
            'region'           => trim((string) ($payload['region'] ?? $meetup['region'])),
            'date'             => $payload['date'] ?? $meetup['date'],
            'time'             => $payload['time'] ?? $meetup['time'],
            'experience_level' => trim((string) ($payload['experience_level'] ?? $meetup['experience_level'])),
            'max_participants' => (int) ($payload['max_participants'] ?? $meetup['max_participants']),
            'description'      => trim((string) ($payload['description'] ?? $meetup['description'])),
        ];

        if (!$this->meetups->update((int) $id, $data)) {
            return $this->failValidation($this->meetups->errors());
        }

        return $this->show($id);
    }

    public function delete($id = null)
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        $meetup = $this->meetups->find((int) $id);
        if (!$meetup) {
            return $this->failNotFoundMessage('Flugtreffen nicht gefunden');
        }

        if (!$this->isCreator($meetup, (int) $user['id'])) {
            return $this->failForbidden('Nur der Ersteller kann dieses Flugtreffen löschen.');
        }

        $this->meetups->delete((int) $id);

        return $this->ok(null, 'Flugtreffen wurde gelöscht');
    }

    public function join($id = null)
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        $pilotName = $user['display_name'];

        $meetup = $this->meetups->find((int) $id);
        if (!$meetup) {
            return $this->failNotFoundMessage('Flugtreffen nicht gefunden');
        }

        $existing = $this->participants
            ->where('meetup_id', (int) $id)
            ->where('user_id', (int) $user['id'])
            ->first();

        if ($existing) {
            return $this->show($id);
        }

        $count = $this->participants->where('meetup_id', (int) $id)->countAllResults();
        if ($count >= (int) $meetup['max_participants']) {
            $this->meetups->update((int) $id, ['status' => 'voll']);
            return $this->respond([
                'success' => false,
                'message' => 'Dieses Flugtreffen ist bereits voll.',
            ], 409);
        }

        $this->participants->insert([
            'meetup_id'  => (int) $id,
            'user_id'    => (int) $user['id'],
            'pilot_name' => $pilotName,
        ]);

        $this->updateStatus((int) $id);

        return $this->show($id);
    }

    public function leave($id = null)
    {
        $user = $this->requireUser();
        if (!$user) {
            return $this->failUnauthorized();
        }

        $meetup = $this->meetups->find((int) $id);
        if (!$meetup) {
            return $this->failNotFoundMessage('Flugtreffen nicht gefunden');
        }

        $participant = $this->participants
            ->where('meetup_id', (int) $id)
            ->where('user_id', (int) $user['id'])
            ->first();

        if ($participant) {
            $this->participants->delete($participant['id']);
        }

        $this->updateStatus((int) $id);

        return $this->show($id);
    }

    private function updateStatus(int $meetupId): void
    {
        $meetup = $this->meetups->find($meetupId);
        if (!$meetup) {
            return;
        }

        $count = $this->participants->where('meetup_id', $meetupId)->countAllResults();
        $this->meetups->update($meetupId, [
            'status' => $count >= (int) $meetup['max_participants'] ? 'voll' : 'offen',
        ]);
    }

    private function withComputedFields(array $meetups): array
    {
        $currentUser = $this->currentUser();

        foreach ($meetups as &$meetup) {
            $participants = $this->participants
                ->where('meetup_id', (int) $meetup['id'])
                ->orderBy('pilot_name', 'ASC')
                ->findAll();

            foreach ($participants as &$participant) {
                $participant['id'] = (int) $participant['id'];
                $participant['meetup_id'] = (int) $participant['meetup_id'];
                $participant['user_id'] = ($participant['user_id'] ?? null) !== null ? (int) $participant['user_id'] : null;
            }

            $max = (int) $meetup['max_participants'];
            $count = count($participants);
            $creator = ($meetup['creator_user_id'] ?? null) !== null
                ? $this->users->find((int) $meetup['creator_user_id'])
                : null;

            $meetup['id'] = (int) $meetup['id'];
            $meetup['creator_user_id'] = ($meetup['creator_user_id'] ?? null) !== null ? (int) $meetup['creator_user_id'] : null;
            $meetup['creator_display_name'] = $creator['display_name'] ?? 'Unbekannt';
            $meetup['max_participants'] = (int) $meetup['max_participants'];
            $meetup['participant_count'] = $count;
            $meetup['participants'] = $participants;
            $meetup['free_places'] = max(0, $max - $count);
            $meetup['status'] = $count >= $max ? 'voll' : 'offen';
            $meetup['can_manage'] = $currentUser !== null && $this->isCreator($meetup, (int) $currentUser['id']);
        }

        return $meetups;
    }

    private function isCreator(array $meetup, int $userId): bool
    {
        return isset($meetup['creator_user_id']) && (int) $meetup['creator_user_id'] === $userId;
    }
}
