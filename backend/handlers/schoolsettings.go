package handlers

import (
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"school-backend/database"
	"strings"
    "github.com/gin-gonic/gin"
)

type SchoolSetupRequest struct {
	Logo            string `json:"logo"`
	Background      string `json:"background"`
	ThemeTemplate   string `json:"theme"`
	LogoText        string `json:"logoText"`
	BackgroundColor string `json:"backgroundColor"`
}

func SaveBase64Image(base64Data, filename string) (string, error) {
	if base64Data == "" {
		return "", nil
	}

	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create uploads dir: %w", err)
	}

	parts := strings.Split(base64Data, ",")
	data := base64Data
	if len(parts) > 1 {
		data = parts[1]
	}

	decoded, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %w", err)
	}

	path := fmt.Sprintf("uploads/%s", filename)
	if err := os.WriteFile(path, decoded, 0644); err != nil {
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	log.Printf("✅ Saved image to %s", path)
	return "/" + path, nil
}

func SchoolSetupHandler(c *gin.Context) {
	slug := c.Param("slug")
	log.Printf("➡️ School setup request for slug: %s", slug)

	var req SchoolSetupRequest
	if err := c.BindJSON(&req); 
	err != nil {
		log.Printf("❌ Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	// check if school exists
	var id int
	err := database.DB.QueryRow("SELECT id FROM schools WHERE slug = ?", slug).Scan(&id)
	if err != nil {
		log.Printf("❌ School not found: %s", slug)
		c.JSON(http.StatusNotFound, gin.H{"error": "School not found"})
		return
	}

	updates := make([]string, 0)
	
	args := make([]interface{}, 0)
  


	// save logo
	if req.Logo != "" {
		log.Printf("Processing logo for slug %s", slug)
		logoPath, err := SaveBase64Image(req.Logo, fmt.Sprintf("%s_logo.png", slug))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		updates = append(updates, "logo_url = ?")
		args = append(args, logoPath)
	}
	// save background
	if req.Background != "" {
		log.Printf("Processing background for slug %s", slug)
		bgPath, err := SaveBase64Image(req.Background, fmt.Sprintf("%s_bg.png", slug))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		updates = append(updates, "background_url = ?")
		args = append(args, bgPath)
	}

	if req.ThemeTemplate != "" {
		updates = append(updates, "theme_template = ?")
		args = append(args, req.ThemeTemplate)
	}
	if req.LogoText != "" {
		updates = append(updates, "logo_text = ?")
		args = append(args, req.LogoText)
	}
	if req.BackgroundColor != "" {
		updates = append(updates, "background_color = ?")
		args = append(args, req.BackgroundColor)
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	// build SQL dynamically
	query := fmt.Sprintf("UPDATE schools SET %s WHERE slug = ?", strings.Join(updates, ", "))
	args = append(args, slug)

	log.Printf("🔧 Executing query: %s, args=%v", query, args)

	_, err = database.DB.Exec(query, args...)
	if err != nil {
		log.Printf("❌ Failed to update school: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update school"})
		return
	}
 
 log.Printf("the args array that stores objects %s", args)
log.Printf("the updates array that stores strings %s", updates)

	// fetch updated record
	var school struct {
		ID              int     `json:"id"`
		Slug            string  `json:"slug"`
		LogoURL         *string `json:"logo_url"`
		BackgroundURL   *string `json:"background_url"`
		ThemeTemplate   *string `json:"theme_template"`
		LogoText        *string `json:"logo_text"`
		BackgroundColor *string `json:"background_color"`
	}
	err = database.DB.QueryRow(`
		SELECT id, slug, logo_url, background_url, theme_template, logo_text, background_color
		FROM schools WHERE slug = ?`, slug).
		Scan(&school.ID, &school.Slug, &school.LogoURL, &school.BackgroundURL, &school.ThemeTemplate, &school.LogoText, &school.BackgroundColor)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated school"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "School setup saved",
		"school":  school,
	})
}



func GetSchoolSetupHandler(c *gin.Context) {
    slug := c.Param("slug")

    var school struct {
        ID              int     `json:"id"`
        Slug            string  `json:"slug"`
        LogoURL         *string `json:"logo_url"`
        BackgroundURL   *string `json:"background_url"`
        ThemeTemplate   *string `json:"theme_template"`
        LogoText        *string `json:"logo_text"`
        BackgroundColor *string `json:"background_color"`
    }

    err := database.DB.QueryRow(`
        SELECT id, slug, logo_url, background_url, theme_template, logo_text, background_color
        FROM schools WHERE slug = ?`, slug).
        Scan(&school.ID, &school.Slug, &school.LogoURL, &school.BackgroundURL, &school.ThemeTemplate, &school.LogoText, &school.BackgroundColor)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "School not found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"school": school})
}
