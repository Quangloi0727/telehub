/**
 * 18.Mar.2017 hoangdv
 * @type {{init, uncut}}
 */
var DFT = function($) {

	// Bắt sự kiện click
	var bindClick = function() {

	};

	// Gắn sự kiện submit
	var bindSubmit = function() {
		// Xác nhận tạo mới subreason
		$('#ticket-import-by-phone').validationEngine('attach', {
			validateNonVisibleFields: true, autoPositionUpdate: true,
			onValidationComplete: function(form, status) {
				if (status) {
					_AjaxData('/ticket-import-by-phone', 'POST', form.getData(), function(resp) {
						if (_.isEqual(resp.code, 200)) {
							window.location.hash = 'ticket-edit?ticketID=' + resp.ticketId;
						} else {
							swal({title: 'Thông báo !', text: resp.message});
						}
					});
				}
			}
		});
	};

	return {
		init: function() {
			bindClick();
			bindSubmit();
		},
		uncut: function() {
			$('#ticket-import-by-phone').validationEngine('detach');
		}
	};
}(jQuery);