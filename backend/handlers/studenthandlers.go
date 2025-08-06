package handlers

import (
	"net/http"
	"school-backend/database"
"fmt"
	"github.com/gin-gonic/gin"
)

type AssignStudentCoursesPayload struct {
	CourseIDs []int `json:"course_ids"`
}

func AssignCoursesToStudent(c *gin.Context) {
	studentID := c.Param("id")
	var payload AssignStudentCoursesPayload

	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	for _, courseID := range payload.CourseIDs {
		// Check if already assigned
		var exists bool
		err := database.DB.QueryRow(
			"SELECT EXISTS (SELECT 1 FROM student_courses WHERE student_id = ? AND course_id = ?)",
			studentID, courseID,
		).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Check failed"})
			return
		}

		if exists {
			continue
		}

		// Insert assignment
		_, err = database.DB.Exec(
			"INSERT INTO student_courses (student_id, course_id) VALUES (?, ?)",
			studentID, courseID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign course"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Courses assigned to student"})
}

func GetStudentCourses(c *gin.Context) {
	studentID := c.Param("id")

	query := `
        SELECT c.id, c.name, c.code
        FROM student_courses sc
        JOIN courses c ON sc.course_id = c.id
        WHERE sc.student_id = ?
    `
	rows, err := database.DB.Query(query, studentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
		return
	}
	defer rows.Close()

	type Course struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
		Code string `json:"code"`
	}

	var courses []Course
	for rows.Next() {
		var course Course
		if err := rows.Scan(&course.ID, &course.Name, &course.Code); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read course data"})
			return
		}
		courses = append(courses, course)
	}

	c.JSON(http.StatusOK, courses)
}



func GetCoursesByStudentDepartment(c *gin.Context) {
    studentID := c.Param("id")

    var department string
    err := database.DB.QueryRow("SELECT department FROM students WHERE id = ?", studentID).Scan(&department)
    if err != nil || department == "" {
        c.JSON(http.StatusNotFound, gin.H{"error": "Student or department not found"})
        return
    }

    var departmentID int
    err = database.DB.QueryRow("SELECT id FROM departments WHERE name = ?", department).Scan(&departmentID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Department not found"})
        return
    }

    rows, err := database.DB.Query("SELECT id, name, code FROM courses WHERE department_id = ?", departmentID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
        return
    }
    defer rows.Close()

    var courses []map[string]interface{}
    for rows.Next() {
        var id int
        var name, code string
        if err := rows.Scan(&id, &name, &code); err != nil {
            continue
        }
        courses = append(courses, gin.H{"id": id, "name": name, "code": code})
    }

    c.JSON(http.StatusOK, courses)
}


func GetStudentsForTeacher(c *gin.Context) {
	fmt.Println("[DEBUG]", c)
	teacherID := c.Param("id")

	query := `
	SELECT 
		s.fullname, c.name, c.code
	FROM 
		student_courses sc
	JOIN 
		courses c ON sc.course_id = c.id
	JOIN 
		teacher_courses tc ON tc.course_id = c.id
	JOIN 
		students s ON sc.student_id = s.id
	WHERE 
		tc.teacher_id = ?
	`

	rows, err := database.DB.Query(query, teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Query failed"})
		return
	}
	fmt.Println("[DEBUG]", rows)
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var fullname, courseName, courseCode string
		if err := rows.Scan(&fullname, &courseName, &courseCode); err != nil {
			continue
		}
		results = append(results, gin.H{
			"student": fullname,
			"course":  courseName,
			"code":    courseCode,
			"status":  "✔ Registered",
		})
	}

	c.JSON(http.StatusOK, results)
}




func GetStudentClasses(c *gin.Context) {
	studentID := c.Param("id")
	fmt.Println("🔍 Received request to get classes for student ID:", studentID)

	if studentID == "" {
		fmt.Println("❌ Student ID is empty!")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing student ID"})
		return
	}

	var classes []struct {
		CourseName string `json:"course_name"`
		DayOfWeek  string `json:"day_of_week"`
		StartTime  string `json:"start_time"`
		EndTime    string `json:"end_time"`
		Venue      string `json:"venue"`
		Semester   string `json:"semester"`
	}

	query := `
	SELECT 
		courses.name AS course_name,
		cs.day_of_week,
		cs.start_time,
		cs.end_time,
		cs.venue,
		cs.semester
	FROM student_courses sc
	JOIN class_schedules cs ON sc.course_id = cs.course_id
	JOIN courses ON courses.id = cs.course_id
	WHERE sc.student_id = ?
	ORDER BY FIELD(cs.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
	         cs.start_time ASC
	`

	fmt.Println("📡 Executing query to fetch class schedule for student:", studentID)

	rows, err := database.DB.Query(query, studentID)
	if err != nil {
		fmt.Println("❌ Error executing query:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch classes"})
		return
	}
	defer rows.Close()

	count := 0
	for rows.Next() {
		var class struct {
			CourseName string `json:"course_name"`
			DayOfWeek  string `json:"day_of_week"`
			StartTime  string `json:"start_time"`
			EndTime    string `json:"end_time"`
			Venue      string `json:"venue"`
			Semester   string `json:"semester"`
		}
		if err := rows.Scan(
			&class.CourseName,
			&class.DayOfWeek,
			&class.StartTime,
			&class.EndTime,
			&class.Venue,
			&class.Semester,
		); err != nil {
			fmt.Println("❌ Error scanning class row:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading class data"})
			return
		}
		classes = append(classes, class)
		count++
	}

	fmt.Printf("✅ Fetched %d classes for student ID %s\n", count, studentID)

	if count == 0 {
		fmt.Println("⚠️ No classes found for student ID:", studentID)
	}

	c.JSON(http.StatusOK, classes)
}
