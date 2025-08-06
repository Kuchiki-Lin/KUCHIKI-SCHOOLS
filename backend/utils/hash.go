package utils

import "golang.org/x/crypto/bcrypt"

func HashPassword(pw string) string {
    hashed, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
    return string(hashed)
}

func CheckPassword(pw, hashed string) bool {
    return bcrypt.CompareHashAndPassword([]byte(hashed), []byte(pw)) == nil
}
