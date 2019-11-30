;(function ($) {

    var _this = function (s) {
        return 'body > .tab-content > .tab-pane#tab-voice ' + s;
    };

    var VoiceInit = function () {

        $(_this('.ui-widget-header .zmdi-minus')).tooltip();
        $(_this('.ui-widget-header .zmdi-close')).tooltip();

        bindClick();
    };

    var bindClick = function () {
        $(document).on('click', _this('.zmdi-close'), function () {
            var ticketId = $(this).attr('tid');
            _.each($('iframe'), function (el) {
                if ($(el).attr('id') === ('if-' + ticketId)) {
                    $(el).prop('contentWindow').DFT.showCloseAlert(ticketId);
                }
            });
        });

        $(document).on('click', _this('.ui-widget-header .zmdi-minus'), function () {
            var $this = $(this).closest('.voice-dialog');

            console.log(26, $this.position().top);

            var tid = $(this).attr('tid');
            var currentPosition = $this.position();

            $(this).attr('p-top', $this.position().top);
            $(this).attr('p-left', currentPosition.left);

            $this.effect('transfer',
                {
                    to: '#voice-bars-container li[tid="' + tid + '"]',
                    className: "ui-effects-transfer"
                },
                500,
                function () {
                    $(_this('#voice-bars-container li[tid="' + tid + '"]'))
                        .attr('i-u', false);
                })
                .dequeue()
                .effect('fade', {});
        });

        $(document).on('click', _this('ul#voice-bars-container li'), function () {
            var $this = $(this);
            var tid = $this.attr('tid');
            var $dialog = $('.voice-dialog[id="v-' + tid + '"]');
            var cLeft = $dialog.attr('p-left') + ' px';
            var cTop = $dialog.attr('p-top') + ' px';
            VoiceContainer.topIndex++;

            $this.attr('i-u', true).siblings().attr('i-u', false);

            $dialog.css({top: cTop, left: cLeft, 'z-index': VoiceContainer.topIndex}).fadeIn();
        });
    };

    var VoiceContainer = window.VoiceContainer = Object.create({
        topIndex: 0,
        childs: {},
        container: null,
        tabCounter: null,
        barcontainer: null,
        counter: 0,
        childTop: 60,
        childLeft: 10,


        init: function () {
            this.container = $('.tab-pane#tab-voice');
            this.tabCounter = $('a[href="#tab-voice"] i.tmn-counts');
            this.barcontainer = $('.tab-pane#tab-voice #voice-bars-container');

            VoiceInit();

            return this;
        },
        updateCounter: function (add) {
            var self = this;
            add ? self.counter++ : self.counter--;
            self.tabCounter.text(self.counter);
            _.isEqual(self.counter, 0) ? self.tabCounter.hide() : self.tabCounter.show();
            return self;
        },
        open: function (tid, title) {
            $(_this('ul#voice-bars-container li')).attr('i-u', false);

            var self = this;
            self.topIndex++;

            self.childTop = _.random(60, 100);
            self.childLeft = _.random(10, 100);

            var height = window.height * 0.6;

            var _w = $(_.Tags([
                {
                    tag: 'div',
                    attr: {
                        class: 'voice-dialog ui-widget-content p-0',
                        id: 'v-' + tid,
                        style: 'width: calc(100vw - 100px) !important; height: calc(100vh - 150px) !important; top: ' + self.childTop + 'px; left: ' + self.childLeft + 'px; position: absolute; z-index:' + self.topIndex
                    },
                    childs: [
                        {
                            tag: 'h5',
                            attr: {
                                class: 'ui-widget-header m-0 p-5 bgm-white c-black'
                            },
                            content: title,
                            childs: [
                                {
                                    tag: 'i',
                                    attr: {
                                        class: 'zmdi zmdi-minus zmdi-hc-fw p-absolute f-20 t-5 r-30 f-20',
                                        tid: tid,
                                        'data-toggle': 'tooltip',
                                        title: 'Thu nhỏ xuống khay!'
                                    }
                                },
                                {
                                    tag: 'i',
                                    attr: {
                                        class: 'zmdi zmdi-close zmdi-hc-fw p-absolute t-5 r-10 f-20',
                                        tid: tid,
                                        'data-toggle': 'tooltip',
                                        title: 'Close ticket'
                                    }
                                }
                            ]
                        },
                        {
                            tag: 'div', attr: {class: 'content'}, childs: [
                            {
                                tag: 'iframe',
                                attr: {
                                    id: 'if-' + tid,
                                    frameborder: '0',
                                    height: '100%',
                                    width: '100%',
                                    scrolling: 'no',
                                    src: '/customer-info?ticketID=' + tid
                                }
                            }
                        ]
                        }
                    ]
                }]));

            _w.appendTo(self.container);
            _w.draggable({
                snap: false,
                handle: '.ui-widget-header',
                iframeFix: true,
                containment: "parent",
                refreshPositions: true
            }).find('.ui-widget-header').bind('mousedown', function () {
                self.topIndex++;
                $(this).closest('.voice-dialog').css('z-index', self.topIndex);

                var viewId = $(this).closest('.voice-dialog').attr('id');
                var tid = viewId.split('-')[1];
                $(_this('ul#voice-bars-container li[tid="' + tid + '"]')).attr('i-u', true).siblings().attr('i-u', false);
            });

            var _wb = $(_.Tags([
                {
                    tag: 'li',
                    attr: {
                        'i-u': true,
                        'i-c': false,
                        class: 'p-relative',
                        tid: tid
                    },
                    childs: [
                        {
                            tag: 'i',
                            attr: {
                                class: 'zmdi zmdi-phone-in-talk zmdi-hc-fw'
                            }
                        },
                        {
                            tag: 'span m-l-5',
                            content: title
                        }
                    ]
                }
            ]));

            _wb.appendTo(self.barcontainer);

            return self.updateCounter(true);
        },
        close: function (tid) {
            var self = this;

            async.parallel({
                fadeOutDialog: function (callback) {
                    $(_this('#v-' + tid)).fadeOut(callback);
                },
                fadeOutTaskBar: function (callback) {
                    $(_this('ul#voice-bars-container li[tid="' + tid + '"]')).fadeOut(callback);
                }
            }, function () {
                $(_this('#v-' + tid)).remove();
                $(_this('ul#voice-bars-container li[tid="' + tid + '"]')).remove();
            });

            return self.updateCounter();
        }
    });

    var getStatusColor = function(status){
        switch (status) {
            case -1:
                return '#33dcff';
                break;
            case 2:
                return '#33dcff';
                break;
            case 3:
                return '#33dcff';
                break;
            case 4:
                return '#92f538';
                break;
            case 5:
                return '#f8f8f8';
                break;
            default:
                return 'yellow';
                break;
        }
    }

    var getCallStatus = function (status) {
        switch (status) {
            case -1:
                return 'CALLING';
                break;
            case 0:
                return 'UNKOWN';
                break;
            case 1:
                return 'PROCESSING';
                break;
            case 2:
                return 'CALLING';
                break;
            case 3:
                return 'RINGING';
                break;
            case 4:
                return 'CONNECTED';
                break;
            case 5:
                return 'DISCONNECTED';
                break;
            case 6:
                return 'HOLD';
                break;
            case 7:
                return 'RESUME';
                break;
            case 8:
                return 'TRANSFER';
                break;
            case 9:
                return 'COUNT';
                break;
        }
    };

    var bindSocket = function (client) {
        client.on('ChangeAgentCallStatus', function (data) {
            var status = getCallStatus(Number(data.callStatusType));
            $(_this('#call-status-info')).html('<i class="zmdi zmdi-phone m-r-5"></i>' + status);
            $(_this('#call-status-info')).css('background-color', getStatusColor(Number(data.callStatusType)));
        });

        client.on('VoiceChangeAgentStatus', function (data) {
            if (Number(data) == 4) {
                $(_this('#status-info')).html('<i class="zmdi zmdi-account m-r-5"></i>' + 'Not Answering' + ' <span class="caret"></span>');
            } else {
                $.map($(_this('.voice-status')), function (n, i) {
                    if ($(n).attr('data-voice-status') == Number(data)) {
                        $(_this('#status-info')).html('<i class="zmdi zmdi-account m-r-5"></i>' + $(n).html() + ' <span class="caret"></span>');
                    }
                });
            }
        });

        client.on('GetAgentStatus', function (data) {
            $(_this('#voice-status-container')).empty();
            $(_this('#voice-status-container')).append('' +
                '<a id="status-info" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">' +
                '<i class="zmdi zmdi-account m-r-5"></i>Trạng thái ' +
                '<span class="caret"></span>' +
                '</a>');

            var newMenu = '<ul class="dropdown-menu" role="menu">';
            //var newMenu = '<ul class="" role="menu">';
            _.each(data.data, function (status) {
                newMenu += '<li role="presentation"><a class="voice-status" role="button" data-voice-status=' + status.statusCode + '>' + status.name + '</a></li>';
            });
            $(_this('#voice-status-container')).append(newMenu);
            $.map($(_this('.voice-status')), function (n, i) {
                if ($(n).attr('data-voice-status') == data.curStatus) {
                    $(_this('#status-info')).html('<i class="zmdi zmdi-account m-r-5"></i>' + $(n).html() + ' <span class="caret"></span>');
                }
            });

            var callStatus = getCallStatus(Number(data.curCallStatus));
            $(_this('#call-status-info')).html('<i class="zmdi zmdi-phone m-r-5"></i>' + callStatus);

            $(_this('.voice-status')).on('click', function () {
                _socket.emit('ChangeAgentStatus', {
                    changeBy: user,
                    user: user,
                    status: $(this).attr('data-voice-status'),
                    sid: _socket.socket.sessionid
                });
            });
        });
    }

    $(document).ready(function () {
        VoiceContainer.init();
        bindSocket(_socket);
        //code
        _socket.emit('GetAgentStatus', {user: user});

        $(_this('#call-status-info')).on('click', function () {
            $('#call-status-menu').show();
        });

        $(_this('#disconnect-call')).on('click', function () {
            $('#call-status-menu').hide();
            _socket.emit('GroupCallControl', {_id: user, type: '1', agentID: user});
        });
    });
})(jQuery);