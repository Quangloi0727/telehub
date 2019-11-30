/**
 * Dear maintainer,
 * Once you are done trying to 'optimize' this routine,
 * and have realized what a terrible mistake that was,
 * please increment the following counter as a warning
 * to the next guy:
 * total_hours_wasted_here = 16
 */
var fs = require('fs');
/**
 * Đặt thời gian time out lớn (20 phút), trường hợp đọc file quá lớn (56k dòng) gặp lỗi duplicate của express.
 * @type {number}
 */
var requestTimeout = 20 * 60 * 1000;
var maxExcelRecord = 65000;
exports.index = {
    json: function (req, res) {

    },
    html: function (req, res) {
        _CustomerGroups.aggregate([
            {$lookup: {from: 'customersources', localField: '_id', foreignField: 'group', as: 'sources'}},
            {$match: {status: 1}},
            {$sort: {'name': -1, 'sources.name': -1}}
        ], function (error, groups) {
            _.render(req, res, 'customer-import', {title: 'Thêm khách hàng', plugins: [['chosen'], 'fileinput'], groups: groups}, true);
        });
    }
};

// New
exports.new = function (req, res) {
    _CustomerGroups.aggregate([
        {$lookup: {from: 'customersources', localField: '_id', foreignField: 'group', as: 'sources'}},
        {$match: {status: 1, '_id.sources.status': 1}}
    ], function (error, groups) {
        _.render(req, res, 'customer-import', _.extend({title: 'Tạo mới khách hàng', plugins: [['bootstrap-select']]}, result), true, error);
    });
};
/**
 * Thực hiện chức năng này với file excel lớn, có khả năng gây lỗi "Out of memory", cần thiết đặt nodeV8
 * You can increase the default limits by passing --max-old-space-size=<value> which is in MB.
 * node --max-old-space-size=4096 app.js
 * @param req
 * @param res
 */
