package models
import(
    "time"
)

type Teacher struct {
	ID       uint   `json:"id"`
	FullName string `json:"fullname"`
	Username string `json:"username"`
	Password string `json:"password"`
	Subject  string `json:"subject"`
    Age      int     `json:"age"`
    Role    string `json:"role"`
    EmployeeId string `json:"employeeId"`
    Department string `json:"department"`  
    Year        string `json:"year"`
   CreatedAt time.Time  `json:"created_at"`

}
