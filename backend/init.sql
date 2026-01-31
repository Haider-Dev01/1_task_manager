CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL , 
    status VARCHAR(30) DEFAULT 'pending'
);
