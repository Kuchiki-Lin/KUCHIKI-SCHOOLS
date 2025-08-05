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
