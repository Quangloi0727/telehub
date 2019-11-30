/**
 * Created by NghiaTM on 4/6/2016.
 */
exports.index={
    json: function(req, res){

    },
    html: function(req, res){
        log.debug(req.query);
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        if (_.has(req.query, 'status')) {
            req.query.status = parseInt(req.query.status);
            if (req.query.status > 1) delete req.query.status;
        }

        if (_.has(req.query, 'sort')) {
            var stringArr = req.query.sort.split(':');
            var sortCondition = {};
            sortCondition[stringArr[0]] = _.isEqual(stringArr[1], 'asc') ? 1 : -1;
            var sortObj = {$sort: sortCondition};
        }

        req.query = _.cleanRequest(req.query);

        _MailSetting
            .find(req.query)
            .paginate(page, rows, function (error, result, pageCount) {
                var paginator = new pagination.SearchPaginator({prelink: '/mail-setting', current: page, rowsPerPage: rows, totalResult: pageCount});
                _.render(req, res, 'mail-setting', {title: 'Thiết lập mail services',
                    services: result,
                    paging: paginator.getPaginationData(),
                    plugins: ['moment', ['bootstrap-select']]}, true, error);
    });
    }

}

exports.new = function(req, res){
    var sendProtocols= ["SMTP"];
    var receiveProtocols= ["POP3", "IMAP"];
    var sercure= ["SSL", "TLS"];
    _.render(req, res, 'mail-setting-new', {title: 'Tạo mới mail services',
        sendProtocol: sendProtocols,
        sercure: sercure,
        receiveProtocol: receiveProtocols,
        plugins: ['moment', ['bootstrap-select']]}, true);
}

exports.edit= function(req, res){
    log.debug(req.query);
    log.debug(req.params);

    var sendProtocols= ["SMTP"];
    var receiveProtocols= ["POP3", "IMAP"];
    var sercure= ["SSL", "TLS"];
    _MailSetting.findById(req.params['mailsetting'], function(err, result){
        log.debug(result);
        _.render(req, res, 'mail-setting-edit', {title: 'Thiết lập mail services',
            sendProtocol: sendProtocols,
            sercure: sercure,
            receiveProtocol: receiveProtocols,
            service: result,
            plugins: ['moment', ['bootstrap-select']]}, true, err);
    });
}

exports.validate= function(req, res){
    log.debug(req.query);

    if(_.isEqual(req.query.fieldId,'name')){
        if(_.has(req.query, 'current_name')){
            if(_.isEqual(req.query.fieldValue, req.query.current_name)){
                return res.json([req.query.fieldId, true]);
            }
        }
        _MailSetting.findOne({name: req.query.fieldValue}).exec( function(err, data){
            if(_.isNull(data)){
                res.json([req.query.fieldId, true]);
            }else{
                res.json([req.query.fieldId, false]);
            }
        })
    }else if(_.isEqual(req.query.fieldId,'send_user')){
        if(_.has(req.query, 'current_send_user')){
            if(_.isEqual(req.query.fieldValue, req.query.current_send_user)){
                return res.json([req.query.fieldId, true]);
            }
        }
        _ServicesMail.findOne({send_user: req.query.fieldValue}).exec( function(err, data){
            if(_.isNull(data)){
                res.json([req.query.fieldId, true]);
            }else{
                res.json([req.query.fieldId, false]);
            }
        })
    }else if(_.isEqual(req.query.fieldId,'receive_user')){
        if(_.has(req.query, 'current_receive_user')){
            if(_.isEqual(req.query.fieldValue, req.query.current_receive_user)){
                return res.json([req.query.fieldId, true]);
            }
        }
        _ServicesMail.findOne({receive_user: req.query.fieldValue}).exec( function(err, data){
            if(_.isNull(data)){
                res.json([req.query.fieldId, true]);
            }else{
                res.json([req.query.fieldId, false]);
            }
        })
    }

}

exports.create= function(req, res){
    log.debug(req.query);


}

exports.destroy= function(req, res){
    log.debug(req.params);
    _MailSetting.remove({_id: req.params['mailsetting']}, function(err){
            if(err){
                res.json({code:500, message: JSON.stringify(err)});
            }else{
                QUEUE_Mail.removeService({_id: req.params['mailsetting']});
                res.json({code:200});
            }
    });
}

exports.destroys= function(req, res){
    log.debug(req.params);
    log.debug(req.body);

    _MailSetting.remove({_id: {$in: req.body.ids.split(',')}}, function(err){
        if(err){
            res.json({code:500, message: JSON.stringify(err)});
        }else{
            _.each(req.body.ids.split(','), function(item, index){
                QUEUE_Mail.removeService({_id: item});
            });
            res.json({code:200});
        }
    });
}