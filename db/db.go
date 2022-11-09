package db

import (
	"database/sql"
	_ "embed"
	"errors"
	"path/filepath"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	"github.com/zyedidia/generic/mapset"
)

//go:embed migration.sql
var migration string

func must(err error) {
	if err != nil {
		panic(err.Error())
	}
}

type DB struct {
	db *sql.DB
}

func Init(dbPath string) DB {
	db, err := sql.Open("sqlite3", "file:"+dbPath+"?_fk=true")
	must(err)

	// Only migrate if needed
	row := db.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
	must(row.Err())
	var count int
	if row.Scan(&count); count == 0 {
		_, err = db.Exec(migration)
		must(err)
	}

	return DB{db}
}

// Tag
type Tag struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	Color     string `json:"color"`
	ParentIds []int  `json:"parentIds"`
}

func (db DB) GetAllTags() []Tag {
	rows, err := db.db.Query("SELECT id, name, color, tpt.parent_tag_id FROM tag LEFT JOIN tag_parent_tag tpt ON tpt.tag_id = tag.id ORDER BY \"order\"")
	must(err)

	tags := make([]Tag, 0)
	tagsById := make(map[int]*Tag)

	for rows.Next() {
		must(rows.Err())

		var tagId int
		var name string
		var color string
		var parentId sql.NullInt64
		rows.Scan(&tagId, &name, &color, &parentId)

		tag, ok := tagsById[tagId]
		if !ok {
			tags = append(tags, Tag{tagId, name, color, make([]int, 0)})
			tag = &tags[len(tags)-1]
			tagsById[tagId] = tag
		}

		if parentId.Valid {
			tag.ParentIds = append(tag.ParentIds, int(parentId.Int64))
		}
	}

	return tags
}

func (db DB) InsertTag(name string, color string, parentIds []int) {
	res, err := db.db.Exec("INSERT INTO tag (name, color, \"order\") VALUES (?, ?, ?)", name, color, db.getNextOrder())
	must(err)

	id, err := res.LastInsertId()
	must(err)

	for _, v := range parentIds {
		_, err = db.db.Exec("INSERT INTO tag_parent_tag (tag_id, parent_tag_id) VALUES (?, ?)", id, v)
		must(err)
	}
}

func (db DB) TagExists(id int) bool {
	row := db.db.QueryRow("SELECT COUNT(*) FROM tag WHERE id = ?", id)
	must(row.Err())

	var count int
	err := row.Scan(&count)
	must(err)
	return count == 1
}

func (db DB) UpdateTag(id int, name *string /* nilable */, color *string /* nilable */, parentIds *[]int /* nilable */) {
	updates := make([]string, 0, 3)
	params := make([]any, 0, 3)

	if name != nil {
		updates = append(updates, "name = ?")
		params = append(params, *name)
	}
	if color != nil {
		updates = append(updates, "color = ?")
		params = append(params, *color)

	}

	sql := "UPDATE tag SET " + strings.Join(updates, ", ") + " WHERE id = ?"
	params = append(params, id)

	_, err := db.db.Exec(sql, params...)
	must(err)

	// Update parent relation
	if parentIds != nil {
		_, err := db.db.Exec("DELETE FROM tag_parent_tag WHERE tag_id = ?", id)
		must(err)

		for _, v := range *parentIds {
			_, err := db.db.Exec("INSERT INTO tag_parent_tag (tag_id, parent_tag_id) VALUES (?, ?)", id, v)
			must(err)
		}
	}
}

func (db DB) UpdateTagsOrder(ids []int) {
	tx, err := db.db.Begin()
	must(err)

	for i, v := range ids {
		_, err := tx.Exec("UPDATE tag SET \"order\" = ? WHERE id = ?", i, v)
		must(err)
	}

	err = tx.Commit()
	must(err)
}

func (db DB) DeleteTag(id int) {
	_, err := db.db.Exec("DELETE FROM tag WHERE id = ?", id)
	must(err)
}

func (db DB) GetAllChildTagIds(tagId int) []int {
	rows, err := db.db.Query(`WITH RECURSIVE cte(id) AS (
									SELECT id FROM tag WHERE id = ?
								UNION ALL
									SELECT t.id FROM tag t
									JOIN tag_parent_tag tpt ON tpt.tag_id = t.id
									JOIN cte ON cte.id = tpt.parent_tag_id
							)
							SELECT * FROM cte;`, tagId)
	must(err)

	result := make([]int, 0)
	for rows.Next() {
		var tagId int
		err = rows.Scan(&tagId)
		must(err)

		result = append(result, tagId)
	}

	return result
}

func (db DB) GetAllParentTagIds(tagId int) []int {
	rows, err := db.db.Query(`WITH RECURSIVE cte(id, parent_tag_id) AS (
									SELECT t.id, tpt.parent_tag_id FROM tag t 
									LEFT JOIN tag_parent_tag tpt ON tpt.tag_id = t.id 
									WHERE t.id IN (?)
								UNION ALL
									SELECT t.id, tpt.parent_tag_id FROM tag t 
									LEFT JOIN tag_parent_tag tpt ON tpt.tag_id = t.id
									JOIN cte ON cte.parent_tag_id = t.id
							)
							SELECT id FROM cte;`, tagId)
	must(err)

	result := make([]int, 0)
	for rows.Next() {
		var tagId int
		err = rows.Scan(&tagId)
		must(err)

		result = append(result, tagId)
	}

	return result
}

