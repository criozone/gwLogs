<?php


namespace App;


class Logger
{
    protected $logFile;

    public function __construct($appConfig)
    {
        $this->logFile = $appConfig['logger']['fileName'];
    }

    public function info($str) {
        $logStr = (new \DateTime('now'))->format("d-m-Y H:i:s:u");
        $logStr .= ' INFO: ' . $str . PHP_EOL;
        file_put_contents($this->logFile, $logStr, FILE_APPEND);
    }

    public function error($str) {
        $logStr = (new \DateTime('now'))->format("d-m-Y H:i:s:u");
        $logStr .= ' ERROR: ' . $str . PHP_EOL;
        file_put_contents($this->logFile, $logStr, FILE_APPEND);
    }

}