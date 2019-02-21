var Hospital = require('../models/hospital');

exports.verificaHospital = function(req, res, next) {
    var id = req.body.hospital;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id.',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id.',
                errors: {
                    message: `Hospital con el id: (${id}) no encontrado.`
                }
            });
        }

        next();
    });
};