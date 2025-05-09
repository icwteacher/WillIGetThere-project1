<?php
$id = $_GET['id'] ?? 'default';
$xmlFile = 'gebruiker.xml';

if (!file_exists($xmlFile)) {
    echo json_encode(["correctie" => 0]);
    exit;
}

$xml = simplexml_load_file($xmlFile);
foreach ($xml->gebruiker as $g) {
    if ((string)$g['id'] === $id) {
        echo json_encode(["correctie" => (float)$g->correctie]);
        exit;
    }
}

echo json_encode(["correctie" => 0]);
?>
