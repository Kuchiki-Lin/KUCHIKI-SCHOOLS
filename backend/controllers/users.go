package controllers

import (
	"database/sql"
	"log"
	"net/http"
	"school-backend/database"

	"github.com/gin-gonic/gin"
)


type UserAccount struct {
	ID         uint   `json:"id"`
	FullName   string `json:"fullname"`
	Department string `json:"department"`
}

func GetAllTeachersDetailed(c *gin.Context) {
    schoolSlug := c.Param("slug")
    log.Printf("[DEBUG] Entered GetAllTeachersDetailed, slug=%s", schoolSlug)

    query := `
    SELECT t.id, t.fullname, t.department, 
           c.name AS course_name, c.code, 
           COUNT(sc.student_id) AS student_count
    FROM teachers t
    INNER JOIN schools s ON t.school_id = s.id
    LEFT JOIN teacher_courses tc ON t.id = tc.teacher_id
    LEFT JOIN courses c ON tc.course_id = c.id
    LEFT JOIN student_courses sc ON c.id = sc.course_id
    WHERE s.slug = ?
    GROUP BY t.id, t.fullname, t.department, c.name, c.code
    ORDER BY t.fullname ASC`

    log.Printf("[DEBUG] Running query: %s", query)

    rows, err := database.DB.Query(query, schoolSlug)
    if err != nil {
        log.Printf("[ERROR] Query failed for slug=%s: %v", schoolSlug, err)
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
    rowCount := 0

    for rows.Next() {
        var (
            id           int
            fullname     string
            department   string
            courseName   sql.NullString
            courseCode   sql.NullString
            studentCount int64 // FIX: use int64 for COUNT()
        )

        err := rows.Scan(&id, &fullname, &department, &courseName, &courseCode, &studentCount)
        if err != nil {
            log.Printf("[ERROR] Row scan failed for slug=%s: %v", schoolSlug, err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning teacher row"})
            return
        }

        rowCount++
        log.Printf("[DEBUG] Row #%d -> id=%d, fullname=%s, dept=%s, courseName=%v, courseCode=%v, studentCount=%d",
            rowCount, id, fullname, department, courseName, courseCode, studentCount)

        if _, exists := teacherMap[id]; !exists {
            log.Printf("[DEBUG] Creating new teacher entry for ID=%d", id)
            teacherMap[id] = &Teacher{
                ID:         id,
                FullName:   fullname,
                Department: department,
                Courses:    []CourseInfo{},
            }
        }

        if courseName.Valid {
            log.Printf("[DEBUG] Adding course for teacherID=%d -> %s (%s), studentCount=%d",
                id, courseName.String, courseCode.String, studentCount)

            teacherMap[id].Courses = append(teacherMap[id].Courses, CourseInfo{
                Name:         courseName.String,
                Code:         courseCode.String,
                StudentCount: int(studentCount), // safe cast back to int
            })
        }
    }

    if err := rows.Err(); err != nil {
        log.Printf("[ERROR] Rows iteration error: %v", err)
    }

    var teachers []Teacher
    for _, t := range teacherMap {
        teachers = append(teachers, *t)
    }

    log.Printf("[DEBUG] Returning %d teachers for slug=%s", len(teachers), schoolSlug)
    c.JSON(http.StatusOK, teachers)
}




func GetAllStudentsDetailed(c *gin.Context) {
    schoolSlug := c.Param("slug") // assuming route: /api/:school_slug/students

    query := `
    SELECT s.id, s.fullname, s.department,
           c.name AS course_name, c.code
    FROM students s
    INNER JOIN schools scs ON s.school_id = scs.id
    LEFT JOIN student_courses sc ON s.id = sc.student_id
    LEFT JOIN courses c ON sc.course_id = c.id
    WHERE scs.slug = ?
    ORDER BY s.fullname ASC`

    rows, err := database.DB.Query(query, schoolSlug)
    if err != nil {
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
            id         int
            fullname   string
            department string
            courseName sql.NullString
            courseCode sql.NullString
        )

        err := rows.Scan(&id, &fullname, &department, &courseName, &courseCode)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning student row"})
            return
        }

        if _, exists := studentMap[id]; !exists {
            studentMap[id] = &Student{
                ID:         id,
                FullName:   fullname,
                Department: department,
                Courses:    []CourseInfo{},
            }
        }

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

    c.JSON(http.StatusOK, students)
}
