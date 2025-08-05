"use client";

import { useEffect, useState } from "react";
import { Card, Input } from "antd";
import Image from "next/image";

const { Search } = Input;

type Course = {
  name: string;
  code: string;
};

type Student = {
  id: number;
  fullname: string;
  department: string;
  courses: Course[];
};

export default function AllStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

 useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/detailed`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error("Invalid student data:", data);
        setStudents([]); // fallback
      }
    })
    .catch(err => {
      console.error("Fetch error:", err);
      setStudents([]); // fallback on error
    });
}, []);

  const groupedByDepartment = students.reduce((acc, student) => {
    if (!acc[student.department]) {
      acc[student.department] = [];
    }
    acc[student.department].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  const filteredDepartments = Object.entries(groupedByDepartment).filter(
    ([dept, studentList]) =>
      dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentList.some(student =>
        student.fullname.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Students</h1>
      <div className="mb-4 max-w-sm">
        <Search
          placeholder="Search by name or department"
          enterButton
          onSearch={setSearchTerm}
          allowClear
        />
      </div>

      {filteredDepartments.map(([dept, list]) => (
        <div key={dept} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-700">
            {dept} Department
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {list.map(student => (
              <Card key={student.id} className="shadow rounded-xl">
                <div className="flex items-start space-x-4">
                  <Image
                    src="/avatar.jpg"
                    width={60}
                    height={60}
                    className="rounded-full"
                    alt="Student Avatar"
                  />
                  <div>
                    <p className="font-semibold">{student.fullname}</p>
                    <p className="text-gray-500 text-sm mb-2">{student.department}</p>
                    <ul className="text-sm list-disc pl-4">
                      {student.courses.map((c, idx) => (
                        <li key={idx}>{c.name} ({c.code})</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
