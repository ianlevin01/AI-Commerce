import 'dotenv/config'; 
import ApiRepository from '../repositories/api-repository.js';
export default class ApiService {
    SaveUser = async (user_id, access_token) => {
            const repo = new ApiRepository();
            const objeto = await repo.SaveUser(user_id, access_token);
            return objeto;
        }
}