<?php
session_start();
$gebruikersnaam = $_SESSION['gebruikersnaam'] ?? 'onbekend';

$batterij = $_POST['batterij'] ?? '';
$tevredenheid = $_POST['tevredenheid'] ?? '';
$opmerkingen = $_POST['opmerkingen'] ?? '';

// Pad naar XML-bestand
$xmlBestand = 'gebruikers.xml';

// Als het XML-bestand niet bestaat, maak een basisstructuur aan
if (!file_exists($xmlBestand)) {
    $basisXML = new DOMDocument('1.0', 'UTF-8');
    $basisXML->formatOutput = true;
    $gebruikersElement = $basisXML->createElement('gebruikers');
    $basisXML->appendChild($gebruikersElement);
    $basisXML->save($xmlBestand);
}

// Laad het bestaande XML-document
$doc = new DOMDocument();
$doc->preserveWhiteSpace = false;
$doc->formatOutput = true;
$doc->load($xmlBestand);

// Zoek of de gebruiker al bestaat
$gebruikers = $doc->getElementsByTagName('gebruiker');
$gebruikerNode = null;

foreach ($gebruikers as $gebruiker) {
    if ($gebruiker->getAttribute('naam') === $gebruikersnaam) {
        $gebruikerNode = $gebruiker;
        break;
    }
}

// Als gebruiker nog niet bestaat, voeg toe
if (!$gebruikerNode) {
    $gebruikerNode = $doc->createElement('gebruiker');
    $gebruikerNode->setAttribute('naam', $gebruikersnaam);
    $doc->documentElement->appendChild($gebruikerNode);
}

// Maak nieuw feedback-element aan
$feedback = $doc->createElement('feedback');

$batterijElem = $doc->createElement('batterij', htmlspecialchars($batterij));
$tevredenElem = $doc->createElement('tevredenheid', htmlspecialchars($tevredenheid));
$opmerkingElem = $doc->createElement('opmerkingen', htmlspecialchars($opmerkingen));

$feedback->appendChild($batterijElem);
$feedback->appendChild($tevredenElem);
$feedback->appendChild($opmerkingElem);

$gebruikerNode->appendChild($feedback);

// Sla op met inspringing en nieuwe lijnen
$doc->save($xmlBestand);
?>

<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formulier ingevuld</title>
  <link rel="icon" type="image/x-jpg" href="logo.jpg">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="hoofding">
    <img src="logo.jpg" alt="Sila Westerlo logo" class="logo">
    <div class="titel"><h1>Formulier ingediend</h1></div><br>
    <div style="position: absolute; top: 34px; right: 120px; color: white; font-weight: bold;">
      <?php echo htmlspecialchars($gebruikersnaam); ?>
    </div>
  </div>
  <div style="margin: 20px;">
    <p>Bedankt! Feedback opgeslagen!</p>
    <a href="ElektrischeFiets.php">Terug naar website</a>
  </div>
</body>
</html>
