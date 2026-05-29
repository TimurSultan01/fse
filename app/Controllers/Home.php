<?php

namespace App\Controllers;

class Home extends BaseController
{
    public function index()
    {
        try {
            $db = \Config\Database::connect();

            if (! $db->connID) {
                $db->initialize();
            }

            $db->query('SELECT 1');

            $status = '✅ Datenbankverbindung erfolgreich';
        } catch (\Throwable $e) {
            $status = '❌ Datenbankfehler: ' . $e->getMessage();
        }

        return view('welcome_message', [
            'status' => $status,
        ]);
    }
}