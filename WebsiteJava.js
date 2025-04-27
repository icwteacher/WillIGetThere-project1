// Haalt coördinaten op van een opgegeven gemeente en straat via de OpenStreetMap API
async function getCoordinates(gemeente, straat) {
    let query = "";

    if (straat) {
        query = `${straat}, ${gemeente}, Belgium`;
    } else {
        query = `${gemeente}, Belgium`;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.length > 0 ? { 
            lat: data[0].lat, 
            lon: data[0].lon, 
            display_name: data[0].display_name 
        } : null;
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
}

// Haalt windgegevens op voor een opgegeven breedte- en lengtegraad
async function fetchWindData(latitude, longitude, locatieNaam) {
    try {
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=windspeed_10m,winddirection_10m&timezone=auto`
        );
        const weatherData = await weatherResponse.json();

        // Gebruik de meest recente gegevens
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
    const gemeenteStart = document.getElementById("gemeenteStart").value.trim();
    const straatStart = document.getElementById("straatStart").value.trim();

    if (!gemeenteStart) {
        alert("Vul minstens de gemeente in voor de startlocatie.");
        return;
    }

    const startCoords = await getCoordinates(gemeenteStart, straatStart);

    if (startCoords) {
        fetchWindData(startCoords.lat, startCoords.lon, startCoords.display_name);
    } else {
        alert("Kon geen coördinaten vinden voor de opgegeven locatie.");
    }
}

// Laat een eenvoudige enquête verschijnen
function EnqueteInvullen() {
    document.body.innerHTML = `
    <div class="hoofding">
        <h1>Feedback Formulier</h1>
    </div>
    <form>
        <label for="batterij">Batterij op einde (in %):<sup>*</sup> </label>
        <input type="number" name="batterij" min="0" max="100" required><br>

        <label for="tevredenheid">Ben je tevreden?<sup>*</sup> </label>
        <select name="tevreden" id="tevreden" required>
            <option value=""></option>
            <option value="ja">Ja</option>
            <option value="nee">Nee</option>
            <option value="deels">Deels</option>
        </select><br><br>

        <label for="opmerking">Heb je nog opmerkingen?</label><br><br>
        <textarea name="info" rows="5" cols="50"></textarea><br><br>

        <input type="submit" value="Verstuur" style="padding: 10px 15px;" class="formulier">
    </form>
    <p class="requiredfield"><sup>*</sup> Deze velden zijn verplicht!</p>
    `;
}
