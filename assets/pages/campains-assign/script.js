var DFT = function ($) {
    var _customerGroup = {};
    var _numTab = 1;
    var _leadersIds = [];

    // Tạo dữ liệu thẻ agent
    var agentTag = function(agents, selectClass, paging){
        var trs = [];
        for(var i = 0; i < agents.length; i++){
            var tds = [];
            tds.push({tag:'td', content: i+paging.fromResult});
            tds.push({tag:'td', attr: {class: 'p-0'}, childs:[
                {tag:'dive', attr: { class:'checkbox m-0'}, childs: [
                    {tag: 'label', childs:[
                        {tag:'input', attr: {type:'checkbox', class: selectClass, value: agents[i]._id ? agents[i]._id._id : ''}},
                        {tag:'i', attr: { class:'input-helper'}}
                    ]}
                ]}
            ]});
            tds.push({tag:'td', attr: {class: ''}, content: agents[i]._id ? agents[i]._id.displayName : 'UNKNOW'});
            tds.push({tag:'td', attr: {class: ''}, content: ''+agents[i].called});
            tds.push({tag:'td', attr: {class: ''}, content: ''+(agents[i].count - agents[i].called)});
            tds.push({tag:'td', content: agents[i]._id ? ((_leadersIds.indexOf(agents[i]._id._id) >= 0) ? 'Team Leader' : 'Agents') : ''});

            trs.push({tag: 'tr', attr: {class: 'text-center'}, childs: tds});
        }

        return _.Tags(trs);
    }

    // Tạo thẻ dữ liệu agent
    var addAgentTag = function(agents, selectClass, paging){
        var trs = [];
        for(var i = 0; i < agents.length; i++){
            var tds = [];
            tds.push({tag:'td', content: i+paging.fromResult});
            tds.push({tag:'td', attr: {class: 'p-0'}, childs:[
                {tag:'dive', attr: { class:'checkbox m-0'}, childs: [
                    {tag: 'label', childs:[
                        {tag:'input', attr: {type:'checkbox', class: selectClass, value:agents[i]._id}},
                        {tag:'i', attr: { class:'input-helper'}}
                    ]}
                ]}
            ]});
            tds.push({tag:'td', attr: {class: ''}, content: agents[i].displayName});
            tds.push({tag:'td', content: ''+agents[i].tickets});
            tds.push({tag:'td', childs: [
                {tag:'input', attr: {type:'number', class: 'w-80 numCall', min: 0}},
                {tag:'i', attr: { class:'input-helper'}}
            ]});
            tds.push({tag:'td', content: (_leadersIds.indexOf(agents[i]._id) >= 0) ? 'Team Leader' : 'Agents'});

            trs.push({tag: 'tr', attr: {class: 'text-center'}, childs: tds});
        }

        return _.Tags(trs);
    }

    // Tạo thẻ dữ liệu nhóm agent
    var groupTag = function(groups, selectClass, paging){
        var trs = [];
        for(var i = 0; i < groups.length; i++){
            var tds = [];
            tds.push({tag:'td', content: i+paging.fromResult});
            tds.push({tag:'td', attr: {class: 'p-0'}, childs:[
                {tag:'dive', attr: { class:'checkbox m-0'}, childs: [
                    {tag: 'label', childs:[
                        {tag:'input', attr: {type:'checkbox', class: selectClass, value:groups[i]._id}},
                        {tag:'i', attr: { class:'input-helper'}}
                    ]}
                ]}
            ]});
            tds.push({tag:'td', attr: {class: ''}, content: groups[i].name});
            tds.push({tag:'td', attr: {class: 'numAgent'}, content: ''+groups[i].agents});
            tds.push({tag:'td', childs: [
                {tag:'input', attr: {type:'number', class: 'w-80 numCall', min: 0}},
                {tag:'i', attr: { class:'input-helper'}}
            ]});

            trs.push({tag: 'tr', attr: {class: 'text-center'}, childs: tds});
        }

        return _.Tags(trs);
    }

    // Hiển thị dữ liệu đã phân
    var appendAddedData = function(resp){
        $('.added-paging').remove();
        $('#select_all_added').prop('checked', false);
        $('#form-added-agent tbody').empty();
        $('#form-added-agent tbody').append(agentTag(resp.message.agents, 'selectAddedAgent', resp.message.paging));
        $('#added-count').html('Tổng: '+ resp.message.count);
        $('<div class="text-center added-paging">' +  _.paging('campains-assign', resp.message.paging) + '</div>').insertAfter('#form-added-agent');
    }

    // Hiển thị dữ liệu nhóm agent
    var appendGroupData = function(resp){
        $('.group-paging').remove();
        $('#select_all_group').prop('checked', false);
        $('#form-group tbody').empty();
        $('#form-group tbody').append(groupTag(resp.message.groups, 'selectGroup', resp.message.paging));
        $('#group-count').html('Tổng: '+ resp.message.count);
        $('<div class="text-center group-paging">' +  _.paging('campains-assign', resp.message.paging) + '</div>').insertAfter('#form-group');
    }

    // Hiển thị thông tin của chiến dịch
    var appendCampainData = function(resp){
        $('#campainName').html(resp.data.name);
        $('#count').html(resp.count);
        $('#called').html(resp.count - resp.called);
        $('#startDate').html(moment(resp.data.startDate).format("DD/MM/YYYY"));
        $('#endDate').html(moment(resp.data.endDate).format("DD/MM/YYYY"));
    }

    // Hiển thị danh sách có thể phân
    var appendToAddData = function(resp){
        $('.add-paging').remove();
        $('#select_all_add').prop('checked', false);
        $('#form-add-agent tbody').empty();
        $('#form-add-agent tbody').append(addAgentTag(resp.message.agents, 'selectAddAgent', resp.message.paging));
        $('#add-count').html('Tổng: '+ resp.message.count);
        $('<div class="text-center add-paging">' +  _.paging('campains-assign', resp.message.paging) + '</div>').insertAfter('#form-add-agent');
    }

    // Truy vấn dữ liệu trưởng nhóm
    var getLeaders = function(next){
        _Ajax('/campains-assign?campainId='+ window.location.obj['campainId']+ '&type=getLeaders', 'GET', [], function (resp) {
            _leadersIds = resp.message;
            next(null);
        });
    }

    // Truy vấn dữ liệu nhân sự có thể phân
    var getToAddData = function(next){
        _Ajax('/campains-assign?campainId='+ window.location.obj['campainId']+ '&type=getToAddAgent', 'GET', [], function (resp) {
            if(resp.code == 200) appendToAddData(resp);
            next(null);
            $("html").getNiceScroll().resize();
        });
    }

    // Truy vấn dữ liệu nhóm có thể phân
    var getGroupData = function(next){
        _Ajax('/campains-assign?campainId='+ window.location.obj['campainId']+ '&type=getGroup', 'GET', [], function (resp) {
            if(resp.code == 200) appendGroupData(resp);
            next(null);
            $("html").getNiceScroll().resize();
        });
    }

    // Truy vấn dữ liệu đã phân
    var getAddedData = function(next){
        _Ajax('/campains-assign?campainId='+ window.location.obj['campainId']+ '&type=getAddedAgent', 'GET', [], function (resp) {
            if(resp.code == 200) appendAddedData(resp);
            next(null);
            $("html").getNiceScroll().resize();
        });
    }

    // Truy vấn dữ liệu chiến dịch
    var getCampainData = function(next){
        _Ajax('/campains-assign?campainId='+ window.location.obj['campainId']+ '&type=getCampainData', 'GET', [], function (resp) {
            if(resp.code == 200) appendCampainData(resp.message);
            next(null);
            $("html").getNiceScroll().resize();
        });
    }

    // Bắt sự kiện click
    var bindClick = function () {
        // Thay đổi giá trị của trường số lượng khách hàng sẽ phân
        $(document).on('change', '.numCall', function () {
            var _tr = $(this).closest('tr');
            if(_numTab == 1){
                $(_tr).find('.selectGroup').prop("checked", "checked");
            }else{
                $(_tr).find('.selectAddAgent').prop("checked", "checked");
            }
        });

        // Thay đổi giá trị ô lọc theo tên agent
        $(document).on('change', '#search-agent-name', function () {
            _Ajax('/campains-assign?campainId=' + window.location.obj['campainId'] + '&type=getToAddAgent' + '&searchKey=' + $(this).val(), 'GET', [], function (resp) {
                if(resp.code == 200) appendToAddData(resp);
                $("html").getNiceScroll().resize();
            });
        });

        // Thay đổi giá trị ô lọc theo tên agent
        $(document).on('change', '#search-added-agent-name', function () {
            _Ajax('/campains-assign?campainId=' + window.location.obj['campainId'] + '&type=getAddedAgent' + '&searchKey=' + $(this).val(), 'GET', [], function (resp) {
                if(resp.code == 200) appendAddedData(resp);
                $("html").getNiceScroll().resize();
            });
        });

        // Click chuyển trang
        $(document).on('click', '.group-paging .pagination li a', function (e) {
            e.preventDefault();
            var $this = $(this);

            _AjaxObject($this.attr('href')+ '&campainId=' + window.location.obj['campainId'] + '&type=getGroup', 'GET', {}, function (resp) {
                if(resp.code == 200){
                    appendGroupData(resp);
                    $("html").getNiceScroll().resize();
                }
            });
        });

        // Click chuyển trang
        $(document).on('click', '.added-paging .pagination li a', function (e) {
            e.preventDefault();
            var $this = $(this);

            _AjaxObject($this.attr('href')+ '&campainId=' + window.location.obj['campainId'] + '&type=getAddedAgent', 'GET', {}, function (resp) {
                if(resp.code == 200){
                    appendAddedData(resp);
                    $("html").getNiceScroll().resize();
                }
            });
        });

        // Click chuyển trang
        $(document).on('click', '.add-paging .pagination li a', function (e) {
            e.preventDefault();
            var $this = $(this);

            _AjaxObject($this.attr('href')+ '&campainId=' + window.location.obj['campainId'] + '&type=getToAddAgent'+ '&searchKey=' + $('#search-agent-name').val(), 'GET', {}, function (resp) {
                if(resp.code == 200){
                    appendToAddData(resp);
                    $("html").getNiceScroll().resize();
                }
            });
        });

        // Chọn tab nhóm agent
        $(document).on('click', '.group-tab', function () {
            _numTab = 1;
        });
        // Chọn tab agent
        $(document).on('click', '.agent-tab', function () {
            _numTab = 2;
        });

        // Xác nhận phân khách hàng cho agent
        $(document).on('click', '#add-btn', function () {
            if(_numTab == 1){
                var ids = $.map($('.selectGroup'), function(n, i){
                    var _tr = $(n).closest('tr');
                    var _numCall = $(_tr).find('.numCall').val() ? Number($(_tr).find('.numCall').val()) : 0;
                    var _numAgent = $(_tr).find('.numAgent').html() ? Number($(_tr).find('.numAgent').html()) : 0;
                    return ($(n).is(":checked") && _numCall > 0 && _numAgent > 0)? {groupId: $(n).val(), numCall: _numCall, numAgent: _numAgent}: null;
                });
                if(ids.length > 0) {
                    async.waterfall([
                        function (next) {
                            _Ajax('/campains-assign', 'POST', [{groups: JSON.stringify(ids)}, {campain: window.location.obj['campainId']}], function (resp) {
                                if(resp.code == 200){next(null);}
                                else {next(resp.code);}
                            });
                        },
                        getToAddData,
                        getAddedData,
                        getGroupData,
                        getCampainData
                    ]);
                }
            }else {
                var ids = $.map($('.selectAddAgent'), function(n, i){
                    var _tr = $(n).closest('tr');
                    var _numCall = $(_tr).find('.numCall').val() ? Number($(_tr).find('.numCall').val()) : 0;
                    return ($(n).is(":checked") && _numCall > 0)? {agentId: $(n).val(), numCall: _numCall}: null;
                });
                if(ids.length > 0) {
                    async.waterfall([
                        function (next) {
                            _Ajax('/campains-assign', 'POST', [{agents: JSON.stringify(ids)}, {campain: window.location.obj['campainId']}], function (resp) {
                                if(resp.code == 200){next(null);}
                                else {next(resp.code);}
                            });
                        },
                        getToAddData,
                        getAddedData,
                        getGroupData,
                        getCampainData
                    ]);
                }
            }
        });

        // Xác nhận loại khách hàng đã phân
        $(document).on('click', '#remove-btn', function () {
            var ids = $.map($('.selectAddedAgent'), function(n, i){
                return $(n).is(":checked") ? $(n).val() : null;
            });
            if(ids.length > 0) {
                async.waterfall([
                    function (next) {
                        _Ajax('/campains-assign', 'POST', [{removeagents: JSON.stringify(ids)}, {campain: window.location.obj['campainId']}], function (resp) {
                            if(resp.code == 200){next(null);}
                            else {next(resp.code);}
                        });
                    },
                    getToAddData,
                    getAddedData,
                    getGroupData,
                    getCampainData
                ]);
            }
        });

        // Chọn nhiều nhóm
        $(document).on('click', '#select_all_group', function () {
        //$('#select_all_group').click(function(event) {

            if(this.checked) {
                $('.selectGroup').each(function() {
                    this.checked = true;
                });
            }
            else {
                $('.selectGroup').each(function() {
                    this.checked = false;
                });
            }
        });

        // Chọn tất cả danh sách đã phân
        $(document).on('click', '#select_all_added', function () {
        //$('#select_all_added').click(function(event) {
            if(this.checked) {
                $('.selectAddedAgent').each(function() {
                    this.checked = true;
                });
            }
            else {
                $('.selectAddedAgent').each(function() {
                    this.checked = false;
                });
            }
        });

        // Chọn tất cả danh sách chưa phân
        $(document).on('click', '#select_all_add', function () {
        //$('#select_all_add').click(function(event) {
            if(this.checked) {
                $('.selectAddAgent').each(function() {
                    this.checked = true;
                });
            }
            else {
                $('.selectAddAgent').each(function() {
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

            // Truy vấn dữ liệu từ server và hiển thị
            async.waterfall([
                getLeaders,
                getToAddData,
                getAddedData,
                getGroupData,
                getCampainData
            ]);
    },
        uncut: function(){
            // Hủy sự kiện khi đóng trang
            $(document).off('change', '#search-agent-name');
            $(document).off('change', '#search-added-agent-name');
            $(document).off('click', '.group-paging .pagination li a');
            $(document).off('click', '.added-paging .pagination li a');
            $(document).off('click', '.add-paging .pagination li a');
            $(document).off('click', '.group-tab');
            $(document).off('click', '.agent-tab');
            $(document).off('click', '#add-btn');
            $(document).off('click', '#select_all_group');
            $(document).off('click', '#select_all_added');
            $(document).off('click', '#select_all_add');
        }
    };
}(jQuery);