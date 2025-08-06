package handlers

import (
	"log"
	"net/http"
	"school-backend/database"
    "fmt"
	"github.com/gin-gonic/gin"
)

type AssignCoursesPayload struct {
    CourseIDs []int `json:"course_ids"`
}

func AssignCoursesToTeacher(c *gin.Context) {
    teacherID := c.Param("id")
    var payload AssignCoursesPayload

    if err := c.BindJSON(&payload); 
	err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
        return
    }

    // Fetch teacher name
    var teacherName string
    err := database.DB.QueryRow("SELECT fullname FROM teachers WHERE id = ?", teacherID).Scan(&teacherName)
	fmt.Println("[DEBUG]", teacherName)

    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
        return
    }
    log.Printf("[DEBUG] Teacher not found: %v\n", teacherName)

    for _, courseID := range payload.CourseIDs {
        var courseCode string

        // Fetch course code
        err := database.DB.QueryRow("SELECT code FROM courses WHERE id = ?", courseID).Scan(&courseCode)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Course not found"})
            return
        }

        // Check if already assigned
        var exists bool
        err = database.DB.QueryRow(
            "SELECT EXISTS (SELECT 1 FROM teacher_courses WHERE teacher_id = ? AND course_id = ?)",
            teacherID, courseID,
        ).Scan(&exists)
		fmt.Println("[DEBUG]", exists)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Check failed"})
            return
        }

        if exists {
            continue // skip already assigned courses
        }

        // Insert new assignment
        _, err = database.DB.Exec(
            "INSERT INTO teacher_courses (teacher_id, course_id, teacher_name, course_code) VALUES (?, ?, ?, ?)",
            teacherID, courseID, teacherName, courseCode,
        )
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign course"})
            return
        }
    }

    c.JSON(http.StatusOK, gin.H{"message": "Courses assigned successfully"})
}

func GetAllCourses(c *gin.Context) {
    rows, err := database.DB.Query("SELECT id, name, code FROM courses")
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
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Row scan failed"})
            return
        }

        courses = append(courses, gin.H{
            "id": id,
            "name": name,
            "code": code,
        })
    }

    c.JSON(http.StatusOK, courses)
}


func GetCoursesByDepartment(c *gin.Context) {
    department := c.Param("department")

    var departmentID int
    err := database.DB.QueryRow("SELECT id FROM departments WHERE name = ?", department).Scan(&departmentID)
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
        if err := rows.Scan(&id, &name, &code); 
		err != nil {
            continue
        }
        courses = append(courses, gin.H{"id": id, "name": name,"code":code})
    }

    c.JSON(http.StatusOK, courses)
}


func GetTeacherCourses(c *gin.Context) {
	teacherID := c.Param("id")
	log.Printf("[INFO] Fetching courses for teacher ID: %s", teacherID)

	query := `
		SELECT c.id, c.name, c.code
		FROM teacher_courses tc
		JOIN courses c ON tc.course_id = c.id
		WHERE tc.teacher_id = ?
	`

	rows, err := database.DB.Query(query, teacherID)
	if err != nil {
		log.Printf("[ERROR] Query failed for teacher ID %s: %v", teacherID, err)
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
			log.Printf("[ERROR] Row scan failed for teacher ID %s: %v", teacherID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read course data"})
			return
		}
		log.Printf("[DEBUG] Retrieved course: ID=%d, Name=%s, Code=%s", course.ID, course.Name, course.Code)
		courses = append(courses, course)
	}

	log.Printf("[INFO] Returning %d courses for teacher ID %s", len(courses), teacherID)
	c.JSON(http.StatusOK, courses)
}


func GetTeacherCoursesy(c *gin.Context) {
	teacherID := c.Param("id")

	query := `
	SELECT 
		c.id, c.name, c.code, 
		(SELECT COUNT(*) FROM student_courses sc WHERE sc.course_id = c.id) AS student_count
	FROM 
		courses c
	JOIN 
		teacher_courses tc ON tc.course_id = c.id
	WHERE 
		tc.teacher_id = ?
	`

	rows, err := database.DB.Query(query, teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
		return
	}
	defer rows.Close()

	type Course struct {
		ID           int    `json:"id"`
		Name         string `json:"name"`
		Code         string `json:"code"`
		StudentCount int    `json:"student_count"`
	}

	var courses []Course

	for rows.Next() {
		var course Course
		if err := rows.Scan(&course.ID, &course.Name, &course.Code, &course.StudentCount); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan course"})
			return
		}
		courses = append(courses, course)
	}

	c.JSON(http.StatusOK, courses)
}
