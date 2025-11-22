"use client";

import { Card, Tabs, Spin, message } from "antd";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/app/private";

// Match API structure after mapping
type ScheduleItem = {
  id: number;
  day: string; // e.g. "Monday"
  subject: string;
  start_time: string;
  end_time: string;
  class_name: string;
  location: string;
};

const dayToJsDay = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
};

export default function TeacherSchedule() {
  const { user } = useUser();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleString("en-US", {
    weekday: "long",
  }) as keyof typeof dayToJsDay | "Saturday" | "Sunday";

  // Fetch teacher’s schedule from API
  useEffect(() => {
    if (!user?.id) return;

    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/teacher/${user.id}/schedule`,
          { credentials: "include" }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        //  Map backend fields to frontend fields
        const mapped: ScheduleItem[] = (Array.isArray(data) ? data : []).map(
          (item: any) => ({
            id: item.id,
            day: item.day_of_week, // map to day
            subject: item.course_name, // use course_name as subject
            start_time: item.start_time,
            end_time: item.end_time,
            class_name: item.course_code, // course_code as class identifier
            location: item.venue,
          })
        );

        setSchedule(mapped);
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
        message.error("Could not load schedule");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user?.id]);

  const todaySchedule = useMemo(
    () => schedule.filter((item) => item.day === today),
    [schedule, today]
  );

  const DayColumn = ({ day, items }: { day: string; items: ScheduleItem[] }) => (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="font-semibold text-center text-lg">{day}</h3>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03 }}
              className="p-3 rounded-xl shadow-md border transition-colors "
            >
              <p className=" text-blue-600" style={{fontSize:"16px", fontWeight:"400"}}>{item.subject}</p>
              <p className="text-sm ">
                {item.start_time} - {item.end_time}
              </p>
              <p className="text-sm  bg-amber-200 w-fit animate-pulse">
                {item.class_name} • {item.location}
              </p>
            </motion.div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center pt-4">
            No classes scheduled.
          </p>
        )}
      </div>
    </motion.div>
  );

  return (
    <Card
   
      title="My Schedule"
      className="rounded-2xl shadow-lg border "
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <Tabs defaultActiveKey="today" centered>
          <Tabs.TabPane tab="Today" key="today">
            <DayColumn day="Today's Schedule" items={todaySchedule} />
          </Tabs.TabPane>

          <Tabs.TabPane tab="This Week" key="weekly">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-4">
              {Object.keys(dayToJsDay).map((day) => (
                <DayColumn
                  key={day}
                  day={day}
                  items={schedule.filter((i) => i.day === day)}
                />
              ))}
            </div>
          </Tabs.TabPane>
        </Tabs>
      )}
    </Card>
  );
}
