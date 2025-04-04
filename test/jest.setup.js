// Importar la función para crear la base de datos de prueba
const { createTestDatabase } = require('./test-utils');

// Aumentar el tiempo de espera global para las pruebas
jest.setTimeout(60000); // Aumentado a 60s por si la creación de DB tarda

// Desactivar nest-commander durante las pruebas
process.env.DISABLE_NEST_COMMANDER = 'true';

// Mock de nest-commander para evitar que se inicialice
jest.mock('nest-commander', () => {
    function MockCommandRunner() {
        this.run = jest.fn();
        this.execute = jest.fn();
    }

    return {
        Command: function() { return jest.fn(); },
        CommandRunner: MockCommandRunner,
        Option: function() { return jest.fn(); },
        SubCommand: function() { return jest.fn(); }
    };
});

// Importar las funciones necesarias de Jest
const { beforeAll, afterAll } = require('@jest/globals');

// Crear la base de datos de prueba antes de todas las pruebas
beforeAll(async () => {
    try {
        console.log('Creando base de datos de prueba...');
        await createTestDatabase();
        console.log('Base de datos de prueba creada y migrada.');
    } catch (error) {
        console.error('Error fatal al configurar la base de datos de prueba:', error);
        process.exit(1); // Salir si la DB no se puede configurar
    }
});

// Configurar el cierre de manejadores abiertos
afterAll(async () => {
    // Esperar a que se completen las operaciones pendientes
    await new Promise(resolve => setTimeout(resolve, 500));

    // Forzar el cierre de los manejadores TTY
    if (process.stdout._handle) {
        process.stdout._handle.unref();
    }
    if (process.stderr._handle) {
        process.stderr._handle.unref();
    }
});
