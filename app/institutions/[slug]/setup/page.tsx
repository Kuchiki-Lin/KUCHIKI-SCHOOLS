

"use client";

import { useEffect, useState } from "react";
import { Form, Upload, Button, Card, message, Select, Input, Row, Col, Tooltip, Spin } from "antd";
import { UploadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";

const { Option } = Select;

// --- Helper ---
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const SetupForm = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form] = Form.useForm();
  const router = useRouter();
  const { slug } = useParams();

  const logoFiles = Form.useWatch("logo", form);
  const backgroundFiles = Form.useWatch("background", form);
  const isLogoUploaded = logoFiles && logoFiles.length > 0;
  const isBackgroundUploaded = backgroundFiles && backgroundFiles.length > 0;

  const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList);

  // --- Prefill with school setup ---
  useEffect(() => {
    const fetchSetup = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/${slug}/setup`);
        if (!res.ok) throw new Error("Failed to load school setup");
        const data = await res.json();
        const school = data.school;

        form.setFieldsValue({
          theme: school.theme_template || "default",
          logoText: school.logo_text || "",
          backgroundColor: school.background_color || "#ffffff",
        });

        if (school.logo_url) {
          form.setFieldsValue({
            logo: [
              {
                uid: "-1",
                name: "Current Logo",
                status: "done",
                url: `${process.env.NEXT_PUBLIC_API_URL}${school.logo_url}`,
              },
            ],
          });
        }

        if (school.background_url) {
          form.setFieldsValue({
            background: [
              {
                uid: "-2",
                name: "Current Background",
                status: "done",
                url: `${process.env.NEXT_PUBLIC_API_URL}${school.background_url}`,
              },
            ],
          });
        }
      } catch (err: any) {
        message.error(err.message || "Failed to fetch school setup");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchSetup();
  }, [slug, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (!isLogoUploaded && !isBackgroundUploaded) {
        message.error("You must upload EITHER a Logo OR a Background, not both.");
        return;
      }
     

      let logoBase64 = null;
      let backgroundBase64 = null;
      if (values.logo?.[0]?.originFileObj) {
        logoBase64 = await fileToBase64(values.logo[0].originFileObj);
      }
      if (values.background?.[0]?.originFileObj) {
        backgroundBase64 = await fileToBase64(values.background[0].originFileObj);
      }

      const payload = {
        logo: logoBase64,
        background: backgroundBase64,
        theme: values.theme,
        logoText: values.logoText,
        backgroundColor: values.backgroundColor,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/${slug}/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save setup");

      message.success("School design configuration saved successfully!");
      router.push(`/institutions/${slug}/dashboard`);
    } catch (err: any) {
      message.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ theme: "default", backgroundColor: "#ffffff" }}>
      {/* same fields as your version ... */}
      <Row gutter={24}>
        {/* Upload Logo Field */}
       {/* Upload Logo Field */}
<Col span={12}>
  <Form.Item
    label={
      <span className="font-semibold text-gray-700">
        Upload Logo
        <Tooltip title="Upload your school's official logo. Upload EITHER a Logo OR a Background, not both.">
          <InfoCircleOutlined className="ml-2 text-blue-500/80" />
        </Tooltip>
      </span>
    }
    name="logo"
    valuePropName="fileList"
    getValueFromEvent={normFile}
  >
    <Upload
      listType="picture-card"
      beforeUpload={() => false}
      maxCount={1}
     
      className="upload-logo-card [&_.ant-upload-list-picture-card-container]:rounded-lg"
    >
      {!isLogoUploaded && (
        <div className="text-blue-600">
          <UploadOutlined /> Upload Logo
        </div>
      )}
    </Upload>
  </Form.Item>
</Col>

{/* Upload Background Image Field */}
<Col span={12}>
  <Form.Item
    label={
      <span className="font-semibold text-gray-700">
        Upload Background Image
        <Tooltip title="Upload a large image for the background banner. Upload EITHER a Logo OR a Background, not both.">
          <InfoCircleOutlined className="ml-2 text-pink-500/80" />
        </Tooltip>
      </span>
    }
    name="background"
    valuePropName="fileList"
    getValueFromEvent={normFile}
  >
    <Upload
      listType="picture-card"
      beforeUpload={() => false}
      maxCount={1}
  
      className="upload-background-card [&_.ant-upload-list-picture-card-container]:rounded-lg"
    >
      {!isBackgroundUploaded &&(
        <div className="text-pink-600">
          <UploadOutlined /> Upload Background
        </div>
      )}
    </Upload>
  </Form.Item>
</Col>

      </Row>

      <h2 className="text-xl font-bold text-gray-800 mt-4 mb-4 border-b pb-2 border-gray-100">Appearance Settings</h2>
      
      <Row gutter={24}>
        {/* Theme Selection */}
        <Col span={12}>
          <Form.Item
            label="Choose Theme/Template"
            name="theme"
            rules={[{ required: true, message: "Please select a theme" }]}
          >
            <Select size="large" placeholder="Select a template/theme" className="rounded-lg">
              <Option value="default">Default (Clean & Professional)</Option>
              <Option value="modern">Modern (Bold & Minimal)</Option>
              <Option value="classic">Classic (Traditional Layout)</Option>
              <Option value="minimal">Minimal (Light & Airy)</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Logo Text */}
        <Col span={12}>
          <Form.Item label="Text to accompany Logo" name="logoText">
            <Input size="large" placeholder="E.g., School Motto or Title" />
          </Form.Item>
        </Col>
      </Row>

      {/* Background Color */}
      <Form.Item label="Primary Background Color (Used if no background image is set)" name="backgroundColor">
        <Input type="color" className="w-24 h-12 p-0 border-none rounded-lg shadow-inner" />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        loading={loading}
        className="mt-6 h-12 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 hover:from-purple-700 hover:to-pink-600 font-bold shadow-lg transition duration-300"
      >
        Save and Finalize Setup
      </Button>
    </Form>
  );
};

export default SetupForm;
