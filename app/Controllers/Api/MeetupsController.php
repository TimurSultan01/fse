<?php

namespace App\Controllers\Api;

use App\Models\MeetupModel;
use App\Models\ParticipantModel;

class MeetupsController extends BaseApiController
{
    private MeetupModel $meetups;
    private ParticipantModel $participants;

    public function __construct()
    {
        $this->meetups = new MeetupModel();
        $this->participants = new ParticipantModel();
    }

    public function index()
    {
        $search = trim((string) $this->request->getGet('search'));
        $region = trim((string) $this->request->getGet('region'));
        $level  = trim((string) $this->request->getGet('level'));

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

        $rows = $builder
            ->orderBy('date', 'ASC')
            ->orderBy('time', 'ASC')
            ->get()
            ->getResultArray();

        return $this->ok($this->withComputedFields($rows));
    }

    public function show($id = null)
    {
        $meetup = $this->meetups->find($id);

        if (!$meetup) {
            return $this->failNotFoundMessage('Flugtreffen nicht gefunden');
        }

        $meetup = $this->withComputedFields([$meetup])[0];
        $meetup['participants'] = $this->participants
            ->where('meetup_id', $id)
            ->orderBy('pilot_name', 'ASC')
            ->findAll();

        return $this->ok($meetup);
    }

    public function create()
    {
        $payload = $this->request->getJSON(true) ?? $this->request->getPost();

        $data = [
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

        if (!$this->meetups->insert($data)) {
            return $this->failValidation($this->meetups->errors());
        }

        return $this->ok($this->meetups->find($this->meetups->getInsertID()), 'Flugtreffen wurde erstellt', 201);
    }

    public function join($id = null)
    {
        $payload = $this->request->getJSON(true) ?? [];
        $pilotName = trim((string) ($payload['pilot_name'] ?? 'Gastpilot'));

        $meetup = $this->meetups->find($id);
        if (!$meetup) {
            return $this->failNotFoundMessage('Flugtreffen nicht gefunden');
        }

        $count = $this->participants->where('meetup_id', $id)->countAllResults();
        if ($count >= (int) $meetup['max_participants']) {
            $this->meetups->update($id, ['status' => 'voll']);
            return $this->respond([
                'success' => false,
                'message' => 'Dieses Flugtreffen ist bereits voll.',
            ], 409);
        }

        $existing = $this->participants
            ->where('meetup_id', $id)
            ->where('pilot_name', $pilotName)
            ->first();

        if (!$existing) {
            $this->participants->insert([
                'meetup_id'  => $id,
                'pilot_name' => $pilotName,
            ]);
        }

        $newCount = $this->participants->where('meetup_id', $id)->countAllResults();
        $this->meetups->update($id, [
            'status' => $newCount >= (int) $meetup['max_participants'] ? 'voll' : 'offen',
        ]);

        return $this->show($id);
    }

    public function leave($id = null)
    {
        $payload = $this->request->getJSON(true) ?? [];
        $pilotName = trim((string) ($payload['pilot_name'] ?? 'Gastpilot'));

        $meetup = $this->meetups->find($id);
        if (!$meetup) {
            return $this->failNotFoundMessage('Flugtreffen nicht gefunden');
        }

        $participant = $this->participants
            ->where('meetup_id', $id)
            ->where('pilot_name', $pilotName)
            ->first();

        if ($participant) {
            $this->participants->delete($participant['id']);
        }

        $this->meetups->update($id, ['status' => 'offen']);

        return $this->show($id);
    }

    private function withComputedFields(array $meetups): array
    {
        foreach ($meetups as &$meetup) {
            $count = $this->participants
                ->where('meetup_id', $meetup['id'])
                ->countAllResults();

            $max = (int) $meetup['max_participants'];
            $meetup['participant_count'] = $count;
            $meetup['free_places'] = max(0, $max - $count);
            $meetup['status'] = $count >= $max ? 'voll' : ($meetup['status'] ?? 'offen');
        }

        return $meetups;
    }
}
