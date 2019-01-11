// Require
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();

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
        usuarioDB.password = ":P"; //<- cambiando el valor de password por seguridad
        // Crear Token con Jsonwebtoken
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

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