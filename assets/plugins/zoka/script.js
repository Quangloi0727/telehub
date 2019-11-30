/**
 * Created by luongvanlam on 3/22/16.
 */
(function (exports) {
    if (typeof _.htmlTags == 'undefined') {
        _.htmlTags = function (obj) {
            var output = '';
            _.each(obj, function (e) {
                if (_.isObject(e) && _.has(e, 'tag')) {
                    var _data = _.has(e, 'data') ? _.map(e.data, function (val, key) {
                            return 'data-' + key + '="' + val + '"';
                        }) : null,
                        _attr = _.has(e, 'attr') ? _.map(e.attr, function (val, key) {
                            return key + '=' + _.quote(val) + '';
                        }) : null,
                        _sattr = _.has(e, 'sattr') ? e.sattr.join(' ') : '',
                        _tooltip = _.has(e, 'tooltip') ? 'data-container="' + (e.tooltip.container || 'body') + '" data-placement="' + (e.tooltip.placement || 'top') + '" data-original-title="' + (e.tooltip.text || '') + '"' : '';
                    output += '<' + e.tag + ' ' + _tooltip + ' ' + (_.isNull(_attr) ? '' : _attr.join(' ')) + ' ' + (_.isNull(_data) ? '' : _data) + _sattr + '>';
                    if (_.has(e, 'childs')) {
                        output += _.htmlTags(e.childs);
                    }
                    output += (e.content || '') + (_.has(e, 'notend') ? '' : '</' + e.tag + '>');
                } else {
                    output += '';
                }
            });
            return _.clean(output);
        };
    }

    String.prototype.zFormat = function () {
        var source = this;

        _.each(arguments, function (n, i) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
        return source;
    };

    function getString(obj) {
        if (_.isString(obj)) return obj;
        if (_.isNull(obj)) return '';
        return obj.toString();
    }

    function createRow(str) {
        var template = '<td class="text-center w-p-10-5">{0}</td>';
        return template.zFormat(str);
    }

    function genStatus(status) {
        switch (status) {
            case 1:
                return 'Đang xử lý';
            case 2:
                return 'Đã xử lý';
            default:
                return 'Chờ xử lý';
        }
    }

    function formatDate(date) {
        if (_.isNull(date)) return '';
        return moment(date).format('HH:mm DD/MM/YYYY')
    }

    var msToTime = function(s) {
        if(s == 0) return '00:00:00';
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        return _.pad(hrs, 2, '0') + ':' + _.pad(mins, 2, '0') + ':' + _.pad(secs, 2, '0');
    }

    function createTicketReasonCategory(ticket, ticketReasonCategory, type) {
        var isOutboundTicket = '';
        //if (ticket && !_.isNull(ticket.idCampain) && !type) {
        //    isOutboundTicket = 'disabled';
        //}

        var trc = _.reduce(ticketReasonCategory, function (memo, item) {
            var selected =  (ticket && ticket.idCampain) || _.isEqual(validObject(ticket, 'ticketReasonCategory'), item._id) ? 'selected' : '';
            var temp = {
                tag: 'option',
                attr: {value: item._id},
                sattr: [selected],
                content: item.name
            };
            memo.push(temp);
            return memo;
        }, [{
            tag: 'option',
            attr: {
                value: ''
            },
            content: '---- Chọn ----'
        }]);

        return _.htmlTags([
            {
                tag: 'div',
                attr: {class: 'p-l-5 p-r-5 col-xs-4 col-sm-3 col-md-3'},
                childs: [
                    {
                        tag: 'label',
                        attr: {
                            for: 'name',
                            class: 'control-label f-13 TXT_REASON_CATEGORY'
                        }
                    },
                    {
                        tag: 'div',
                        attr: {class: 'validate-select-picker'},
                        childs: [
                            {
                                tag: 'select',
                                attr: {
                                    class: 'tag-select ticketReasonCategory',
                                    name: 'ticketReasonCategory',
                                    id: 'ticketReasonCategory'
                                },
                                sattr: [isOutboundTicket],
                                childs: trc
                            }
                        ]
                    }
                ]
            }
        ]);
    }

    function createTicketSubReason(ticket, ticketReasonCategory, categoryId) {
        return _.htmlTags([
            {
                tag: 'div',
                attr: {class: 'p-l-5 p-r-5 col-xs-4 col-sm-3 col-md-3'},
                childs: [
                    {
                        tag: 'label',
                        attr: {
                            for: 'name',
                            class: 'control-label f-13 TXT_CURRENT_REASON'
                        }
                    },
                    {
                        tag: 'div',
                        attr: {class: 'validate-select-picker'},
                        childs: [
                            {
                                tag: 'select',
                                attr: {
                                    class: 'tag-select ticketSubreason',
                                    name: 'ticketSubreason',
                                    id: 'ticketSubreason'
                                },
                                childs: createTicketSubReasonRows(ticket, ticketReasonCategory, categoryId)
                            }
                        ]
                    }
                ]
            }
        ]);
    }

    function createTicketSubReasonRows(ticket, ticketReasonCategory, categoryId) {
        function tReasonOption(categoryId, reasonId, name, selected) {
            return {
                tag: 'option',
                attr: {
                    class: categoryId,
                    'data-tid': categoryId,
                    value: categoryId + '-' + reasonId,
                    style: 'font-weight: bold;font-style: italic;'
                },
                sattr: [selected],
                content: '<b>{0}</b>'.zFormat(name)
            };
        }

        function tSubreasonOptions(categoryId, reasonId, subReasonId, name, selected) {
            return {
                tag: 'option',
                attr: {
                    class: '{0} m-l-20 tReason'.zFormat(categoryId),
                    'data-tid': categoryId,
                    value: '{0}-{1}-{2}'.zFormat(categoryId, reasonId, subReasonId)
                },
                sattr: [selected],
                content: name
            };
        }

        if (_.isEmpty(categoryId) && _.has(ticket, 'idCampain') && !_.isNull(ticket.idCampain)) {
            categoryId = ticket.idCampain.idCategoryReason;
        }

        var startObj = [{
            tag: 'option',
            attr: {
                value: ''
            },
            content: '---- Chọn ----'
        }];

        return _.reduce(ticketReasonCategory, function (memo, category) {
            if (!_.isEqual(category._id, categoryId)) return memo;
            _.each(category.tReason, function (tReason, index) {
                var r_selected = _.isEqual(validObject(ticket, 'ticketReason'), tReason.trId)
                    ? 'selected'
                    : '';

                memo.push(tReasonOption(
                    category._id,
                    tReason.trId,
                    tReason.name,
                    r_selected)
                );

                _.each(tReason.subReason, function (el, index) {
                    var s_selected = _.isEqual(el._id, validObject(ticket, 'ticketSubreason'))
                        ? 'selected'
                        : '';
                    memo.push(tSubreasonOptions(
                        category._id,
                        tReason.trId,
                        el._id,
                        el.name,
                        s_selected
                    ));
                });
            });
            return memo;
        }, startObj);
    }

    function createDeadLineInput(ticket) {
        var deadLineValue = !_.isEmpty(ticket) ? ticket.deadline : '';
        return _.htmlTags([
            {
                tag: 'div',
                attr: {class: 'p-l-5 p-r-5 col-xs-4 col-sm-3 col-md-3'},
                childs: [
                    {
                        tag: 'label',
                        attr: {
                            class: 'control-label f-13 TXT_DEAD_LINE'
                        }
                    },
                    {
                        tag: 'div',
                        childs: [
                            {
                                tag: 'input',
                                attr: {
                                    type: 'text',
                                    class: 'form-control date-time-picker dropup',
                                    'data-date-format': 'HH:mm DD/MM/YYYY',
                                    id: 'deadline',
                                    name: 'deadline',
                                    placeholder: 'VD: 15:23 19/01/2016',
                                    value: moment(deadLineValue).format('HH:mm DD/MM/YYYY')
                                }
                            }
                        ]
                    }
                ]
            }
        ]);
    }

    function createStatusPicker(ticket) {
        var statusSelected = ['', '', ''];
        if (!_.isEmpty(ticket)) statusSelected[ticket.status] = 'selected';
        var statusContent = ['Chờ xử lý', 'Đang xử lý', 'Hoàn thành'];
        var optionArr = [];
        for (var i = 0; i < 3; ++i) {
            var temp = {
                tag: 'option',
                attr: {
                    value: i
                },
                sattr: [statusSelected[i]],
                content: statusContent[i]
            };
            optionArr.push(temp);
        }

        return _.htmlTags([
            {
                tag: 'div',
                attr: {class: 'p-l-5 p-r-5 col-xs-4 col-sm-3 col-md-3'},
                childs: [
                    {
                        tag: 'label',
                        attr: {class: 'control-label f-13 TXT_STATUS'}
                    },
                    {
                        tag: 'div',
                        childs: [
                            {
                                tag: 'select',
                                attr: {
                                    class: 'selectpicker',
                                    name: 'status',
                                    id: 'status'
                                },
                                childs: optionArr
                            }
                        ]
                    }
                ]
            }
        ]);
    }

    function createAssign(ticket, assign) {
        var startObj = [
            {
                tag: 'option',
                attr: {value: ''},
                content: '---- Chọn ----'
            }
        ];

        var assignValue = _.isEmpty(assign) ? '' : _.reduce(assign, function (memo, ag) {

            memo.push({
                tag: 'option',
                attr: {
                    value: 'g-{0}'.zFormat(ag._id)
                },
                content: '[Nhóm] {0}'.zFormat(ag.name)
            });

            _.each(ag.agl, function (leaders) {
                memo.push({
                    tag: 'option',
                    attr: {
                        class: 'assignLeaders m-l-20',
                        value: 'a-{0}'.zFormat(leaders._id)
                    },
                    content: '{0} ({1})'.zFormat(leaders.displayName, leaders.name)
                });
            });
            _.each(ag.agm, function (members) {
                memo.push({
                    tag: 'option',
                    attr: {
                        class: 'm-l-20',
                        value: 'a-{0}'.zFormat(members._id)
                    },
                    content: '{0} ({1})'.zFormat(members.displayName, members.name)
                });
            });
            return memo;
        }, startObj);

        return _.htmlTags([
            {
                tag: 'div',
                attr: {class: 'p-l-5 p-r-5 col-xs-6 col-sm-6 col-md-6'},
                childs: [
                    {
                        tag: 'label',
                        attr: {class: 'control-label f-13 TXT_ASSIGN'}
                    },
                    {
                        tag: 'select',
                        attr: {
                            class: 'tag-select',
                            name: 'assignTo',
                            id: 'assignTo'
                        },
                        childs: assignValue
                    }
                ]
            }
        ]);
    }

    function createNote(ticket) {
        var ticketNote = !_.isEmpty(ticket) ? ticket.note : '';
        return _.htmlTags([
            {
                tag: 'div',
                attr: {class: 'p-l-5 p-r-5 col-xs-12 col-sm-12 col-md-12'},
                childs: [
                    {
                        tag: 'label',
                        attr: {class: 'control-label f-13 TXT_NOTE'}
                    },
                    {
                        tag: 'div',
                        childs: [
                            {
                                tag: 'textarea',
                                attr: {
                                    style: 'resize: none;',
                                    rows: 5,
                                    class: 'form-control',
                                    name: 'note',
                                    id: 'note'
                                },
                                content: ticketNote
                            }
                        ]
                    }
                ]
            }
        ]);
    }

    function createCustomerStatisfy(ticket, statisfy) {
        if (_.isEmpty(statisfy)) return '';
        var optionArr = [{
            tag: 'option',
            attr: {value: ''},
            content: '---- Chọn ----'
        }];

        statisfy.forEach(function (el) {
            var selected = _.isEqual(el._id, ticket.customerStatisfy) ? 'selected' : '';
            optionArr.push({
                tag: 'option',
                attr: {
                    class: 'assignLeaders',
                    value: el._id
                },
                sattr: [selected],
                content: el.name
            });

            if (el.cs) {
                el.cs.forEach(function (item) {
                    var sel = _.isEqual(item._id, ticket.customerStatisfyStage) ? 'selected' : '';
                    optionArr.push({
                        tag: 'option',
                        attr: {
                            class: 'm-l-20',
                            value: el._id + '-' + item._id
                        },
                        sattr: [sel],
                        content: item.name
                    })
                });
            }
        });


        return _.htmlTags([
            {
                tag: 'div',
                attr: {class: 'p-l-5 p-r-5 col-xs-4 col-sm-3 col-md-3'},
                childs: [
                    {
                        tag: 'label',
                        attr: {class: 'control-label f-13 TXT_CUSTOMER_STATISFY'}
                    },
                    {
                        tag: 'div',
                        childs: [
                            {
                                tag: 'select',
                                attr: {
                                    class: 'tag-select',
                                    name: 'customerStatisfy',
                                    id: 'customerStatisfy'
                                },
                                childs: optionArr
                            }
                        ]
                    }
                ]
            }
        ]);
    }

    var showTicketInfo = function (ticket, ticketReasonCategory, assign, statisfy, type) {
        var ticketReasonCategoryHTML = createTicketReasonCategory(ticket, ticketReasonCategory, type);
        var ticketSubReason = createTicketSubReason(ticket, ticketReasonCategory);
        var deadLine = createDeadLineInput(ticket);
        var status = createStatusPicker(ticket);
        var assignTo = createAssign(ticket, assign);
        var customerStatisfy = createCustomerStatisfy(ticket, statisfy);
        var note = createNote(ticket);

        return ticketReasonCategoryHTML + ticketSubReason + deadLine + status + assignTo + customerStatisfy + note;
    };

    var showCallLogs = function (arr) {
        var html = '';
        _.each(arr, function(log){
            html += '<tr>';
            html += '<td>'+ log.caller +'</td>';
            html += '<td>'+ log.called +'</td>';
            html += '<td>'+ formatDate(log.startTime) +'</td>';
            html += '<td>'+ msToTime(log.callDuration) +'</td>';

            var buttonAction = '<audio id="myAudio"' +
                '<source src="'+ log.recordPath +'" type="audio/mp4">' +
                'Your user agent does not support the HTML5 Audio element.'+
                '</audio>' +
                '<button class="btn btn-default playAudio" type="button">' +
                '<i class="zmdi zmdi-play f-12" ></i>' +
                '<i class="zmdi zmdi-pause f-12" style="display: none;"></i>' +
                '</button>' +
                '<button class="btn btn-default m-l-10" type="button">' +
                '<a href="'+ log.recordPath +'" download><i class="zmdi zmdi-download zmdi-hc-fw download-audio f-12" data-url="'+ log.recordPath +'"></i></a>' +
                '</button>';

            html += '<td>'+ buttonAction +'</td>';

            html += '</tr>';
        });

        return '<table class="table table-fix table-fixed-header f-12">' +
            '<thead class="header">' +
            '<th class="text-center w-p-12-5 TXT_CALLLOGS_CALLER"></th>' +
            '<th class="text-center w-p-12-5 TXT_CALLLOGS_CALLED"></th>' +
            '<th class="text-center w-p-12-5 TXT_CALLLOGS_TIME"></th>' +
            '<th class="text-center w-p-12-5 TXT_CALLLOGS_DURATION"></th>' +
            '<th class="text-center w-p-12-5 TXT_CALLLOGS_RECORD"></th>' +
            '</thead>' +
            '</table>' +
            '<div class="table-responsive p-relative text-center f-12">' +
            '<table class="table table-fix table-fixed-header">' +
            '<tbody id="ticket-call-logs">' + html + '</tbody>' +
            '</table>' +
            '</div>';
    };

    var showTicketList = function (currentTicket, arr, isShowButton) {
        var html = showTicketListBody(arr, isShowButton);

        var searchForm = _.htmlTags([
            {
                tag: 'thead',
                attr: {id: 'searchRelateTicket'},
                childs: [{
                    tag: 'tr',
                    attr: {class: 'filter'},
                    childs: [
                        {
                            tag: 'td',
                            childs: [
                                {
                                    tag: 'input',
                                    attr: {
                                        class: 'form-control searchColumn text-center f-12',
                                        type: 'text',
                                        id: 'company',
                                        name: 'company'
                                    }
                                }
                            ]
                        },
                        {
                            tag: 'td',
                            childs: [
                                {
                                    tag: 'input',
                                    attr: {
                                        class: 'form-control searchColumn text-center f-12',
                                        type: 'text',
                                        id: 'ticketReasonCategory',
                                        name: 'ticketReasonCategory'
                                    }
                                }
                            ]
                        },
                        {
                            tag: 'td',
                            childs: [
                                {
                                    tag: 'input',
                                    attr: {
                                        class: 'form-control searchColumn text-center f-12',
                                        type: 'text',
                                        id: 'ticketSubreason',
                                        name: 'ticketSubreason'
                                    }
                                },
                            ]
                        },
                        {
                            tag: 'td',
                            childs: [
                                {
                                    tag: 'input',
                                    attr: {
                                        class: 'form-control searchColumn text-center f-12',
                                        type: 'text',
                                        id: 'ticketNote',
                                        name: 'ticketNote'
                                    }
                                },
                            ]
                        },
                        {
                            tag: 'td',
                            childs: [
                                {
                                    tag: 'select',
                                    attr: {
                                        class: 'selectpicker searchColumn text-center f-12',
                                        name: 'status',
                                        id: 'search_status'
                                    },
                                    childs: [
                                        {
                                            tag: 'option',
                                            attr: {
                                                class: 'f12',
                                                value: ''
                                            },
                                            content: '---- Chọn ----',
                                            sattr: ['selected']
                                        },
                                        {
                                            tag: 'option',
                                            attr: {
                                                class: 'f12 TXT_STATUS_WAITING',
                                                value: '0'
                                            }
                                        },
                                        {
                                            tag: 'option',
                                            attr: {
                                                class: 'f12 TXT_STATUS_PROCESS',
                                                value: '1'
                                            }
                                        },
                                        {
                                            tag: 'option',
                                            attr: {
                                                class: 'f12 TXT_STATUS_DONE',
                                                value: '2'
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: 'td',
                            childs: [
                                {
                                    tag: 'div',
                                    attr: {class: 'input-group'},
                                    childs: [
                                        {
                                            tag: 'input',
                                            attr: {
                                                class: 'form-control date-picker searchColumn f-12',
                                                type: 'text',
                                                id: 'ticketDeadline',
                                                name: 'ticketDeadline'
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: 'td',
                            childs: [
                                {
                                    tag: 'input',
                                    attr: {
                                        class: 'form-control searchColumn text-center f-12',
                                        type: 'text',
                                        id: 'ticketUpdateBy',
                                        name: 'ticketUpdateBy'
                                    }
                                }
                            ]
                        },
                        {
                            tag: 'td',
                            childs: [
                                {
                                    tag: 'div',
                                    attr: {class: 'input-group'},
                                    childs: [
                                        {
                                            tag: 'input',
                                            attr: {
                                                class: 'form-control date-picker searchColumn f-12',
                                                type: 'text',
                                                id: 'ticketUpdateDate',
                                                name: 'ticketUpdateDate'
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: 'td',
                            attr: {
                                class: 'text-center'
                            },
                            childs: [
                                {
                                    tag: 'button',
                                    attr: {
                                        class: 'btn btn-primary btn-block waves-effect',
                                        type: 'button',
                                        id: 'searchTicket',
                                        'data-id': _.isEmpty(currentTicket) ? '' : currentTicket.idCustomer,
                                        'data-ticket-id': (_.isEmpty(currentTicket) ? '' : currentTicket._id)
                                    },
                                    childs: [
                                        {
                                            tag: 'i',
                                            attr: {class: 'zmdi zmdi-search'}
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }]
            }
        ]);

        return '<table class="table table-fix table-fixed-header f-12">' +
            '<thead class="header">' +
            '<th class="text-center w-p-12-5 TXT_COMPANY"></th>' +
            '<th class="text-center w-p-12-5 TXT_REASON_CATEGORY"></th>' +
            '<th class="text-center w-p-12-5 TXT_CURRENT_REASON"></th>' +
            '<th class="text-center w-p-12-5 TXT_NOTE"></th>' +
            '<th class="text-center w-p-12-5 TXT_STATUS"></th>' +
            '<th class="text-center w-p-12-5 TXT_DEAD_LINE"></th>' +
            '<th class="text-center w-p-12-5 TXT_UPDATED_BY"></th>' +
            '<th class="text-center w-p-12-5 TXT_UPDATED_DATE"></th>' +
            (isShowButton ? '<th class="text-center w-p-12-5"></th>' : '') +
            '</thead>' +
            (isShowButton ? searchForm : '') +
            '</table>' +
            '<div class="table-responsive p-relative text-center f-12">' +
            '<table class="table table-fix table-fixed-header">' +
            '<tbody id="ticket-history-list">' + html + '</tbody>' +
            '</table>' +
            '</div>';
    };

    var showTicketListBody = function (arr, isShowButton) {
        var html = '';
        if (!_.isEmpty(arr)) {
            _.each(arr, function (data) {
                data = (typeof data.toObject === 'function') ? data.toObject() : data;
                if (_.has(data, 'ticketObject')) data = data.ticketObject;
                var ticketReason = '';
                if (!!validObject(data, 'ticketSubreason', 'name')) {
                    ticketReason = data.ticketSubreason.name;
                } else if (!!validObject(data, 'ticketReason', 'name')) {
                    ticketReason = data.ticketReason.name;
                }

                var updateBy = '';
                if (validObject(data, 'updateBy', 'displayName') !== '') {
                    updateBy = validObject(data, 'updateBy', 'displayName') + ' (' + validObject(data, 'updateBy', 'name') + ')';
                }

                html += '<tr>';
                //trungdt jira 919
                var company = data.idService ? data.idService : data.idCampain;
                company = company.idCompany ? company.idCompany.name : '';
                html += createRow(company);
                //trungdt jira 919
                html += createRow(validObject(data, 'ticketReasonCategory', 'name'));
                html += createRow(ticketReason);
                html += createRow(data.note);
                html += createRow(genStatus(data.status));
                html += createRow(formatDate(data.deadline));
                html += createRow(updateBy);
                html += createRow(formatDate(data.updated));

                if (isShowButton) html += ('<td>' +
                '<button style="width: 100%;" type="button" data-id="' + data._id + '" class="btn-default btn btn-xs f-11 btn-detail">' +
                '<span class="' + (data.idCampain ? 'TXT_TICKET_OUT' : 'TXT_TICKET_IN') + '"></span>' +
                '<i class="zmdi zmdi-arrow-forward m-l-5"></i>' +
                '</button>' +
                '</td>');
                html += '</tr>';
            });
        }
        return html;
    };

    var createPaging = function (paging) {
        if (!paging) return '';

        var firstPageHtml = _.htmlTags([
            {
                tag: 'li',
                childs: [
                    {
                        tag: 'a',
                        attr: {
                            class: 'zpaging',
                            'data-link': '{0}&page={1}'.zFormat(paging.prelink, paging.first)
                        },
                        content: '&laquo;'
                    }
                ]
            }
        ]);

        var prevPageHtml = _.htmlTags([
            {
                tag: 'li',
                childs: [
                    {
                        tag: 'a',
                        attr: {
                            class: 'zpaging',
                            'data-link': '{0}&page={1}'.zFormat(paging.prelink, paging.previous)
                        },
                        content: '&lsaquo;'
                    }
                ]
            }
        ]);

        var pageNextHtml = _.htmlTags([
            {
                tag: 'li',
                childs: [
                    {
                        tag: 'a',
                        attr: {
                            class: 'zpaging',
                            'data-link': '{0}&page={1}'.zFormat(paging.prelink, paging.next)
                        },
                        content: '&rsaquo;'
                    }
                ]
            }
        ]);

        var pageLastHtml = _.htmlTags([
            {
                tag: 'li',
                childs: [
                    {
                        tag: 'a',
                        attr: {
                            class: 'zpaging',
                            'data-link': '{0}&page={1}'.zFormat(paging.prelink, paging.last)
                        },
                        content: '&raquo;'
                    }
                ]
            }
        ]);

        var firstPage = paging.first ? firstPageHtml : '';
        var prePage = paging.previous ? prevPageHtml : '';
        var pageNum = '';
        for (var i = 0; i < paging.range.length; i++) {
            if (paging.range[i] == paging.current) {
                pageNum += _.htmlTags([
                    {
                        tag: 'li',
                        attr: {class: 'active'},
                        childs: [
                            {
                                tag: 'span',
                                content: paging.range[i]
                            }
                        ]
                    }
                ]);
            } else {
                pageNum += _.htmlTags([
                    {
                        tag: 'li',
                        childs: [
                            {
                                tag: 'a',
                                attr: {
                                    class: 'zpaging',
                                    'data-link': '{0}&page={1}'.zFormat(paging.prelink, paging.range[i])
                                },
                                content: paging.range[i]
                            }
                        ]
                    }
                ]);
            }
        }
        var pageNext = paging.next ? pageNextHtml : '';
        var pageLast = paging.last ? pageLastHtml : '';
        return '<div class="paginate text-center">' + '<ul class="pagination">' + firstPage + prePage + pageNum + pageNext + pageLast + '</ul></div>';
    };

    var sortQuestion = function(survey, sortObj){
        if(survey.length == 1) {
            sortObj.push(survey[0]);
            survey.splice(0, 1);
        }else if(sortObj.length == 0 && survey.length > 0){
            sortObj.push(survey[0]);
            survey.splice(0, 1);
            sortQuestion(survey, sortObj);
        }else if(survey.length > 1){
            var lastObj = sortObj[sortObj.length - 1];
            var bool = 0;
            if(lastObj.idNextQuestion){
				// fuck javascript, if you use each el may be 'undefined'
				for (var i = 0; i < survey.length; i++) {
					var el = survey[i];
					if(_.isEqual(el._id.toString(), lastObj.idNextQuestion.toString())){
						bool = 1;
						sortObj.push(el);
						survey.splice(i, 1);
					}
				}
                /*_.each(survey, function(el,i){
                    if(_.isEqual(el._id.toString(), lastObj.idNextQuestion.toString())){
                        bool = 1;
                        sortObj.push(el);
                        survey.splice(i, 1);
                    }
                });*/
            };
            if(!bool){
                sortObj.push(survey[0]);
                survey.splice(0, 1);
            }
            sortQuestion(survey, sortObj);
        }
    };

    var createSurvey = function (survey, surveyResult, formIdentify, ticket) {
        var tabContent = [];
        var tabNumber = [];

        var surveyResultQuestion = _.map(_.pluck(surveyResult, 'idQuestion'), function (item) {
            if (_.isNull(item)) return null;
            if (_.isString(item)) return item;
            return item.toString();
        });

        var surveyResultAnswer = _.map(_.pluck(surveyResult, 'answerContent'), function (item) {
            if (_.isNull(item)) return null;
            if (_.isString(item)) return item;
            return item.toString();
        });

        survey = _.chain(survey)
            .sortBy('isStart')
            .reverse()
            .value();

        var sortObj = [];
        sortQuestion(survey, sortObj);

        sortObj.forEach(function (el, i) {
            var active = (i == 0) ? 'active' : '';

            var questionId = _.isString(el._id) ? el._id : el._id.toString();
            el.result = _.chain(el.result).filter(function(el2){
                return _.isEqual(el2.idTicket.toString(), ticket._id.toString());
            }).compact().value();

            var curResult = _.find(surveyResult, function(el2){
                return _.isEqual(el2.idQuestion.toString(), el._id.toString());
            });

            var answer = '';
            if (surveyResultQuestion.indexOf(questionId) >= 0) {
                var index = surveyResultQuestion.indexOf(questionId);
                answer = surveyResultAnswer[index];
            }

            var data = [];
            switch (el.answerType) {
                case 1:
                    _.each(el.sa, function (item) {
                        if (el.questionType == 0) {
                            data.push(createRadio(item.content, item._id, el._id, answer));
                        } else {
                            data.push(createCheckBox(item.content, item._id, el._id, answer));
                        }
                    });
                    break;
                case 2:
                    data.push(createInputNumber('chamdiem', el._id, answer));
                    break;
                case 3:
                    data.push(createInputText('layykien', el._id, answer));
                    break;
            }


            data.push(
                {
                    tag: 'br'
                },
                {
                    tag: 'div',
                    attr: {class: 'form-group m-l-1'},
                    childs: [
                        {
                            tag: 'label',
                            attr: {for: 'answerNote'},
                            content: 'Ghi chú'
                        },
                        {
                            tag: 'textarea',
                            attr: {
                                name: 'answerNote-{0}'.zFormat(el._id),
                                class: 'form-control',
                                style: 'resize:vertical ; width: 99%',
                                rows: 3,
                                id: 'answerNote'
                            },
                            content: curResult ? curResult.answerNote : ''
                        }
                    ]
                }
            );

            tabContent.push({
                tag: 'div',
                attr: {
                    class: 'tab-pane {0} {1}'.zFormat(active, el._id),
                    id: 'survey-{0}-{1}'.zFormat(ticket._id, i)
                },
                childs: [
                    {
                        tag: 'div',
                        attr: {
                            class: 'survey-panel form-group'
                        },
                        childs: [
                            {
                                tag: 'label',
                                content: '{0}. {1}'.zFormat(i + 1, el.content)
                            },
                            {
                                tag: 'div',
                                childs: data
                            }
                        ]

                    }
                ]
            });

            tabNumber.push({
                tag: 'li',
                attr: {
                    class: 'survey-tab {0} {1}'.zFormat(active, el._id),
                    'data-next-question' : sortObj[i+1] ? sortObj[i+1]._id : null
                },
                childs: [
                    {
                        tag: 'a',
                        attr: {
                            href: '#survey-{0}-{1}'.zFormat(ticket._id, i),
                            'data-toggle': 'tab'
                        },
                        content: 'Câu hỏi {0}'.zFormat(i + 1)
                    }
                ]
            })
        });

        return _.htmlTags([
            {
                tag: 'h3',
                content: 'Câu hỏi khảo sát'
            },
            {
                tag: 'hr'
            },
            {
                tag: 'div',
                attr: {class: 'col-xs-10 m-0'},
                childs: [
                    {
                        tag: 'div',
                        attr: {class: 'tab-content'},
                        childs: tabContent
                    }
                ]
            },
            {
                tag: 'div',
                attr: {class: 'col-xs-2'},
                childs: [
                    {
                        tag: 'ul',
                        attr: {class: 'nav nav-tabs tabs-right'},
                        childs: tabNumber
                    }
                ]
            },
            {
                tag: 'div',
                attr: {class: 'col-sm-12 text-center p-l-20 p-b-20'},
                childs: [
                    {
                        tag: 'button',
                        attr: {
                            type: 'button',
                            id: 'next-question',
                            class: 'btn btn-default waves-effect btn-next w-180 m-r-10',
							style: 'display: {0};'.zFormat(validObject(ticket, 'idCampain', 'idSurvey') || validObject(ticket, 'idService', 'idSurvey') ? 'initial' : 'none')
                        },
                        childs: [
                            {
                                tag: 'span',
                                content: 'Câu hỏi kế'
                            },
                            {
                                tag: 'i',
                                attr: {class: 'zmdi zmdi-arrow-right zmdi-hc-fw'}
                            }
                        ]
                    },
                    {
                        tag: 'button',
                        attr: {
                            type: 'button',
                            id: 'save-survey',
                            class: 'btn btn-primary btn-save w-180',
                            'data-target': '#{0}'.zFormat(formIdentify),
                            'data-link': '{0}-{1}'.zFormat(ticket._id, validObject(ticket, 'idCampain', 'idSurvey') || validObject(ticket, 'idService', 'idSurvey')),
                            style: 'display: {0};'.zFormat(validObject(ticket, 'idCampain', 'idSurvey') || validObject(ticket, 'idService', 'idSurvey') ? 'initial' : 'none')
                        },
                        childs: [
                            {
                                tag: 'i',
                                attr: {class: 'zmdi zmdi-check-all m-r-5'}
                            },
                            {
                                tag: 'span',
                                content: 'Lưu câu trả lời'
                            }
                        ]
                    }
                ]
            }
        ]);

        function createRadio(label, answerId, parentId, answer) {
            answer = getString(answer);
            answerId = getString(answerId);

            var selected = _.isEqual(answer, answerId) ? 'checked' : '';
            return {
                tag: 'div',
                attr: {class: 'radio'},
                childs: [
                    {
                        tag: 'label',
                        childs: [
                            {
                                tag: 'input',
                                attr: {
                                    type: 'radio',
                                    value: answerId,
                                    name: parentId
                                },
                                sattr: [selected]
                            },
                            {
                                tag: 'i',
                                attr: {class: 'input-helper'}
                            },
                            {
                                tag: 'span',
                                attr: {class: 'p-l-5'},
                                content: label
                            }
                        ]
                    }
                ]
            };
        }

        function createCheckBox(label, answerId, parentId, answer) {
            answerId = getString(answerId);

            var answerArr = _.isNull(answer) ? [] : answer.split(',');
            var selected = '';
            if (answerArr.indexOf(answerId) >= 0) selected = 'checked';


            return {
                tag: 'div',
                attr: {class: 'checkbox'},
                childs: [
                    {
                        tag: 'label',
                        childs: [
                            {
                                tag: 'input',
                                attr: {
                                    type: 'checkbox',
                                    value: answerId,
                                    name: '{0}[]'.zFormat(parentId)
                                },
                                sattr: [selected]
                            },
                            {
                                tag: 'i',
                                attr: {class: 'input-helper'}
                            },
                            {
                                tag: 'span',
                                attr: {class: 'p-l-5'},
                                content: label
                            }
                        ]
                    }
                ]
            };
        }

        function createInputNumber(name, dataId, value) {
            return {
                tag: 'input',
                attr: {
                    type: 'number',
                    class: 'form-control',
                    name: dataId,
                    'data-tid': dataId,
                    value: value
                }
            }
        }

        function createInputText(name, dataId, value) {
            return {
                tag: 'input',
                attr: {
                    type: 'text',
                    class: 'form-control',
                    name: '{0}:string'.zFormat(dataId),
                    'data-id': dataId,
                    value: value
                }
            }
        }
    };

    var validObject = function () {
        if (_.isEmpty(arguments[0])) return '';
        var obj = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            if (_.isEmpty(obj[arguments[i]])) return '';
            obj = obj[arguments[i]];
        }
        return obj;
    };

    exports.showTicketList = showTicketList;
    exports.showTicketInfo = showTicketInfo;
    exports.validObject = validObject;
    exports.createPaging = createPaging;
    exports.createSurvey = createSurvey;
    exports.showTicketListBody = showTicketListBody;
    exports.createTicketSubReasonRows = createTicketSubReasonRows;
    exports.showCallLogs = showCallLogs;
})
(typeof exports === 'undefined' ? this['zoka'] = {} : exports);