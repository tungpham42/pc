import axios from "axios";
import {
  CPU,
  GPU,
  Motherboard,
  RAM,
  Storage,
  PowerSupply,
  Case,
  CPUCooler,
} from "../types";
import { deriveSocket } from "../utils/socketHelper";

const BASE_URL =
  "https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json";

// --- HELPER: Remove Duplicates by Name ---
const deduplicateParts = <T extends { name: string }>(parts: T[]): T[] => {
  const seen = new Set<string>();
  return parts.filter((part) => {
    // Normalize name to ensure slight spacing diffs don't cause dupes
    const normalizedName = part.name.trim();
    if (seen.has(normalizedName)) {
      return false; // Skip duplicate
    }
    seen.add(normalizedName);
    return true; // Keep unique
  });
};

// --- HELPER: Fetch, Filter Null Price, and Deduplicate ---
const fetchAndFilter = async <T extends { name: string }>(
  endpoint: string
): Promise<T[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}`);

    // 1. Filter out items with no price
    const validItems = response.data.filter((item: any) => item.price !== null);

    // 2. Remove duplicates
    return deduplicateParts(validItems);
  } catch (error) {
    console.error(`Error fetching ${endpoint}`, error);
    return [];
  }
};

export const fetchParts = {
  // CUSTOM CPU LOGIC: Fetch -> Filter -> Inject Socket -> Deduplicate
  getCPUs: async (): Promise<CPU[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/cpu.json`);

      const validCPUs = response.data.filter(
        (item: any) => item.price !== null
      );

      // Inject socket BEFORE deduplication (so we have the full object ready)
      const processedCPUs = validCPUs.map((cpu: any) => ({
        ...cpu,
        socket: deriveSocket(cpu.name),
      }));

      return deduplicateParts(processedCPUs);
    } catch (error) {
      console.error("Error fetching CPUs", error);
      return [];
    }
  },

  // Standard Logic for other parts
  getGPUs: () => fetchAndFilter<GPU>("video-card.json"),
  getMotherboards: () => fetchAndFilter<Motherboard>("motherboard.json"),
  getRAM: async (): Promise<RAM[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/memory.json`);
      const validItems = response.data.filter(
        (item: any) => item.price !== null
      );

      const processedRAM = validItems.map((item: any) => {
        // Parse Speed: [generation_id, speed] -> [4, 3200]
        const generation = Array.isArray(item.speed)
          ? `DDR${item.speed[0]}`
          : "Unknown";
        const clockSpeed = Array.isArray(item.speed) ? item.speed[1] : 0;

        // Parse Modules: [count, size_per_stick] -> [2, 16]
        const count = Array.isArray(item.modules) ? item.modules[0] : 0;
        const size = Array.isArray(item.modules) ? item.modules[1] : 0;

        return {
          ...item,
          speed: clockSpeed, // Now a clean number (e.g., 3200)
          type: generation, // e.g., "DDR4"
          total_capacity: count * size, // e.g., 32
        };
      });

      return deduplicateParts(processedRAM);
    } catch (error) {
      console.error("Error fetching RAM", error);
      return [];
    }
  },
  getStorage: () => fetchAndFilter<Storage>("internal-hard-drive.json"),
  getPowerSupplies: () => fetchAndFilter<PowerSupply>("power-supply.json"),
  getCases: () => fetchAndFilter<Case>("case.json"),
  getCPUCoolers: () => fetchAndFilter<CPUCooler>("cpu-cooler.json"),
};
