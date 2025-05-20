<?php
session_start();
$gebruikersnaam = $_SESSION['gebruikersnaam'] ?? 'Gast';
?>
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Will I get there</title>
  <link rel="icon" type="image/x-jpg" href="logo.jpg">
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <link rel="stylesheet" href="style.css">
  <script>
  const gebruiker = <?php echo json_encode($gebruikersnaam); ?>;
</script>

</head>

<body>

  <div class="hoofding">
    <img src="logo.jpg" alt="Sila Westerlo logo" class="logo">
    <div class="titel"><h1>Kan je batterij het aan?</h1></div><br>
    <div style="position: absolute; top: 15px; right: 120px; color: white; font-weight: bold;"><br>
      <?php echo htmlspecialchars($gebruikersnaam); ?>
    </div>
    </div>
    <form action="uitloggen.php" method="post">
      <button class="uitloggen" class="formulier">Uitloggen</button>
    </form>
  </div>
  <form onsubmit="return getRouteAndFiveCoordinates(event)">

  <div class="container">
    <div class="image-container">
      <div id="map"></div>
    </div>
    <div class="text-container">
    <div class="input-row">
      <div class="input-group">
        <label for="batterijProcent">Batterij bij vertrek (in %):<sup>*</sup></label> 
        <input type="number" step="0.01" name="batterijProcent" id="batterijProcent" min="0" max="100" required>
      </div><div class="input-group">
            <label for="modus">Modus:<sup>*</sup></label>
            <select name="modus" id="modus" required>
              <option value="">-- Kies modus --</option>
              <option value="eco">Eco</option>
              <option value="tour">Tour</option>
              <option value="sport">Sport</option>
              <option value="turbo">Turbo</option>
            </select>
          </div>
        </div><br>
      <div class="input-row">
        <div class="input-group">
          <label for="gemeenteStart">Gemeente bij vertrek:<sup>*</sup></label>
          <input type="text" id="gemeenteStart" required>
        </div>
        <div class="input-group">
          <label for="straatStart">Straat bij vertrek:</label>
          <input type="text" id="straatStart">
        </div>
      </div><br>

      <div class="input-row">
        <div class="input-group">
          <label for="gemeenteEinde">Gemeente bij aankomst:<sup>*</sup></label>
          <input type="text" id="gemeenteEinde" required>
        </div>
        <div class="input-group">
          <label for="straatEinde">Straat bij aankomst:</label>
          <input type="text" id="straatEinde">
        </div>
      </div>
      <input type="submit" value="Bereken de gegevens" class="formulier">
<p class="requiredfield"><sup>*</sup> Deze velden zijn verplicht!</p>
      
      
    </div>
    </form>
  </div>
  <div id="windResult" class="result" style="display: none;"></div>
  <div id="result" class="result" style="display: none;"></div>

  <div class="feedback-row">
    <label>Ben je aangekomen? Geef je feedback!</label>
    <button onclick="window.location.href='feedback_form.php'" class="feedback" type="button">
  Feedback
</button>

  </div><br><br>
  <div id="feedback-container"></div>


  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script src="WebsiteJava.js" defer></script>
</body>
</html>
