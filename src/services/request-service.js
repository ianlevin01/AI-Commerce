import 'dotenv/config'; 
import RequestRepository from '../repositories/request-repository.js';
export default class RequestService {
    ProductoInfo = async (nombre) => {
        console.log("llegoo")
        const repo = new RequestRepository();
        const objeto = await repo.ProductoInfo(nombre);
        return objeto;
    }
}