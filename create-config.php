<?php

$baseConfig = file_get_contents('base-config.xml');

if (empty($argv[1])) {
    die('Usage: create-config.php [VERSION NUMBER]');
}

$version = trim($argv[1]);

$apps = [];

$apps['clic'] = [
    'NAMESPACE' => 'com.centu.clicbookkeeping',
    'NAME' => 'CLIC',
    'DESCRIPTION' => 'CLIC Bookkeeping',
    'URL' => 'http://clic.newsoftdemo.info/',
    'THEME' => 'clic',
    'VERSION' => $version,
];

$apps['pentins'] = [
    'NAMESPACE' => 'com.centu.pentins',
    'NAME' => 'Pentins',
    'DESCRIPTION' => 'Pentins Bookkeeping',
    'URL' => 'https://app.pentins.co.uk/',
    'THEME' => 'pentins',
    'VERSION' => $version,
];

foreach ($apps as $appKey => $app) {
    $config = $baseConfig;

    foreach ($app as $key => $replace) {
        $config = str_replace('{' . $key . '}', $replace, $config);
    }

    file_put_contents('configs/' . $appKey . '/config.xml', $config);
}
