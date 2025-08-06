'use client';

import React, { useState } from 'react';
import PrivateRoute from '@/app/private';
import {
  Typography,
  Row,
  Col,
  Card,
  Input,
  Button,
  Space,
  Statistic,
  Divider,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  FileSearchOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export default function MainAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Hook into real search/filter API
    console.log('Searching for:', value);
  };

  return (
    <PrivateRoute>
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Title level={2} className="!mb-0">
            Admin Dashboard
          </Title>
          <p className="text-gray-500">Manage users, activity, and system insights</p>
        </div>

        <Input.Search
          allowClear
          enterButton="Search"
          size="large"
          placeholder="Search students, teachers, staff..."
          className="w-full md:w-96"
          onSearch={handleSearch}
        />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card variant='borderless'>
            <Statistic
              title="Active Students"
              value={1245}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card variant='borderless'>
            <Statistic
              title="Teachers Active"
              value={78}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card variant='borderless'>
            <Statistic
              title="Joining This Year"
              value={322}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card variant='borderless'>
            <Statistic
              title="Finance Accounts"
              value={12}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <div className="flex items-center justify-between bg-white rounded-xl shadow px-6 py-4">
        <div>
          <p className="text-lg font-semibold">Performance Overview</p>
          <p className="text-gray-500 text-sm">Track student and staff metrics</p>
        </div>
        <Button
          type="primary"
          icon={<ArrowRightOutlined />}
          size="large"
          className="rounded-xl"
          onClick={() => {
            // TODO: Navigate to performance page
            console.log('Navigating to performance page...');
          }}
        >
          Go to Performance
        </Button>
      </div>
    </div>
    </PrivateRoute>
  );
}
