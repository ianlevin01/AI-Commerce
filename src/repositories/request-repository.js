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
}