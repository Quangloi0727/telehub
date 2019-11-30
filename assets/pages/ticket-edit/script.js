var DFT = function($) {
	var _oldTicketLeft = $('#tab-old-ticket .left-side');
	var _oldTicketRight = $('#tab-old-ticket .right-side');
	var detailTicketReasonCategory = {};
	var detailTicket = {};
	var _curCallLabel = null;

	var bindClick = function() {
		$(document).on('click', '.btn-detail', function() {
			$('.nav-tabs a[href="#profile-v"]').tab('show');
			var button = $(this);
			var dataId = $(this).attr('data-id');
			$('#save-ticket-detail-crm').attr('data-id', dataId);
			_oldTicketLeft.fadeOut(function() {
				_Ajax('ticket-edit', 'POST', [{_id: button.attr('data-id')}], function(resp) {
					if (resp.code == 500) return swal({title: 'Đã có lỗi xảy ra', text: resp.message});
					_oldTicketRight.fadeIn();
					var formId = '#frm-ticket-detail-crm ';
					var surveyFormId = '#detail-survey-form ';

					detailTicket = resp.message.ticket;
					detailTicketReasonCategory = resp.message.info.ticketReasonCategory;

					$(formId + '#title').html(resp.message.serviceName);
					$(formId + '#ticket-detail-properties').html(zoka.showTicketInfo(
						resp.message.ticket,
						resp.message.info.ticketReasonCategory,
						resp.message.info.assign,
						resp.message.info.statisfy
					));

					$(formId + '#ticket-history-list').html(zoka
						.showTicketListBody(
							zoka.validObject(resp.message, 'info', 'ticketHistory', 'data'),
							false
						));

					$(formId + '.paging-list').html(zoka
						.createPaging(
							zoka.validObject(resp.message, 'info', 'ticketHistory', 'paging')
						));


					$(surveyFormId).html(zoka
						.createSurvey(resp.message.info.survey,
							resp.message.info.surveyResult,
							'detail-survey-form',
							resp.message.ticket
						));

					if (!resp.message.info.isEdit) {
						disableEditTicket(formId);
						disableSurveyEdit(surveyFormId);
					}

					refreshComponent();
				});
			});
		});

		$(document).on('click', '.btn-save', function() {
			$($(this).attr('data-target')).trigger('submit');
		});

		$(document).on('click', '.zpaging', function() {
			var parent = $(this).closest('.list-view');
			var queryLink = $(this).attr('data-link');

			_Ajax(queryLink, 'GET', {}, function(resp) {
				if (resp.code == 200) {
					if (queryLink.indexOf('getCallLogs') >= 0) {
						var callLogsId = '#edit-ticket-callLogs ';
						$(callLogsId + '.ticket-call-logs').html(zoka.showCallLogs(resp.message.data));
						$(callLogsId + '.paging-list').html(zoka.createPaging(resp.message.paging));
					} else {
						var ticketBody = zoka.showTicketListBody(resp.message.data, parent.hasClass('view-detail'));
						var ticketPage = zoka.createPaging(resp.message.paging);
						parent.find('#ticket-history-list').html(ticketBody);
						parent.find('.paging-list').html(ticketPage);
					}
				} else {
					swal({
						title: 'Đã có lỗi xảy ra',
						text: JSON.stringify(resp.message),
						type: "error",
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Quay lại!",
						closeOnConfirm: true
					});
				}
			});
		});

		$(document).on('click', '#cancelInput', function() {
			window.history.back();
		});

		$(document).on('click', '#tab-old-ticket .right-side .btn-back', function() {
			$(MainContent.prefix('#save-ticket-detail-crm')).attr('data-id', '');
			_oldTicketRight.fadeOut(function() {
				_oldTicketLeft.fadeIn();
			});
		});

		$(document).on('click', '#searchTicket', function() {
			var parent = $(this).closest('.left-side');
			var searchObj = '/ticket-edit?search=1&idCustomer=' + $(this).attr('data-id') + '&tId=' + $(this).attr('data-ticket-id');
			$('#searchRelateTicket .searchColumn').each(function() {
				var obj = $(this);
				if (obj.attr('name') && !_.isEmpty(obj.val())) {
					searchObj += ('&' + obj.attr('name') + '=' + obj.val());
				}
			});
			_Ajax(searchObj, 'GET', {}, function(resp) {
				if (resp.code == 200) {
					var str = zoka.showTicketListBody(resp.message.data, true);
					parent.find('#ticket-history-list').html(str);
					parent.find('.paging-list').html(zoka.createPaging(resp.message.paging));
				} else {
					swal({
						title: 'Đã có lỗi xảy ra',
						text: JSON.stringify(resp.message),
						type: "error",
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Quay lại!",
						closeOnConfirm: true
					});
				}
			});
		});

		$(document).on('click', '#refreshPage', function() {
			_.LoadPage(window.location.hash);
		});

		$(document).on('click', '.clickToCall', function() {
			var callNumber = $(this).attr('data-phone-number') ? $(this).attr('data-phone-number') : $(this).prev('input').val();
			if (callNumber) {
				if (!_curCallLabel) {
					_curCallLabel = $(this).parent().parent().parent().children('label');
					if (!_curCallLabel.attr("data-name")) {
						_curCallLabel.attr("data-name", _curCallLabel.html());
					}
				}
				// 21.Mar.2017 hoangdv Thực hiện gọi ra trên ticket gọi vào, hỏi có tạo ticket hay không?
				if (currentTicket && currentTicket.idService && !currentTicket.idCampain) {
					// là ticket gọi vào - confirm tạo ticket
					swal({
						title: "Thông báo",
						text: "Bạn đang gọi ra trên ticket gọi vào!",
						type: "warning",
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Tạo ticket gọi ra!",
						cancelButtonText: "Thực hiện gọi ra!",
						closeOnConfirm: true,
						closeOnCancel: true
					}, function(isConfirm) {
						if (isConfirm) {
							createTicketByPhone(callNumber);
						} else {
							_socket.emit('MakeCallReq', {
								_id: user,
								sid: _socket.socket.sessionid,
								number: callNumber,
								ticket: currentTicket
							});
						}
					});
				} else {
					_socket.emit('MakeCallReq', {
						_id: user,
						sid: _socket.socket.sessionid,
						number: callNumber,
						ticket: currentTicket
					});
				}
			}
		});

		/**
		 * Sự kiện click yêu cầu tạo ticket theo số điện thoại ở ô input
		 */
		$(document).on('click', '.clickToCreateTicket', function() {
			var phoneNumber = $(this).attr('data-phone-number') ? $(this).attr('data-phone-number') : $(this).prev('input').val();
			if (!phoneNumber) {
				phoneNumber = $(this).prev('input').val();
			}
			createTicketByPhone(phoneNumber);
		});

		/**
		 * 22.Mar.2017 hoangdv Mở cửa newtab thực hiện tạo ticket dựa trên số điện thoại
		 * Nếu không có số điện thoại -> mở tab mới với thông tin số điện thoại trống
		 * @param phoneNumber Số điện thoại
		 */
		function createTicketByPhone(phoneNumber) {
			var url = '/#ticket-import-by-phone';
			if (phoneNumber) {
				url += '?phone=' + phoneNumber;
			}
			var win = window.open(url, '_blank');
			win.focus();
		}

		$(document).on('change', '.ticketReasonCategory', function() {
			setTicketReason($(this).val(), $(this).closest('form').attr('id'));
			//var changeValue = $(this).val();
			//var parentForm = $(this).closest('form').attr('id');
			//var trc = {}, childTicket = {};
			//if (_.isEqual(parentForm, 'frm-edit-ticket')) {
			//    trc = ticketReasonCategory;
			//    childTicket = currentTicket;
			//} else {
			//    trc = detailTicketReasonCategory;
			//    childTicket = detailTicket;
			//}
			//
			//var htmlChange = _.Tags(zoka.createTicketSubReasonRows(childTicket, trc, changeValue));
			//$('#' + parentForm + ' .ticketSubreason').html(htmlChange).trigger('chosen:updated');
		});

		$(document).on('click', '.btn-next', function() {
			_isDone = false;
			_.each($('.survey-tab'), function(el) {
				if ($(el).hasClass('active') && !_isDone) {
					_isDone = true;
					var nextQuestion = $(el).attr('data-next-question');
					if (nextQuestion) {
						$('.' + nextQuestion + ' a').tab('show');
						if ($('.survey-tab.' + nextQuestion).attr('data-next-question')) {
							$('.btn-next').show();
						} else {
							$('.btn-next').hide();
						}
					}
				}
			});
		});

		$(document).on('click', '.survey-tab', function() {
			var self = $(this);
			if (self.attr('data-next-question')) {
				$('.btn-next').show();
			} else {
				$('.btn-next').hide();
			}
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
	};

	var setTicketReason = function(changeValue, parentForm) {
		var trc = {}, childTicket = {};
		if (_.isEqual(parentForm, 'frm-edit-ticket')) {
			trc = ticketReasonCategory;
			childTicket = currentTicket;
		} else {
			trc = detailTicketReasonCategory;
			childTicket = detailTicket;
		}
		var htmlChange = _.Tags(zoka.createTicketSubReasonRows(childTicket, trc, changeValue));
		$('#' + parentForm + ' .ticketSubreason').html(htmlChange).trigger('chosen:updated');
	};

	var bindSubmit = function() {
		$('#frm-update-customer').validationEngine('attach', {
			validateNonVisibleFields: true, autoPositionUpdate: true,
			validationEventTrigger: 'keyup',
			onValidationComplete: function(form, status) {
				if (status) {
					_AjaxData('/ticket-edit/customer-' + $('#save-customer').attr('data-id'), 'PUT', $(form).getData(), function(resp) {
						if (resp.code == 200) {
							swal({
								title: 'Cập nhật thành công',
								text: '',
								type: "success",
								confirmButtonColor: "#DD6B55",
								confirmButtonText: "Xác nhận",
								closeOnConfirm: true
							}, function() {
								$(".clickToCall").each(function() {
									var value = $(this).prev('input').val();
									$(this).attr('data-phone-number', value);
								})
							});
						} else {
							swal({
								title: 'Đã có lỗi xảy ra',
								text: resp.message,
								type: "error",
								confirmButtonColor: "#DD6B55",
								confirmButtonText: "Quay lại!",
								closeOnConfirm: true
							});
						}
					});
				}
			}
		});

		$('#frm-edit-ticket').validationEngine('attach', {
			validateNonVisibleFields: true, autoPositionUpdate: true,
			validationEventTrigger: 'keyup',
			onValidationComplete: function(form, status) {
				//Albert: if 'Trạng Thái' is 'Đang Xử Lý' => 'Ngày Hẹn Xử Lý' !== null/""
				if ($('#status').val() == 1 && (($('#deadline').val().length == 0)||($('#deadline').val()==""))) {
					return swal({
						title: 'Đã có lỗi xảy ra',
						text: 'Thiếu Ngày Hẹn Xử Lý',
						type: "error",
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Quay lại!",
						closeOnConfirm: true
					});
				}

				// ALbert: 'Ngày hẹn xử lý' >= 'Current date' nếu trạng thái là 'Đang xử lý'
				if (($('#status').val() == 1) && ($('#deadline').val().length != 0)) {
					var currentDate = new Date();
					var deadline = $('#deadline').val();

					var dateParts = deadline.split(' ')[1].split("/");
					var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

					if ((currentDate.getTime() > new Date(dateObject.toString()).getTime()+60*60*1000*23)) {
						return swal({
							title: 'Đã có lỗi xảy ra',
							text: 'Ngày hẹn xử lý không được nhỏ hơn ngày hiện tại',
							type: "error",
							confirmButtonColor: "#DD6B55",
							confirmButtonText: "Quay lại!",
							closeOnConfirm: true
						});
					}

				}

				if (status) {
					_AjaxData('/ticket-edit/editTicket-' + $('#save-new-ticket').attr('data-id'), 'PUT', $(form).getData(), function(resp) {

						if (resp.code == 200) {
							swal({
								title: 'Cập nhật thành công',
								text: '',
								type: "success",
								confirmButtonColor: "#DD6B55",
								confirmButtonText: "Xác nhận",
								closeOnConfirm: true
							});
							$('#tab-edit-ticket').find('#ticket-history-list').html(zoka.showTicketListBody(resp.message.data, false));
							$('#tab-edit-ticket').find('.paging-list').html(zoka.createPaging(resp.message.paging));
						} else {
							swal({
								title: 'Thiếu Ngày hẹn xử lý',
								text: resp.message,
								type: "error",
								confirmButtonColor: "#DD6B55",
								confirmButtonText: "Quay lại!",
								closeOnConfirm: true
							});
						}
					});
				}
			}
		});

		$('#frm-ticket-detail-crm').validationEngine('attach', {
			validateNonVisibleFields: true, autoPositionUpdate: true,
			validationEventTrigger: 'keyup',
			onValidationComplete: function(form, status) {
				if (status) {
					_AjaxData('/ticket-edit/editTicket-' + $('#save-ticket-detail-crm').attr('data-id'), 'PUT', $(form).getData(), function(resp) {
						if (resp.code == 200) {
							swal({
								title: 'Cập nhật thành công',
								text: '',
								type: "success",
								confirmButtonColor: "#DD6B55",
								confirmButtonText: "Xác nhận",
								closeOnConfirm: true
							});
							$('#ticket-detail-history').find('#ticket-history-list').html(zoka.showTicketListBody(resp.message.data, false));
							$('#ticket-detail-history').find('.paging-list').html(zoka.createPaging(resp.message.paging));
						} else {
							swal({
								title: 'Đã có lỗi xảy ra',
								text: resp.message,
								type: "error",
								confirmButtonColor: "#DD6B55",
								confirmButtonText: "Quay lại!",
								closeOnConfirm: true
							});
						}
					});
				}
			}
		});

		$('#current-survey-form').validationEngine('attach', {
			validateNonVisibleFields: true, autoPositionUpdate: true,
			validationEventTrigger: 'keyup',
			onValidationComplete: function(form, status) {
				if (status) {
					var dataLink = $('#current-survey-form #save-survey').attr('data-link');
					_AjaxData('/ticket-edit/survey-' + dataLink, 'PUT', $(form).getData(), function(resp) {
						if (resp.code == 200) {
							swal({title: 'Lưu thông tin thành công', text: resp.message});
						} else {
							swal({title: 'Đã có lỗi xảy ra', text: resp.message});
						}
					});
				}
			}
		});

		$('#detail-survey-form').validationEngine('attach', {
			validateNonVisibleFields: true, autoPositionUpdate: true,
			onValidationComplete: function(form, status) {
				if (status) {
					var dataLink = $('#detail-survey-form #save-survey').attr('data-link');
					_AjaxData('/ticket-edit/survey-' + dataLink, 'PUT', $(form).getData(), function(resp) {
						if (resp.code == 200) {
							swal({title: 'Lưu thông tin thành công', text: resp.message});
						} else {
							swal({title: 'Đã có lỗi xảy ra', text: resp.message});
						}
					});
				}
			}
		});

		$('#frm-update-order').validationEngine('attach', {
			validateNonVisibleFields: true,
			autoPositionUpdate: true,
			validationEventTrigger: 'keyup',
			onValidationComplete: function(form, status) {
				if (status) {
					_AjaxData('/ticket-edit/order', 'PUT', $(form).getData(), function(resp) {
						if (resp.code == 200) {
							swal({title: 'Lưu thông tin thành công', text: resp.message});
						} else {
							swal({title: 'Đã có lỗi xảy ra', text: resp.message});
						}
					});
				}
			}
		})
	};

	var bindValue = function() {
		_.each(_.allKeys(_config.MESSAGE.CUSTOMER_INFO), function(item) {
			$('.' + item).html(_config.MESSAGE.CUSTOMER_INFO[item]);
		});
	};

	var showTicket = function() {
		var currentTicketId = '#frm-edit-ticket ';
		$(currentTicketId + '#ticket-info').html(zoka.showTicketInfo(currentTicket, ticketReasonCategory, assign, statisfy));
		setTicketReason(currentTicket.ticketReasonCategory, 'frm-edit-ticket');
		$('.selectpicker').selectpicker('refresh');
		$(currentTicketId + '#edit-ticket-history .ticket-history').html(zoka.showTicketList(currentTicket, ticketHistory.data, false));
		$(currentTicketId + '#edit-ticket-history .paging-list').html(zoka.createPaging(ticketHistory.paging));
		$('#current-survey-form').html(zoka.createSurvey(survey, surveyResult, 'current-survey-form', currentTicket));

		if (!isEdit) {
			disableEditTicket(currentTicketId);
			disableSurveyEdit('#current-survey-form');
		}

		var ticketHistoryId = '#edit-ticket-history ';
		$(ticketHistoryId + '.ticket-history').html(zoka.showTicketList(currentTicket, ticketHistory.data, false));
		$(ticketHistoryId + '.paging-list').html(zoka.createPaging(ticketHistory.paging));

		var callLogsId = '#edit-ticket-callLogs ';
		$(callLogsId + '.ticket-call-logs').html(zoka.showCallLogs(callLogs.data));
		$(callLogsId + '.paging-list').html(zoka.createPaging(callLogs.paging));

		var relateTicketId = '#tab-old-ticket ';
		$(relateTicketId + '#ticket-info').html(zoka.showTicketList(currentTicket, tickets.data, true));
		$(relateTicketId + '.paging-list').html(zoka.createPaging(tickets.paging));
		$(relateTicketId + '#ticket-detail-properties').html(zoka.showTicketInfo(null, ticketReasonCategory, null));
		$(relateTicketId + '#ticket-list').html(zoka.showTicketList(null, null, false));

		_.each($('.survey-tab'), function(el) {
			if ($(el).hasClass('active')) {
				if ($(el).attr('data-next-question')) {
					$('.btn-next').show();
				} else {
					$('.btn-next').hide();
				}
			}
		});

		refreshComponent();
	};

	var disableEditTicket = function(formId) {
		$(formId + '*').attr('readonly', true);
		$(formId + '.selectpicker').attr('disabled', true).selectpicker('refresh');
		$(formId + '.tag-select').attr('disabled', true).trigger('chosen:updated');
		$(formId + 'button').attr('disabled', true);
	};

	var disableSurveyEdit = function(formId) {
		$(formId + '.tab-content *').attr('readonly', true);
		$(formId + ' #save-survey').attr('disabled', true);
	};

	var refreshComponent = function() {
		bindValue();

		$('.selectpicker').selectpicker();
		$('.tag-select').chosen();
		$('.chosen-container').css('width', '100%');
		$('.date-time-picker').datetimepicker();
	};

	var bindSocket = function(client) {
		client.on('ChangeAgentCallStatus', function(data) {
			var status = Number(data.callStatusType);
			if (_curCallLabel) {
				var text = _curCallLabel.attr("data-name") + "(" + getCallStatus(status) + ")";
				_curCallLabel.html(text.toLocaleLowerCase());

				if (status == 5) {
					_curCallLabel = null;
				}
				;
			}
			;
		});
	};

	var getCallStatus = function(status) {
		switch (status) {
			case -1:
				return 'CALLING';
				break;
			case 0:
				return 'UNKOWN';
				break;
			case 1:
				return 'PROCESSING';
				break;
			case 2:
				return 'CALLING';
				break;
			case 3:
				return 'RINGING';
				break;
			case 4:
				return 'CONNECTED';
				break;
			case 5:
				return 'DISCONNECTED';
				break;
			case 6:
				return 'HOLD';
				break;
			case 7:
				return 'RESUME';
				break;
			case 8:
				return 'TRANSFER';
				break;
			case 9:
				return 'COUNT';
				break;
		}
	};

	return {
		init: function() {
			var closest = $('.selectpicker').closest('div');
			closest.addClass('validate-select-picker');
			closest.css('position', 'relative');
			$('.datepicker').datepicker({
				format: 'HH:mm DD/MM/YYYY',
			});

			$('#edit_field_order_card').attr('autocomplete', 'off').typeahead(
				{
					source: orderCards,
					hint: true,
					highlight: true, /* Enable substring highlighting */
					minLength: 1 /* Specify minimum characters required for showing suggestions */
				}
			);

			survey = JSON.parse(survey);
			surveyResult = JSON.parse(surveyResult);

			bindClick();
			bindSubmit();
			bindValue();
			bindSocket(_socket);
			showTicket();

			//zoka.ticketReasonEvent($, '#frm-edit-ticket', '#ticketReasonCategory', '#ticketSubreason', '.tReason', {});
			//$('.testthoima').html('<select class="select-picker form-control" id="123conma">' +
			//    '<option>123123123</option>' +
			//    '<option>123123123</option>' +
			//    '<option>123123123</option>' +
			//    '<option>123123123</option>' +
			//    '<option>123123123</option>' +
			//    '</select>');
			//
			//$('#123conma').selectpicker()
		},
		uncut: function() {
			$(document).off('click', '.btn-detail');
			$(document).off('click', '.btn-save');
			$(document).off('click', '.zpaging');
			$(document).off('click', '#tab-old-ticket .right-side .btn-back');
			$(document).off('click', '#searchTicket');
			$(document).off('click', '#refreshPage');
			$(document).off('click', '#cancelInput');
			$(document).off('click', '.clickToCall');
			$(document).off('click', '.btn-next');
			$(document).off('click', '.survey-tab');

			$('#frm-update-customer').validationEngine('detach');
			$('#frm-edit-ticket').validationEngine('detach');
			$('#frm-ticket-detail-crm').validationEngine('detach');
			$('#current-survey-form').validationEngine('detach');
			$('#detail-survey-form').validationEngine('detach');
			$('#frm-update-order').validationEngine('detach');
		}
	};
}(jQuery);