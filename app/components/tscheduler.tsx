
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '../private'; 

// Types (from your provided snippet)
interface Course {
  id: number;
  name: string;
  code: string;
}

interface Schedule {
  id: number;
  course_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  venue: string;
  semester: string;
  course_code?: string; // Optional, might be derived on frontend or provided by backend
}

// Days of the week, matching Date.prototype.getDay() (0 for Sunday)
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Function to generate a consistent color for each course
const generateCourseColors = (courses: Course[]) => {
  const colors = [
    'bg-red-200 text-red-900',
    'bg-green-200 text-green-900',
    'bg-blue-200 text-blue-900',
    'bg-yellow-200 text-yellow-900',
    'bg-purple-200 text-purple-900',
    'bg-pink-200 text-pink-900',
    'bg-orange-200 text-orange-900',
    'bg-teal-200 text-teal-900',
    'bg-indigo-200 text-indigo-900',
  ];
  const courseColorMap: Record<number, string> = {};
  courses.forEach((course, idx) => {
    courseColorMap[course.id] = colors[idx % colors.length];
  });
  return courseColorMap;
};


const TeacherCalender = () => {
  // State for calendar navigation (current month/year being viewed)
  const [currentDate, setCurrentDate] = useState(new Date());

  // State for storing fetched courses and schedules
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate course colors using the 'courses' state, ensuring each course has a consistent color
  const courseColors = useMemo(() => generateCourseColors(courses), [courses]);

  // Simulated user object - replace with actual user context in your Next.js app
  // This is crucial as API calls depend on user.id
  const {user} = useUser();

  // State for the new schedule input form
  const [newSchedule, setNewSchedule] = useState({
    course_id: '',
    day_of_week: '',
    startTime: '',
    endTime: '',
    venue: '',
    semester: '',
  });

  // State for displaying messages to the user
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Function to display a message to the user (custom message box)
  const showMessage = useCallback((text:string, type:string) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000); // Clear message after 3 seconds
  }, []);

  // Fetch courses and schedules from the backend
  const fetchCoursesAndSchedules = useCallback(async () => {
    // Ensure user is defined before making API calls
    if (!user?.department || !user?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      // Fetch courses for the teacher
      const fetchCoursesPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${user.id}/courses-with-count`, { credentials: 'include' })
        .then(res => {
          if (!res.ok) {
            return res.json().then(err => { throw new Error(err.message || `HTTP error! status: ${res.status}`); });
          }
          return res.json();
        })
        .then(data => setCourses(Array.isArray(data) ? data : []))
        .catch(error => {
          console.error('Failed to load courses:', error);
          showMessage(`Failed to load courses: ${error.message}`, 'error');
          return []; // Return an empty array to prevent breaking Promise.all
        });

      // Fetch schedules for the teacher
      const fetchSchedulesPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${user.id}/schedule`, { credentials: 'include' })
        .then(async res => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || `HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => setSchedules(Array.isArray(data) ? data : []))
        .catch(error => {
          console.error('Failed to load schedule:', error);
          showMessage(`Failed to load schedule: ${error.message}`, 'error');
          return []; // Return an empty array to prevent breaking Promise.all
        });

      // Wait for both fetches to complete
      await Promise.all([fetchCoursesPromise, fetchSchedulesPromise]);
    } catch (error) {
      console.error('An unexpected error occurred during data fetching:', error);
       if (error instanceof Error){
                   showMessage(`An unexpected error occurred: ${error.message}`, 'error');
       } else{
           showMessage(`An unexpected error occured`, "error")
       }
     
    
    } finally {
      setIsLoading(false); // Always set loading to false when done
    }
  }, [user, showMessage]);

  useEffect(() => {
    // Initial data fetch on component mount
    fetchCoursesAndSchedules();
  }, [fetchCoursesAndSchedules]);

  // Handle input changes for the new schedule form
  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({ ...prev, [name]: value }));
  };

  // Handle adding a new schedule to the backend
  const handleAddSchedule = async (e:any) => {
    e.preventDefault(); // Prevent default form submission

    if (!user?.id) {
      showMessage('User not authenticated. Please log in.', 'error');
      return;
    }

    // Basic validation
    if (!newSchedule.course_id || !newSchedule.day_of_week || !newSchedule.startTime || !newSchedule.endTime || !newSchedule.venue || !newSchedule.semester) {
      showMessage('Please fill in all fields.', 'error');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${user.id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: Number(newSchedule.course_id), // Ensure course_id is a number
          day_of_week: newSchedule.day_of_week,
          start_time: newSchedule.startTime,
          end_time: newSchedule.endTime,
          venue: newSchedule.venue,
          semester: newSchedule.semester,
        }),
        credentials: 'include' // Important for sending cookies/sessions if your backend uses them
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add schedule with status: ${response.status}`);
      }

      showMessage('Schedule added successfully!', 'success');
      // Clear the form
      setNewSchedule({
        course_id: '',
        day_of_week: '',
        startTime: '',
        endTime: '',
        venue: '',
        semester: '',
      });
      await fetchCoursesAndSchedules(); // Re-fetch schedules to update the calendar display
    } catch (error) {

      console.error("Error adding schedule:", error);
      if(error instanceof Error){
showMessage(`Failed to add schedule: ${error.message}`, 'error');
      }
      
    }
  };

  // Helper function to get the number of days in a month
  const getDaysInMonth = (year:number, month:number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper function to get the first day of the month (0 for Sunday, 6 for Saturday)
  const getFirstDayOfMonth = (year:number, month:number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days for the current month
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    // Add empty divs for preceding days of the week
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-center border border-gray-200 bg-gray-50 rounded-md"></div>);
    }

    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day);
      const isToday = fullDate.toDateString() === new Date().toDateString();
      const currentDayOfWeekIndex = fullDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
      const currentDayOfWeekName = daysOfWeek[currentDayOfWeekIndex];

      // Filter schedules for the current day of the week
      const schedulesForDay = schedules.filter(s =>
        s.day_of_week === currentDayOfWeekName
      );

      days.push(
        <div
          key={day}
          className={`p-3 border border-gray-200 rounded-md flex flex-col ${isToday ? 'bg-blue-100 border-blue-500' : 'bg-white'} hover:bg-gray-50 transition-colors duration-200`}
        >
          <span className={`font-semibold text-lg ${isToday ? 'text-blue-700' : 'text-gray-800'}`}>{day}</span>
          <div className="mt-2  text-xs">
            {schedulesForDay.map(s => {
              const course = courses.find(c => c.id === s.course_id);
              const courseDisplay = course ? `${course.name} (${course.code})` : 'Unknown Course';
              // Extract only the background color class for the small circle
              const bgColorClass = courseColors[s.course_id] ? courseColors[s.course_id].split(' ')[0] : 'bg-gray-200';
              
              return (
                <div
                  key={`${s.id}-${day}`}
                  className={`relative group ${courseColors[s.course_id] || 'bg-gray-200 text-gray-900'} py-2 rounded-lg text-[10px]
                    
                    font-medium leading-snug shadow-sm cursor-pointer overflow-visible`}
                >
                  {/* Display colored circle and course code */}
                  <div className="flex items-center ">
                    <div className={`w-3 h-3 rounded-full ${bgColorClass}`}></div>
                    <span className="">{course ? course.code : 'N/A'}</span>
                  </div>

                  {/* Hover tooltip */}
                  <div className="absolute left-1/2 top-full mt-1 w-max min-w-[14rem] max-w-xs -translate-x-1/2 z-50 hidden group-hover:flex flex-col bg-white border border-gray-300 rounded-md shadow-lg p-3 text-xs text-gray-800 pointer-events-none">
                    <div className="text-sm font-bold text-indigo-700 mb-1">{courseDisplay}</div>
                    <div><span className="font-medium">Time:</span> {s.start_time} - {s.end_time}</div>
                    <div><span className="font-medium">Venue:</span> {s.venue}</div>
                    <div><span className="font-medium">Semester:</span> {s.semester}</div>
                    <div><span className="font-medium">Day:</span> {currentDayOfWeekName}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return days;
  };

  // Navigate to the previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Format month and year for display
  const monthYearString = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-6 font-inter text-gray-800 flex-1"> {/* Added flex-1 here */}
      {/* Global styles for Inter font */}
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      {/* Message Box */}
      {message.text && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50
          ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="w-full md:max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-8"> {/* Changed max-w-6xl to w-full md:max-w-6xl */}
       

        {/* Add New Schedule Form */}
        <div className="mb-10 p-6 bg-indigo-50 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">Set Classes</h2>
          <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Course Selection */}
            <div className="md:col-span-1">
              <label htmlFor="course_id" className="block text-gray-700 text-sm font-bold mb-2">Course</label>
              <select
                id="course_id"
                name="course_id"
                value={newSchedule.course_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                required
              >
                <option value="">Select course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Day of the Week Selection */}
            <div className="md:col-span-1">
              <label htmlFor="day_of_week" className="block text-gray-700 text-sm font-bold mb-2">Day of the Week</label>
              <select
                id="day_of_week"
                name="day_of_week"
                value={newSchedule.day_of_week}
                onChange={handleInputChange}
                className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                required
              >
                <option value="">Choose day</option>
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range Input */}
            <div className="md:col-span-1">
              <label htmlFor="startTime" className="block text-gray-700 text-sm font-bold mb-2">Start Time</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={newSchedule.startTime}
                onChange={handleInputChange}
                className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                required
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="endTime" className="block text-gray-700 text-sm font-bold mb-2">End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={newSchedule.endTime}
                onChange={handleInputChange}
                className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                required
              />
            </div>

            {/* Venue Input */}
            <div className="md:col-span-1">
              <label htmlFor="venue" className="block text-gray-700 text-sm font-bold mb-2">Venue</label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={newSchedule.venue}
                onChange={handleInputChange}
                placeholder="e.g. Room 203"
                className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                required
              />
            </div>

            {/* Semester Input */}
            <div className="md:col-span-1">
              <label htmlFor="semester" className="block text-gray-700 text-sm font-bold mb-2">Semester</label>
              <input
                type="text"
                id="semester"
                name="semester"
                value={newSchedule.semester}
                onChange={handleInputChange}
                placeholder="e.g. Semester 1"
                className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                required
              />
            </div>

            {/* Add Schedule Button */}
            <button
              type="submit"
              className="md:col-span-3 bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 shadow-lg"
            >
              Add Schedule
            </button>
          </form>
        </div>

        {/* Course Color Legend */}
        <div className="mb-10 p-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap gap-4">
            {courses.length > 0 ? (
              courses.map(course => {
                const bgColorClass = courseColors[course.id] ? courseColors[course.id].split(' ')[0] : 'bg-gray-200';
                return (
                  <div key={course.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md shadow-sm">
                    <div className={`w-4 h-4 rounded-full ${bgColorClass} border border-gray-300`}></div>
                    <span className="text-gray-700 font-medium">{course.name} ({course.code})</span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No courses available to display legend.</p>
            )}
          </div>
        </div>

        {/* Calendar Display */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-3 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-3xl font-bold text-indigo-700">{monthYearString}</h2>
            <button
              onClick={goToNextMonth}
              className="p-3 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
            >
              <svg xmlns="https://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-600 mb-4">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-500" style={{ height: 500 }}>
              {/* Simple loading spinner */}
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <p className="ml-4 text-indigo-700">Loading Calendar...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherCalender;
