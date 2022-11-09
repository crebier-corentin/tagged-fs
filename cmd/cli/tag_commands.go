package main

import (
	"database/sql"
	"fmt"
	"os"
	"tagged-fs/action"
	"tagged-fs/db"

	"github.com/olekukonko/tablewriter"
)

func AddTag(db db.DB, name string, color string, parentId *int /* nilable */) {
	var parentIds []int = nil
	if parentId != nil {
		parentIds = []int{*parentId}
	}

	action.AddTag(db, name, color, parentIds)
}

func ListTags(db db.DB) {
	tags := action.ListTags(db)

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Id", "Name", "Color", "Parent Id"})

	for _, tag := range tags {
		table.Append([]string{fmt.Sprintf("%v", tag.Id), tag.Name, tag.Color, fmt.Sprintf("%v", tag.ParentIds)})
	}
	table.Render()
}

func EditTag(db db.DB, tagId int, name *string /* nilable */, color *string /* nilable */, parentId *sql.NullInt64 /* nilable */) {
	var parentIds *[]int = nil
	if parentId != nil {
		if parentId.Valid {
			parentIds = &[]int{int(parentId.Int64)}
		} else {
			parentIds = &[]int{}
		}
	}

	action.EditTag(db, tagId, name, color, parentIds)
}

func RmTag(db db.DB, tagId int) {
	action.RmTag(db, tagId)
}
