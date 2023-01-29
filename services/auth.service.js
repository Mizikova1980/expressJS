const crypto = require('crypto')
const db = require('./../model')

class AuthService {
    login(email, password) {
        const user = db.get('user').value()

        if (!user) {
            throw new Error('Не верный логин или пароль')
        }

        const hash = crypto.pbkdf2Sync(password, user.salt, 100, 512, 'sha512').toString('hex')

        if (hash === user.hash && email === user.email) {
            return true
        }
        throw new Error('Не верный логин или пароль')
    }

    registration({email, password}) {
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.pbkdf2Sync(password, salt, 100, 512, 'sha512').toString('hex')
        db.set('user', {
            email,
            salt,
            hash
        }).write()
    }
}

module.exports = new AuthService()