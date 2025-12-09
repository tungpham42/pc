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
import { deriveSocket } from "../utils/socketHelper"; // Import the helper

const BASE_URL =
  "https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json";

// Generic helper
const fetchAndFilter = async <T>(endpoint: string): Promise<T[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}`);
    return response.data.filter((item: any) => item.price !== null);
  } catch (error) {
    console.error(`Error fetching ${endpoint}`, error);
    return [];
  }
};

export const fetchParts = {
  // CUSTOM LOGIC FOR CPU: Inject the socket
  getCPUs: async (): Promise<CPU[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/cpu.json`);
      const validCPUs = response.data.filter(
        (item: any) => item.price !== null
      );

      // Map over the CPUs and add the socket field
      return validCPUs.map((cpu: any) => ({
        ...cpu,
        socket: deriveSocket(cpu.name), // <--- INJECTION HAPPENS HERE
      }));
    } catch (error) {
      console.error("Error fetching CPUs", error);
      return [];
    }
  },

  // The rest remain the same
  getGPUs: () => fetchAndFilter<GPU>("video-card.json"),
  getMotherboards: () => fetchAndFilter<Motherboard>("motherboard.json"),
  getRAM: () => fetchAndFilter<RAM>("memory.json"),
  getStorage: () => fetchAndFilter<Storage>("internal-hard-drive.json"),
  getPowerSupplies: () => fetchAndFilter<PowerSupply>("power-supply.json"),
  getCases: () => fetchAndFilter<Case>("case.json"),
  getCPUCoolers: () => fetchAndFilter<CPUCooler>("cpu-cooler.json"),
};
