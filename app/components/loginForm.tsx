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
      className="border-2 w-fit h-fit"
      style={{
        maxWidth: 420,
        width: '100%',
        padding: '2rem',
        borderRadius: 16,
        backgroundColor:"white",
               
        backdropFilter: 'blur(8px)',
      }}
       variant="borderless" 
    >
      <div>



<Title
        level={3}

        style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: 'black',
          backgroundColor:"white"
,          fontFamily:"cursive",
          fontWeight: 800,
        }}
      >
        {title}
      </Title>


      </div>
      
      <Form
        name="login"
        layout="vertical"
        onFinish={onLogin}
        initialValues={{ remember: true }}
      >
        <Form.Item
          label={
            <span style={{  fontSize: '14px', fontWeight: 500,fontFamily:"cursive"  }}>
              Username
            </span>
          }
          name="username"
          rules={[{ required: true, message: 'Please enter your username' }]}
        >
          <Input
            prefix={<UserOutlined/>}
            placeholder="Enter your username"
            style={{
              fontFamily:"cursive",
              
              borderColor: 'black',
            }}
            className="placeholder-black"
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontSize: '14px', fontWeight: 500,fontFamily:"cursive"  }}>
              Password
            </span>
          }
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter your password"
            style={{
              color: 'black',
      
              borderColor: 'black',
            }}
            className="placeholder-black"
          />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked">
          <Checkbox style={{fontFamily:"cursive",}}
          >Remember me</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            htmlType="submit"
            block
            className=" hover:bg-black/15 text-black font-medium py-2 rounded transition duration-200 border-none"
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
