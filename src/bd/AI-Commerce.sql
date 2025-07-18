CREATE TABLE public.users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255),
    store_id INTEGER NULL,
    access_token VARCHAR(255) NULL,
    store_url VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free',
    remaining_queries INTEGER DEFAULT 100,
    renovation_date DATE DEFAULT CURRENT_DATE,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_query TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



INSERT INTO public.users (
  email,
  name,
  store_url,
  plan,
  remaining_queries,
  renovation_date,
  creation_date
) VALUES (
  'ianlevin01@gmail.com',
  'sumo',
  'https://sumo8.mitiendanube.com',
  'free',
  100,
  '2025-08-16',
  '2025-07-16 00:00:00'
);

