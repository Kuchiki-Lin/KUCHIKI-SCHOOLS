package models

import "time"

type ClassSchedule struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	TeacherID int      `json:"teacher_id"`
	CourseID  uint      `json:"course_id"`
	DayOfWeek string    `json:"day_of_week"` // "Monday"
	StartTime string    `json:"start_time"`  // "12:00"
	EndTime   string    `json:"end_time"`
	CourseCode string `  json:"course_code"`
    CourseName string     `json:"course_name"`
	SchoolID   int    ` json:"school_id"`
	Venue     string    `json:"venue"`
	Semester  string    `json:"semester"`
	CreatedAt time.Time
}
