import React, { useEffect, useState } from "react";
import { Table, Button, Card, Input, Space, Empty, Tag } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  CheckOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useBuild } from "../context/BuildProvider";

interface PartSelectorProps {
  title: string;
  fetchData: () => Promise<any[]>;
  dataKey:
    | "cpu"
    | "gpu"
    | "motherboard"
    | "ram"
    | "storage"
    | "psu"
    | "case"
    | "cooler";
  columns: any[];
  filterFn?: (item: any) => boolean;
}

export const PartSelector: React.FC<PartSelectorProps> = ({
  title,
  fetchData,
  dataKey,
  columns,
  filterFn,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. New State for Sort Info
  const [sortedInfo, setSortedInfo] = useState<any>({});

  const { setPart, build } = useBuild();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchData()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load parts", err);
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  useEffect(() => {
    if (!data) return;
    const compatibleData = filterFn ? data.filter(filterFn) : data;
    setDisplayData(compatibleData);
  }, [data, filterFn]);

  const filteredData = displayData.filter((item) => {
    if (!searchText) return true;
    const lowerSearch = searchText.toLowerCase();

    return Object.values(item).some((val) => {
      return (
        val !== null &&
        val !== undefined &&
        String(val).toLowerCase().includes(lowerSearch)
      );
    });
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  // 2. Updated Reset Logic
  const handleReset = () => {
    setSearchText("");
    setCurrentPage(1);
    setSortedInfo({}); // Clear sort state
  };

  // 3. Handle Table Changes (Sorting)
  const handleChange = (pagination: any, filters: any, sorter: any) => {
    setSortedInfo(sorter);
  };

  const actionColumn = {
    title: "Select",
    key: "action",
    width: 100,
    render: (_: any, record: any) => {
      const isSelected =
        build[dataKey] && (build[dataKey] as any).name === record.name;

      return (
        <Button
          type={isSelected ? "default" : "primary"}
          icon={isSelected ? <CheckOutlined /> : <PlusOutlined />}
          onClick={() => setPart(dataKey, record)}
          disabled={isSelected ?? false}
        >
          {isSelected ? "Added" : "Add"}
        </Button>
      );
    },
  };

  // 4. Update Columns to respect Sort State
  const tableColumns = [
    ...columns.map((col) => {
      // Define specific sorter logic if not present
      let sorter = col.sorter;
      if (!sorter && col.dataIndex) {
        sorter = (a: any, b: any) => {
          const valA = a[col.dataIndex];
          const valB = b[col.dataIndex];

          if (typeof valA === "number" && typeof valB === "number") {
            return valA - valB;
          }
          if (typeof valA === "string" && typeof valB === "string") {
            return valA.localeCompare(valB);
          }
          return (valA || "") > (valB || "") ? 1 : -1;
        };
      }

      return {
        ...col,
        sorter,
        // Check if this column is the active sorter
        sortOrder:
          sortedInfo.columnKey === col.key || sortedInfo.field === col.dataIndex
            ? sortedInfo.order
            : null,
      };
    }),
    actionColumn,
  ];

  return (
    <Card
      title={`${title}`}
      className="tech-card"
      extra={
        <Tag
          color={filteredData.length < data.length ? "orange" : "cyan"}
          style={{ fontFamily: "JetBrains Mono" }}
        >
          {filteredData.length} UNITS
        </Tag>
      }
      style={{ minHeight: 400, border: "none" }}
    >
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        <div style={{ display: "flex", gap: "8px" }}>
          <Input
            placeholder={`Search ${title} database...`}
            prefix={<SearchOutlined style={{ color: "#00f3ff" }} />}
            value={searchText}
            onChange={handleSearch}
            allowClear
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid #333",
              color: "white",
              padding: "8px 12px",
              flex: 1,
            }}
          />
          <Button
            size="large"
            onClick={handleReset}
            icon={<ReloadOutlined />}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid #333",
              color: "white",
            }}
          >
            Reset
          </Button>
        </div>

        <Table
          dataSource={filteredData}
          columns={tableColumns}
          loading={loading}
          // 5. Connect onChange handler
          onChange={handleChange}
          rowKey={(record) =>
            record.id || `${record.manufacturer}-${record.name}`
          }
          pagination={{
            current: currentPage,
            position: ["bottomRight"],
            onChange: (page) => setCurrentPage(page),
          }}
          scroll={{ x: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="NO COMPATIBLE UNITS"
              />
            ),
          }}
          size="small"
        />
      </Space>
    </Card>
  );
};
