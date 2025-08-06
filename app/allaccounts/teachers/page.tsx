
/*


"use client";

import { useEffect, useState } from "react";
import { Input, Card } from "antd";
import Image from "next/image";
import { SearchOutlined } from "@ant-design/icons";

type Course = {
  name: string;
  code: string;
  student_count: number;
};

type Teacher = {
  id: number;
  fullname: string;
  department: string;
  courses: Course[];
};

export default function AllTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers/detailed`)
      .then((res) => res.json())
      .then(setTeachers);
  }, []);

  const filtered = teachers.filter(t =>
    t.fullname.toLowerCase().includes(query.toLowerCase()) ||
    t.department.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Teachers</h1>

      <Input
        prefix={<SearchOutlined />}
        placeholder="Search by name or department"
        className="mb-6 max-w-md"
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((teacher) => (
          <Card key={teacher.id} className="shadow rounded-xl">
            <div className="flex items-center space-x-4 mb-4">
              <Image
                src="/avatar.jpg"
                width={60}
                height={60}
                className="rounded-full"
                alt="Avatar"
              />
              <div>
                <p className="font-semibold text-lg">{teacher.fullname}</p>
                <p className="text-white text-sm font-semibold bg-blue-600 px-2 py-1 rounded w-fit">
                  {teacher.department}
                </p>
              </div>
            </div>

            {teacher.courses.length > 0 ? (
              <ul className="text-sm space-y-1">
                {teacher.courses.map((course, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{course.name} ({course.code})</span>
                    <span className="text-gray-600">{course.student_count} students</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic">No courses assigned</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

*/





"use client";

import { useEffect, useState, useMemo } from "react";
import { Input, Card, Tag, Empty, Spin } from "antd";
import Image from "next/image";
import {
  SearchOutlined,
  UserOutlined,
  ReadOutlined,
  TeamOutlined,
} from "@ant-design/icons";

type Course = {
  name: string;
  code: string;
  student_count: number;
};

type Teacher = {
  id: number;
  fullname: string;
  department: string;
  courses: Course[];
};

export default function AllTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers/detailed`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTeachers(data);
        } else {
          console.error("Invalid teacher data:", data);
          setTeachers([]);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setTeachers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredTeachers = useMemo(() => {
    const term = query.toLowerCase();
    if (!term) {
      return teachers;
    }
    return teachers.filter(
      (t) =>
        t.fullname.toLowerCase().includes(term) ||
        t.department.toLowerCase().includes(term) ||
        t.courses.some((c) => c.name.toLowerCase().includes(term))
    );
  }, [teachers, query]);

  return (
    <div className=" min-h-screen p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10 p-8  rounded-2xl shadow-xl">
          <h1 className="text-2xl font-extrabold  tracking-tight mb-2">
            TEACHER DIRECTORY 
          </h1>
          <p className=" max-w-xl mx-auto text-white">
            A comprehensive overview of all teaching staff, their departments,
            and assigned courses.
          </p>
        </div>

        {/* Search Bar and Total Count */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 w-[500px]">
          <Input
            prefix={<SearchOutlined className="text-lg text-gray-400" />}
            placeholder="Search by name, department, or course..."
            className="w-full sm:w-80 rounded-full shadow-sm mb-4 sm:mb-0"
            size="large"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            allowClear
          />
          <div className=" p-3 ml-3 px-5  shadow-sm font-medium bg-white ">
              <span className="font-bold text-blue-600">{filteredTeachers.length}</span>: TEACHERS
          </div>
        </div>

        {/* Teacher Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading teacher data..." />
          </div>
        ) : filteredTeachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeachers.map((teacher) => (
              <Card
                key={teacher.id}
                className="rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-400 transition-all duration-300"
              >
                {/* Teacher Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <Image
                    src="/avatar.jpg"
                    width={72}
                    height={72}
                    className="rounded-full ring-4 ring-blue-200"
                    alt="Teacher Avatar"
                  />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">
                      {teacher.fullname}
                    </h3>
                    <Tag
                      color="blue"
                      className="mt-1 font-semibold text-xs py-1 px-2 rounded-full"
                      icon={<UserOutlined />}
                    >
                      {teacher.department}
                    </Tag>
                  </div>
                </div>
                <hr className="my-4 border-gray-200" />

                {/* Courses List */}
                {teacher.courses.length > 0 ? (
                  <ul className="space-y-3">
                    {teacher.courses.map((course, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ReadOutlined className="text-blue-500" />
                          <span className="font-medium text-gray-700">
                            {course.name} ({course.code})
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Tag
                            color="cyan"
                            className="text-xs font-semibold rounded-full"
                            icon={<TeamOutlined />}
                          >
                            {course.student_count}
                          </Tag>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 italic py-4">
                    <ReadOutlined className="text-2xl mb-2" />
                    <span>No courses assigned.</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <Empty
              description={
                <span className="text-gray-500">
                  No teachers found matching your search.
                </span>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}