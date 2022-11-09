CREATE TABLE file (
    id INTEGER PRIMARY KEY,
    path TEXT NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE tag (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    "order" INTEGER NOT NULL 
);

CREATE TABLE tag_parent_tag (
    tag_id INTEGER NOT NULL,
    parent_tag_id INTEGER NOT NULL,
    FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_tag_id) REFERENCES tag (id) ON DELETE CASCADE
);

CREATE TABLE file_tag (
    file_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (file_id) REFERENCES file (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE
);