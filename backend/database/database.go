package database

import (
    "database/sql"
    "fmt"
   _ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func Connect() {
    var err error
    

    dsn := "root:bankaitensa13/@tcp(127.0.0.1:3306)/school_db?parseTime=true"

    DB,err = sql.Open("mysql", dsn)

    if err != nil {
        panic("Failed to open database connection: " + err.Error())
    }
    err = DB.Ping()
    
    if err != nil {
        panic("Failed to ping database: " + err.Error())
    }

    fmt.Println("✅ Connected to MySQL!")
    Migrate()
}


