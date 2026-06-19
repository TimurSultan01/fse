<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->get('api/test', 'Api\Test::index');

// API routes for React frontend
$routes->group('api', ['namespace' => 'App\Controllers\Api'], static function ($routes) {
    $routes->get('meetups', 'MeetupsController::index');
    $routes->get('meetups/filters', 'MeetupsController::filters');
    $routes->get('meetups/(:num)', 'MeetupsController::show/$1');
    $routes->post('meetups', 'MeetupsController::create');
    $routes->put('meetups/(:num)', 'MeetupsController::update/$1');
    $routes->delete('meetups/(:num)', 'MeetupsController::delete/$1');
    $routes->post('meetups/(:num)/join', 'MeetupsController::join/$1');
    $routes->post('meetups/(:num)/leave', 'MeetupsController::leave/$1');

    $routes->get('groups', 'GroupsController::index');
    $routes->get('groups/(:num)', 'GroupsController::show/$1');
    $routes->post('groups', 'GroupsController::create');
    $routes->post('groups/(:num)/join', 'GroupsController::join/$1');
    $routes->post('groups/(:num)/leave', 'GroupsController::leave/$1');

    $routes->get('messages', 'MessagesController::index');
    $routes->post('messages', 'MessagesController::create');
    $routes->delete('messages/(:num)', 'MessagesController::delete/$1');
});