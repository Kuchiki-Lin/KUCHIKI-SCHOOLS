'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, DatePicker, Button, message, Select, Typography, Card, ConfigProvider } from 'antd';
import UploadAvatar from '@/app/components/uploadAvatar';

const { Option } = Select;
const { Title } = Typography;

export default function AdminRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    setLoading(true);

    try {
      const payload = {
        username: formData.email,
        password: formData.password,
        role: 'admin',
        fullname: formData.fullname,
        instcode: parseInt(formData.instcode)
      
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        message.success('Registration successful!');
        router.push('/loginpages/main-admin');
      } else {
        message.error(data.error || 'Failed to register');
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <Card
        className="border-2 border-black text-black"
        style={{
          maxWidth: 480,
          width: '100%',
          padding: '2rem',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <Title level={3} style={{ textAlign: 'center', color: 'white', marginBottom: '2rem' }}>
          ADMIN-REGISTRATION
        </Title>

        <ConfigProvider
          theme={{
            token: {
              colorTextPlaceholder: 'rgba(255, 255, 255, 0.6)',
            },
          }}
        >
          <Form layout="vertical" onFinish={handleSubmit}>
            <UploadAvatar />

            <Form.Item
              name="fullname"
              label={<span className="text-white">Full Name</span>}
              rules={[{ required: true }]}
            >
              <Input
                placeholder="Enter full name"
                style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}
              />
            </Form.Item>

            <Form.Item
              name="instcode"
              label={<span className="text-white">Institution Code</span>}
              rules={[{ required: true }]}
            >
              <Input
                             placeholder="Enter Inst-code"
                             type="number"
                             min={5}
                             max={100}
                             style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}
                           />
            </Form.Item>


            <Form.Item
              name="email"
              label={<span className="text-white">Email</span>}
              rules={[{ required: true, type: 'email' }]}
            >
              <Input
                placeholder="Enter email"
                style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-white">Password</span>}
              rules={[{ required: true }]}
            >
              <Input.Password
                placeholder="Enter password"
                style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="default"
                htmlType="submit"
                block
                loading={loading}
                className="text-white font-semibold border-white hover:bg-white hover:text-black"
                style={{ borderColor: 'white' }}
              >
                Register
              </Button>
            </Form.Item>
          </Form>
        </ConfigProvider>
      </Card>
    </div>
  );
}
