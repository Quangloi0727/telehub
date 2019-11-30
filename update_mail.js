global.path = require('path');
global._rootPath = path.dirname(require.main.filename);
var _config = require(path.normalize(path.join(__dirname, 'config', 'conf.json')));
var mongodb = require('mongodb');
var _dbPath = 'mongodb://localhost:27017/' + _config.database.name;
global._libsPath = path.normalize(path.join(__dirname, 'libs'));
var _async = require('async');
var _ = require('underscore');
var Chance = require('chance');
var chance = new Chance();
var fsx = require('fs.extra');
global.moment = require('moment');
global.mongoose = require('mongoose');
mongoose.connect(_dbPath, options = {
    db: {native_parser: true},
    server: {poolSize: 100},
    user: _config.database.user,
    pass: _config.database.pwd
});
_.mixin(_.extend(require('underscore.string').exports(), require(path.join(_rootPath, 'libs', 'common'))));
fsx.readdirSync(path.join(_rootPath, 'modals')).forEach(function (file) {
    global['_' + _.classify(_.replaceAll(file.toLowerCase(), '.js', ''))] = require(path.join(_rootPath, 'modals', file));
});
var start = 0;
var end = 0;
mongodb.MongoClient.connect(_dbPath, function (err, db) {
    _async.waterfall([function (cb) {
        _Mail.count({}, function (err, r2) {
            end = r2;
            cb(err);
        })
    }, function (cb) {
        _ticketBulk.forEach(function (doc) {
            var set = doc.mail_type == 1 ? {$set:{status: _.random(1,3)}}:{$set:{status: 1}};
            _Mail.update({_id: doc._id}, set, function (err, r) {
                start++;
                console.log(start);
                if (start == end) cb(err);
            })
        })
    }
    ], function (err) {
        db.close();
        console.log("xong");
        process.exit();
    });
})
var genString= function(count)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < count; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}