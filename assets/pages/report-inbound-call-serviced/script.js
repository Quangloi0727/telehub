var DFT = function ($) {
    var lastSearch = {},
        pagingObject = {},
        lastPagingData = {};

    function bindSocket(client) {
        // lấy dữ liệu phân trang từ server
        client.on('responseReportInboundCallServicedPagingData', function (resp) {
            var index = _.indexOf(pagingObject[resp.formId], Number(resp.dt));
            if (_.has(pagingObject, resp.formId) && index >= 0) {
                $('.card .z-panel').removeClass('show-loading');
                configChart(resp);

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
                    $('.TXT_TOTAL').html(_config.MESSAGE.REPORT_INBOUND_TICKETS.TXT_TOTAL);
                    $('#download-excel').show();
                } else {
                    $('#' + resp.formId + ' #ticket-paging').html('');
                    $('#ticket-total').html('');
                    $('#download-excel').hide();
                }
            }
        });
    };

    // Hiển thị tên cột theo file config
    function bindTextValue() {
        var temp = [];
        _.each(_.allKeys(_config.MESSAGE.REPORT_INBOUND_CALL_SERVICES), function (item) {
            var obj = $('.' + item);
            obj.html(_config.MESSAGE.REPORT_INBOUND_CALL_SERVICES[item]);

            if (obj.prop('tagName') && obj.parents('#frm-report-inbound-call-serviced').length) {
                var index = obj.closest('th').index();
                temp[index] = '<li class="p-l-15 p-r-20"> ' +
                    '<div class="checkbox">' +
                    '<label> ' +
                    '<input type="checkbox" class="select-box column-display" data-index="' + index + '" checked>' +
                    '<i class="input-helper"></i>' +
                    '<a class="p-l-5 text-capitalize text-nowrap">' + _config.MESSAGE.REPORT_INBOUND_CALL_SERVICES[item] + '</a>' +
                    '</label>' +
                    '</div>' +
                    '</li>';
            }
        });

        $('#showHideFields').append(temp.join(''));
    };

    function bindClick() {
        // Làm mới trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });
        // Click tìm kiếm
        $(document).on('click', '#btn-search', function () {
            var formId = $(this).closest('form').attr('id');
            queryFilter(formId);
        });
        // Chuyển trang
        $(document).on('click', '.zpaging', function () {
            var formId = $(this).closest('form').attr('id');
            window.location.obj['page'] = $(this).attr('data-link');
            queryFilter(formId);
        });
        // Nhấn phím enter
        $(document).on('keyup', '.filter', function (e) {
            if (e.keyCode == 13) {
                var formId = $(this).closest('form').attr('id');
                queryFilter(formId);
            }
        });
        // Thay đổi hiển thị các cột trên giao diện
        $(document).on('change', '.column-display', function (e) {
            var dataIndex = $(this).attr('data-index');
            if (dataIndex === undefined) return;

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
        // xuất file báo cáo
        $(document).on('click', '#download-excel', function () {
            queryFilter('frm-report-inbound-call-serviced',
                true,
                true,
                lastPagingData['frm-report-inbound-call-serviced'].totalResult
            );
        });
        // Tìm kiếm
        $(document).on('click', '.searchDynamicDuration', function () {
            var value = $(this).closest('.input-group').find('input[type="text"]').val();
            searchDynamicInput(0, value);
        });
        // Tìm kiếm
        $(document).on('click', '.searchDynamicWaiting', function () {
            var value = $(this).closest('.input-group').find('input[type="text"]').val();
            searchDynamicInput(1, value);
        });
        // Tìm kiếm
        $(document).on('click', '.searchSLA', function () {
            var services = $(this).closest('form').find('#services').val();
            var inputValue = $(this).closest('form').find('#inputValue').val();

            if (inputValue == '' || inputValue == 0 || services == '') return false;

            //var obj = [{service: services}, {value: inputValue}];
            _Ajax(window.location.hash.replace('#', '') + '/temp?service=' + services + "&value=" + inputValue,
                'GET', [],
                function (resp) {
                });
        });
    }
    // Tìm kiếm
    function searchDynamicInput(type, value) {
        var arr = value.split('-');

        if (type !== 2
            && arr.length !== 2
            || !$.isNumeric(arr[0])
            || !$.isNumeric(arr[1])
            || parseInt(arr[1]) <= parseInt(arr[0])) {

            swal("Không đúng định dạng tìm kiếm",
                "Chuỗi tìm kiếm phải có dạng [số thứ nhất] - [số thứ hai]\n" +
                "Số thứ hai phải lớn hơn số thứ nhất",
                "error")
        } else {
            var obj = [{start: arr[0]}, {end: arr[1]}, {type: type}];
            var paging = _.has(window.location.obj, 'page') ? window.location.obj.page : 1;
            obj.push({page: paging});

            _.each($('.searchColumn'), function (el) {
                if (!_.isEqual($(el).val(), '')) {
                    var temp = {};
                    temp[el.name] = $(el).val();
                    obj.push(temp);
                }
            });

            var parent = null;
            if (type == 0) {
                parent = $('#dynamicDurationSearchPlaceHolder');
            } else {
                parent = $('#dynamicWaitSearchPlaceHolder');
            }

            _Ajax(window.location.hash.replace('#', '') + '/temp', 'PUT', obj, function (resp) {
                if (resp.code === 500) {
                    parent.css('display', 'none');
                    swal("Đã có lỗi xảy ra", resp.message, "error");
                } else {
                    var percent = parseFloat((resp.message * 100 / lastPagingData['frm-report-inbound-call-serviced'].totalResult).toFixed(2));

                    parent.css('display', '');
                    parent.find('.title').text(arr[0] + ' giây - ' + arr[1] + ' giây');
                    parent.find('.searchTotal').text(resp.message);
                    parent.find('.searchPercent').text(percent);
                }
            });
        }
    }

    // Lấy dữ liệu lọc và truy vấn server
    function queryFilter(formId, ignoreSearch, downloadExcel, totalResult) {
        var filter = _.chain($('#' + formId + ' .searchColumn'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) {
                    memo[el.name] = $(el).val();
                }
                return memo;
            }, {}).value();
        var sort = _.chain($('#' + formId + ' thead tr th').not('[data-sort="none"]'))
            .map(function (el) {
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
    // Tải file báo cáo
    function downloadExcelReport(url) {
        $('.page-loader').show();
        $.get(url, function (resp) {
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
    }

    // Truy vấn dữ liệu ticket
    function requestTickets(formId, dateTime, url, ignoreSearch) {
        if (!_.has(pagingObject, formId)) pagingObject[formId] = [];
        pagingObject[formId].push(dateTime);
        createLoadingPaging(formId);
        $('.card .z-panel').addClass('show-loading');
        _AjaxData(url, 'GET', null, function (resp) {
            if (resp.code == 500 || (resp.message.length == 0 && !ignoreSearch)) {
                swal({
                    title: 'Không tìm thấy kết quả với khoá tìm kiếm',
                    text: resp.message,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Xác nhận!",
                    closeOnConfirm: true
                }, function () {
                    reverseSearchValue();
                    reversePagingData(formId);
                });
            } else {
                loadData(formId, resp);
            }
        });
    };

    // Hiển thị dữ liệu đã lọc
    function setValueLastSearch() {
        _.each($(' .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = $(el).val();
            lastSearch[name] = value;
        });
    };

    function reverseSearchValue() {
        _.each($('.searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = lastSearch[name] ? lastSearch[name] : '';
            $(el).val(value);
        });

        $('.selectpicker').selectpicker('refresh');
        $('.tag-select').trigger("chosen:updated");
    };

    function reversePagingData(formId) {
        if (!_.has(lastPagingData, formId) || _.isEmpty(lastPagingData[formId])){
            $('#' + formId + ' #ticket-paging').html('');
            return '';
        }
        $('#' + formId + ' #ticket-paging').html(createPaging(lastPagingData[formId]));
    };

    // Hiển thị dữ liệu phân trang
    function createPaging(paging) {
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

    function createLoadingPaging(formId) {
        var htmlCode = '<div class="paginate text-center">' +
            '<ul class="pagination">' +
            '<li>' +
            '<img src="assets/images/loading.gif"/>' +
            '</div> ' +
            '</li>' +
            '</ul></div>';
        $('#' + formId + ' #ticket-paging').html(htmlCode);
    };

    // Hiển thị dữ liệu báo cáo
    function loadData(formId, resp) {
        var template = '<tr>' +
            '<td title="{9}">{0}</td>' +
            '<td>{1}</td>' +
            '<td title="{10}">{2}</td>' +
            '<td>{3}</td>' +
            '<td>{4}</td>' +
            '<td>{5}</td>' +
            '<td>{6}</td>' +
            '<td>{7}</td>' +
            '<td>{8}</td>' +
            '</tr>';

        var rows = '';
        resp.message.forEach(function (el) {
            rows += template.str(el.company,
                el.caller,
                el.user,
                moment(el.startTime).format("HH:mm:ss DD/MM/YYYY"),
                moment(el.answerTime).format("HH:mm:ss DD/MM/YYYY"),
                moment().startOf('day').seconds(Math.ceil(el.waitDuration / 1000)).format('HH:mm:ss'),
                moment().startOf('day').seconds(Math.ceil(el.callDuration / 1000)).format('HH:mm:ss'),
                moment(el.endTime).format("HH:mm:ss DD/MM/YYYY"),
                '',
                el.company,
                el.user
            );
        });

        setValueLastSearch();
        $('#' + formId + ' #ticket-body').html(rows);
        $('.selectpicker').selectpicker('refresh');
        $('.tag-select').trigger("chosen:updated");
		window.MainContent.loadTooltip();
    };

    function updateView() {
        // resize chosen picker
        $(".chosen-container").each(function () {
            $(this).attr('style', 'width: 100%');
        });

        // Setup date range picker
        $('.daterangepicker').daterangepicker({
                autoUpdateInput: false,
                opens: "center",
                locale: {
                    format: 'DD/MM/YYYY',
                    cancelLabel: 'Clear'
                }
            })
            .on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
            })
            .on('cancel.daterangepicker', function (ev, picker) {
                $(this).val('');
            });

        // config chart
        configChart(null);
    };

    function configChart(resp) {

        var dChart = [];
        var wChart = [];
        var blockProp = [
            '_lt_15',
            '_15_30',
            '_30_45',
            '_45_60',
            '_60_75',
            '_75_90',
            '_90_105',
            '_105_120',
            '_120_135',
            '_gt_135'
        ];

        var timeRangeArray = [
            '< 15 giây',
            '15 giây - 30 giây',
            '30 giây - 45 giây',
            '45 giây - 60 giây',
            '60 giây - 75 giây',
            '75 giây - 90 giây',
            '90 giây - 105 giây',
            '105 giây - 120 giây',
            '120 giây - 135 giây',
            '> 135 giây'
        ];

        if (!_.isNull(resp) && !_.isEmpty(resp.extra)) {
            _.each($('.duration-rows'), function (el) {

                var dataIndex = parseInt($(el).attr('data-index')),
                    prefix = 'd',
                    value = resp.extra[prefix + blockProp[dataIndex]],
                    percent = parseFloat((value * 100 / resp.extra.count).toFixed(2));

                $(el).find('.quantity').html(value);
                $(el).find('.percent').html(percent);

                dChart[dataIndex] = {
                    name: timeRangeArray[dataIndex],
                    y: percent,
                    drilldown: null
                }
            });

            _.each($('.waiting-rows'), function (el) {
                var dataIndex = parseInt($(el).attr('data-index')),
                    prefix = 'w',
                    value = resp.extra[prefix + blockProp[dataIndex]],
                    percent = parseFloat((value * 100 / resp.extra.count).toFixed(2));

                $(el).find('.quantity').html(value);
                $(el).find('.percent').html(percent);

                wChart[dataIndex] = {
                    name: timeRangeArray[dataIndex],
                    y: percent,
                    drilldown: null
                }
            });
        }

        $('#duration-highchart').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Thời gian đàm thoại'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'category',
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            yAxis: {
                title: {
                    text: ''
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}%'
                    }
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b><br/>'
            },
            series: [{
                name: 'Thời gian đàm thoại',
                colorByPoint: true,
                data: dChart
            }]
        });

        $('#waiting-highchart').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Thời gian chờ'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'category',
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            yAxis: {
                title: {
                    text: ''
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}%'
                    }
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b><br/>'
            },
            series: [{
                name: 'Thời gian chờ',
                colorByPoint: true,
                data: wChart
            }]
        });
    }

    return {
        init: function () {
            bindTextValue();
            updateView();

            bindSocket(_socket);

            setValueLastSearch();
            bindClick();

            //queryFilter('frm-report-inbound-call-serviced', true);
        },
        uncut: function () {
            // disable sự kiện khi đóng trang
            lastSearch = {};
            pagingObject = {};
            lastPagingData = {};
            $(document).off('click', '.sort');
            $(document).off('click', '#btn-search');
            $(document).off('click', '.zpaging');
            $(document).off('keyup', '.filter');
            $(document).off('change', '.column-display');
            $(document).off('click', '#download-excel');
            $(document).off('click', '.zmdi-refresh');
            delete _socket.$events['responseReportInboundCallServicedPagingData'];
        }
    };
}(jQuery);