export const initSQLTables = `
CREATE TABLE IF NOT EXISTS content (
	id INTEGER PRIMARY KEY,
	createdAt INTEGER,

	uri TEXT,
	lastRevision INTEGER
);
CREATE INDEX content_uri ON content (uri);


CREATE TABLE IF NOT EXISTS revision (
	id INTEGER PRIMARY KEY,
	createdAt INTEGER,
	previousRevision INTEGER,

	content TEXT,
	commitMessage TEXT
);
CREATE INDEX revision_previousRevision ON revision (previousRevision);



CREATE TABLE IF NOT EXISTS resource (
	id INTEGER PRIMARY KEY,
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
	token TEXT PRIMARY KEY,
	createdAt INTEGER,
	user INTEGER
);


CREATE TABLE IF NOT EXISTS user (
	id INTEGER PRIMARY KEY,
	createdAt INTEGER,
	privilegeLevel TEXT,
	email TEXT,
	passwordHash TEXT
);
CREATE INDEX user_email ON user (email);


CREATE TABLE IF NOT EXISTS userKVEntry (
	id INTEGER PRIMARY KEY,
	user INTEGER,
	key TEXT,
	createdAt INTEGER,
	permissions INTEGER,
	value TEXT
);
CREATE INDEX userKVEntry_createdAt ON userKVEntry (createdAt);
CREATE INDEX userKVEntry_user ON userKVEntry (user);
CREATE INDEX userKVEntry_user_key ON userKVEntry (user, key);


CREATE TABLE IF NOT EXISTS entity (
	id INTEGER PRIMARY KEY,
	createdAt INTEGER,
	type TEXT,
	parent INTEGER DEFAULT 0,
	creator INTEGER DEFAULT 0,
	permission INTEGER DEFAULT 0,
	uri TEXT DEFAULT ""
);
CREATE INDEX entity_parent ON entity (parent);
CREATE INDEX entity_uri ON entity (uri);
CREATE INDEX entity_parent_type ON entity (parent, type);
CREATE INDEX entity_creator ON entity (creator);

CREATE TABLE IF NOT EXISTS entityPermission (
	id INTEGER PRIMARY KEY,
	createdAt INTEGER,
	level INTEGER DEFAULT 0,
	member INTEGER,
	entity INTEGER,

	CONSTRAINT fk_member
		FOREIGN KEY (member)
		REFERENCES entity(id)
		ON DELETE CASCADE,

	CONSTRAINT fk_entity
		FOREIGN KEY (entity)
		REFERENCES entity(id)
		ON DELETE CASCADE
);
CREATE INDEX entityPermission_member_entity ON entityPermission (member, entity);
CREATE INDEX entityPermission_member ON entityPermission (member);
CREATE INDEX entityPermission_entity ON entityPermission (entity);

CREATE TABLE IF NOT EXISTS entityValue (
	id INTEGER PRIMARY KEY,
	createdAt INTEGER,
	creator INTEGER,
	entity INTEGER,
	key TEXT,
	value TEXT,
	permission INTEGER DEFAULT 0,
	previousVersion INTEGER DEFAULT 0,

	CONSTRAINT fk_entity
		FOREIGN KEY (entity)
		REFERENCES entity(id)
		ON DELETE CASCADE
);
CREATE INDEX entityValue_entity ON entityValue (entity);
CREATE INDEX entityValue_entity_key ON entityValue (entity, key);
CREATE INDEX entityValue_entity_creator ON entityValue (entity, creator);

`;
