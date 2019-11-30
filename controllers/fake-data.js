exports.index = {
    json: function (req, res) {
        var _query = req.query;
        if (_.isEqual(req.query.type, 'user')){
            //_query = param nhận được theo query string
            _Users.find({}, function (error, users) {
                res.json(users);
            });
        }
        else if(_.isEqual(req.query.type, 'orgs')){
            //_query = param nhận được theo query string
            _Orgs.find({}, function (error, users) {
                res.json(users);
            });
        }
        else if(_.isEqual(req.query.type, 'services')){
            //_query = param nhận được theo query string
            _Services.find({}, function (error, users) {
                res.json(users);
            });
        }
        else if(_.isEqual(req.query.type, 'campain')){
            //_query = param nhận được theo query string
            _Campains.find({}, function (error, users) {
                res.json(users);
            });
        }

    }
};

exports.create = function (req, res) {
//    req.body['status'] = _.has(req.body,'status') ? 1 : 0;
//    _Skills.create(req.body, function (error, sk) {
//        res.json({code: (error ? 500 : 200), message: error ? error : sk});
//    });
    if (_.has(req.body, 'getUser')){
        _Users.find({}, function (error, users) {
            res.json(users);
        });
    }
    else{
        var type = req.body.type;
        if (_.isEqual(type, 'TicketReasonCategory')){
            _TicketReasonCategory.create({name: req.body.name}, function(error, sk){
                res.json({code: (error ? 500 : 200), message: error ? error : sk});
            });
        }
        else if (_.isEqual(type, 'TicketReason')){
            _TicketReason.create({name: req.body.name, idCategory: req.body.id}, function(error, sk){
                res.json({code: (error ? 500 : 200), message: error ? error : sk});
            });
        }
        else if (_.isEqual(type, 'TicketSubReason')){
            _TicketSubReason.create({name: req.body.name, idCategory: req.body.id}, function(error, sk){
                res.json({code: (error ? 500 : 200), message: error ? error : sk});
            });
        }
        else if (_.isEqual(type, 'Service')){
            _Services.create({name: req.body.name, idOrg: req.body.id}, function(error, sk){
                res.json({code: (error ? 500 : 200), message: error ? error : sk});
            });
        }
        else if (_.isEqual(type, 'Campain')){
            _Campains.create({name: req.body.name, idOrg: req.body.id, createBy: req.body.createBy, updateBy: req.body.updateBy, startDate: Date.now(), endDate: Date.now()}, function(error, sk){
                res.json({code: (error ? 500 : 200), message: error ? error : sk});
            });
        }
        else if (_.isEqual(type, 'Ticket')){
            _Tickets.create(req.body, function(error, sk){
                res.json({code: (error ? 500 : 200), message: error ? error : sk});
            });
        }
    }
};