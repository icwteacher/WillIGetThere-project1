function berekenBatterijVerbruik({
  afstand_km,
  snelheid_kmh,
  massa_kg,
  hoogte_start_m,
  hoogte_eind_m,
  batterij_Wh,
  Cd = 1.0,
  A = 0.6, // aangepaste frontaal oppervlak
  Crr = 0.007, // verhoogde rolweerstand
  luchtdichtheid = 1.225,
  windsnelheid_kmh = 0,
  modus = "eco"
}) {
  // Constantes
  const g = 9.81;

  // Unit-conversies
  const afstand_m = afstand_km * 1000;
  const snelheid_ms = snelheid_kmh / 3.6;
  const windsnelheid_ms = windsnelheid_kmh / 3.6;
  const v_rel = Math.max(snelheid_ms - windsnelheid_ms, 0);

  // Hoogteverschil en helling
  const delta_h = hoogte_eind_m - hoogte_start_m;
  const slope = delta_h / afstand_m;

  // Krachten
  const F_lucht = 0.5 * luchtdichtheid * Cd * A * Math.pow(v_rel, 2);
  const F_rol = Crr * massa_kg * g;
  const F_helling = massa_kg * g * slope;
  const F_totaal = F_lucht + F_rol + Math.max(F_helling, 0); // afdaling telt niet mee

  // Energie in Joule en Wh
  const energie_J = F_totaal * afstand_m;
  const energie_Wh = energie_J / 3600;

  // Geoptimaliseerde efficiënties (afgeleid uit april 2025 dataset)
  const efficiënties = {
    eco: 0.40,
    tour: 0.50,
    sport: 0.58,
    turbo: 0.67
  };

  const eta = efficiënties[modus.toLowerCase()] ?? 0.50;

  // Verbruik in % van batterijcapaciteit
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

export { berekenBatterijVerbruik };
