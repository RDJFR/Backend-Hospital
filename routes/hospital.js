// Requires
var express = require('express');
var Hospital = require('../models/hospital');

// middlewares
var mdAutenticacion = require('../middlewares/autenticacion');

// inicializar variables
var app = express();

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', 'nombre email') //Obtener los datos del usuario que creó el hospital
        .skip(desde) // para decirle desde donde empieza la paginacion
        .limit(5) // Cantidad máxima de elementos a mostrar
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales,
                        total: conteo
                    });
                });
            });
});

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    let hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Hospital creado correctamente.',
            hospitalGuardado
        });

    });

});

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    var body = req.body;

    Hospital.findByIdAndUpdate(id, body, (err, hospital) => {
        if (err) {
            res.status(200).json({
                ok: false,
                mensaje: 'Error al actualizar hospital',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Hospital actualizado exitosamente',
            hospital
        });
    });
});

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(200).json({
                ok: false,
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `No se encontró el hospital con el id: ${id}`
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Hospital borrado exitosamente',
            hospitalBorrado
        });
    });

});
module.exports = app;