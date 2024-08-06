import express from 'express';
import bodyParser from 'body-parser';
import { methods as scrapingController } from './controllers/scrappingcontroller.js';
import dotenv from 'dotenv';

// Configuración de dotenv
dotenv.config();

const app = express();

// Leer puerto desde variables de entorno
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Rutas
app.post('/scrape', scrapingController.scrapeAndStoreData);

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
