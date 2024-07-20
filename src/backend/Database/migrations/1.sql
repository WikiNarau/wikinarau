CREATE TABLE IF NOT EXISTS content (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	createdAt INTEGER,

	uri TEXT,
	lastRevision INTEGER
);
CREATE INDEX content_uri ON content (uri);


CREATE TABLE IF NOT EXISTS revision (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	createdAt INTEGER,
	previousRevision INTEGER,

	content TEXT,
	commitMessage TEXT
);
CREATE INDEX revision_previousRevision ON revision (previousRevision);



CREATE TABLE IF NOT EXISTS resource (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	createdAt INTEGER,

	path TEXT,
	extension TEXT,
	hash TEXT,
	name TEXT,
	type TEXT
);
CREATE INDEX resource_path ON resource (path);
CREATE INDEX resource_type ON resource (type);
CREATE INDEX resource_name ON resource (name);


CREATE TABLE IF NOT EXISTS session (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	createdAt INTEGER,
	token TEXT,
	user INTEGER
);
CREATE INDEX session_token ON session (token);


CREATE TABLE IF NOT EXISTS user (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	createdAt INTEGER,
	privilegeLevel TEXT,
	email TEXT,
	passwordHash TEXT
);
CREATE INDEX user_email ON user (email);
CREATE INDEX user_privilegeLevel ON user (privilegeLevel);