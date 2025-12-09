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
  filterFn, // Destructure new prop
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

  return (
    <Card
      title={`${title} Selection`}
      extra={
        <Tag color={filteredData.length < data.length ? "orange" : "blue"}>
          {filteredData.length} items {filterFn ? "(Compatible)" : ""}
        </Tag>
      }
      style={{ minHeight: 400 }}
    >
      <Space orientation="vertical" style={{ width: "100%" }}>
        <Input
          placeholder={`Search ${title}...`}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          style={{ marginBottom: 16 }}
          allowClear
        />
        <Table
          dataSource={filteredData}
          columns={[...columns, actionColumn]}
          loading={loading}
          rowKey={(record) => record.id || record.name}
          pagination={{ showSizeChanger: true }}
          scroll={{ x: true }}
          locale={{
            emptyText: <Empty description="No compatible parts found" />,
          }}
          size="middle"
        />
      </Space>
    </Card>
  );
};
