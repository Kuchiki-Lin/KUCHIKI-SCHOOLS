package utils

import (
    "github.com/golang-jwt/jwt/v4"
    "time"
)


var jwtKey = []byte("secret-key") // use env in prod

func GenerateJWT(id int, username, department, role string) string {
    claims := jwt.MapClaims{
         "id":      id,
        "username": username,
        "department": department,
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




func VerifyJWT(tokenStr string) (id int, role, username, department string, err error) {
    token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        return jwtKey, nil
    })

    if err != nil || !token.Valid {
        return 0, "", "", "", err
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return 0, "", "", "", err
    }

    idFloat, ok := claims["id"].(float64)
    if !ok {
        return 0, "", "", "", err
    }

    departmentStr, ok := claims["department"].(string)
    if !ok {
        return 0, "", "", "", err
    }

    return int(idFloat), claims["role"].(string), claims["username"].(string), departmentStr, nil
}
