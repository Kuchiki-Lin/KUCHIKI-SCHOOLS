package controllers

import (

	"net/http"
	"school-backend/database"
	"school-backend/models"
	"strconv"
	"github.com/gin-gonic/gin"
)

func GetTeacherSchedule(c *gin.Context) {
    teacherID := c.Param("id")
    tid, err := strconv.Atoi(teacherID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID"})
        return
    }

    // ✅ Ensure teacher belongs to a school
    var schoolID int
    err = database.DB.QueryRow("SELECT school_id FROM teachers WHERE id = ?", tid).Scan(&schoolID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teacher’s school"})
        return
    }

    rows, err := database.DB.Query(`
        SELECT cs.id, cs.course_id, cs.day_of_week, cs.start_time, cs.end_time,
               cs.venue, cs.semester, cs.created_at, c.code, c.name
        FROM class_schedules cs
        JOIN courses c ON cs.course_id = c.id
        WHERE cs.teacher_id = ? AND cs.school_id = ?
    `, tid, schoolID)

    if err != nil {
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
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        s.CourseCode = courseCode
        s.CourseName = courseName
        s.TeacherID = tid
        s.SchoolID = schoolID
        schedules = append(schedules, s)
    }

    c.JSON(http.StatusOK, schedules)
}


func AddClassSchedule(c *gin.Context) {
    teacherID := c.Param("id")
    tid, err := strconv.Atoi(teacherID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID"})
        return
    }

    var input models.ClassSchedule
    if err := c.BindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
        return
    }

    // ✅ Get teacher’s school_id
    var schoolID int
    err = database.DB.QueryRow("SELECT school_id FROM teachers WHERE id = ?", tid).Scan(&schoolID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teacher’s school"})
        return
    }

    query := `
        INSERT INTO class_schedules (teacher_id, course_id, day_of_week, start_time, end_time, venue, semester, school_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    _, err = database.DB.Exec(query,
        tid, input.CourseID, input.DayOfWeek,
        input.StartTime, input.EndTime, input.Venue, input.Semester, schoolID)

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Schedule created successfully"})
}

