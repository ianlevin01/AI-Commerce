import config from './../configs/db-config.js';
import pkg from 'pg'
import axios from 'axios';
const {Client} = pkg 

export default class RequestRepository{
    Productos = async (id_user) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                SELECT store_id, access_token
                FROM users
                WHERE id = $1
            `;
            const values = [id_user];
            const result = await client.query(query, values);

            await client.end();

            if (result.rows.length === 0) {
                throw new Error('No se encontró el usuario');
            }

            const { shop_id, access_token } = result.rows[0];

            // 📦 Llamada a la API de Tiendanube
            const url = `https://api.tiendanube.com/2025-03/${shop_id}/products`;

            // ✅ Corrección: el header correcto es "Authorization"
            const response = await axios.get(url, {
                headers: {
                    'Authentication': `bearer ${access_token}`
                }
            });

            objeto = response.data;

        } catch (error) {
            console.error('Error:', error.message || error);
        }

        return objeto;
    }

    EstadoCompra = async (id_user, order_id) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                UPDATE users
                SET remaining_queries = remaining_queries - 1
                WHERE id = $1
                RETURNING store_id, access_token;
            `;
            const values = [id_user];
            const result = await client.query(query, values);

            await client.end();

            if (result.rows.length === 0) {
                throw new Error('No se encontró el usuario');
            }

            const { store_id, access_token } = result.rows[0];

            // 📦 Llamada a la API de Tiendanube
            const url = `https://api.tiendanube.com/2025-03/${store_id}/orders?number=${order_id}`;

            // ✅ Corrección: el header correcto es "Authorization"
            const response = await axios.get(url, {
                headers: {
                    'Authentication': `bearer ${access_token}`
                }
            });

            const order = response.data[0];

            return order

        } catch (error) {
            console.error('Error:', error.message || error);
            return null
        }
    }
    StoreInfo = async (id_user) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                SELECT email, name, store_url
                FROM users
                WHERE id = $1
            `;
            const values = [id_user];
            const result = await client.query(query, values);

            await client.end();

            if (result.rows.length === 0) {
                throw new Error('No se encontró el usuario');
            }

            const { email, name, store_url } = result.rows[0];
            objeto = {
                "email":email,
                "name": name,
                "store_url": store_url
            }

        } catch (error) {
            console.error('Error:', error.message || error);
        }

        return objeto;
    }
    QueriesAvailable = async (id_user) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                SELECT remaining_queries FROM users WHERE id = $1    
            `;

            const values = [
                id_user
            ];
            
            const result = await client.query(query, values);
            await client.end();

            if (result.rows.length === 0) {
                throw new Error('No se encontró el usuario');
            }

            objeto = result.rows[0].remaining_queries>0;
        } catch (error) {
            console.error('Error:', error.message || error);
        }

        return objeto;
    };
    HumanResponse = async (id_user, client_number) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                UPDATE clients
                SET needs_human = true
                WHERE id_user = $1 AND phone = $2;   
            `;

            const values = [
                id_user,
                client_number
            ];
            
            const result = await client.query(query, values);
            await client.end();

            if (result.rowCount == 0) {
                objeto = "Error en el sistema"
                throw new Error('No se encontró el usuario o cliente');
            }else{
                objeto = "Cliente actualizado correctamente"
            }
        } catch (error) {
            console.error('Error:', error.message || error);
        }

        return objeto;
    };
    BotResponse = async (id_user, client_number) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            // 1. Buscar si ya existe
            let query = `
                SELECT needs_human FROM clients
                WHERE id_user = $1 AND phone = $2;
            `;

            const values = [id_user, client_number];
            let result = await client.query(query, values);

            // 2. Si no existe, insertarlo
            if (result.rows.length === 0) {
                query = `
                    INSERT INTO clients (id_user, phone, needs_human)
                    VALUES ($1, $2, false);
                `;
                await client.query(query, values);

                // Ya que es nuevo, permitimos que el bot responda
                objeto = true;
            } else {
                // 3. Si existe, devolvemos el inverso de needs_human
                objeto = !result.rows[0].needs_human;
            }

        } catch (error) {
            console.error('❌ Error en BotResponse:', error.message || error);
        } finally {
            await client.end(); // ✅ Cerramos al final, una sola vez
        }

        return objeto;
    };
    GuardarConversacion = async (id_user, client_number, message) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                INSERT INTO conversations (client_id, message)
                VALUES (
                (SELECT id FROM clients WHERE phone = $1 AND id_user = $2),
                $3
                );   
            `;

            const values = [
                client_number,
                id_user,
                message
            ];
            
            const result = await client.query(query, values);
            await client.end();

            if (result.rowCount == 0) {
                objeto = "Error en el sistema"
                throw new Error('No se encontró el usuario o cliente');
            }else{
                objeto = "Cliente actualizado correctamente"
            }
        } catch (error) {
            console.error('Error:', error.message || error);
        }

        return objeto;
    };
    Conversaciones = async (user_id, client_number) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                SELECT message
                FROM conversations
                JOIN clients ON conversations.client_id = clients.id
                WHERE clients.phone = $1 AND clients.id_user = $2   
            `;

            const values = [
                client_number, user_id
            ];
            
            const result = await client.query(query, values);
            await client.end();

            if (result.rowCount == 0) {
                throw new Error('No se encontró el usuario o cliente');
            }
            objeto = result.rows

        } catch (error) {
            console.error('Error:', error.message || error);
        }

        return objeto;
    };
}