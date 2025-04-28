<?php
$naam = $_POST['naam'];
$email = $_POST['email'];
$telefoon = $_POST['telefoon'];
$gebruikersnaam = $_POST['gebruikersnaam'];
$wachtwoord = password_hash($_POST['wachtwoord'], PASSWORD_DEFAULT);

// Maak een array van de gegevens
$gebruiker = [
    'naam' => $naam,
    'email' => $email,
    'telefoon' => $telefoon,
    'gebruikersnaam' => $gebruikersnaam,
    'wachtwoord' => $wachtwoord
];

// Bestandsnaam
$bestand = 'gebruikers.json';

// Als het bestand al bestaat, lees de inhoud
if (file_exists($bestand)) {
    $data = json_decode(file_get_contents($bestand), true);
} else {
    $data = [];
}

// Voeg de nieuwe gebruiker toe
$data[] = $gebruiker;

// Sla alles opnieuw op
file_put_contents($bestand, json_encode($data, JSON_PRETTY_PRINT));

echo "Registratie gelukt zonder database!";
?>
