<?php
ob_start(); // buffer om header-fouten te vermijden

$bestand = __DIR__ . '/gebruikers.xml';

// Als bestand niet bestaat, maak een nieuw XML-bestand aan
if (!file_exists($bestand)) {
    $xml = new SimpleXMLElement('<gebruikers></gebruikers>'); // Root element
    $xml->asXML($bestand);
}

$xml = simplexml_load_file($bestand);

// Verkrijg de form-gegevens
$actie = $_POST['actie'];
$gebruikersnaam = $_POST['gebruikersnaam'];
$wachtwoord = $_POST['wachtwoord'];

// Zoek naar gebruiker in XML
$gevonden = null;
foreach ($xml->gebruiker as $gebruiker) {
    if ((string)$gebruiker->gebruikersnaam === $gebruikersnaam) {
        $gevonden = $gebruiker;
        break;
    }
}

if ($actie === 'inloggen') {
    if ($gevonden && password_verify($wachtwoord, (string)$gevonden->wachtwoord)) {
        $bericht = "Welkom terug, " . htmlspecialchars((string)$gevonden->naam) . "!";
    } else {
        $bericht = "Fout: gebruikersnaam of wachtwoord is onjuist.";
    }
} elseif ($actie === 'registreren') {
    if ($gevonden) {
        $bericht = "Gebruikersnaam bestaat al!";
    } else {
        // Nieuwe gebruiker toevoegen aan XML
        $gebruiker = $xml->addChild('gebruiker');
        $gebruiker->addChild('naam', $_POST['naam']);
        $gebruiker->addChild('email', $_POST['email']);
        $gebruiker->addChild('telefoon', $_POST['telefoon']);
        $gebruiker->addChild('gebruikersnaam', $gebruikersnaam);
        $gebruiker->addChild('wachtwoord', password_hash($wachtwoord, PASSWORD_DEFAULT));

        // Opslaan van de wijzigingen in XML
        $xml->asXML($bestand);
        $bericht = "Registratie succesvol! Je kunt nu inloggen.";
    }
} else {
    $bericht = "Ongeldige actie.";
}

// Toon resultaat
echo "<h1>Resultaat</h1>";
echo "<p>" . htmlspecialchars($bericht) . "</p>";
echo "<a href='aanmelden.html'>Terug naar formulier</a>";

ob_end_flush();
?>
