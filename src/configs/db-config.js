import dotenv from 'dotenv';
dotenv.config();

const config = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: { rejectUnauthorized: false }, // obligatorio para Supabase
  family: 4 // 👈 fuerza a usar IPv4
};

export default config;