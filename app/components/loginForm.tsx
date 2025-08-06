'use client';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Typography, Card } from 'antd';

const { Title } = Typography;

interface LoginFormProps {
  title: string;
  onLogin: (values: any) => void;
}

export default function LoginForm({ title, onLogin }: LoginFormProps) {
  return (
    <Card
      className="border-2 border-white text-white"
      style={{
        maxWidth: 420,
        width: '100%',
        padding: '2rem',
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: 'white',
        backdropFilter: 'blur(8px)',
      }}
       variant="borderless" 
    >
      <Title
        level={3}
        style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: 'white',
          fontWeight: 500,
        }}
      >
        {title}
      </Title>

      <Form
        name="login"
        layout="vertical"
        onFinish={onLogin}
        initialValues={{ remember: true }}
      >
        <Form.Item
          label={
            <span style={{ color: 'white', fontSize: '16px', fontWeight: 300 }}>
              Username
            </span>
          }
          name="username"
          rules={[{ required: true, message: 'Please enter your username' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: 'white' }} />}
            placeholder="Enter your username"
            style={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'white',
            }}
            className="placeholder-white"
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ color: 'white', fontSize: '16px', fontWeight: 300 }}>
              Password
            </span>
          }
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: 'white' }} />}
            placeholder="Enter your password"
            style={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'white',
            }}
            className="placeholder-white"
          />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked">
          <Checkbox style={{ color: 'white' }}>Remember me</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            htmlType="submit"
            block
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition duration-200 border-none"
            type="default"
          >
            Log in
          </Button>
        </Form.Item>
      </Form>

      <style jsx global>{`
        .ant-input::placeholder,
        .ant-input-password input::placeholder {
          color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </Card>
  );
}
