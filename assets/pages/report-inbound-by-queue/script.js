var DFT = function ($) {
	var options = {};
	var options2 = {};
	var options3 = {};
	var options4 = {};
	var getFilter = function () {
		var filter = _.chain($('.input'))
			.reduce(function (memo, el) {
				if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
				return memo;
			}, {}).value();
		window.location.hash = newUrl(window.location.hash, filter);
	};
	var bindClick = function () {
		//$('.datepicker').datetimepicker({
		//    format:"MM/YYYY",
		//    locale:'vi'
		//})
		$(document).on('click', '.zmdi-refresh', function(){
			window.location.hash = window.location.hash.split("?")[0];
		});
		$('a.btn.bgm-blue.uppercase.c-white').click(function () {
			getFilter();
		});
		$('#exportexcel').on('click', function (event) {
			var todaysDate = moment().format('DD-MM-YYYY');
			var exportexcel = tableToExcel('exceldata', 'My Worksheet');
			$(this).attr('download', todaysDate + '_BaoCaoGoiRaTheoQueue(CongTy).xls')
			$(this).attr('href', exportexcel);
		})
		$('#exportexcel2').on('click', function (event) {
			var todaysDate = moment().format('DD-MM-YYYY');
			var exportexcel = tableToExcel('exceldata2', 'My Worksheet');
			$(this).attr('download', todaysDate + '_BaoCaoGoiRaTheoQueue(ThoiGian).xls')
			$(this).attr('href', exportexcel);
		});
		$('#exportexcel_bydate').on('click', function (event) {
			var todaysDate = moment().format('DD-MM-YYYY');
			var exportexcel = tableToExcel('exceldataReportByDate', 'My Worksheet');
			$(this).attr('download', todaysDate + '_BaoCaoGoiRaTheoQueue(Theongay).xls')
			$(this).attr('href', exportexcel);
		});
		$('#exportexcel_by_hour').on('click', function (event) {
			var todaysDate = moment().format('DD-MM-YYYY');
			var exportexcel = tableToExcel('exceldataReportByHour', 'My Worksheet');
			$(this).attr('download', todaysDate + '_BaoCaoGoiRaTheoQueue(Theogio).xls')
			$(this).attr('href', exportexcel);
		});
		$("#startDate").on("dp.change", function (e) {
			$('#endDate').data("DateTimePicker").minDate(e.date);
		});
		$("#endDate").on("dp.change", function (e) {
			$('#startDate').data("DateTimePicker").maxDate(e.date);
		});
	};
	var bindSubmit = function () {
		var items = {};
		items.pie = {};
		items.pie.data = [];
		items.pie.name = "Số lượng kết nối queue";
		items.pie.seriesName = "SL";
		items.pie2 = {};
		items.pie2.data = [];
		items.pie2.name = "Thời lượng đàm thoại trung bình";
		items.pie2.seriesName = "Thời lượng";
		items.pie3 = {};
		items.pie3.data = [];
		items.pie3.name = "Cuộc gọi bị nhỡ";
		items.pie3.seriesName = "Số lượng";
		_.each(result1, function(o){
			items.pie.data.push({name: o.companyName, y:parseFloat((o.totalCall/total.totalCall*100).toFixed(2))})
			items.pie2.data.push({name: o.companyName, y:parseFloat((o.avgCallDuration/result1.length/total.avgCallDuration*100).toFixed(2))})
			items.pie3.data.push({name: o.companyName, y:parseFloat(((o.totalCall- o.connected)/(total.totalCall-total.connected)*100).toFixed(2))})
		})
		var items2 = {};
		items2.date = [];
		items2.total = [];
		items2.connected = [];
		_.each(result2, function(o){
			items2.date.push(o._id.month + '/' + o._id.year);
			items2.total.push(o.totalCall);
			items2.connected.push(o.connected);
		});
		options = getOptions(items.pie);
		options2 = getOptions(items.pie2);
		options3 = getOptions(items.pie3);
		options4 = {
			title: {
				text: 'Báo cáo theo tháng',
				x: -20 //center
			},
			xAxis: {
				categories: items2.date
			},
			yAxis: {
				title: {
					text: 'Số cuộc gọi'
				}
			},
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				borderWidth: 0
			},
			series: [{
				name: 'Số lượng kết nối queue',
				data: items2.total
			}, {
				name: 'Cuộc gọi được phục vụ',
				data: items2.connected
			}]
		}
	};
	var bindTextValue = function () {
		_.each(_.allKeys(_config.MESSAGE.REPORT_INBOUND_BY_QUEUE), function (item) {
			$('.' + item).html(_config.MESSAGE.REPORT_INBOUND_BY_QUEUE[item]);
		});
	}
	return {
		init: function () {
			if (isAlertSearch && Object.keys(window.location.obj).length > 0) {
				swal({
					title: _config.MESSAGE.TICKETREASON_TXT.SEARCH_NOT_FOUND_TITLE,
					text: _config.MESSAGE.TICKETREASON_TXT.SEARCH_NOT_FOUND_TEXT,
					type: "warning",
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Quay lại!",
					closeOnConfirm: true
				}, function () {
					window.history.back();
				});
			}
			if (_.has(window.location.obj, 'idCompany[]')){
				var item = decodeURI(window.location).split("?")[1].split("&");
				var array = [];
				_.each(item, function(o){
					if(o.split("=")[0]=="idCompany[]"){
						array.push(o.split("=")[1]);
					}
				})
				$('select[name="idCompany"]').selectpicker("val", array).selectpicker('refresh');
			};
			_.each(window.location.obj, function (v, k) {
				var el = $('#' + k.replace(['[]'], '').replace('.', '\\.'));
				if (el[0]) {
					switch (el.prop('tagName')) {
						case 'INPUT':
							el.val(v);
							break;
						case 'SELECT':
							el.val(v);
							if (el.is('.selectpicker')){
								el.val(v).selectpicker('refresh');
							}
							break;
					}
				}
			});
			bindClick();
			bindSubmit();
			bindTextValue();
			$('#mot').highcharts(options);
			$('#hai').highcharts(options2);
			$('#ba').highcharts(options3);
			$('#container').highcharts(options4);
		},
		uncut: function () {
			$(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
			$(document).off('click', '#exportexcel');
			$(document).off('click', '.zmdi-refresh');
		}
	};
}(jQuery);
function getOptions(item){
	return {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie'
		},
		title: {
			text: item.name
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.1f} %',
					style: {
						color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
					},
					distance: 0
				}
			}
		},
		series: [{
			name: item.seriesName,
			colorByPoint: true,
			data: item.data
		}]
	};
}

