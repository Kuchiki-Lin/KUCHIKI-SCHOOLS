"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Input, Card, Tag, Empty, Spin, Tooltip, Button, Badge } from "antd";
import { useParams } from "next/navigation";

import {
  SearchOutlined,
  UserOutlined,
  ReadOutlined,
  TeamOutlined,
  ApartmentOutlined,
  FolderOpenOutlined, // For Department Card
  ArrowLeftOutlined, // For back button
  SolutionOutlined, // Main directory icon
} from "@ant-design/icons";

const { Search } = Input;

// --- TYPES (Unchanged) ---
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

// --- HELPER FUNCTION: Get Initials for Avatar (Reused) ---
const getInitials = (name: string): string => {
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  if (parts.length > 1) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  return "??";
};

// --- TeacherCard Component ---
const TeacherCard = ({ teacher }: { teacher: Teacher }) => {
  const capitalizedFullname = teacher.fullname.toUpperCase(); // Capitalize name
  const initials = getInitials(capitalizedFullname);
  
  // Use a different set of colors for teachers to visually distinguish them from students
  const avatarColors = useMemo(() => {
    const hash = teacher.id % 6; 
    const colors = [
      { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
      { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
      { bg: "bg-fuchsia-100", text: "text-fuchsia-700", border: "border-fuchsia-300" },
      { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300" },
      { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-300" },
      { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300" },
    ];
    return colors[hash];
  }, [teacher.id]);

  return (
    <Card
      hoverable
      className="
        rounded-xl shadow-xl transition-all duration-300
        hover:shadow-2xl hover:scale-[1.03]
        bg-white border border-gray-100
      "
    >
      {/* Teacher Info Section */}
      <div className="flex items-center gap-5 pb-4 border-b border-gray-100 mb-4">
        {/* Initials-Based Avatar */}
        <div
          className={`
            w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center
            font-extrabold text-2xl shadow-md
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
            <ApartmentOutlined className="mr-2 text-red-500" />
            <span className="font-medium">{teacher.department}</span>
          </div>
        </div>
      </div>

      {/* Course List */}
      <h4 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider flex items-center">
        <ReadOutlined className="mr-2 text-red-500" />
        Teaching Courses ({teacher.courses.length})
      </h4>
      {teacher.courses.length > 0 ? (
        <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {teacher.courses.map((course) => (
            <li key={course.code} className="flex items-center justify-between">
              <Tooltip title={course.name} placement="topLeft">
                <span className="font-medium text-sm text-gray-700 truncate max-w-[65%]">
                  {course.name}
                </span>
              </Tooltip>
              <Tag
                color="red"
                className="text-xs font-semibold rounded-lg px-2 py-1 shadow-sm flex items-center gap-1"
              >
                <TeamOutlined />
                {course.student_count} Students
              </Tag>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400 italic py-4">
          <span>No courses assigned.</span>
        </div>
      )}
    </Card>
  );
};

// --- DepartmentCard Component (Reused and adapted) ---
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
      <div className="text-4xl text-red-500 flex-shrink-0">
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
      {/* Student count is now green in the badge */}
      <Badge
        count={`${count} Teachers`}
        style={{ backgroundColor: '#52c41a', color: '#fff', padding: '0 12px', height: '28px', lineHeight: '28px' }}
        className="font-bold text-base"
      />
    </div>
  </Card>
);

// --- Filter Controls for 'All' View ---
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
    <Input.Group compact className="flex-1 min-w-[250px]">
        <span className="ant-input-group-addon h-[40px] leading-10 px-3 bg-gray-50 border border-gray-200 rounded-l-lg text-gray-500 font-medium">Filter:</span>
        <select
            value={selectedDepartment || ''}
            onChange={(e) => setSelectedDepartment(e.target.value || null)}
            className="ant-input ant-input-lg h-[40px] flex-1 border border-gray-200 focus:ring-red-500 focus:border-red-500 transition duration-150"
            style={{ width: 'auto' }}
        >
            <option value="">All Departments</option>
            {Object.entries(departmentCounts).map(([dept, count]) => (
                <option key={dept} value={dept}>
                    {dept} ({count})
                </option>
            ))}
        </select>
    </Input.Group>

    <Search
      placeholder="Search by name, department, or course..."
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
export default function AllTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // State for the new hierarchical view
  const [viewState, setViewState] = useState<'departments' | 'teachers' | 'all'>('departments');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState("");
  
  const { slug } = useParams();

  // --- Data Fetching (Reused) ---
  useEffect(() => {
    setLoading(true);
    const apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/${slug}/teachers/detailed`;
    fetch(apiEndpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          data.sort((a, b) => a.fullname.localeCompare(b.fullname));
          setTeachers(data);
          setTotalTeachers(data.length);
        } else {
          setTeachers([]);
          setTotalTeachers(0);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setTeachers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  // --- Derived State and Handlers ---
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    teachers.forEach((t) => {
      counts[t.department] = (counts[t.department] || 0) + 1;
    });
    return counts;
  }, [teachers]);

  const departmentList = Object.keys(departmentCounts).sort();

  const filteredTeachers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    let result = teachers;

    // 1. Filter by selected department (if not in 'departments' view)
    if (selectedDepartment && viewState !== 'departments') {
      result = result.filter(t => t.department === selectedDepartment);
    } 
    
    // 2. Filter by search term
    if (term) {
        result = result.filter((teacher) => 
            teacher.fullname.toLowerCase().includes(term) ||
            teacher.department.toLowerCase().includes(term) ||
            teacher.courses.some((c) => 
                c.name.toLowerCase().includes(term) || 
                c.code.toLowerCase().includes(term)
            )
        );
    }
    
    return result;
  }, [teachers, viewState, selectedDepartment, searchTerm]);

  const handleDepartmentClick = useCallback((department: string) => {
    setSelectedDepartment(department);
    setViewState('teachers');
    setSearchTerm(''); 
  }, []);

  const handleBackToDepartments = useCallback(() => {
    setSelectedDepartment(null);
    setViewState('departments');
    setSearchTerm('');
  }, []);
  
  const handleShowAllTeachers = useCallback(() => {
      setSelectedDepartment(null);
      setViewState('all');
      setSearchTerm('');
  }, []);
  
  const handleBackToHierarchy = useCallback(() => {
      setSelectedDepartment(null); 
      setViewState('departments');
      setSearchTerm('');
  }, []);

  // --- Title and Count Generation ---
  let title = "Academic Departments";
  let countText = `View ${departmentList.length} Departments`;
  let currentTeacherCount = filteredTeachers.length;

  if (viewState === 'teachers' && selectedDepartment) {
    title = `Teachers in ${selectedDepartment}`;
    countText = `Showing ${currentTeacherCount} Teachers`;
  } else if (viewState === 'all') {
    title = "Teacher Directory";
    
    if (selectedDepartment) {
        countText = `Showing ${currentTeacherCount} Teachers in ${selectedDepartment} (Total: ${totalTeachers})`;
    } else {
        countText = `Showing ${currentTeacherCount} of ${totalTeachers} Teachers`;
    }
  }


  // --- Render Controls ---
  const renderControls = () => {
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
    
    // Search Bar for 'Departments' or 'Teachers' view
    return (
        <div className="flex justify-end mb-8 p-5 bg-white rounded-xl shadow-lg border border-gray-100">
            <Search
                placeholder={viewState === 'departments' ? "Search for any teacher by name, department, or course..." : "Search teachers within this department..."}
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

  // --- Render Content ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip={<span className="text-red-600">Loading teacher data...</span>} />
        </div>
      );
    }

    if (viewState === 'departments' && !searchTerm) {
      if (departmentList.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-lg border border-gray-100">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-gray-500 font-medium text-lg">No departments found.</span>}
            />
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
    
    // Renders for 'all' view, 'teachers' view, or global search on 'departments' view
    if (filteredTeachers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-lg border border-gray-100">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-gray-500 font-medium text-lg">No teachers found matching your criteria.</span>}
          />
        </div>
      );
    }
    
    // Show Teacher Cards
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50/80 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 pt-2 pb-6 border-b border-red-100">
          <div className="flex items-center">
            {/* Navigation Buttons */}
            {viewState === 'teachers' && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToDepartments}
                className="mr-3 text-red-600 font-semibold"
              >
                Back to Departments
              </Button>
            )}
            {viewState === 'all' && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToHierarchy}
                className="mr-3 text-red-600 font-semibold"
              >
                Back to Hierarchy
              </Button>
            )}
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tighter flex items-center">
              <SolutionOutlined className="text-red-600 mr-3 text-5xl" />
              <span className="leading-tight">{title}</span>
            </h1>
          </div>
          
          {/* Main Action/Count Area */}
          <div className="flex items-center gap-4">
            
            {/* The "Show All Teachers" Button */}
            {viewState !== 'all' && (
              <Button
                type="primary"
                size="large"
                icon={<TeamOutlined />}
                onClick={handleShowAllTeachers}
                className="font-semibold bg-red-600 hover:bg-red-700 transition duration-300"
              >
                Show All Teachers
              </Button>
            )}
            
            {/* Teacher Count Badge */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-lg px-6 py-2 rounded-full shadow-xl transform transition-transform duration-300 hover:scale-[1.05] hover:shadow-2xl">
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