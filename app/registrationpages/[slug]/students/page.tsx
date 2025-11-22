"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Form, Input, DatePicker, Button, message, Select } from "antd";
import UploadAvatar from "@/app/components/uploadAvatar";

const { Option } = Select;

export default function StudentRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { slug } = useParams();

  const handleSubmit = async (formData: any) => {
    if(!slug)return;
    setLoading(true);

    try {
      const payload = {
        slug: slug,
        username: formData.email,
        password: formData.password,
        role: "student",
        fullname: formData.fullname,
        registrationNumber: formData.registrationNumber,
        age: parseInt(formData.age, 10),
        department: formData.department,
        year: formData.year?.format("YYYY"),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        message.success("Registration successful!");
        router.push(`/loginpages/${slug}/students`);
      } else {
        message.error(data.error || "Failed to register");
      }
    } catch (error) {
      console.error("Registration error:", error);
      message.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="w-full max-w-lg  backdrop-blur-lg rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-black mb-8">
          Student Registration
        </h1>

        <Form layout="vertical" onFinish={handleSubmit} className="space-y-4">
          <UploadAvatar />

          <Form.Item
            name="fullname"
            label={<span className="text-black">Full Name</span>}
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Enter full name"
              className="bg-transparent text-black border border-white rounded-md px-3 py-2 placeholder-gray-300"
            />
          </Form.Item>

          <Form.Item
            name="registrationNumber"
            label={<span className="text-black">Registration Number</span>}
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Enter registration number"
              className="bg-transparent text-black border border-white rounded-md px-3 py-2 placeholder-gray-300"
            />
          </Form.Item>

          <Form.Item
            name="age"
            label={<span className="text-black">Age</span>}
            rules={[{ required: true }]}
          >
            <Input
              type="number"
              min={5}
              max={100}
              placeholder="Enter age"
              className="bg-transparent text-black border border-white rounded-md px-3 py-2 placeholder-gray-300"
            />
          </Form.Item>

          <Form.Item
            name="department"
            label={<span className="text-black">Department</span>}
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select department"
              className="bg-transparent text-black"
              dropdownStyle={{ backgroundColor: "#111", color: "white" }}
            >
              <Option value="Economics">Economics</Option>
              <Option value="Computer-Science">Computer Science</Option>
              <Option value="Mathematics">Mathematics</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="year"
            label={<span className="text-black">Academic Year</span>}
            rules={[{ required: true }]}
          >
            <DatePicker
              picker="year"
              className="w-full bg-transparent text-black border border-white rounded-md px-3 py-2"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-black">Email</span>}
            rules={[{ required: true, type: "email" }]}
          >
            <Input
              placeholder="Enter email"
              className="bg-transparent text-black border border-white rounded-md px-3 py-2 placeholder-gray-300"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="text-black">Password</span>}
            rules={[{ required: true }]}
          >
            <Input.Password
              placeholder="Enter password"
              className="bg-transparent text-black border border-white rounded-md px-3 py-2 placeholder-gray-300"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="default"
              htmlType="submit"
              block
              loading={loading}
              className="w-full border border-white text-black font-semibold rounded-md py-2 hover:bg-white hover:text-black transition"
            >
              Register
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
