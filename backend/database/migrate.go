package database

import "fmt"

func Migrate() {
    query := `
    CREATE TABLE IF NOT EXISTS class_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        course_id INT NOT NULL,
        day_of_week VARCHAR(10) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        venue VARCHAR(100) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`

    _, err := DB.Exec(query)
    if err != nil {
        panic("❌ Migration failed: " + err.Error())
    }

    fmt.Println("✅ Table 'class_schedules' migrated")
}
