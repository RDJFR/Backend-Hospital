// Requires
var express = require('express');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Middlewares
var mdAutenticacion = require('../middlewares/autenticacion');
var verificar = require('../middlewares/Verify');

// Inicializar variables
var app = express();

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde) // para decirle desde donde empieza la paginacion
        .limit(5) // Cantidad máxima de elementos a mostrar
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos,
                        total: conteo
                    });
                });

            });
});

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    let medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario,
        hospital: body.hospital
    });

    Hospital.findById(body.hospital, (err, hospital) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                errors: err
            })
        }

        // if (!hospital) {
        //     return res.status(500).json({
        //         ok: false,
        //         mensaje: 'No existe un hospital con ese id'
        //     });
        // }

        medico.save((err, medicoGuardado) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                medicoGuardado
            });

        });

    });


});

app.put('/:id', [mdAutenticacion.verificaToken, verificar.verificaHospital], (req, res) => {
    var body = req.body;
    let id = req.params.id;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: flase,
                mensaje: 'Error al actualizar usuario.',
                errors: err
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(200).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico.',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Medico actualizado correctamente.'
            });
        });
    });

});

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico.',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un medico con ese id.',
                errors: {
                    message: 'Medico no encontrado.'
                }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Medico borrado exitosamente.',
            medicoBorrado
        });
    });
});

module.exports = app;