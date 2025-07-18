import 'dotenv/config'; 
import RequestRepository from '../repositories/request-repository.js';
export default class RequestService {
    ProductosInfo = async (id_user) => {
        const repo = new RequestRepository();
        const productos = await repo.Productos(id_user);
        return productos;
    }
    EstadoCompra = async (id_user,id_order) => {
        console.log("iduser",id_user,"idorder",id_order)
        const repo = new RequestRepository();
        const objeto = await repo.EstadoCompra(id_user, id_order);
        return objeto;
    }
    Politicas = async (id_user) => {
        const repo = new RequestRepository();
        const objeto = await repo.Politicas();
        return objeto;
    }
    StoreInfo = async (id_user) => {
        const repo = new RequestRepository();
        const objeto = await repo.StoreInfo();
        return objeto;
    }
}