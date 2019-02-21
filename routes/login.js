// Require
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// Inicializar variables
var app = express();

// Google requires
const { OAuth2Client } = require('google-auth-library');

//==================================================
// Autenticación de Google: https://developers.google.com/identity/sign-in/web/backend-auth
//==================================================
app.post('/google', (req, res) => {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET);

    var token = req.body.token || 'ajksdgaskd';

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        }, (err, login) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Token no válido.',
                    errors: err,
                });
            }

            const payload = login.getPayload();
            const userid = payload['sub'];
            // If request specified a G Suite domain:
            //const domain = payload['hd'];

            Usuario.findOne({ email: payload.email }, (err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuario. - login',
                        errors: err
                    });
                }

                if (usuarioDB) {

                    if (usuarioDB.google === false) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Debe usar el usuario y password creado previamente.'
                        });
                    } else {
                        // Crear Token con Jsonwebtoken
                        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                        usuarioDB.password = ":P"; //<- cambiando el valor de password por seguridad

                        res.status(200).json({
                            ok: true,
                            message: 'Sesion iniciada correctamente',
                            usuario: usuarioDB,
                            token: token,
                            id: usuarioDB._id
                        });
                    }

                } else { // Si el usuario no existe por correo.

                    var usuario = new Usuario();
                    usuario.nombre = payload.name;
                    usuario.email = payload.email;
                    usuario.password = ':p';
                    usuario.img = payload.picture;
                    usuario.google = true;

                    usuario.save((err, usuarioDB) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al crear usuario - login Google',
                                errors: err
                            });
                        }

                        // Crear Token con Jsonwebtoken
                        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                        usuarioDB.password = ":P"; //<- cambiando el valor de password por seguridad

                        res.status(200).json({
                            ok: true,
                            message: 'Sesion iniciada correctamente',
                            usuario: usuarioDB,
                            token: token,
                            id: usuarioDB._id
                        });

                    });
                }
            });

        });

    }
    verify().catch(console.error);

});



//==================================================
// Autenticación normal
//==================================================
app.post('/', (req, res) => {
    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) { //verificar si existe algun error en la busqueda
            return res.status(500).json({
                ok: false,
                errors: {
                    message: "error al buscar usuario",
                    err
                }
            });
        }

        if (!usuarioDB) { //verificar que el email exista
            return res.status(400).json({
                ok: false,
                message: "Credenciales incorrectas - email",
                errors: {
                    err
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) { // verificar que la contraseña exista
            return res.status(400).json({
                ok: false,
                errors: {
                    message: "Credenciales incorrectas - password",
                    err
                }
            });
        }
        // Crear Token con Jsonwebtoken
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
        usuarioDB.password = ":P"; //<- cambiando el valor de password por seguridad

        res.status(200).json({
            ok: true,
            message: 'Sesion iniciada correctamente',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });
});

module.exports = app;