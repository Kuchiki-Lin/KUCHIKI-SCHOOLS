package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
)


var jwtKey = []byte("secret-key") // use env in prod

func GenerateJWT(id , schoolID int, fullname, department,dbSlug, role string) string {
    claims := jwt.MapClaims{
         "id":      id,
         "schoolID":schoolID,
        "fullname": fullname,
        "department": department,
        "dbSlug":dbSlug,
        "role":     role,
        "exp":      time.Now().Add(time.Hour * 72).Unix(),
    }
	
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenStr, _ := token.SignedString(jwtKey)
    return tokenStr
}

func ValidateToken(tokenStr string) bool {
    _, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        return jwtKey, nil
    })
    return err == nil
}



func VerifyJWT(tokenStr string) (id, schoolID int, role, fullname, department, dbSlug string, err error) {
    token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        return jwtKey, nil
    })
    if err != nil || !token.Valid {
        return 0, 0, "", "", "", "", err
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return 0, 0, "", "", "", "", fmt.Errorf("invalid claims")
    }

    idFloat, ok := claims["id"].(float64)
    if !ok {
        return 0, 0, "", "", "", "", fmt.Errorf("invalid id")
    }

    schoolIDFloat, ok := claims["schoolID"].(float64)
    if !ok {
        return 0, 0, "", "", "", "", fmt.Errorf("invalid schoolID")
    }

    roleStr, _ := claims["role"].(string)
    fullnameStr, _ := claims["fullname"].(string)
    departmentStr, _ := claims["department"].(string)
    dbSlugStr, _ := claims["dbSlug"].(string)

    return int(idFloat), int(schoolIDFloat), roleStr, fullnameStr, departmentStr, dbSlugStr, nil
}
