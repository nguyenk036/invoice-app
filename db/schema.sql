-- Client definition

CREATE TABLE Client (
	first_name TEXT NOT NULL,
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	last_name TEXT,
	email TEXT,
	address TEXT,
	zip TEXT,
	company TEXT,
	city TEXT,
	state TEXT,
	phone TEXT
);


-- InvoiceItem definition

CREATE TABLE InvoiceItem (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	name TEXT NOT NULL,
	rate NUMERIC NOT NULL
);


-- InvoiceHistory definition

CREATE TABLE InvoiceHistory (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	first_name TEXT NOT NULL,
	last_name TEXT,
	email TEXT,
	address TEXT,
	zip TEXT,
	company TEXT,
	city TEXT,
	state TEXT,
	phone TEXT,
	filename TEXT
);


-- InvoiceItemHistory definition

CREATE TABLE InvoiceItemHistory (
	invoice_history_id INTEGER NOT NULL,
	invoice_item_id INTEGER NOT NULL,
	CONSTRAINT InvoiceItemHistory_InvoiceItem_FK FOREIGN KEY (invoice_item_id) REFERENCES InvoiceItem(id) ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT InvoiceItemHistory_InvoiceHistory_FK FOREIGN KEY (invoice_history_id) REFERENCES InvoiceHistory(id) ON DELETE SET NULL ON UPDATE CASCADE
);