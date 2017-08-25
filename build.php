<?php

if (empty($argv[1])) {
    die('Usage: build.php [VERSION NUMBER]');
}

$version = trim($argv[1]);

print "Building version: \033[0;32m{$version}\033[0m" . PHP_EOL;

foreach (['clic', 'pentins'] as $app) {
    print "-- {$app}@{$version}" . PHP_EOL;
    shell_exec('php create-config.php ' . $version);
    shell_exec('php switch-config.php '.$app);
    shell_exec('zip -r '.$app.'-'.$version.'.zip www');
}
