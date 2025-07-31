import dotenv from 'dotenv';
dotenv.config();

const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // obligatorio en Supabase
  family: 4 // fuerza IPv4
};

export default config;
