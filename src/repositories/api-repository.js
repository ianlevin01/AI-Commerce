import config from './../configs/db-config.js';
import pkg from 'pg'
import axios from 'axios';
const {Client} = pkg 
export default class ApiRepository{
    SaveUser = async (user_id, access_token) => {
        const client = new Client(config);
        try {
        await client.connect();

        // Llamar a la API de Tiendanube para obtener datos de la tienda
        const tiendaResponse = await axios.get(`https://api.tiendanube.com/2025-03/${user_id}/store`, {
            headers: {
            'Authentication': `bearer ${access_token}`
            }
        });
        const email = tiendaResponse.data.email;

        // Actualizar la tienda en la base de datos según el email
        const updateQuery = `
            UPDATE users
            SET store_id = $1,
                access_token = $2
            WHERE email = $3
            RETURNING *;
        `;

        const result = await client.query(updateQuery, [user_id, access_token, email]);
        if (result.rowCount === 0) {
            throw new Error('No se encontró ninguna tienda con ese email');
        }

        return result.rows[0];

        } catch (error) {
        console.error('Error al vincular tienda:', error.message);
        throw error;
        } finally {
        await client.end();
        }
    };
}