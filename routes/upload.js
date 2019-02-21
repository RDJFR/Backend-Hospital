// Require
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

// Inicializar variables
var app = express();

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de olección válidos
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) { // Verificar que el tipo de coleccion sea válido.
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección inválida.',
            errors: {
                message: 'Tipo de colección inválida'
            }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó ningún archivo.',
            errors: {
                message: 'Debe seleccionar una imagen.'
            }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1] //obtener extension del archivo

    // Extensiones válidas
    var extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida.',
            errors: {
                message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') + '.'
            }
        });
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
    // Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;


    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: {
                    message: err
                }
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });

});


function subirPorTipo(tipoColeccion, id, nombreArchivo, res) {

    if (tipoColeccion === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario.',
                    errors: {
                        message: err
                    }
                });
            }

            if (!usuario) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'El usario no existe.',
                    errors: {
                        message: 'Usuario no existe.'
                    }
                });
            }

            var antiguoPath = './uploads/usuarios/' + usuario.img;

            // Si existía una imagen previa, es eliminada.
            if (fs.existsSync(antiguoPath)) {
                fs.unlink(antiguoPath, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al borrar imagen antigua.',
                            errors: {
                                message: err
                            }
                        });
                    }
                });
            };

            usuario.img = nombreArchivo; // Se guarda el nombre de la nueva imagen
            usuario.save((err, usuarioActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar usuario.',
                        errors: {
                            message: err
                        }
                    });
                }
                usuarioActualizado.password = ':p';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario Actualizada.',
                    usuarioActualizado
                });
            });

        });

    }

    if (tipoColeccion === 'medicos') {

        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Medico.',
                    errors: {
                        message: err
                    }
                });
            }

            if (!medico) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'El médico no existe.',
                    errors: {
                        message: 'Médico no existe.'
                    }
                });
            }

            var antiguoPath = './uploads/medicos/' + medico.img;

            // Si existía una imagen previa, es eliminada.
            if (fs.existsSync(antiguoPath)) {
                fs.unlink(antiguoPath, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al borrar imagen antigua.',
                            errors: {
                                message: err
                            }
                        });
                    }
                });
            };

            medico.img = nombreArchivo; // Se guarda el nombre de la nueva imagen
            medico.save((err, medicoActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar medico.',
                        errors: {
                            message: err
                        }
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico Actualizada.',
                    medicoActualizado
                });
            });

        });

    }

    if (tipoColeccion === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Hospital.',
                    errors: {
                        message: err
                    }
                });
            }

            if (!hospital) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital no existe.',
                    errors: {
                        message: 'Hospital no existe.'
                    }
                });
            }

            var antiguoPath = './uploads/hospitales/' + hospital.img;

            // Si existía una imagen previa, es eliminada.
            if (fs.existsSync(antiguoPath)) {
                fs.unlink(antiguoPath, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al borrar imagen antigua.',
                            errors: {
                                message: err
                            }
                        });
                    }
                });
            };

            hospital.img = nombreArchivo; // Se guarda el nombre de la nueva imagen
            hospital.save((err, hospitalActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar hospital.',
                        errors: {
                            message: err
                        }
                    });
                }
                hospitalActualizado.password = ':p';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital Actualizada.',
                    hospitalActualizado
                });
            });

        });

    }

}

module.exports = app;