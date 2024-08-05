import express from 'express';
import bodyParser from 'body-parser';
import { methods as scrapingController } from './controllers/scrapingController';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Rutas
app.post('/scrape', scrapingController.scrapeAndStoreData);

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
