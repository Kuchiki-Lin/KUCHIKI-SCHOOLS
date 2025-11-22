package handlers

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
    "strings" // ✅ Add this
    "time"
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
		Slug string `json:"slug"`
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

 var schoolID int64
    err = database.DB.QueryRow("SELECT id FROM schools WHERE slug = ? LIMIT 1", roleExtractor.Slug).Scan(&schoolID)
    if err != nil {
        log.Printf("[ERROR] School not found for slug %s: %v", roleExtractor.Slug, err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid school slug"})
        return
    }



		student.CreatedAt = time.Now()
		student.Password = utils.HashPassword(student.Password)

		if err := SaveStudentToDB(student, schoolID); err != nil {
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
		 var schoolID int64
    err = database.DB.QueryRow("SELECT id FROM schools WHERE slug = ? LIMIT 1", roleExtractor.Slug).Scan(&schoolID)
    if err != nil {
        log.Printf("[ERROR] School not found for slug %s: %v", roleExtractor.Slug, err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid school slug"})
        return
    }

		teacher.CreatedAt = time.Now()
		teacher.Password = utils.HashPassword(teacher.Password)

		if err := SaveTeacherToDB(teacher, schoolID); err != nil {
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
		Slug     string `json:"slug"`
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

	var id, schoolID int
    var dbPassword, fullname, department,  dbSlug string
    err := database.DB.QueryRow(`
    SELECT s.id, s.password, s.fullname, s.department, s.school_id, sch.slug
    FROM students s
    JOIN schools sch ON s.school_id = sch.id
    WHERE s.username = ?`,
    input.Username,
).Scan(&id, &dbPassword, &fullname, &department, &schoolID, &dbSlug)

		if err != nil {
			log.Printf("[ERROR] Student not found: %v\n", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Student not found"})
			return
		}

    if dbSlug != input.Slug {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid school"})
        return
    }

		if !utils.CheckPassword(input.Password, dbPassword) {
			log.Printf("[ERROR] Incorrect student password for %s\n", input.Username)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
			return
		}

		token := utils.GenerateJWT(id, schoolID, fullname, department,dbSlug, "student")

       log.Printf("[INFO] Student login success: %s\n", fullname)
		c.SetCookie("session_token", token, 3600*24, " /", "localhost", false, true) 
        c.JSON(http.StatusOK, gin.H{"role": "student", "fullname": fullname})


	case "teacher":
		var id, schoolID int
        var dbPassword, fullname, department,  dbSlug string
       err := database.DB.QueryRow(`
    SELECT t.id, t.password, t.fullname, t.department, t.school_id, sch.slug
    FROM teachers t
    JOIN schools sch ON t.school_id = sch.id
    WHERE t.username = ?`,
    input.Username,
).Scan(&id, &dbPassword, &fullname, &department, &schoolID, &dbSlug)

		if err != nil {
			log.Printf("[ERROR] Teacher not found: %v\n", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Teacher not found"})
			return
		}


  if dbSlug != input.Slug {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid school"})
        return
    }


		if !utils.CheckPassword(input.Password, dbPassword) {
			log.Printf("[ERROR] Incorrect teacher password for %s\n", input.Username)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
			return
		}
		
		token := utils.GenerateJWT(id, schoolID, fullname, department,dbSlug, "teacher")

		c.SetCookie("session_token", token, 3600*24, "/", "localhost", false, true) 
		log.Printf("[INFO] Teacher login success: %s\n", fullname)
		c.JSON(http.StatusOK, gin.H{"role": "teacher", "fullname": fullname, "department":department })

	default:
		log.Printf("[ERROR] Unsupported login role: %v\n", input.Role)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported role"})
	}
}

func SaveStudentToDB(student models.Student, schoolID int64) error {
	query := `INSERT INTO students 
		(fullname, username, password, registrationNumber, age, year, department , created_at, school_id) 
		VALUES (?, ?, ?, ?, ?, ?, ?,?,?) `

	_, err := database.DB.Exec(query,
		student.FullName,
		student.Username,
		student.Password,
		student.RegistrationNumber,
		student.Age,
		student.Year,
		student.Department,
		student.CreatedAt,
		schoolID,
	)

		if err != nil {
		log.Printf("[ERROR] DB insert failed: %v", err)
	}
	
	return err
}

func SaveTeacherToDB(teacher models.Teacher,  schoolID int64) error {
	query := `INSERT INTO teachers 
		(fullname, username, password, subject, age, employeeId, department, year, created_at, school_id) 
		VALUES (?,?,?,?,?,?, ?,?,?,?)`

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
		schoolID,

	)
	return err
}


func GetCurrentUser(c *gin.Context) {
    
    log.Println("[DEBUG] Entered GetCurrentUser handler")

    token, err := c.Cookie("session_token")
    if err != nil {
        log.Printf("[ERROR] No session cookie found: %v\n", err)
        c.JSON(http.StatusUnauthorized, gin.H{"error": "No session"})
        return
    }
    log.Printf("[DEBUG] Session token retrieved: %s\n", token)

    id, schoolID,role,fullname, department, dbSlug, err := utils.VerifyJWT(token)
    if err != nil {
        log.Printf("[ERROR] JWT verification failed: %v\n", err)
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
        return
    }
    log.Printf("[INFO] Verified JWT -> id=%d, schoolID=%d, role=%s, fullname=%s, department=%s, dbSlug=%s\n",
        id, schoolID, role, fullname, department, dbSlug)

    // Fetch branding from schools
    var logoURL, backgroundURL, themeTemplate, logoText, backgroundColor string
    log.Printf("[DEBUG] Fetching branding for schoolID=%d\n", schoolID)
    err = database.DB.QueryRow(`
        SELECT logo_url, background_url, theme_template, logo_text, background_color
        FROM schools
        WHERE id = ?`,
        schoolID,
    ).Scan(&logoURL, &backgroundURL, &themeTemplate, &logoText, &backgroundColor)

    if err != nil {
        log.Printf("[ERROR] Failed to fetch school branding for schoolID=%d: %v\n", schoolID, err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch school branding"})
        return
    }
    log.Printf("[INFO] Branding fetched: logo=%s, background=%s, theme=%s, text=%s, bgColor=%s\n",
        logoURL, backgroundURL, themeTemplate, logoText, backgroundColor)

    // Return user info + school branding
    log.Printf("[INFO] Returning user data + branding for userID=%d, role=%s\n", id, role)

    apiBase := "http://localhost:8080"

    c.JSON(http.StatusOK, gin.H{
        "id":               id,
        "schoolID":         schoolID,
        "role":             role,
        "fullname":         fullname,
        "department":       department,
        "dbSlug":           dbSlug,
        "logo_url":        apiBase + logoURL,
        "background_url": apiBase +  backgroundURL,
        "theme_template":   themeTemplate,
        "logo_text":        logoText,
        "background_color": backgroundColor,
    })
}


func Logout(c *gin.Context) {

    c.SetCookie("session_token", "", -1, "/", "localhost", false, true)
    c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}



//school ownership registration
func RegisterSchool(c *gin.Context) {
    var req struct {
        Name     string `json:"name"`
        Type     string `json:"type"`
        Email    string `json:"email"`
        Password string `json:"password"`
		PhoneNumber string `json:"phonenumber"`
    }

    if err := c.ShouldBindJSON(&req); 
	err != nil {
        log.Printf("❌ Invalid request body: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    log.Printf("📥 Received request to register school: Name=%s, Type=%s, Email=%s", req.Name, req.Type, req.Email)

    // Step 1: Insert school with temporary slug
    log.Println("💾 Inserting school into DB (with temp slug)...")
    res, err := database.DB.Exec(
        "INSERT INTO schools (name, type, slug) VALUES (?, ?, ?)",
        req.Name, req.Type, "temp",
    )
    if err != nil {
        log.Printf("❌ Failed to insert school: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create school"})
        return
    }

    schoolID, _ := res.LastInsertId()
    log.Printf("✅ School inserted with ID=%d", schoolID)

    // Step 2: Generate unique slug using ID
    rawSlug := strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))
    slug := fmt.Sprintf("%s-%d", rawSlug, schoolID)
    log.Printf("🔑 Generated slug: %s", slug)

    // Step 3: Update slug in DB
    _, err = database.DB.Exec("UPDATE schools SET slug = ? WHERE id = ?", slug, schoolID)
    if err != nil {
        log.Printf("❌ Failed to update slug: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update slug"})
        return
    }
    log.Println("✅ Slug updated successfully")

    // Step 4: Hash admin password
    hashed := utils.HashPassword(req.Password)
    log.Println("🔒 Password hashed")

    // Step 5: Create admin account
    _, err =database.DB.Exec(
    "INSERT INTO users (email, password_hash, role, school_id, phonenumber) VALUES (?, ?, ?, ?, ?)",
    req.Email, hashed, "main-admin", schoolID, req.PhoneNumber,
)
    if err != nil {
        log.Printf("❌ Failed to create admin: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create admin"})
        return
    }
    log.Println("✅ Admin account created")

    // Step 6: Respond to frontend
    c.JSON(http.StatusOK, gin.H{
        "message": "School registered successfully",
        "school": gin.H{
            "id":   schoolID,
            "name": req.Name,
            "slug": slug,
            "type": req.Type,
        },
    })
}

//SCHOOL-OWNERSHIP LOGIN
func SchoolLogin(c *gin.Context) {
    var req struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        log.Printf("❌ Invalid request body: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    log.Printf("📥 Login attempt: Email=%s", req.Email)

    // Step 1: Find user by email
    var (
        id           int64
        passwordHash string
        role         string
        schoolID     int64
    )

    err := database.DB.QueryRow(
        "SELECT id, password_hash, role, school_id FROM users WHERE email = ?",
        req.Email,
    ).Scan(&id, &passwordHash, &role, &schoolID)

    if err != nil {
        log.Printf("❌ User not found: %v", err)
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    // Step 2: Verify password
    if !utils.CheckPassword(req.Password, passwordHash) {
        log.Println("❌ Password mismatch")
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    log.Println("🔑 Password verified")

    // Step 3: Get school slug
    var slug string
    err = database.DB.QueryRow("SELECT slug FROM schools WHERE id = ?", schoolID).Scan(&slug)
    if err != nil {
        log.Printf("❌ Failed to fetch school slug: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch school"})
        return
    }

    log.Printf("🏫 User belongs to school (ID=%d, Slug=%s)", schoolID, slug)

    // Step 4: Generate JWT token
    token := utils.GenerateJWT(
        int(id),
        int(schoolID),
        req.Email,   // email as username
        "",          // no department
        slug,        // school slug
        "main-admin",
    )

    // Step 5: Set HttpOnly cookie
    c.SetCookie("session_token", token, 3600*24, "/", "localhost", false, true)
    log.Println("🍪 Session cookie set")

    // Step 6: Respond with success
    c.JSON(http.StatusOK, gin.H{
        "message": "Login successful",
        "role":    role,
        "slug":    slug,
    })
}
