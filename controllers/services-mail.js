
exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = req.query;

        var aggregate = _ServicesMail.aggregate();
        aggregate._pipeline = [{$lookup: {from: 'skillmails', localField: 'idSkill', foreignField: '_id', as: 'idSkill'}},
            {$unwind: '$idSkill'},
            {$lookup: {from: 'companies', localField: 'idCompany', foreignField: '_id', as: 'idCompany'}},
            {$unwind: '$idCompany'}];
        var _query = {};
        if (_.has(query, 'idCompany')) _query['idCompany._id'] = new mongodb.ObjectId(query.idCompany);
        if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: {$and: [_query]}});

        _ServicesMail.aggregatePaginate(aggregate, {page: page, limit: rows}, function (error, service, pageCount, count) {
            console.log(18, service);
            res.json(service);
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        _async.parallel({
            companies: function(next) {
                _Company.find({status: 1}, next);
            },
            skills: function(next) {
                _SkillsMail.find({status: 1}, next);
            }
        }, function(err, result){

            var sort = _.cleanSort(req.query,'');
            var query = _.cleanRequest(req.query);

            var _query = {};
            if(query['name']) _query['name'] = {$regex: new RegExp(_.stringRegex(query['name']), 'i')};
            if(query['skills']) _query['skills'] = {$in: [new mongodb.ObjectId(query['skills'])]};
            if(query['idCompany'] && !_.isEqual(query['idCompany'], '0')) _query['idCompany'] = query['idCompany'];
            if(query['routeMail']) _query['routeMail'] = query['routeMail'];
            if(query['idSkill'] && !_.isEqual(query['idSkill'], '0')) _query['idSkill'] = query['idSkill'];
            if(query['status']) _query['status'] = query['status'];
            _ServicesMail
                .find(_query)
                .populate('idSkill','skillName')
                .populate('createBy','name')
                .populate('updateBy','name')
                .populate('idCompany','name')
                .sort(sort)
                .paginate(page, rows, function (error, items, total) {
                    var paginator = new pagination.SearchPaginator({prelink: '/services-mail', current: page, rowsPerPage: rows, totalResult: total});
                    _.render(req, res, 'services-mail',
                        {
                            title: 'Danh sách chiến dịch mail',
                            searchData: query,
                            categories: items,
                            orgs: result.companies,
                            skills: result.skills,
                            paging: paginator.getPaginationData(),
                            plugins: [['bootstrap-select']]
                        }, true, error);
                });
        });
    }
}

// GET : http://domain.com/services-mail/:_id/edit
exports.edit = function (req, res) {
//    console.log(55, req.params);
    var sendProtocols= ["SMTP"];
    var receiveProtocols= ["POP3", "IMAP"];
    var sercure= ["SSL", "TLS"];
    _async.parallel({
        service: function(next){
            // Truy vấn dữ liệu chiến dịch
            _ServicesMail.findById(req.params.servicesmail, next).populate('idSkill','skillName')
                .populate('createBy','name')
                .populate('updateBy','name')
                .populate('idCompany','name')
        },
        companies: function(next) {
            // Truy vấn dữ liệu công ty
            _Company.find({status: 1}, next);
        }
    }, function(err, result){
        if(result.service){
            console.log(83, result.service);
            console.log(83, result.companies);
            _.render(req, res, 'services-mail-edit', {
                title: 'Chỉnh sửa chiến dịch gọi vào',
                sendProtocol: sendProtocols,
                sercure: sercure,
                receiveProtocol: receiveProtocols,
                currentService: result.service,
                orgs: result.companies,
                plugins: [['bootstrap-select']]
            }, !_.isNull(result.service), err);
        }else{
            res.json({code: 404, message: 'Page not found'});
        }
    });
};

