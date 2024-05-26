CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    createdAt INTEGER,
    modifiedAt INTEGER,
    deletedAt INTEGER,

    uri TEXT,
    contentRevision INTEGER
);
CREATE INDEX content_uri ON content (uri);


CREATE TABLE IF NOT EXISTS revision (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    createdAt INTEGER,
    previousRevision INTEGER,

    content TEXT
);
CREATE INDEX revision_previousRevision ON revision (previousRevision);



CREATE TABLE IF NOT EXISTS resource (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    createdAt INTEGER,

    filePath TEXT,
    fileExt TEXT,
    fileHash TEXT,
    fileName TEXT,
    fileType TEXT
);
CREATE INDEX resource_type ON resource (fileType);
CREATE INDEX resource_name ON resource (fileName);
