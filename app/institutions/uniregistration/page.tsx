"use client";

import { Form, Input, Button, Card, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UniversityRegistration() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      console.log(typeof(values.phonenumber))
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schoolregistration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          type: "university",
          email: values.email,
          password: values.password,
          phonenumber:values.phonenumber
        }),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.error || "Failed");
     const slug = data.school.slug;

      message.success("School registered!");
      router.push(`/institutions/${slug}/setup`); 
    } catch (err: any) {
      message.error(err.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-lg rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          Register Your University / College
        </h1>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Institution Name"
            name="name"
            rules={[{ required: true, message: "Please enter the institution name" }]}
          >
            <Input placeholder="e.g. Harvard College" />
          </Form.Item>

          <Form.Item
            label="Admin Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="admin@university.com" />
          </Form.Item>
          <Form.Item
            label="Phone Number"
            name="phonenumber"
            rules={[{ required: true, message: "Please enter your phonenumber" }]}
          >
            <Input placeholder="Enter your phone number..." />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="mt-4"
          >
            Create Admin Account
          </Button>
        </Form>
      </Card>
    </main>
  );
}
