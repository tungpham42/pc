import React, { useState } from "react";
import {
  Card,
  List,
  Typography,
  Alert,
  Statistic,
  Button,
  Divider,
  Modal,
  Descriptions,
  message,
  Tooltip,
} from "antd";
import { useBuild } from "../context/BuildProvider";
import {
  DeleteOutlined,
  ThunderboltFilled,
  DownloadOutlined,
  CopyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export const BuildSummary: React.FC = () => {
  const {
    build,
    removePart,
    totalCost,
    estimatedWattage,
    compatibilityIssues,
  } = useBuild();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Define what constitutes a "Essential" build
  // Note: Cooler and GPU are sometimes optional (included stock cooler / iGPU),
  // but you can add them here if you want to enforce them.
  const requiredParts = [
    { key: "cpu", label: "CPU" },
    { key: "motherboard", label: "Motherboard" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "psu", label: "PSU" },
    { key: "case", label: "Case" },
  ];

  // 2. Calculate missing parts
  const missingParts = requiredParts.filter(
    (part) => !build[part.key as keyof typeof build]
  );

  const isBuildComplete = missingParts.length === 0;
  const hasErrors = compatibilityIssues.length > 0;

  // Disable if there are errors OR missing parts
  const isFinalizeDisabled = hasErrors || !isBuildComplete;

  const data = Object.entries(build).map(([key, value]) => ({
    type: key.toUpperCase(),
    name: value?.name || "Not Selected",
    price: value?.price || 0,
    key: key,
  }));

  const handleFinalize = () => setIsModalOpen(true);

  const handleCopy = () => {
    const textLines = [
      "My Ultimate PC Build",
      "--------------------",
      ...data
        .filter((item) => item.name !== "Not Selected")
        .map((item) => `${item.type}: ${item.name} ($${item.price})`),
      "--------------------",
      `Total Cost: $${totalCost.toFixed(2)}`,
      `Est. Wattage: ${estimatedWattage}W`,
    ];
    navigator.clipboard.writeText(textLines.join("\n")).then(() => {
      message.success("Build summary copied to clipboard!");
    });
  };

  const handleDownload = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(build, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "my_pc_build.json";
    link.click();
    message.success("Build configuration downloaded!");
  };

  return (
    <>
      <Card
        title="Your PC Build"
        className="shadow-md"
        style={{ marginTop: 16 }}
      >
        {/* Warnings */}
        {compatibilityIssues.map((issue, idx) => (
          <Alert
            key={idx}
            message={issue}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ))}

        {/* Missing Parts Warning (Optional visual cue) */}
        {!isBuildComplete && compatibilityIssues.length === 0 && (
          <Alert
            message="Incomplete Build"
            description={`Missing: ${missingParts
              .map((p) => p.label)
              .join(", ")}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              actions={[
                item.name !== "Not Selected" && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removePart(item.key as any)}
                  />
                ),
              ]}
            >
              <List.Item.Meta
                title={
                  <Text strong style={{ fontSize: "12px" }}>
                    {item.type}
                  </Text>
                }
                description={
                  <Text ellipsis style={{ maxWidth: 200 }}>
                    {item.name}
                  </Text>
                }
              />
              <div>${item.price.toFixed(2)}</div>
            </List.Item>
          )}
        />

        <Divider />

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              marginBottom: 15,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <ThunderboltFilled style={{ color: "#faad14" }} />
            <Text type="secondary">Est. Wattage:</Text>
            <Text strong>{estimatedWattage} W</Text>
          </div>

          <Statistic
            title="Total Estimate"
            value={totalCost}
            precision={2}
            prefix="$"
          />

          {/* 3. Button with Tooltip explaining why it is disabled */}
          <Tooltip
            title={
              hasErrors
                ? "Fix compatibility issues"
                : !isBuildComplete
                ? "Add all main parts to finalize"
                : ""
            }
          >
            <Button
              type="primary"
              size="large"
              style={{ marginTop: 15, width: "100%" }}
              disabled={isFinalizeDisabled} // <--- Logic applied here
              onClick={handleFinalize}
            >
              Finalize Build
            </Button>
          </Tooltip>
        </div>
      </Card>

      {/* Modal Code (No changes needed here, kept for completeness) */}
      <Modal
        title={
          <span>
            <CheckCircleOutlined style={{ color: "green", marginRight: 8 }} />
            Build Completed
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={handleCopy}>
            Copy Text
          </Button>,
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            Download JSON
          </Button>,
          <Button key="ok" type="primary" onClick={() => setIsModalOpen(false)}>
            Done
          </Button>,
        ]}
        width={700}
      >
        <Alert
          message="Compatibility Check Passed"
          description="Your selected components are compatible and ready for purchase."
          type="success"
          showIcon
          style={{ marginBottom: 20 }}
        />

        <Descriptions title="Component List" bordered column={1} size="small">
          {data
            .filter((item) => item.name !== "Not Selected")
            .map((item) => (
              <Descriptions.Item key={item.key} label={item.type}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span>{item.name}</span>
                  <span style={{ fontWeight: "bold" }}>
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </Descriptions.Item>
            ))}
          <Descriptions.Item label="TOTAL COST">
            <Text type="success" strong style={{ fontSize: 16 }}>
              ${totalCost.toFixed(2)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="EST. WATTAGE">
            <Text type="warning" strong>
              {estimatedWattage} W
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  );
};
