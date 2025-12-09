export interface HardwarePart {
  name: string;
  price: number | null;
  image?: string;
  manufacturer?: string;
  id?: string;
}

export interface CPU extends HardwarePart {
  core_count: number;
  core_clock: number;
  boost_clock: number;
  tdp: number;
  graphics?: string;
  socket: string;
}

export interface GPU extends HardwarePart {
  chipset: string;
  memory: number;
  core_clock: number;
  boost_clock: number;
  tdp?: number;
  color?: string;
}

export interface Motherboard extends HardwarePart {
  socket: string;
  form_factor: string;
  max_memory: number;
  memory_slots: number;
}

export interface RAM extends HardwarePart {
  speed: number; // Clock speed (e.g., 3200, 6000)
  type: string; // Generation (e.g., "DDR4", "DDR5")
  modules: number[]; // [count, size] (e.g., [2, 16])
  total_capacity: number; // Total GB (e.g., 32)
  cas_latency?: number;
  first_word_latency?: number;
  color?: string;
  price_per_gb: number;
}

export interface Storage extends HardwarePart {
  capacity: number;
  type: "SSD" | "HDD";
  interface: string;
  form_factor: string;
}

export interface PowerSupply extends HardwarePart {
  wattage: number;
  efficiency: string;
  modular: string;
}

export interface Case extends HardwarePart {
  type: string;
  color: string;
  external_volume: number;
  internal_35_bays: number;
}

export interface CPUCooler extends HardwarePart {
  rpm?: number;
  noise_level?: number;
  water_cooled?: boolean;
  color?: string;
}
