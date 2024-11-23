-- file: 10-create_user_and_db.sql
CREATE ROLE program WITH PASSWORD 'test';
GRANT ALL PRIVILEGES ON *.* TO program;
ALTER ROLE program WITH LOGIN;