let isLoggedIn = false;

/* ============ FUNCTIONS ============ */

function isUnlogged(req, res, next) {
    if (req.isUnauthenticated())
        return next();
    res.redirect('/');
}

function isLogged(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.json({error: -1, description: {route: req.originalUrl, method: req.method}, status: 'No autorizado'});
}

/**
 * If the query parameter "admin" is true, or if the user is logged in, then the user is allowed to
 * continue. Otherwise, the user is not allowed to continue.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - A function to be called to invoke the next middleware function in the stack.
 */
function validateAdmin(req, res, next) {
    if(String((req.query.admin)).toLowerCase() == "true" || isLoggedIn){
        isLoggedIn = true;
        next();
    }else{
        res.json({
            error: -1,
            descripción: {ruta: req.url,
                método: req.method,
            },
            estado: 'No autorizado'
        });
    }
}

/* =========== EXPORT =========== */
module.exports = {
    isUnlogged,
    isLogged,
    validateAdmin
};
