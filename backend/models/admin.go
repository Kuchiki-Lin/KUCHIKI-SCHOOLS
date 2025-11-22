package models
import (
	"time"
)

type Admin struct {
	ID uint `json:"id"`
	FullName string `json:"fullname"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role string `json:"role"`
	Instcode int `json:"instcode"`
	
	CreatedAt time.Time `json:"created_at"`
}