import { GPU } from "../types";

export const getGpuTdp = (gpu: GPU | null): number => {
  if (!gpu) return 0;

  // 1. If API provides specific TDP, prefer that
  if (gpu.tdp && gpu.tdp > 0) return gpu.tdp;

  // 2. Normalize name for matching
  const name = (gpu.chipset || gpu.name).toLowerCase().replace(/-/g, " ");

  // --- FUTURE PROOFING (60 Series & Above) ---
  // Default to high wattage for unknown future high-end cards to be safe
  if (name.match(/rtx [6-9]\d\d\d/)) return 600;

  // --- NVIDIA GEFORCE RTX 50 SERIES (Blackwell) ---
  // Based on CES 2025 Specs & Leaks
  if (name.includes("5090")) return 575; // Massive 575W TDP
  if (name.includes("5080 super")) return 415; // Rumored Super variant
  if (name.includes("5080")) return 360; // Significant jump to 360W
  if (name.includes("5070 ti super")) return 350;
  if (name.includes("5070 ti")) return 300;
  if (name.includes("5070 super")) return 275;
  if (name.includes("5070")) return 250;
  if (name.includes("5060 ti")) return 180;
  if (name.includes("5060")) return 145;
  if (name.includes("5050")) return 130;

  // --- NVIDIA GEFORCE RTX 40 SERIES ---
  if (name.includes("4090")) return 450;
  if (name.includes("4080 super")) return 320;
  if (name.includes("4080")) return 320;
  if (name.includes("4070 ti super")) return 285;
  if (name.includes("4070 ti")) return 285;
  if (name.includes("4070 super")) return 220;
  if (name.includes("4070")) return 200;
  if (name.includes("4060 ti")) return 160;
  if (name.includes("4060")) return 115;

  // --- NVIDIA GEFORCE RTX 30 SERIES ---
  if (name.includes("3090 ti")) return 450;
  if (name.includes("3090")) return 350;
  if (name.includes("3080 ti")) return 350;
  if (name.includes("3080")) return 320;
  if (name.includes("3070 ti")) return 290;
  if (name.includes("3070")) return 220;
  if (name.includes("3060 ti")) return 200;
  if (name.includes("3060")) return 170;
  if (name.includes("3050")) return 130;

  // --- NVIDIA GEFORCE RTX 20 SERIES ---
  if (name.includes("2080 ti")) return 250;
  if (name.includes("2080 super")) return 250;
  if (name.includes("2080")) return 215;
  if (name.includes("2070 super")) return 215;
  if (name.includes("2070")) return 175;
  if (name.includes("2060 super")) return 175;
  if (name.includes("2060")) return 160;

  // --- NVIDIA GTX 16 SERIES ---
  if (name.includes("1660 ti")) return 120;
  if (name.includes("1660 super")) return 125;
  if (name.includes("1660")) return 120;
  if (name.includes("1650 super")) return 100;
  if (name.includes("1650")) return 75;

  // --- NVIDIA GTX 10 SERIES ---
  if (name.includes("1080 ti")) return 250;
  if (name.includes("1080")) return 180;
  if (name.includes("1070 ti")) return 180;
  if (name.includes("1070")) return 150;
  if (name.includes("1060")) return 120;
  if (name.includes("1050 ti")) return 75;
  if (name.includes("1050")) return 75;

  // --- TITAN CLASS ---
  if (name.includes("titan rtx")) return 280;
  if (name.includes("titan v")) return 250;
  if (name.includes("titan xp")) return 250;
  if (name.includes("titan x")) return 250;

  // --- AMD RADEON RX 7000 SERIES ---
  if (name.includes("7900 xtx")) return 355;
  if (name.includes("7900 xt")) return 315;
  if (name.includes("7900 gre")) return 260;
  if (name.includes("7800 xt")) return 263;
  if (name.includes("7700 xt")) return 245;
  if (name.includes("7600 xt")) return 190;
  if (name.includes("7600")) return 165;

  // --- AMD RADEON RX 6000 SERIES ---
  if (name.includes("6950 xt")) return 335;
  if (name.includes("6900 xt")) return 300;
  if (name.includes("6800 xt")) return 300;
  if (name.includes("6800")) return 250;
  if (name.includes("6750 xt")) return 250;
  if (name.includes("6700 xt")) return 230;
  if (name.includes("6650 xt")) return 180;
  if (name.includes("6600 xt")) return 160;
  if (name.includes("6600")) return 132;
  if (name.includes("6500 xt")) return 107;
  if (name.includes("6400")) return 53;

  // --- AMD RADEON RX 5000 SERIES ---
  if (name.includes("5700 xt")) return 225;
  if (name.includes("5700")) return 180;
  if (name.includes("5600 xt")) return 150;
  if (name.includes("5500 xt")) return 130;

  // --- INTEL ARC ---
  if (name.includes("a770")) return 225;
  if (name.includes("a750")) return 225;
  if (name.includes("a580")) return 185;
  if (name.includes("a380")) return 75;

  // --- GENERIC FALLBACKS ---
  // High-tier guess for unknown RTX/XT cards
  if (name.includes("rtx") || name.includes("xt")) return 250;
  // Low-tier guess
  if (name.includes("gtx") || name.includes("rx")) return 150;

  // Absolute fallback
  return 150;
};
