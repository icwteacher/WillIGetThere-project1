let map = L.map('map').setView([51.2194475, 4.4024643], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);
let routeLayer;

async function getRouteAndFiveCoordinates() {
  // lees alle invoervelden
  const gemeenteStart  = document.getElementById("gemeenteStart").value.trim();
  const straatStart    = document.getElementById("straatStart").value.trim();
  const gemeenteEnd    = document.getElementById("gemeenteEinde").value.trim();
  const straatEnd      = document.getElementById("straatEinde").value.trim();
  const batterijPct    = parseFloat(document.getElementById("batterijProcent").value);
  const batterijCap    = parseFloat(document.getElementById("batterijCap").value);
  const modus          = document.getElementById("modus").value;
  const massa_kg       = parseFloat(document.getElementById("massa").value) || 80;
  const snelheid_kmh   = 20; // vaste snelheid, of vervang door eigen input

  if (!gemeenteStart || !gemeenteEnd) {
    alert("Vul start- en eindlocatie in.");
    return;
  }

  // coördinaten en route
  const startCoords = await getCoordinates(gemeenteStart, straatStart);
  const endCoords   = await getCoordinates(gemeenteEnd, straatEnd);
  if (!startCoords || !endCoords) {
    alert("Kon geen coördinaten vinden.");
    return;
  }
  const route = await getRoute(startCoords, endCoords);
  if (!route) {
    alert("Route kon niet worden berekend.");
    return;
  }

  // distantie en hoogte
  const afstand_km = calculateDistance(startCoords.lat, startCoords.lon, endCoords.lat, endCoords.lon);
  const afstand_m  = afstand_km * 1000;
  const hoogte_start = await fetchElevation(startCoords.lat, startCoords.lon);
  const hoogte_end   = await fetchElevation(endCoords.lat, endCoords.lon);
  const hoogteverschil = hoogte_end - hoogte_start;

  // winddata start/stop
  const windData = await fetchWindDataStartEnd(startCoords, endCoords);
  const windsnelheid_kmh = windData?.windSpeed ?? 0;

  // ** DE BATTERIJBEREKENING **
  const result = window.berekenBatterijVerbruik({
    afstand_m,
    snelheid_kmh,
    massa_kg,
    hoogte_m: hoogteverschil,
    batterij_Wh: batterijCap,
    modus,
    windsnelheid_kmh
  });

  // interpretatie van % verbruik tov start-%
  const verbruiktPct = parseFloat(result.verbruik_pct);
  const eindPct = batterijPct - verbruiktPct;

  // toon alles op de pagina
  document.getElementById("result").style.display = "block";
  document.getElementById("result").innerHTML = `
    <h3>Batterijverbruik (${modus}): ${result.verbruik_pct}</h3>
    <p>Start: ${batterijPct.toFixed(1)}%, Einde: ${eindPct.toFixed(1)}%</p>
    <p>Energie: ${result.energie_Wh} Wh<br>
       Lucht: ${result.F_lucht} N, Rol: ${result.F_rol} N, Helling: ${result.F_helling} N
    </p>
  `;

  // existing: route tekenen + windResult opvullen
  drawRoute(startCoords, endCoords);
      fetchWindDataStartEnd(startCoords, endCoords);
    }
  } else {
    alert("Kon geen coördinaten vinden voor een van de locaties.");
  }
  return false;
}
document.getElementById("berekenBtn")
        .addEventListener("click", getRouteAndFiveCoordinates);

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

function getFiveCoordinates(routeCoords) {
    a=20;
  if (routeCoords.length <= a) return routeCoords;
  const step = Math.floor(routeCoords.length / a);
  let selectedCoords = [];
  for (let i = 0; i < a; i++) {
    selectedCoords.push(routeCoords[i * step]);
  }
  return selectedCoords;
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
       <p><strong>Windsnelheid (startlocatie):</strong> ${windSpeed} km/h</p>
       <p><strong>Windrichting (startlocatie):</strong> ${windDirection}°</p>
       <p><strong>Afstand tussen start en eind:</strong> ${totalDistance.toFixed(2)} km</p>`;
    document.getElementById("windResult").style.display = "block";
  } catch (error) {
    console.error("Error ophalen windgegevens:", error);
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

function EnqueteInvullen() {
  fetch('feedback_form.php')
    .then(response => response.text())
    .then(data => {
      document.getElementById('feedback-container').innerHTML = data;
    })
    .catch(error => {
      console.error("Er is een fout opgetreden bij het ophalen van het formulier.", error);
    });
}

function logout() {
  header("Location: index.html");
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

import { berekenBatterijVerbruik } from "./berekeningen.js";

async function berekenVerbruikViaWebsite(event) {
  event.preventDefault();

  const gemeenteStart = document.getElementById("gemeenteStart").value.trim();
  const straatStart = document.getElementById("straatStart").value.trim();
  const gemeenteEnd = document.getElementById("gemeenteEinde").value.trim();
  const straatEnd = document.getElementById("straatEinde").value.trim();
  const batterijWh = parseFloat(document.getElementById("batterijWh").value);
  const massa_kg = parseFloat(document.getElementById("massa").value);
  const modus = document.getElementById("modus").value;

  const startCoords = await getCoordinates(gemeenteStart, straatStart);
  const endCoords = await getCoordinates(gemeenteEnd, straatEnd);

  if (!startCoords || !endCoords) {
    alert("Kon geen coördinaten vinden.");
    return;
  }

  const afstand_km = calculateDistance(startCoords.lat, startCoords.lon, endCoords.lat, endCoords.lon);
  const afstand_m = afstand_km * 1000;

  const hoogte_start = await fetchElevation(startCoords.lat, startCoords.lon);
  const hoogte_end = await fetchElevation(endCoords.lat, endCoords.lon);
  const hoogteverschil = hoogte_end - hoogte_start;

  const windData = await fetchWindDataStartEnd(startCoords, endCoords);

  const snelheid_kmh = 20; // voorbeeldwaarde of later inputveld
  const windsnelheid_kmh = windData?.windSpeed ?? 0;

  const resultaat = berekenBatterijVerbruik({
    afstand_m,
    snelheid_kmh,
    massa_kg,
    hoogte_m: hoogteverschil,
    batterij_Wh: batterijWh,
    modus,
    windsnelheid_kmh
  });

  document.getElementById("batterijVerbruikResultaat").innerHTML = `
    <p><strong>Batterijverbruik (${modus}):</strong> ${resultaat.verbruik_pct}</p>
    <p><strong>Energieverbruik:</strong> ${resultaat.energie_Wh} Wh</p>
    <p>Luchtweerstand: ${resultaat.F_lucht} N, Rolweerstand: ${resultaat.F_rol} N, Helling: ${resultaat.F_helling} N</p>
  `;
}
