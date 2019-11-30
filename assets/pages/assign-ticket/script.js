/**
 * Created by sonth on 11/17/16.
 */
var DFT = function($) {
	var pagingObject = {};
	var lastPagingData = {};

	var ticketStatus = {
		NOT_PROCESS: 'Chờ xử lý',
		PROCESSING: 'Đang xử lý'
	};

	var bindTextValue = function() {
		var temp = [];
		_.each(_.allKeys(_config.MESSAGE.ASSIGN), function(item) {
			var obj = $('.' + item);
			if (obj.prop('tagName')) {
				var index = obj.closest('th').index();
				obj.html(_config.MESSAGE.ASSIGN[item]);
				temp[index] = '<li class="p-l-15 p-r-20"> ' +
					'<div class="checkbox">' +
					'<label> ' +
					'<input type="checkbox" class="select-box column-display" data-index="' + index + '" checked>' +
					'<i class="input-helper"></i>' +
					'<a class="p-l-5 text-capitalize text-nowrap">' + _config.MESSAGE.ASSIGN[item] + '</a>' +
					'</label>' +
					'</div>' +
					'</li>';
			}
		});

		$('#showHideFields').append(temp.join(''));
	};

	var bindSubmit = function() {
		$(document).on('submit', '.form-assign', function(e) {
			e.preventDefault();
			var tbl = $($(this).find('table')[0]).attr('id');
			var ids = $.map($('#' + tbl + ' .select-box-cell'), function(n, i) {
				return $(n).is(":checked") ? {
						_id: $(n).attr('data-id'),
						value: $($(n).closest('tr').find('input.form-number')[0]).val()
					} : '';
			});
			var deadline = $(this).find('input[name=modal_deadline]').val();
			var dataSend = {ids: JSON.stringify(_.compact(ids)), deadline: deadline};
			swal({
					title: _config.MESSAGE.ASSIGN.CONFIRM_ASSIGN_TITLE,
					text: _config.MESSAGE.ASSIGN.CONFIRM_ASSIGN_TEXT,
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Có, chắc chắn !",
					closeOnConfirm: true
				},
				function() {
					$(".page-loader").show();
					$.ajax({
						type: "POST",
						url: window.location.obj.lastSearch + '&inbound=' + ((tbl == 'tbl-inbound') ? 1 : 0),
						data: dataSend,
						dataType: "json",
						success: function(resp) {
							$(".page-loader").fadeOut("slow", function() {
								if (resp.code == 200) {
									return swal({
										title: 'Thành công',
										text: 'Thay đổi thành công',
										type: "success",
										closeOnConfirm: true
									}, function() {
										_.LoadPage(window.location.hash);
									});
								}
								swal({title: 'Thất bại', text: resp.msg, type: "warning"});
							});
						},
						error: function(err) {
							$(".page-loader").fadeOut("slow", function() {
								swal({title: 'Thất bại', text: err.toString(), type: "warning"});
							});
						}
					});
				});
		});
	};

	var bindClick = function() {
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

		$(document).on('click', '.zmdi-refresh', function() {
			_.LoadPage(window.location.hash);
		});

		$(document).on('click', '#btn-search', function() {
			var formId = $(this).closest('form').attr('id');
			queryFilter(formId);
		});

		$(document).on('click', '.queryAgent', function() {
			queryAgent($(this).attr('id'));
		});

		$(document).on('keyup', '.filter', function(e) {
			if (e.keyCode == 13) {
				var formId = $(this).closest('form').attr('id');
				queryFilter(formId);
			}
		});

		$(document).on('click', '.zpaging', function() {
			var formId = $(this).closest('form').attr('id');
			window.location.obj['page'] = $(this).attr('data-link');
			queryFilter(formId);
		});

		$(document).on('click', '.apaging', function() {
			window.location.obj['apage'] = $(this).attr('data-link');
			var tableAgent = $('.outbound').hasClass('active') ? 'outbound' : 'inbound';
			queryAgent(tableAgent);
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

		$(document).on('change', '#inbound_company', function(e) {
			var companyId = $(this).val();
			$('#inbound_group').find('.option-g').remove();
			$.get('/assign-ticket?type=1&idCompany=' + companyId, function(resp) {
				if (resp.code == 200) {
					_.each(resp.data, function(g, i) {
						$('#inbound_group').append(newOption(g));
					});
					$('#inbound_group').selectpicker('refresh');
				}
			});
		});

		$(document).on('change', '#outbound_company', function(e) {
			var companyId = $(this).val();
			$('#outbound_group').find('.option-g').remove();
			$.get('/assign-ticket?type=1&idCompany=' + companyId, function(resp) {
				if (resp.code == 200) {
					_.each(resp.data, function(g, i) {
						$('#outbound_group').append(newOption(g));
					});
					$('#outbound_group').selectpicker('refresh');
				}
			});
		});

		$(document).on('change', '.select-box-all', function() {
			var tbl = $(this).closest('table').attr('id');
			$('#' + tbl + ' .select-box-cell').prop('checked', $(this).is(":checked"));
		});
	};

	var newOption = function(obj) {
		return _.Tags([
			{tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name}
		]);
	};

	/**
	 *
	 * @param formId
	 * @param ignoreSearch
	 * @param callback Để báo hiệu khi hàm thực hiện hoàn thành
	 */
	var queryFilter = function(formId, ignoreSearch, callback) {
		var filter = _.chain($('#' + formId + ' .searchColumn'))
			.reduce(function(memo, el) {
				if ($(el).val() && !_.isEqual($(el).val(), '') && !_.isEqual($(el).val(), '-1')) {
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
		var custom = '&type=2&inbound=' + (formId == 'frm-inbound' ? 1 : 0);
		var url = (newUrl(window.location.hash, filter) + sort + paging + custom).replace('#', '');
		window.location.obj.lastSearch = (newUrl(window.location.hash, filter) + sort + paging + '&type=2').replace('#', '');
		requestTickets(formId, url, ignoreSearch, callback);
	};

	var queryAgent = function(tableId) {
		var filter = _.chain($('.searchAgent'))
			.reduce(function(memo, el) {
				if ($(el).val() && !_.isEqual($(el).val(), '') && !_.isEqual($(el).val(), '0')) {
					memo['modal_' + el.name.split('_')[1]] = $(el).val();
				}
				return memo;
			}, {}).value();
		var paging = _.has(window.location.obj, 'apage') ? '&page=' + window.location.obj.apage : '';
		var custom = '&type=3&rows=100'; // Số đủ lớn để lấy hết agents
		var url = (newUrl(window.location.hash, filter) + paging + custom).replace('#', '');
		requestAgents(tableId, url);
	};

	var requestTickets = function(formId, url, ignoreSearch, done) {
		if (!_.has(pagingObject, formId)) pagingObject[formId] = [];
		_AjaxData(url, 'GET', null, function(resp) {
			if (!resp.data || resp.code == 500 || (resp.data.length == 0 && !ignoreSearch)) {
				swal({
					title: 'Không tìm thấy kết quả với khoá tìm kiếm',
					text: 'Không tìm thấy kết quả với khoá tìm kiếm',
					type: "warning",
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Xác nhận!",
					closeOnConfirm: true
				}, function() {
					reverseSearchValue();
					reversePagingData(formId);
				});
			} else {
				window.lastUrl[window.lastUrl.length - 1] = url;
				loadData(formId, resp);
			}
			done && _.isFunction(done) && done(null, true);
		});
	};

	var requestAgents = function(tableId, url) {
		_AjaxData(url, 'GET', null, function(resp) {
			if (resp.code == 500 || (!resp.data && resp.data.length == 0)) {
				swal({
					title: 'Không tìm thấy kết quả với khoá tìm kiếm',
					text: 'Không tìm thấy kết quả với khoá tìm kiếm',
					type: "warning",
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Xác nhận!",
					closeOnConfirm: true
				});
			} else {
				loadDataAgent(tableId, resp);
			}
		});
	};

	var loadData = function(formId, resp) {
		var activeTDTemplate =
			'<a class="p-t-3 btn-flat-bg" ' +
			'href="#ticket-edit?ticketID={0}" ' +
			'data-toggle="tooltip" ' +
			'data-placement="top" data-original-title="Sửa Ticket">' +
			'<i class="zmdi zmdi-edit c-green f-17"></i></a>';

		var rows = '';
		resp.data.forEach(function(el, i) {
			if (_.isEmpty(el)) return;
			var template = '<tr>' +
				'<td>{0}</td>' +
				'<td>{1}</td>' +
				'<td>{2}</td>' +
				'<td>{3}</td>' +
				'<td>{4}</td>' +
				'<td>{5}</td>' +
				'<td>{6}</td>' +
				'<td>{7}</td>' +
				'<td>{8}</td>' +
				'</tr>';
			var status = '';
			switch (el.status) {
				case 0:
					status = ticketStatus.NOT_PROCESS;
					break;
				case 1:
					status = ticketStatus.PROCESSING;
					break;
			}

			var subject = el.idCampain.name ? el.idCampain.name : el.idService.name;
			var customerName = el.idCustomer ? el.idCustomer['field_ho_ten'] : '';
			if (!customerName) {
				customerName = (el.idCustomer && el.idCustomer['field_ten_khach_hang']) ? el.idCustomer['field_ten_khach_hang'] : '';
			}
			var customerPhone = el.idCustomer ? el.idCustomer['field_so_dien_thoai'] : '';
			rows += template.str(
				subject,
				status,
				customerName,
				customerPhone,
				moment(el.updated).format('HH:mm DD/MM/YYYY'),
				moment(el.deadline).format('HH:mm DD/MM/YYYY'),
				el.createBy ? el.createBy.displayName : '',
				el.idAgent ? el.idAgent.displayName : '',
				activeTDTemplate.str(el._id)
			);
		});

		setValueLastSearch();
		$('#' + formId + ' #ticket-body').html(rows);
		$('#' + formId + ' #ticket-paging').html(createPaging(resp.paging, 'zpaging'));
		$('#' + formId + ' #ticket-total').html('<b>' +
			'<span>Tổng</span>: ' +
			'<span class="bold c-red">' + resp.paging.totalResult + '</span>' +
			'</b>');
		$('#' + (formId == 'frm-inbound' ? 'modal-inbound' : 'modal-outbound') + ' #ticket-total').html('<b>' +
			'<span>Tổng</span>: ' +
			'<span class="bold c-red">' + resp.paging.totalResult + '</span>' +
			'</b>');

		window.MainContent.loadTooltip();
	};

	var loadDataAgent = function(tableId, resp) {
		var checkBoxTemplate =
			'<div class="checkbox m-0">' +
			'<input class="select-box select-box-cell" ' +
			'data-id="{0}" ' +
			'name="select" ' +
			'type="checkbox">' +
			'<i class="input-helper"></i></input></div>';
		var inputBoxTemplate = '<input type="number" class="form-control input-sm form-number" value="0" min= "0" />';

		var rows = '';
		resp.data.forEach(function(el, i) {
			if (_.isEmpty(el)) return;
			var template = '<tr>' +
				'<td>{0}</td>' +
				'<td class="text-center">{1}</td>' +
				'<td>{2}</td>' +
				'<td>{3}</td>' +
				'<td>{4}</td>' +
				'</tr>';

			rows += template.str(checkBoxTemplate.str(el._id),
				el.displayName,
				'',
				'',
				inputBoxTemplate
			);
		});

		$('#' + tableId + '-agent-body').html(rows);
		$('#' + tableId + '-agent-paging').html(createPaging(resp.paging, 'apaging'));
	};

	var setValueLastSearch = function() {
		_.each($('#tab-not-process-ticket').find('.searchColumn'), function(el) {
			var name = $(el).attr('name');
			notProcessLastSearch[name] = $(el).val();
		});

		_.each($('#tab-all-process-ticket').find('.searchColumn'), function(el) {
			var name = $(el).attr('name');
			allTicketLastSearch[name] = $(el).val();
		});
	};

	var reverseSearchValue = function() {
		_.each($('#tab-not-process-ticket').find('.searchColumn'), function(el) {
			var name = $(el).attr('name');
			var value = notProcessLastSearch[name] ? notProcessLastSearch[name] : '';
			$(el).val(value);
		});

		_.each($('#tab-all-process-ticket').find('.searchColumn'), function(el) {
			var name = $(el).attr('name');
			var value = allTicketLastSearch[name] ? allTicketLastSearch[name] : '';
			$(el).val(value);
		});


		$('.selectpicker').selectpicker('refresh');
	};

	var createPaging = function(paging, classPaging) {
		if (!paging) return '';
		var firstPage = paging.first ? '<li><a class="' + classPaging + '" data-link="' + paging.first + '">&laquo;</a></li>' : '';
		var prePage = paging.previous ? '<li><a class="' + classPaging + '" data-link="' + paging.previous + '">&lsaquo;</a></li>' : '';
		var pageNum = '';
		for (var i = 0; i < paging.range.length; i++) {
			if (paging.range[i] == paging.current) {
				pageNum += '<li class="active"><span>' + paging.range[i] + '</span></li>';
			} else {
				pageNum += '<li><a class="' + classPaging + '" data-link="' + paging.range[i] + '">' + paging.range[i] + '</a></li>';
			}
		}
		var pageNext = paging.next ? '<li><a class="' + classPaging + '" data-link="' + paging.next + '">&rsaquo;</a></li>' : '';
		var pageLast = paging.last ? '<li><a class="' + classPaging + '" data-link="' + paging.last + '">&raquo;</a></li>' : '';
		return '<div class="paginate text-center">' + '<ul class="pagination">' + firstPage + prePage + pageNum + pageNext + pageLast + '</ul></div>';
	};

	var reversePagingData = function(formId) {
		if (!_.has(lastPagingData, formId) || _.isEmpty(lastPagingData[formId])) return '';
		$('#' + formId + ' #ticket-paging').html(createPaging(lastPagingData[formId]));
	};

	return {
		init: function() {
			bindTextValue();
			bindClick();
			bindSubmit();
            /*async.waterfall([
             function(next) {
             queryFilter('frm-inbound', null, next);
             },
             function(next) {
             queryFilter('frm-outbound', null, next);
             }
             ], function() {

             });*/

			$('body').removeClass('modal-open');
			$('#inbound_company').trigger('change');
			$('#outbound_company').trigger('change');

			$('.multi-date-picker').datepicker({
				multidate: 2,
				multidateSeparator: ' - ',
				format: 'dd/mm/yyyy'
			});
			$('.datepicker-deadline').datepicker({
				format: "dd/mm/yyyy",
				todayHighlight: true
			});
		},
		uncut: function() {
			pagingObject = {};
			lastPagingData = {};

			$(document).off('click', '.sort');
			$(document).off('click', '#btn-search');
			$(document).off('keyup', '.filter');
			$(document).off('click', '.zpaging');
			$(document).off('click', '.apaging');
			$(document).off('change', '.inlineEditTicket');
			$(document).off('change', '.column-display');
		}
	};
}(jQuery);