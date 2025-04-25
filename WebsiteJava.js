// Haalt coördinaten op van een opgegeven gemeente en straat via de OpenStreetMap API
async function getCoordinates(gemeente, straat) {
    const query = `${straat}, ${gemeente}, Belgium`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.length > 0 ? { lat: data[0].lat, lon: data[0].lon } : null;
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
}

// Haalt windgegevens op voor een opgegeven breedte- en lengtegraad
async function fetchWindData(latitude, longitude) {
    try {
        // Haal windgegevens op
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=windspeed_10m,winddirection_10m&timezone=auto`
        );
        const weatherData = await weatherResponse.json();

        // Verkrijg de meest recente windgegevens
        const latestIndex = weatherData.hourly.time.length - 1;
        const windSpeed = weatherData.hourly.windspeed_10m[latestIndex];
        const windDirection = weatherData.hourly.winddirection_10m[latestIndex];

        // Toon resultaten
        document.getElementById("windResult").innerHTML = 
            `<p><strong>Wind Snelheid:</strong> ${windSpeed} km/h</p>
             <p><strong>Wind Richting:</strong> ${windDirection}°</p>
             <p><strong>Breedtegraad:</strong> ${latitude}°</p>
             <p><strong>Lengtegraad:</strong> ${longitude}°</p>`;
        document.getElementById("windResult").style.display = "block";
    } catch (error) {
        console.error("Error met het ophalen van gegevens:", error);
    }
}

// Leest invoerwaarden, haalt coördinaten van GemeenteStart & StraatStart op en gebruikt ze voor winddata
async function getWindDataForStartLocation() {
    const gemeenteStart = document.getElementById("GemeenteStart").value;
    const straatStart = document.getElementById("StraatStart").value;

    if (!gemeenteStart || !straatStart) {
        alert("Vul zowel de gemeente als de straat in voor de startlocatie.");
        return;
    }

    const startCoords = await getCoordinates(gemeenteStart, straatStart);

    if (startCoords) {
        fetchWindData(startCoords.lat, startCoords.lon);
    } else {
        alert("Kon geen coördinaten vinden voor de startlocatie.");
    }
}
function EnqueteInvullen(){
    document.writeln('<label for="batterij">Batterij op einde (in %):</label><input type="number"><br><button onclick="Indienen()">Indienen</button>')
}