exports.create = function (req, res) {
	req.connection.setTimeout(requestTimeout);
    var cfields = {};
    var checkTime = Date.now();

    _async.waterfall([
        function (next) {
            // Tuy vấn dữ liệu customer field
            _CustomerFields.find({status: 1}, 'modalName displayName fieldType fieldValue isRequired -_id').sort({weight: 1, displayName: 1}).exec(next);
        },
        function (fields, next) {
            cfields = fields;
            var workbook = new _Excel.Workbook();
            console.log(38, Date.now() - checkTime);
            // Đọc file excel
            workbook.xlsx
                .readFile(req.files[0].path)
                .then(function () {
                    console.log(42, Date.now() - checkTime);
                    var _template = _.chain(fields).groupBy('modalName').mapObject(function (i) {
                        return i[0];
                    }).value();
                    var _objs = [];
                    var _bObjs = []; //luu array obj backup
                    var _checkedNumber = [];
                    workbook.eachSheet(function (worksheet, sheetId) {
                        //Todo: Bỏ qua nếu số bản ghi trống
                        if (worksheet._rows.length < 2) {
                            next(null, '---------y---------', []);
                        }
                        else {
                            var _headers = _convertModal(worksheet.getRow(1).values, _template);
                            var _headerFields = _.keys(_headers);
                            var _required = _getRequired(worksheet.getRow(1).values, _template);
                            //var _keys = _.keys(_template);

                            // 22.Feb.2017 hoangdv
                            // Lấy danh sách các trường cần import của một
                            // customer. Trong trường hợp file excel mẫu chỉ dành cho một dự án.
                            // Xem ở route '/customer-excel' libs/router_noacd.js || libs/router.js
                            var _keys = (function() {
                                var keysHeader = _.keys(_headers);
                                if (keysHeader.length > 0 && keysHeader.length - 1 < _.keys(_template).length) {
                                    return keysHeader[0] == '0' ? keysHeader.slice(1) : keysHeader;
                                }
                                return _.keys(_template);
							})();
                            var count = 1;

                            var _inNumbers = [];
                            var _addedNumber = [];
                            var _duplicatedNumbers = [];

                            // Chuẩn hóa trường số điện thoại
                            for(var i = 2; i <= worksheet._rows.length; i++){
                                var _sdtIndex = _headerFields.indexOf('field_so_dien_thoai');

                                if(worksheet.getRow(i).values[_sdtIndex]) {
                                    var text = worksheet.getRow(i).values[_sdtIndex].toString().match(/\d/g) ? worksheet.getRow(i).values[_sdtIndex].toString().match(/\d/g) : [];
                                    text = text.join("");
                                    text = (text[0] != 0 && text.substr(0,2) != 84) ? '0'+text : text;
                                    worksheet.getRow(i).getCell(_sdtIndex).value = text;
                                    _inNumbers.push(text);
                                };
                            };

                            if(!_CCKFields['field_so_dien_thoai'].processNumbers){
                                _CCKFields['field_so_dien_thoai'].processNumbers = [];
                            }

                            _addedNumber = _.difference(_inNumbers,_CCKFields['field_so_dien_thoai'].processNumbers);
                            _CCKFields['field_so_dien_thoai'].processNumbers = _.union(_CCKFields['field_so_dien_thoai'].processNumbers, _inNumbers);

                            // Đọc dữ liệu từng dùng
                            _async.whilst(
                                function () {
                                    return count < worksheet._rows.length;
                                },
                                function (callback) {
                                    count++;
                                    var _row = worksheet.getRow(count).values;
                                    var _bObj = {};
                                    //Todo: Bỏ qua dòng trống
                                    _.each(_row, function(cell, i){
                                        if(i > 0) _row[i] = getCellValue(worksheet.getRow(count).getCell(i));
                                    });

                                    if (_.isEmpty(_row)) {
                                        //Dong trang
                                        _async.eachSeries(_keys, function (k, cb) {
                                            _bObj[k] = {'value': '', 'isRequired': _template[k].isRequired};
                                            cb();
                                        }, function (error) {
                                            _bObj['field_error'] = 'Wrong form';
                                            _bObjs.push(_bObj);
                                            callback(null, count);
                                        });
                                    } else if (!_.isEqual(_.intersection(_required, _.keys(_row)), _required)) {
                                        //Thieu field
                                        _async.eachSeries(_keys, function (k, cb) {
                                            if (_.has(_headers, k)){
                                                _bObj[k] = {'value' : _row[_headerFields.indexOf(k)], 'isRequired': _template[k].isRequired};
                                            }
                                            cb();
                                        }, function (error) {
                                            _bObj['field_error'] = 'Wrong form';
                                            _bObjs.push(_bObj);
                                            callback(null, count);
                                        });
                                    }
                                    else {
                                        var _id = new mongodb.ObjectID();
                                        var _obj = {_id: _id, entityId: _id, status: 1, sources: req.body.sources};
                                        //Todo: Chạy vòng lặp lấy dữ liệu từng dòng
                                        _async.eachSeries(_keys, function (k, cb) {
                                            var value = _row[_headerFields.indexOf(k)];
                                            if (_.has(_headers, k) && !_.isUndefined(value)){
                                                _obj[k] = value;
                                                _bObj[k] = {'value': value, 'isRequired': _template[k].isRequired};
                                            }
                                            else{
                                                _obj[k] = '';
                                                _bObj[k] = {'value': '', 'isRequired': _template[k].isRequired};
                                            }

                                            cb();
                                        }, function (error) {
                                            _bObjs.push(_bObj);
                                            _obj.bIndex = _bObjs.length - 1;
                                            _objs.push(_obj);
                                            callback(null, count);
                                        });
                                    }
                                },
                                function (err, n) {
                                    var _emailObjs = [];
                                    _async.waterfall([
                                        function(next2){
                                            // Tìm kiếm số điện thoại đã tồn tại trong hệ thống
                                            mongoClient.collection('customerindex').find({field_so_dien_thoai: {$in: _.pluck(_objs, 'field_so_dien_thoai')}}).toArray(function (err, result) {
                                                _duplicatedNumbers = _.pluck(result, 'field_so_dien_thoai');
                                                var _dupObjs = [];
                                                _objs = _.chain(_objs)
                                                    .map(function(_obj){
                                                        var bIndex = _obj.bIndex;
                                                        _bObjs[bIndex]['field_error'] = '';
                                                        var wrongFormat = false;
                                                        _.each(_.keys(_obj), function(field){
                                                            if(_.has(_template, field)
                                                                && _.isNull(_convertType(_obj[field], field, _template[field]))
                                                                && !_.isEqual(_obj[field],'')
                                                            ){
                                                                wrongFormat = true;
                                                                _bObjs[bIndex][field].isWrongFormat = 1;
                                                            }
                                                        });
                                                        //Todo: Check bản ghi số điện thoại

                                                        if(_.isEmpty(_obj['field_so_dien_thoai']) && !_.isEmpty(_obj['field_e_mail'])){
                                                            // Trường hợp import khách hàng chỉ có email
                                                            _emailObjs.push(_obj);
                                                        }
                                                        // Kiểm tra format của số điện thoại
                                                        if (!isPhoneValid(String(_obj['field_so_dien_thoai'])) || wrongFormat){
                                                            if(String(_obj['field_so_dien_thoai']).length == 0 ) _bObjs[bIndex]['field_so_dien_thoai'].isRequired = 1;
                                                            _bObjs[bIndex]['field_error'] += (_.isEqual(_bObjs[bIndex]['field_error'], '') ? '' : '|') + 'Wrong form';
                                                        };
                                                        // Kiểm tra số điện thoại đã được xử lý
                                                        if(_checkedNumber.indexOf(_obj['field_so_dien_thoai']) >= 0){
                                                            _bObjs[bIndex]['field_error'] += (_.isEqual(_bObjs[bIndex]['field_error'], '') ? '' : '|') + 'Duplicated';
                                                        };
                                                        // Kiểm tra số điện thoại đang được xử lý
                                                        if(_CCKFields['field_so_dien_thoai'].processNumbers.indexOf(_obj['field_so_dien_thoai']) >= 0 &&
                                                            _addedNumber.indexOf(_obj['field_so_dien_thoai']) < 0) {
                                                            _bObjs[bIndex]['field_error'] += (_.isEqual(_bObjs[bIndex]['field_error'], '') ? '' : '|') + 'In Processing';
                                                        };
                                                        // Kiểm tra số điện thoại đã tồn tại trong hệ thống
                                                        if(_duplicatedNumbers.indexOf(_obj['field_so_dien_thoai']) >= 0){
                                                            if(_.isEqual(_bObjs[bIndex]['field_error'], '')){
                                                                _obj._id = result[_duplicatedNumbers.indexOf(_obj['field_so_dien_thoai'])]._id;
                                                                _dupObjs.push(_obj);
                                                            }
                                                            _bObjs[bIndex]['field_error'] += (_.isEqual(_bObjs[bIndex]['field_error'], '') ? '' : '|') + 'Duplicated';
                                                        };

                                                        if(_.isEqual(_bObjs[bIndex]['field_error'], '')){
                                                            _checkedNumber.push(_obj.field_so_dien_thoai);
                                                            return _obj;
                                                        }else{
                                                            return null;
                                                        }
                                                    })
                                                    .compact()
                                                    .value();

                                                var _dupSources = {};
                                                _dupObjs = _.chain(_dupObjs)
                                                    .filter(function(_obj){
                                                        var curSources = result[_duplicatedNumbers.indexOf(_obj['field_so_dien_thoai'])].sources.toString();
                                                        var insertSources = _.chain(req.body.sources)
                                                            .filter(function(source){
                                                                return curSources.indexOf(source) < 0;
                                                            })
                                                            .compact()
                                                            .value();
                                                        _.each(insertSources, function(source){
                                                            if(!_dupSources[source]) _dupSources[source] = [];
                                                            _dupSources[source].push(_obj._id);
                                                        });
                                                        _obj.sources = insertSources;
                                                        return insertSources.length > 0;
                                                    })
                                                    .value();


                                                var _customerBulk = mongoClient.collection('customers').initializeUnorderedBulkOp({useLegacyOps: true});
                                                var _sourcesBulk = mongoClient.collection('customersources').initializeUnorderedBulkOp({useLegacyOps: true});
                                                var _indexBulk = mongoClient.collection('customerindex').initializeUnorderedBulkOp({useLegacyOps: true});
                                                var _CCKBulks = {};
                                                // Kiểm tra các trường dữ liệu được insert
                                                var _inserFields = _.chain(_headerFields)
                                                    .filter(function(head){
                                                        return _.has(_template, head);
                                                    })
                                                    .value();
                                                _.each(_inserFields, function(header){
                                                    var bulk = mongoClient.collection(header).initializeUnorderedBulkOp({useLegacyOps: true});
                                                    _CCKBulks[header] = bulk;
                                                });
                                                // Cập nhật nguồn khách hàng
                                                _sourcesBulk.find({_id: {$in: _.arrayObjectId(req.body.sources)}}).update({$inc: {amount: _objs.length}});
                                                _.each(_.keys(_dupSources), function(key){
                                                    _sourcesBulk.find({_id: new mongodb.ObjectId(key)}).update({$inc: {amount: _dupSources[key].length}});
                                                });
                                                // Cập nhật dữ liệu đã tồn tại trong db
                                                _.each(_dupObjs, function(obj){
                                                    _customerBulk.find({_id: obj._id}).update({$push: { sources: { $each: _.arrayObjectId(obj.sources) }}});
                                                    _indexBulk.find({_id: obj._id}).update({$push: { sources: { $each: _.arrayObjectId(obj.sources) }}});

                                                    var lastObj = result[_duplicatedNumbers.indexOf(obj['field_so_dien_thoai'])];
                                                    var _cusIndex = {};
                                                    _.each(_inserFields, function(header){
                                                        var fValue = _convertType(obj[header],header, _template[header]);
                                                        if((_.isNumber(obj[header]) || !_.isEmpty(obj[header])) && (req.body.prioritize || !_.has(lastObj, header))){
                                                            _cusIndex[header] = fValue;
                                                            _CCKBulks[header].find({entityId: obj._id}).upsert().updateOne({
                                                                entityId: obj._id,
                                                                value: fValue,
                                                                created: Date.now
                                                            });
                                                        }
                                                    });
                                                    _indexBulk.find({_id: obj._id}).update({$set: _cusIndex});
                                                });

                                                // Cập nhật dữ liệu mới
                                                _.each(_objs, function(obj){
                                                    var customer = new _Customer({
                                                        _id: obj._id,
                                                        sources: obj.sources
                                                    });
                                                    _customerBulk.insert(customer.toObject());
                                                    var _cusIndex = {
                                                        _id: customer._id,
                                                        sources: customer.sources
                                                    };

                                                    _.each(_inserFields, function(header){
                                                        if(_.isNumber(obj[header]) || !_.isEmpty(obj[header])){
                                                            var fValue = _convertType(obj[header],header, _template[header]);
                                                            _cusIndex[header] = fValue;
                                                            _CCKBulks[header].insert({
                                                                entityId: obj._id,
                                                                value: fValue,
                                                                created: Date.now
                                                            });
                                                        }else if(_.isEqual(header, 'field_so_dien_thoai') || _.isEqual(header, 'field_e_mail')){
                                                            _cusIndex[header] = null;
                                                            _CCKBulks[header].insert({
                                                                entityId: obj._id,
                                                                value: null,
                                                                created: Date.now
                                                            });
                                                        }
                                                    });
                                                    _indexBulk.insert(_cusIndex);
                                                });

                                                var _bulks = [];
                                                _bulks.push(_customerBulk);
                                                _bulks.push(_indexBulk);
                                                _.each(_.keys(_CCKBulks), function(key){
                                                    _bulks.push(_CCKBulks[key]);
                                                });

												/**
                                                 * 22.Feb.2017 hoangdv I develop & test this feature on
                                                 * mongodb@2.1.4, mongodb-core@1.2.32, bson@0.4.21 !important
                                                 * in your case if this block you can get Error "TypeError: Argument must be a string" please check version of modules
												 */
												_async.each(_bulks, function(batch, callback) {
													if(batch.s.currentBatch)
                                                        batch.execute(callback);
                                                    else
                                                        callback();
                                                }, function(err){
                                                    _CCKFields['field_so_dien_thoai'].processNumbers = _.difference(_CCKFields['field_so_dien_thoai'].processNumbers, _addedNumber);
                                                    if (err) {
                                                        return next2(err);
                                                    } else {
														// 22.Feb.2017 hoangdv  if all is ok we will update amount to customersources table
                                                        _sourcesBulk.execute(function(err, result) {
                                                            next2(err);
														});
                                                    }
                                                });
                                            });
                                        },
                                        function(next2) {
                                            // Xử lý import với khách hàng chỉ có email, flow xử lý như xử lý số điện thoại ở trên
                                            mongoClient.collection('customerindex').find({field_e_mail: {$in: _.pluck(_emailObjs, 'field_e_mail')}}).toArray(function (err, result) {
                                                var _duplicatedEmails = _.pluck(result, 'field_e_mail');
                                                var _checkedEmails = [];
                                                var _dupObjs = [];
                                                _emailObjs = _.chain(_emailObjs)
                                                    .map(function(_obj){
                                                        var bIndex = _obj.bIndex;
                                                        _bObjs[bIndex]['field_error'] = '';
                                                        var wrongFormat = false;
                                                        _.each(_.keys(_obj), function(field){
                                                            if(_.has(_template, field)
                                                                && _.isNull(_convertType(_obj[field], field, _template[field]))
                                                                && !_.isEqual(_obj[field],''))
                                                            {
                                                                wrongFormat = true;
                                                                _bObjs[bIndex][field].isWrongFormat = 1;
                                                            }
                                                        });
                                                        //Todo: Check bản ghi số điện thoại
                                                        if (wrongFormat){
                                                            _bObjs[bIndex]['field_error'] += (_.isEqual(_bObjs[bIndex]['field_error'], '') ? '' : '|') + 'Wrong form';
                                                        };

                                                        if(_checkedNumber.indexOf(_obj['field_e_mail']) >= 0){
                                                            _bObjs[bIndex]['field_error'] += (_.isEqual(_bObjs[bIndex]['field_error'], '') ? '' : '|') + 'Duplicated';
                                                        };

                                                        if(_duplicatedEmails.indexOf(_obj['field_e_mail']) >= 0){
                                                            if(_.isEqual(_bObjs[bIndex]['field_error'], '')){
                                                                _obj._id = result[_duplicatedEmails.indexOf(_obj['field_e_mail'])]._id;
                                                                _dupObjs.push(_obj);
                                                            }
                                                            _bObjs[bIndex]['field_error'] += (_.isEqual(_bObjs[bIndex]['field_error'], '') ? '' : '|') + 'Duplicated';
                                                        };

                                                        if(_.isEqual(_bObjs[bIndex]['field_error'], '')){
                                                            _checkedEmails.push(_obj.field_e_mail);
                                                            return _obj;
                                                        }else{
                                                            return null;
                                                        }
                                                    })
                                                    .compact()
                                                    .value();

                                                var _dupSources = {};
                                                _dupObjs = _.chain(_dupObjs)
                                                    .filter(function(_obj){
                                                        var curSources = result[_duplicatedEmails.indexOf(_obj['field_e_mail'])].sources.toString();
                                                        var insertSources = _.chain(req.body.sources)
                                                            .filter(function(source){
                                                                return curSources.indexOf(source) < 0;
                                                            })
                                                            .compact()
                                                            .value();
                                                        _.each(insertSources, function(source){
                                                            if(!_dupSources[source]) _dupSources[source] = [];
                                                            _dupSources[source].push(_obj._id);
                                                        });
                                                        _obj.sources = insertSources;
                                                        return insertSources.length > 0;
                                                    })
                                                    .value();


                                                var _customerBulk = mongoClient.collection('customers').initializeUnorderedBulkOp({useLegacyOps: true});
                                                var _sourcesBulk = mongoClient.collection('customersources').initializeUnorderedBulkOp({useLegacyOps: true});
                                                var _indexBulk = mongoClient.collection('customerindex').initializeUnorderedBulkOp({useLegacyOps: true});
                                                var _CCKBulks = {};
                                                var _inserFields = _.chain(_headerFields)
                                                    .filter(function(head){
                                                        return _.has(_template, head);
                                                    })
                                                    .value();
                                                _.each(_inserFields, function(header){
                                                    var bulk = mongoClient.collection(header).initializeUnorderedBulkOp({useLegacyOps: true});
                                                    _CCKBulks[header] = bulk;
                                                });
                                                _sourcesBulk.find({_id: {$in: _.arrayObjectId(req.body.sources)}}).update({$inc: {amount: _emailObjs.length}});
                                                _.each(_.keys(_dupSources), function(key){
                                                    _sourcesBulk.find({_id: new mongodb.ObjectId(key)}).update({$inc: {amount: _dupSources[key].length}});
                                                });

                                                _.each(_dupObjs, function(obj){
                                                    _customerBulk.find({_id: obj._id}).update({$push: { sources: { $each: _.arrayObjectId(obj.sources) }}});
                                                    _indexBulk.find({_id: obj._id}).update({$push: { sources: { $each: _.arrayObjectId(obj.sources) }}});

                                                    var lastObj = result[_duplicatedEmails.indexOf(obj['field_e_mail'])];
                                                    var _cusIndex = {};
                                                    _.each(_inserFields, function(header){
                                                        if((_.isNumber(obj[header]) || !_.isEmpty(obj[header])) && (req.body.prioritize || !_.has(lastObj, header))){
                                                            var fValue = _convertType(obj[header],header, _template[header]);
                                                            _cusIndex[header] = fValue;
                                                            _CCKBulks[header].find({entityId: obj._id}).upsert().updateOne({
                                                                entityId: obj._id,
                                                                value: fValue,
                                                                created: Date.now
                                                            });
                                                        }
                                                    });
                                                    _indexBulk.find({_id: obj._id}).update({$set: _cusIndex});
                                                });

                                                _.each(_emailObjs, function(obj){

                                                    var customer = new _Customer({
                                                        _id: obj._id,
                                                        sources: obj.sources
                                                    });
                                                    _customerBulk.insert(customer.toObject());
                                                    var _cusIndex = {
                                                        _id: customer._id,
                                                        sources: customer.sources
                                                    };

                                                    _.each(_inserFields, function(header){
                                                        if(_.isNumber(obj[header]) || !_.isEmpty(obj[header])){
                                                            var fValue = _convertType(obj[header],header, _template[header]);
                                                            _cusIndex[header] = fValue;
                                                            _CCKBulks[header].insert({
                                                                entityId: obj._id,
                                                                value: fValue,
                                                                created: Date.now
                                                            });
                                                        }else if(_.isEqual(header, 'field_so_dien_thoai') || _.isEqual(header, 'field_e_mail')){
                                                            _cusIndex[header] = null;
                                                            _CCKBulks[header].insert({
                                                                entityId: obj._id,
                                                                value: null,
                                                                created: Date.now
                                                            });
                                                        }
                                                    });
                                                    _indexBulk.insert(_cusIndex);
                                                });

                                                var _bulks = [];
                                                _bulks.push(_customerBulk);
                                                _bulks.push(_indexBulk);
                                                _.each(_.keys(_CCKBulks), function(key){
                                                    _bulks.push(_CCKBulks[key]);
                                                });

                                                _async.each(_bulks, function(batch, callback) {
                                                    if(batch.s.currentBatch)
                                                        batch.execute(callback);
                                                    else
                                                        callback();
                                                }, function(err){
                                                    if (err) {
                                                        return next2(err);
                                                    }
													// 22.Feb.2017 hoangdv  if all is ok we will update amount to customersources table
													_sourcesBulk.execute(function(err, result) {
														next2(err);
													});
                                                });
                                            });
                                        }
                                    ], function(err2){
                                        if(err2) next(err2, '-------y------', []);
                                        else next(null, _bObjs, _keys);
                                    });
                                }
                            );
                        }
                    });
                });
        }
    ], function (error, result, header) {
        if (error) {
            return res.json({
                code: 500,
                msg: error.toString()
            });
        }
        var fileName = 'backup-' + 'customer-schema-' + Date.now() + '.xls';
        _async.waterfall([
            function(cb){
				var url = '/assets/export/' + fileName;
                if (result.length > maxExcelRecord) {
                    // backup origin file, no mark error
                    fs.readFile(req.files[0].path, function(err, data) {
                        if (!err) {
							fs.writeFile(path.join(_rootPath, 'assets', 'export', fileName), data, function() {
							    // "do" do nothing.
							});
                        }
					});
                } else {
					//Tao file backup excel, đánh dấu lỗi
					header.push('field_error');
					createExcel(fileName, result, header);
                }
                // don't care
				cb(null, url);
            }
        ], function(err, resp){
            //Luu vao modal
            _CustomerImportHistory.create({
                name: fileName,
                url: resp,
                description: 'Import Data' + ": " + req.files[0].originalname,
                createBy: req.session.user ? req.session.user.displayName : 'Missing',
                created : Date.now()
            });
        });
        fs.unlink(req.files[0].path, function (er, status) {
            var timeProcess = Date.now() - checkTime;
            console.log(480, timeProcess);
            res.json({
                code: 200,
                total: result.length,
                header,
                processTime: millisToMinutesAndSeconds(timeProcess)
            });
        });
    });
};

