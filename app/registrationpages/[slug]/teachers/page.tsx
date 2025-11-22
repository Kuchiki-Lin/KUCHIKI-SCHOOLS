'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Input, Select, Button, message, Typography, ConfigProvider } from 'antd';
import UploadAvatar from '@/app/components/uploadAvatar';

const { Option } = Select;
const { Title } = Typography;

export default function TeacherRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {slug} = useParams();

  const handleSubmit = async (formData: any) => {
    if(!slug)return;
    setLoading(true);
    try {
      const payload = {
        slug:slug,
        username: formData.email,
        password: formData.password,
        role: 'teacher',
        fullname: formData.fullName,
        employeeId: formData.employeeId,
        age: parseInt(formData.age, 10),
        subject: formData.subject,
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
        router.push(`/loginpages/${slug}/teachers`);
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
      <div
        
        style={{
          maxWidth: 580,
          color:"black",
          width: '100%',
          padding: '2rem',
          borderRadius: 12,
          border:"2px solid black",
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
         
        }}
      >
        <Title level={3} style={{ textAlign: 'center',  marginBottom: '2rem' }}>
          Teacher Registration
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
              name="fullName"
              label={<span >Full Name</span>}
              rules={[{ required: true }]}
            >
              <Input
                placeholder="Enter full name"
                style={{ borderColor: 'black' }}
              />
            </Form.Item>

            <Form.Item
              name="employeeId"
              label={<span >Employee ID</span>}
              rules={[{ required: true }]}
            >
              <Input
                placeholder="Enter employee ID"
                style={{ borderColor: 'black' }}
              />
            </Form.Item>

            <Form.Item
              name="age"
              label={<span >Age</span>}
              rules={[{ required: true }]}
            >
              <Input
                placeholder="Enter age"
                style={{ borderColor: 'black' }}
              />
            </Form.Item>

            <Form.Item
              name="subject"
              label={<span >Subject</span>}
              rules={[{ required: true }]}
            >
              <Input
                placeholder="Enter subject"
                style={{ borderColor: 'black' }}
              />
            </Form.Item>

            <Form.Item
              name="department"
              label={<span >Department</span>}
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select department"
                dropdownStyle={{ backgroundColor: '#1b121a', color: 'white' }}
              >
                <Option value="Economics">Economics</Option>
                <Option value="Computer-Science">Computer-Science</Option>
                <Option value="Mathematics">Mathematics</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="email"
              label={<span >Email</span>}
              rules={[{ required: true, type: 'email' }]}
            >
              <Input
                placeholder="Enter email"
                style={{ borderColor: 'black' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span >Password</span>}
              rules={[{ required: true }]}
            >
              <Input.Password
                placeholder="Enter password"
                style={{borderColor: 'black' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="default"
                htmlType="submit"
                block
                loading={loading}
                className="text-white font-semibold  bg-blue-200 border-white hover:bg-white hover:text-black"
                style={{
                 
                  borderColor: 'black',
                }}
              >
                Register
              </Button>
            </Form.Item>
          </Form>
        </ConfigProvider>
      </div>
    </div>
  );
}
