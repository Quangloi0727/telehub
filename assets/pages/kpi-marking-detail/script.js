/**
 * Created by NghiaTM on 6/1/2016.
 */

var DFT = function ($) {
    var _recordHost = '';

    var initTable = function () {
        //Todo: Tạo bảng danh sách các ticket cần chấm
        //Todo: Sinh các cột theo các tiêu chí
        var head = [];
        head.push({tag: 'th', attr: {class: 'bgm-orange c-white text-center'}, content: "STT"});
        head.push({tag: 'th', attr: {class: 'bgm-orange c-white text-center'}, content: "Dự án"});
        head.push({tag: 'th', attr: {class: 'bgm-orange c-white text-center'}, content: "ĐTV"});
        head.push({tag: 'th', attr: {class: 'bgm-orange c-white text-center'}, content: "Ngày tạo"});
        head.push({tag: 'th', attr: {class: 'bgm-orange c-white text-center'}, content: "Ngày chấm"});
        head.push({tag: 'th', attr: {class: 'bgm-orange c-white text-center'}, content: "Số ĐT gọi"});
        head.push({tag: 'th', attr: {class: 'bgm-orange c-white text-center'}, content: "Nội dung cuộc gọi"});
        for (var i = 0; i < criteria.length; i++) {
            var item = {tag: 'th', attr: {class: 'bgm-orange c-white text-center'}, content: criteria[i].name};
            head.push(item);
        }
        head.push({tag: 'th', attr: {class: 'bgm-orange c-white text-center'}, content: "Tác vụ"});
        $("#headrow").append(_.Tags(head));

        //Todo: Sinh các ticket
        async.forEachOf(tickets, function(ticket, index, cb){
            _markingFunc[ticket.idTicket._id] = [];
            var company = (_.isNull(ticket.idTicket.idCampain)) ? ticket.idTicket.idService.idCompany : ticket.idTicket.idCampain.idCompany;
            var col = [];

            col.push({tag: 'td', content: index + 1});
            col.push({tag: 'td', content: company.name});
            col.push({tag: 'td', content: ticket.idTicket.idAgent.displayName + " (" + ticket.idTicket.idAgent.name + ")"});
            col.push({tag: 'td', content: moment(ticket.idTicket.created).format("DD/MM/YYYY HH:mm")});
            col.push({tag: 'td', attr: {class: 'updated'}, content: ticket['idMarking']  ? moment(ticket.idMarking.updated).format("DD/MM/YYYY HH:mm" +
                "") : ''});
            col.push({tag: 'td', content: ticket['customerindex']['field_so_dien_thoai']});
            if (ticket.cdrTransInfos.length > 0 && ticket.cdrTransInfos[0].recordPath){
                //col.push({tag: 'td', content: (ticket.cdrTransInfos.length > 0 && ticket.cdrTransInfos[0].recordPath) ? _recordHost + ticket.cdrTransInfos[0].recordPath : ''});
                col.push({tag: 'td', attr: {class: 'text-center'}, childs: [
                    {tag: 'audio', attr: {id: 'myAudio', src: _recordHost + ticket.cdrTransInfos[0].recordPath, type: 'audio/wav'}},
                    {tag: 'button', attr: {class: 'btn btn-default playAudio', type: 'button'}, childs: [
                        {tag: 'i', attr: {class: 'zmdi zmdi-play f-25', style: 'display: inline-block;'}},
                        {tag: 'i', attr: {class: 'zmdi zmdi-pause f-25', style: 'display: none;'}}
                    ]}
                ]});
            }
            else{
                col.push({tag: 'td', content: ''});
            }

            for (var i = 0; i < criteria.length; ++i) {
                if (_.isEqual(criteria[i].type, 0)) {
                    //Dữ liệu number
                    col.push({
                        tag: 'td', childs: [
                            {
                                tag: 'input',
                                attr: {
                                    class: "form-control criteria " + ticket.idTicket._id,
                                    'data-id': ticket.idTicket._id,
                                    'min-value': criteria[i].content[0],
                                    'max-value': criteria[i].content[1],
                                    type: 'number',
                                    name: criteria[i].modalName,
                                    id: criteria[i].modalName,
                                    value: ticket['idMarking'] ? ticket.idMarking.datas[criteria[i].modalName].value : ''
                                }
                            }
                        ]
                    });

                } else if (_.isEqual(criteria[i].type, 1)) {
                    //Dữ liệu dạng selection
                    var options = [];
                    options.push({tag:'option', attr:{ value: -1}, sattr: ['disabled'], content: "-- Chọn --"})
                    _.each(criteria[i].content, function (content, index) {
                        options.push({tag: 'option', attr: {value: index}, sattr: (ticket.idMarking && ticket.idMarking.datas[criteria[i].modalName] && _.isEqual(parseInt(ticket.idMarking.datas[criteria[i].modalName].value), index)) ? ['selected'] : [''], content: content});
                    });
                    col.push({
                        tag: 'td', childs: [
                            {
                                tag: 'select',
                                attr: {
                                    class:"criteria selectpicker "+ ticket.idTicket._id,
                                    'data-id': ticket.idTicket._id,
                                    id: criteria[i].modalName,
                                    name: criteria[i].modalName
                                },
                                childs: options
                            }
                        ]
                    });
                } else if (_.isEqual(criteria[i].type, 2)) {
                    //Dữ liệu dạng công thức
                    col.push({tag: 'td', attr: {class: 'text-center'}, childs: [
                        {tag: 'label', attr: {class: 'text-center criteria ' + ticket.idTicket._id, 'data-id': ticket.idTicket._id, 'data-func': criteria[i].contentBase64, name: criteria[i].modalName, id: criteria[i].modalName}, content: ticket['idMarking'] ? ticket.idMarking.datas[criteria[i].modalName].value : ''}
                    ]})
                }

            }

            col.push({tag: 'td', attr: {class: 'text-center'}, childs:[
                {tag: 'a', attr: {role: 'button', class: 'btn-flat-bg apply-single', 'data-toggle': 'tooltip', 'data-placement': 'top', 'data-original-title': 'Apply', 'data-id': ticket.idTicket._id, 'mark-data-id': ticket.idData, agentId: ticket.idTicket.idAgent._id, idCollection: criteria[0].idCollection, ticketMarkId: ticket._id}, childs: [
                    {tag: 'i', attr: {class: 'zmdi zmdi-check green f-17'}}
                ]}
            ]});

            var row = _.Tags([
                {tag: 'tr', childs: col}
            ]);
            $("tbody").append(row);
            $(".selectpicker").selectpicker('refresh');
            cb();
        }, function(err, resp){
            if (!err){
                onChange();
            }
        });
    }

    //Helper method: lấy danh sách các tham số function yêu cầu
    var getArgs = function(func) {
        // First match everything inside the function argument parens.
        var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function(arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function(arg) {
            // Ensure no undefined values are added.
            return arg;
        });
    }

    var onChange = function(){
        //Todo: Check danh sách công thức xem đã đủ để tính chưa
        for (var i = 0; i < criteria.length; i++) {
            if (_.isEqual(criteria[i].type, 2)) {
                var contentBase64 = criteria[i].contentBase64;
                var content = decodeURIComponent(window.atob(contentBase64)); //nội dung công thức
                var f = eval("("+content+")");
                _.each(_.keys(_markingFunc), function(key){
                    _markingFunc[key].push({
                        cb: function(selector, f, contentBase64){
                            var args = [];
                            var self = selector;
                            var aggRequired = getArgs(f);
                            //Todo: Check danh sách dữ liệu
                            async.each(aggRequired, function(agg, next){
                                var $val = selector.closest('tr').find('#' + agg).val();
                                if ($val.length){
                                    args.push(Number($val));
                                    next();
                                }
                                else{
                                    $($('label.' + self.attr('data-id') + '[data-func="' + contentBase64 +'"]')[length - 1]).text('');
                                    next('--chua du argument--');
                                }
                            }, function(err, resp){
                                if (!err){
                                    //Todo: Đã đủ dữ liệu, tính công thức với các tham số đã nhập
                                    var length = $('label.' + self.attr('data-id') + '[data-func="' + contentBase64 +'"]').length;
                                    $($('label.' + self.attr('data-id') + '[data-func="' + contentBase64 +'"]')[length - 1]).text(f.apply(this, args));
                                }
                            });
                        },
                        contentBase64: contentBase64,
                        f: f
                    });
                });

                $('input.criteria').on('change', function(){
                    //Todo: Bắt sự kiện khi các textbox thay đổi giá trị
                    var self = $(this);
                    _.each(_markingFunc[self.attr('data-id')], function(fc){
                        fc.cb(self, fc.f, fc.contentBase64);
                    });
                })

                $('select.criteria').on('change', function(){
                    //Todo: Bắt sự kiện khi các selection thay đổi giá trị
                    var self = $(this);
                    _.each(_markingFunc[self.attr('data-id')], function(fc){
                        fc.cb(self, fc.f, fc.contentBase64);
                    });
                })
            }
        }
    };

    var bindClick = function(){
        $(document).on('click', '.playAudio', function(){
            //Todo: play file ghi âm
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

        $(document).on('click', '.apply-single', function(e){
            //Todo: Xác nhận chấm điểm
            e.preventDefault();
            $('.formError').remove();
            var id = $(this).attr('data-id');
            var notFill = false;
            var err = false;
            var params = {};
            var kpi_maxInput = 0;
            var kpi_sum = 0;
            //Todo: Check giá trị các field chấm đã đủ và hợp lệ chưa
            $.map($(this).closest('tr').find('td'), function (td, i) {
                var el = td.children[0];
                if ($(el).is('input')){
                    if (!_.isEqual($(el).val(), '') && !_.isNull($(el).val())) {
                        var minValue = parseInt($(el).attr('min-value'));
                        var maxValue = parseInt($(el).attr('max-value'));
                        params[el.name] = {type: 0, minValue: minValue, maxValue: maxValue};
                        if (parseInt($(el).val()) >= minValue && parseInt($(el).val()) <= maxValue){
                            kpi_maxInput += maxValue;
                            kpi_sum += parseInt($(el).val());
                            params[el.name].value = parseInt($(el).val());
                        }
                        else{
                            $(el).validationEngine('showPrompt', 'Giá trị nhập vào phải nằm trong đoạn từ ' + minValue + ' đến ' + maxValue, 'error', 'topRight', true);
                            err = true;
                        }
                    }
                    else{
                        notFill = true;
                    }
                }
                else if ($(el).is('select')){
                    params[$(el).attr('name')] = {type: 1};
                    if ($(el).val()){
                        params[$(el).attr('name')].value = $(el).val();
                    }
                }
                else if($(el).is('label')){
                    params[$(el).attr('name')] = {type: 2};
                    if (!_.isEqual($(el).text(), '') && !_.isNull($(el).text())) {
                        params[$(el).attr('name')].value = $(el).text();
                    }
                    else{
                        notFill = true;
                    }
                }
            });
            if (!err){
                if (notFill){
                    //Chưa chấm đủ
                    swal({
                        title: 'Thông báo',
                        text: 'Chưa chấm đủ yêu cầu',
                        type: "warning", confirmButtonColor: "#DD6B55", confirmButtonText: "Quay lại!", closeOnConfirm: true
                    });
                }
                else{
                    //Đã chấm đủ, lưu lại vào db
                    params['ticketId'] = $(this).attr('data-id');
                    params['agentId'] = $(this).attr('agentId');
                    params['idCollection'] = $(this).attr('idCollection');
                    params['ticketMarkId'] = $(this).attr('ticketMarkId');
                    params['kpi_maxInput'] = kpi_maxInput;
                    params['kpi_sum'] = kpi_sum;

                    var self = $(this);
                    $('.page-loader').show();
                    $.ajax({
                        url: '/kpi-marking/' + $(this).attr('mark-data-id'),
                        data: JSON.stringify(params),
                        type: 'PUT',
                        contentType: 'application/json',
                        success: function (resp) {
                            $('.page-loader').hide();
                            self.closest('tr').find('.updated').text(moment(new Date()).format('DD/MM/YYYY HH:mm'));
                        }});
                }
            }
        });

        $(document).on('click', '.zmdi-refresh', function(){
            //Load lại trang
            _.LoadPage(window.location.hash);
        });
    };

    var _markingFunc = {};

    return {
        init: function () {
            $.get('/chat-client?queryType=6', function(resp){
                //Load dữ liệu từ server
                _recordHost = resp.recordPath.path;
                if ($('.pagination')[0]) {
                    delete window.location.obj.page;
                    var _url = $.param(window.location.obj);
                    $('.pagination a').each(function (i, v) {
                        $(v).attr('href', $(v).attr('href') + '&' + _url);
                    });
                }
                initTable();
                onChange();
                bindClick();
            });
        },
        uncut: function () {
            $(document).off('click', '.pagination');
            $(document).off('click', '.apply-single');
            $('.criteria').off('change');
            $(document).off('click', '.zmdi-refresh');
            $(document).off('click', '.playAudio');
        }
    };
}(jQuery);