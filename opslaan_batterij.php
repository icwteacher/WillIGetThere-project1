<?php
session_start();
$gebruikersnaam = $_SESSION['gebruikersnaam'] ?? 'onbekend';

$batterijOpEinde = $_POST["waarde"] ?? null;
$speling = $_POST["speling"] ?? null;

if ($_SERVER["REQUEST_METHOD"] === "POST" && $batterijOpEinde !== null && $speling !== null) {
    $bestand = 'gebruikers.xml';

    // Laad of maak XML
    if (!file_exists($bestand)) {
        $xml = new SimpleXMLElement('<gebruikers></gebruikers>');
    } else {
        $xml = simplexml_load_file($bestand);
    }

    // Zoek bestaande gebruiker
    $gebruiker = null;
    foreach ($xml->gebruiker as $g) {
        if ((string)$g['naam'] === $gebruikersnaam) {
            $gebruiker = $g;
            break;
        }
    }

    // Als niet gevonden, maak nieuwe aan
    if ($gebruiker === null) {
        $gebruiker = $xml->addChild('gebruiker');
        $gebruiker->addAttribute('naam', $gebruikersnaam);
    }

    // Voeg batterijgegevens toe
    $gebruiker->addChild('batterijOpEinde', $batterijOpEinde);
    $gebruiker->addChild('speling', $speling);

    // Opslaan
    $xml->asXML($bestand);
    echo "Data opgeslagen.";
} else {
    echo "Ongeldige gegevens ontvangen.";
}
?>
