function berekenBatterijVerbruik({
  afstand_m,
  snelheid_kmh,
  massa_kg,
  hoogte_m,
  batterij_Wh,
  Cd = 1.0,
  A = 0.5,
  Crr = 0.005,
  luchtdichtheid = 1.225,
  windsnelheid_kmh = 0,
  modus = "eco"
}) {
  const g = 9.81;

  // Snelheden omrekenen naar m/s
  const snelheid_ms = snelheid_kmh / 3.6;
  const windsnelheid_ms = windsnelheid_kmh / 3.6;
  const v_rel = snelheid_ms + windsnelheid_ms;

  // Krachten
  const F_lucht = 0.5 * luchtdichtheid * Cd * A * v_rel * v_rel;
  const F_rol = Crr * massa_kg * g;
  const F_helling = massa_kg * g * (hoogte_m / afstand_m);

  // Totale arbeid in Joule en omzetten naar Wh
  const F_totaal = F_lucht + F_rol + F_helling;
  const energie_J = F_totaal * afstand_m;
  const energie_Wh = energie_J / 3600;

  // Realistische verbruikfactoren per modus
  const verbruikFactoren = {
    eco:   1.0,
    tour:  1.2,
    sport: 1.5,
    turbo: 2.0
  };
  const factor = verbruikFactoren[modus] ?? verbruikFactoren.tour;

  // Aangepast energieverbruik
  const energie_adj_Wh = energie_Wh * factor;

  // Percentage batterijverbruik
  const verbruik_pct = (energie_adj_Wh / batterij_Wh) * 100;

  return {
    modus,
    factor: factor,
    F_lucht:     F_lucht.toFixed(2) + " N",
    F_rol:       F_rol.toFixed(2) + " N",
    F_helling:   F_helling.toFixed(2) + " N",
    energie_Wh:      energie_Wh.toFixed(2) + " Wh",
    energie_adj_Wh:  energie_adj_Wh.toFixed(2) + " Wh",
    verbruik_pct:    verbruik_pct.toFixed(2) + "%"
  };
}

// Exporteer de functie naar window zodat je 'm kunt gebruiken zonder modules
window.berekenBatterijVerbruik = berekenBatterijVerbruik;
