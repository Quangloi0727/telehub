_.mixin(_.extend(s.exports(), {
    switch: function (val, arr1, arr2) {
        return arr2[arr1.indexOf(val)];
    },
    Tags: function (obj) {
        var output = '';
        _.each(obj, function (e) {
            if (!_.has(e, 'tag') || _.isEmpty(e) || _.isUndefined(e) || _.isNull(e)) return output;
            var _data = _.has(e, 'data') ? _.map(e.data, function (val, key) {
                return 'data-' + key + '="' + val + '"';
            }) : null,
                _attr = _.has(e, 'attr') ? _.map(e.attr, function (val, key) {
                    return key + '=' + _.quote(val) + '';
                }) : null,
                _sattr = _.has(e, 'sattr') ? e.sattr.join(' ') : '',
                _tooltip = _.has(e, 'tooltip') ? 'data-container="' + (e.tooltip.container || 'body') + '" data-placement="' + (e.tooltip.placement || 'top') + '" data-original-title="' + (e.tooltip.text || '') + '"' : '';
            output += '<' + e.tag + ' ' + _tooltip + ' ' + (_.isNull(_attr) ? '' : _attr.join(' ')) + ' ' + (_.isNull(_data) ? '' : _data) + _sattr + '>';
            if (_.has(e, 'childs') && !_.isEmpty(_.compact(e.childs))) {
                output += _.Tags(e.childs);
            }
            output += (e.content || '') + (_.has(e, 'notend') ? '' : '</' + e.tag + '>');
        });
        return _.clean(output);
    },
    paging: function (url, obj) {
        var output = '';
        for (var i = 0; i < obj.range.length; i++) {
            if (obj.range[i] == obj.current) {
                output += _.Tags([{ tag: 'li', attr: { class: 'active' }, childs: [{ tag: 'span', content: obj.range[i] }] }]);
            } else {
                output += _.Tags([{ tag: 'li', attr: { class: '' }, childs: [{ tag: 'a', attr: { href: url + '?page=' + obj.range[i] }, content: obj.range[i] }] }]);
            }
        }
        return _.Tags([{ tag: 'ul', attr: { class: 'pagination' }, content: output }]);
    }
}));
jQuery(document).ready(function ($) {
    $(this).off('click', 'button#btn-save-ticket');

    var refreshOption = function () {
        $('#ticket-accordion .dropdown-menu.inner li:first-child .text,#ticket-accordion .filter-option').each(function (i, e) {
            var $this = $(e);
            if (_.isEqual($this.text(), '---- Chọn ----')) {
                $this.closest('a').addClass('text-center text-muted').find('.check-mark').remove();
                $this.addClass('text-center');
            }
        });
    };
    var objectFormData = function (obj, form, namespace) {
        var fd = form || new FormData();
        var formKey;
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (namespace) {
                    formKey = namespace + '[' + property + ']';
                } else {
                    formKey = property;
                }
                if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
                    objectFormData(obj[property], fd, property);
                } else {
                    fd.append(formKey, obj[property]);
                }
            }
        }
        return fd;

    };

    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
    var customerID = (!_.isNull(_c) && _.has(_c, '_id')) ? _c._id : '';
    var windowParam = document.location.search.replace(/(^\?)/, '').split("&").map(function (n) {
        return n = n.split("="), this[n[0]] = n[1], this
    }.bind({}))[0];

    $('#ticket-accordion .panel-heading .panel-title a').on('click', function (e) {
        if ($(this).parents('.panel').children('.panel-collapse').hasClass('in')) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
    $('.selectpicker').selectpicker({ container: 'body' });
    $('.date-time-picker').datetimepicker({ locale: 'vi' });
    $('.date-picker').datetimepicker({ locale: 'vi', format: 'DD/MM/YYYY' });

    $(this).on('change', '#edit-ReasonCategoy', function () {
        var _id = $(this).val();
        var _reason = _.findWhere(ReasonCategoy, { _id: _id });
        $('#edit-Reason').html('<option value="">---- Chọn ----</option>').selectpicker('refresh');
        if (!_reason) {
            refreshOption();
            return;
        }
        _.each(_reason.Reason, function (r) {
            $('#edit-Reason').append('<option data-type="ticketReason" value="' + r._id + '" style="font-weight: bold">' + r.name + '</option>');
            if (r.subReason.length) {
                _.each(r.subReason, function (rs) {
                    $('#edit-Reason').append('<option data-type="ticketSubreason" data-parent="' + r._id + '" value="' + rs._id + '" style="text-indent: 5px">' + rs.name + '</option>');
                });
            }

        });
        $('#edit-Reason').selectpicker('refresh');
        refreshOption();
    });
    $(this).on('change', '#filter-ReasonCategoy', function () {
        var _id = $(this).val();
        var _reason = _.findWhere(ReasonCategoy, { _id: _id });
        $('#filter-Reason').html('<option value="">---- Chọn ----</option>').selectpicker('refresh');
        if (!_reason) {
            refreshOption();
            return;
        }
        _.each(_reason.Reason, function (r) {
            $('#filter-Reason').append('<optio data-type="ticketReason" value="' + r._id + '" style="font-weight: bold"n>' + r.name + '</option>')
            if (r.subReason.length) {
                _.each(r.subReason, function (rs) {
                    $('#filter-Reason').append('<option data-type="ticketSubreason" data-parent="' + r._id + '" value="' + rs._id + '" style="text-indent: 5px">' + rs.name + '</option>');
                });
            }
        });
        $('#filter-Reason').selectpicker('refresh');
        refreshOption();
    });
    $(this).on('change', '.modal #ticketReasonCategory', function () {
        var _id = $(this).val();
        var _reason = _.findWhere(ReasonCategoy, { _id: _id });
        $('.modal #ticketReason').html('<option value="">---- Chọn ----</option>').selectpicker('refresh');
        if (!_reason) {
            refreshOption();
            return;
        }
        _.each(_reason.Reason, function (r) {
            $('.modal #ticketReason').append('<option data-type="ticketReason" value="' + r._id + '" style="font-weight: bold">' + r.name + '</option>');
            if (r.subReason.length) {
                _.each(r.subReason, function (rs) {
                    $('.modal #ticketReason').append('<option data-type="ticketSubreason" data-parent="' + r._id + '" value="' + rs._id + '" style="text-indent: 5px">' + rs.name + '</option>');
                });
            }

        });
        $('.modal #ticketReason').selectpicker('refresh');
        refreshOption();
    });
    $(this).on('click', 'button#btn-save-ticket', function () {
        var _customer = _.pick($('form.panel-body').serializeObject(), _.identity);
        //if (!$('#edit-ReasonCategoy option:selected').val()) {
        //    swal({title: '', text: 'Chưa chọn nhóm tình trạng', type: 'warning'});
        //    return;
        //}
        //if (!$('#edit-Reason option:selected').val()) {
        //    swal({title: '', text: 'Chưa chọn tình trạng', type: 'warning'});
        //    return;
        //}

        $('body > .page-loader').show();
        var $this = $(this);
        async.waterfall([
            function (next) {
                $.ajax({ url: '/customer', method: 'POST', data: objectFormData(_customer), cache: false, contentType: false, processData: false }).done(function (resp) {
                    if (_.isEqual(resp.message, 'Bắt buộc nhập Số Điện Thoại hoặc E-Mail !')) {
                        next(resp.message, null);
                    } else {
                        next(null, resp.customer);
                    }
                });
            },
            function (cust, next) {
                customerID = cust._id;
                async.parallel({
                    customer: function (callback) {
                        $.ajax({ url: '/customer/' + customerID, method: 'PUT', data: objectFormData(_.pick(_.omit(_customer, '_id'), _.identity)), cache: false, contentType: false, processData: false }).done(function (resp) {
                            if (_.isEqual(resp.code, 500)) {
                                callback(resp.message, null);
                            } else {
                                var _container = _.capitalize(windowParam.type) + 'Container';
                                if (_.has(window.parent, _container) || _.has(window.parent[_container], 'updatedCustomer')) {
                                    window.parent[_container].updatedCustomer({ dialog: windowParam.dialogId, customer: _.extend(_customer, cust, resp.customer) });
                                }
                                _.each(_.extend(_customer, cust, resp.customer), function (v, k) {
                                    $('[name="' + k + '"]').val(v);
                                });
                                callback(null, resp.customer);
                            }
                        });
                    },
                    ticket: function (callback) {
                        var _reason = $('#edit-Reason option:selected');
                        var _assign = $('#edit-Assign option:selected');
                        var _data = {
                            idCustomer: cust._id,
                            ticketReasonCategory: $('#edit-ReasonCategoy option:selected').val() || '',
                            ticketReason: (_.isEqual(_reason.data('type'), 'ticketReason') ? _reason.val() : _reason.data('parent')) || '',
                            ticketSubreason: (_.isEqual(_reason.data('type'), 'ticketReason') ? '' : _reason.val()) || '',
                            note: $('#edit-Note').val() || '',
                            idAgent: (_.isEqual(_assign.data('type'), 'idAgent') ? _assign.val() : '') || '',
                            groupId: (_.isEqual(_assign.data('type'), 'groupId') ? _assign.val() : '') || '',
                            deadline: $('#edit-deadline').val(),
                            type: windowParam.type
                        };
                        _data.status = parseInt($('#edit-status').val()) || 0;
                        $.ajax({ url: '/ticket/' + $this.data('ticket-id'), method: 'PUT', data: objectFormData(_data), cache: false, contentType: false, processData: false }).done(function (r) {
                            callback(null, r);
                        });
                    }
                }, next);
            }
        ], function (error, result) {
            if (error) {
                swal({ title: error, type: 'error' });
            } else {
                swal({ title: 'Cập nhật thành công !', type: 'success' });
            }
            $('body > .page-loader').hide();
        });
    });
    $(this).on('click', 'button#btn-search-ticket', function () {
        if (!customerID) {
            swal({ title: 'Thông báo', text: 'Chưa có thông tin khách hàng !', type: 'info' });
            return;
        }
        $('body > .page-loader').show();
        var _data = _.pick(_.extend($('#tab-old-ticket > form').serializeObject(), { type: windowParam.type, idCustomer: customerID, _id: { $ne: $('#btn-save-ticket').data('ticket-id') } }), _.identity);
        $.get('/ticket?' + $.param(_data), function (resp) {
            var tBody = $('#tab-old-ticket .table tbody');
            tBody.empty();
            if (_.isEqual(resp.code, 200)) {
                _.each(resp.ticket, function (t) {
                    var _ticketReason = _.has(t, 'ticketReason') ? t.ticketReason.name : '';
                    if (_.has(t, 'ticketSubreason') && _.has(t.ticketSubreason, 'name')) _ticketReason = t.ticketSubreason.name;
                    tBody.append(_.Tags(
                        [
                            {
                                tag: 'tr', attr: { class: 'text-center' },
                                childs: [
                                    { tag: 'td', attr: { class: 'p-t-4 p-b-4' }, content: t.ticketReasonCategory ? t.ticketReasonCategory.name : '' },
                                    { tag: 'td', attr: { class: 'p-t-4 p-b-4' }, content: _ticketReason },
                                    { tag: 'td', attr: { class: 'p-t-4 p-b-4' }, content: t.note || '' },
                                    { tag: 'td', attr: { class: 'p-t-4 p-b-4' }, content: _.switch(t.status, [-1, 0, 1, 2], ['Không xử lý', 'Chờ xử lý', 'Đang xử lý', 'Hoàn thành']) },
                                    { tag: 'td', attr: { class: 'p-t-4 p-b-4' }, content: t.deadline ? moment(t.deadline).format('DD/MM/YYYY') : 'N/A' },
                                    { tag: 'td', attr: { class: 'p-t-4 p-b-4' }, content: t.updateBy ? t.updateBy.displayName : '' },
                                    { tag: 'td', attr: { class: 'p-t-4 p-b-4' }, content: t.updated ? moment(t.updated).format('DD/MM/YYYY') : 'N/A' },
                                    {
                                        tag: 'td',
                                        childs: [{ tag: 'button', attr: { class: 'btn btn-default btn-xs btn-view', type: 'button', id: t._id }, childs: [{ tag: 'i', attr: { class: 'zmdi zmdi-eye' } }] }]
                                    }
                                ]
                            }
                        ]
                    ));
                });
            }
            $('body > .page-loader').hide();
        });
    });
    $(this).on('click', 'button.btn-view', function () {
        var _id = $(this).attr('id');
        $.get('/ticket?' + $.param({ detail: true, _id: _id, type: windowParam.type, idCustomer: customerID }), function (resp) {
            if (_.isEqual(resp.code, 200)) {
                var $ticketReasonCategory = $('.modal #ticketReasonCategory');
                var $ticketReason = $('.modal #ticketReason');

                async.waterfall([
                    function (callback) {
                        $ticketReasonCategory.val('');//.off('change');
                        $ticketReason.html('<option value="">---- Chọn ----</option>');
                        $('.modal #deadline').val(moment(resp.ticket.deadline).format('DD/MM/YYYY HH:mm'));
                        $('.modal select#status').selectpicker('val', resp.ticket.status.toString());
                        $('.modal #edit-Note').val(resp.ticket.note);
                        $('.modal select#status option[value="' + resp.ticket.status.toString() + '"]').attr('selected', true).siblings().removeAttr('selected');
                        if (_.has(resp.ticket, 'groupId') && !_.isNull(resp.ticket.groupId)) $('.modal #edit-Assign').selectpicker('val', _.trim(resp.ticket.groupId.toString()));
                        if (_.has(resp.ticket, 'idAgent') && !_.isNull(resp.ticket.idAgent)) $('.modal #edit-Assign').selectpicker('val', _.trim(resp.ticket.idAgent.toString()));

                        if (resp.ticket.ticketReasonCategory) {
                            $ticketReasonCategory.val(resp.ticket.ticketReasonCategory._id);
                            var _reason = _.findWhere(ReasonCategoy, { _id: resp.ticket.ticketReasonCategory._id });
                            _.each(_reason.Reason, function (r) {
                                $ticketReason.append('<option data-type="ticketReason" value="' + r._id + '" style="font-weight: bold" >' + r.name + '</option>');
                                if (r.subReason.length && _.has(resp.ticket, 'ticketSubreason')) {
                                    _.each(r.subReason, function (rs) {
                                        $ticketReason.append('<option data-type="ticketSubreason" data-parent="' + r._id + '" value="' + rs._id + '" style="text-indent: 5px"  >' + rs.name + '</option>');
                                    });
                                }
                            });
                            if (_.has(resp.ticket, 'ticketReason')) $ticketReason.val(resp.ticket.ticketReason._id);
                            if (_.has(resp.ticket, 'ticketSubreason')) $ticketReason.val(resp.ticket.ticketSubreason._id);
                            callback(null);
                        } else {
                            callback(null);
                        }
                    },
                    function (callback) {
                        callback(null);
                    }
                ], function (error, result) {
                    $ticketReasonCategory.selectpicker('refresh');
                    $ticketReason.selectpicker('refresh');
                    $('#myModal').modal('show');
                });
                //$('.modal #ticketReasonCategory').val(resp.ticket.ticketReasonCategory._id).selectpicker('refesh');
                //var _reason = _.findWhere(ReasonCategoy, {_id: _id});
                //$('.modal #ticketReason').html('<option value="">---- Chọn ----</option>').selectpicker('refresh');
                //if (_reason) {
                //    _.each(_reason.Reason, function (r) {
                //        $('.modal #ticketReason').append('<option data-type="ticketReason" value="' + r._id + '" style="font-weight: bold" ' + (_.isEqual(resp.ticket.ticketReason._id, r._id) ? 'seleted' : '') + '>' + r.name + '</option>');
                //        if (r.subReason.length) {
                //            _.each(r.subReason, function (rs) {
                //                $('.modal #ticketReason').append('<option data-type="ticketSubreason" data-parent="' + r._id + '" value="' + rs._id + '" style="text-indent: 5px" ' + (_.isEqual(resp.ticket.ticketSubreason._id, rs._id) ? 'seleted' : '') + '>' + rs.name + '</option>');
                //            });
                //        }
                //    });
                //}
                //$('.modal #ticketReason').selectpicker('refresh');
                //$('.modal #deadline').val(moment(resp.ticket.deadline).format('DD/MM/YYYY'));
                //$('.modal #status').val(resp.ticket.status).selectpicker('refesh');
                //$('#myModal').modal('show');
            }

        });
    });
    $(this).on('click', '.modal button.btn-primary', function () {
        swal({ title: 'Cập nhật thành công !', type: 'info' });
    });
    refreshOption();
    $('body > .page-loader').hide();
    if (_.has(window.parent, 'setTicketId')) window.parent.setTicketId(windowParam.type, windowParam.dialogId, $('#btn-save-ticket').data('ticket-id'));

});

