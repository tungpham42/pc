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
}

export interface Motherboard extends HardwarePart {
  socket: string;
  form_factor: string;
  max_memory: number;
  memory_slots: number;
}

export interface RAM extends HardwarePart {
  speed: number;
  modules: number[];
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
  efficiency_rating: string;
  modular: string;
}

export interface Case extends HardwarePart {
  type: string;
  external_volume: number;
  internal_35_bays: number;
}

export interface CPUCooler extends HardwarePart {
  rpm?: number[];
  noise_level?: number[];
  water_cooled?: boolean;
}
