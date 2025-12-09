import React from "react";
import { Layout, Row, Col, Tabs, ConfigProvider, theme } from "antd";
import { BuildProvider, useBuild } from "./context/BuildProvider";
import { PartSelector } from "./components/PartSelector";
import { BuildSummary } from "./components/BuildSummary";
import { fetchParts } from "./services/api";
import { RocketOutlined } from "@ant-design/icons";
import "./App.css";

const { Header, Content } = Layout;

// --- 1. REF ACTORED COLUMN DEFINITIONS ---

const cpuCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Cores", dataIndex: "core_count", width: 80 },
  {
    title: "Base Clock",
    dataIndex: "core_clock",
    render: (v: number) => `${v} GHz`,
    width: 110,
  },
  {
    title: "Boost",
    dataIndex: "boost_clock",
    render: (v: number) => (v ? `${v} GHz` : "-"),
    width: 110,
  },
  {
    title: "TDP",
    dataIndex: "tdp",
    render: (v: number) => `${v} W`,
    width: 80,
  },
  { title: "Socket", dataIndex: "socket", width: 100 },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>,
  },
];

const moboCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Socket", dataIndex: "socket", width: 100 },
  { title: "Form Factor", dataIndex: "form_factor", width: 120 },
  {
    title: "Max RAM",
    dataIndex: "max_memory",
    render: (v: number) => `${v} GB`,
    width: 100,
  },
  { title: "Slots", dataIndex: "memory_slots", width: 80 },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>,
  },
];

const ramCols = [
  { title: "Model", dataIndex: "name", width: 220, ellipsis: true },
  { title: "Type", dataIndex: "type", width: 90 },
  {
    title: "Speed",
    dataIndex: "speed",
    render: (v: number) => `${v} MT/s`,
    width: 110,
  },
  {
    title: "Modules",
    dataIndex: "modules",
    render: (v: number[]) => `${v[0]}x${v[1]}GB`,
    width: 100,
  },
  {
    title: "CAS",
    dataIndex: "cas_latency",
    render: (v: number) => `C${v}`,
    width: 80,
  },
  {
    title: "Total",
    dataIndex: "total_capacity",
    render: (v: number) => <b>{v} GB</b>,
    width: 90,
  },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>,
  },
];

const gpuCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Chipset", dataIndex: "chipset", width: 140 },
  {
    title: "VRAM",
    dataIndex: "memory",
    render: (v: number) => `${v} GB`,
    width: 90,
  },
  {
    title: "Boost Clock",
    dataIndex: "boost_clock",
    render: (v: number) => `${v} MHz`,
    width: 120,
  },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>,
  },
];

const storageCols = [
  { title: "Name", dataIndex: "name", width: 250, ellipsis: true },
  {
    title: "Capacity",
    dataIndex: "capacity",
    render: (v: number) => (v >= 1000 ? `${v / 1000} TB` : `${v} GB`),
    width: 100,
  },
  { title: "Type", dataIndex: "type", width: 80 },
  { title: "Form Factor", dataIndex: "form_factor", width: 120 },
  { title: "Interface", dataIndex: "interface", width: 120 },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>,
  },
];

const psuCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  {
    title: "Wattage",
    dataIndex: "wattage",
    render: (v: number) => `${v} W`,
    width: 100,
  },
  { title: "Efficiency", dataIndex: "efficiency", width: 120 },
  { title: "Modular", dataIndex: "modular", width: 100 },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>,
  },
];

const caseCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Type", dataIndex: "type", width: 120 },
  { title: "Color", dataIndex: "color", width: 100 },
  {
    title: "Volume",
    dataIndex: "external_volume",
    render: (v: number) => (v ? `${v} L` : "-"),
    width: 90,
  },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>,
  },
];

const coolerCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  {
    title: "Fan RPM",
    dataIndex: "rpm",
    render: (v: number) => (v ? `${v} RPM` : "-"),
    width: 130,
  },
  {
    title: "Color",
    dataIndex: "color",
    width: 100,
  },
  {
    title: "Noise",
    dataIndex: "noise_level",
    render: (v: number) => (v ? `${v} dBA` : "-"),
    width: 120,
  },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>,
  },
];

// --- 2. LAYOUT COMPONENT ---

const PCBuilderLayout: React.FC = () => {
  const { build } = useBuild();

  // Compatibility Filters
  const filterCPU = (cpu: any) =>
    !build.motherboard || cpu.socket === build.motherboard.socket;
  const filterMobo = (mobo: any) =>
    !build.cpu || mobo.socket === build.cpu.socket;
  const filterCase = (pcCase: any) => {
    if (!build.motherboard) return true;
    const moboForm = build.motherboard.form_factor.toLowerCase();
    const caseType = pcCase.type.toLowerCase();

    if (
      moboForm.includes("atx") &&
      !moboForm.includes("micro") &&
      !moboForm.includes("mini")
    ) {
      return (
        !caseType.includes("micro") &&
        !caseType.includes("mini") &&
        !caseType.includes("itx")
      );
    }
    if (moboForm.includes("micro")) {
      return !caseType.includes("itx");
    }
    return true; // Mini ITX fits in almost everything
  };

  const items = [
    {
      key: "1",
      label: "Processor",
      children: (
        <PartSelector
          title="CPU"
          fetchData={fetchParts.getCPUs}
          dataKey="cpu"
          columns={cpuCols}
          filterFn={filterCPU}
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
          columns={moboCols}
          filterFn={filterMobo}
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
          columns={ramCols}
        />
      ),
    },
    {
      key: "6",
      label: "Graphics",
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
    {
      key: "8",
      label: "Power",
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
      key: "7",
      label: "Chassis",
      children: (
        <PartSelector
          title="Case"
          fetchData={fetchParts.getCases}
          dataKey="case"
          columns={caseCols}
          filterFn={filterCase}
        />
      ),
    },
    {
      key: "2",
      label: "Cooling",
      children: (
        <PartSelector
          title="CPU Cooler"
          fetchData={fetchParts.getCPUCoolers}
          dataKey="cooler"
          columns={coolerCols}
        />
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #333",
          padding: "0 50px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <RocketOutlined
          style={{ fontSize: "24px", color: "#00f3ff", marginRight: "10px" }}
        />
        <h1 className="logo-text" style={{ margin: 0, fontSize: "24px" }}>
          ULTIMATE PC BUILDER
        </h1>
      </Header>

      <Content style={{ padding: "30px 50px" }}>
        <Row gutter={24}>
          <Col span={17} lg={17} md={24} sm={24} xs={24}>
            <Tabs
              defaultActiveKey="1"
              items={items}
              type="line"
              size="large"
              tabBarStyle={{ marginBottom: 24, color: "#fff" }}
            />
          </Col>
          <Col span={7} lg={7} md={24} sm={24} xs={24}>
            <div style={{ position: "sticky", top: 100, marginTop: 24 }}>
              <BuildSummary />
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#00f3ff",
          colorBgContainer: "#141414",
          fontFamily: "'Inter', sans-serif",
          borderRadius: 8,
        },
      }}
    >
      <BuildProvider>
        <PCBuilderLayout />
      </BuildProvider>
    </ConfigProvider>
  );
};

export default App;
