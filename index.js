
//Показываю первый вариант, использую второй

const crypto = require('crypto');

// Генеруємо майстер-ключ
let masterKey = crypto.randomBytes(24);
console.log('Master key:', masterKey.toString('hex'));

// Генеруємо сеансовий ключ для кожної нової сесії
let sessionKey = generateSessionKey();

function generateSessionKey() {
    // Генеруємо стартове сіяло
    let seed = crypto.randomBytes(24);

    // Генеруємо трьохкомпонентний ключ
    let key = crypto.randomBytes(24);

    function generateRandom() {
        // Отримуємо поточний час
        let date = new Date();

        // Конвертуємо час в буфер
        let timeBuffer = Buffer.alloc(8);
        timeBuffer.writeDoubleBE(date.getTime(), 0);

        // Створюємо шифр за допомогою ключа
        let iv = crypto.randomBytes(8);
        let cipher = crypto.createCipheriv('des-ede-cbc', key, iv);

        // Обчислюємо t = TDEAk(D)
        let t = cipher.update(timeBuffer);

        // Обчислюємо x = TDEAk(s ⊕ t)
        cipher = crypto.createCipheriv('des-ede-cbc', key, iv);
        let x = cipher.update(xorBuffers(seed, t));

        // Оновлюємо сіяло s = TDEAk(x ⊕ t)
        cipher = crypto.createCipheriv('des-ede-cbc', key, iv);
        seed = cipher.update(xorBuffers(x, t));

        return x;
    }

    function xorBuffers(a, b) {
        let length = Math.min(a.length, b.length);
        let buffer = Buffer.alloc(length);

        for (let i = 0; i < length; ++i) {
            buffer[i] = a[i] ^ b[i];
        }

        return buffer;
    }

    return generateRandom();
}

// Шифруємо сеансовий ключ за допомогою майстер-ключа
function encryptSessionKey() {
    let iv = crypto.randomBytes(8);
    let cipher = crypto.createCipheriv('des-ede-cbc', masterKey, iv);
    return cipher.update(sessionKey);
}

// Розшифровуємо сеансовий ключ за допомогою майстер-ключа
function decryptSessionKey(encryptedSessionKey) {
    let iv = crypto.randomBytes(8);
    let decipher = crypto.createDecipheriv('des-ede-cbc', masterKey, iv);
    return decipher.update(encryptedSessionKey);
}

// Консольний додаток
process.stdin.on('data', function(data) {
    let command = data.toString().trim();
let encryptedSessionKey;
    switch (command) {
        case 'generate':
            sessionKey = generateSessionKey();
            console.log('Session key generated.');
            break;
        case 'encrypt':
            encryptedSessionKey = encryptSessionKey();
            console.log('Encrypted session key:', encryptedSessionKey.toString('hex'));
            break;
        case 'decrypt':
            let decryptedSessionKey = decryptSessionKey(encryptedSessionKey);
            console.log('Decrypted session key:', decryptedSessionKey.toString('hex'));
            break;
        default:
            console.log('Unknown command.');
    }
});
