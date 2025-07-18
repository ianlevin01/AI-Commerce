import { Router } from 'express';
import UserService from '../services/user-service.js';
import axios from 'axios';

const router = Router();
const svc = new UserService();
router.post('/newuser', async (req, res) => {
    //usar bycript para hashear la contraseña
    let respuesta;
    try {
        const fechaActual = new Date(); 
        const fechaRenovacion = new Date(fechaActual);
        fechaRenovacion.setMonth(fechaRenovacion.getMonth() + 1);

        let user = {
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            store_url: req.body.store_url,
            plan: req.body.plan,
            creation_date: fechaActual,
            renovation_date: fechaRenovacion
        };
        const returnArray = await svc.NewUser(user);

        if (returnArray != null) {
            respuesta = res.status(200).json(returnArray);
        } else {
            respuesta = res.status(404).send('No se pudo crear el usuario correctamente');
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
        respuesta = res.status(500).send('Error interno.');
    }

    return respuesta;
});
export default router;