'use client';

import { useEffect, useState } from 'react';
import { Card } from 'antd';
import dayjs from 'dayjs';
import  {useUser} from "../private"

interface Schedule {
  id: string;
  course: string;
  day: string;
  start_time: string;
  end_time: string;
  venue: string;
}

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClassesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const {user}=useUser();

useEffect(() => {
  const fetchSchedules = async () => {
    if (!user) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${user.id}/schedule`, { credentials: 'include' });
    const data = await res.json();

    const mapped = data.map((item: any) => ({
      id: item.id,
      course: item.course_name || `Course ID ${item.course_id}`, // adjust if you have course_name
      day: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      venue: item.venue,
    }));

    setSchedules(mapped);
  };
  fetchSchedules();
}, [user]);


  const today = dayjs().format('dddd');

  const grouped = weekdays.map(day => ({
    day,
    classes: schedules.filter(s => s.day === day)
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {grouped.map(({ day, classes }) => {
        const isToday = day === today;
        return (
          <Card
            key={day}
            title={day}
            className={`border ${
              isToday ? 'border-amber-400 bg-yellow-50 shadow-lg animate-pulse' : 'border-gray-200'
            }`}
           styles={{ header: { backgroundColor: "#f0f0f0" } }}
          >
            {classes.length > 0 ? (
              <ul className="space-y-2">
                {classes.map(cls => (
                  <li key={cls.id} className="text-sm text-gray-800">
                    <strong>{cls.course}</strong> — {cls.start_time} to {cls.end_time} @ <span className="text-blue-600">{cls.venue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic">No classes.</p>
            )}
            {isToday && classes.length > 0 && (
              <div className="mt-4 p-2 bg-amber-100 border-l-4 border-amber-500 text-amber-900 font-medium text-sm rounded">
                ✅ TODAY YOU HAVE {classes.map(c => c.course).join(', ')} — check your venue!
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
