DROP TABLE cityapiloc;

CREATE TABLE cityapiloc(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(500),
  latitude NUMERIC(7, 4),
  longitude NUMERIC(7, 4)
);