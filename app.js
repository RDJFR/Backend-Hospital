// Require
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexion a la base de datos
mongoose.connect('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log(`Base de datos \x1b[32m%s\x1b[0m`, 'online');
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

// Escuchar peticiones
var puerto = 3000;
app.listen(puerto, () => {
    console.log(`Server corriendo en el puerto ${puerto} \x1b[32m%s\x1b[0m`, 'online');
});