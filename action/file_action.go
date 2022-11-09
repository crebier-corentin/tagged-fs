package action

import (
	"fmt"
	"path/filepath"
	"tagged-fs/db"
)

func must(err error) {
	if err != nil {
		panic(err.Error())
	}
}

func AddFile(db db.DB, path string, tagIds []int) {
	abs, err := filepath.Abs(path)
	must(err)

	if db.FileExistsPath(abs) {
		panic(fmt.Sprintf("File '%v' already exists", abs))
	}

	for _, tagId := range tagIds {
		if !db.TagExists(tagId) {
			panic(fmt.Sprintf("Tag id '%v' does not exist", tagId))
		}
	}

	db.AddFile(abs, tagIds)
}

func EditFile(db db.DB, id int, tagIds []int) {
	if !db.FileExists(id) {
		panic(fmt.Sprintf("File '%v' does not exists", id))
	}

	for _, tagId := range tagIds {
		if !db.TagExists(tagId) {
			panic(fmt.Sprintf("Tag id '%v' does not exist", tagId))
		}
	}

	db.UpdateFileTags(id, tagIds)
}

func ListFiles(db db.DB, name *string /* nilable */, tagIds []int) []db.File {
	for _, tagId := range tagIds {
		if !db.TagExists(tagId) {
			panic(fmt.Sprintf("Tag id '%v' does not exist", tagId))
		}
	}

	return db.SearchFiles(name, tagIds)
}

func RmFile(db db.DB, id int) {
	if !db.FileExists(id) {
		panic(fmt.Sprintf("File '%v' does not exists", id))
	}

	db.DeleteFile(id)
}
