import React, { createContext, useContext, useState } from "react";
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

interface BuildState {
  cpu: CPU | null;
  gpu: GPU | null;
  motherboard: Motherboard | null;
  ram: RAM | null;
  storage: Storage | null;
  psu: PowerSupply | null;
  case: Case | null;
  cooler: CPUCooler | null;
}

interface BuildContextType {
  build: BuildState;
  setPart: (type: keyof BuildState, part: any) => void;
  removePart: (type: keyof BuildState) => void;
  totalCost: number;
  estimatedWattage: number;
  compatibilityIssues: string[];
}

const BuildContext = createContext<BuildContextType | undefined>(undefined);

export const BuildProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [build, setBuild] = useState<BuildState>({
    cpu: null,
    gpu: null,
    motherboard: null,
    ram: null,
    storage: null,
    psu: null,
    case: null,
    cooler: null,
  });

  const setPart = (type: keyof BuildState, part: any) => {
    setBuild((prev) => ({ ...prev, [type]: part }));
  };

  const removePart = (type: keyof BuildState) => {
    setBuild((prev) => ({ ...prev, [type]: null }));
  };

  const totalCost = Object.values(build).reduce(
    (acc, part) => acc + (part?.price || 0),
    0
  );

  // 1. Calculate Estimated Wattage (CPU TDP + GPU TDP + buffer)
  const cpuTdp = build.cpu?.tdp || 0;
  const gpuTdp = (build.gpu as any)?.tdp || 0; // Note: Ensure your GPU type has TDP in real data
  const baseSystemDraw = 50; // Motherboard, fans, SSDs usually draw ~50W combined
  const estimatedWattage = cpuTdp + gpuTdp + baseSystemDraw;

  // 2. Compatibility Logic
  const compatibilityIssues: string[] = [];

  // Socket Check
  if (
    build.cpu &&
    build.motherboard &&
    build.cpu.socket !== build.motherboard.socket
  ) {
    compatibilityIssues.push(
      `Socket Mismatch: CPU is ${build.cpu.socket}, Board is ${build.motherboard.socket}`
    );
  }

  // PSU Wattage Check
  if (build.psu && build.psu.wattage < estimatedWattage) {
    compatibilityIssues.push(
      `Weak PSU: System needs ~${estimatedWattage}W, but PSU is only ${build.psu.wattage}W`
    );
  }

  // Case Form Factor Check (Simple Logic)
  if (build.case && build.motherboard) {
    const moboForm = build.motherboard.form_factor.toLowerCase();
    const caseType = build.case.type.toLowerCase();
    if (caseType.includes("itx") && !moboForm.includes("itx")) {
      compatibilityIssues.push(
        "Size Mismatch: ATX/mATX motherboard likely won't fit in ITX case."
      );
    }
  }

  return (
    <BuildContext.Provider
      value={{
        build,
        setPart,
        removePart,
        totalCost,
        estimatedWattage,
        compatibilityIssues,
      }}
    >
      {children}
    </BuildContext.Provider>
  );
};

export const useBuild = () => {
  const context = useContext(BuildContext);
  if (!context) throw new Error("useBuild must be used within a BuildProvider");
  return context;
};
