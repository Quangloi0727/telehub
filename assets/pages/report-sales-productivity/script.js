/**
 * Created by hoangdv
 */
var DFT = function($) {
	var bindTextValue = function() {
		_.each(_.allKeys(_config.MESSAGE.REPORT_SALES_PRODUCTIVITY), function(item) {
			var obj = $('.' + item);
			if (obj.prop('tagName')) {
				obj.html(_config.MESSAGE.REPORT_SALES_PRODUCTIVITY[item]);
				var index = obj.closest('th').index();
			}
		});

	};
	var cascadeOption = function() {
		$('select[name="idCampain"]').on('change', function() {
			var query = {};
			query.cascade = $(this).val();
			$.get('/report-outbound-tickets', query, function(res) {
				$('select[name="updateBy"]').empty();
				// $('select[name="updateBy"]').append(_.Tags([{
				// 	tag: 'option',
				// 	attr: {value: "", selected: true},
				// 	// content: "- Chọn -"
				// }]));
				_.each(res, function(o) {
					$('select[name="updateBy"]').append(_.Tags([{
						tag: 'option',
						attr: {value: o._id},
						content: o.displayName + "(" + o.name + ")"
					}]));
				});
				$('select[name="updateBy"]').trigger("chosen:updated");
			});
		});
	};
	var bindClick = function() {
		$('.multi-date-picker').daterangepicker({
			autoUpdateInput: false,
			opens: "center",
			timePicker: true,
			timePicker24Hour: true,
			todayHighlight: true,
			locale: {
				format: 'HH:mm DD/MM/YYYY',
				cancelLabel: 'Clear'
			}
		})
			.on('apply.daterangepicker', function(ev, picker) {
				$(this).val(picker.startDate.format('HH:mm DD/MM/YYYY') + ' - ' + picker.endDate.format('HH:mm DD/MM/YYYY'));
			})
			.on('cancel.daterangepicker', function(ev, picker) {
				$(this).val('');
			});

		$(document).on('click', '.zmdi-refresh', function() {
			_.LoadPage(window.location.hash);
		});

		$(document).on('click', '#btn-search', function() {
			var formId = $(this).closest('form').attr('id');
			queryFilter(formId);
		});

		$('#exportexcel-sales-productivity').on('click', function (event) {
			var todaysDate = moment().format('HH:mm DD-MM-YYYY');
			var exportexcel = tableToExcel('tbl-sales-productivity', 'My Worksheet');
			$(this).attr('download', todaysDate + '_BaoCaoNangXuatGoiRa.xls');
			$(this).attr('href', exportexcel);
		});
	};

	var queryFilter = function(formId) {
		var filter = _.chain($('#' + formId + ' .searchColumn'))
			.reduce(function(memo, el) {
				if ($(el).val() && !_.isEqual($(el).val(), '')) {
					memo[el.name] = $(el).val();
				}
				return memo;
			}, {}).value();
		var sort = _.chain($('#' + formId + ' thead tr th').not('[data-sort="none"]'))
			.map(function(el) {
				return $(el).attr('sortName') ? $(el).attr('sortName') + ':' + $(el).attr('data-sort') : '';
			})
			.compact()
			.value();

		var custom = '&dt=' + Date.now();
		var url = (newUrl(window.location.hash, filter) + custom).replace('#', '');
		_AjaxData(url, 'GET', null, function(resp) {
			if (!resp || resp.code == 500 || !resp.data || !_.isArray(resp.data)) {
				swal({
					title: 'Không tìm thấy kết quả với khoá tìm kiếm',
					text: resp.message,
					type: "warning",
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Xác nhận!",
					closeOnConfirm: true
				}, function() {
					reverseSearchValue();
				});
			} else {
				loadData(formId, resp.data);
			}
		});
	};

	/**
	 * Cập nhật thông tin response lên table
	 * @param formId
	 * @param data
	 */
	var loadData = function(formId, data) {
		var template = '<tr>' +
			'<td title="{0}">{0}</td>' +
			'<td title="{1}">{1}</td>' +
			'<td title="{2}">{2}</td>' +
			'<td>{3}</td>' +
			'<td title="{4}">{4}</td>' +
			'<td title="{5}">{5}</td>' +
			'<td title="{6}">{6}</td>' +
			'</tr>';

		var rows = '';
		var total = {
			allNewTickets: 0,
			rateNewTickets: 0,
			allOldTickets: 0,
			rateOldTickets: 0
		};
		data.forEach(function(el) {
			rows += template.str(
				el.agent,
				el.allNewTickets,
				el.rateNewTickets,
				el.allNewTickets !== 0 ? Math.floor((el.rateNewTickets / el.allNewTickets) * 100) + '%' : '0%',
				el.allOldTickets,
				el.rateOldTickets,
				el.allOldTickets !== 0 ? Math.floor((el.rateOldTickets / el.allOldTickets) * 100) + '%' : '0%'
			);
			total.allNewTickets += el.allNewTickets;
			total.rateNewTickets += el.rateNewTickets;
			total.allOldTickets += el.allOldTickets;
			total.rateOldTickets += el.rateOldTickets;
		});
		rows += template.str(
			'<b>Tổng</b>',
			total.allNewTickets,
			total.rateNewTickets,
			total.allNewTickets !== 0 ? Math.floor((total.rateNewTickets / total.allNewTickets) * 100) + '%' : '0%',
			total.allOldTickets,
			total.rateOldTickets,
			total.allOldTickets !== 0 ? Math.floor((total.rateOldTickets / total.allOldTickets) * 100) + '%' : '0%'
		);

		setValueLastSearch();
		$('#' + formId + ' #table-body-sales-productivity').html(rows);
		$('.selectpicker').selectpicker('refresh');
		window.MainContent.loadTooltip();
		$('#tbl-sales-productivity').highchartTable();
		Highcharts.charts.forEach(function(chart) {
			if (chart) {
				chart.series.forEach(function(c) {
					if (c && c.remove && c.name && c.name.toUpperCase().indexOf('TỶ LỆ') > -1) {
						c.remove(true);
					}
				});
			}
		});
	};

	var setValueLastSearch = function() {
		_.each($(' .searchColumn'), function(el) {
			var name = $(el).attr('name');
			lastSearch[name] = $(el).val();
		});
	};

	var reverseSearchValue = function() {
		_.each($('.searchColumn'), function(el) {
			var name = $(el).attr('name');
			var value = lastSearch[name] ? lastSearch[name] : '';
			$(el).val(value);
		});

		$('.selectpicker').selectpicker('refresh');
	};




	var updateView = function() {
		// resize chosen picker
		$(".chosen-container").each(function() {
			$(this).attr('style', 'width: 100%');
		});

		// Setup date range picker
		$('.daterangepicker').daterangepicker({
			autoUpdateInput: false,
			opens: "left",
			locale: {
				format: 'DD/MM/YYYY',
				cancelLabel: 'Clear'
			}
		})
			.on('apply.daterangepicker', function(ev, picker) {
				$(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
			})
			.on('cancel.daterangepicker', function(ev, picker) {
				$(this).val('');
			});
	};

	return {
		init: function() {
			lastSearch = {};
			bindTextValue();
			updateView();
			setValueLastSearch();
			cascadeOption();
			bindClick();
		},
		uncut: function() {
			lastSearch = {};
			$(document).off('click', '#btn-search');
			$(document).off('click', '.zmdi-refresh');
		}
	};
}(jQuery);