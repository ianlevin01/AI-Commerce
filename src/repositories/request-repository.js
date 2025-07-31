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

            const userQuery = `
                SELECT store_id, access_token
                FROM users
                WHERE id = $1
            `;
            const userResult = await client.query(userQuery, [id_user]);

            if (userResult.rows.length === 0) {
                throw new Error('No se encontró el usuario');
            }

            const { store_id, access_token } = userResult.rows[0];

            // 🔁 Llamada a la API de Tiendanube
            const url = `https://api.tiendanube.com/2025-03/${store_id}/products`;

            try {
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `bearer ${access_token}`, // 🛠 corregido: era 'Authentication'
                        'User-Agent': 'TuApp (tuemail@tudominio.com)' // necesario para Tiendanube
                    }
                });

                objeto = response.data;
            } catch (apiError) {
                console.warn('⚠️ No se pudo obtener productos desde Tiendanube. Usando base de datos local.');

                // ⛑️ Fallback: productos locales desde la base
                const localQuery = `
                    SELECT id, name, description, price
                    FROM products
                    WHERE user_id = $1
                `;
                const localResult = await client.query(localQuery, [id_user]);

                objeto = localResult.rows;
            }

            await client.end();

        } catch (error) {
            console.error('❌ Error:', error.message || error);
            await client.end();
        }

        return objeto;
    };


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
                SELECT *
                FROM store_info
                WHERE user_id = $1
            `;
            const values = [id_user];
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
    HumanResponse = async (id_user, client_number, client_email) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            if (!client_number && !client_email) {
                throw new Error('Debe proporcionarse al menos un número o un email.');
            }

            const query = `
                UPDATE clients
                SET needs_human = true
                WHERE id_user = $1 AND (phone = $2 OR email = $3);
            `;

            const values = [id_user, client_number, client_email];
            const result = await client.query(query, values);

            if (result.rowCount === 0) {
                objeto = "Error en el sistema";
                throw new Error('No se encontró el usuario o cliente');
            } else {
                objeto = "Cliente actualizado correctamente";
            }

        } catch (error) {
            console.error('Error:', error.message || error);
        } finally {
            await client.end();
        }

        return objeto;
    };

    BotResponse = async (id_user, client_number, client_email) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            if (!client_number && !client_email) {
                throw new Error('Debe proporcionarse al menos un número o un email.');
            }

            // 1. Buscar si ya existe por phone o email
            let query = `
                SELECT needs_human FROM clients
                WHERE id_user = $1 AND (phone = $2 OR email = $3)
                LIMIT 1;
            `;

            const values = [id_user, client_number, client_email];
            let result = await client.query(query, values);

            // 2. Si no existe, insertarlo con los datos disponibles
            if (result.rows.length === 0) {
                query = `
                    INSERT INTO clients (id_user, phone, email, needs_human)
                    VALUES ($1, $2, $3, false);
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
            await client.end();
        }

        return objeto;
    };
    GuardarConversacion = async (id_user, client_number, client_email, message) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            if (!client_number && !client_email) {
                throw new Error('Debe proporcionarse al menos un número o un email.');
            }

            const query = `
                INSERT INTO conversations (client_id, message)
                VALUES (
                    (
                        SELECT id FROM clients
                        WHERE id_user = $1 AND (phone = $2 OR email = $3)
                        LIMIT 1
                    ),
                    $4
                );
            `;

            const values = [id_user, client_number, client_email, message];
            const result = await client.query(query, values);

            if (result.rowCount === 0) {
                objeto = "Error en el sistema";
                throw new Error('No se encontró el usuario o cliente');
            } else {
                objeto = "Mensaje guardado correctamente";
            }

        } catch (error) {
            console.error('Error:', error.message || error);
        } finally {
            await client.end();
        }

        return objeto;
    };

    Conversaciones = async (user_id, client_number, client_email) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                SELECT message
                FROM conversations
                JOIN clients ON conversations.client_id = clients.id
                WHERE clients.id_user = $1
                AND (
                    ($2::VARCHAR IS NOT NULL AND clients.phone = $2)
                    OR
                    ($3::VARCHAR IS NOT NULL AND clients.email = $3)
                )  
            `;

            const values = [user_id, client_number, client_email];
            
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
    UserFaqs = async (id_user) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                SELECT question, answer
                FROM user_faqs
                WHERE user_id = $1
            `;
            const values = [id_user];
            const result = await client.query(query, values);

            await client.end();

            if (result.rows.length === 0) {
                throw new Error('No se encontró el usuario');
            }

            objeto = result.rows

        } catch (error) {
            console.error('Error:', error.message || error);
        }

        return objeto;
    }
    ShippingMethods = async (id_user) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                SELECT *
                FROM shipping_methods
                WHERE user_id = $1
            `;
            const values = [id_user];
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
    }
    StorePolicies = async (id_user) => {
        let objeto = null;
        const client = new Client(config);

        try {
            await client.connect();

            const query = `
                SELECT *
                FROM store_policies
                WHERE user_id = $1
            `;
            const values = [id_user];
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
    }
}