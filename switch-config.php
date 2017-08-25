<?php

if (empty($argv[1])) {
    die('Usage: switch-config.php [Theme]');
}

$theme = trim($argv[1]);

file_put_contents('www/config.xml', file_get_contents('configs/'.$theme.'/config.xml'));
shell_exec('cp configs/'.$theme.'/index.html www/index.html');
shell_exec('cp configs/'.$theme.'/css/main.css www/css/main.min.css');
shell_exec('cp -R configs/'.$theme.'/img www/');
shell_exec('cp -R configs/'.$theme.'/res www/');
