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
    Politicas = async (id_user) => {
        const repo = new RequestRepository();
        //const objeto = await repo.Politicas(id_user);
        return "los envios se hacen por andreani, le va a llegar el codigo de seguimiento recien cuando sa despachado en el correo. si le llego un producto distintos al pedido se nececita la foto y el numero de pedido.";
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
    CustomResponses = async (id_user) => {
        const repo = new RequestRepository();
        const objeto = await repo.CustomResponses(id_user);
        console.log(objeto)
        return objeto;
    }
}