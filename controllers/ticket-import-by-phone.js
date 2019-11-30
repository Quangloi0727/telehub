exports.index = {
	json: function(req, res) {

	},
	html: function(req, res) {
		var campaignQuery = {};
		if (req.session.auth.company) {
			campaignQuery = {idCompany: req.session.auth.company._id};
		}
		_Campains.find(campaignQuery, function(err, cams) {
			_.render(req, res, 'ticket-import-by-phone', {
				title: 'Tạo mới ticket gọi ra theo số điện thoại',
				campaigns: cams,
				phone: _.has(req.query, 'phone') ? req.query.phone : '',
				plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
			}, true, err)
		});
	}
};

// POST
exports.create = function(req, res) {
	'use strict';
	var field_so_dien_thoai = req.body.phone;
	var idCampain = req.body.idCampain;
	if (!field_so_dien_thoai || !idCampain) {
		return res.json({
			code: 500,
			message: 'Tạo ticket bị lỗi: Thiếu dữ liệu.'
		});
	}
	if (['0', '+', '84'].indexOf(field_so_dien_thoai[0]) < 0) {
		field_so_dien_thoai = '0' + field_so_dien_thoai;
	}
	if (!req.session.user._id) {
		return res.json({
			code: 500,
			message: 'Tạo ticket bị lỗi: Agent đang đăng nhập không hợp lệ.'
		});
	}
	_async.waterfall([
		// Kiểm tra số điện thoại đã tồn tại trong trường field_so_dien_thoai của khách hàng
		function(next) {
			_CCKFields['field_so_dien_thoai'].db.find({
				value: field_so_dien_thoai
			})
				.limit(1)
				.exec(next);
		},
		function(customerPhone, next) {
			if (customerPhone && customerPhone.length > 0) {
				// Đã tồn tại khách hàng với số điện thoại này
				return next(null, {_id: customerPhone[0].entityId});
			}
			// Tạo mới khách hàng
			createNewCustomerByPhone(field_so_dien_thoai, next);
		},
		function(cusObject, next) {
			// Khách hàng mới hoàn toàn. Tạo ticket
			if (cusObject.entityId && cusObject.value) {
				_Tickets.create({
					createBy: req.session.user._id,
					idCustomer: cusObject.entityId,
					idCampain: idCampain,
					idAgent: req.session.user._id
				}, next);
			} else {
				// Khách hàng đã tồn tại, tìm ticket gọi ra theo khách hàng
				var idCustomer = cusObject._id;
				_Tickets.findOne({
					idCustomer,
					idCampain
				}, function(err, ticket) {
					if (err) {
						return next(err);
					}
					if (!ticket) {
						// Chưa có ticket gọi ra
						_Tickets.create({
							createBy: req.session.user._id,
							idCustomer: idCustomer,
							idCampain: idCampain,
							idAgent: req.session.user._id
						}, next);
					} else {
						next(null, ticket);
					}
				});
			}

		}
	], function(err, ticket) {
		res.json({
			code: err ? 500 : 200,
			ticketId: ticket ? ticket._id : null,
			message: err
		});
	});
};

function createNewCustomerByPhone(phone, callback) {
	_async.waterfall([
		function(next) {
			_Customer.create({}, next);
		},
		function(newCus, next) {
			mongoClient.collection('customerindex').insert({
				_id: newCus._id,
				field_so_dien_thoai: phone
			}, function(err, result) {
				if (err || result.result.n != 1) {
					return next(err || 'Tạo customerindex xảy ra lỗi.');
				}
				next(null, newCus);
			});
		},
		function(newCus, next) {
			_CCKFields['field_so_dien_thoai'].db.create({
				entityId: newCus._id,
				value: phone
			}, next);
		}
	], callback);
}
