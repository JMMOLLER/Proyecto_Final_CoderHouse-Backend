/* ============ FUNCTIONS ============ */

function isUnlogged(req, res, next) {
    if (req.isUnauthenticated())
        return next();
    res.redirect('/');
}

function isLogged(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}


/* =========== EXPORT =========== */
module.exports = {
    isUnlogged,
    isLogged
};