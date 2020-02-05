<?php


namespace App;


class LogReader
{
    protected $classNames = [];

    public function setClasses ($pgClasses) {
        $this->classNames = $pgClasses;
    }

    public function read(&$result, $config) {
        $result[$config['id']] = [];
        $tempObj = $this->objFactory();

        $myfile = fopen($config['path'], "r") or die("Unable to open file!");
        while(!feof($myfile)) {
            $tempStr = fgets($myfile);
            preg_match('/\[\w*\]/', $tempStr, $classNameMatches);

            // if is string starting with date
            if (preg_match('/^\d\d\-\w*\-\d\d\d\d\s*\d\d\:\d\d\:\d\d\s/', $tempStr, $matches)) {
                if (!$this->isEmptyObj($tempObj)) {
                    array_push($result[$config['id']], $tempObj);
                }
                $tempObj = $this->objFactory();
                $tempObj->time =  $matches[0];
                $tempObj->body .= $tempStr . '<br>';
            } else if (in_array(trim($classNameMatches[0], ' _'), $this->classNames)) {
                $tempObj->header = $tempStr;
            } else {
                $tempObj->body .= $tempStr;
            }
        }
        fclose($myfile);
    }

    private function objFactory() {
        $tempObj = new StdClass();
        $tempObj->time = '';
        $tempObj->header = '';
        $tempObj->body = '';
        return $tempObj;
    }

    private function isEmptyObj($obj) {
        foreach ($obj as $v) {
            if (!empty($v)) {
                return false;
            }
        }
        return true;
    }
}