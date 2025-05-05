<?php
ob_start();

$bestand = __DIR__ . '/gebruikers.xml';

// Bestaat XML nog niet? Maak leeg document aan
if (!file_exists($bestand)) {
    $xml = new SimpleXMLElement('<gebruikers></gebruikers>');
    $xml->asXML($bestand);
}

$xml = simplexml_load_file($bestand);

// Gegevens uit formulier
$actie = $_POST['actie'] ?? '';
$gebruikersnaam = $_POST['gebruikersnaam'] ?? '';
$wachtwoord = $_POST['wachtwoord'] ?? '';

// Zoek gebruiker
$gevonden = null;
foreach ($xml->gebruiker as $gebruiker) {
    if ((string)$gebruiker->gebruikersnaam === $gebruikersnaam) {
        $gevonden = $gebruiker;
        break;
    }
}

if ($actie === 'inloggen') {
    if ($gevonden && password_verify($wachtwoord, (string)$gevonden->wachtwoord)) {
        // Redirect naar ElektrischeFiets.html
        header("Location: ElektrischeFiets.html");
        exit;
    } else {
        $bericht = "Fout: gebruikersnaam of wachtwoord is onjuist.";
    }
} elseif ($actie === 'registreren') {
    if ($gevonden) {
        $bericht = "Gebruikersnaam bestaat al!";
    } else {
        $naam = $_POST['naam'] ?? '';
        $email = $_POST['email'] ?? '';
        $telefoon = $_POST['telefoon'] ?? '';

        // Voeg gebruiker toe
        $gebruiker = $xml->addChild('gebruiker');
        $gebruiker->addChild('naam', $naam);
        $gebruiker->addChild('email', $email);
        $gebruiker->addChild('telefoon', $telefoon);
        $gebruiker->addChild('gebruikersnaam', $gebruikersnaam);
        $gebruiker->addChild('wachtwoord', password_hash($wachtwoord, PASSWORD_DEFAULT));

        // Sla XML netjes op met enters
        $dom = new DOMDocument('1.0');
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;
        $dom->loadXML($xml->asXML());
        $dom->save($bestand);

        $bericht = "Registratie succesvol! Je kunt nu inloggen.";
    }
} else {
    $bericht = "Ongeldige actie.";
}

// Uitvoer
echo <<<HTML
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <title>Resultaat</title>
    <link rel="icon" type="image/x-jpg" href="logo.jpg">
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <div class="hoofding">
    <img src="logo.jpg" alt="Sila Westerlo logo" class="logo">
    <div class="titel"><h1>Resultaat</h1></div>
  </div>
        <p>{$bericht}</p>
        <a href='index.html'>Terug naar formulier</a>
    </div>
</body>
</html>
HTML;

ob_end_flush();
?>
