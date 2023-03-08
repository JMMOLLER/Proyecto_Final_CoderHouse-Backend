const Passport = require('passport');
const logger = require('../../utils/LoggerConfig');
let isLoggedIn = false;

/* ============ FUNCTIONS ============ */

/* FOR API */
function isUnlogged(req, res, next) {
    try{
        Passport.authenticate('jwt', { session: false }, (err, tokenInfo, info) => {
            if(err || !tokenInfo){
                return next();
            }
            logger.warn('Intento de acceso a ruta API prohibida')
            return res.status(403).json({
                status: 403, 
                description: {
                    route: req.originalUrl,
                    method: req.method
                }, 
                msg: 'Prohibido',
                value: false,
            });
        })(req, res);
    }catch(err){
        logger.error(err);
        return res.status(500).json({
            status: 500,
            description: {
                route: req.originalUrl,
                method: req.method,
            },
            msg: 'Error interno del servidor',
            value: false,
        });
    }
}

function isLogged(req, res, next) {
    try{
        Passport.authenticate('jwt', { session: false }, (err, tokenInfo, info) => {
            if(err || tokenInfo){
                req.user = tokenInfo;
                return next();
            }
            logger.warn('Intento de acceso a ruta API sin autenticación')
            return res.status(401).json({
                status: 401, 
                description: {
                    route: req.originalUrl,
                    method: req.method
                }, 
                msg: 'No autorizado',
                value: false,
            });
        })(req, res);
    }catch(err){
        logger.error(err);
        return res.status(500).json({
            status: 500,
            description: {
                route: req.originalUrl,
                method: req.method,
            },
            msg: 'Error interno del servidor',
            value: false,
        });
    }
}

/* FOR CLIENT */
function clientIsLogged(req, res, next) {
    try{
        Passport.authenticate('jwt', { session: false }, (err, tokenInfo, info) => {
            if(err || tokenInfo){
                req.user = tokenInfo;
                return next();
            }
            logger.warn('Intento de acceso a ruta sin autenticación')
            req.session.returnTo = req.route.path;
            return res.status(308).redirect('/login');
        })(req, res);
    }catch(err){
        logger.error(err);
        return res.status(500).json({
            status: 500,
            description: {
                route: req.originalUrl,
                method: req.method,
            },
            msg: 'Error interno del servidor',
            value: false,
        });
    }
}

function clientIsUnLogged(req, res, next) {
    try{
        Passport.authenticate('jwt', { session: false }, (err, tokenInfo, info) => {
            if(err || !tokenInfo){
                return next();
            }
            logger.warn('Intento de acceso a ruta prohibida')
            return res.status(308).redirect('/');
        })(req, res);
    }catch(err){
        logger.error(err);
        return res.status(500).json({
            status: 500,
            description: {
                route: req.originalUrl,
                method: req.method,
            },
            msg: 'Error interno del servidor',
            value: false,
        });
    }
}

/**
 * If the query parameter "admin" is true, or if the user is logged in, then the user is allowed to
 * continue. Otherwise, the user is not allowed to continue.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - A function to be called to invoke the next middleware function in the stack.
 */
function validateAdmin(req, res, next) {
    try{
        if(String((req.query.admin)).toLowerCase() == "true" || isLoggedIn){
            isLoggedIn = true;
            next();
        }else{
            logger.warn('Intento de acceso a ruta API sin autenticación')
            res.status(401).json({
                status: 401,
                description: {
                    route: req.originalUrl,
                    method: req.method,
                },
                msg: 'No autorizado',
                value: false,
            });
        }
    }catch(err){
        logger.error(err);
        return res.status(500).json({
            status: 500,
            description: {
                route: req.originalUrl,
                method: req.method,
            },
            msg: 'Error interno del servidor',
            value: false,
        });
    }
}

/* =========== EXPORT =========== */
module.exports = {
    isUnlogged,
    isLogged,
    clientIsLogged,
    clientIsUnLogged,
    validateAdmin
};
