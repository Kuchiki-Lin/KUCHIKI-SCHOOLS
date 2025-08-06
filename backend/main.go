package main

import (

	"school-backend/handlers"
    "school-backend/database"
    "school-backend/controllers"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"time"
)

func main() {
    r := gin.Default()
	    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))
  
    r.POST("/register", handlers.Register)
    r.POST("/login", handlers.Login)
    r.GET ("/me", handlers.GetCurrentUser)
    r.GET ("/logout", handlers.Logout)
    r.POST("/teacher/:id/courses", handlers.AssignCoursesToTeacher)
    r.GET("/teacher/:id/selectedcourses", handlers.GetTeacherCourses)
    r.GET("/courses", handlers.GetAllCourses)
    r.GET("/courses/department/:department", handlers.GetCoursesByDepartment)
    r.POST("/student/:id/courses", handlers.AssignCoursesToStudent)
    r.GET("/student/:id/courses", handlers.GetStudentCourses)
    r.GET("/student/:id/department-courses", handlers.GetCoursesByStudentDepartment)
    r.GET("/teacher/:id/courses-with-count", handlers.GetTeacherCoursesy)
    r.GET("/teacher/:id/students", handlers.GetStudentsForTeacher)
    r.GET("/teachers/detailed", controllers.GetAllTeachersDetailed)
    r.GET("/students/detailed", controllers.GetAllStudentsDetailed)
    r.POST("/cats", handlers.CreateCat)
    r.PUT("/cats/:id", handlers.UpdateCat)
    r.DELETE("/cats/:id", handlers.DeleteCat)
    r.GET("/cats/teacher/:id", handlers.GetCatsByTeacher)
    r.GET("/cats/student/:id", handlers.GetCatsForStudent)
    r.POST("/teacher/:id/schedule", controllers.AddClassSchedule)
    r.GET("/teacher/:id/schedule",controllers.GetTeacherSchedule)
    r.GET("/student/:id/classes", handlers.GetStudentClasses )

    database.Connect()


    r.Run(":8080")
}
