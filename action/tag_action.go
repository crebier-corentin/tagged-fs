package action

import (
	"fmt"
	"strings"
	"tagged-fs/db"
)

func isHexColor(color string) bool {
	if len(color) != 7 {
		return false
	}
	if color[0] != '#' {
		return false
	}

	for _, c := range color[1:] {
		if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
			return false
		}
	}

	return true
}

func validateColor(color *string) {
	if !isHexColor(*color) {
		panic(fmt.Sprintf("Invalid hex color: '%v'", *color))
	}
	*color = strings.ToUpper(*color)
}

func AddTag(db db.DB, name string, color string, parentIds []int) {
	validateColor(&color)

	// check that parent ids exist
	for _, v := range parentIds {
		if !db.TagExists(v) {
			panic(fmt.Sprintf("Tag id '%v' does not exist", v))
		}
	}

	db.InsertTag(name, color, parentIds)
}

func ListTags(db db.DB) []db.Tag {
	return db.GetAllTags()
}

func EditTag(db db.DB, tagId int, name *string /* nilable */, color *string /* nilable */, parentIds *[]int /* nilable */) {
	if name == nil && color == nil && parentIds == nil {
		panic("No change specified")
	}

	if color != nil {
		validateColor(color)
	}

	if parentIds != nil {

		for _, v := range *parentIds {
			// check that parent ids exist
			if !db.TagExists(v) {
				panic(fmt.Sprintf("Tag id '%v' does not exist", v))
			}

			// Check for circular references
			if tagId == v {
				panic("Circular reference. Tag cannot have itself as parent.")
			}

			parentTagIds := db.GetAllParentTagIds(v)
			for _, parentTagId := range parentTagIds {
				if parentTagId == tagId {
					panic("Circular reference. Tag cannot have a parent that is a descendant of itself.")
				}
			}
		}

	}

	db.UpdateTag(tagId, name, color, parentIds)
}

func RmTag(db db.DB, tagId int) {
	// check that tag exists
	if !db.TagExists(tagId) {
		panic(fmt.Sprintf("Tag id '%v' does not exist", tagId))
	}

	db.DeleteTag(tagId)
}
