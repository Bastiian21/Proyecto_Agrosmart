// Utilidades compartidas por las pruebas unitarias (generación de RUT válido, etc.)

function randomRut() {
    const body = String(Math.floor(1000000 + Math.random() * 8000000));
    let sum = 0, mult = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += Number(body[i]) * mult;
        mult = mult < 7 ? mult + 1 : 2;
    }
    const res = 11 - (sum % 11);
    const dv = res === 11 ? '0' : res === 10 ? 'K' : String(res);
    return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
}

function randomSuffix() {
    return Math.floor(100000 + Math.random() * 900000);
}

module.exports = { randomRut, randomSuffix };
