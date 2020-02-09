<?php
require "vendor/autoload.php";

use App\Application;
use \Bramus\Router\Router;

define('APP_PATH', __DIR__);
define('ROOT_PATH', __DIR__.'/../');

$router = new Router();

$router->setNamespace('\App');
$router->get('/', 'Application@run');
$router->get('/get-config-data', 'Application@getConfig');
$router->post('/get-logs', 'Application@getLogs');
$router->post('/clear-logs', 'Application@clearLogs');
$router->get('/class-map', 'Application@createClassMap');


$router->run();
