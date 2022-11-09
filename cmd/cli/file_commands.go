package main

import (
	"os"
	"strings"
	"tagged-fs/action"
	"tagged-fs/db"

	"github.com/olekukonko/tablewriter"
)

func AddFile(db db.DB, path string, tagIds []int) {
	action.AddFile(db, path, tagIds)
}

func EditFile(db db.DB, path string, tagIds []int) {
	id := db.FileIdFromPath(path)
	action.EditFile(db, id, tagIds)
}

func ListFiles(db db.DB, name *string /* nilable */, tagIds []int) {
	files := action.ListFiles(db, name, tagIds)

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Path", "Name", "Tags"})
	for _, f := range files {
		tagNames := make([]string, len(f.Tags))
		for i, t := range f.Tags {
			tagNames[i] = t.Name
		}

		table.Append([]string{f.Path, f.Name, strings.Join(tagNames, ", ")})
	}
	table.Render()
}

func RmFile(db db.DB, path string) {
	id := db.FileIdFromPath(path)
	action.RmFile(db, id)
}
