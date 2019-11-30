/**
 * Created by sonth
 */
var DFT = function ($) {
    var lastSearch = {};
    var pagingObject = {};
    var lastPagingData = {};
    // Lấy dữ liệu lọc và truy vấn server
    var queryFilter = function (downloadExcel) {
        var filter = _.chain($('.searchColumn'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '') && !_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();
        _.has(window.location.obj, 'page') ? filter.page = window.location.obj.page:"";
        if (downloadExcel) {
            filter.download = true;
            downloadExcelReport(filter);
        } else {
            requestTickets(filter);
        }
    };

    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        var temp = [];
        _.each(_.allKeys(_config.MESSAGE.REPORT_CUSTOMER_OPINION), function (item) {
            var obj = $('.' + item);
            if (obj.prop('tagName')) {
                obj.html(_config.MESSAGE.REPORT_CUSTOMER_OPINION[item]);

                var index = obj.closest('th').index();
                temp[index] = '<li class="p-l-15 p-r-20"> ' +
                    '<div class="checkbox">' +
                    '<label> ' +
                    '<input type="checkbox" class="select-box column-display" data-index="' + index + '" checked>' +
                    '<i class="input-helper"></i>' +
                    '<a class="p-l-5 text-capitalize text-nowrap">' + _config.MESSAGE.REPORT_CUSTOMER_OPINION[item] + '</a>' +
                    '</label>' +
                    '</div>' +
                    '</li>';
            }
        });

        $('#showHideFields').append(temp.join(''));
    };
    // Cập nhật lại tình trạng và mức độ hài lòng khi thay đổi dữ liệu lọc
    var cascadeOption = function (obj) {
        if(_.isEmpty(obj)||!obj){
            _.each(['ticketReasonCategory','ticketReason','customerStatisfy'], function(o){
                $('#'+o).on('change', function () {
                    var query = {};
                    query[o] = $(this).val();
                    //query.cascade = $(this).val();
                    $.get('/report-customer-opinion', query, function (res) {
                        if(res.message){
                            cascading(res.message,obj);
                        }
                    });
                });
            });
        }else{
            _.each(['ticketReasonCategory','ticketReason','customerStatisfy'], function(o){
                var query = {};
                query[o] = obj[o];
                    $.get('/report-customer-opinion', query, function (res) {
                        if(res.message){
                            cascading(res.message,obj);
                        }
                    });
            });
        }

    };
    // Cập nhật lại tình trạng và mức độ hài lòng khi thay đổi dữ liệu lọc
    function cascading(obj,searchKey){
        _.each(_.keys(obj), function(keys){
            $('#'+keys).empty();
            $('#'+keys).append(_.Tags([{tag: 'option', attr: {value: ""}, content: "- Chọn -"}]));
            _.each(obj[keys], function(o){
                var attr = searchKey?searchKey[keys] === o._id ? {value: o._id,selected:true}:{value: o._id}:{value: o._id};
                $('#'+keys).append(_.Tags([{tag: 'option', attr: attr, content: o.name}]));
            });
            $('#'+keys).trigger("chosen:updated");
        })
    }
    var bindClick = function () {
        $('.multi-date-picker').datepicker({
            multidate: 2,
            multidateSeparator: ' - ',
            format: 'dd/mm/yyyy'
        });

        // reload lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        // Click tìm kiếm
        $(document).on('click', '#btn-search', function () {
            queryFilter(false);
        });
        // Nhấn phím Enter
        $(document).on('keyup', '.filter', function (e) {
            if (e.keyCode == 13) {
                queryFilter(false);
            }
        });
        // Chọn sang trang khác
        $(document).on('click', '.zpaging', function () {
            window.location.obj['page'] = $(this).attr('data-link');
            queryFilter(false);
        });

        // Thay đổi cột hiển thị trên giao diện
        $(document).on('change', '.column-display', function (e) {
            var dataIndex = $(this).attr('data-index');
            var checked = $(this).is(":checked");

            _.each($('th'), function (el) {
                var index = $(el).index();

                if (index == dataIndex) {
                    if (checked) {
                        $(el).show();
                    } else {
                        $(el).hide();
                    }
                }
            });

            _.each($('td'), function (el) {
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

        // Down file báo cáo
        $(document).on('click', '#download-excel', function () {
            queryFilter(true);
        });

        // Chạy file ghi âm
        $(document).on('click', '.playAudio', function(){
            var $this = $(this);
            var audio = $this.closest('td').find('audio')[0];

            audio.onended = function(){
                $(this).closest('td').find('.zmdi-play').show();
                $(this).closest('td').find('.zmdi-pause').hide();
            };

            _.each($('audio'), function(el){
                var __audio = $(el)[0];
                if (__audio != audio && !__audio.paused){
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

    // Down file báo cáo
    var downloadExcelReport = function(obj){
        obj.totalResult = parseInt($('#ticket-total.bold.c-red').text());
        $('.page-loader').show();
        $.post('/report-customer-opinion', obj, function( resp ) {
            $('.page-loader').hide();

            if (resp.code == 500){
                swal({
                    title: 'Đã có lỗi xảy ra',
                    text: resp.message,
                    type: "error"
                });
            }else{
				downloadFromUrl(window.location.origin + resp.message);
            }
        });
    };

    // Truy vấn dữ liệu ticket
    var requestTickets = function (obj) {
        $.post('/report-customer-opinion', obj, function (resp) {
            if (resp.code == 500 || (resp.data.length == 0)) {
                swal({
                    title: 'Không tìm thấy kết quả với khoá tìm kiếm',
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Xác nhận!",
                    closeOnConfirm: true
                }, function () {
                    reverseSearchValue();
                });
            } else {
                loadData(resp);
            }
        });
    };

    // Hiển thị dữ liệu đã lọc
    var setValueLastSearch = function () {
        _.each($(' .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = $(el).val();
            lastSearch[name] = value;
        });
    };

    var reverseSearchValue = function () {
        cascadeOption(lastSearch);
        _.each($('.searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = lastSearch[name] ? lastSearch[name] : '';
            $(el).val(value);
        });

        $('.selectpicker').selectpicker('refresh');
        $('.tag-select').trigger("chosen:updated");
    };

    // Hiển thị dữ liệu phân trang
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

    // Hiển thị dữ liệu báo cáo
    var loadData = function (resp) {
        var template = '<tr>' +
            '<td title="{0}">{0}</td>' +
            '<td title="{1}">{1}</td>' +
            '<td title="{2}">{2}</td>' +
            '<td title="{3}">{3}</td>' +
            '<td title="{4}">{4}</td>' +
            '<td title="{5}">{5}</td>' +
            '<td title="{6}">{6}</td>' +
            '<td class="text-center" title="{7}">{7}</td>' +
            '<td title="{8}">{8}</td>' +
            '<td title="{9}">{9}</td>' +
            '<td class="text-center f-10">{10}</td>' +
            '</tr>';

        var rows = '';
        resp.data.forEach(function (el) {
            var buttonAction = el.recordPath?'<audio id="myAudio"' +
                '<source src="'+recordPath+ el.recordPath +'" type="audio/mp4">' +
                    //'<source src="'+ el.recordPath +'" type="audio/ogg; codecs=vorbis">' +
                'Your user agent does not support the HTML5 Audio element.'+
                '</audio>' +
                '<button class="btn btn-default playAudio" type="button">' +
                '<i class="zmdi zmdi-play f-25" ></i>' +
                '<i class="zmdi zmdi-pause f-25" style="display: none;"></i>' +
                '</button>' +
                '<button class="btn btn-default m-l-10" type="button">' +
                '<a href="'+recordPath+el.recordPath +'" download><i class="zmdi zmdi-download zmdi-hc-fw download-audio f-25" data-url="'+recordPath+el.recordPath +'"></i></a>' +
                '</button>':"";

            rows += template.str(
                el.companyId.name,
                el.ticketReasonCategory,
                el.ticketReason,
                el.ticketSubreason,
                el.customerStatisfyStage,
                el.customerStatisfy,
                el.status,
                hms(el.callDuration/1000),
                moment(el.updated).format('HH:mm DD/MM/YYYY'),
                el.service?"Gọi vào":"Gọi ra",
                el.recordPath ? buttonAction : ''
            );
        });
        setValueLastSearch();
        $('#ticket-body').html(rows);
        $('#ticket-paging').html(createPaging(resp.message));
        $('#ticket-total').html('<b>' +
            '<span class="TXT_TOTAL"></span>: ' +
            '<span class="bold c-red" id="ticket-total">' + resp.message.totalResult + '</span>' +
            '</b>');
        $('.TXT_TOTAL').html(_config.MESSAGE.REPORT_INBOUND_TICKETS.TXT_TOTAL);
        $('.selectpicker').selectpicker('refresh');
        $('.tag-select').trigger("chosen:updated");
		window.MainContent.loadTooltip();
    };
    function pad(num) {
        return ("0" + num).slice(-2);
    }
    // Chuyển milliseconds về 'hh:mm:ss'
    function hms(secs) {
        if(isNaN(secs)) return '00:00:00';
        var sec = Math.ceil(secs);
        var minutes = Math.floor(sec / 60);
        sec = sec % 60;
        var hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        return hours + ":" + pad(minutes) + ":" + pad(sec);
    }
    var updateView = function () {
        // resize chosen picker
        $(".chosen-container").each(function () {
            $(this).attr('style', 'width: 100%');
        });
    };

    return {
        init: function () {
            bindTextValue();
            updateView();
            setValueLastSearch();
            cascadeOption();
            bindClick();

            //queryFilter('frm-report-campaign-ticket', true);
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
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
            delete _socket.$events['responseReportOutboundTicketPagingData'];
        }
    };
}(jQuery);