package controllers

import (
	"log"
	"net/http"
	"school-backend/database"
	"school-backend/models"
	"strconv"
	"github.com/gin-gonic/gin"
)

func GetTeacherSchedule(c *gin.Context) {
	teacherID := c.Param("id")
	log.Printf("🔍 Fetching schedule for teacher ID: %s", teacherID)

	tid, err := strconv.Atoi(teacherID)
	if err != nil {
		log.Printf("❌ Invalid teacher ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID"})
		return
	}

	rows, err := database.DB.Query(`
		SELECT cs.id, cs.course_id, cs.day_of_week, cs.start_time, cs.end_time,
			cs.venue, cs.semester, cs.created_at, c.code, c.name
		FROM class_schedules cs
		JOIN courses c ON cs.course_id = c.id
		WHERE cs.teacher_id = ?`, tid)

	if err != nil {
		log.Printf("❌ Database query error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	 
	var schedules []models.ClassSchedule

	for rows.Next() {
		var s models.ClassSchedule
		var courseCode, courseName string

		err := rows.Scan(
			&s.ID, &s.CourseID, &s.DayOfWeek, &s.StartTime, &s.EndTime,
			&s.Venue, &s.Semester, &s.CreatedAt, &courseCode, &courseName,
		)
		if err != nil {
			log.Printf("❌ Error scanning row: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		s.CourseCode = courseCode
		s.CourseName = courseName
		s.TeacherID = tid
		schedules = append(schedules, s)
	}

	log.Printf("✅ Returning %d schedule(s) for teacher ID %d", len(schedules), tid)
	c.JSON(http.StatusOK, schedules)
}

func AddClassSchedule(c *gin.Context) {
	teacherID := c.Param("id")
	log.Printf("📥 Adding schedule for teacher ID: %s", teacherID)

	var input models.ClassSchedule
	
	if err := c.BindJSON(&input); err != nil {
		log.Printf("❌ JSON binding error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	tid, err := strconv.Atoi(teacherID)
	if err != nil {
		log.Printf("❌ Invalid teacher ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID"})
		return
	}

	log.Printf("📄 Schedule Input: %+v", input)

	query := `
		INSERT INTO class_schedules (teacher_id, course_id, day_of_week, start_time, end_time, venue, semester)
		VALUES (?, ?, ?, ?, ?, ?, ?)`

	_, err = database.DB.Exec(query,
		tid, input.CourseID, input.DayOfWeek,
		input.StartTime, input.EndTime, input.Venue, input.Semester)

	if err != nil {
		log.Printf("❌ Database insert error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	log.Printf("✅ Schedule successfully added for teacher ID %d", tid)
	c.JSON(http.StatusOK, gin.H{"message": "Schedule created successfully"})
}
