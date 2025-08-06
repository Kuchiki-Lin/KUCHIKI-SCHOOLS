'use client';

import React, { useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import UploadAvatar from "@/app/components/uploadAvatar"

const { Option } = Select;

export default function FinanceRegistrationPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Finance form submitted:', values);
    message.success('Finance staff registered!');
    setLoading(false);
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Finance Registration</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <UploadAvatar />

        <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="employeeId" label="Employee ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select placeholder="Select role">
            <Option value="accountant">Accountant</Option>
            <Option value="clerk">Clerk</Option>
            <Option value="cashier">Cashier</Option>
          </Select>
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="w-full">
            Register
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
