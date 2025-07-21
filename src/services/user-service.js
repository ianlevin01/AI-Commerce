import 'dotenv/config'; 
import UserRepository from '../repositories/user-repository.js';
export default class UserService {
    Register = async (user) => {
        const repo = new UserRepository();
        const objeto = await repo.Register(user);
        return objeto;
    }
    GetUser = async (email) => {
        const repo = new UserRepository();
        const objeto = await repo.GetUser(email);
        return objeto;
    }
    GetUserId = async (id_user) => {
        const repo = new UserRepository();
        const objeto = await repo.GetUserId(id_user);
        return objeto;
    }    
}