/**
 * millisecond -> mm:ss
 * @param millis
 * @returns {string}
 */
function millisToMinutesAndSeconds(millis) {
	var minutes = Math.floor(millis / 60000);
	var seconds = ((millis % 60000) / 1000).toFixed(0);
	return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

exports.update = function (req, res) {
    var _body = _.chain(req.body).cleanRequest().toLower().value();
    var _cid = {};
    try {
        _cid = mongodb.ObjectID(req.params.customer);
    }
    catch (e) {
        return res.json({code: 404, message: 'Not found !'});
    }
    _async.waterfall([
        function (callback) {
            _Customer.update({_id: _cid}, {$set: {}}, callback);
        },
        function (c, callback) {
            _async.each(_.keys(_body), function (k, cb) {
                if (_.isNull(_body[k]) || _.isEmpty(_body[k]) || _.isUndefined(_body[k])) {
                    cb(null, null);
                } else {
                    switch (_CCKFields[k].type) {
                        case 6:
                            _body[k] = _moment(_body[k], 'DD/MM/YYYY')._d;
                            break;
                        default:
                            break;
                    }
                    _CCKFields[k].db.update({entityId: _cid}, {$set: {value: _body[k]}}, {upsert: true, new: true}, cb);
                }
            }, callback);
        }
    ], function (error, result) {
        res.json({code: error ? 500 : 200, message: error ? error : 'Cập nhật thành công'});
    });
};

/**
 * Chuẩn hóa dữ liệu customer field
 * @param arr Dữ liệu khách hàng
 * @param template Tập giới hạn số trường
 * @returns {*}
 * @private
 */
var _convertModal = function (arr, template) {
    return _.chain(arr)
        .compact()
        .reduce(function (memo, item) {
            var _field = 'field_' + _.underscored(_.cleanString(item));
            if (_.has(template, _field)) memo[_field] = {type: template[_field].fieldType, required: template[_field].isRequired};
            else memo[_field] = {};
            return memo;
        }, {0: {}})
        .value();
};

/**
 * Lấy danh sách trường require
 * @param arr Dữ liệu khách hàng
 * @param template Dữ liệu customer field đầu vào
 * @returns {*}
 * @private
 */
var _getRequired = function (arr, template) {
    return _.chain(arr)
        .compact()
        .reduce(function (memo, item, i) {
            var _field = 'field_' + _.underscored(_.cleanString(item));
            if (_.has(template, _field) && template[_field].isRequired) memo.push((i + 1).toString());
            return memo;
        }, [])
        .value();
};

var _getArr = function (arr, field, getvalue) {
    return _.chain(arr)
        .map(function (el) {
            if (getvalue) {
                return _.chain(el)
                    .pick(field)
                    .replaceKey(field[1], 'value')
                    .value()
            } else {
                return _.pick(el, field)
            }
        })
        .value();
};

var _swicthType = function (val, type) {
    val = (_.isObject(val) && _.has(val, 'text') ) ? val.text : val;
    switch (type) {
        case 1:
        case 2:
            return Number(val);
            break;
        case 3:
            return val.toString();
            break;
        case 4:
        case 5:
            return _.trimArray(_.compact(String(val).split(',')));
            break;
        case 6:
            return _moment(val, 'DD/MM/YYYY')._d;
            break;
    }
};

/**
 * Chuẩn hóa dữ liệu khách hàng
 * @param val Dữ liệu đầu vào
 * @param k Loại dữ liệu
 * @param template Dữ liệu customer field
 * @returns {*}
 * @private
 */
var _convertType = function (val, k, template) {
    switch (_CCKFields[k].type) {
        case 1:
            return val.toString();
            break;
        case 2:
            return _.isNumber(val) ? Number(val) : null;
            break;
        case 3:
            return val.toString();
            break;
        case 4:
            var result = val.split('|');
            return (result.length <= template.fieldValue.length && _.difference(result, template.fieldValue).length == 0) ? result : null;
            break;
        case 5:
            var result = val.split('|');
            return (result.length == 1 && template.fieldValue.indexOf(val) >= 0) ? result : null;
            break;
        case 6:
            return _moment(val, 'DD/MM/YYYY', true).isValid() ? _moment(val, 'DD/MM/YYYY')._d : null;
            break;
        case 7:
            return Number(val) ? val.toString() : null;
            break;
    }
};

/**
 * Tạo file excel backup
 * @param fileName tên file
 * @param arrayObj Dữ liệu đầu vào
 * @param header
 */
var createExcel = function(fileName, arrayObj, header){
    var options = {
        filename: path.join(_rootPath, 'assets', 'export', fileName),
        useStyles: true, // Default
        useSharedStrings: true,
        dateFormat: 'DD/MM/YYYY HH:mm:ss'
    };
    var workbook = new _Excel.stream.xlsx.WorkbookWriter(options);
    workbook.addWorksheet("My Sheet");
    var worksheet = workbook.getWorksheet("My Sheet");
    var _cl = [];
    var _obj = arrayObj[0];
    _async.waterfall([
        function(callback1){
            //Todo: Tạo column
            _async.each(_.keys(_obj), function(field, next){
                var _style = {
                    alignment: {vertical: "middle", horizontal: "center"}, font: {size: 14, bold: true}, border: {
                        top: {style: "thin", color: {argb: "000000"}},
                        left: {style: "thin", color: {argb: "000000"}},
                        bottom: {style: "thin", color: {argb: "000000"}},
                        right: {style: "thin", color: {argb: "000000"}}
                    }
                };
                _cl.push({header: field.split('field_')[1].toUpperCase(), style: _style, key: field.split('field_')[1].toUpperCase(), width: 20});
                if (_.isEqual(typeof(_obj[field]), 'object') && _obj[field].isRequired) _style.font['color'] = {argb: "FF0000"};
                next();
            }, function (err) {
                if (!err) worksheet.columns = _cl;
                callback1();
            });
        },
        function(callback2){
            //Todo: Tạo các bản ghi
            _async.each(arrayObj, function(obj, cb) {
                var row = {};
                _async.each(_.keys(_obj), function(field, next){
                    if (!_.isEqual(typeof(obj[field]), 'object')){
                        row[field.split('field_')[1].toUpperCase()] = obj[field];
                    }
                    else{
                        if (_.isEqual(obj[field].value, '') && obj[field].isRequired){
                            //Todo: đánh dấu các cell gây error để fill màu sau
                            row[field.split('field_')[1].toUpperCase()] = '--NULL--';
                        }else if(obj[field].isWrongFormat){
                            //Todo: đánh dấu các cell gây error để fill màu sau
                            row[field.split('field_')[1].toUpperCase()] = '--WRONG--'+obj[field].value;
                        }
                        else{
                            row[field.split('field_')[1].toUpperCase()] = obj[field].value;
                        }
                    }
                    next();
                }, function(error){
                    if (!error){
                        worksheet.addRow(row);
                    };
                    cb();
                });
            }, function (err) {
                callback2();
            });
        }
    ], function(err, resp){
        worksheet.eachRow(function(row, rowNumber) {
            //Todo: Fill màu các cell error
            row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                if (_.isEqual(cell.value, '--NULL--')){
                    cell.fill = {
                        type: "pattern",
                        pattern:"darkTrellis",
                        fgColor:{argb:"FFFF00"},
                        bgColor:{argb:"FFFF00"}
                    };
                    cell.value = '';
                }else if(cell.value && cell.value.toString().indexOf('--WRONG--') == 0){
                    cell.fill = {
                        type: "pattern",
                        pattern:"darkTrellis",
                        fgColor:{argb:"FFFF00"},
                        bgColor:{argb:"FFFF00"}
                    };
                    cell.value = cell.value.replace('--WRONG--', '');
                }
            });
        });

        worksheet.commit();
        workbook.commit().then(function () {
            //res.download(options.filename);
        });
    });
};

/**
 * Kiểm tra định dạng đầu số
 * @param p
 * @returns {*}
 */
var isPhoneValid = function(p) {
    var phoneReg = new RegExp('^\\d+$');
    return p.match(phoneReg);
};

/**
 * Lấy dữ liệu 1 cell của excel
 * @param cell
 * @returns {*}
 */
var getCellValue = function(cell){
    switch (cell.type) {
        case 4:
            return _moment(cell.value).format("DD/MM/YYYY");
            break;
        default:
            return cell.toString();
            break;
    }
};
