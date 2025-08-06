// app/components/UpcomingClassSummary.tsx
import { useEffect, useState } from "react";
import { Spin, Alert } from "antd";
import { ClassInfo } from "./classesthisweek"; // Re-use the ClassInfo type
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";

// Helper to map day names to numbers for sorting
const dayNameToNumber = {
  "Sunday": 0,
  "Monday": 1,
  "Tuesday": 2,
  "Wednesday": 3,
  "Thursday": 4,
  "Friday": 5,
  "Saturday": 6,
};

export default function UpcomingClassSummary({ studentId }: { studentId: number }) {
  const [upcomingClass, setUpcomingClass] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingClass = async () => {
      if (!studentId) {
        setLoading(false);
        setError("Student ID is missing. Cannot fetch classes.");
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${studentId}/classes`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const rawData = await res.json();
        const allClasses: ClassInfo[] = Array.isArray(rawData) ? rawData : [];

        const now = new Date();
        const currentDayNumber = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Filter out classes that have already passed today or are on past days
        const futureClasses = allClasses.filter(cls => {
          const classDayNumber = dayNameToNumber[cls.day_of_week as keyof typeof dayNameToNumber];
          const [classHour, classMinute] = cls.start_time.split(':').map(Number);

          if (classDayNumber === undefined) {
              console.warn(`Unknown day_of_week: ${cls.day_of_week} for class ${cls.course_name}`);
              return false; // Exclude classes with invalid day names
          }

          if (classDayNumber < currentDayNumber) {
            // Class is on a past day of the week, skip it (unless we wrap around for next week)
            return false; // We'll handle wrapping by sorting later
          } else if (classDayNumber === currentDayNumber) {
            // Class is today, check if its time is in the future
            return classHour > currentHour || (classHour === currentHour && classMinute >= currentMinute);
          } else {
            // Class is on a future day of the week
            return true;
          }
        });

        // Sort all future classes chronologically
        futureClasses.sort((a, b) => {
          const aDayNumber = dayNameToNumber[a.day_of_week as keyof typeof dayNameToNumber];
          const bDayNumber = dayNameToNumber[b.day_of_week as keyof typeof dayNameToNumber];

          // Calculate "distance" from today, handling wrap-around for next week
          let aDayDifference = aDayNumber - currentDayNumber;
          if (aDayDifference < 0) aDayDifference += 7; // Wrap around for next week
          
          let bDayDifference = bDayNumber - currentDayNumber;
          if (bDayDifference < 0) bDayDifference += 7; // Wrap around for next week

          if (aDayDifference !== bDayDifference) {
            return aDayDifference - bDayDifference;
          }

          // If same day, sort by time
          const [aHour, aMinute] = a.start_time.split(':').map(Number);
          const [bHour, bMinute] = b.start_time.split(':').map(Number);
          if (aHour !== bHour) return aHour - bHour;
          return aMinute - bMinute;
        });
        
        setUpcomingClass(futureClasses.length > 0 ? futureClasses[0] : null);

      } catch (err) {
        console.error("Error fetching upcoming class:", err);
        setError("Failed to load upcoming class. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingClass();
  }, [studentId]);

  if (loading) {
    return <Spin tip="Loading next class..." />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  if (!upcomingClass) {
    return <p className="text-sm text-gray-600 italic">No upcoming classes scheduled.</p>;
  }

  // Format the display to include the day of the week for the upcoming class
  const displayDay = upcomingClass.day_of_week === new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date())
    ? "Today"
    : upcomingClass.day_of_week;

  return (
    <div className="bg-white p-3 rounded-lg border border-green-200">
      <p className="text-md font-semibold text-green-700 flex items-center mb-1">
        <CalendarOutlined className="mr-2" /> {upcomingClass.course_name}
      </p>
      <p className="text-sm text-green-600 flex items-center mb-1">
        <ClockCircleOutlined className="mr-2" /> {displayDay}, {upcomingClass.start_time} - {upcomingClass.end_time}
      </p>
      <p className="text-sm text-green-600 flex items-center">
        <EnvironmentOutlined className="mr-2" /> {upcomingClass.venue}
      </p>
      <p className="text-xs text-green-500 mt-2">Semester: {upcomingClass.semester}</p>
    </div>
  );
}