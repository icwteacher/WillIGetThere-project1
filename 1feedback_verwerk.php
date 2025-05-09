<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nieuweWaarde = floatval($_POST['werkelijk_verbruik']);
    $voorspeldeWaarde = floatval($_POST['voorspelling']);
    $id = $_POST['id'] ?? "default"; // Gebruik route-id of standaard

    $verschil = $nieuweWaarde - $voorspeldeWaarde;
    $correctie = $verschil / 2;

    $xmlFile = 'gebruiker.xml';
    if (!file_exists($xmlFile)) {
        $xml = new SimpleXMLElement('<gebruikers></gebruikers>');
    } else {
        $xml = simplexml_load_file($xmlFile);
    }

    $gebruiker = null;
    foreach ($xml->gebruiker as $g) {
        if ((string)$g['id'] === $id) {
            $gebruiker = $g;
            break;
        }
    }

    if (!$gebruiker) {
        $gebruiker = $xml->addChild('gebruiker');
        $gebruiker->addAttribute('id', $id);
        $gebruiker->addChild('correctie', $correctie);
    } else {
        $huidige = floatval($gebruiker->correctie);
        $gebruiker->correctie = $huidige + $correctie;
    }

    $xml->asXML($xmlFile);
    echo "Feedback verwerkt. Correctie opgeslagen.";
}
?>
