let map = L.map('map').setView([51.2194475, 4.4024643], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);
let routeLayer;

async function getRouteAndFiveCoordinates(event) {
  event.preventDefault();

  const gemeenteStart = document.getElementById("gemeenteStart").value.trim();
  const straatStart = document.getElementById("straatStart").value.trim();
  const gemeenteEnd = document.getElementById("gemeenteEinde").value.trim();
  const straatEnd = document.getElementById("straatEinde").value.trim();

  if (!gemeenteStart || !gemeenteEnd) {
    alert("Vul zowel de start- als eindlocatie in.");
    return;
  }

  const startCoords = await getCoordinates(gemeenteStart, straatStart);
  const endCoords = await getCoordinates(gemeenteEnd, straatEnd);

  if (startCoords && endCoords) {
    const route = await getRoute(startCoords, endCoords);
    if (route) {
      const coords = getTwentyCoordinates(route);
      let totaalVerbruikPct = 0;

      for (let i = 0; i < coords.length - 1; i++) {
        const coord = coords[i];
        const nextCoord = coords[i + 1];

        const lat = coord[1];
        const lon = coord[0];
        const nextLat = nextCoord[1];
        const nextLon = nextCoord[0];

        const afstand_km = calculateDistance(lat, lon, nextLat, nextLon);
        const hoogte_start_m = await fetchElevation(lat, lon) ?? 0;
        const hoogte_eind_m = await fetchElevation(nextLat, nextLon) ?? 0;
        const windData = await fetchWindDataPerCoord(lat, lon);

        const batterijData = berekenBatterijVerbruik({
          afstand_km: afstand_km,
          hoogte_start_m: hoogte_start_m,
          hoogte_eind_m: hoogte_eind_m,
          batterij_Wh: 750,
          windsnelheid_kmh: windData ? windData.windSpeed : 0,
          modus: document.getElementById("modus").value.trim(),
          snelheid_kmh: 20, // default rijsnelheid
          massa_kg: 100 
        });

        totaalVerbruikPct += parseFloat(batterijData.verbruik_pct);
      }

      const batterijProcent = parseFloat(document.getElementById("batterijProcent").value.trim());
      const totaalVerbruiktProcent = totaalVerbruikPct;
      const resterend = parseFloat(batterijProcent - totaalVerbruiktProcent);
      const gecorrigeerdeBias = await fetchLaatsteSpeling(); // wordt bv. 0.92 of 1.08 (gemiddelde ratio)
      const gecorrigeerdResterend = (resterend * gecorrigeerdeBias).toFixed(2); // ✅ correcte toepassing
      const verbruikteProcent = (batterijProcent - gecorrigeerdResterend).toFixed(2);






const formData = new FormData();
formData.append("waarde", gecorrigeerdResterend);

fetch("Opslaan_batterij.php", {
  method: "POST",
  body: formData
})
  .then(response => response.text())
  .then(data => {
    console.log("Batterijdata opgeslagen:", data);
  })
  .catch(error => {
    console.error("Fout bij opslaan batterijdata:", error);
  });


const spelingWaarde = gecorrigeerdeBias.toFixed(2);

let waarschuwing = "";
if (gecorrigeerdResterend < 15) {
  waarschuwing = `<p style="color: red;"><strong>Laad je batterij eerst op!</strong></p>`;
}

const output = `<p><strong>Totaal batterijverbruik over route:</strong> ${verbruikteProcent}%</p>
                <p><strong>Batterij op einde:</strong> ${gecorrigeerdResterend}%</p>
                ${waarschuwing}`;
                //<p><strong>Batterij op einde:</strong> ${resterend}%</p>
                //<p><strong>Laatste Speling:</strong> ${spelingWaarde}%</p>
                //<p><strong>Correctiefactor op basis van feedback:</strong> ×${gecorrigeerdeBias.toFixed(3)}</p>

// Verwijder de dubbele innerHTML update hieronder (hou er 1)
document.getElementById('result').innerHTML = output;
document.getElementById("result").style.display = "block";

      drawRoute(startCoords, endCoords);
      fetchWindDataStartEnd(startCoords, endCoords);
    }
  } else {
    alert("Kon geen coördinaten vinden voor een van de locaties.");
  }
  return false;
}

async function getCoordinates(gemeente, straat) {
  try {
    const query = straat ? `${straat}, ${gemeente}` : gemeente;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Fout bij ophalen coördinaten:", error);
    return null;
  }
}

async function getRoute(startCoords, endCoords) {
  const url = `https://router.project-osrm.org/route/v1/driving/${startCoords.lon},${startCoords.lat};${endCoords.lon},${endCoords.lat}?overview=full&geometries=geojson`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === "Ok") {
      return data.routes[0].geometry.coordinates;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Fout bij ophalen route:", error);
    return null;
  }
}

