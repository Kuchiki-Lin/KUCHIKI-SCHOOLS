"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Input, Spin, Empty, Card, Tag, Select, Badge, Button } from "antd";
import {
  UserOutlined,
  BookOutlined,
  SearchOutlined,
  ApartmentOutlined,
  TeamOutlined,
  FolderOpenOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

// --- TYPES (Unchanged) ---
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

// --- HELPER FUNCTION: Get Initials for Avatar ---
const getInitials = (name: string): string => {
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  if (parts.length > 1) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  return "??";
};

// --- StudentCard Component (Unchanged from previous revision) ---
const StudentCard = ({ student }: { student: Student }) => {
  const capitalizedFullname = student.fullname.toUpperCase();
  const initials = getInitials(capitalizedFullname);
  
  const avatarColors = useMemo(() => {
    const hash = student.id % 6; 
    const colors = [
      { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
      { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-300" },
      { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
      { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300" },
      { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
      { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
    ];
    return colors[hash];
  }, [student.id]);

  return (
    <Card
      hoverable
      className="
        rounded-xl shadow-xl transition-all duration-300
        hover:shadow-2xl hover:scale-[1.03]
        bg-white border border-gray-100
      "
    >
      <div className="flex items-center gap-5">
        <div
          className={`
            w-14 h-14 flex-shrink-0 rounded-full flex items-center justify-center
            font-extrabold text-xl shadow-md
            ${avatarColors.bg} ${avatarColors.text} border-2 ${avatarColors.border}
          `}
          aria-label={`${capitalizedFullname}'s initials`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-extrabold text-gray-900 truncate tracking-tight">
            {capitalizedFullname}
          </p>
          <div className="flex items-center text-base text-gray-600 mt-1">
            <ApartmentOutlined className="mr-2 text-indigo-500" />
            <span className="font-medium">{student.department}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
        <span className="text-sm font-semibold text-gray-500 mr-1">Courses:</span>
        {student.courses.slice(0, 3).map((c, idx) => (
          <Tag
            key={idx}
            color="geekblue"
            className="rounded-lg text-xs font-semibold px-3 py-1 border-none shadow-sm"
          >
            <BookOutlined className="mr-1" />
            {c.code}
          </Tag>
        ))}
        {student.courses.length > 3 && (
          <Tag
            color="geekblue"
            className="rounded-lg text-xs font-semibold px-3 py-1 border-none shadow-sm"
          >
            <Badge
              count={`+${student.courses.length - 3}`}
              style={{ backgroundColor: '#2f54eb', color: '#fff' }}
              offset={[10, 0]}
            />
            <span className="ml-1">more</span>
          </Tag>
        )}
      </div>
    </Card>
  );
};

// --- DepartmentCard Component (Unchanged) ---
const DepartmentCard = ({
  department,
  count,
  onClick,
}: {
  department: string;
  count: number;
  onClick: (dept: string) => void;
}) => (
  <Card
    hoverable
    onClick={() => onClick(department)}
    className="
      rounded-xl shadow-lg transition-all duration-300 cursor-pointer
      hover:shadow-2xl hover:scale-[1.02]
      bg-white border border-gray-100
    "
  >
    <div className="flex items-center gap-4">
      <div className="text-4xl text-indigo-500 flex-shrink-0">
        <FolderOpenOutlined />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-800 truncate">
          {department}
        </p>
        <div className="flex items-center text-base text-gray-600 mt-1">
          <ApartmentOutlined className="mr-2" />
          <span className="font-medium">Department</span>
        </div>
      </div>
      <Badge
        count={`${count} Students`}
        style={{ backgroundColor: '#52c41a', color: '#fff', padding: '0 12px', height: '28px', lineHeight: '28px' }}
        className="font-bold text-base"
      />
    </div>
  </Card>
);

// --- Filter Controls for 'All' View (Simplified) ---
const FilterControls = ({
  departmentCounts,
  selectedDepartment,
  setSelectedDepartment,
  searchTerm,
  setSearchTerm,
}: {
  departmentCounts: Record<string, number>;
  selectedDepartment: string | null;
  setSelectedDepartment: (dept: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) => (
  <div className="flex flex-col md:flex-row gap-4 mb-10 p-5 bg-white rounded-xl shadow-lg border border-gray-100">
    <Select
      placeholder="Filter by Department"
      allowClear
      size="large"
      className="flex-1 min-w-[200px]"
      onChange={(value) => setSelectedDepartment(value)}
      value={selectedDepartment}
      style={{ minWidth: '200px' }}
      dropdownStyle={{ borderRadius: '8px' }}
    >
      {Object.entries(departmentCounts).map(([dept, count]) => (
        <Option key={dept} value={dept}>
          {dept} <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
        </Option>
      ))}
    </Select>
    <Search
      placeholder="Search by name or course code/name..."
      allowClear
      size="large"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="flex-1 w-full md:w-auto"
      prefix={<SearchOutlined className="text-gray-400" />}
      style={{ transition: 'border-color 0.3s' }}
    />
  </div>
);

// --- Main Page Component ---
export default function AllStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [viewState, setViewState] = useState<'departments' | 'students' | 'all'>('departments');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { slug } = useParams();

  // --- Data Fetching (Unchanged) ---
  useEffect(() => {
    setLoading(true);
    const apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/${slug}/students/detailed`;
    fetch(apiEndpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setStudents(data);
          setTotalStudents(data.length);
        } else {
          setStudents([]);
          setTotalStudents(0);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setStudents([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  // --- Derived State and Handlers ---
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.department] = (counts[s.department] || 0) + 1;
    });
    return counts;
  }, [students]);

  const departmentList = Object.keys(departmentCounts).sort();

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    let result = students;

    // 1. Filter by selected department (applies to 'students' view and 'all' view with a filter)
    if (selectedDepartment && viewState !== 'departments') {
      result = result.filter(s => s.department === selectedDepartment);
    } 
    
    // 2. Filter by search term
    if (term) {
        result = result.filter((student) => 
            student.fullname.toLowerCase().includes(term) ||
            student.courses.some(
                (course) =>
                    course.name.toLowerCase().includes(term) ||
                    course.code.toLowerCase().includes(term)
            )
        );
    }
    
    return result;
  }, [students, viewState, selectedDepartment, searchTerm]);


  const handleDepartmentClick = useCallback((department: string) => {
    setSelectedDepartment(department);
    setViewState('students');
    setSearchTerm('');
  }, []);

  const handleBackToDepartments = useCallback(() => {
    setSelectedDepartment(null);
    setViewState('departments');
    setSearchTerm('');
  }, []);
  
  const handleShowAllStudents = useCallback(() => {
      setSelectedDepartment(null); // Clear any department filter
      setViewState('all');
      setSearchTerm('');
  }, []);
  
  const handleBackToDirectory = useCallback(() => {
      setSelectedDepartment(null); 
      setViewState('departments');
      setSearchTerm('');
  }, []);

  // --- Title and Count Generation ---
  let title = "Academic Departments";
  let countText = `View ${departmentList.length} Departments`;
  let currentStudentCount = filteredStudents.length;

  if (viewState === 'students' && selectedDepartment) {
    title = `Students in ${selectedDepartment}`;
    countText = `Showing ${currentStudentCount} Students`;
  } else if (viewState === 'all') {
    title = "Student Directory";
    
    // If a filter is applied in the 'all' view
    if (selectedDepartment) {
        countText = `Showing ${currentStudentCount} Students in ${selectedDepartment} (Total: ${totalStudents})`;
    } else {
        countText = `Showing ${currentStudentCount} of ${totalStudents} Students`;
    }
  }


  // --- Render Logic ---
  const renderControls = () => {
    // Controls for the 'All Students' view
    if (viewState === 'all') {
        return (
            <FilterControls
              departmentCounts={departmentCounts}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
        );
    }
    
    // Search Bar for 'Departments' or 'Students' view
    // Note: The search in the 'departments' view acts as a global student search
    return (
        <div className="flex justify-end mb-8 p-5 bg-white rounded-xl shadow-lg border border-gray-100">
            <Search
                placeholder={viewState === 'departments' ? "Search for any student by name or course..." : "Search students within this department..."}
                allowClear
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-xl"
                prefix={<SearchOutlined className="text-gray-400" />}
            />
        </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip={<span className="text-indigo-600">Loading student data...</span>} />
        </div>
      );
    }

    if (viewState === 'departments') {
      if (departmentList.length === 0) {
        // Fallback for no departments found
        if (students.length > 0) {
             return (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-lg border border-gray-100">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<span className="text-gray-500 font-medium text-lg">Students found, but no departments listed.</span>}
                    />
                </div>
            );
        }
        
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-lg border border-gray-100">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-gray-500 font-medium text-lg">No students or departments found.</span>}
            />
          </div>
        );
      }
      
      // If search term is active in 'departments' view, show filtered students
      if (searchTerm) {
          if (filteredStudents.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-lg border border-gray-100">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<span className="text-gray-500 font-medium text-lg">No students found matching your search.</span>}
                    />
                </div>
              );
          }
          // Show the filtered students directly
          return (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
            </div>
          );
      }
      
      // Show Department Cards
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departmentList.map((dept) => (
            <DepartmentCard
              key={dept}
              department={dept}
              count={departmentCounts[dept]}
              onClick={handleDepartmentClick}
            />
          ))}
        </div>
      );
    }

    // Renders for 'all' or 'students' view (which are student lists)
    if (filteredStudents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-lg border border-gray-100">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-gray-500 font-medium text-lg">No students found matching your criteria.</span>}
          />
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50/80 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 pt-2 pb-6 border-b border-indigo-100">
          <div className="flex items-center">
            {/* Navigation Buttons based on state */}
            {viewState === 'students' && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToDepartments}
                className="mr-3 text-indigo-600 font-semibold"
              >
                Back to Departments
              </Button>
            )}
            {viewState === 'all' && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToDirectory}
                className="mr-3 text-indigo-600 font-semibold"
              >
                Back to Hierarchy
              </Button>
            )}
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tighter flex items-center">
              <TeamOutlined className="text-indigo-600 mr-3 text-5xl" />
              <span className="leading-tight">{title}</span>
            </h1>
          </div>
          
          {/* Main Action/Count Area */}
          <div className="flex items-center gap-4">
            
             {/* THE FIX: Show the button when we are NOT in the 'all' view */}
            {viewState !== 'all' && (
              <Button
                type="primary"
                size="large"
                icon={<TeamOutlined />}
                onClick={handleShowAllStudents}
                className="font-semibold bg-indigo-600 hover:bg-indigo-700 transition duration-300"
              >
                Show All Students
              </Button>
            )}
            
            {/* Student Count Badge */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg px-6 py-2 rounded-full shadow-xl transform transition-transform duration-300 hover:scale-[1.05] hover:shadow-2xl">
              {countText}
            </div>
          </div>
        </header>

        {/* Filter/Search Controls - Renders the appropriate bar based on viewState */}
        {renderControls()}

        {/* Main Content Area */}
        {renderContent()}
        
      </div>
    </div>
  );
}