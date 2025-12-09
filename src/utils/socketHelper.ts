export const deriveSocket = (cpuName: string): string => {
  const name = cpuName.toLowerCase();

  // ==========================================
  // AMD LOGIC
  // ==========================================

  // --- EPYC ---
  if (name.includes("epyc")) {
    if (name.match(/epyc 9\d{3}/)) return "SP5";
    if (name.match(/epyc 8\d{3}/)) return "SP6";
    if (name.match(/epyc 7\d{3}/)) return "SP3";
    if (name.match(/epyc 4\d{3}/)) return "AM5";
    return "Unknown EPYC";
  }

  // --- THREADRIPPER ---
  if (name.includes("threadripper")) {
    // 3000/5000/7000 Pro series often shift, but strictly based on the provided JSON:
    // 39xxX consumer is sTRX4. 19xxX/29xxX is TR4.
    if (name.match(/threadripper (pro )?[357]\d{3}/)) {
      if (name.includes("pro")) return "sWRX8/sTR5"; // Pro lines
      return "sTRX4"; // Consumer 3000 series
    }
    if (name.match(/threadripper [12]\d{3}/)) return "TR4";
  }

  // --- RYZEN (Mainstream) ---
  if (name.includes("ryzen")) {
    // AM5: Ryzen 7000, 8000, 9000
    if (name.match(/ryzen \d+ [789]\d{3}/)) return "AM5";
    // AM4: Ryzen 1000, 2000, 3000, 4000, 5000
    if (name.match(/ryzen \d+ [1-5]\d{3}/)) return "AM4";
  }

  // --- ATHLON ---
  if (name.includes("athlon")) {
    // AM4 Athlons (200GE, 3000G)
    if (name.match(/athlon (2\d{2}ge|3000g)/)) return "AM4";
    // AM1 (Kabini)
    if (name.match(/athlon 5[13]50/)) return "AM1";
    // FM2/FM2+ (X4 7xx/8xx/9xx)
    if (name.match(/athlon x4 [789]\d{2}/)) return "FM2/FM2+";
    // FM1 (Specific Athlon II X4 models)
    if (name.match(/athlon ii x4 6[3-5]1/) || name.includes("638"))
      return "FM1";
    // Legacy AM3
    if (name.includes("athlon ii") || name.includes("athlon x2")) return "AM3";
  }

  // --- LEGACY AMD (FX, Phenom, A-Series, Sempron) ---
  if (name.includes("fx-")) return "AM3+";
  if (name.includes("phenom ii")) return "AM3";
  if (name.includes("phenom")) return "AM2/AM2+"; // Phenom I

  if (name.includes("sempron")) {
    if (name.match(/(130|140|145|150)/)) return "AM3"; // Sempron 100 series
    if (name.match(/(2650|3850)/)) return "AM1";
    return "AM2/AM2+";
  }

  // A-Series APUs
  if (name.match(/a\d{1,2}-\d{4}/)) {
    // A* 3xxx -> FM1
    if (name.match(/a\d{1,2}-3\d{3}/)) return "FM1";
    // A* 4xxx through 9xxx -> FM2/FM2+ (Generalized)
    if (name.match(/a\d{1,2}-[4-9]\d{3}/)) return "FM2/FM2+";
  }

  // Misc AMD
  if (
    name.includes("amd 5350") ||
    name.includes("amd 5150") ||
    name.includes("amd 2650")
  )
    return "AM1";
  if (name.includes("opteron")) return "Socket G34/C32";

  // ==========================================
  // INTEL LOGIC
  // ==========================================

  // --- CORE ULTRA ---
  if (name.includes("ultra")) {
    if (name.match(/ultra \d+ 2\d{2}/)) return "LGA1851"; // Arrow Lake
    if (name.match(/ultra \d+ 1\d{2}/)) return "BGA"; // Meteor Lake
  }

  // --- INTEL HEDT (High End Desktop) ---
  // Must check these before generic i7/i9 logic to avoid misclassification

  // LGA2066: Core X (7000X, 9000X, 10000X)
  if (name.match(/i[79]-(7[89]|9[89]|109)\d{2}x/)) return "LGA2066";

  // LGA2011-v3: Core i7 5000/6000 Extreme
  if (name.match(/i7-(5[89]|6[89])\d{2}[ckx]?/)) return "LGA2011-v3";

  // LGA2011: Core i7 3000/4000 Extreme
  if (name.match(/i7-(3[89]|4[89])\d{2}[ckx]?/)) return "LGA2011";

  // --- MAINSTREAM INTEL CORE ---
  if (name.match(/i\d-(12|13|14)\d{3}/)) return "LGA1700"; // 12th-14th Gen
  if (name.match(/i\d-(10|11)\d{3}/)) return "LGA1200"; // 10th-11th Gen
  if (name.match(/i\d-[6789]\d{3}/)) return "LGA1151"; // 6th-9th Gen
  if (name.match(/i\d-[45]\d{3}/)) return "LGA1150"; // 4th-5th Gen
  if (name.match(/i\d-[23]\d{3}/)) return "LGA1155"; // 2nd-3rd Gen

  // 1st Gen (3 digits or specific 4 digits like 860/870/9xx)
  if (name.match(/i7-9\d{2}/)) return "LGA1366"; // Bloomfield
  if (name.match(/i[357]-[5678]\d{2}/)) return "LGA1156"; // Lynnfield/Clarkdale

  // --- XEON ---
  if (name.includes("xeon")) {
    if (name.includes("e-2")) return "LGA1151"; // Coffee Lake Xeons
    if (name.includes("e3-")) {
      if (name.match(/v[56]/)) return "LGA1151";
      if (name.match(/v[34]/)) return "LGA1150";
      if (name.match(/v2/) || name.match(/e3-\d{4}$/)) return "LGA1155";
    }
    if (name.includes("e5-") || name.includes("e7-")) {
      if (name.match(/v[34]/)) return "LGA2011-3";
      return "LGA2011"; // v1/v2
    }
  }

  // --- PENTIUM / CELERON GENERATIONS ---
  if (name.includes("pentium") || name.includes("celeron")) {
    // LGA1700: Gold G7400, G6900
    if (
      name.match(/g[67][94]\d{2}/) &&
      (name.includes("6900") || name.includes("7400"))
    )
      return "LGA1700";

    // LGA1200: Gold G6xxx (except 6900), G59xx
    if (name.match(/g(6[456]|59)\d{2}/)) return "LGA1200";

    // LGA1151: G4xxx, G5xxx (lower end)
    if (name.match(/g[45]\d{3}/)) return "LGA1151";
    if (name.match(/g39\d{2}/)) return "LGA1151"; // Celeron G39xx

    // LGA1150: G3xxx (Haswell) excluding 39xx, G18xx
    if (name.match(/g3[24]\d{2}/)) return "LGA1150";
    if (name.match(/g18\d{2}/)) return "LGA1150";

    // LGA1155: G2xxx, G6xx, G8xx, G16xx, G5xx, G4xx
    if (name.match(/g(2\d{3}|[68]\d{2}|16\d{2}|5\d{2}|4\d{2})/))
      return "LGA1155";

    // LGA775: E-series, 400 series
    if (name.match(/e\d{4}/) || name.match(/ (4\d{2}|e1\d{3})/))
      return "LGA775";
    if (name.includes("pentium d") || name.includes("pentium 4"))
      return "LGA775";
  }

  // --- LEGACY INTEL ---
  if (name.includes("core 2")) return "LGA775";
  if (name === "intel 300") return "LGA1700"; // Raptor Lake Refresh 300

  return "Unknown";
};
