export const deriveSocket = (cpuName: string): string => {
  const name = cpuName.toLowerCase();

  // --- INTEL CORE ULTRA (Series 2 / Arrow Lake) ---
  if (name.includes("ultra")) {
    // Matches "Core Ultra 7 265K", "Core Ultra 5 245K", etc. (200 Series)
    // Looking for the pattern: "ultra" followed eventually by a number starting with 2
    if (name.match(/ultra \d+ 2\d{2}/)) {
      return "LGA1851"; // Arrow Lake-S
    }
    // If we ever see Series 1 desktop kits (rare), they might be BGA or specialized
    if (name.match(/ultra \d+ 1\d{2}/)) {
      return "BGA"; // Meteor Lake (Mobile/Embedded)
    }
  }

  // --- AMD LOGIC ---
  if (name.includes("ryzen")) {
    // AM5: Ryzen 7000, 8000, 9000 series (e.g., Ryzen 5 7600X)
    if (name.match(/ryzen \d+ [789]\d{3}/)) {
      return "AM5";
    }
    // AM4: Ryzen 1000, 2000, 3000, 4000, 5000 series
    // (Matches "Ryzen 5 3600", "Ryzen 7 5800X", etc.)
    if (name.match(/ryzen \d+ [1-5]\d{3}/)) {
      return "AM4";
    }
    // Threadripper
    if (name.includes("threadripper")) {
      // Simplification: sTRX4 or sWRX8 depending on gen, but sTRX4 is safer catch-all for recent
      return "sTRX4";
    }
  }

  // --- INTEL CORE (Traditional) ---
  if (name.includes("core") || name.includes("intel")) {
    // LGA1700: 12th, 13th, 14th Gen (e.g., i5-12600K, i9-13900K, i7-14700K)
    if (name.match(/i\d-(12|13|14)\d{3}/)) {
      return "LGA1700";
    }
    // LGA1200: 10th, 11th Gen (e.g., i9-10900K, i5-11400)
    if (name.match(/i\d-(10|11)\d{3}/)) {
      return "LGA1200";
    }
    // LGA1151: 6th, 7th, 8th, 9th Gen
    if (name.match(/i\d-[6789]\d{3}/)) {
      return "LGA1151";
    }
  }

  return "Unknown";
};
