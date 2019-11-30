var DFT = function ($) {

    var queryQaObj = {};

    var newQa = function(obj){
        var objCompany = {};
        if (_.has(obj.qaMembers[0], 'ternal')){
            objCompany = {tag: 'td', attr: {class: 'text-center'}, content: 'Tất cả'};
        }
        else{
            var chs = [];
            obj.qaMembers.forEach(function(company){
                chs.push({tag: 'li', attr: {class: 'text-center'}, content: company.company.name});
            });
            objCompany = {tag: 'td', attr: {class: 'text-center'}, childs: chs};
        }
        return _.Tags([
            {tag: 'tr', attr: {class: 'qa-cell', id: obj._id}, childs: [
                {tag: 'td', attr: {class: 'select-cell text-center w-60'}, childs: [
                    {tag: 'div', attr: {class: 'checkbox m-0'}, childs: [
                        {tag: 'label', childs: [
                            {tag: 'input', attr: {'data-id': obj._id, name: 'select', type: 'checkbox', class: 'select-box select-box-cell', value: 'all'}},
                            {tag: 'i', attr: {class: 'input-helper'}}
                        ]}
                    ]}
                ]},
                {tag: 'td', attr: {class: 'text-center'}, content: obj.displayName},
                objCompany,
                {tag: 'td', attr: {class: 'text-center'}}
            ]}
        ]);
    };

    var bindClick = function () {
        $(document).on('click', '#btn-filter', function (e) {
            //Todo: Lọc bản ghi
            e.preventDefault();

            var params = _.chain($('.mark-qa-filter'))
                .reduce(function (memo, el) {
                    if (!_.isEqual($(el).val(), '') && !_.isNull($(el).val())) {
                        memo[el.name] = $(el).val();
                        queryQaObj[el.name] = $(el).val();
                    }
                    else{
                        delete queryQaObj[el.name];
                    }
                    return memo;
                }, {}).value();
            queryQa(params);
        });

        $(document).on('change', '.select-box-all', function () {
            //Todo: Chọn tất cả các bản ghi
            $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
        });

        $(document).on('change', '#select_all_added', function () {
            //Todo: Chọn tất cả các bản ghi bên mục đã thêm vào
            $('.select-qa-added').prop('checked', $('#select_all_added').is(":checked"));
        });

        $(document).on('click', '#add-btn', function(e){
            //Todo: Thêm các bản ghi QA đã tích chọn vào danh sách QA chấm điểm
            var x = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked") ? $(n).attr('data-id') : '';
            });
            if (_.compact(x).length > 0){
                _Ajax('/kpi-mark-data-qa/' + window.location.obj['data'], 'PUT', [{addIds: _.compact(x)}], function(resp){
                    if (resp.code == 200){
                        $('.select-box-all').prop('checked', false);
                        $('.select-box-cell').prop('checked', false);
                        queryQaAdded();
                    }
                });
            }
        });

        $(document).on('click', '#remove-btn', function(e){
            //Todo: Xóa các QA được tích chọn khỏi danh sách chấm điểm
            swal({
                    title: _config.MESSAGE.MARK_DATA_QA.CONFIRM_DELETE_QA,
                    text: _config.MESSAGE.MARK_DATA_QA.TEXT_CONFIRM_DELETE_QA,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    var x = $.map($('.select-qa-added'), function(n, i){
                        return $(n).is(":checked") ? $(n).attr('data-id') : '';
                    });
                    if (_.compact(x).length > 0){
                        _Ajax('/kpi-mark-data-qa/' + window.location.obj['data'], 'PUT', [{removeIds: _.compact(x)}], function(resp){
                            if (resp.code == 200){
                                swal({title: 'Thành công', text: 'Thay đổi thành công', type: "success"});
                                $('#select_all_added').prop('checked', false);
                                queryQaAdded();
                            }
                            else{
                                swal({title: 'Thất bại', text: 'Dữ liệu đang được sử dụng', type: "warning"});
                            }
                        });
                    }
                    else{
                        swal({title: 'Thất bại', text: 'Không có người nào được chọn', type: "warning"});
                    }
                });

        });

        $(document).on('click', '.zpaging', function () {
            //Chuyển trang
            queryQaObj['page'] = $(this).attr('data-link');
            queryQa(queryQaObj);
        });

        $(document).on('click', '.apply-single', function(){
            //Xác nhận phân số lượng ticket cho agent
            var value = $(this).closest('tr').find('.inputNumMark').val();
            var id = $(this).attr('data-id');
            if (!_.isEqual(value, _ticketsQa[id].ticketCount)){
                var url = '/kpi-mark-data-qa/' + window.location.obj['data'] + '?idQa=' + id;
                _Ajax(url, 'PUT', [{add: (Number(value) - _ticketsQa[id].ticketCount)}], function(resp){
                    if (resp.code == 200){
                        swal({title: 'Thành công', text: resp.msg, type: "success"});
                        _.LoadPage(window.location.hash);
                    }
                    else{
                        swal({title: 'Thất bại', text: resp.msg, type: "warning"});
                    }
                });
            }
        });

        $(document).on('click', '.zmdi-refresh', function(){
            //Load lại trang
            _.LoadPage(window.location.hash);
        });

    };

    var bindSubmit = function () {

    };

    var queryQa =  function(params){
        //Todo: Lọc danh sách QA
        var url = '/kpi-mark-data-qa?queryQA=1&data=' + window.location.obj.data + '&';
        _.each(_.keys(params), function(k){
            url = url + k + '=' + params[k] + '&';
        });
        $.get(url, function(resp){
            $('.add-paging').html(createPaging(resp.paging, 'zpaging'));
            $('.qa-cell').remove();
            _.each(resp.users, function(qa){
                $('#tbl-choose-qa tbody').append(newQa(qa));
            });
        });
    };

    var _ticketsQa = {};

    var queryQaAdded =  function(){
        //Todo: Tìm danh sách QA chấm điểm
        async.waterfall([
            function(next){
                var url = '/kpi-mark-data-qa?queryDataTicket=1&data=' + window.location.obj['data'];
                $.get(url, function(resp){
                    _ticketsQa = {};
                    async.each(resp.data, function(o, cb){
                        _ticketsQa[o._id] = o;
                        cb();
                    }, function(e, r){
                        next(null, _ticketsQa);
                    });
                });
            }
        ], function(err, result){
            if (!err){
                refreshFormAddedQa(_ticketsQa);
                refreshInfo();
            }
        });
    };

    var createPaging = function (paging, classPaging) {
        if (!paging) return '';
        var firstPage = paging.first ? '<li><a class="' + classPaging +'" data-link="' + paging.first + '">&laquo;</a></li>' : '';
        var prePage = paging.previous ? '<li><a class="' + classPaging +'" data-link="' + paging.previous + '">&lsaquo;</a></li>' : '';
        var pageNum = '';
        for (var i = 0; i < paging.range.length; i++) {
            if (paging.range[i] == paging.current) {
                pageNum += '<li class="active"><span>' + paging.range[i] + '</span></li>';
            } else {
                pageNum += '<li><a class="' + classPaging +'" data-link="' + paging.range[i] + '">' + paging.range[i] + '</a></li>';
            }
        }
        var pageNext = paging.next ? '<li><a class="' + classPaging +'" data-link="' + paging.next + '">&rsaquo;</a></li>' : '';
        var pageLast = paging.last ? '<li><a class="' + classPaging +'" data-link="' + paging.last + '">&raquo;</a></li>' : '';
        return '<div class="paginate text-center">' + '<ul class="pagination">' + firstPage + prePage + pageNum + pageNext + pageLast + '</ul></div>';
    };

    var refreshFormAddedQa = function(qas){
        //reload view danh sách QA chấm bộ dữ liệu
        $('.qa-added-cell').remove();
        $('#added-count').text('Tổng: ' + _.keys(qas).length);
        _.each(_.keys(qas), function(qa, i){
            $('#form-added-qa tbody').append(_.Tags([{
                tag: 'tr', attr: {class: 'qa-added-cell', id: qa}, childs: [
                    {tag: 'td', attr: {class: 'select-cell text-center w-60'}, childs: [
                        {tag: 'div', attr: {class: 'checkbox m-0'}, childs: [
                            {tag: 'label', childs: [
                                {tag: 'input', attr: {'data-id': qa, name: 'select', type: 'checkbox', class: 'select-box select-qa-added', value: 'all'}},
                                {tag: 'i', attr: {class: 'input-helper'}}
                            ]}
                        ]}
                    ]},
                    {tag: 'td', attr: {class: 'text-center'}, content: _ticketsQa[qa].displayName},
                    {tag: 'td', attr: {class: 'text-center'}, childs:[
                        {tag: 'input', attr: {type: 'number', class: 'form-control inputNumMark', value: _ticketsQa[qa].ticketCount}}
                    ]},
                    {tag: 'td', attr: {class: 'text-center'}, childs:[
                        {tag: 'span', attr: {class: 'text-center'}, content: "" + _ticketsQa[qa].totalCount}
                    ]},
                    {tag: 'td', attr: {class: 'text-center'}, childs: [
                        {tag: 'a', attr: {role: 'button', class: 'btn-flat-bg apply-single', 'data-toggle': 'tooltip', 'data-placement': 'top', 'data-original-title': 'Apply', 'data-id': qa}, childs: [
                            {tag: 'i', attr: {class: 'zmdi zmdi-check green f-17'}}
                        ]}
                    ]}
                ]
            }]));
        });
    };

    var refreshInfo = function(){
        //Load lại thông tin
        var url = '/kpi-mark-data-qa?queryData=1&idData=' + window.location.obj['data'];
        $.get(url, function(resp) {
            $('#dataName').text(resp.data.idCollection.name);
            $('#ticketCount').text(resp.total);
            $('#ticketLeft').text(resp.notUse);
            $('#startDate').text(moment(resp.data.startDate).format('DD/MM/YYYY'));
            $('#endDate').text(moment(resp.data.endDate).format('DD/MM/YYYY'));
        });
    };

    return {
        init: function () {
            bindClick();
            bindSubmit();
            queryQa({});
            queryQaAdded();
        },
        uncut: function(){
            $(document).off('click', '#btn-filter');
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('change', '#select_all_added');
            $(document).off('click', '#add-btn');
            $(document).off('click', '#remove-btn');
            $(document).off('click', '.zpaging');
            $(document).off('click', '.apply-single');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);