async function drawRoute(startCoords, endCoords) {
  const url = `https://router.project-osrm.org/route/v1/driving/${startCoords.lon},${startCoords.lat};${endCoords.lon},${endCoords.lat}?overview=full&geometries=geojson`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === "Ok") {
      if (routeLayer) {
        map.removeLayer(routeLayer);
      }
      routeLayer = L.geoJSON(data.routes[0].geometry, {
        style: { color: 'blue', weight: 5 }
      }).addTo(map);
      map.fitBounds(routeLayer.getBounds());
    } else {
      alert("Route kon niet worden berekend.");
    }
  } catch (error) {
    console.error("Fout bij tekenen route:", error);
  }
}

function getTwentyCoordinates(routeCoords) {
  const count = 20;
  if (routeCoords.length <= count) return routeCoords;
  const step = Math.floor(routeCoords.length / count);
  return Array.from({ length: count }, (_, i) => routeCoords[i * step]);
}

async function fetchWindDataPerCoord(lat, lon) {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=windspeed_10m,winddirection_10m&timezone=auto`);
    const data = await response.json();
    const latestIndex = data.hourly.time.length - 1;
    return {
      windSpeed: data.hourly.windspeed_10m[latestIndex],
      windDirection: data.hourly.winddirection_10m[latestIndex]
    };
  } catch (error) {
    console.error("Fout bij ophalen winddata:", error);
    return null;
  }
}

async function fetchWindDataStartEnd(startCoords, endCoords) {
  try {
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${startCoords.lat}&longitude=${startCoords.lon}&hourly=windspeed_10m,winddirection_10m&timezone=auto`);
    const weatherData = await weatherResponse.json();
    const latestIndex = weatherData.hourly.time.length - 1;
    const windSpeed = weatherData.hourly.windspeed_10m[latestIndex];
    const windDirection = weatherData.hourly.winddirection_10m[latestIndex];

    const totalDistance = calculateDistance(startCoords.lat, startCoords.lon, endCoords.lat, endCoords.lon);

    document.getElementById("windResult").innerHTML =
      `<p><strong>Startlocatie:</strong> ${startCoords.display_name}</p>
       <p><strong>Eindlocatie:</strong> ${endCoords.display_name}</p>
       <p><strong>Afstand tussen start en eind:</strong> ${totalDistance.toFixed(2)} km</p>`;
    document.getElementById("windResult").style.display = "block";
  } catch (error) {
    console.error("Error ophalen windgegevens:", error);
  }
}

async function fetchElevation(lat, lon) {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`);
    const data = await response.json();
    return data.elevation;
  } catch (error) {
    console.error("Fout bij ophalen hoogtemeters:", error);
    return null;
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchLaatsteSpeling() {
  try {
    
    const response = await fetch(`haal_speling.php?gebruiker=${encodeURIComponent(gebruiker)}&type=gemiddelde`);
    if (!response.ok) throw new Error("Speling ophalen mislukt");
    const data = await response.text();
    return parseFloat(data) || 1;
  } catch (e) {
    console.error("Fout bij speling:", e);
    return 0;
  }
}



// Nieuwe batterij verbruik functie zoals gevraagd:
function berekenBatterijVerbruik({
  afstand_km,
  snelheid_kmh,
  massa_kg,
  hoogte_start_m,
  hoogte_eind_m,
  batterij_Wh,
  windsnelheid_kmh = 0,
  modus = "eco"
}) {
  const g = 9.81;
  const Cd = 1.0;
  const A = 0.6; // aangepast frontaal oppervlak
  const Crr = 0.007; // verhoogde rolweerstand
  const luchtdichtheid = 1.225;

  // ✅ gebruik de parameters zoals doorgegeven
  const afstand_m = afstand_km * 1000;
  const snelheid_ms = snelheid_kmh / 3.6;
  const windsnelheid_ms = windsnelheid_kmh / 3.6;
  const v_rel = Math.max(snelheid_ms - windsnelheid_ms, 0);

  const delta_h = hoogte_eind_m - hoogte_start_m;
  const slope = delta_h / afstand_m;

  const F_lucht = 0.5 * luchtdichtheid * Cd * A * Math.pow(v_rel, 2);
  const F_rol = Crr * massa_kg * g;
  const F_helling = massa_kg * g * slope;
  const F_totaal = F_lucht + F_rol + Math.max(F_helling, 0);

  const energie_J = F_totaal * afstand_m;
  const energie_Wh = energie_J / 3600;

  const efficiënties = {
    eco: 0.90,
    tour: 0.75,
    sport: 0.60,
    turbo: 0.45
  };

  const eta = efficiënties[modus.toLowerCase()] || 0.75;

  const verbruik_pct = (energie_Wh / (batterij_Wh * eta)) * 100;

  return {
    modus,
    efficiëntie: eta,
    F_lucht: +F_lucht.toFixed(2),
    F_rol: +F_rol.toFixed(2),
    F_helling: +F_helling.toFixed(2),
    energie_Wh: +energie_Wh.toFixed(2),
    verbruik_pct: +verbruik_pct.toFixed(2)
  };
}


window.berekenBatterijVerbruik = berekenBatterijVerbruik;



