const Passport = require('passport');

/* ============ FUNCTIONS ============ */

function isLogged(req, res, next) {
    Passport.authenticate('jwt', { session: false }, (err, tokenInfo, info) => {
        if(err || tokenInfo){
            req.user = tokenInfo;
            return next();
        }
        req.session.returnTo = req.route.path;
        return res.redirect('/login');
    })(req, res);
}

function isUnLogged(req, res, next) {
    Passport.authenticate('jwt', { session: false }, (err, tokenInfo, info) => {
        if(err || !tokenInfo){
            return next();
        }
        return res.redirect('/');
    })(req, res);
}


/* =========== EXPORT =========== */
module.exports = {
    isLogged,
    isUnLogged
};