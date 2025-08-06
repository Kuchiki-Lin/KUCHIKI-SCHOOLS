// app/components/classesthisweek.tsx
import { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import { useUser } from "../private";

export type ClassInfo = {
  course_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  venue: string;
  semester: string;
};

const getToday = () => {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
};

export default function ClassesThisWeek({ studentId }: { studentId: number }) {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) {
        setLoading(false); // Stop loading if no user is available
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${user.id}/classes`);
        if (!res.ok) {
          // Handle non-2xx responses (e.g., 404, 500)
          console.error(`HTTP error! status: ${res.status}`);
          setClasses([]); // Set to empty array on error
          return;
        }
        const rawData = await res.json();
        // Ensure data is an array before setting state
        const data: ClassInfo[] = Array.isArray(rawData) ? rawData : [];
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setClasses([]); // Set to empty array on fetch error as well
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user]);

  if (loading) return <Spin tip="Loading your class schedule..." />;
  // Now, classes will always be an array, so .length is safe
  if (!classes.length) return <p>No classes scheduled for your courses.</p>;

  const today = getToday();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {classes.map((cls, index) => {
        const isToday = cls.day_of_week === today;
        return (
          <Card
            key={index}
            title={`${cls.course_name} - ${cls.day_of_week}`}
            className={`border-2 ${
              isToday
                ? "border-yellow-400 bg-yellow-50 shadow-lg"
                : "border-gray-300 bg-white"
            }`}
          >
            <p><strong>Time:</strong> {cls.start_time} - {cls.end_time}</p>
            <p><strong>Venue:</strong> {cls.venue}</p>
            <p><strong>Semester:</strong> {cls.semester}</p>
            {isToday && (
              <p className="text-yellow-700 font-semibold mt-2">
                📣 TODAY YOU HAVE <span className="uppercase">{cls.course_name}</span>!
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}