import 'dotenv/config'; 
import RequestRepository from '../repositories/request-repository.js';
export default class RequestService {
    ProductosInfo = async (id_user) => {
        const repo = new RequestRepository();
        const productos = await repo.Productos(id_user);
        return productos;
    }
    EstadoCompra = async (num_compra,id_user) => {
        console.log("hola")
        const repo = new RequestRepository();
        const objeto = await repo.EstadoCompra(num_compra);
        return objeto;
    }
    Politicas = async (id_user) => {
        const repo = new RequestRepository();
        const objeto = await repo.Politicas();
        return objeto;
    }
}