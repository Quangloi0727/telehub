var DFT = function ($) {
	var options = {};
	var lastPagingData = {};
	var pagingObject = {};

	var bindSocket = function (client) {
		client.on('responseReportInboundMissCallData', function (resp) {
			var index = _.indexOf(pagingObject[resp.formId], Number(resp.dt));
			if (_.has(pagingObject, resp.formId) && index >= 0) {
				pagingObject[resp.formId] = _.reject(pagingObject[resp.formId], function (el, i) {
					return i <= index;
				});

				if (resp.code == 200) {
					lastPagingData[resp.formId] = resp.message;
					$('#' + resp.formId + ' #ticket-paging').html(createPaging(resp.message));
					$('#ticket-total').html('<b>' +
						'<span class="TXT_TOTAL"></span>: ' +
						'<span class="bold c-red" id="ticket-total">' + resp.message.totalResult + '</span>' +
						'</b>');
					$('.TXT_TOTAL').html(_config.MESSAGE.REPORT_OUTBOUND_TICKETS.TXT_TOTAL);
					$('#download-excel').show();
				} else {
					$('#' + resp.formId + ' #ticket-paging').html('');
					$('#ticket-total').html('');
					$('#download-excel').hide();
				}
			}
		});
	};

	var getFilter = function () {
		var filter = _.chain($('.input'))
			.reduce(function (memo, el) {
				if (!_.isEqual($(el).val(), '') && !_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
				return memo;
			}, {}).value();
		_Ajax("/report-inbound-misscall?" + $.param(filter), 'GET', {}, function (resp) {
			if (resp.code == 200) {
				initTable(resp.message);
			}
		})
	};

	// DUONGNB: Add detail misscall report
	var getFilterDetail = function (downloadExcel) {
		var filter = _.chain($('.input'))
			.reduce(function (memo, el) {
				if (!_.isEqual($(el).val(), '') && !_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
				return memo;
			}, {}).value();

		// var sort = _.chain($('#' + formId + ' thead tr th').not('[data-sort="none"]'))
		//     .map(function (el) {
		//         return $(el).attr('sortName') ? $(el).attr('sortName') + ':' + $(el).attr('data-sort') : '';
		//     })
		//     .compact()
		//     .value();
		// sort = _.isEmpty(sort) || _.isEqual(sort.length, 0) ? '' : '&sort=' + sort[0];
		var paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';

		var dateTime = (new Date()).getTime();
		var custom = '&socketId=' + _socket.socket.sessionid + '&formId=' + 'frm-report-misscall-detail' + '&dt=' + dateTime + '&download=' + (downloadExcel ? 1 : 0);
		var url = (newUrl(window.location.hash + '/new', filter) + paging + custom).replace('#', '');
		if (!_.has(pagingObject, 'frm-report-misscall-detail')) pagingObject['frm-report-misscall-detail'] = [];
		pagingObject['frm-report-misscall-detail'].push(dateTime);
		downloadExcel || createLoadingPaging('frm-report-misscall-detail');
		_Ajax(url, 'GET', {}, function (resp) {
			if (resp.code == 200) {
				if (typeof(resp.message) == 'string') {
					return downloadFromUrl(window.location.origin + resp.message);
				}
				initTableDetail(resp.message);
				reversePagingData('frm-report-misscall-detail');
			} else {
				swal({
					title: 'Đã có lỗi xảy ra',
					text: resp.message,
					type: "error"
				});
			}
		})
	};

	var initChart = function (data) {
		var arrayValue = [];
		arrayValue.push({
			name: _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_1'],
			y: data.type_1 ? data.type_1 : 0
		});
		arrayValue.push({
			name: _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_2'],
			y: data.type_2 ? data.type_2 : 0
		});
		arrayValue.push({
			name: _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_3'],
			y: data.type_3 ? data.type_3 : 0
		});
		arrayValue.push({
			name: _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_4'],
			y: data.type_4 ? data.type_4 : 0
		});
		arrayValue.push({
			name: _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_5'],
			y: data.type_5 ? data.type_5 : 0
		});
		arrayValue.push({
			name: _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_OTHER'],
			y: data.other ? data.other : 0
		});
		var options = {
			chart: {
				type: 'pie'
			},
			title: {
				text: 'Báo cáo cuộc gọi nhỡ'
			},
			xAxis: {

			},
			yAxis: {

			},
			series: [{
				data: arrayValue
			}]
		};
		$('#container').highcharts(options);
	}

	var bindClick = function () {
		$('#report-overall').click(function () {
			getFilter();
		});
		$('#report-detail').click(function () {
			getFilterDetail();
		});
		$('#exportexcel-detail').click(function () {
			getFilterDetail(1);
		});
		$('#exportexcel-overall').on('click', function (event) {
			var todaysDate = moment().format('HH:mm DD-MM-YYYY');
			var exportexcel = tableToExcel('exceldata-overall', 'My Worksheet');
			$(this).attr('download', todaysDate + '_Báo cáo gọi vào - Cuộc gọi nhỡ.xls')
			$(this).attr('href', exportexcel);
		});
		$("#startDate").on("dp.change", function (e) {
			$('#endDate').data("DateTimePicker").minDate(e.date);
		});
		$("#endDate").on("dp.change", function (e) {
			$('#startDate').data("DateTimePicker").maxDate(e.date);
		});
		$(document).on('click', '.zpaging', function () {
			var formId = $(this).closest('form').attr('id');
			window.location.obj['page'] = $(this).attr('data-link');
			getFilterDetail();
		});
	};

	var bindTextValue = function () {
		_.each(_.allKeys(_config.MESSAGE.REPORT_INBOUND_MISSCALL), function (item) {
			$('.' + item).html(_config.MESSAGE.REPORT_INBOUND_MISSCALL[item]);
		});
	}

	var newOption = function (obj) {
		return _.Tags([{
			tag: 'option',
			attr: {
				class: 'text-center ',
				value: obj._id
			},
			content: obj.name
		}]);
	};

	var msToTime = function (s) {
		if (s == 0) return '00:00:00';
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;
		return _.pad(hrs, 2, '0') + ':' + _.pad(mins, 2, '0') + ':' + _.pad(secs, 2, '0');
	}

	var initTable = function (datas) {
		$("#tbBody-overall").empty();
		var total = {
			total: 0,
			type_1: 0,
			type_2: 0,
			type_3: 0,
			type_4: 0,
			type_5: 0,
			totalDur: 0,
			avgDur: 0,
			other: 0
		};
		async.each(datas, function (data, callback) {
			total.total += data.total;
			total.type_1 += data.type_1;
			total.type_2 += data.type_2;
			total.type_3 += data.type_3;
			total.type_4 += data.type_4;
			total.type_5 += data.type_5;
			total.totalDur += data.totalDur;
			total.avgDur += data.avgDur;
			var other = data.total - data.type_1 - data.type_2 - data.type_3 - data.type_4 - data.type_5;
			total.other += other;
			var tag = _.Tags([{
				tag: 'tr',
				childs: [{
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: data.name
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: data.total + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: data.type_1 + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: data.type_2 + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: data.type_3 + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: data.type_4 + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: data.type_5 + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: other + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: msToTime(data.totalDur) + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: msToTime(data.avgDur) + ''
				}, ]
			}]);
			$("#tbBody-overall").append(tag);
			callback();
		}, function (err) {
			var totalTag = _.Tags([{
				tag: 'tr',
				childs: [{
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: "Tổng"
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: total.total + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: total.type_1 + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: total.type_2 + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: total.type_3 + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: total.type_4 + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: total.type_5 + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: total.other + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: msToTime(total.totalDur) + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: msToTime(total.avgDur) + ''
				}, ]
			}]);
			$("#tbBody-overall").append(totalTag);
			initChart(total);
		});


	}

	var initTableDetail = function (datas) {
		$("#tbBody-detail").empty();
		async.each(datas, function (data, callback) {
			var tag = _.Tags([{
				tag: 'tr',
				childs: [{
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: data.name
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: data.caller + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: parseDate(new Date(data.startTime)) + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: parseDate(new Date(data.endTime)) + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: hms(data.waitDuration / 1000) + ''
				}, {
					tag: 'td',
					attr: {
						class: 'text-left'
					},
					content: checkType(data.type) + ''
				}]
			}]);
			$("#tbBody-detail").append(tag);
			callback();
		}, function (err) {
			// initChart(total);
		});
	}

	function checkType(type) {
		switch (type) {
			case 1:
				return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_1'];
			case 2:
				return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_2'];
			case 3:
				return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_3'];
			case 4:
				return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_4'];
			case 5:
				return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_5'];
			case 6:
				return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_OTHER'];
		}
	}

	var reversePagingData = function (formId) {
		if (!_.has(lastPagingData, formId) || _.isEmpty(lastPagingData[formId])) {
			$('#' + formId + ' #ticket-paging').html('');
		} else {
			$('#' + formId + ' #ticket-paging').html(createPaging(lastPagingData[formId]));
		}
	};

	var createPaging = function (paging) {
		if (!paging) return '';
		var firstPage = paging.first ? '<li><a class="zpaging" data-link="' + paging.first + '">&laquo;</a></li>' : '';
		var prePage = paging.previous ? '<li><a class="zpaging" data-link="' + paging.previous + '">&lsaquo;</a></li>' : '';
		var pageNum = '';
		for (var i = 0; i < paging.range.length; i++) {
			if (paging.range[i] == paging.current) {
				pageNum += '<li class="active"><span>' + paging.range[i] + '</span></li>';
			} else {
				pageNum += '<li><a class="zpaging" data-link="' + paging.range[i] + '">' + paging.range[i] + '</a></li>';
			}
		}
		var pageNext = paging.next ? '<li><a class="zpaging" data-link="' + paging.next + '">&rsaquo;</a></li>' : '';
		var pageLast = paging.last ? '<li><a class="zpaging" data-link="' + paging.last + '">&raquo;</a></li>' : '';
		return '<div class="paginate text-center">' + '<ul class="pagination">' + firstPage + prePage + pageNum + pageNext + pageLast + '</ul></div>';
	};

	var createLoadingPaging = function (formId) {
		var htmlCode = '<div class="paginate text-center">' +
			'<ul class="pagination">' +
			'<li>' +
			'<img src="assets/images/loading.gif"/>' +
			'</div> ' +
			'</li>' +
			'</ul></div>';
		$('#' + formId + ' #ticket-paging').html(htmlCode);
	};

	function hms(secs) {
		var sec = Math.ceil(secs);
		var minutes = Math.floor(sec / 60);
		sec = sec % 60;
		var hours = Math.floor(minutes / 60)
		minutes = minutes % 60;
		return _.pad(hours, 2, '0') + ":" + _.pad(minutes, 2, '0') + ":" + _.pad(sec, 2, '0');
	}

	function parseDate(date) {
		return [_.pad(date.getMonth() + 1, 2, '0'),
				_.pad(date.getDate(), 2, '0'),
				date.getFullYear()
			].join('/') + ' ' + [_.pad(date.getHours(), 2, '0'), _.pad(date.getMinutes(), 2, '0'), _.pad(date.getSeconds(), 2, '0')].join(':');
	}

	return {
		init: function () {
			bindSocket(_socket);
			//if (_.has(window.location.obj, 'idCampain')) $('select[name="idCampain"]').val(window.location.obj.idCampain).selectpicker('refresh');
			//if (_.has(window.location.obj, 'idCompany')) $('select[name="idCompany"]').val(window.location.obj.idCampain).selectpicker('refresh');
			//if (_.has(window.location.obj, 'type')) $('select[name="type"]').val(window.location.obj.type).selectpicker('refresh');
			//var s = _.has(window.location.obj, 'startDate') ? moment(window.location.obj['startDate'], "DD/MM/YYYY").format("DD/MM/YYYY") : "";
			//var e = _.has(window.location.obj, 'endDate') ? moment(window.location.obj['endDate'], "DD/MM/YYYY").format("DD/MM/YYYY") : "";
			//$('#startDate').val(s).datetimepicker({maxDate: e});
			//$('#endDate').val(e).datetimepicker({minDate: s});
			bindClick();
			//bindSubmit();
			bindTextValue();
			//$('#container').highcharts(options);

			//initTable();
		},
		uncut: function () {
			$(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
			$(document).off('click', '#exportexcel');
		}
	};
}(jQuery);