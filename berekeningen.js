function berekenBatterijVerbruik({
  afstand_m,
  snelheid_kmh = 20,
  massa_kg = 85,
  hoogte_m,
  batterij_Wh = 750,
  Cd = 1.0,
  A = 0.5,
  Crr = 0.005,
  luchtdichtheid = 1.225,
  windsnelheid_kmh,
  modus = "eco"
}) {
  const g = 9.81;
  const snelheid_ms = snelheid_kmh / 3.6;
  const windsnelheid_ms = windsnelheid_kmh / 3.6;
  const v_rel = snelheid_ms + windsnelheid_ms;

  const F_lucht = 0.5 * luchtdichtheid * Cd * A * Math.pow(v_rel, 2);
  const F_rol = Crr * massa_kg * g;
  const F_helling = massa_kg * g * (hoogte_m / afstand_m);

  const F_totaal = F_lucht + F_rol + F_helling;
  const energie_J = F_totaal * afstand_m;
  const energie_Wh = energie_J / 3600;

  // Kies efficiëntie op basis van modus
  const efficiënties = {
      eco: 0.55,
      tour: 0.65,
      sport: 0.70,
      turbo: 0.80
  };

  const eta = efficiënties[modus] ?? 0.65; // standaard op 'tour' als onbekend
  const verbruik_pct = (energie_Wh / batterij_Wh) / eta * 100;

  return {
      modus: modus,
      efficiëntie: eta,
      F_lucht: F_lucht.toFixed(2),
      F_rol: F_rol.toFixed(2),
      F_helling: F_helling.toFixed(2),
      energie_Wh: energie_Wh.toFixed(2),
      verbruik_pct: verbruik_pct.toFixed(2) + "%"
  };
}