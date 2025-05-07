<?php
session_start();
$gebruikersnaam = $_SESSION['gebruikersnaam'] ?? 'onbekend';

$batterij = $_POST['batterij'] ?? '';
$modus = $_POST['modus'] ?? '';

$xmlBestand = 'gebruikers.xml';

if (!file_exists($xmlBestand)) {
    $basisXML = new DOMDocument('1.0', 'UTF-8');
    $basisXML->formatOutput = true;
    $gebruikersElement = $basisXML->createElement('gebruikers');
    $basisXML->appendChild($gebruikersElement);
    $basisXML->save($xmlBestand);
}

$doc = new DOMDocument();
$doc->preserveWhiteSpace = false;
$doc->formatOutput = true;
$doc->load($xmlBestand);

$gebruikers = $doc->getElementsByTagName('gebruiker');
$gebruikerNode = null;

foreach ($gebruikers as $gebruiker) {
    if ($gebruiker->getAttribute('naam') === $gebruikersnaam) {
        $gebruikerNode = $gebruiker;
        break;
    }
}

if (!$gebruikerNode) {
    $gebruikerNode = $doc->createElement('gebruiker');
    $gebruikerNode->setAttribute('naam', $gebruikersnaam);
    $doc->documentElement->appendChild($gebruikerNode);
}

$feedback = $doc->createElement('feedback');
$feedback->appendChild($doc->createElement('batterij', htmlspecialchars($batterij)));
$feedback->appendChild($doc->createElement('modus', htmlspecialchars($modus)));

$gebruikerNode->appendChild($feedback);

$doc->save($xmlBestand);

// Stuur eenvoudige tekst terug als bevestiging
echo "OK";
