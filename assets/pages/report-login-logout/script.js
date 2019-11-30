/**
 * Created by hoangdv on 8/24/16.
 */
var DFT = function ($) {
	var queryFilter = function () {
		var _data = $('#form').serializeJSON();
		var listFilter = _.chain(_.keys(_data))
			.reduce(function (memo, item) {
				if(!_.isEqual(_data[item], ''))
					memo[item.replace("filter_", "")] = _data[item];
				return memo;
			}, {})
			.value();

		window.location.hash = newUrl(window.location.hash.replace('#', ''), listFilter);
	};

	var bindClick = function () {
		$(document).on('click', '#filter-btn', function () {
			queryFilter();
		});
		$('#exportexcel').on('click', function () {
			var currentDate = moment().format('DD-MM-YYYY');
			var exportexcel = tableToExcel('exceldata', 'Detailed Report');
			$(this).attr('download', currentDate + '_LoginLogoutReport.xls');
			$(this).attr('href', exportexcel);
		});
		$('#exportexcelgroupbyday').on('click', function (e) {
/*			var currentDate = moment().format('DD-MM-YYYY');
			var exportexcel = tableToExcel('exceldatagroupbyday', 'Detailed Report Group By Day');
			$(this).attr('download', currentDate + '_LoginLogoutReportGroupByDay.xls');
			$(this).attr('href', exportexcel);*/
			tableHtmlToExcel.bind(this)('exceldatagroupbyday', 'Detailed Report Group By Day');
		});
	};

	/**
	 *
	 * @param idTable id of table data
	 * @param sheetName
	 * @param fileName Optional
	 */
	var tableHtmlToExcel = function(idTable, sheetName, fileName) {
		if (!fileName) {
			fileName = moment().format('DD-MM-YYYY') + '_' + (sheetName.replace(/\s/g,'')) + '.xls';
		}
		var exportexcel = tableToExcel(idTable, sheetName);
		$(this).attr('download', fileName);
		$(this).attr('href', exportexcel);
	};

	var bindTextValue = function () {
		_.each(_.allKeys(_config.MESSAGE.REPORT_LOGIN_LOGOUT), function (item) {
			$('.' + item).html(_config.MESSAGE.REPORT_LOGIN_LOGOUT[item]);
		});
	};

	var msToTime = function(s) {
		if(s == 0) return '00:00:00';
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;
		return _.pad(hrs, 2, '0') + ':' + _.pad(mins, 2, '0') + ':' + _.pad(secs, 2, '0');
	};

	/**
	 *
	 * @param timeline array time status
	 * @param idSelector
	 */
	function drawTimelineChar(timeline, idSelector) {
		var dataTable = new google.visualization.DataTable();
		dataTable.addColumn({
			type: 'string',
			id: 'Name'
		});
		dataTable.addColumn({
			type: 'string',
			id: 'Status'
		});
		dataTable.addColumn({
			type: 'string',
			id: 'Tooltip',
			role: 'tooltip',
			'p': {
				'html': true
			}
		});
		dataTable.addColumn({
			type: 'string',
			role: 'style'
		});
		dataTable.addColumn({
			type: 'date',
			id: 'Start'
		});
		dataTable.addColumn({
			type: 'date',
			id: 'End'
		});
		var rows = [];

		// Hacked to String Object to get Date from ISO String
		if (!String.prototype.getTime) {
			String.prototype.getTime = function() {
				var self = this;
				var _d = moment(self.toString());
				if (_d.isValid()) {
					return _d.toDate();
				}
				return new Date();
			};
		}

		timeline.map(function(time) {
			function getStyleTooltip(stt) {
				var color = 'color: #000000';
				switch (stt.status) {
					case 'Sẵn sàng phục vụ':
						color = 'color: #42B72A';
						break;
					case 'Không sẵn sàng':
						color = 'color: #DB4437';
						break;
					case 'Nghỉ trưa':
						color = 'color: #F4B400';
						break;
					case 'Missing':
						color = 'color: #4F5148';
						break;
					default:
						color = 'color: #000000';
				}
				var tooltip = '<div style="padding: 5px; min-width: 200px !important;">' +
					'<h4>' + stt.status.toString() + '</h4>' +
					'<hr />' +
					'<b>Thời gian: </b>' + moment(stt.start).format('HH:mm:ss') + ' - ' + moment(stt.end).format('HH:mm:ss') + '<br />' +
					'<b>Thời lượng: </b>' + moment.utc(moment(stt.end).diff(moment(stt.start))).format("HH:mm:ss");
					'</div>';
				return {
					color,
					tooltip
				};
			}
			time.status = _.sortBy(time.status, function(stt) {
				return stt.startTime.getTime();
			});
			var sttLen = time.status.length;
			for (var i = 0; i < sttLen; i++) {
				var statusI = time.status[i];
				var stt = {
					name: time.agent.name.toString(),
					status: statusI.status.toString(),
					start: statusI.startTime.getTime(),
					end: statusI.endTime.getTime()
				};
				if (statusI.endReason !== 'logout') { // Trạng thái cuối của chuỗi liên tục
					// Tìm cho tới khi đổi trạng thái
					for (var j = i + 1; j < sttLen; j++) {
						var statusJ = time.status[j];
						stt.end = statusJ.startTime.getTime();
						// Cùng trạng thái
						if (statusI.status == statusJ.status) {
							stt.end = statusJ.endTime.getTime();
							i = j;
						} else {
							break;
						}
					}
				}
				var tmp = getStyleTooltip(stt);
				stt.color = tmp.color;
				stt.tooltip = tmp.tooltip;
				rows.push(stt);
			}
		});
		$('#' + idSelector).height(_.uniq(rows, function(r) {
				return r.name;
			}).length * 50 + 50);
		var container = document.getElementById(idSelector);
		var chart = new google.visualization.Timeline(container);
		var chartRows = [];
		rows.map(function(r) {
			var start = moment(r.start)._d;
			var end = moment(r.end)._d;
			chartRows.push([r.name, r.status, r.tooltip, r.color, start, end]);
		});
		dataTable.addRows(chartRows);
		var options = {
			avoidOverlappingGridLines: false,
			tooltip: {
				isHtml: true
			}
		};
		return chart.draw(dataTable, options);
	}

	/**
	 *
	 */
	var drawCharts = function() {
		if ((typeof google === 'undefined') || (typeof google.visualization === 'undefined')) {
			google.charts.load("current", {packages: ["timeline"], 'language': 'vi'});
			google.charts.setOnLoadCallback(drawCharts);
		} else {
			if (typeof timeline !== 'undefined') {
				drawTimelineChar(timeline, 'timelines');
			}
			if (typeof  timelineByDay !== 'undefined') {
				timelineByDay.map(function(timeline) {
					var time = timeline._id;
					var selector = "chart" + "-" + time.day + "-" + time.month + "-" + time.year;
					drawTimelineChar(timeline.timelines, selector);
				});
			}
		}
	};

	return {
		init: function () {
			bindClick();
			bindTextValue();

			$('.multi-date-picker').datepicker({
				multidate: 2,
				multidateSeparator: ' - ',
				format: 'dd/mm/yyyy',
				todayHighlight: true
			});

			if ($('.pagination')[0]) {
				delete window.location.obj.page;
				var _url = $.param(window.location.obj);
				$('.pagination a').each(function (i, v) {
					$(v).attr('href', $(v).attr('href') + '&' + _url);
				});
			}

			_.each($.deparam(window.location.hash.split('?')[1] || ''), function (v, k) {
				var el = $('#' + k.replace(['[]'], ''));
				if (el[0]) {
					switch (el.prop('tagName')) {
						case 'INPUT':
							el.val(v);
							break;
						case 'SELECT':
							el.val(v);
							if (el.is('.selectpicker')) el.selectpicker('refresh');
							if(el.chosen) el.trigger("chosen:updated");
							break;
					}
				}
			});

			drawCharts();
		},
		uncut: function () {
			$(document).off('click', '#exportexcel');
		}
	};
}(jQuery);