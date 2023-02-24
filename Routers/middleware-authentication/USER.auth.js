/* ============ FUNCTIONS ============ */

function isUnlogged(req, res, next) {
    if (req.isUnauthenticated())
        return next();
    res.redirect('/');
}

function isLogged(req, res, next) {
    if (req.isAuthenticated())
        return next();
    req.session.returnTo = req.route.path;
    res.redirect('/login');
}


/* =========== EXPORT =========== */
module.exports = {
    isUnlogged,
    isLogged
};