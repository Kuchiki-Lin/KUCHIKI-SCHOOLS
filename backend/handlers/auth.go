package handlers

import (
	"log"
	"net/http"
	"encoding/json"
	"time"
    "bytes"
	"io"
	"github.com/gin-gonic/gin"
	"school-backend/database"
	"school-backend/models"
	"school-backend/utils"
)



func Register(c *gin.Context) {
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("[ERROR] Failed to read request body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Log the raw payload
	log.Printf("[INFO] Registration payload: %s\n", string(bodyBytes))

	// Reset the body so it can be reused
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	// First bind to student to extract the role
	var roleExtractor struct {
		Role string `json:"role"`
	}
	if err := json.Unmarshal(bodyBytes, &roleExtractor); err != nil {
		log.Printf("[ERROR] Failed to extract role: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid role"})
		return
	}

	switch roleExtractor.Role {

	case "student":
		var student models.Student
		if err := json.Unmarshal(bodyBytes, &student); err != nil {
			log.Printf("[ERROR] Failed to bind student data: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student data"})
			return
		}

		student.CreatedAt = time.Now()
		student.Password = utils.HashPassword(student.Password)

		if err := SaveStudentToDB(student); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save student"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Student registered successfully"})

	case "teacher":
		var teacher models.Teacher
		if err := json.Unmarshal(bodyBytes, &teacher); err != nil {
			log.Printf("[ERROR] Failed to bind teacher data: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher data"})
			return
		}

		teacher.CreatedAt = time.Now()
		teacher.Password = utils.HashPassword(teacher.Password)

		if err := SaveTeacherToDB(teacher); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save teacher"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Teacher registered successfully"})

	default:
		log.Printf("[ERROR] Unsupported role: %s", roleExtractor.Role)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported role"})
	}
}

func Login(c *gin.Context) {

	var input struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	log.Printf("[DEBUG] input: %v\n", input)

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[ERROR] Invalid login input: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	log.Printf("[INFO] Login attempt: username=%s, role=%s", input.Username, input.Role)

	switch input.Role {
	case "student":

	var id int
    var dbPassword, fullname, department string
    err := 
	database.DB.QueryRow("SELECT id, password, fullname, department FROM students WHERE username = ?", input.Username).
    Scan(&id, &dbPassword, &fullname, &department)
		if err != nil {
			log.Printf("[ERROR] Student not found: %v\n", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Student not found"})
			return
		}
		if !utils.CheckPassword(input.Password, dbPassword) {
			log.Printf("[ERROR] Incorrect student password for %s\n", input.Username)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
			return
		}

		
		token := utils.GenerateJWT(id, fullname, department, "student")
       log.Printf("[INFO] Student login success: %s\n", fullname)
		c.SetCookie("session_token", token, 3600*24, "/", "localhost", false, true) 
        c.JSON(http.StatusOK, gin.H{"role": "student", "fullname": fullname})


	case "teacher":
		var id int
        var dbPassword, fullname, department string
        err := database.DB.QueryRow("SELECT id, password, fullname, department FROM teachers WHERE username = ?", input.Username).
    Scan(&id, &dbPassword, &fullname, &department)

		if err != nil {
			log.Printf("[ERROR] Teacher not found: %v\n", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Teacher not found"})
			return
		}
		if !utils.CheckPassword(input.Password, dbPassword) {
			log.Printf("[ERROR] Incorrect teacher password for %s\n", input.Username)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
			return
		}
		
		token := utils.GenerateJWT(id, fullname, department,"teacher")
		c.SetCookie("session_token", token, 3600*24, "/", "localhost", false, true) 
		log.Printf("[INFO] Teacher login success: %s\n", fullname)
		c.JSON(http.StatusOK, gin.H{"role": "teacher", "fullname": fullname, "department":department })

	default:
		log.Printf("[ERROR] Unsupported login role: %v\n", input.Role)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported role"})
	}
}

func SaveStudentToDB(student models.Student) error {
	query := `INSERT INTO students 
		(fullname, username, password, registrationNumber, age, year, department , created_at ) 
		VALUES (?, ?, ?, ?, ?, ?, ?,?) `

	_, err := database.DB.Exec(query,
		student.FullName,
		student.Username,
		student.Password,
		student.RegistrationNumber,
		student.Age,
		student.Year,
		student.Department,
		student.CreatedAt,
	)

		if err != nil {
		log.Printf("[ERROR] DB insert failed: %v", err)
	}
	
	return err
}

func SaveTeacherToDB(teacher models.Teacher) error {
	query := `INSERT INTO teachers 
		(fullname, username, password, subject, age, employeeId, department, year, created_at) 
		VALUES (?,?,?,?,?,?, ?,?,?)`

	_, err := database.DB.Exec(query,
		teacher.FullName,
		teacher.Username,
		teacher.Password,
		teacher.Subject,
		teacher.Age,
        teacher.EmployeeId,
        teacher.Department,
        teacher.Year,
        teacher.CreatedAt,

	)
	return err
}



func GetCurrentUser(c *gin.Context) {
    token, err := c.Cookie("session_token")
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "No session"})
        return
    }

	id, role, fullname, department, err := utils.VerifyJWT(token)


    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
        return
    }

  c.JSON(http.StatusOK, gin.H{"id": id, "role": role, "fullname": fullname, "department": department}) // assuming username is fullname

}


func Logout(c *gin.Context) {

    c.SetCookie("session_token", "", -1, "/", "localhost", false, true)
    c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
