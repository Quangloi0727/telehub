exports.auth = function (req, res, next) {
    //auth code here ...
    //req.xhr &&
    var _skip = (['assets', 'favicon'].indexOf(req.path.split('/')[1]) >= 0) || (req.xhr && _.isEqual(req.path, '/login')) || (req.xhr && _.isEqual(req.path, '/register'));
    if (_skip) return next();
    if (['html'].indexOf(req.path.split('/')[1]) >= 0) return _.render(req, res, 'login', {page: req.path.split('/')[2], demo: true}, true);
    if (!req.session.logged) return _.render(req, res, 'login', {title: 'Đăng nhập'}, true);
    next();
}
