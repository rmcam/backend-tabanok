// Intenta cargar el módulo crypto nativo de Node.js
try {
  const nativeCrypto = require('crypto');
  // Si crypto nativo existe y tiene randomUUID, úsalo
  if (nativeCrypto && typeof nativeCrypto.randomUUID === 'function') {
    global.crypto = nativeCrypto;
  } else {
    // Si crypto nativo no está disponible o no tiene randomUUID, usa el polyfill
    if (typeof global.crypto === 'undefined' || typeof global.crypto.randomUUID !== 'function') {
      global.crypto = {
        randomUUID: () => {
          // Implementación simple de randomUUID si no existe
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
      };
    }
  }
} catch (e) {
  // Si require('crypto') falla (ej. entorno muy limitado), usa el polyfill
  if (typeof global.crypto === 'undefined' || typeof global.crypto.randomUUID !== 'function') {
    global.crypto = {
      randomUUID: () => {
        // Implementación simple de randomUUID si no existe
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    };
  }
}
