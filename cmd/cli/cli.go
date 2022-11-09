package main

import (
	"database/sql"
	_ "embed"
	"fmt"
	"strconv"
	"strings"
	"tagged-fs/db"

	"github.com/alecthomas/kong"
	_ "github.com/mattn/go-sqlite3"
)

type NullInt64 sql.NullInt64

func (n *NullInt64) UnmarshalText(text []byte) error {
	str := strings.ToLower(string(text))
	if strings.HasPrefix(str, "null") {
		n.Valid = false
		return nil
	} else {
		val, err := strconv.ParseInt(str, 10, 64)
		if err != nil {
			return err
		}

		n.Valid = true
		n.Int64 = val
		return nil
	}
}

var CLI struct {
	Db string `short:"d" help:"Database file." default:"tagged-fs.sqlite3"`

	Tag struct {
		Add struct {
			Name     string `arg:"" required:""`
			Color    string `arg:"" required:"" help:"Hex color code."`
			ParentId *int   `short:"p" help:"Id of parent tag."`
		} `cmd:"" help:"Add a tag"`
		Ls   struct{} `cmd:"" help:"List all tags"`
		Edit struct {
			TagId    int `arg:"" required:"" help:"Tag ID"`
			Name     *string
			Color    *string    `help:"Hex color code."`
			ParentId *NullInt64 `short:"p" help:"Id of parent tag. Set to -1 for NULL"`
		} `cmd:"" help:"Edit a tag"`
		Rm struct {
			TagId int `arg:"" required:"" help:"Tag ID"`
		} `cmd:"" help:"Delete a tag"`
	} `cmd:"" help:"Tag commands."`

	File struct {
		Add struct {
			Path string `arg:"" required:"" type:"existingfile"`
			Tags []int  `arg:"" required:"" help:"Tag IDs."`
		} `cmd:"" help:"Add a file"`
		Ls struct {
			Name *string `help:"Search by name."`
			Tags []int   `help:"Search by tags (takes into account parent tags)."`
		} `cmd:"" help:"List and search all files"`
		Edit struct {
			Path string `arg:"" required:"" type:"existingfile"`
			Tags []int  `arg:"" required:"" help:"Tag IDs"`
		} `cmd:"" help:"Edit file's tags"`
		Rm struct {
			Path string `arg:"" required:"" type:"existingfile"`
		} `cmd:"" help:"Delete a file"`
	} `cmd:"" help:"File commands."`
}

func main() {

	ctx := kong.Parse(&CLI)

	DB := db.Init(CLI.Db)

	switch ctx.Command() {
	case "tag add <name> <color>":
		AddTag(DB, CLI.Tag.Add.Name, CLI.Tag.Add.Color, CLI.Tag.Add.ParentId)
	case "tag edit <tag-id>":
		EditTag(DB, CLI.Tag.Edit.TagId, CLI.Tag.Edit.Name, CLI.Tag.Edit.Color, (*sql.NullInt64)(CLI.Tag.Edit.ParentId))
	case "tag ls":
		ListTags(DB)
	case "tag rm <tag-id>":
		RmTag(DB, CLI.Tag.Rm.TagId)

	case "file add <path> <tags>":
		AddFile(DB, CLI.File.Add.Path, CLI.File.Add.Tags)
	case "file edit <path> <tags>":
		EditFile(DB, CLI.File.Edit.Path, CLI.File.Edit.Tags)
	case "file ls":
		ListFiles(DB, CLI.File.Ls.Name, CLI.File.Ls.Tags)
	case "file rm <path>":
		RmFile(DB, CLI.File.Rm.Path)
	default:
		panic(fmt.Sprintf("Unknown command: '%v'", ctx.Command()))
	}
}
