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

CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  id_user INT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(50),
  needs_human BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (id_user, phone)
);

CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  client_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);



INSERT INTO public.users (
  email,
  name,
  password,
  store_url,
  plan,
  remaining_queries,
  renovation_date,
  creation_date
) VALUES (
  'ianlevin01@gmail.com',
  'sumo',
  '$2b$10$.0mET8Fd6xt.W25Oz.hm1.EGVop4ScPBedoiN9FunFBsSo6vtuoEq',
  'https://sumo8.mitiendanube.com',
  'free',
  100,
  '2025-08-16',
  '2025-07-16 00:00:00'
);

