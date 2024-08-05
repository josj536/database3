import puppeteer from 'puppeteer';

const scrapeAndStoreData = async (req, res) => {
    const { placa } = req.body;

    console.log('Placa recibida:', placa);

    if (!placa) {
        return res.status(400).send('Placa es requerida');
    }

    try {
        const browser = await puppeteer.launch({ headless: true }); // Cambia a false solo para depuración
        const page = await browser.newPage();
        
        await page.setViewport({ width: 1200, height: 800 });
        console.log('Navegador abierto, navegando a la URL...');
        await page.goto('https://www.suraenlinea.com/soat/sura/seguro-obligatorio', { waitUntil: 'networkidle2', timeout: 60000 });

        // Espera y cierra el modal si aparece
        try {
            console.log('Esperando al modal...');
            await page.waitForSelector('.sura-modal-button', { timeout: 10000 });
            console.log('Modal encontrado, cerrándolo...');
            await page.click('.sura-modal-button');
        } catch (error) {
            console.log('No se encontró el modal o no se pudo cerrar.');
        }

        // Espera y verifica que el campo de entrada para la placa esté visible
        console.log('Esperando el campo de entrada para la placa...');
        await page.waitForSelector('#vehiculo-placa input', { visible: true, timeout: 20000 });

        // Ingresa el valor en el campo de placa
        console.log('Ingresando la placa en el campo...');
        await page.evaluate((placa) => {
            const input = document.querySelector('#vehiculo-placa input');
            if (input) {
                input.value = placa;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, placa);

        // Espera a que el botón de búsqueda sea visible e interactivo
        console.log('Esperando el botón de búsqueda...');
        await page.waitForSelector('#id-boton-cotizar', { visible: true, timeout: 20000 });

        // Asegúrate de que el botón está habilitado antes de hacer clic
        console.log('Verificando si el botón de búsqueda está habilitado...');
        const isButtonEnabled = await page.evaluate(() => {
            const button = document.querySelector('#id-boton-cotizar');
            return button && !button.hasAttribute('disabled');
        });

        if (isButtonEnabled) {
            console.log('Botón de búsqueda habilitado, haciendo clic...');
            await page.click('#id-boton-cotizar');
        } else {
            console.log('El botón de búsqueda está deshabilitado.');
            await browser.close();
            return res.status(500).send('El botón de búsqueda está deshabilitado.');
        }

        // Espera hasta que los resultados sean visibles
        console.log('Esperando los resultados...');
        await page.waitForSelector('.vehiculo-summary__value', { visible: true, timeout: 30000 });

        // Extrae la información deseada del HTML de la página
        console.log('Extrayendo resultados...');
        const resultados = await page.evaluate(() => {
            const info = {};

            // Información del vehículo
            const marcaElement = document.querySelector('#vehiculo-detail-marca');
            info.marca = marcaElement ? marcaElement.innerText : 'No se encontró la marca';

            const lineaElement = document.querySelector('#vehiculo-detail-linea');
            info.linea = lineaElement ? lineaElement.innerText : 'No se encontró la línea';

            const modeloElement = document.querySelector('#vehiculo-detail-model');
            info.modelo = modeloElement ? modeloElement.innerText : 'No se encontró el modelo';

            const tipoServicioElement = document.querySelector('#vehiculo-detail-servicio');
            info.tipoServicio = tipoServicioElement ? tipoServicioElement.innerText : 'No se encontró el tipo de servicio';

            const claseElement = document.querySelector('#vehiculo-detail-clase');
            info.clase = claseElement ? claseElement.innerText : 'No se encontró la clase';

            const cilindrajeElement = document.querySelector('#vehiculo-detail-cilindraje');
            info.cilindraje = cilindrajeElement ? cilindrajeElement.innerText : 'No se encontró el cilindraje';

            const numeroMotorElement = document.querySelector('#vehiculo-detail-motor');
            info.numeroMotor = numeroMotorElement ? numeroMotorElement.innerText : 'No se encontró el número de motor';

            const pasajerosElement = document.querySelector('#vehiculo-detail-pasajeros');
            info.pasajeros = pasajerosElement ? pasajerosElement.innerText : 'No se encontró el número de pasajeros';

            const tipoCombustibleElement = document.querySelector('#vehiculo-detail-combustible');
            info.tipoCombustible = tipoCombustibleElement ? tipoCombustibleElement.innerText : 'No se encontró el tipo de combustible';

            const vinElement = document.querySelector('#vehiculo-detail-vin');
            info.vin = vinElement ? vinElement.innerText : 'No se encontró el VIN';

            // Información de descuentos
            const valorPagarElement = document.querySelector('.descuentos__total-price p:nth-of-type(2)');
            info.valorPagar = valorPagarElement ? valorPagarElement.innerText.trim() : 'No se encontró el valor a pagar';

            return info;
        });

        // Incluye la placa al principio del objeto de resultados
        const resultadosConPlaca = { placa, ...resultados };

        console.log('Resultados del scraping:', resultadosConPlaca);
        await browser.close();
        res.json(resultadosConPlaca);

    } catch (error) {
        console.error('Error en el scraping:', error.message);
        res.status(500).send('Error en el scraping');
    }
};

export const methods = {
    scrapeAndStoreData,
};
