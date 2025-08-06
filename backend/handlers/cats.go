package handlers

import (
	"net/http"
	"school-backend/database"
	"time"
    "fmt"
	"github.com/gin-gonic/gin"
)


func CreateCat(c *gin.Context) {

	type CatInput struct {
		CourseID    int       `json:"course_id"`
		TeacherID   int       `json:"teacher_id"`
		CourseName  string    `json:"course_name"`
		CatDateTime time.Time `json:"cat_datetime"`
	}

	var input CatInput 
	if err := c.ShouldBindJSON(&input); 
	err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}
	// Debug log
	fmt.Printf("Creating CAT: Course=%d, Teacher=%d, Coursenname=%s, DateTime=%s\n",
		input.CourseID, input.TeacherID,  input.CourseName, input.CatDateTime.Format(time.RFC3339))

	query := `INSERT INTO cats (course_id, teacher_id, cat_datetime) VALUES (?, ?, ?)`
	_, err := database.DB.Exec(query, input.CourseID, input.TeacherID, input.CatDateTime)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create CAT",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "CAT scheduled successfully"})
}

func GetCatsByTeacher(c *gin.Context) {
	teacherID := c.Param("id")
	query := `
SELECT cats.id, cats.course_id, courses.name AS course_name, cats.teacher_id, cats.cat_datetime
FROM cats
JOIN courses ON cats.course_id = courses.id
WHERE cats.teacher_id = ?
ORDER BY cats.cat_datetime ASC
`


	rows, err := database.DB.Query(query, teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch CATs"})
		return
	}
	defer rows.Close()

	type Cat struct {
	ID          int       `json:"id"`
	CourseID    int       `json:"course_id"`
	CourseName  string    `json:"course_name"`
	TeacherID   int       `json:"teacher_id"`
	CatDateTime time.Time `json:"cat_datetime"`
}


	var cats []Cat
	for rows.Next() {

		var cat Cat

		if err := rows.Scan(&cat.ID, &cat.CourseID, &cat.CourseName, &cat.TeacherID, &cat.CatDateTime); 
		err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning CAT row"})
			return
		}
		cats = append(cats, cat)
	}

	c.JSON(http.StatusOK, cats)
}

func DeleteCat(c *gin.Context) {
	catID := c.Param("id")
	_, err := database.DB.Exec("DELETE FROM cats WHERE id = ?", catID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete CAT"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "CAT deleted successfully"})
}
type UpdateCatInput struct {
	NewDateTime time.Time `json:"new_datetime"`
}

func UpdateCat(c *gin.Context) {
	catID := c.Param("id")
	var input UpdateCatInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	_, err := database.DB.Exec("UPDATE cats SET cat_datetime = ? WHERE id = ?", input.NewDateTime, catID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update CAT"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "CAT rescheduled successfully"})
}


func GetCatsForStudent(c *gin.Context) {
	studentID := c.Param("id")

	query := `
	SELECT cats.id, cats.course_id, courses.name AS course_name, cats.teacher_id, cats.cat_datetime
	FROM cats
	JOIN courses ON cats.course_id = courses.id
	JOIN student_courses ON cats.course_id = student_courses.course_id
	WHERE student_courses.student_id = ?
	ORDER BY cats.cat_datetime ASC
	`

	rows, err := database.DB.Query(query, studentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch CATs for student"})
		return
	}
	defer rows.Close()

	type Cat struct {
		ID          int       `json:"id"`
		CourseID    int       `json:"course_id"`
		CourseName  string    `json:"course_name"`
		TeacherID   int       `json:"teacher_id"`
		CatDateTime time.Time `json:"cat_datetime"`
	}

	var cats []Cat
	for rows.Next() {
		var cat Cat
		if err := rows.Scan(&cat.ID, &cat.CourseID, &cat.CourseName, &cat.TeacherID, &cat.CatDateTime); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning CAT row"})
			return
		}
		cats = append(cats, cat)
	}

	c.JSON(http.StatusOK, cats)
}
