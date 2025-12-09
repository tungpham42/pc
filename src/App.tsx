import React from "react";
import { Layout, Row, Col, Tabs } from "antd";
import { BuildProvider, useBuild } from "./context/BuildProvider"; // Import useBuild
import { PartSelector } from "./components/PartSelector";
import { BuildSummary } from "./components/BuildSummary";
import { fetchParts } from "./services/api";

const { Header, Content } = Layout;

// Define columns outside component to avoid recreation on render
const cpuCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Cores", dataIndex: "core_count" },
  { title: "Socket", dataIndex: "socket" },
  { title: "Price", dataIndex: "price", render: (v: number) => `$${v}` },
];

const gpuCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Memory", dataIndex: "memory", render: (v: number) => `${v} GB` },
  { title: "Price", dataIndex: "price", render: (v: number) => `$${v}` },
];

const storageCols = [
  { title: "Name", dataIndex: "name", width: 250, ellipsis: true },
  {
    title: "Capacity",
    dataIndex: "capacity",
    render: (v: number) => `${v} GB`,
  },
  { title: "Type", dataIndex: "type" },
  { title: "Price", dataIndex: "price", render: (v: number) => `$${v}` },
];

const psuCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Wattage", dataIndex: "wattage", render: (v: number) => `${v} W` },
  { title: "Modular", dataIndex: "modular" },
  { title: "Price", dataIndex: "price", render: (v: number) => `$${v}` },
];

const caseCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Type", dataIndex: "type" },
  { title: "Price", dataIndex: "price", render: (v: number) => `$${v}` },
];

// --- INNER COMPONENT ---
const PCBuilderLayout: React.FC = () => {
  const { build } = useBuild(); // Access state for filtering

  // --- FILTER LOGIC ---

  // 1. CPU Filter: Must match Motherboard Socket (if Mobo selected)
  const filterCPU = (cpu: any) => {
    if (!build.motherboard) return true;
    return cpu.socket === build.motherboard.socket;
  };

  // 2. Motherboard Filter: Must match CPU Socket (if CPU selected)
  const filterMobo = (mobo: any) => {
    if (!build.cpu) return true;
    return mobo.socket === build.cpu.socket;
  };

  // 3. Case Filter: Must fit Motherboard Form Factor
  const filterCase = (pcCase: any) => {
    if (!build.motherboard) return true;
    const moboForm = build.motherboard.form_factor.toLowerCase();
    const caseType = pcCase.type.toLowerCase();

    // Basic logic: ITX boards fit almost anything, ATX boards need ATX cases
    if (
      moboForm.includes("atx") &&
      !moboForm.includes("micro") &&
      !moboForm.includes("mini")
    ) {
      // Standard ATX Board: Needs ATX case (not micro/mini)
      return (
        !caseType.includes("micro") &&
        !caseType.includes("mini") &&
        !caseType.includes("itx")
      );
    }
    if (moboForm.includes("micro")) {
      // Micro ATX Board: Fits in Micro ATX or Standard ATX
      return !caseType.includes("itx");
    }
    return true; // Mini ITX fits in everything usually
  };

  const items = [
    {
      key: "1",
      label: "CPU",
      children: (
        <PartSelector
          title="CPU"
          fetchData={fetchParts.getCPUs}
          dataKey="cpu"
          columns={cpuCols}
          filterFn={filterCPU} // Pass filter
        />
      ),
    },
    {
      key: "3",
      label: "Motherboard",
      children: (
        <PartSelector
          title="Motherboard"
          fetchData={fetchParts.getMotherboards}
          dataKey="motherboard"
          columns={[
            { title: "Model", dataIndex: "name" },
            { title: "Socket", dataIndex: "socket" },
            {
              title: "Price",
              dataIndex: "price",
              render: (v: number) => `$${v}`,
            },
          ]}
          filterFn={filterMobo} // Pass filter
        />
      ),
    },
    {
      key: "4",
      label: "Memory",
      children: (
        <PartSelector
          title="RAM"
          fetchData={fetchParts.getRAM}
          dataKey="ram"
          columns={[
            { title: "Model", dataIndex: "name" },
            { title: "Speed", dataIndex: "speed" },
            {
              title: "Price",
              dataIndex: "price",
              render: (v: number) => `$${v}`,
            },
          ]}
        />
      ),
    },
    {
      key: "6",
      label: "Video Card",
      children: (
        <PartSelector
          title="GPU"
          fetchData={fetchParts.getGPUs}
          dataKey="gpu"
          columns={gpuCols}
        />
      ),
    },
    {
      key: "7",
      label: "Case",
      children: (
        <PartSelector
          title="Case"
          fetchData={fetchParts.getCases}
          dataKey="case"
          columns={caseCols}
          filterFn={filterCase} // Pass filter
        />
      ),
    },
    {
      key: "8",
      label: "Power Supply",
      children: (
        <PartSelector
          title="PSU"
          fetchData={fetchParts.getPowerSupplies}
          dataKey="psu"
          columns={psuCols}
        />
      ),
    },
    {
      key: "2",
      label: "Cooler",
      children: (
        <PartSelector
          title="CPU Cooler"
          fetchData={fetchParts.getCPUCoolers}
          dataKey="cooler"
          columns={[
            { title: "Model", dataIndex: "name" },
            {
              title: "Price",
              dataIndex: "price",
              render: (v: number) => `$${v}`,
            },
          ]}
        />
      ),
    },
    {
      key: "5",
      label: "Storage",
      children: (
        <PartSelector
          title="Storage"
          fetchData={fetchParts.getStorage}
          dataKey="storage"
          columns={storageCols}
        />
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <h1 style={{ color: "white", margin: 0 }}>Ultimate PC Builder</h1>
      </Header>
      <Content style={{ padding: "20px 50px" }}>
        <Row gutter={24}>
          <Col span={16} md={16} sm={24} xs={24}>
            <Tabs defaultActiveKey="1" items={items} type="card" />
          </Col>
          <Col span={8} md={8} sm={24} xs={24}>
            <BuildSummary />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  return (
    <BuildProvider>
      <PCBuilderLayout />
    </BuildProvider>
  );
};

export default App;
