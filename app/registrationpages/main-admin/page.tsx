'use client';

import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import UploadAvatar from '@/app/components/uploadAvatar';

export default function MainAdminRegistrationPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Main Admin form submitted:', values);
    message.success('Admin registered!');
    setLoading(false);
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Admin Registration</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <UploadAvatar />

        <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="adminId" label="Admin ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
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
