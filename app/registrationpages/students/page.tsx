'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, DatePicker, Button, message, Select, Typography, Card, ConfigProvider } from 'antd';
import UploadAvatar from '@/app/components/uploadAvatar';

const { Option } = Select;
const { Title } = Typography;

export default function StudentRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    setLoading(true);

    try {
      const payload = {
        username: formData.email,
        password: formData.password,
        role: 'student',
        fullname: formData.fullname,
        registrationNumber: formData.registrationNumber,
        age: parseInt(formData.age, 10),
        department: formData.department,
        year: formData.year?.format('YYYY'),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        message.success('Registration successful!');
        router.push('/loginpages/students');
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
        className="border-2 border-white text-white"
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
          Student Registration
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
              name="registrationNumber"
              label={<span className="text-white">Registration Number</span>}
              rules={[{ required: true }]}
            >
              <Input
                placeholder="Enter registration number"
                style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}
              />
            </Form.Item>

            <Form.Item
              name="age"
              label={<span className="text-white">Age</span>}
              rules={[{ required: true }]}
            >
              <Input
                placeholder="Enter age"
                type="number"
                min={5}
                max={100}
                style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}
              />
            </Form.Item>

            <Form.Item
              name="department"
              label={<span className="text-white">Department</span>}
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select department"
                dropdownStyle={{ backgroundColor: '#1a1a1a', color: 'white' }}
              >
                <Option value="Economics">Economics</Option>
                <Option value="Computer-Science">Computer-Science</Option>
                <Option value="Mathematics">Mathematics</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="year"
              label={<span className="text-white">Academic Year</span>}
              rules={[{ required: true }]}
            >
              <DatePicker
                picker="year"
                className="w-full"
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
