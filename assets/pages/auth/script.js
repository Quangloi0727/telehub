var DFT = function ($) {

	var getCookie = function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
		console.log(document.cookie);
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }

    var _roleStatic = {
        TechnicalManager: "57032832296c50d9b723d12e", //Quản lý kỹ thuật
        pm: "56ccdf99031ce3e32a48f5da", //Quản lý dự án
        cm: "56ccdf99031ce3e32a48f5db", //Quản lý công ty
        gl: "56ccdf99031ce3e32a48f5d8", //Quản lý nhóm
        a: "56ccdf99031ce3e32a48f5d9" //Điện thoại viên
    };

    var _roleGroup = {
        TechnicalManager: 1, //Quản lý kỹ thuật
        pm: 2, //Quản lý dự án
        cm: 3, //Quản lý công ty
        gl: 4, //Quản lý nhóm
        a: 5 //Điện thoại viên
    };

    var parseMenu = function (obj, _class) {
        var output = '<ul class="' + (_class ? _class : '') + '">';
        _.each(obj, function (e) {
            if (e.access && _.isEqual(e.hidden, 0)) {
                output += _.Tags([{
                    tag: 'li',
                    attr: {class: (_.has(e, 'childs') && !_.isEmpty(e.childs)) ? 'sub-menu' : ''},
                    notend: true,
                    childs: [{
                        tag: 'a',
                        attr: {href: (!_.isEqual(e.link, '/none') && e.link) ? (_.startsWith(e.link, '/', 0) ? '/#' + e.link.substring(1) : '#' + e.link) : 'javascript:void(0)'},
                        content: e.name,
                        childs: [(_.isEmpty(e.icon) ? {} : {tag: 'i', attr: {class: e.icon}})]
                    }]
                }]);
                if (_.has(e, 'childs') && !_.isEmpty(e.childs)) {
                    output += parseMenu(e.childs);
                }
                output += '</li>';
            }
        });
        output += '</ul>';
        return _.clean(output);
    };

    var bindClick = function () {
        $(document).on('click', 'table#auth-manager-table .btn', function () {
            var $this = $(this);
            var obj = {
                role: {_id: $this.attr('data-role-id'), name: $this.attr('data-role-name'), company: $this.attr('data-company-id')},
                company: !$this.attr('data-company-id') ? null : {
                    _id: $this.attr('data-company-id'),
                    name: $this.attr('data-company-name'),
                    //leader: _.isEqual($this.attr('data-role-id'), _roleStatic.cm),
                    leader: _.isEqual($this.attr('data-role-group'), _roleGroup.cm.toString()),
                    group: !$this.attr('data-group-id') ? null : {
                        _id: $this.attr('data-group-id'),
                        name: $this.attr('data-group-name'),
                        //leader: _.isEqual($this.attr('data-role-id'), _roleStatic.gl),
                        leader: _.isEqual($this.attr('data-role-group'), _roleGroup.gl.toString()),
                    }
                }
            };

            _Ajax('/auth', 'POST', [{auth: JSON.stringify(obj)}], function (resp) {
                var html = '';
                var menu = resp.message;
                $('#menu-accordion').empty();
                for(var i=0; i<menu.length; ++i){
                    if (menu && menu[i] && menu[i].childs.length && menu[i].access) {
                        html += _.Tags([{
                            tag: 'div', attr: {class: 'panel panel-collapse m-t-0'},
                            childs: [
                                {
                                    tag: 'div', attr: {class: 'panel-heading', role: 'role', id: 'headingMenu' + i },
                                    childs: [{
                                        tag: 'h5', attr: {class: 'panel-title'},
                                        childs: [{
                                            tag: 'a',
                                            attr: {
                                                'data-toggle': 'collapse',
                                                'data-parent': '#menu-accordion',
                                                'href': '#collapseManager' + i,
                                                'aria-expanded': false,
                                                'aria-controls': 'collapseManager' + i,
                                                class: 'class'
                                            },
                                            content: menu[i].name
                                        }]
                                    }]
                                },
                                {
                                    tag: 'div',
                                    attr: {
                                        id: 'collapseManager' + i,
                                        class: 'collapse',
                                        role: 'tabpanel',
                                        'aria-labelledby': 'headingMenu' + i,
                                        'aria-expanded': false
                                    },
                                    childs: [{
                                        tag: 'div',
                                        attr: {class: 'panel-body p-0 p-b-10'},
                                        content: parseMenu(menu[i].childs, 'main-menu')
                                    }]
                                }
                            ]
                        }]);
                    }
                }
				var _username = $('ul.top-menu a.c-white.t-7').find( "span" ).eq( 2 ).text();
                $('ul.top-menu a.c-white.t-7').html('<span class="text-uppercase">' + $this.text() +'<span class="m-l-10 m-r-10">-</span><span>'+ _username +'</span><span class="m-l-10 m-r-10">-</span><span>' + getCookie("deviceId")+'</span>');
                $('aside#sidebar .sidebar-inner .panel-group').html(html);
                // hoangdv keep back to old url
                var hash = window.location.hash;
				if (hash.length === 0 || hash.indexOf('auth') > -1) {
                    hash = 'articles-list';
                }
                window.location.hash = '';
                window.location.hash = hash;
            });
        });
    };
    return {
        init: function () {
            bindClick();
        },
        uncut: function () {
            $(document).off('click', 'table#auth-manager-table .btn');
        }
    };
}(jQuery);