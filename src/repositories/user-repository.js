import config from './../configs/db-config.js';
import pkg from 'pg'
import axios from 'axios';
const {Client} = pkg 
export default class UserRepository{
    Register = async (user) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                INSERT INTO users (
                    email, password, name, store_url, plan, creation_date, renovation_date
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7
                )
                ON CONFLICT (email) DO NOTHING
                RETURNING *;
            `;

            const values = [
                user.email,
                user.password,
                user.name,
                user.store_url,
                user.plan,
                user.creation_date,
                user.renovation_date
            ];

            const result = await client.query(query, values);

            await client.end();

            if (result.rowCount === 0) {
                // No se insertó porque ya existía
                return null;
            }

            // Usuario insertado correctamente
            objeto = result.rows[0];
        } catch (error) {
            console.error('Error:', error.message || error);
        }

        return objeto;
    };
    GetUser = async (email) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                SELECT * FROM users WHERE email = $1    
            `;

            const values = [
                email
            ];

            const result = await client.query(query, values);

            await client.end();

            if (result.rows.length === 0) {
                throw new Error('No se encontró el usuario');
            }

            objeto = result.rows[0];
        } catch (error) {
            console.error('Error:', error.message || error);
        }

        return objeto;
    };
    GetUserId = async (id_user) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                SELECT * FROM users WHERE id = $1    
            `;

            const values = [
                id_user
            ];

            const result = await client.query(query, values);

            await client.end();

            if (result.rows.length === 0) {
                throw new Error('No se encontró el usuario');
            }

            objeto = result.rows[0];
        } catch (error) {
            console.error('Error:', error.message || error);
        }

        return objeto;
    };
    
}