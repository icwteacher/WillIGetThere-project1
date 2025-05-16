<?php
session_start();
$gebruikersnaam = $_SESSION['gebruikersnaam'] ?? 'Gast';

// Probeer batterijOpEinde op te halen uit XML
$batterijWaarde = '';
$xmlBestand = 'gebruikers.xml';

if (file_exists($xmlBestand)) {
    $doc = new DOMDocument();
    $doc->load($xmlBestand);

    foreach ($doc->getElementsByTagName('gebruiker') as $gebruiker) {
        if ($gebruiker->getAttribute('naam') === $gebruikersnaam) {
            $batt = $gebruiker->getElementsByTagName('batterijOpEinde');
            if ($batt->length > 0) {
                $batterijWaarde = htmlspecialchars($batt->item(0)->nodeValue);
            }
            break;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Will I get there - Feedback</title>
  <link rel="icon" type="image/x-jpg" href="logo.jpg">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="hoofding">
    <img src="logo.jpg" alt="Sila Westerlo logo" class="logo">
    <div class="titel"><h1>Feedback formulier</h1></div>
    <div style="position: absolute; top: 15px; right: 120px; color: white; font-weight: bold;">
      <?php echo htmlspecialchars($gebruikersnaam); ?>
    </div>
  </div>

  <form style="margin:20px;" action="verwerk_feedback.php" method="post">
    <label for="batterij">Batterij op einde (in %):<sup>*</sup></label>
    <input type="number" id="batterij" name="batterij" min="0" max="100" required
           value="<?php echo $batterijWaarde; ?>"><br><br>

    <label>Ben je tevreden?<sup>*</sup></label>
    <select name="tevredenheid" required>
      <option value="">-- Kies antwoord --</option>
      <option value="ja">Ja</option>
      <option value="nee">Nee</option>
      <option value="deels">Deels</option>
    </select><br><br>

    <label>Opmerkingen:</label><br>
    <textarea name="opmerkingen" rows="5" cols="50"></textarea><br><br>

    <input type="submit" value="Versturen" class="formulier">
  </form>
</body>
</html>