function pad(num) {
	return ("0" + num).slice(-2);
}
function hms(secs) {
	var sec = Math.ceil(secs);
	var minutes = Math.floor(sec / 60);
	sec = sec % 60;
	var hours = Math.floor(minutes / 60);
	minutes = minutes % 60;
	return hours + ":" + pad(minutes) + ":" + pad(sec);
}
/**
 * Scroll to tag
 * @param id
 */
function scrollToTagById(id){
	var tag = $('#' + id);
	$('html,body').animate({scrollTop: tag.offset().top},'slow');
}
/**
 * Binding report when click to label month
 * @param month, year
 * @param year
 */
function bindingReportByDay(month, year) {
	if (!reportByDate || reportByDate.length === 0) {
		console.log('reportByDate is empty');
		$('#table-container-report-by-day').html('');
		return;
	}
	var filter = [];
	reportByDate.map(function(r) {
		if (month !== 0 && year !== 0 && r._id.month === month && r._id.year === year) {
			filter.push(r);
		} else if (month === 0 || year === 0) {
			// All month
			filter.push(r);
		}
	});
	var html = '';
	var sum = {};
	filter.map(function(o){
		var avg = 0;
		if (o.callDuration && o.connected) {
			avg = o.callDuration / 1000 / o.connected;
		} else {
			avg = o.avgCallDuration || 0;
		}
		avg = Math.floor(avg);

		html += '<tr> ' +
			'<td><a href="javascript: bindingReportByHour(' + o._id.day + ',' + o._id.month + ',' + o._id.year + ')">' + (o._id.day + '/' + o._id.month+'/' + o._id.year) + '</a></td> ' +
			'<td>' + (o.totalCall ? o.totalCall : 0) + '</td> ' +
			'<td>' + (o.connected ? o.connected : 0) + '</td> ' +
			'<td>' + (o.callDuration ? hms(o.callDuration / 1000) : '00:00:00') + '</td>' +
			'<td>' + (o.callDuration ? Math.floor(o.callDuration / 1000).toLocaleString('vn') : 0) + '</td> ' +
			'<td>' + hms(avg) + '</td> ' +
			'<td>' + avg.toLocaleString('vn') + '</td> ' +
			'<td>' + (o.totalCall ? (o.totalCall - o.connected) : 0) + '</td> ' +
			'<td>' + (o.totalCall ? ((o.totalCall - o.connected) * 100 / o.totalCall).toFixed(2) : 0) + '%</td> ' +
			'</tr>';

		sum = {
			avgCallDuration: avg + (sum['avgCallDuration'] || 0),
			totalCall: o.totalCall + (sum['totalCall'] || 0),
			connected: o.connected + (sum['connected'] || 0),
			callDuration: o.callDuration + (sum['callDuration'] || 0)
		}
	});
	if (filter.length === 0) {
		console.log('filter reportByDate is empty');
		$('#table-container-report-by-day').html('');
		return;
	}
	var tmpAvgCallDuration = 0;
	if (sum.callDuration && sum.connected) {
		tmpAvgCallDuration = Math.floor((sum.callDuration / 1000) / sum.connected)
	} else {
		tmpAvgCallDuration = (filter.reduce(function(s, i){
			return s + i.callDuration / 1000;
		}, 0) / 1000 / result1.reduce(function (s, i) {
			return s + i.connected;
		}));
	}

	html += '<tr>' +
		'<th><a href="javascript: bindingReportByHour(0, 0, 0)">Tổng</a></th>' +
		'<td>' + sum.totalCall + '</td>' +
		'<td>' + sum.connected + '</td>' +
		'<td>' + hms(sum.callDuration / 1000) + '</td>' +
		'<td>' + Math.floor(total.callDuration / 1000).toLocaleString('vn') + '</td>' +
		'<td>' + hms(tmpAvgCallDuration) + '</td>' +
		'<td>' + (Math.floor(tmpAvgCallDuration).toLocaleString('vn')) + '</td>' +
		'<td>' + (sum.totalCall - sum.connected) + '</td>' +
		'<td>' + ((sum.totalCall - sum.connected) * 100 / sum.totalCall).toFixed(2) + ' %</td>' +
		'</tr>';
	$('#table-container-report-by-day').html(html);

	// Chart binding
	var data = {};
	data.days = [];
	data.total = [];
	data.connected = [];
	_.each(filter, function(o){
		data.days.push(o._id.day + '/' + o._id.month + '/' + o._id.year);
		data.total.push(o.totalCall);
		data.connected.push(o.connected);
	});
	chartOptions = {
		title: {
			text: 'Báo cáo theo ngày' + ((month != 0 && year != 0) ? '(' + month + '/' + year +')': '(Tổng)'),
			x: -20 //center
		},
		xAxis: {
			categories: data.days
		},
		yAxis: {
			title: {
				text: 'Số cuộc gọi'
			}
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'middle',
			borderWidth: 0
		},
		series: [{
			name: 'Số lượng kết nối queue',
			data: data.total
		}, {
			name: 'Cuộc gọi được phục vụ',
			data: data.connected
		}]
	};
	$('#day-chart-container').highcharts(chartOptions);
	scrollToTagById('exceldataReportByDate');
}

