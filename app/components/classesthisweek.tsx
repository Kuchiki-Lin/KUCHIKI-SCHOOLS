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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-10
    bg-white
    "
    
    style={{fontFamily:"cursive", fontWeight:"bold"}}
    >
      {classes.map((cls, index) => {
        const isToday = cls.day_of_week === today;
        return (
          <div>

<Card
  key={index}
  style={{ backgroundColor: "inherit", 
    border:"2px solid black"
  }}
  title={
    <div className="flex justify-between items-center">
      <span className="text-lg font-bold
      text-green-700
      " style={{ fontFamily: "cursive" }}>
        {cls.course_name}
      </span>
      <span className="text-md  italic"
      style={{ fontFamily: "cursive" }}
      >
        {cls.day_of_week}
      </span>
    </div>
  }

>
  <p>
    <strong>Time:</strong> {cls.start_time} - {cls.end_time}
  </p>
  <p>
    <strong>Venue:</strong> {cls.venue}
  </p>
  <p>
    <strong>Semester:</strong> {cls.semester}
  </p>
  {isToday && (
    <p className="text-green-700 font-semibold mt-2">
      📣 TODAY YOU HAVE{" "}
      <span className="uppercase">{cls.course_name}</span>!
    </p>
  )}
</Card>

          </div>
        
        );
      })}
    </div>
  );
}