/**
 * Created by hoangdv
 */
var DFT = function($) {
	var lastSearch = {};
	var pagingObject = {};
	var lastPagingData = {};

	var ticketStatus = {
		NOT_PROCESS: 'Chờ xử lý',
		PROCESSING: 'Đang xử lý',
		COMPLETE: 'Hoàn thành'
	};

	var bindSocket = function(client) {
		client.on('responseReportOrdersPagingData', function(resp) {
			var index = _.indexOf(pagingObject[resp.formId], Number(resp.dt));
			if (_.has(pagingObject, resp.formId) && index >= 0) {
				pagingObject[resp.formId] = _.reject(pagingObject[resp.formId], function(el, i) {
					return i <= index;
				});

				if (resp.code == 200 && _.has(resp.message, 'totalResult') && resp.message.totalResult > 0) {
					lastPagingData[resp.formId] = resp.message;
					$('#' + resp.formId + ' #ticket-paging').html(createPaging(resp.message));
					$('#ticket-total').html('<b>' +
						'<span class="TXT_TOTAL"></span>: ' +
						'<span class="bold c-red" id="ticket-total">' + resp.message.totalResult + '</span>' +
						'</b>');
					$('.TXT_TOTAL').html(_config.MESSAGE.REPORT_ORDERS.TXT_TOTAL);
					$('#download-excel').show();
				} else {
					$('#' + resp.formId + ' #ticket-paging').html('');
					$('#ticket-total').html('');
					$('#download-excel').hide();
				}
			}
		});
	};

	var bindTextValue = function() {
		var temp = [];
		_.each(_.allKeys(_config.MESSAGE.REPORT_ORDERS), function(item) {
			var obj = $('.' + item);
			if (obj.prop('tagName')) {
				obj.html(_config.MESSAGE.REPORT_ORDERS[item]);

				var index = obj.closest('th').index();
				temp[index] = '<li class="p-l-15 p-r-20"> ' +
					'<div class="checkbox">' +
					'<label> ' +
					'<input type="checkbox" class="select-box column-display" data-index="' + index + '" checked>' +
					'<i class="input-helper"></i>' +
					'<a class="p-l-5 text-capitalize text-nowrap">' + _config.MESSAGE.REPORT_ORDERS[item] + '</a>' +
					'</label>' +
					'</div>' +
					'</li>';
			}
		});

		$('#showHideFields').append(temp.join(''));
	};
	var cascadeOption = function() {
		$('select[name="idCampain"]').on('change', function() {
			var query = {};
			query.cascade = $(this).val();
			$.get('/report-outbound-tickets', query, function(res) {
				$('select[name="updateBy"]').empty();

				//Albert: disable "Chọn" option in "Điện Thoại Viên"
				// $('select[name="updateBy"]').append(_.Tags([{
				// 	tag: 'option',
				// 	attr: {value: "", selected: true},
				// 	content: "- Chọn -"
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
		$(document).on('click', '.sort', function() {
			var $this = $(this);
			switch ($this.attr('data-sort')) {
				case 'none':
					$this.toggleAttr('data-sort', 'asc');
					break;
				case 'asc':
					$this.toggleAttr('data-sort', 'desc');
					break;
				case 'desc':
					$this.toggleAttr('data-sort', 'none');
					break;
			}
			$this.siblings().toggleAttr('data-sort', 'none');
			var formId = $(this).closest('form').attr('id');
			queryFilter(formId);
		});

		$(document).on('click', '#btn-search', function() {
			var formId = $(this).closest('form').attr('id');
			queryFilter(formId);
		});

		$(document).on('click', '.zpaging', function() {
			var formId = $(this).closest('form').attr('id');
			window.location.obj['page'] = $(this).attr('data-link');
			queryFilter(formId);
		});

		$(document).on('keyup', '.filter', function(e) {
			if (e.keyCode == 13) {
				var formId = $(this).closest('form').attr('id');
				queryFilter(formId);
			}
		});

		$(document).on('change', '.column-display', function(e) {
			var dataIndex = $(this).attr('data-index');
			var checked = $(this).is(":checked");

			_.each($('th'), function(el) {
				var index = $(el).index();

				if (index == dataIndex) {
					if (checked) {
						$(el).show();
					} else {
						$(el).hide();
					}
				}
			});

			_.each($('td'), function(el) {
				var index = $(el).index();
				if (index == dataIndex) {
					if (checked) {
						$(el).show();
					} else {
						$(el).hide();
					}
				}
			})
		});

		$(document).on('click', '#download-excel', function() {
			queryFilter('frm-report-order', true, true, lastPagingData['frm-report-order'].totalResult);
		});

		$(document).on('click', '.playAudio', function() {
			var $this = $(this);
			var audio = $this.closest('td').find('audio')[0];

			audio.onended = function() {
				$(this).closest('td').find('.zmdi-play').show();
				$(this).closest('td').find('.zmdi-pause').hide();
			};

			_.each($('audio'), function(el) {
				var __audio = $(el)[0];
				if (__audio != audio && !__audio.paused) {
					__audio.pause();
					$(el).closest('td').find('.zmdi-play').show();
					$(el).closest('td').find('.zmdi-pause').hide();
				}
			});

			if (audio.paused) {
				audio.play();
				$this.find('.zmdi-play').hide();
				$this.find('.zmdi-pause').show();
			} else {
				audio.pause();
				$this.find('.zmdi-play').show();
				$this.find('.zmdi-pause').hide();
			}
		});

		$(document).on('click', '.btn-detail', function() {
			showTicketOrder($(this).data('order-id'));
		});
	};

	var queryFilter = function(formId, ignoreSearch, downloadExcel, totalResult) {
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
		sort = _.isEmpty(sort) || _.isEqual(sort.length, 0) ? '' : '&sort=' + sort[0];
		var paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';

		var dateTime = (new Date()).getTime();
		var custom = '&socketId=' + _socket.socket.sessionid
			+ '&formId=' + formId
			+ '&dt=' + dateTime
			+ '&ignoreSearch='
			+ (ignoreSearch ? 1 : 0)
			+ '&download=' + (downloadExcel ? 1 : 0)
			+ '&totalResult=' + (totalResult ? totalResult : 0);
		var url = (newUrl(window.location.hash, filter) + sort + paging + custom).replace('#', '');
		if (downloadExcel) {
			downloadExcelReport(url);
		} else {
			requestTickets(formId, dateTime, url, ignoreSearch);
		}
	};

	var downloadExcelReport = function(url) {
		$('.page-loader').show();
		$.get(url, function(resp) {
			$('.page-loader').hide();

			if (resp.code == 500) {
				swal({
					title: 'Đã có lỗi xảy ra',
					text: resp.message,
					type: "error"
				});
			} else {
				downloadFromUrl(window.location.origin + resp.message);
			}
		});
	};

	var requestTickets = function(formId, dateTime, url, ignoreSearch) {
		if (!_.has(pagingObject, formId)) pagingObject[formId] = [];
		pagingObject[formId].push(dateTime);
		createLoadingPaging(formId);

		_AjaxData(url, 'GET', null, function(resp) {
			if (!resp.orders || resp.code == 500 || (resp.orders.length == 0 && !ignoreSearch)) {
				swal({
					title: 'Không tìm thấy kết quả với khoá tìm kiếm',
					text: resp.message,
					type: "warning",
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Xác nhận!",
					closeOnConfirm: true
				}, function() {
					reverseSearchValue();
					reversePagingData(formId);
				});
			} else {
				loadData(formId, resp);
			}
		});
	};

	var setValueLastSearch = function() {
		_.each($(' .searchColumn'), function(el) {
			var name = $(el).attr('name');
			var value = $(el).val();
			lastSearch[name] = value;
		});
	};

	var reverseSearchValue = function() {
		_.each($('.searchColumn'), function(el) {
			var name = $(el).attr('name');
			var value = lastSearch[name] ? lastSearch[name] : '';
			$(el).val(value);
		});

		$('.selectpicker').selectpicker('refresh');
		$('.tag-select').trigger("chosen:updated");
	};

	var reversePagingData = function(formId) {
		if (!_.has(lastPagingData, formId) || _.isEmpty(lastPagingData[formId])) {
			$('#' + formId + ' #ticket-paging').html('');
		} else {
			$('#' + formId + ' #ticket-paging').html(createPaging(lastPagingData[formId]));
		}
	};

	var createPaging = function(paging) {
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

	var createLoadingPaging = function(formId) {
		var htmlCode = '<div class="paginate text-center">' +
			'<ul class="pagination">' +
			'<li>' +
			'<img src="assets/images/loading.gif"/>' +
			'</div> ' +
			'</li>' +
			'</ul></div>';
		$('#' + formId + ' #ticket-paging').html(htmlCode);
	};
	var storeOrders = [];
	var loadData = function(formId, resp) {
		storeOrders = resp.orders || [];
		var template = '<tr>' +
			'<td title="{0}">{0}</td>' +
			'<td title="{1}">{1}</td>' +
			'<td title="{2}">{2}</td>' +
			'<td>{3}</td>' +
			'<td title="{4}">{4}</td>' +
			'<td title="{5}">{5}</td>' +
			'<td title="{6}">{6}</td>' +
			'<td title="{7}">{7}</td>' +
			'<td>{8}</td>' +
			'</tr>';

		var rows = '';
		resp.orders.forEach(function(el) {
			if (_.isEmpty(el)) return;
			if (el.ticket) {
				var status = '';
				switch (el.ticket.status) {
					case 0:
						status = ticketStatus.NOT_PROCESS;
						break;
					case 1:
						status = ticketStatus.PROCESSING;
						break;
					case 2:
						status = ticketStatus.COMPLETE;
						break;
				}
				//var updatedBy = el.ticket.ubdisplayName === null ? '' : el.ticket.ubdisplayName + " (" + el.ticket.ubName + ")";
				var buttonDetail = '<button class="btn btn-default m-l-10 btn-detail" data-order-id="' + el._id + '" type="button">'
					+ 'Chi tiết'
					+ '</button>';
				rows += template.str(_.isEqual(el.name, el.ticket.customer.field_ho_ten) ? el.ticket.customer.field_ho_ten : el.name,
					_.isEqual(el.phone, el.ticket.customer.field_so_dien_thoai) ? el.ticket.customer.field_so_dien_thoai : el.phone,
					_.isEqual(el.email, el.ticket.customer.field_e_mail) ? el.ticket.customer.field_e_mail : el.email,
					_.isEqual(el.address, el.ticket.customer.field_dia_chi) ? el.ticket.customer.field_dia_chi : el.address,
					el.cardType,
					el.card,
					moment(el.createDate).format('HH:mm DD/MM/YYYY'),
					el.deliveryType || '',
					buttonDetail
				);

			} else {
				rows += template.str(el.name,
					el.phone,
					el.email,
					el.address,
					el.cardType,
					el.card,
					moment(el.createDate).format('HH:mm DD/MM/YYYY'),
					el.delivery || '',
					''
				);
			}
		});
		setValueLastSearch();
		$('#' + formId + ' #ticket-body').html(rows);
		$('.selectpicker').selectpicker('refresh');
		$('.tag-select').trigger("chosen:updated");
		window.MainContent.loadTooltip();
		if (resp.reportByDay && resp.reportByDay.length > 0) {
			template = '<tr>' +
				'<td title="{0}">{0}</td>' +
				'<td title="{1}">{1}</td>' +
				'<td title="{2}">{2}</td>' +
				'<td title="{3}">{3}</td>' +
				'</tr>';
			rows = '';
			resp.reportByDay.forEach(function(el) {
				var date = el._id;
				rows += template.str(
					date.day + '/' + date.month + '/' + date.year,
					el.counterEnglish,
					el.counterJapan,
					el.counterOther
				);
			});
			var chartTitle = 'Nhóm theo ngày tạo form';
			if (resp.orders.length && resp.orders[0].ticket) {
				chartTitle = 'Nhóm theo ngày cập nhật ticket';
			}
			$('#reportByDay tbody').html(rows);
			$('#reportByDay').find('caption').html(chartTitle);
			//remove all charts
			Highcharts.charts.forEach(function(chart) {
				!chart || chart.destroy();
			});
			$('#reportByDay').highchartTable();
		}
	};

	function showTicketOrder(orderId) {
		var order = _.find(storeOrders, function(o) {
			return o._id == orderId;
		});
		var ticket = order.ticket;
		if (ticket) {
			var status = '';
			switch (ticket.status) {
				case 0:
					status = ticketStatus.NOT_PROCESS;
					break;
				case 1:
					status = ticketStatus.PROCESSING;
					break;
				case 2:
					status = ticketStatus.COMPLETE;
					break;
			}
			var template = '<tr>' +
				'<td title="{0}">{0}</td>' +
				'<td title="{1}">{1}</td>' +
				'<td title="{2}">{2}</td>' +
				'<td>{3}</td>' +
				'<td title="{4}">{4}</td>' +
				'<td title="{5}">{5}</td>' +
				'<td title="{6}">{6}</td>' +
				'<td title="{7}">{7}</td>' +
				'<td title="{8}">{8}</td>' +
				'<td title="{9}">{9}</td>' +
				'</tr>';
			$('#tbl-ticket-order').find('tbody').html(template.str(ticket.campain,
				ticket.sources.join(' ,'),
				status,
				ticket.ticketReasonCategory ? ticket.ticketReasonCategory : '',
				ticket.ticketReason ? ticket.ticketReason : '',
				ticket.ticketSubreason ? ticket.ticketSubreason : '',
				ticket.callIdLength,
				ticket.note,
				moment(ticket.updated).format('HH:mm DD/MM/YYYY'),
				ticket.ubdisplayName + '(' + ticket.ubName + ')'
			));
			$('#ticket-record').html('<div>' +
				'<audio controls id="myAudio"' +
				'<source src="' + recordPath + ticket.recordPath + '" type="audio/mp4">' +
				'Your user agent does not support the HTML5 Audio element.' +
				'</audio>' +
				'</div> ' +
				'<div>' +
				'<button class="btn btn-default m-l-10" type="button">' +
				'<a href="' + recordPath + ticket.recordPath + '" download><i class="zmdi zmdi-download zmdi-hc-fw download-audio f-25" data-url="' + recordPath + ticket.recordPath + '"></i></a>' +
				'</button>' +
				'</div>'
			);
			$('#modalTicketOrder').modal();
		}
	}

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
			bindSocket(_socket);
			bindTextValue();
			updateView();
			setValueLastSearch();
			cascadeOption();
			bindClick();
		},
		uncut: function() {
			lastSearch = {};
			pagingObject = {};
			lastPagingData = {};
			$(document).off('change', 'select[name="company"]');
			$(document).off('click', '.sort');
			$(document).off('click', '#btn-search');
			$(document).off('click', '.zpaging');
			$(document).off('keyup', '.filter');
			$(document).off('change', '.column-display');
			$(document).off('click', '#download-excel');
			$(document).off('click', '.zmdi-refresh');
			delete _socket.$events['responseReportOrdersPagingData'];
		}
	};
}(jQuery);