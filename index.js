import express from "express";
import cors from "cors";
import RequestRouter from "./src/controllers/request-controller.js";
import ApiRouter from "./src/controllers/api-controller.js";
import UserRouter from "./src/controllers/user-controller.js";
import WebhookRouter from "./src/controllers/webhook-controller.js";
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Obtener __dirname con ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para JSON
app.use(express.json());
app.use(cors());

// Servir archivos estáticos (tu HTML) desde carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

app.use('/request', RequestRouter);
app.use('/api', ApiRouter);
app.use('/user', UserRouter);
app.use('/webhook', WebhookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));