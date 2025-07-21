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

            const order = response.data;

            const shipping_status = order[0].shipping_status;
            const tracking_code = order[0].fulfillments?.[0]?.tracking_info?.code;

            return {
                "shipping_status": shipping_status,
                "tracking_code": tracking_code
            }

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
}