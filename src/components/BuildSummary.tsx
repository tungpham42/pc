import React, { useState } from "react";
import {
  Card,
  List,
  Typography,
  Alert,
  Button,
  Divider,
  Modal,
  Descriptions,
  message,
  Tooltip,
  Progress,
  Tag,
} from "antd";
import { useBuild } from "../context/BuildProvider";
import {
  DeleteOutlined,
  ThunderboltFilled,
  DownloadOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  InfoCircleOutlined,
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

  // 1. ADDED: 'cooler' to the required list
  const requiredParts = [
    { key: "cpu", label: "CPU" },
    { key: "cooler", label: "Cooler" },
    { key: "motherboard", label: "Motherboard" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "gpu", label: "GPU" },
    { key: "psu", label: "PSU" },
    { key: "case", label: "Case" },
  ];

  // 2. LOGIC: Calculate completed AND missing parts
  const completedParts = requiredParts.filter(
    (p) => build[p.key as keyof typeof build]
  );
  const missingParts = requiredParts.filter(
    (p) => !build[p.key as keyof typeof build]
  );

  const progressPercent = Math.round(
    (completedParts.length / requiredParts.length) * 100
  );

  const isBuildComplete = progressPercent === 100;
  const hasErrors = compatibilityIssues.length > 0;
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
        title={
          <span>
            <SafetyCertificateOutlined /> SYSTEM STATUS
          </span>
        }
        className="tech-card"
        bordered={false}
      >
        {/* Progress Bar */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              COMPLETION
            </Text>
            <Text style={{ fontFamily: "JetBrains Mono" }}>
              {progressPercent}%
            </Text>
          </div>
          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeColor={{ "0%": "#bc13fe", "100%": "#00f3ff" }}
            trailColor="#333"
          />
        </div>

        {/* 3. NEW: Explicitly show missing parts if incomplete */}
        {!isBuildComplete && compatibilityIssues.length === 0 && (
          <Alert
            message={
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <Text
                  strong
                  style={{ fontSize: 11, color: "#faad14", marginRight: 5 }}
                >
                  MISSING:
                </Text>
                {missingParts.map((part) => (
                  <Tag
                    key={part.key}
                    color="warning"
                    style={{ margin: 0, fontSize: 10, border: "none" }}
                  >
                    {part.label.toUpperCase()}
                  </Tag>
                ))}
              </div>
            }
            type="warning"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{
              marginBottom: 10,
              background: "rgba(250, 173, 20, 0.1)",
              border: "1px solid #5a4a11",
            }}
          />
        )}

        {/* Warnings */}
        {compatibilityIssues.map((issue, idx) => (
          <Alert
            key={idx}
            message={<span style={{ fontSize: 12 }}>{issue}</span>}
            type="error"
            showIcon
            icon={<WarningOutlined />}
            style={{
              marginBottom: 10,
              background: "rgba(255, 77, 79, 0.1)",
              border: "1px solid #5a1111",
            }}
          />
        ))}

        {/* Parts List */}
        <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: 5 }}>
          <List
            itemLayout="horizontal"
            dataSource={data}
            split={false}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "8px 0",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div style={{ width: 30, flexShrink: 0 }}>
                  {item.name !== "Not Selected" && (
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removePart(item.key as any)}
                    />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text
                      style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}
                    >
                      {item.type}
                    </Text>
                    {item.price > 0 && (
                      <Text
                        style={{
                          fontFamily: "JetBrains Mono",
                          color: "#00f3ff",
                        }}
                      >
                        ${item.price}
                      </Text>
                    )}
                  </div>
                  <Text
                    ellipsis={{ tooltip: item.name }}
                    style={{
                      color: item.name === "Not Selected" ? "#444" : "#e0e0e0",
                      fontSize: 13,
                    }}
                  >
                    {item.name}
                  </Text>
                </div>
              </List.Item>
            )}
          />
        </div>

        <Divider style={{ borderColor: "#333" }} />

        {/* Footer Stats */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text type="secondary">
              <ThunderboltFilled style={{ color: "#faad14" }} /> LOAD
            </Text>
            <Text strong style={{ fontFamily: "JetBrains Mono", fontSize: 16 }}>
              {estimatedWattage} W
            </Text>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text type="secondary">TOTAL</Text>
            <Text
              strong
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 24,
                color: "#fff",
              }}
            >
              ${totalCost.toFixed(2)}
            </Text>
          </div>

          <Tooltip
            title={
              hasErrors
                ? "Fix issues first"
                : !isBuildComplete
                ? "Finish selection"
                : "Ready to build"
            }
          >
            <Button
              className="finalize-btn"
              type="primary"
              size="large"
              block
              disabled={isFinalizeDisabled}
              onClick={handleFinalize}
              style={{ height: 50, fontWeight: "bold", letterSpacing: 1 }}
            >
              INITIALIZE BUILD
            </Button>
          </Tooltip>
        </div>
      </Card>

      {/* Finalize Modal */}
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
