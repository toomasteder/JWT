CREATE TABLE IF NOT EXISTS users (
    id integer NOT NULL PRIMARY KEY, --kommentaariks kakas miinusmärki andmebaasis
    username text NOT NULL UNIQUE,   --et oleks tekst, mittetühi, unikaalne
    password text NOT NULL,
    email text NOT NULL UNIQUE,
    first_name text NOT NULL,
    last_name text NOT NULL
);