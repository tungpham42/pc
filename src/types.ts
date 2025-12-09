export interface HardwarePart {
  name: string;
  price: number | null;
  image?: string;
  manufacturer?: string;
  id?: string; // specific ID if available
}

export interface CPU extends HardwarePart {
  core_count: number;
  core_clock: number;
  boost_clock: number;
  tdp: number;
  graphics?: string;
  socket: string; // Ensure this is NOT optional (?) anymore
}

export interface GPU extends HardwarePart {
  chipset: string;
  memory: number;
  core_clock: number;
  boost_clock: number;
}

export interface Motherboard extends HardwarePart {
  socket: string;
  form_factor: string;
  max_memory: number;
  memory_slots: number;
}

export interface RAM extends HardwarePart {
  speed: number;
  modules: number[]; // e.g., [2, 8] for 2x8GB
  price_per_gb: number;
}

export interface Storage extends HardwarePart {
  capacity: number; // in GB
  type: "SSD" | "HDD";
  interface: string; // SATA, M.2, etc.
  form_factor: string;
}

export interface PowerSupply extends HardwarePart {
  wattage: number;
  efficiency_rating: string; // 80+ Gold, etc.
  modular: string; // Full, Semi, No
}

export interface Case extends HardwarePart {
  type: string; // ATX Mid Tower, etc.
  external_volume: number;
  internal_35_bays: number;
}

export interface CPUCooler extends HardwarePart {
  rpm?: number[]; // [min, max]
  noise_level?: number[];
  water_cooled?: boolean;
}