// POST
exports.create = function (req, res) {
    req.body['createBy'] = req.session.user._id;
    req.body['created'] = new Date();
    _ServicesMail.create(req.body, function(err, result){
        if(!err){
            _.genTree();
            QUEUE_Mail.addService(result);
        }
        res.json({code: (err ? 500 : 200), message: err? 'Có lỗi xảy ra' : ''});
    });

};

// PUT : http://domain.com/services-mail/:_id
exports.update = function (req, res) {
    req.body['updateBy'] = req.session.user._id;
    req.body['updated'] = Date.now();

    _ServicesMail.findByIdAndUpdate(req.params.servicesmail, req.body, {new: true}, function (error, sv) {
        if(!error){
            _.genTree();
            QUEUE_Mail.updateService(sv);
        }
        res.json({code: (error ? 500 : 200), message: error ? error : sv});
    });
};

// GET : http://domain.com/services-mail/new
exports.new = function (req, res) {
    var sendProtocols= ["SMTP"];
    var receiveProtocols= ["POP3", "IMAP"];
    var sercure= ["SSL", "TLS"];
    _async.parallel({
        companies: function(next) {
            _Company.find({status: 1}, next);
        },
        skills: function(next) {
            _SkillsMail.find({status: 1}, next);
        }
    }, function(err, result){
        _.render(req, res, 'services-mail-new', {
            title: 'Tạo mới chiến dịch mail',
            skills: result.skills,
            orgs: result.companies,
            sendProtocol: sendProtocols,
            sercure: sercure,
            receiveProtocol: receiveProtocols,
            plugins: [['bootstrap-select']]
        }, true);
    });
};

//Validation engine
exports.validate = function (req, res) {
    if(req.query.updateId){
        var _query1 = {_id: {$ne: req.query.updateId}};
        var _query2 = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue', 'updateId']);
        var _query = {$and: [_query1, _query2]};
        _ServicesMail.findOne(_query).exec(function (error, sv) {
            res.json([req.query.fieldId, _.isNull(sv)]);
        });
    }else {
        if(req.query.idCompany != ''){
            var _query = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue']);
            _ServicesMail.findOne(_query).exec(function (error, sv) {
                res.json([req.query.fieldId, _.isNull(sv)]);
            });
        }
        else {
            res.json([req.query.fieldId, true]);
        }
    }
};

// DELETE http://domain.com/services-mail/:_id
exports.destroy = function (req, res) {
    log.debug(175);
    _async.waterfall([
        function(callback){
            var arr=[];
            if (!_.isEqual(req.params.servicesmail, 'all')) {
                var id= new mongoose.Types.ObjectId(req.params.servicesmail);
                arr= [id];
            }else{
                arr= _.map(arr= req.body.ids.split(','), function(id, index){
                    return new mongoose.Types.ObjectId(id);
                });

            }
            _TicketsMail.find({idService:{$in: arr}}, function(err, tickets){
                callback(err, tickets, arr);
            })
        },
        function(tickets, arr, callback){
            log.debug(arr);
            _ServicesMail.aggregate([
                {$match: {_id: {$in: arr}}},
                {$group: {_id: "$idSkill"}}
            ]).exec(function(err, skills){
                if(err) return callback(err);
                log.debug(skills);
                _GroupsProfileMail.update({"skills.idSkill": {$in: _.pluck(skills, '_id')}}, {$pull: {skills: {idSkill: {$in: _.pluck(skills, '_id')}}}}, function(err1){
                    callback(err1, tickets, arr);
                })
            })

        },
        function(tickets, arr, callback){
            if(tickets.length>0){
                return callback("Đang chứa ticket, không thể xóa");
            }
            // start: cuongnm - Kiem tra xem service nay co dang dung cho campaigns nao ko
            _MailCampaigns.count({setting: _.ObjectId(req.params.servicesmail)},function(error,num){
                console.log(num);
                if(err) return callback(err);
                if(num) return callback("Service này đang sử dụng cho " + num + " campaigns, không thể xoá");
                _ServicesMail.find({_id: {$in: arr}}, function(err, services){
                    if(err) return callback(err);
                    _ServicesMail.remove({_id: {$in: arr}}, function(err1){
                        callback(err1, services);

                    });
                })
            });
            // end :cuongnm


            // _ServicesMail.find({_id: {$in: arr}}, function(err, services){
            //     if(err) return callback(err);
            //     _ServicesMail.remove({_id: {$in: arr}}, function(err1){
            //         callback(err1, services);

            //     });
            // })


        }
    ], function(error, result){
        log.debug(error, result)
        if(!error){
            _.genTree();
            _.each(result, function(item, index){
                QUEUE_Mail.removeService(item);
            });
        }
        res.json({code:(error)?500:200, message: (error)? JSON.stringify(error):''})
    });
    //if (!_.isEqual(req.params.servicesmail, 'all')) {
    //    _ServicesMail.findByIdAndRemove(req.params.servicesmail, function (error, sv) {
    //        if(!error){
    //            _.genTree();
    //            QUEUE_Mail.removeService(sv);
    //        }
    //        res.json({code: (error ? 500 : 200), message: error ? error : ''});
    //    });
    //}else{
    //    _ServicesMail._deleteAll({$in:req.body.ids.split(',')}, function (error) {
    //        if(!error){
    //            _.genTree();
    //            _.each(req.body.ids.split(','), function(item, index){
    //                QUEUE_Mail.removeService({_id: item});
    //            });
    //        }
    //        res.json({code: (error ? 500 : 200), message: error ? error : ""});
    //    });
    //}
};

