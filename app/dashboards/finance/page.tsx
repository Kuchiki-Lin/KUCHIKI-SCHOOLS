'use client';

import React from 'react';
import { Typography, Card, Statistic, Row, Col } from 'antd';

const { Title, Paragraph } = Typography;

export default function FinanceDashboard() {
  return (
    <>
      <Title level={2}>Finance Dashboard</Title>
      <Paragraph>Monitor financial operations and pending payments.</Paragraph>

      <Row gutter={[16, 16]} className="mt-4">
        <Col span={8}>
          <Card>
            <Statistic title="Total Revenue" value={250000} prefix="$" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Pending Fees" value={13500} prefix="$" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Monthly Expenses" value={9800} prefix="$" />
          </Card>
        </Col>
      </Row>
    </>
  );
}
