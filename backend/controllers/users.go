package controllers

import (
    "fmt"
	"net/http"
	"database/sql"
	"github.com/gin-gonic/gin"
	"school-backend/database"
)


type UserAccount struct {
	ID         uint   `json:"id"`
	FullName   string `json:"fullname"`
	Department string `json:"department"`
}



func GetAllTeachersDetailed(c *gin.Context) {
	query := `
	SELECT t.id, t.fullname, t.department, 
	       c.name AS course_name, c.code, 
	       COUNT(sc.student_id) AS student_count
	FROM teachers t
	LEFT JOIN teacher_courses tc ON t.id = tc.teacher_id
	LEFT JOIN courses c ON tc.course_id = c.id
	LEFT JOIN student_courses sc ON c.id = sc.course_id
	GROUP BY t.id, t.fullname, t.department, c.name, c.code
	ORDER BY t.fullname ASC`

	rows, err := database.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teacher data"})
		return
	}
	defer rows.Close()

	type CourseInfo struct {
		Name         string `json:"name"`
		Code         string `json:"code"`
		StudentCount int    `json:"student_count"`
	}

	type Teacher struct {
		ID         int          `json:"id"`
		FullName   string       `json:"fullname"`
		Department string       `json:"department"`
		Courses    []CourseInfo `json:"courses"`
	}

	teacherMap := make(map[int]*Teacher)

	for rows.Next() {
		var id int
		var fullname, department, courseName, courseCode string
		var studentCount int

		err := rows.Scan(&id, &fullname, &department, &courseName, &courseCode, &studentCount)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning teacher row"})
			return
		}

		if _, exists := teacherMap[id]; !exists {
			teacherMap[id] = &Teacher{
				ID:         id,
				FullName:   fullname,
				Department: department,
				Courses:    []CourseInfo{},
			}
		}

		// Only add course if it's not null (in case of teachers with no courses)
		if courseName != "" {
			teacherMap[id].Courses = append(teacherMap[id].Courses, CourseInfo{
				Name:         courseName,
				Code:         courseCode,
				StudentCount: studentCount,
			})
		}
	}

	var teachers []Teacher
	for _, t := range teacherMap {
		teachers = append(teachers, *t)
	}

	c.JSON(http.StatusOK, teachers)
}
func GetAllStudentsDetailed(c *gin.Context) {
	fmt.Println("Starting GetAllStudentsDetailed handler...")

	query := `
	SELECT s.id, s.fullname, s.department,
	       c.name AS course_name, c.code
	FROM students s
	LEFT JOIN student_courses sc ON s.id = sc.student_id
	LEFT JOIN courses c ON sc.course_id = c.id
	ORDER BY s.fullname ASC`

	rows, err := database.DB.Query(query)
	if err != nil {
		fmt.Println("Query error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch student data"})
		return
	}
	defer rows.Close()

	type CourseInfo struct {
		Name string `json:"name"`
		Code string `json:"code"`
	}

	type Student struct {
		ID         int          `json:"id"`
		FullName   string       `json:"fullname"`
		Department string       `json:"department"`
		Courses    []CourseInfo `json:"courses"`
	}

	studentMap := make(map[int]*Student)

	for rows.Next() {
		var (
			id           int
			fullname     string
			department   string
			courseName   sql.NullString
			courseCode   sql.NullString
		)

		err := rows.Scan(&id, &fullname, &department, &courseName, &courseCode)
		if err != nil {
			fmt.Println("Scan error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning student row"})
			return
		}

		fmt.Printf("Scanned Student: ID=%d, Name=%s, Dept=%s, Course=%s, Code=%s\n",
			id, fullname, department, courseName.String, courseCode.String)

		if _, exists := studentMap[id]; !exists {
			studentMap[id] = &Student{
				ID:         id,
				FullName:   fullname,
				Department: department,
				Courses:    []CourseInfo{},
			}
		}

		// Only append if course info is present
		if courseName.Valid && courseCode.Valid {
			studentMap[id].Courses = append(studentMap[id].Courses, CourseInfo{
				Name: courseName.String,
				Code: courseCode.String,
			})
		}
	}

	var students []Student
	for _, s := range studentMap {
		students = append(students, *s)
	}

	fmt.Println("Returning students count:", len(students))
	c.JSON(http.StatusOK, students)
}
