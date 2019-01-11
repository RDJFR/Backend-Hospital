// Require
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');

// middlewares
var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

//==================================================
// Peticion get para obtener todos los usuarios
//==================================================
app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios
                });
            });
});


//==================================================
// Peticion post para guardar un usuario
//==================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                err
            });
        }
        // saved!
        res.status(201).json({
            ok: true,
            mensaje: 'Usuario creado correctamente.',
            usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

});

//==================================================
// Peticion Put para actualizar un usuario
//==================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    let id = req.params.id;
    var body = req.body;
    //
    // Primera manera de actualizar
    //
    // Usuario.findByIdAndUpdate(id, body, (err, usuario) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }

    //     res.status(200).json({
    //         ok: true,
    //         mensaje: 'Usuario actualizado correctamente.',
    //         usuario
    //     });
    // });
    //
    // Fin de la primera manera de actualizar
    //

    //
    // Segunda manera de actualizar
    //
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el usuario',
                err
            })
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese id' }
            })
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar usuario',
                    err
                })
            }
            usuarioGuardado.password = ':)'
            res.status(200).json({
                ok: true,
                mensaje: 'Usuario actualizado correctamente.',
                usuario
            });
        });
    });
    //
    // Fin de la segunda manera de actualizar
    //
});


//==================================================
// Peticion delete para borrar un usuario por id
//==================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar usuario',
                errors: err
            })
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un usuario con ese id',
                errors: {
                    message: 'No existe un usuario con ese id'
                }
            })
        }

        res.status(200).json({
            ok: true,
            message: 'Usuario borrado exitosamente',
            usuarioBorrado
        })
    });

});

module.exports = app;