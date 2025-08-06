/*


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
*/




"use client";

import { useEffect, useState, useMemo } from "react";
import { Input, Collapse, Spin, Empty, Card } from "antd";
import Image from "next/image";
import {
  UserOutlined,
  BookOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Panel } = Collapse;

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/detailed`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          console.error("Invalid student data:", data);
          setStudents([]);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setStudents([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const groupedByDepartment = useMemo(() => {
    if (!students || students.length === 0) {
      return {};
    }
    return students.reduce(
      (acc, student) => {
        if (!acc[student.department]) {
          acc[student.department] = [];
        }
        acc[student.department].push(student);
        return acc;
      },
      {} as Record<string, Student[]>
    );
  }, [students]);

  const filteredDepartments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) {
      return groupedByDepartment;
    }

    const filtered = Object.entries(groupedByDepartment).reduce(
      (acc, [dept, studentList]) => {
        const filteredStudents = studentList.filter(
          (student) =>
            student.fullname.toLowerCase().includes(term) ||
            student.department.toLowerCase().includes(term) ||
            student.courses.some((course) =>
              course.name.toLowerCase().includes(term) || course.code.toLowerCase().includes(term)
            )
        );

        if (filteredStudents.length > 0) {
          acc[dept] = filteredStudents;
        }

        return acc;
      },
      {} as Record<string, Student[]>
    );

    return filtered;
  }, [groupedByDepartment, searchTerm]);

  return (
    <div className="min-h-screen p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-2 text-white">
            ALL STUDENT ACCOUNTS
        </h1>
        <p className="mb-6">
          View and analyze student details by department. Use the search bar to
          find specific students or departments.
        </p>

        <div className="mb-8">
          <Search
            placeholder="Search students by name, department, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            className="rounded-lg shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading student data..." />
          </div>
        ) : Object.keys(filteredDepartments).length > 0 ? (
          <Collapse accordion ghost>
            {Object.entries(filteredDepartments).map(([dept, list]) => (
              <Panel
                header={
                  <div className="flex items-center space-x-3">
                    <UserOutlined className="text-blue-500" />
                    <span className="font-semibold text-lg text-gray-700">
                      {dept} Department ({list.length})
                    </span>
                  </div>
                }
                key={dept}
                className="bg-white mb-4 rounded-xl shadow-md overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {list.map((student) => (
                    <Card
                      key={student.id}
                      hoverable
                      className="rounded-lg shadow-sm border-2 border-gray-100 transition-all duration-300 hover:border-blue-300"
                    >
                      <div className="flex items-center space-x-4">
                        <Image
                          src="/avatar.jpg"
                          width={60}
                          height={60}
                          className="rounded-full border-2 border-gray-200"
                          alt="Student Avatar"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">
                            {student.fullname}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.department}
                          </p>
                          <ul className="text-xs text-gray-600 mt-2 list-disc pl-4">
                            {student.courses.map((c, idx) => (
                              <li key={idx} className="flex items-center space-x-1">
                                <BookOutlined className="text-xs" />
                                <span>
                                  {c.name} ({c.code})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <div className="flex justify-center items-center h-64">
            <Empty
              description={
                <span className="text-gray-500">
                  No students found matching your search.
                </span>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}