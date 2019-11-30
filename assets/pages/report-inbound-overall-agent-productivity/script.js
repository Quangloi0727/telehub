var DFT = function ($) {
	var getFilter = function () {
		var filter = _.chain($('.input'))
			.reduce(function (memo, el) {
				if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
				return memo;
			}, {}).value();
		window.location.hash = newUrl(window.location.hash, filter);
	};
	var bindClick = function () {
		$(document).on('click', '.zmdi-refresh', function(){
			window.location.hash = window.location.hash.split("?")[0];
		});
		$('a.btn.bgm-blue.uppercase.c-white').click(function () {
			getFilter();
		});
		$('#exportexcel').on('click', function (event) {
			var todaysDate = moment().format('DD-MM-YYYY');
			var exportexcel = tableToExcel('exceldata', 'My Worksheet');
			$(this).attr('download', todaysDate + '_BaoCaoNangSuatTongQuatDTVGoiVao.xls')
			$(this).attr('href', exportexcel);
		})
		$("#startDate").on("dp.change", function (e) {
			$('#endDate').data("DateTimePicker").minDate(e.date);
		});
		$("#endDate").on("dp.change", function (e) {
			$('#startDate').data("DateTimePicker").maxDate(e.date);
		});
	};
	var bindSubmit = function () {
	};
	var bindTextValue = function () {
		_.each(_.allKeys(_config.MESSAGE.REPORT_OVERALL_AGENT_PRODUCTIVITY), function (item) {
			$('.' + item).html(_config.MESSAGE.REPORT_OVERALL_AGENT_PRODUCTIVITY[item]);
		});
	};
	var cascadeOption = function () {
		$('select[name="idCompany"]').on('change', function () {
			$.get('/report-inbound-overall-agent-productivity', {idParent: $(this).val()}, function (res) {
				$('select[name="agentId"]').empty();
				_.each(res, function(o){
					$('select[name="agentId"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.displayName}]));
				});
				$('select[name="agentId"]').selectpicker('refresh');
			});
		});
	};
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
			if (_.has(window.location.obj, 'idCompany')) $('select[name="idCompany"]').val(window.location.obj.idCompany).selectpicker('refresh');
			if (_.has(window.location.obj, 'agentId[]')){
				var item = decodeURI(window.location).split("?")[1].split("&");
				var array = [];
				_.each(item, function(o){
					if(o.split("=")[0]=="agentId[]"){
						array.push(o.split("=")[1]);
					}
				})
				$('select[name="agentId"]').selectpicker("val", array).selectpicker('refresh');
			};
			bindClick();
			bindSubmit();
			bindTextValue();
			cascadeOption();
		},
		uncut: function () {
			$(document).off('change', 'select[name="idCompany"]');
			$(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
			$(document).off('click', '#exportexcel');
			$(document).off('click', '.zmdi-refresh');
		}
	};
}(jQuery);