<?php
namespace App;

use \Bramus\Router\Router;
use App\LogReader;

class Application
{
    protected $config;

    public function __construct()
    {
        $this->config = json_decode(file_get_contents(ROOT_PATH . DIRECTORY_SEPARATOR . 'config.json'), true);
        $this->reader = new LogReader();
        $pgClasses = require (ROOT_PATH . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'pg_classes.php');
        $this->reader->setClasses($pgClasses);
    }

    protected function jsonResponse($data) {
        if (headers_sent()) {
            http_response_code(500);
            exit();
        }
        header("Content-Type: application/json");
        echo json_encode($data);
    }

    public function run() {
        echo "App running";
    }

    public function getConfig() {
        $this->jsonResponse([
            'files' => array_column($this->config['logFiles'], 'id')
        ]);
    }

    public function getLogs() {
        $filesToScan = json_decode(file_get_contents('php://input'));
        $retData = [];
        foreach ($this->config['logFiles'] as $fConfig) {
            if (in_array($fConfig['id'], $filesToScan)) {
                $this->reader->read($retData, $fConfig);
            }
        }
        usort($retData, function($a, $b) {

        });
        $this->jsonResponse($retData);
    }

    public function clearLogs() {
        foreach ($this->config['logFiles'] as $fileData) {
            file_get_contents($fileData['path'], '');
        }
        $this->jsonResponse(["result" => true]);
    }

    public function createClassMap() {
        $result = [];
        $scenarioPath = realpath(ROOT_PATH . DIRECTORY_SEPARATOR . 'test_logs' . DIRECTORY_SEPARATOR . 'scenarios');
        $scenarioFiles = scandir($scenarioPath);

        $time_start = microtime(true);

        foreach ($scenarioFiles as $fileName) {
            if (!is_file($scenarioPath . DIRECTORY_SEPARATOR . $fileName)) continue;
            try {
                $parsed = parse_ini_file($scenarioPath . DIRECTORY_SEPARATOR . $fileName);
            } catch (\Exception $e) {
                // log exception
                continue;
            }
            if (empty($parsed)) continue;

            $this->getClasses($result, $parsed);
        }

        $time_end = microtime(true);
        $time = $time_end - $time_start;

        echo "Work time: " . $time . " sec<br>";
        echo "<pre>";
        print_r(json_encode($result));
        echo "</pre>";
    }

    private function getClasses(&$result, $input) {
        foreach ($input as $val) {
            if (is_array($val)) {
                $this->getClasses($result, $val);
            } else {
                $result = array_merge($result, $input);
                break;
            }
        }
        $result = array_unique($result);
    }
}