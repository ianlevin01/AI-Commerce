import 'dotenv/config'; 
import RequestRepository from '../repositories/request-repository.js';
export default class RequestService {
    GuardarConversacion = async (user_id, client_number, client_email, client_message) => {
        const repo = new RequestRepository();
        const guardado = await repo.GuardarConversacion(user_id, client_number, client_email, client_message);
        return guardado;
    }
    Conversaciones = async (user_id, client_number, client_email) => {
        const repo = new RequestRepository();
        const objeto = await repo.Conversaciones(user_id, client_number, client_email);
        return objeto;
    }
    ProductosInfo = async (id_user) => {
        const repo = new RequestRepository();
        const productos = await repo.Productos(id_user);
        return productos;
    }
    EstadoCompra = async (id_user,id_order) => {
        const repo = new RequestRepository();
        const objeto = await repo.EstadoCompra(id_user, id_order);
        return objeto;
    }
    StorePolicies = async (id_user) => {
        const repo = new RequestRepository();
        const objeto = await repo.StorePolicies(id_user);
        return objeto
    }
    StoreInfo = async (id_user) => {
        const repo = new RequestRepository();
        const objeto = await repo.StoreInfo(id_user);
        return objeto;
    }
    QueriesAvailable = async (id_user) => {
        const repo = new RequestRepository();
        const objeto = await repo.QueriesAvailable(id_user);
        return objeto;
    }
    HumanResponse = async (id_user, client_number, client_email) => {
        const repo = new RequestRepository();
        const objeto = await repo.HumanResponse(id_user, client_number, client_email);
        return objeto;
    }
    BotResponse = async (id_user, client_number, client_email) => {
        const repo = new RequestRepository();
        const objeto = await repo.BotResponse(id_user, client_number, client_email);
        return objeto;
    }
    UserFaqs = async (id_user) => {
        const repo = new RequestRepository();
        const objeto = await repo.UserFaqs(id_user);
        return objeto;
    }
    ShippingMethods = async (id_user) => {
        const repo = new RequestRepository();
        const objeto = await repo.ShippingMethods(id_user);
        return objeto;
    }
}