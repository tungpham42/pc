import React, { useEffect, useState } from "react";
import { Table, Button, Card, Input, Space, Empty, Tag } from "antd";
import { SearchOutlined, PlusOutlined, CheckOutlined } from "@ant-design/icons";
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
  // NEW: Optional filter function
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
  const [displayData, setDisplayData] = useState<any[]>([]); // Data after API load + Compatibility Filter
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const { setPart, build } = useBuild();

  // 1. Fetch Data
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

  // 2. Apply Compatibility Filter (Whenever data or filterFn changes)
  useEffect(() => {
    if (!data) return;

    // If a filter function exists, use it. Otherwise, show all.
    const compatibleData = filterFn ? data.filter(filterFn) : data;
    setDisplayData(compatibleData);
  }, [data, filterFn]);

  // 3. Apply Search Filter (On top of compatible data)
  const filteredData = displayData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.manufacturer &&
        item.manufacturer.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
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

  // 4. Enhance Columns with Automatic Sorting
  // We map over the passed columns and add a default sorter if the column has a dataIndex
  const tableColumns = [
    ...columns.map((col) => {
      // If the parent already defined a sorter, or there is no dataIndex to sort by, leave it alone
      if (col.sorter || !col.dataIndex) return col;

      return {
        ...col,
        sorter: (a: any, b: any) => {
          const valA = a[col.dataIndex];
          const valB = b[col.dataIndex];

          // Handle Number Sorting
          if (typeof valA === "number" && typeof valB === "number") {
            return valA - valB;
          }

          // Handle String Sorting
          if (typeof valA === "string" && typeof valB === "string") {
            return valA.localeCompare(valB);
          }

          // Fallback (e.g. mixed types or nulls)
          return (valA || "") > (valB || "") ? 1 : -1;
        },
      };
    }),
    actionColumn,
  ];

  return (
    <Card
      title={`${title}`} // Simplified title
      className="tech-card" // New class
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
          }}
        />
        <Table
          dataSource={filteredData}
          columns={tableColumns} // Use the new enhanced columns
          loading={loading}
          rowKey={(record) =>
            record.id || `${record.manufacturer}-${record.name}`
          }
          pagination={{ position: ["bottomRight"] }}
          scroll={{ x: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="NO COMPATIBLE UNITS"
              />
            ),
          }}
          size="small" // Compact view
        />
      </Space>
    </Card>
  );
};
