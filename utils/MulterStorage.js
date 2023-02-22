const multer = require('multer');
const path = require('path');
const BaseDir = path.join(__dirname, '../');

module.exports = {
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, BaseDir + '/public/uploads');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    }),
};