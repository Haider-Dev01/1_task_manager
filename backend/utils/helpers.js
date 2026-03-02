// Fonctions utiles
exports.isValidId = (id) => !isNaN(id) && Number(id) > 0;
exports.trimString = (str) => str?.trim() || '';