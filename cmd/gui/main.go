package main

import (
	_ "embed"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"runtime"
	"tagged-fs/db"
	"tagged-fs/server"
	"tagged-fs/web/dist"

	"github.com/gin-gonic/gin"
	"github.com/zserge/lorca"
)

func must(err error) {
	if err != nil {
		panic(err)
	}
}

func main() {
	// Open "tagged-fs.sqlite3" in executable dir
	ex, err := os.Executable()
	must(err)
	db := db.Init(filepath.Join(filepath.Dir(ex), "/tagged-fs.sqlite3"))

	gin.SetMode(gin.ReleaseMode)
	router := server.SetupGin(db)
	// UI route
	router.GET("/", func(c *gin.Context) {
		c.Header("Content-Type", "text/html")
		c.String(http.StatusOK, dist.Html)
	})

	args := []string{}
	if runtime.GOOS == "linux" {
		args = append(args, "--class=Lorca")
	}
	ui, err := lorca.New("", "", 800, 700, args...)
	if err != nil {
		log.Fatal(err)
	}
	defer ui.Close()

	// Load Server
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()
	go http.Serve(ln, router)

	ui.Bind("GET_API_URL", func() string {
		return "http://" + ln.Addr().String()
	})

	ui.Load(fmt.Sprintf("http://%s/", ln.Addr()))

	// Wait until the interrupt signal arrives or browser window is closed
	sigc := make(chan os.Signal, 1)
	signal.Notify(sigc, os.Interrupt)
	select {
	case <-sigc:
	case <-ui.Done():
	}
}