// Search
exports.search = {
    json : function(req, res){
        var name = req.query.name;

        _ServicesMail
            .find({name: new RegExp('^'+name+'$')}, function(error, result){
                res.json({code: (error ? 500 : 200), message: error ? error : result});
            });
    },
    html : function(req, res){
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        var _sort = {};
        if(req.query['sortField'])
            _sort[req.query['sortField']] = _.isEqual(req.query['sortValue'], 'asc') ? 1 : -1;

        var _query = {};
        var searchData = {};

        var addSearch = function(fieldName){
            if(req.query[fieldName]) _query[fieldName] = req.query[fieldName];
            searchData[fieldName] = req.query[fieldName];
        }

        var addSearchText = function(fieldName){
            if(req.query[fieldName]) _query[fieldName] = {$regex: new RegExp(_.stringRegex(req.query[fieldName]), 'i')};
            searchData[fieldName] = req.query[fieldName];
        }

        addSearchText('name');
        addSearch('idChannel');
        addSearch('routeMail');
        if (!_.isEqual(req.query.idSkill, '0')) addSearch('idSkill');
        addSearch('status');
        _async.parallel({
            companies: function(next) {
                _Company.find({status: 1}, next);
            },
            skills: function(next) {
                _SkillsMail.find({status: 1}, next);
            }
        }, function(err, result){
            _ServicesMail
                .find(_query)
                .populate('idSkill','skillName')
                .populate('createBy','name')
                .populate('updateBy','name')
                .populate('idChannel','name idCompany')
                .populate({
                    path: 'idChannel',
                    model: _CompanyChannel,
                    populate: {
                        path: 'idCompany',
                        model: _Company
                    }
                })
                .sort(_sort)
                .paginate(page, rows, function (error, items, total) {
                    var paginator = new pagination.SearchPaginator({prelink: '/services-mail', current: page, rowsPerPage: rows, totalResult: total});
                    searchData.dataLength = items.length;
                    _.render(req, res, 'services-mail',
                        {
                            title: 'Danh sách chiến dịch mail',
                            searchData: searchData,
                            sortData: _sort,
                            categories: items,
                            orgs: result.companies,
                            skills: result.skills,
                            paging: paginator.getPaginationData(),
                            plugins: [['bootstrap-select']]
                        }, true, error);
                });
        });
    }
}