// Aumentar el tiempo de espera global para las pruebas
jest.setTimeout(30000);

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
const { afterAll } = require('@jest/globals');

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