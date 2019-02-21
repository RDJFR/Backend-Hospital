// Requires
var express = require('express');

var Hospital = require('../models/hospital')
var Medico = require('../models/medico')
var Usuario = require('../models/usuario')

// Inicializar variables
var app = express();

//==================================================
// Busqueda por colección, petición para buscar en una coleccion especifica
//==================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var found = false;

    if (tabla == 'medicos') {
        found = true;
        buscarMedicos(busqueda, regex)
            .then(medicos => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Peticion realizada correctamente.',
                    medicos: medicos
                });
            });
    }

    if (tabla == 'hospitales') {
        found = true;
        buscarHospitales(busqueda, regex)
            .then(hospitales => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Peticion realizada correctamente.',
                    hospitales: hospitales
                });
            });
    }

    if (tabla == 'usuarios') {
        found = true;
        buscarUsuarios(busqueda, regex)
            .then(usuarios => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Peticion realizada correctamente.',
                    usuarios: usuarios
                });
            });
    }

    if (!found) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tabla no encontrada',
        });
    }


});


//==================================================
// Busqueda General, peticion para buscar en todas las colecciones
//==================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                mensaje: 'Peticion realizada correctamente',
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});


function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar Hospitales', err)
                } else {
                    resolve(hospitales)
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar Medicos', err)
                } else {
                    resolve(medicos)
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuario', err);
                } else {
                    resolve(usuarios)
                }
            });
    });
}




module.exports = app;