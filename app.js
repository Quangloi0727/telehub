var express = require('express');
var bodyParser = require('body-parser');
var Stomp = require('stomp-client');
require('mongoose-pagination');
require('colors');

global._socketUsers = {};
global.path = require('path');
global.fsx = require('fs.extra');
global._ = require('underscore');
global._rootPath = path.dirname(require.main.filename);
global._libsPath = path.normalize(path.join(__dirname, 'libs'));
global._commonPath = path.normalize(path.join(__dirname, 'common'));
switch (process.env.NODE_ENV) {
    case 'development':
		global._config = require(path.normalize(path.join(__dirname, 'config', 'conf.dev.json')));
		break;
    case 'production':
		global._config = require(path.normalize(path.join(__dirname, 'config', 'conf.json')));
		break;
    default:
		global._config = require(path.normalize(path.join(__dirname, 'config', 'conf.json')));
		break;
}
global._dbPath = 'mongodb://' + _config.database.ip + ':' + _config.database.port + '/' + _config.database.name;

global._moment = require('moment');
global.moment = global._moment;
global._async = require('async');
global.mongoose = require('mongoose');
global.mongodb = require('mongodb');
global.pagination = require('pagination');
global._Excel = require('exceljs');

global._menus = [];
global._menusAllows = {};


require(path.join(__dirname, 'libs', 'resource'));

global.logLevel = 'DEBUG';

var log4js = require("log4js"),
    log4js_extend = require("log4js-extend");
log4js.configure({
    appenders: [
        {type: 'console'},
        {
            "type": "file",
            "filename": path.join(__dirname, 'logs', 'crm.log'),
            "maxLogSize": 20480000,
            "backups": 3,
            "category": "CRM"
        }
    ]
});
log4js_extend(log4js, {
    path: __dirname,
    format: "[@name (@file:@line:@column)]"
});
var logger = log4js.getLogger("CRM");
logger.setLevel(logLevel);
global.log = logger;

/**
 * Keep uid and pwd of database in envoirerment variable
 */
if (process.env.DATABASE_UID && process.env.DATABASE_PWD) {
	_config.database.user = process.env.DATABASE_UID;
	_config.database.pwd = process.env.DATABASE_PWD;
	global._dbPath = 'mongodb://' + _config.database.user + ':' + _config.database.pwd + '@' + _config.database.ip + ':' + _config.database.port + '/' + _config.database.name;
}
mongodb.MongoClient.connect(_dbPath, function (err, db) {
	if (err) return process.exit(1);
	global['mongoClient'] = db;
});



var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view cache', false);
app.set('port', process.env.PORT || _config.app.port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(require('cookie-parser')('dft.vn'));
app.use(require('express-session')({secret: 'dft.vn', resave: false, saveUninitialized: true}));
app.use(require('multer')({dest: path.join(__dirname, 'temp')}).any());
//app.use(require('multer')({dest: path.join(__dirname, 'temp')}).array(['avatar', 'attachments']));
app.use(require('serve-favicon')(path.join(__dirname, 'assets', 'favicon.ico')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(require(path.join(_rootPath, 'libs', 'auth')).auth);

require(path.join(_rootPath, 'libs', 'cleanup.js')).Cleanup();
switch (process.env.NODE_ENV) {
	case 'development':
		require(path.join(_rootPath, 'libs', 'router_noacd.js'))(app);
		break;
	case 'production':
		require(path.join(_rootPath, 'libs', 'router.js'))(app);
		break;
	default:
		require(path.join(_rootPath, 'libs', 'router.js'))(app);
		break;
}

app.use(function (req, res, next) {
    res.render('404', {title: '404 | Page not found'});
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('500', {message: err.message});
    log.error(err);
});

String.prototype.zFormat = function () {
    var source = this;

    if (_.isString(arguments[0])){
        _.each(arguments, function (n, i) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
    } else {
        var param = arguments[0];
        _.each(_.keys(param), function (item) {
            source = source.replace(new RegExp("\\{" + item + "\\}", "g"), param[item]);
        });
    }

    return source;
};

mongoose.connect(_dbPath, options = {db: {native_parser: true}, server: {poolSize: 10}, user: _config.database.user, pass: _config.database.pwd});

global._ActiveMQ = new Stomp(_config.activemq.ip, _config.activemq.port, _config.activemq.user, _config.activemq.pwd);

_ActiveMQ.connect(function (sessionId) {
    fsx.readdirSync(path.join(_rootPath, 'queue', 'subscribe')).forEach(function (file) {
        if (path.extname(file) !== '.js') return;
        require(path.join(_rootPath, 'queue', 'subscribe', file))(_ActiveMQ, sessionId);
    });

    fsx.readdirSync(path.join(_rootPath, 'queue', 'publish')).forEach(function (file) {
        if (path.extname(file) !== '.js') return;
        global['QUEUE_' + _.classify(_.replaceAll(file.toLowerCase(), '.js', ''))] = require(path.join(_rootPath, 'queue', 'publish', file));
        console.log('QUEUE'.gray + ' : QUEUE_' + _.classify(_.replaceAll(file.toLowerCase(), '.js', '')));
    });
});

var handleOnServerStart = function() {
	log.info('Server is running !');
	console.log(("Server is running at " + app.get('port')).magenta);
};
if (_config.https || process.env.HTTPS) {
	var https = require('https');
	var fs = require('fs');
	var server = https.createServer({
		key: fs.readFileSync(_config.https.key || './certificate/server.key'),
		cert: fs.readFileSync(_config.https.cert || './certificate/server.crt'),
		passphrase: _config.https ? _config.https.passphrase : ''
	}, app).listen(app.get('port'), handleOnServerStart);
} else {
	var server = app.listen(app.get('port'), handleOnServerStart);
}

global.sio = require('socket.io').listen(server, {log: false});

sio.on('connection', function (socket) {
    require(path.join(_rootPath, 'socket', 'io.js'))(socket);
});

// DUONGNB: Add interval check agent online to assign order
require(path.join(_rootPath, 'monitor', 'order-monitor.js')).assignByInterval();

