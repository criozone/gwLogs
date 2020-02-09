<?php
namespace App;

use \Bramus\Router\Router;
use App\LogReader;
use App\Logger;

class Application
{
    protected $config;
    protected $reader;
    protected $logger;

    public function __construct()
    {
        $this->config = json_decode(file_get_contents(ROOT_PATH . DIRECTORY_SEPARATOR . 'config.json'), true);
        $this->reader = new LogReader();
        $pgClasses = require (ROOT_PATH . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'pg_classes.php');
        $this->reader->setClasses($pgClasses);
        $this->logger = new Logger($this->config);
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
        echo file_get_contents(realpath(ROOT_PATH . DIRECTORY_SEPARATOR . 'index.html'));
    }

    public function getConfig() {
        $this->jsonResponse([
            'files' => array_column($this->config['logFiles'], 'id')
        ]);
    }

    public function getLogs() {
        $this->logger->info("Incoming 'get-logs' request");
        $filesToScan = json_decode(file_get_contents('php://input'));
        if (!is_array($filesToScan) || empty($filesToScan)) {
            $this->jsonResponse([
                "result" => false,
                "errorData" => [
                    "errorCode" => 1111,
                    "errorMsg" => "Empty request data."
                ]
            ]);
        }
        $retData = [];
        foreach ($this->config['logFiles'] as $fConfig) {
            $this->logger->info($fConfig['id']);
            if (in_array($fConfig['id'], $filesToScan)) {
                $this->reader->read($retData, $fConfig);
            }
        }
        usort($retData, function($a, $b) {

        });
        $this->jsonResponse($retData);
    }

    public function clearLogs() {
        $filesToClear = json_decode(file_get_contents('php://input'));
        $clearedFiles = [];
        foreach ($this->config['logFiles'] as $fileData) {
            if (!in_array($fileData['id'], $filesToClear)) {
                continue;
            }
            try{
                //file_put_contents($fileData['path'], '');
            } catch (\Exception $e) {
                // log error and continue;
                continue;
            }
            array_push($clearedFiles, $fileData['id']);
        }
        $this->jsonResponse($clearedFiles);
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