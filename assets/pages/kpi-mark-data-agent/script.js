var DFT = function ($) {

    var queryAgentObj = {};

    var newGroup = function(obj){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name}
        ]);
    };

    var companyHtml = function(companies){
        var rTags = [];
        _.each(companies, function(name){
            rTags.push({tag: 'li', content: name});
        });
        return rTags;
    };

    var groupHtml = function(groups){
        var rTags = [];
        _.each(groups, function(g){
            rTags.push({tag: 'li', content: g.group.name});
        });
        return rTags;
    };

    var newAgent = function(obj){
        return _.Tags([
            {tag: 'tr', attr: {class: 'agent-cell'}, childs: [
                {tag: 'td', attr: {class: 'select-cell text-center w-60'}, childs: [
                    {tag: 'div', attr: {class: 'checkbox m-0'}, childs: [
                        {tag: 'label', childs: [
                            {tag: 'input', attr: {'data-id': obj._id, name: 'select', type: 'checkbox', class: 'select-box select-box-cell', value: 'all'}},
                            {tag: 'i', attr: {class: 'input-helper'}}
                        ]}
                    ]}
                ]},
                {tag: 'td', attr: {class: 'text-center'}, childs: [
                    {tag: 'ul', childs: companyHtml(obj.company)}
                ]},
                {tag: 'td', attr: 'text-center', childs: [
                    {tag: 'ul', childs: groupHtml(obj.agentGroupLeaders.concat(obj.agentGroupMembers))}
                ]},
                {tag: 'td', attr: {class: 'text-center'}, content: obj.displayName},
                {tag: 'td', attr: {class: 'text-center'}}
            ]}
        ]);
    };

    var bindClick = function () {
        $(document).on('click', '#btn-filter', function (e) {
            //Todo: Lọc bản ghi
            e.preventDefault();

            var params = _.chain($('.mark-agent-filter'))
                .reduce(function (memo, el) {
                    if (!_.isEqual($(el).val(), '') && !_.isNull($(el).val())) {
                        memo[el.name] = $(el).val();
                        queryAgentObj[el.name] = $(el).val();
                    }
                    else{
                        delete queryAgentObj[el.name];
                    }
                    return memo;
                }, {}).value();
            queryAgent(params);
        });

        $(document).on('change', '.select-box-all', function () {
            //Todo: Chọn toàn bộ bản ghi
            $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
        });

        $(document).on('change', '#select_all_added', function () {
            //Todo: Chọn toàn bộ bản ghi trong danh sách đã được thêm
            $('.select-agent-added').prop('checked', $('#select_all_added').is(":checked"));
        });

        $(document).on('change', '#idCompany', function(e){
            var $this = $(this);
            $('.option-g').remove();
            $('#idGroup').selectpicker('refresh');
            var url = '/kpi-mark-data?queryGroup=1&idCompany=' + $this.find(":checked").val();
            $.get(url, function(res){
                _.each(res.data, function(g){
                    $('#idGroup').append(newGroup(g)).selectpicker('refresh');
                });
            });
        });

        $(document).on('click', '#add-btn', function(e){
            //Todo: Thêm mới các bản ghi đã được đánh dấu
            var x = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked") ? $(n).attr('data-id') : '';
            });
            if (_.compact(x).length > 0){
                _Ajax(window.location.hash.replace('#', ''), 'PUT', [{addIds: _.compact(x)}], function(resp){
                    if (resp.code == 200){
                        $('.select-box-all').prop('checked', false);
                        $('.select-box-cell').prop('checked', false);
                        refreshFormAddedAgent(resp.data);
                    }
                });
            }
        });

        $(document).on('click', '#remove-btn', function(e){
            //Todo: Xóa các agent đánh dấu khỏi danh sách được chấm
            swal({
                    title: _config.MESSAGE.MARK_DATA_AGENT.CONFIRM_DELETE_AGENT,
                    text: _config.MESSAGE.MARK_DATA_AGENT.TEXT_CONFIRM_DELETE_AGENT,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    var x = $.map($('.select-agent-added'), function(n, i){
                        return $(n).is(":checked") ? $(n).attr('data-id') : '';
                    });
                    if (_.compact(x).length > 0){
                        _Ajax(window.location.hash.replace('#', ''), 'PUT', [{removeIds: _.compact(x)}], function(resp){
                            if (resp.code == 200){
                                swal({title: 'Thành công', text: 'Thay đổi thành công', type: "success"});
                                $('#select_all_added').prop('checked', false);
                                refreshFormAddedAgent(resp.data);
                            }
                            else{
                                swal({title: 'Thất bại', text: 'Dữ liệu đang được sử dụng : ' + failProfile, type: "warning"});
                            }
                        });
                    }
                    else{
                        swal({title: 'Thất bại', text: 'Không có agent nào được chọn', type: "warning"});
                    }
                });

        });

        $(document).on('click', '.zpaging', function () {
            //Chuyển trang
            queryAgentObj['page'] = $(this).attr('data-link');
            queryAgent(queryAgentObj);
        });

        $(document).on('click', '.zmdi-refresh', function(){
            //Load lại trang
            _.LoadPage(window.location.hash);
        });
    };

    var bindSubmit = function () {

    };

    var queryAgent =  function(params){
        //Todo: Lọc agent
        var url = '/kpi-mark-data?queryAgent=1&';
        _.each(_.keys(params), function(k){
            url = url + k + '=' + params[k] + '&';
        });
        $.get(url, function(resp){
            $('.add-paging').html(createPaging(resp.paging, 'zpaging')); //Thêm menu trang
            $('.agent-cell').remove();
            _.each(resp.data, function(usr){
                async.parallel({
                    company: function(next){
                        var company = [];
                        _.each(usr.companyLeaders, function(comp){
                            company.push(comp.company.name);
                        });
                        next(null, company);
                    },
                    groupMember: function(next){
                        var company = [];
                        _.each(usr.agentGroupMembers, function(group){
                            company.push(group.group.idParent.name);
                        });
                        next(null, company);
                    },
                    groupLeader: function(next){
                        var company = [];
                        _.each(usr.agentGroupLeaders, function(group){
                            company.push(group.group.idParent.name);
                        });
                        next(null, company);
                    }
                }, function(error, result){
                    usr.company = _.union(result.company, result.groupMember, result.groupLeader);
                    $('#tbl-choose-agent tbody').append(newAgent(usr));
                });
            });
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

    var refreshFormAddedAgent = function(agents){
        $('.agent-added-cell').remove();
        $('#added-count').text('Tổng: ' + agents.length);
        _.each(agents, function(agent, i){
            $('#form-added-agent tbody').append(_.Tags([{
                tag: 'tr', attr: {class: 'agent-added-cell'}, childs: [
                    {tag: 'td', attr: {class: 'text-center'}, content: i + 1},
                    {tag: 'td', attr: {class: 'select-cell text-center w-60'}, childs: [
                        {tag: 'div', attr: {class: 'checkbox m-0'}, childs: [
                            {tag: 'label', childs: [
                                {tag: 'input', attr: {'data-id': agent._id, name: 'select', type: 'checkbox', class: 'select-box select-agent-added', value: 'all'}},
                                {tag: 'i', attr: {class: 'input-helper'}}
                            ]}
                        ]}
                    ]},
                    {tag: 'td', attr: {class: 'text-center'}, content: agent.displayName}
                ]
            }]));
        });
    };

    return {
        init: function () {
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            $(document).off('click', '#btn-filter');
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('change', '#select_all_added');
            $(document).off('change', '#idCompany');
            $(document).off('click', '#add-btn');
            $(document).off('click', '#remove-btn');
            $(document).off('click', '.zpaging');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);