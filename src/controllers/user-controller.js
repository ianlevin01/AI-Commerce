import { Router } from 'express';
import UserService from '../services/user-service.js';
import axios from 'axios';
import bcrypt from 'bcrypt';

const router = Router();
const svc = new UserService();
router.post('/register', async (req, res) => {

    let respuesta;
    try {
        const fechaActual = new Date(); 
        const fechaRenovacion = new Date(fechaActual);
        fechaRenovacion.setMonth(fechaRenovacion.getMonth() + 1);

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        let user = {
            email: req.body.email,
            password: hashedPassword, // guardamos la contraseña hasheada
            name: req.body.name,
            store_url: req.body.store_url,
            plan: req.body.plan,
            creation_date: fechaActual,
            renovation_date: fechaRenovacion
        };
        const returnArray = await svc.Register(user);

        if (returnArray != null) {
            respuesta = res.status(200).json(returnArray);
        } else {
            respuesta = res.status(401).send('No se pudo crear el usuario correctamente, ya existe una cuenta con ese correo electronico');
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
        respuesta = res.status(500).send('Error interno.');
    }

    return respuesta;
});
router.post('/login', async (req, res) => {

    let respuesta;
    const { email, password } = req.body;
    try {

        const user = await svc.GetUser(email);

        if (user != null) {
            const passwordValida = await bcrypt.compare(password, user.password);
            if (passwordValida){
                respuesta = res.status(200).json(user);
            }else{
                respuesta = res.status(401).send('Usuario o contraseña incorrectos.');
            }
        } else {
            respuesta = res.status(401).send('Usuario o contraseña incorrectos.');
        }
    } catch (error) {
        console.error('Error en el login:', error);
        respuesta = res.status(500).send('Error interno.');
    }

    return respuesta;
});
export default router;