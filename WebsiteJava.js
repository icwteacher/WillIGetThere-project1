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
      const fiveCoords = getFiveCoordinates(route);
      let output = "<p><strong>Coördinaten langs de route:</strong></p>";

      for (let i = 0; i < fiveCoords.length; i++) {
        const coord = fiveCoords[i];
        const lat = coord[1];
        const lon = coord[0];

        const windData = await fetchWindDataPerCoord(lat, lon);

        if (windData) {
          output += `<p><strong>Coördinaat ${i + 1}:</strong> Lat: ${lat}, Lon: ${lon}<br>Windsnelheid: ${windData.windSpeed} km/h, Windrichting: ${windData.windDirection}°</p>`;
        } else {
          output += `<p><strong>Coördinaat ${i + 1}:</strong> Geen winddata beschikbaar</p>`;
        }
        document.getElementById("result").style.display = "block";
      }

      document.getElementById('result').innerHTML = output;
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