/**
 * Binding report when click to label day
 * @param day
 * @param month, year
 * @param year
 */
function bindingReportByHour(day, month, year) {
	if (!reportByHour || reportByHour.length === 0) {
		console.log('reportByHour is empty');
		$('#table-container-report-by-hour').html('');
		return;
	}
	var filter = [];
	reportByHour.map(function(r) {
		if (day !== 0 && month !== 0 && year !== 0 && r._id.day === day && r._id.month === month && r._id.year === year) {
			filter.push(r);
		} else if (day === 0 || month === 0 || year === 0) {
			// All day
			filter.push(r);
		}
	});

	if (day === 0 || month === 0 || year === 0) {
		var uniqueHours = [], flags = [], tmp = [];
		for (var i = 0; i < filter.length; i++) {
			if (flags[filter[i]._id.hour]) continue;
			flags[filter[i]._id.hour] = true;
			uniqueHours.push(filter[i]._id.hour);
		}
		uniqueHours.map(function(h) {
			tmp.push(
				filter.reduce(function(obj, i) {
					if (obj._id.hour == i._id.hour) {
						obj.connected += i.connected;
						obj.totalCall += i.totalCall;
						obj.callDuration += i.callDuration;
						obj.avgCallDuration += i.avgCallDuration;
					}
					return obj;
				}, {
					"_id": {
						"hour": h
					},
					"connected": 0,
					"totalCall": 0,
					"callDuration": 0,
					"avgCallDuration": 0
				})
			);
		});
		filter = tmp;
	}

	var html = '';
	var sum = {};
	filter.map(function(o){
		var avg = 0;
		if (o.callDuration && o.connected) {
			avg = o.callDuration / 1000 / o.connected;
		} else {
			avg = o.avgCallDuration || 0;
		}
		avg = Math.floor(avg);

		html += '<tr> ' +
			'<td>' + (o._id.hour + ':00:00 -' + (o._id.hour + 1) + ':00:00') + '</td> ' +
			'<td>' + (o.totalCall ? o.totalCall : 0) + '</td> ' +
			'<td>' + (o.connected ? o.connected : 0) + '</td> ' +
			'<td>' + (o.callDuration ? hms(o.callDuration / 1000) : '00:00:00') + '</td>' +
			'<td>' + (o.callDuration ? Math.floor(o.callDuration / 1000).toLocaleString('vn') : 0) + '</td> ' +
			'<td>' + hms(avg) + '</td> ' +
			'<td>' + avg.toLocaleString('vn') + '</td> ' +
			'<td>' + (o.totalCall ? (o.totalCall - o.connected) : 0) + '</td> ' +
			'<td>' + (o.totalCall ? ((o.totalCall - o.connected) * 100 / o.totalCall).toFixed(2) : 0) + '%</td> ' +
			'</tr>';

		sum = {
			avgCallDuration: avg + (sum['avgCallDuration'] || 0),
			totalCall: o.totalCall + (sum['totalCall'] || 0),
			connected: o.connected + (sum['connected'] || 0),
			callDuration: o.callDuration + (sum['callDuration'] || 0)
		}
	});
	if (filter.length === 0) {
		console.log('filter reportByHour is empty');
		$('#table-container-report-by-hour').html('');
		return;
	}
	var tmpAvgCallDuration = 0;
	if (sum.callDuration && sum.connected) {
		tmpAvgCallDuration = Math.floor((sum.callDuration / 1000) / sum.connected)
	} else {
		tmpAvgCallDuration = (filter.reduce(function(s, i){
			return s + i.callDuration / 1000;
		}, 0) / 1000 / result1.reduce(function (s, i) {
			return s + i.connected;
		}));
	}

	html += '<tr>' +
		'<th>Tổng</th>' +
		'<td>' + sum.totalCall + '</td>' +
		'<td>' + sum.connected + '</td>' +
		'<td>' + hms(sum.callDuration / 1000) + '</td>' +
		'<td>' + Math.floor(total.callDuration / 1000).toLocaleString('vn') + '</td>' +
		'<td>' + hms(tmpAvgCallDuration) + '</td>' +
		'<td>' + (Math.floor(tmpAvgCallDuration).toLocaleString('vn')) + '</td>' +
		'<td>' + (sum.totalCall - sum.connected) + '</td>' +
		'<td>' + ((sum.totalCall - sum.connected) * 100 / sum.totalCall).toFixed(2) + ' %</td>' +
		'</tr>';
	$('#table-container-report-by-hour').html(html);

	// Chart binding
	var data = {};
	data.hours = [];
	data.total = [];
	data.connected = [];
	_.each(filter, function(o){
		data.hours.push(o._id.hour + '-' + (o._id.hour + 1));
		data.total.push(o.totalCall);
		data.connected.push(o.connected);
	});
	chartOptions = {
		title: {
			text: 'Báo cáo theo giờ' + ((day !== 0 && month !== 0 && year !== 0) ? '(' + day + '/' + month + '/' +year + ')' : ' (Tổng)'),
			x: -20 //center
		},
		xAxis: {
			categories: data.hours
		},
		yAxis: {
			title: {
				text: 'Số cuộc gọi'
			}
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'middle',
			borderWidth: 0
		},
		series: [{
			name: 'Số lượng kết nối queue',
			data: data.total
		}, {
			name: 'Cuộc gọi được phục vụ',
			data: data.connected
		}]
	};
	$('#hour-chart-container').highcharts(chartOptions);

	scrollToTagById('exceldataReportByHour');
}