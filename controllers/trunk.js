/**
 * Created by NghiaTM on 5/6/2016.
 */


exports.index= {
    json: function(req, res){
        log.debug(req.query);

        if(_.has(req.query, 'usedByCampains')){
            var trunks= _.map(req.query.trunks, function(trunk){
                return new mongoose.Types.ObjectId(trunk);
            })
            _Campains.aggregate([
                {$match: {trunk: {$in: trunks}}},
                {$group: {_id: "$trunk"}}
            ]).exec(function(err, trunks){
                if(err) return res.json({code:500, message: JSON.stringify(err)});

                return res.json({code:200, datas: trunks});
            })

        }else{
            if (_.has(req.query, 'status')) {
                req.query.status = parseInt(req.query.status);
                if (req.query.status > 1) delete req.query.status;
            }
            if (_.has(req.query, 'idCompany')) {
                req.query.idCompany = new mongodb.ObjectId(req.query.idCompany);
                log.debug(31, req.query);
            }
            req.query= _.cleanRequest(req.query);
            log.debug(req.query);
            _Trunk.find(req.query, function(err, trunk){
                log.debug(err, trunk);
                if(err) return res.json({code: 500, message: JSON.stringify(err)})

                return res.json({code:200, data: trunk});
            })
        }


    }
}