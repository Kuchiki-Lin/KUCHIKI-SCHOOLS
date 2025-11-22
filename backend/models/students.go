
package models
import(
	"time"
)

type Student struct {
	ID                uint   `json:"id" gorm:"primaryKey"`
	Username          string `json:"username"`
	Password          string `json:"password"` // Store hashed version
	Role              string `json:"role"`
	FullName          string `json:"fullname"`
	RegistrationNumber string `json:"registrationNumber"`
	Department string `json:"department"` 
	Age               int    `json:"age"`
	Year              string `json:"year"`
	BackgroundURL    string `json:"background_url"`
	Slug             string `json:"slug"`
	CreatedAt time.Time `json:"created_at"`
}
