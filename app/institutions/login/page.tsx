"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Typography, message } from "antd";

const { Title } = Typography;

export default function SchoolLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schoollogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // keeps session cookie
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.error || "Login failed");

      message.success("Login successful!");

      // ✅ backend should return school_slug for redirect

      const { slug } = data;
      console.log(slug);

      router.push(`/institutions/${slug}/dashboard`);
    } catch (err: any) {
      message.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-white px-4">
      <Card className="w-full max-w-md rounded-xl shadow-lg p-6">
        <Title
          level={3}
          className="text-center mb-6"
          style={{ fontFamily: "cursive" }}
        >
          🏫 School Login
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input type="email" placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </main>
  );
}
