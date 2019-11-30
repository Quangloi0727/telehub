/**
 * Created by baygiomoidc on 28/03/2016.
 */

var mongodb = require('mongodb');
var _dbPath = 'mongodb://localhost:27017/hoasao-core';
var _async = require('async');
var _Tickets = require('./modals/tickets.js');

mongodb.MongoClient.connect(_dbPath, function (err, db) {
    if (err) return next(err, null, null);
    var arr = [];
    for(var i = 10; i < 20; i++) arr.push(i);
    _async.eachSeries(arr, function(range, cb){
        var _customerBulk = db.collection('customers').initializeUnorderedBulkOp({useLegacyOps: true});
        var sdt_bulk = db.collection('field_so_dien_thoai').initializeUnorderedBulkOp({useLegacyOps: true});
        var ht_bulk = db.collection('field_ho_ten').initializeUnorderedBulkOp({useLegacyOps: true});
        var ticket_bulk = db.collection('tickets').initializeUnorderedBulkOp({useLegacyOps: true});

        for(var i = (range*100000); i < (range + 1)*100000; i++){
            console.log(i);
            var customer = {
                _id : new mongodb.ObjectID(),
                updated : Date.now,
                sources : [],
                created : Date.now,
                status : 1
            };
            _customerBulk.insert(customer);
            sdt_bulk.insert({
                entityId: customer._id,
                value: ''+i,
                created: Date.now
            });

            ht_bulk.insert({
                entityId: customer._id,
                value: 'ho ten '+i,
                created: Date.now
            });

            var ticket = new _Tickets({idCustomer: customer._id, idService: '56fa30a69096ade067d246c7', idAgent: '56f0ba5a832808f6ed7b250e'});
            ticket_bulk.insert(ticket);
        }


        var _bulks = [];
        _bulks.push(_customerBulk);
        _bulks.push(sdt_bulk);
        _bulks.push(ht_bulk);
        _bulks.push(ticket_bulk);
        //_bulks.push(f2_bulk);
        //_bulks.push(f3_bulk);
        //_bulks.push(f4_bulk);
        //_bulks.push(f5_bulk);

        _async.each(_bulks, function(batch, callback) {
            if(batch.s.currentBatch)
                batch.execute(callback);
            else
                callback();
        }, function(err){
            cb();
        });
    }, function(err){
        db.close();
        console.log('xong');
    });
});