func (db DB) getNextOrder() int {
	row := db.db.QueryRow("SELECT MAX(\"order\") FROM tag")
	if errors.Is(row.Err(), sql.ErrNoRows) {
		return 0
	}
	must(row.Err())

	var order int
	row.Scan(&order)
	return order + 1
}

type File struct {
	Id   int    `json:"id"`
	Path string `json:"path"`
	Name string `json:"name"`
	Tags []Tag  `json:"tags"`
}

// File
func (db DB) AddFile(path string, tagIds []int) {
	tx, err := db.db.Begin()
	must(err)

	// name is filename without extension
	name := filepath.Base(path)
	name = strings.TrimSuffix(name, filepath.Ext(name))
	res, err := tx.Exec("INSERT INTO file (name, path) VALUES (?, ?)", name, path)
	must(err)
	fileId, err := res.LastInsertId()
	must(err)

	for _, tagId := range tagIds {
		tx.Exec("INSERT INTO file_tag (file_id, tag_id) VALUES (?, ?)", fileId, tagId)
	}

	err = tx.Commit()
	must(err)
}

func (db DB) FileExists(id int) bool {
	row := db.db.QueryRow("SELECT COUNT(*) FROM file WHERE id = ?", id)
	must(row.Err())

	var count int
	err := row.Scan(&count)
	must(err)
	return count == 1
}
func (db DB) FileExistsPath(path string) bool {
	row := db.db.QueryRow("SELECT COUNT(*) FROM file WHERE path = ?", path)
	must(row.Err())

	var count int
	err := row.Scan(&count)
	must(err)
	return count == 1
}

func (db DB) FileIdFromPath(path string) int {
	row := db.db.QueryRow("SELECT id FROM file WHERE path = ?", path)
	must(row.Err())

	var id int
	err := row.Scan(&id)
	must(err)
	return id
}
func (db DB) FilePathFromId(id int) string {
	row := db.db.QueryRow("SELECT path FROM file WHERE id = ?", id)
	must(row.Err())

	var path string
	err := row.Scan(&path)
	must(err)
	return path
}

func (db DB) SearchFiles(name *string /* nilable */, tagIds []int) []File {
	wheres := make([]string, 0)
	params := make([]any, 0)

	if name != nil {
		wheres = append(wheres, "f.name LIKE ?")
		params = append(params, "%"+*name+"%")
	}

	if len(tagIds) != 0 {
		for _, tagId := range tagIds {
			hierarchyTagIds := db.GetAllChildTagIds(tagId)

			inSql := strings.Repeat("?,", len(hierarchyTagIds))
			inSql = inSql[:len(inSql)-1] // remove extra ,

			wheres = append(wheres, "t.id IN ("+inSql+")")
			for _, tagId := range hierarchyTagIds {
				params = append(params, tagId)
			}
		}

	}

	sql := `SELECT f.id, f.path, f.name, t.id, t.name, t.color 
	FROM file f 
	LEFT JOIN file_tag ft ON ft.file_id = f.id 
	LEFT JOIN tag t ON t.id = ft.tag_id `

	if len(wheres) != 0 {
		sql += "WHERE " + strings.Join(wheres, " AND ")
	}

	sql += " ORDER BY f.name"

	rows, err := db.db.Query(sql, params...)
	must(err)

	fileById := make(map[int]File)
	for rows.Next() {
		must(rows.Err())

		var fileId int
		var path string
		var name string
		var tagId *int
		var tagName string
		var tagColor string
		rows.Scan(&fileId, &path, &name, &tagId, &tagName, &tagColor)

		file, ok := fileById[fileId]
		if !ok {
			file = File{
				Id:   fileId,
				Path: path,
				Name: name,
				Tags: make([]Tag, 0),
			}
		}

		if tagId != nil {
			file.Tags = append(file.Tags, Tag{
				Id:    *tagId,
				Name:  tagName,
				Color: tagColor,
			})
		}

		fileById[fileId] = file
	}

	result := make([]File, 0, len(fileById))
	for _, f := range fileById {
		result = append(result, f)
	}
	return result
}

func (db DB) UpdateFileTags(fileId int, tagIds []int) {
	existingTagIds := func() mapset.Set[int] {
		rows, err := db.db.Query("SELECT ft.tag_id FROM file_tag ft JOIN file f ON ft.file_id = f.id WHERE f.id = ?", fileId)
		must(err)

		tagIds := mapset.New[int]()
		for rows.Next() {
			var tagId int
			err := rows.Scan(&tagId)
			must(err)

			tagIds.Put(tagId)
		}

		return tagIds
	}()

	wantedTagIds := mapset.New[int]()
	for _, tagId := range tagIds {
		wantedTagIds.Put(tagId)
	}

	tx, err := db.db.Begin()
	must(err)

	// Delete tags that are no longer wanted
	existingTagIds.Each(func(tagId int) {
		if !wantedTagIds.Has(tagId) {
			_, err := tx.Exec("DELETE FROM file_tag WHERE file_id = ? AND tag_id = ?", fileId, tagId)
			must(err)
		}
	})

	// Insert new tags
	wantedTagIds.Each(func(tagId int) {
		if !existingTagIds.Has(tagId) {
			_, err := tx.Exec("INSERT INTO file_tag (file_id, tag_id) VALUES (?, ?)", fileId, tagId)
			must(err)
		}
	})

	err = tx.Commit()
	must(err)
}

func (db DB) DeleteFile(id int) {
	_, err := db.db.Exec("DELETE FROM file WHERE id = ?", id)
	must(err)
}
