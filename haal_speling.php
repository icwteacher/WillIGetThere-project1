<?php
$gebruikersnaam = $_GET['gebruiker'] ?? '';
$type = $_GET['type'] ?? 'laatste';

$xmlBestand = 'gebruikers.xml';
if (!file_exists($xmlBestand) || empty($gebruikersnaam)) {
    http_response_code(400);
    echo '0';
    exit;
}

$doc = new DOMDocument();
$doc->load($xmlBestand);
$gebruikers = $doc->getElementsByTagName('gebruiker');

$spelingen = [];

foreach ($gebruikers as $gebruiker) {
    if ($gebruiker->getAttribute('naam') === $gebruikersnaam) {
        foreach ($gebruiker->getElementsByTagName('feedback') as $feedback) {
            $spelingNode = $feedback->getElementsByTagName('speling')->item(0);
            if ($spelingNode) {
                $waarde = floatval($spelingNode->nodeValue);
                $spelingen[] = $waarde;
            }
        }
        break;
    }
}

if (empty($spelingen)) {
    echo '0';
    exit;
}

if ($type === 'gemiddelde') {
    $gemiddelde = array_sum($spelingen) / count($spelingen);
    $geclamped = max(0.5, min(1.5, $gemiddelde)); // ✅ begrens tussen 0.5 en 1.5
    echo round($geclamped, 2);
} else {
    $laatste = end($spelingen);
    $geclamped = max(0.5, min(1.5, $laatste)); // ✅ ook hier begrens
    echo round($geclamped, 2);
}
?>
