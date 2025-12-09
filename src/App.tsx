import React from "react";
import { Layout, Row, Col, Tabs, ConfigProvider, theme } from "antd";
import { BuildProvider, useBuild } from "./context/BuildProvider";
import { PartSelector } from "./components/PartSelector";
import { BuildSummary } from "./components/BuildSummary";
import { fetchParts } from "./services/api";
import { RocketOutlined } from "@ant-design/icons";
import "./App.css";

const { Header, Content } = Layout;

// Define columns outside component to avoid recreation on render
const cpuCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Cores", dataIndex: "core_count" },
  { title: "Socket", dataIndex: "socket" },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>, // Added class
  },
];

const gpuCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Memory", dataIndex: "memory", render: (v: number) => `${v} GB` },
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
    render: (v: number) => `${v} GB`,
  },
  { title: "Type", dataIndex: "type" },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>,
  },
];

const psuCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Wattage", dataIndex: "wattage", render: (v: number) => `${v} W` },
  { title: "Modular", dataIndex: "modular" },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>,
  },
];

const caseCols = [
  { title: "Model", dataIndex: "name", width: 250, ellipsis: true },
  { title: "Type", dataIndex: "type" },
  {
    title: "Price",
    dataIndex: "price",
    render: (v: number) => <span className="price-tag">${v}</span>,
  },
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
  const filterMobo = (mobo: any) => {
    if (!build.cpu) return true;
    return mobo.socket === build.cpu.socket;
  };
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
    return true;
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
          columns={[
            { title: "Model", dataIndex: "name" },
            { title: "Socket", dataIndex: "socket" },
            {
              title: "Price",
              dataIndex: "price",
              render: (v: number) => <span className="price-tag">${v}</span>,
            },
          ]}
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
          columns={[
            { title: "Model", dataIndex: "name" },
            { title: "Speed", dataIndex: "speed" },
            {
              title: "Price",
              dataIndex: "price",
              render: (v: number) => <span className="price-tag">${v}</span>,
            },
          ]}
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
      key: "2",
      label: "Cooling",
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
              render: (v: number) => <span className="price-tag">${v}</span>,
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
            {/* Sticky Container for the summary */}
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
