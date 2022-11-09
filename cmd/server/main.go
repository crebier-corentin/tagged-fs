package main

import (
	_ "embed"
	"tagged-fs/db"
	"tagged-fs/server"
)

func main() {
	db := db.Init("tagged-fs.sqlite3")
	router := server.SetupGin(db)
	router.Run("127.0.0.1:8080")

}
