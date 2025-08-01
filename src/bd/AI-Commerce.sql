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

CREATE TABLE store_info (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  store_name TEXT,
  description TEXT,
  location TEXT,
  contact_email TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE store_policies (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  shipping_policy TEXT,
  return_policy TEXT,
  refund_policy TEXT,
  payment_methods TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE shipping_methods (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  carrier_name TEXT,
  pickup_available BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_faqs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  question TEXT,
  answer TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  name TEXT,
  description TEXT,
  price INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

