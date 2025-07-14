import config from './../configs/db-config.js';
import pkg from 'pg'
const {Client} = pkg 

export default class EventRepository{
    ProductoInfo = async (nombre) => {
        let objeto = null
        const client = new Client(config)
        try{
            await client.connect()
            const query = `
                SELECT descripcion
                FROM productos
                WHERE nombre ILIKE '%' || $1 || '%'
                LIMIT 1
            `;
            const values = [nombre]

            const result = await client.query(query, values)
            await client.end()
            objeto = result.rows
        }catch (error){
            console.log(error)
        }
        return objeto;
    }
}