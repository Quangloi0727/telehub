var DFT = function ($) {
    var _customerGroup = {};

    // Tạo thẻ khách hàng để hiện thị
    var customerTag = function(paging ,fields, customers, selectClass, idField){
        var trs = [];
        for(var i = 0; i < customers.length; i++){
            var tds = [];
            tds.push({tag:'td', content: (i+paging.fromResult)});
            tds.push({tag:'td', attr: {class: 'p-0'}, childs:[
                {tag:'dive', attr: { class:'checkbox m-0'}, childs: [
                    {tag: 'label', childs:[
                        {tag:'input', attr: {type:'checkbox', class: selectClass, value:customers[i]._id}},
                        {tag:'i', attr: { class:'input-helper'}}
                    ]}
                ]}
            ]});
            tds.push({tag:'td', attr: {class: ''}, content: _.fieldValue(customers[i],'field_ho_ten', 1)});
            tds.push({tag:'td', attr: {class: ''}, content: _.fieldValue(customers[i], 'field_so_dien_thoai', 1)});
            tds.push({tag:'td', content: ''});

            trs.push({tag: 'tr', attr: {class: 'text-center'}, childs: tds});
        }

        return _.Tags(trs);
    }

    // làm mới danh sách nguồn khách hàng
    var refreshCustomerSource = function(){
        $('#idCustomerSource option').each(function(i,e){
            if(!_.isEqual($(e).val(),''))e.remove();
        });
    }
    // làm mới danh sách nhóm khách hàng
    var refreshCustomerGroup = function(){
        $('#idCustomerGroup option').each(function(i,e){
            if(!_.isEqual($(e).val(),''))e.remove();
        });
    }

    // Hiển thị danh sách khách hàng chưa đưa vào chiến dịch
    var appendAddData = function(resp){
        $('#select_all').prop('checked', false);
        $('#form-add-customer tbody').empty();
        $('.add-paging').remove();
        $('#add-count').html('Tổng : '+ resp.result.paging.totalResult);
        $('#form-add-customer tbody').append(customerTag(resp.result.paging,resp.result.fields, resp.result.customers, 'selectCustomer', '_id'));
        $('<div class="text-center add-paging">' +  _.paging('campains', resp.result.paging) + '</div>').insertAfter('#form-add-customer');
    }

    // Hiển thị danh sách khách hàng đã đưa vào chiến dịch
    var appendAddedData = function(resp){
        $('.added-paging').remove();
        $('#select_all_added').prop('checked', false);
        $('#form-added-customer tbody').empty();
        $('#added-count').html('Tổng : '+ resp.result.paging.totalResult);
        $('#form-added-customer tbody').append(customerTag(resp.result.paging,resp.result.fields, resp.result.customers, 'selectAddedCustomer', 'idCustomer'));
        $('<div class="text-center added-paging">' +  _.paging('campains', resp.result.paging) + '</div>').insertAfter('#form-added-customer');
    }

    // Truy vấn dữ liệu trường thông tin khách hàng
    var getCustomerFields = function(next){
        _Ajax('/campains?type=getCustomerFields', 'GET', [], function (resp) {
            if(next) next(null);
        });
    }

    // Truy vấn dữ liệu khách hàng chưa đưa vào chiến dịch
    var getAddData = function($this, next){
        var _url = $this ? $this.attr('href')+ '&addnumber=' + window.location.obj['addnumber'] : '/campains?addnumber='+ window.location.obj['addnumber'];
        var data = _.pick($('#search-customer').serializeJSON(), function(value, key, object){
            return !_.isEqual(value,'');
            //return (!_.isArray(value) && !_.isEqual(value,'')) || (_.isArray(value) && value[0] && !_.isEqual(value,''));
        });

        _Ajax(_url, 'POST', [{searchData: JSON.stringify(data)}], function (resp) {
            if(resp.code == 200){
                appendAddData(resp);
                if(next) next(null);
                $("html").getNiceScroll().resize();
            }
        });
    }

    // Truy vấn dữ liệu khách hàng đã đưa vào chiến dịch
    var getAddedData = function(next){
        getSearchAddedData(null, next);
    }

    // Truy vấn dữ liệu khách hàng chưa đưa vào chiến dịch
    var getSearchAddedData = function($this, next){
        var _url = $this ? $this.attr('href')+ '&addnumber=' + window.location.obj['addnumber'] : '/campains?addnumber='+ window.location.obj['addnumber'];
        var data = _.pick($('#search-added-customer').serializeJSON(), function(value, key, object){
            return !_.isEqual(value,'');
            //return (!_.isArray(value) && !_.isEqual(value,'')) || (_.isArray(value) && value[0] && !_.isEqual(value,''));
        });

        _Ajax(_url, 'POST', [{searchAddedData: JSON.stringify(data)}], function (resp) {
            if(resp.code == 200) {
                appendAddedData(resp);
            }
        });
    }

    // sự kiện click
    var bindClick = function () {
        // Thay đổi dữ liệu nguồn khách hàng
        $(document).on('change', '#inSources', function () {
            if(!$(this).val()){
                $('#customer-search-btn').prop('disabled', true);
            }else {
                $('#customer-search-btn').prop('disabled', false);
            }
        });

        // Tìm kiếm theo nhóm
        $(document).on('click', '.group-search', function () {
            _Ajax('/campains'+ '?type=getCustomergroup', 'GET', {}, function (resp) {
                _customerGroup = {};
                refreshCustomerGroup();
                refreshCustomerSource();

                _.each(resp.data, function (group, i){
                    _customerGroup[group._id] = group;
                    $('#idCustomerGroup').append(_.Tags([{
                        tag: 'option', attr: {value: group._id}, content: group.name
                    }]));
                });
                $('#idCustomerGroup').selectpicker('refresh');
                $('#idCustomerSource').selectpicker('refresh');
            });
        });

        // Chuyển trang của danh sách chưa add
        $(document).on('click', '.add-paging .pagination li a', function (e) {
            e.preventDefault();
            var $this = $(this);
            getAddData($this, null);
        });

        // Chuyển trang của danh sách đã add
        $(document).on('click', '.added-paging .pagination li a', function (e) {
            e.preventDefault();
            var $this = $(this);

            getSearchAddedData($this, null);
        });

        // Lọc khách hàng chưa add
        $(document).on('click', '#customer-search-btn', function () {
            getAddData(null,null);
        });

        // Lọc khách hàng đã add
        $(document).on('click', '#added-customer-search-btn', function () {
            getSearchAddedData(null,null);
        });

        // Loại khách hàng đã add
        $(document).on('click', '#remove-btn', function () {
            var ids = $.map($('.selectAddedCustomer'), function(n, i){
                return $(n).is(":checked") ? $(n).val(): '';
            });

            if(_.compact(ids).length > 0) {
                async.waterfall([
                    function (next) {
                        _Ajax('/campains', 'POST', [{removecustomers: _.compact(ids)}, {campain: window.location.obj['addnumber']}, {source: $('#idCustomerSource option:selected').val()}], function (resp) {
                            if(resp.code == 200) next(null);
                        });
                    },
                    function(next){
                        getAddData(null, next);
                    },
                    getAddedData
                ]);
            }
        });

        // Loại toàn bộ khách hàng đã add
        $(document).on('click', '#remove-all-btn', function () {
            var ids = $.map($('.selectAddedCustomer'), function(n, i){
                return  $(n).val();
            });

            var count = $('#count').val();
            if(_.compact(ids).length > 0 && !_.isEqual(count, '0')) {
                if(!count){
                    count = 'all';
                }

                async.waterfall([
                    function (next) {
                        _Ajax('/campains', 'POST', [{removecustomers: 'all'}, {count: count}, {campain: window.location.obj['addnumber']}, {source: $('#idCustomerSource option:selected').val()}], function (resp) {
                            if(resp.code == 200) next(null);
                        });
                    },
                    function(next){
                        getAddData(null, next);
                    },
                    getAddedData
                ]);
            }
        });

        // Đưa tất cả khách hàng vào chiến dịch
        $(document).on('click', '#add-all-btn', function () {
            var ids = $.map($('.selectCustomer'), function(n, i){
                return  $(n).val();
            });

            var count = $('#count').val();
            if(_.compact(ids).length > 0 && !_.isEqual(count, '0')) {
                if(!count) count = 'all';

                async.waterfall([
                    function (next) {
                        var _url = '/campains?addnumber='+ window.location.obj['addnumber'];
                        var data = _.pick($('#search-customer').serializeJSON(), function(value, key, object){
                            return !_.isEqual(value,'');
                            //return (!_.isArray(value) && !_.isEqual(value,'')) || (_.isArray(value) && value[0] && !_.isEqual(value,''));
                        });

                        _Ajax(_url, 'POST', [{searchData: JSON.stringify(data)}, {count: count}], function (resp) {
                            if(resp.code == 200) next(null);
                        });
                    },
                    function(next){
                        getAddData(null, next);
                    },
                    getAddedData
                ]);
            }
        });

        // Đưa khách hàng đã chọn vào chiến dịch
        $(document).on('click', '#add-btn', function () {
            var ids = $.map($('.selectCustomer'), function(n, i){
                return $(n).is(":checked") ? $(n).val(): '';
            });

            if(_.compact(ids).length > 0) {
                async.waterfall([
                    function (next) {
                        //_Ajax('/campains', 'POST', [{customers: _.compact(ids)}, {campain: window.location.obj['addnumber']}, {source: $('#idCustomerSource option:selected').val()}], function (resp) {
                        //    if(resp.code == 200) next(null);
                        //});

                        var _url = '/campains?addnumber='+ window.location.obj['addnumber'];
                        var data = _.pick($('#search-customer').serializeJSON(), function(value, key, object){
                            return !_.isEqual(value,'');
                            //return (!_.isArray(value) && !_.isEqual(value,'')) || (_.isArray(value) && value[0] && !_.isEqual(value,''));
                        });

                        _Ajax(_url, 'POST', [{searchData: JSON.stringify(data)}, {addCus: JSON.stringify(ids)}], function (resp) {
                            if(resp.code == 200) next(null);
                        });
                    },
                    function(next){
                        getAddData(null, next);
                    },
                    getAddedData
                ]);
            }
        });

        // Chọn tất cả trong danh sách chưa add
        $(document).on('click', '#select_all', function () {
        //$('#select_all').click(function(event) {
            if(this.checked) {
                $('.selectCustomer').each(function() {
                    this.checked = true;
                });
            }
            else {
                $('.selectCustomer').each(function() {
                    this.checked = false;
                });
            }
        });

        // Chọn tất cả trong danh sách đã add
        $(document).on('click', '#select_all_added', function () {
        //$('#select_all_added').click(function(event) {
            if(this.checked) {
                $('.selectAddedCustomer').each(function() {
                    this.checked = true;
                });
            }
            else {
                $('.selectAddedCustomer').each(function() {
                    this.checked = false;
                });
            }
        });

    };

    var bindSubmit = function () {

    };

    var bindPressKey = function(){

    }

    return {
        init: function () {
            bindClick();
            bindSubmit();
            bindPressKey();

            // Lấy dữ liệu của chiến dịch và hiển thị
            async.waterfall([
                function(next){
                    _Ajax('/campains'+ '?type=getCustomergroup', 'GET', {}, function (resp) {
                        _customerGroup = {};
                        _.each(resp.data, function (group, i){
                            _customerGroup[group._id] = group;
                            $('#idCustomerGroup').append(_.Tags([{
                                tag: 'option', attr: {value: group._id}, content: group.name
                            }]));
                        });
                        $('#idCustomerGroup').selectpicker('refresh');
                        next(null);
                    });
                },
                getAddedData,
                getCustomerFields
            ]);
        },
        uncut: function(){
            // Hủy sự kiện khi đóng trang
            $(document).off('change', '.#inSources');
            $(document).off('click', '.group-search');
            $(document).off('click', '.add-paging .pagination li a');
            $(document).off('click', '.added-paging .pagination li a');
            $(document).off('click', '#customer-search-btn');
            $(document).off('click', '#added-customer-search-btn');
            $(document).off('click', '#remove-all-btn');
            $(document).off('click', '#remove-btn');
            $(document).off('click', '#add-btn');
            $(document).off('click', '#add-all-btn');
            $(document).off('click', '#select_all');
            $(document).off('click', '#select_all_added');
        }
    };
}(jQuery);