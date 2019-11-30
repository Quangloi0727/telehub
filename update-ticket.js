/**
 * Created by Đại Đồng on 30/05/2016.
 */
var path = require('path');
var _config = require(path.normalize(path.join(__dirname, 'config', 'conf.json')));
var mongodb = require('mongodb');
var _dbPath = 'mongodb://localhost:27017/' + _config.database.name;
var _async = require('async');
var _ = require('underscore');

global.moment = require('moment');
global.mongoose = require('mongoose');
mongoose.connect(_dbPath, options = {
    db: {native_parser: true},
    server: {poolSize: 100},
    user: _config.database.user,
    pass: _config.database.pwd
});

var _Tickets = require('./modals/tickets.js');
var _Satisfy = require('./modals/customer-statisfy.js');
var start = 0;
var end = 0;
mongodb.MongoClient.connect(_dbPath, function (err, db) {
    _async.waterfall([function (cb) {
        _Satisfy.aggregate([{$group: {_id: "$_id"}}, {
            $lookup: {
                from: "customerstatisfystages",
                localField: "_id",
                foreignField: "idCustomerStatisfy",
                as: "stage"
            }
        }, {$unwind: "$stage"}], function (err, r) {
            _Tickets.count({}, function (err, r2) {
                end = r2;
                cb(err, r);
            })
        })
    }, function (a, cb) {
        var _ticketBulk = db.collection('tickets').find();
        _ticketBulk.forEach(function (doc) {
            var item = _.sample(a);
            _Tickets.update({_id: doc._id}, {
                $set: {
                    customerStatisfy: item._id,
                    customerStatisfyStage: item.stage._id
                }
            }, function (err, r) {
                start++;
                console.log(start);
                if (start == end) cb(err, r);
            })
        })
    }
    ], function (err, result) {
        db.close();
        console.log("xong");
        process.exit();
    });
})
