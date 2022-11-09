package server

import (
	_ "embed"
	"fmt"
	"net/http"
	"net/url"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"tagged-fs/action"
	"tagged-fs/db"

	"github.com/gin-gonic/gin"
	"github.com/sqweek/dialog"
)

//go:embed favicon.png
var favicon []byte

func must(err error) {
	if err != nil {
		panic(err)
	}
}

func SetupGin(db_ db.DB) *gin.Engine {
	r := gin.Default()

	r.Use(gin.CustomRecovery(func(c *gin.Context, recovered any) {
		if err, ok := recovered.(string); ok {
			c.String(http.StatusInternalServerError, fmt.Sprintf("error: %s", err))
		}
		if err, ok := recovered.(error); ok {
			c.String(http.StatusInternalServerError, fmt.Sprintf("error: %s", err.Error()))
		}
		c.AbortWithStatus(http.StatusInternalServerError)
	}))

	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		originUrl, err := url.Parse(origin)
		must(err)

		// Only allow local
		if originUrl.Hostname() == "localhost" || originUrl.Hostname() == "127.0.0.1" {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE")
			c.Header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
		}

	})

	r.OPTIONS("/*cors", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	r.GET("/favicon.png", func(c *gin.Context) {
		c.Data(http.StatusOK, "image/png", favicon)
	})

	r.POST("/open-folder", func(c *gin.Context) {
		var data struct {
			Path string `json:"path" binding:"required"`
		}
		err := c.BindJSON(&data)
		must(err)

		if runtime.GOOS == "windows" {
			// ignore err, explorer always returns 1
			exec.Command("explorer", "/select,"+data.Path).Run()
		}
		if runtime.GOOS == "linux" {
			err = exec.Command("xdg-open", filepath.Dir(data.Path)).Run()
			must(err)
		}

		c.Status(http.StatusNoContent)
	})

	r.POST("/file-picker", func(c *gin.Context) {
		filename, err := dialog.File().Load()
		must(err)

		c.String(http.StatusOK, filename)
	})

	// Tag routes
	r.GET("/tags", func(c *gin.Context) {
		c.JSON(http.StatusOK, action.ListTags(db_))
	})

	r.POST("/tags", func(c *gin.Context) {
		var data struct {
			Name      string `json:"name" binding:"required"`
			Color     string `json:"color" binding:"required"`
			ParentIds []int  `json:"parentIds"`
		}
		err := c.BindJSON(&data)
		must(err)

		action.AddTag(db_, data.Name, data.Color, data.ParentIds)

		c.Status(http.StatusNoContent)
	})

	r.PUT("/tags/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		if idStr == "" {
			panic("Missing id")
		}
		id, err := strconv.Atoi(idStr)
		must(err)

		var data struct {
			Name      *string `json:"name"`
			Color     *string `json:"color"`
			ParentIds *[]int  `json:"parentIds"`
		}
		err = c.BindJSON(&data)
		must(err)

		action.EditTag(db_, id, data.Name, data.Color, data.ParentIds)

		c.Status(http.StatusNoContent)
	})

	r.PUT("/tags/order", func(c *gin.Context) {
		var ids []int
		err := c.BindJSON(&ids)
		must(err)

		db_.UpdateTagsOrder(ids)

		c.Status(http.StatusNoContent)
	})

	r.DELETE("/tags/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		if idStr == "" {
			panic("Missing id")
		}
		id, err := strconv.Atoi(idStr)
		must(err)

		action.RmTag(db_, id)

		c.Status(http.StatusNoContent)
	})

	// File routes
	r.GET("/files", func(c *gin.Context) {
		c.JSON(http.StatusOK, action.ListFiles(db_, nil, nil))
	})

	r.GET("/files/:id/file", func(c *gin.Context) {
		idStr := c.Param("id")
		if idStr == "" {
			panic("Missing id")
		}
		id, err := strconv.Atoi(idStr)
		must(err)

		path := db_.FilePathFromId(id)
		c.File(path)
	})

	r.POST("/files/search", func(c *gin.Context) {
		var data struct {
			Name *string `json:"name" binding:"-"`
			Tags []int   `json:"tags" binding:"-"`
		}

		if c.Request.ContentLength > 0 {
			err := c.BindJSON(&data)
			must(err)
		}

		c.JSON(http.StatusOK, action.ListFiles(db_, data.Name, data.Tags))
	})

	r.POST("/files", func(c *gin.Context) {
		var data struct {
			Path string `json:"path" binding:"required"`
			Tags []int  `json:"tags" binding:"required"`
		}
		err := c.BindJSON(&data)
		must(err)

		action.AddFile(db_, data.Path, data.Tags)

		c.Status(http.StatusNoContent)
	})

	r.PUT("/files/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		if idStr == "" {
			panic("Missing id")
		}
		id, err := strconv.Atoi(idStr)
		must(err)

		var data struct {
			Tags []int `json:"tags" binding:"required"`
		}
		err = c.BindJSON(&data)
		must(err)

		action.EditFile(db_, id, data.Tags)

		c.Status(http.StatusNoContent)
	})

	r.DELETE("/files/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		if idStr == "" {
			panic("Missing id")
		}
		id, err := strconv.Atoi(idStr)
		must(err)

		action.RmFile(db_, id)

		c.Status(http.StatusNoContent)
	})

	return r
}
