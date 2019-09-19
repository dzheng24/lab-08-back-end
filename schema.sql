DROP DATABASE IF EXISTS city_explorer;

CREATE DATABASE city_explorer;

\c city_explorer

DROP TABLE IF EXISTS locationtable;

CREATE TABLE locationtable(
    id SERIAL PRIMARY KEY,
    location_name VARCHAR(255),
    longitude VARCHAR(255),
    latitude VARCHAR(255)
);


