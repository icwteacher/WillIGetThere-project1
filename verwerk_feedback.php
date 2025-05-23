<?php
session_start();
$gebruikersnaam = $_SESSION['gebruikersnaam'] ?? 'onbekend';

$batterij = $_POST['batterij'] ?? '';
$tevredenheid = $_POST['tevredenheid'] ?? '';
$opmerkingen = $_POST['opmerkingen'] ?? '';

// Bestandspad
$xmlBestand = 'gebruikers.xml';

// Laad of maak XML-bestand
$doc = new DOMDocument();
$doc->preserveWhiteSpace = false;
$doc->formatOutput = true;

if (!file_exists($xmlBestand)) {
    $root = $doc->createElement('gebruikers');
    $doc->appendChild($root);
    $doc->save($xmlBestand);
} else {
    $doc->load($xmlBestand);
}

// Zoek of maak gebruiker
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

// Zoek eerdere voorspelling (batterijOpEinde)
$batterijOpEindeWaarde = '';
foreach ($gebruikerNode->childNodes as $child) {
    if ($child->nodeName === 'batterijOpEinde') {
        $batterijOpEindeWaarde = $child->nodeValue;
    }
}

// Bereken speling
$speling = '';
if (is_numeric($batterij) && is_numeric($batterijOpEindeWaarde)) {
    $speling = floatval($batterij)/floatval($batterijOpEindeWaarde);
}

// Voeg feedback toe
$feedback = $doc->createElement('feedback');
$feedback->appendChild($doc->createElement('gemeten', htmlspecialchars($batterij)));
$feedback->appendChild($doc->createElement('tevredenheid', htmlspecialchars($tevredenheid)));
$feedback->appendChild($doc->createElement('opmerkingen', htmlspecialchars($opmerkingen)));
$feedback->appendChild($doc->createElement('speling', htmlspecialchars($speling)));

$gebruikerNode->appendChild($feedback);

// Opslaan
$doc->save($xmlBestand);
header("Location: ElektrischeFiets.php");
exit;
?>
