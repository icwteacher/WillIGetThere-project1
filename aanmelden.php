<?php
session_start();
ob_start();

$bestand = __DIR__ . '/gebruikers.xml';

if (!file_exists($bestand)) {
    $xml = new SimpleXMLElement('<gebruikers></gebruikers>');
    $xml->asXML($bestand);
}

$xml = simplexml_load_file($bestand);

$actie = $_POST['actie'] ?? '';
$gebruikersnaam = $_POST['gebruikersnaam'] ?? '';
$wachtwoord = $_POST['wachtwoord'] ?? '';

$gevonden = null;
foreach ($xml->gebruiker as $gebruiker) {
    if ((string)$gebruiker->gebruikersnaam === $gebruikersnaam) {
        $gevonden = $gebruiker;
        break;
    }
}

if ($actie === 'inloggen') {
    if ($gevonden && password_verify($wachtwoord, (string)$gevonden->wachtwoord)) {
        $_SESSION['gebruikersnaam'] = (string)$gevonden->gebruikersnaam;
        header("Location: ElektrischeFiets.php");
        exit;
    } else {
        $bericht = "Fout: gebruikersnaam of wachtwoord is onjuist.";
    }
} elseif ($actie === 'registreren') {
    // Eerst ophalen vóór controle op $gevonden
    $naam = $_POST['naam'] ?? '';
    $email = $_POST['email'] ?? '';
    $telefoon = $_POST['telefoon'] ?? '';

    if ($gevonden) {
        // Nu zijn naam, email, telefoon WEL beschikbaar
        $query = http_build_query([
            'fout' => 'Gebruikersnaam bestaat al!',
            'actie' => 'registreren',
            'naam' => $naam,
            'email' => $email,
            'telefoon' => $telefoon,
            
            'gebruikersnaam' => $gebruikersnaam
        ]);
        header("Location: index.html?$query");
        exit;
    } else {
        // Registratie uitvoeren
        $gebruiker = $xml->addChild('gebruiker');
        $gebruiker->addChild('naam', $naam);
        $gebruiker->addChild('email', $email);
        $gebruiker->addChild('telefoon', $telefoon);
        $gebruiker->addChild('gebruikersnaam', $gebruikersnaam);
        $gebruiker->addChild('wachtwoord', password_hash($wachtwoord, PASSWORD_DEFAULT));

        $dom = new DOMDocument('1.0');
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;
        $dom->loadXML($xml->asXML());
        $dom->save($bestand);

        header("Location: index.html?gebruikersnaam=" . urlencode($gebruikersnaam));
        exit;
    }
} else {
    $bericht = "Ongeldige actie.";
}

echo <<<HTML
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

</body>
</html>
HTML;

ob_end_flush();
?>
