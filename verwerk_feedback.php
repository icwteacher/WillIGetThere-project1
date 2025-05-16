<?php
session_start();
$gebruikersnaam = $_SESSION['gebruikersnaam'] ?? 'onbekend';

$batterij = $_POST['batterij'] ?? '';
$tevredenheid = $_POST['tevredenheid'] ?? '';
$opmerkingen = $_POST['opmerkingen'] ?? '';

// Pad naar XML-bestand
$xmlBestand = 'gebruikers.xml';

// Laad of maak XML-bestand
$doc = new DOMDocument();
$doc->preserveWhiteSpace = false;
$doc->formatOutput = true;

if (!file_exists($xmlBestand)) {
    // Als het nog niet bestaat, maak het aan
    $root = $doc->createElement('gebruikers');
    $doc->appendChild($root);
    $doc->save($xmlBestand);
} else {
    $doc->load($xmlBestand);
}

// Zoek de juiste gebruiker
$gebruikers = $doc->getElementsByTagName('gebruiker');
$gebruikerNode = null;

foreach ($gebruikers as $gebruiker) {
    if ($gebruiker->hasAttribute('naam') && $gebruiker->getAttribute('naam') === $gebruikersnaam) {
        $gebruikerNode = $gebruiker;
        break;
    }
}

// Als gebruiker nog niet bestaat, maak hem aan
if (!$gebruikerNode) {
    $gebruikerNode = $doc->createElement('gebruiker');
    $gebruikerNode->setAttribute('naam', $gebruikersnaam);
    $doc->documentElement->appendChild($gebruikerNode);
}

// Eventueel: bestaande waarden uitlezen
$batterijOpEindeWaarde = '';
$spelingWaarde = '';
foreach ($gebruikerNode->childNodes as $child) {
    if ($child->nodeName === 'batterijOpEinde') {
        $batterijOpEindeWaarde = $child->nodeValue;
    }
    if ($child->nodeName === 'speling') {
        $spelingWaarde = $child->nodeValue;
    }
}


// Feedback aanmaken
$feedback = $doc->createElement('feedback');
$feedback->appendChild($doc->createElement('batterij', htmlspecialchars($batterij)));
$feedback->appendChild($doc->createElement('tevredenheid', htmlspecialchars($tevredenheid)));
$feedback->appendChild($doc->createElement('opmerkingen', htmlspecialchars($opmerkingen)));

$gebruikerNode->appendChild($feedback);
$speling = '';
if (is_numeric($batterij) && is_numeric($batterijOpEindeWaarde)) {
    $speling = floatval($batterij) - floatval($batterijOpEindeWaarde);
}
$feedback->appendChild($doc->createElement('speling', htmlspecialchars($speling)));

// Sla XML op
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

    <p><strong>Batterij op einde:</strong> <?php echo htmlspecialchars($batterijOpEindeWaarde); ?></p>
    <p><strong>Feedback - Batterij:</strong> <?php echo htmlspecialchars($batterij); ?></p>
    <p><strong>Speling:</strong> <?php echo htmlspecialchars($speling); ?></p>


    <a href="ElektrischeFiets.php">Terug naar website</a>
  </div>
</body>
</html>
