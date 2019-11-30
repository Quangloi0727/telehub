function getChilds(cr, ma, usr, callback) {
    var childarr = [];
    usr.getChildren(function (err, child) {
        var childCount = child.length;
        if (childCount <= 0) callback([]);
        child.forEach(function (child) {
            getChilds(cr, ma, child, function (arr) {
                childCount -= 1;
                var obj = {};
                obj._id = child._id;
                obj.name = child.name;
                obj.status = child.status;
                obj.icon = child.icon;
                obj.weight = child.weight;
                obj.hidden = child.hidden;
                obj.link = '/' + child.link;
                obj.access = (child.role.indexOf(cr) >= 0 && _.isEqual(child.status, 1));
                obj.childs = _.sortBy(arr, 'name');
                obj.childs.sort(_.dynamicSort("weight"));
                childarr.push(obj);
                childarr.sort(_.dynamicSort("weight"));
                if (child.link && !_.isEqual(child.link, 'none')) ma['/' + child.link] = child.role;
                if (childCount <= 0) {
                    callback(childarr);
                }
            });
        });
    });
};
module.exports = {
    stringRegex: function (text) {
        var txt = text.toLowerCase().replace(/^(\s*)|(\s*)$/g, '').replace(/\s+/g, ' ');

        var ss = '';

        function isValidCharacter(str) {
            return !/[~`!#$%\^&*+=\-\[\]\\';,/{}()|\\":<>\?]/g.test(str);
        }

        for (var i = 0; i < txt.length; i++) {
            ss = isValidCharacter(txt[i]) ? ss.concat(txt[i]) : ss.concat('\\', txt[i]);
        }
        txt = ss;

        var a = 'àáảãạâầấẩẫậăằắẳẵặa';
        var d = 'đd';
        var u = 'ùúủũụưừứửữựu';
        var i = 'ìíỉĩịi';
        var e = 'èéẻẽẹêềếểễệe';
        var o = 'òóỏõọôồốổỗộơờớởỡợo';
        var y = 'ỳýỷỹỵy';
        var str = '';
        for (var k = 0; k < txt.length; k++) {
            if (a.indexOf(txt[k]) >= 0) {
                str = str + '[' + a + ']';
            }
            else if (d.indexOf(txt[k]) >= 0) {
                str = str + '[' + d + ']';
            }
            else if (u.indexOf(txt[k]) >= 0) {
                str = str + '[' + u + ']';
            }
            else if (i.indexOf(txt[k]) >= 0) {
                str = str + '[' + i + ']';
            }
            else if (e.indexOf(txt[k]) >= 0) {
                str = str + '[' + e + ']';
            }
            else if (o.indexOf(txt[k]) >= 0) {
                str = str + '[' + o + ']';
            }
            else if (y.indexOf(txt[k]) >= 0) {
                str = str + '[' + y + ']';
            }
            else {
                str = str + txt[k];
            }
        }
        return str;
    },
    arrayObjectId: function (arr) {
        return _.chain(arr).map(function (id) {
            return new mongodb.ObjectId(id);
        }).value();
    },
    regexAgg: function (type, text) {
        //switch (type) {
        //    case 1:
        //    case 2:
        //        break;
        //}
        return {$regex: new RegExp(_.stringRegex(text), 'i')};
    },
    cleanValidateKey: function (key) {
        return key.indexOf('validate') == 0 ? key.split('-for-')[1] : key;
    },
    cleanRequest: function (objs, _r, unit) {
        var _ob = {};
        if (_.isUndefined(unit)) unit = '';
        delete objs['start'];
        delete objs['limit'];
        delete objs['rows'];
        delete objs['page'];
        delete objs['sort'];
        for (var key in objs) {
            var _key = _.cleanValidateKey(key);
            if (key.indexOf('[]') >= 0) {
                _ob[_key.replace('[]', '') + unit] = (typeof objs[key] === 'string') ? [_.trim(objs[key])] : objs[key];
            } else {
                _ob[_key + unit] = (typeof objs[key] === 'string') ? _.trim(objs[key]) : objs[key];
            }
            if (_r && _r.length && _r.indexOf(_key) >= 0) delete _ob[_key];
        }
        return _ob;
    },
    cleanSort: function (objs, unit, _r) {
        if (_.has(objs, 'sort')) {
            var _ob = {};
            var _o = objs['sort'].split(':');
            var k = _o[0] + unit;
            var v = _o[1];
            if (v && (v == 'asc' || v == 'desc')) {
                _ob[k] = _.isEqual(v, 'asc') ? 1 : -1;
                return _ob;
            } else {
                return {};
            }
        } else {
            return {};
        }
    },
    cleanXEdit: function (objs, _r) {
        var _ob = {};
        delete objs['pk'];
        for (var key in objs) {
            if (key.indexOf('value[') >= 0) {
                _ob[key.replace('value[', '').replace(']', '')] = (typeof objs[key] === 'string') ? objs[key] : [objs[key]];
            } else {
                _ob[key] = objs[key];
            }
            if (_r && _r.length && _r.indexOf(key) >= 0) delete _ob[key];
        }
        return _ob;
    },
    cleanString: function (str) {
        return str.toLowerCase()
            .replace(/_/g, '')
            .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
            .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
            .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
            .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
            .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
            .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
            .replace(/đ/g, 'd')
            .replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\'|\&|\#|\[|\]|~/g, '-')
            .replace(/-+-/g, '_')
            .replace(/^\-+|\-+$/g, '');
    },
    toLower: function (obj) {
        var result = _.first(_.map([obj], function (element) {
            return _.object(_.keys(element), _.values(element).map(function (value) {
                return _.isString(value) ? value.toLowerCase() : value;
            }));
        }));
        return result;
    },
    trimValue: function (v) {
        return _.trim(v).toLowerCase().replace(/  +/g, ' ');
    },
    trimValueNotLower: function (v) {
        return _.trim(v).replace(/  +/g, ' ');
    },
    cleanUrl: function (str) {
        return str.toLowerCase()
            .replace(/_/g, '')
            .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
            .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
            .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
            .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
            .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
            .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
            .replace(/đ/g, 'd')
            .replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\'|\&|\#|\[|\]|~/g, '-')
            .replace(/-+-/g, '-')
            .replace(/^\-+|\-+$/g, '');
    },
    deleteFile: function (url, public) {
        url = url.replace(/.*\/\/[^\/]*/, '');
        if (!url) return;
        if (public) url = path.join(root_path, 'public', url);
        if (fs.existsSync(url)) fs.unlinkSync(url);
    },
    collate: function (array, propertyName) {
        var keys = [].concat(propertyName),
            key = keys.shift(),
            result = [],
            group,
            lastValue;
        if (key == null) {
            return array;
        }
        if (array == null || !array.length) {
            return result;
        }

        _.each(array, function (item, index) {
            if (!(index && (_.isFunction(key) ? key(item, index) : item[key]) === lastValue)) {
                if (index) {
                    result.push(keys.length ? _.collate(group, keys) : group);
                }
                group = [];
            }
            group.push(item);
            lastValue = (_.isFunction(key) ? key(item, index) : item[key]);
        });
        result.push(keys.length ? _.collate(group, keys) : group);
        return result;
    },
    dynamicSort: function (property) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    },
    dynamicInputFilter: function (el) {
        var _tag = '';
        var _attr = {};
        var _sattr = [];
        var _childs = [];
        switch (el.fieldType) {
            case 1:
                _tag = 'input';
                _attr = {class: 'form-control', type: 'text', id: 'edit_' + el.modalName, name: el.modalName}
                break;
            case 2:
                _tag = 'input';
                _attr = {class: 'form-control', type: 'number', id: 'edit_' + el.modalName, name: el.modalName}
                break;
            case 3:
                _tag = 'input';
                _attr = {class: 'form-control', type: 'text', id: 'edit_' + el.modalName, name: el.modalName}
                break;
            case 4:
                _tag = 'select';
                _attr = {class: 'selectpicker', type: 'text', id: 'edit_' + el.modalName, name: el.modalName + '[]'};
                _sattr.push('multiple');
                _.each(el.fieldValue, function (v) {
                    _childs.push({tag: 'option', attr: {value: v}, content: v});
                });
                break;
            case 5:
                _tag = 'select';
                _attr = {class: 'selectpicker', type: 'text', id: 'edit_' + el.modalName, name: el.modalName};
                _childs.push({tag: 'option', attr: {value: ''}, content: '---- Chọn ----'});
                _.each(el.fieldValue, function (v) {
                    _childs.push({tag: 'option', attr: {value: v}, content: v});
                });
                break;
            case 6:
                _tag = 'div';
                _attr = {class: 'input-group'};
                _childs = [
                    {
                        tag: 'input',
                        attr: {
                            class: 'form-control date-picker',
                            type: 'text',
                            id: 'edit_' + el.modalName,
                            name: el.modalName
                        }
                    },
                    {
                        tag: 'span',
                        attr: {class: 'input-group-addon p-l-10 bgm-gray c-white'},
                        childs: [{tag: 'i', attr: {role: 'button', class: 'zmdi zmdi-calendar'}}]
                    }
                ];
                break;
            case 7:
                _tag = 'input';
                _attr = {class: 'form-control', type: 'text', id: 'edit_' + el.modalName, name: el.modalName + ":string"}
                break;
        }
        return _.htmlTags([{tag: _tag, attr: _attr, sattr: _sattr, childs: _childs.length ? _childs : []}]);
    },
    dynamicInputField: function (el, v) {
        var _tag = '';
        var _attr = {};
        var _sattr = [];
        var _content = '';
        var _childs = [];
        var _val = (v && _.has(v, el.modalName) && !_.isEmpty(v[el.modalName]) && !_.isNull(v[el.modalName]) && v[el.modalName].length && _.has(v[el.modalName][0], 'value')) ? v[el.modalName][0].value : '';

        switch (el.fieldType) {
            case 1:
                _tag = 'input';
                _attr = {
                    value: _val,
                    class: 'form-control ' + _.switch(el.isRequired, [0, 1], ['', 'validate[required]']),
                    type: 'text',
                    id: 'edit_' + el.modalName,
                    name: el.modalName
                };
                break;
            case 2:
                _tag = 'input';
                _attr = {
                    value: _val,
                    class: 'form-control ' + _.switch(el.isRequired, [0, 1], ['', 'validate[required]']),
                    type: 'number',
                    id: 'edit_' + el.modalName,
                    name: el.modalName
                };
                break;
            case 3:
                _tag = 'textarea';
                _attr = {
                    class: 'form-control ' + _.switch(el.isRequired, [0, 1], ['', 'validate[required]']),
                    type: 'text',
                    id: 'edit_' + el.modalName,
                    name: el.modalName
                };
                _content = _val;
                break;
            case 4:
                _tag = 'div';
                _attr = {class: 'm-t-5'};
                _.each(el.fieldValue, function (_v) {
                    _childs.push({
                        tag: 'label', attr: {class: 'checkbox checkbox-inline m-r-20'}, childs: [
                            {
                                tag: 'input',
                                attr: {
                                    type: 'checkbox',
                                    class: _.switch(el.isRequired, [0, 1], ['', 'validate[required]']),
                                    name: el.modalName + '[]',
                                    value: _v
                                },
                                sattr: _.indexOf(_val, _v) >= 0 ? ['checked'] : []
                            },
                            {tag: 'i', attr: {class: 'input-helper'}},
                            {tag: 'span', attr: {class: 'p-l-5'}, content: _v}
                        ]
                    });
                });
                break;
            case 5:
                _tag = 'div';
                _attr = {class: 'm-t-5'};
                _.each(el.fieldValue, function (_v) {
                    _childs.push({
                        tag: 'label', attr: {class: 'radio radio-inline m-r-20'}, childs: [
                            {
                                tag: 'input',
                                attr: {
                                    type: 'radio',
                                    class: _.switch(el.isRequired, [0, 1], ['', 'validate[required]']),
                                    id: _.uniqueId(el.modalName),
                                    name: el.modalName + '[]',
                                    value: _v
                                },
                                sattr: _.indexOf(_val, _v) >= 0 ? ['checked'] : []
                            },
                            {tag: 'i', attr: {class: 'input-helper'}},
                            {tag: 'span', attr: {class: 'p-l-5'}, content: _v}
                        ]
                    });
                });
                break;
            case 6:
                //_tag = 'input';
                //_attr = {class: 'form-control date-picker', value: _moment().format('DD/MM/YYYY'), type: 'text', id: 'edit_' + el.modalName, name: el.modalName};
                _tag = 'div';
                _attr = {class: 'input-group'};
                _childs = [
                    {
                        tag: 'input',
                        attr: {
                            class: 'form-control date-picker',
                            value: _moment().format('DD/MM/YYYY'),
                            type: 'text',
                            id: 'edit_' + el.modalName,
                            name: el.modalName
                        }
                    },
                    {
                        tag: 'span',
                        attr: {class: 'input-group-addon p-l-10 bgm-gray c-white'},
                        childs: [{tag: 'i', attr: {role: 'button', class: 'zmdi zmdi-calendar'}}]
                    }
                ];
                break;
            case 7:
                _tag = 'input';
                _attr = {
                    value: _val,
                    class: 'form-control validate[custom[number]' + _.switch(el.isRequired, [0, 1], ['', ',required']) + ']',
                    type: 'text',
                    id: 'edit_' + el.modalName,
                    name: el.modalName + ":string"
                };
                break;
        }
        return _.htmlTags([{tag: _tag, attr: _attr, sattr: _sattr, childs: _childs.length ? _childs : []}]);
    },
    sumBy: function (data, key, prop) {
        var sum = function (t, n) {
            return t + n;
        };
        return _.mapObject(
            _.groupBy(data, key), function (values, k) {
                var result = {};
                _.each(prop, function (p, i) {
                    result[p] = _.reduce(_.pluck(values, p), sum, 0);
                });
                return result;
            }
        );
    },
    param: function (obj) {
        var parts = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (_.isArray(obj[i])) {
                    for (var j in obj[i]) {
                        parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i][j]));
                    }
                } else {
                    parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
                }
            }
        }
        return parts.join("&");
    },
    htmlTags: function (obj) {
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
    },
    htmlMenu: function (obj, _class) {
        var output = '<ul class="' + (_class ? _class : '') + '">';
        _.each(obj, function (e) {
            if (e.access && _.isEqual(e.hidden, 0)) {
                output += _.htmlTags([{
                    tag: 'li',
                    attr: {class: (_.has(e, 'childs') && !_.isEmpty(e.childs)) ? 'sub-menu' : ''},
                    notend: true,
                    childs: [{
                        tag: 'a',
                        attr: {href: (!_.isEqual(e.link, '/none') && e.link) ? e.link : 'javascript:void(0)'},
                        content: e.name,
                        childs: [(_.isEmpty(e.icon) ? {} : {tag: 'i', attr: {class: e.icon}})]
                    }]
                }]);
                if (_.has(e, 'childs') && !_.isEmpty(e.childs)) {
                    output += _.htmlMenu(e.childs);
                }
                output += '</li>';
            }
        });
        output += '</ul>';
        return _.clean(output);
    },
    breadCrumbs: function (menus, url) {
        var module = url.split('?')[0].split('/');
        var temp = [];
        _.each(menus, function (menu) {
            var link = getChild(menu, module[1], []);
            if (link != null && temp.length == 0) {
                temp = link;
            }
        });

        return _.htmlTags([{tag: 'ol', attr: {class: 'breadcrumb text-right'}, childs: temp}]);

        function getChild(menu, url, memo) {
            if (menu.childs) {
                if (menu.childs.length == 0) {
                    if (_.has(menu, 'link')
                        && !_.isEmpty(menu.link)
                        && !_.isEqual(menu.link, '/')
                        && !_.isEqual(menu.link, '/none')
                        && menu.link.split('/')[1] == url) {
                        //Lamlv edit 16/08/2016
                        memo.push({tag: 'li', childs: [{tag: 'span', attr: {}, content: menu.name}]});

                        if (_.isEqual(_.last(module), 'new')) memo.push({tag: 'li', content: 'Tạo mới'});
                        if (_.isEqual(_.last(module), 'edit')) memo.push({tag: 'li', content: 'Chỉnh sửa'});

                        return memo;
                    }
                } else if (_.has(menu, 'link')
                    && !_.isEmpty(menu.link)
                    && !_.isEqual(menu.link, '/')) {

                    var link = 'javascript:;';
                    if (!_.isEqual(menu.link, '/none')) {
                        link = menu.link;
                    }

                    memo.push({tag: 'li', childs: [{tag: 'a', attr: {href: link}, content: menu.name}]});

                    var temp = null;
                    _.each(menu.childs, function (item) {
                        if (temp == null) {
                            var obj = JSON.parse(JSON.stringify(memo));
                            temp = getChild(item, url, obj);
                        }
                    });
                    return temp;
                }
            }
            return null;
        }
    },
    menuBuilder: function (role) {
        _Router.findById(String(new mongodb.ObjectID('-dft-hoasao-'))).exec(function (err, _w) {
            getChilds(role, _menusAllows, _w, function (arr) {
                _menus = arr;
            });
        });
    },
    switch: function (val, arr1, arr2) {
        return arr2[arr1.indexOf(val)];
    },
    switchAgg: function (type, text) {
        switch (type) {
            case 1:
                return {$regex: new RegExp(_.stringRegex(text), 'i')};
            case 2:
                return Number(text);
                break;
            case 3:
                return {$regex: new RegExp(_.stringRegex(text), 'i')};
                break;
            case 4:
                return {$all: text};
                break;
            case 5:
                return {$elemMatch: {$eq: text}};
                break;
            case 6:
                return {
                    $gte: _moment(text + ' 00:00:00', 'DD/MM/YYYY hh:mm:ss')._d,
                    $lte: _moment(text + ' 23:59:59', 'DD/MM/YYYY hh:mm:ss')._d
                };
            case 7:
                return {$regex: new RegExp(_.stringRegex(text), 'i')};
                break;
        }
    },

    defaultSchema: function (t) {
        return {
            entityId: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true},
            value: {
                type: _.switch(t, [1, 2, 3, 4, 5, 6, 7], [String, Number, String, Array, Array, Date, String]),
                index: true
            },
            created: {type: Date, default: Date.now}
        };
    },
    getModule: function (name) {
        return _.find(Object.keys(require('module')._cache), function (m) {
            return _.isEqual(path.basename(m, '.js'), name);
        });
    },
    render: function (req, res, v, o, f, e) {
        var createCRUD = function (originalUrl, menuAccess) {
            var obj = {create: false, update: false, destroy: false};
            if (_.isEmpty(menuAccess)) return obj;
            var create = _.has(menuAccess, originalUrl + '/new');
            var update = _.has(menuAccess, originalUrl + '/edit');
            var destroy = _.has(menuAccess, originalUrl + '/destroy');
            obj.create = create;
            obj.update = update;
            obj.destroy = destroy;
            return obj;
        };
        res.locals._url = req.originalUrl;
        try {
            o.breadcrumb = _.breadCrumbs(_.has(req.session, 'menuRouter') ? req.session.menuRouter : [], req.originalUrl);
        }
        catch (e) {

        }
        if (e) return res.render('500', {message: e.message});
        if (!f) return res.render('404');
        if (req.xhr) {
            res.render('indexs', _.extend(o, {
                page: _.has(o, 'page') ? o.page : v,
                plugins: _.has(o, 'plugins') ? o.plugins : [],
                crud: createCRUD(req.originalUrl, req.session.menuAccess)
            }));
        } else {
            if (!_.has(o, 'title')) o.title = 'DFT CMS';
            _.extend(o, {
                user: _.has(req.session, 'user') ? req.session.user : null,
                projectName: _config.app.name,
                company: _.has(req.session, 'auth') && _.has(req.session.auth, 'company') && !_.isNull(req.session.auth.company) ? req.session.auth.company : {
                    _id: null,
                    name: 'CRM'
                },
                breadCrumbs: _.breadCrumbs(_.has(req.session, 'menuRouter') ? req.session.menuRouter : [], req.originalUrl),
                auth: _.has(req.session, 'auth') && _.has(req.session.auth, 'role') ? req.session.auth.role.name : null,
                page: _.has(o, 'page') ? o.page : v,
                plugins: _.has(o, 'plugins') ? o.plugins : [],
                menu: _.has(req.session, 'menuRouter') ? req.session.menuRouter : [],
                crud: createCRUD(req.originalUrl, req.session.menuAccess)
            });

            res.render((_.has(req.session, 'logged') && _.isEqual(req.session.logged, true) && !(_.has(o, 'custom-view') && o['custom-view'])) ? 'index' : o.page, o);
        }
    },
    genTree: function (next) {
        _async.waterfall([
            function (callback) {
                var aggregate = [];
                aggregate.push({
                    $lookup: {
                        from: 'companychannels',
                        localField: '_id',
                        foreignField: 'idCompany',
                        as: 'channels'
                    }
                });
                aggregate.push({
                    $lookup: {
                        from: 'campains',
                        localField: '_id',
                        foreignField: 'idCompany',
                        as: 'campains'
                    }
                });
                aggregate.push({
                    $lookup: {
                        from: 'services',
                        localField: '_id',
                        foreignField: 'idCompany',
                        as: 'services'
                    }
                });
                aggregate.push({
                    $lookup: {
                        from: 'servicemails',
                        localField: '_id',
                        foreignField: 'idCompany',
                        as: 'servicemails'
                    }
                });
                aggregate.push({
                    $lookup: {
                        from: 'agentgroups',
                        localField: '_id',
                        foreignField: 'idParent',
                        as: 'groupAgent'
                    }
                });
                aggregate.push({
                    $lookup: {
                        from: 'trunks',
                        localField: '_id',
                        foreignField: 'idCompany',
                        as: 'trunks'
                    }
                });
                aggregate.push({
                    $unwind: {path: '$channels', preserveNullAndEmptyArrays: true}
                });
                aggregate.push({
                    $lookup: {
                        from: 'servicechats',
                        localField: 'channels._id',
                        foreignField: 'idChannel',
                        as: 'channels.servicechats'
                    }
                });

                aggregate.push({
                    $group: {
                        "_id": "$_id",
                        "name": {$first: "$name"},
                        "companyProfile:": {$first: "$companyProfile"},
                        "status": {$first: "$status"},
                        "channels": {"$push": "$channels"},
                        "services": {"$first": "$services"},
                        "servicemails": {"$first": "$servicemails"},
                        "groupAgent": {"$first": "$groupAgent"},
                        "trunks": {$first: "$trunks"}
                    }
                });
                _Company.aggregate(aggregate, function (err, companies) {
                    callback(err, _.map(companies, function (c) {
                        return _.pick(c, '_id', 'name', 'companyProfile', 'channels', 'services', 'servicemails', 'groupAgent', 'status', 'trunks');
                    }));
                });
            },
            function (result, next) {
                _GroupsProfile.populate(result, {
                    path: 'groupAgent.idProfile',
                    select: 'name status skills recordingState'
                }, next);
            },
            function (result, next) {
                _Skills.populate(result, {
                    path: 'groupAgent.idProfile.skills.idSkill',
                    select: 'skillName alarmDurHigh alarmDurLow recordingState status'
                }, next);
            },
            function (result, next) {
                _GroupsProfileChat.populate(result, {
                    path: 'groupAgent.idProfileChat',
                    select: 'name status skills'
                }, next);
            },
            function (result, next) {
                _SkillsChat.populate(result,
                    [{
                        path: 'groupAgent.idProfileChat.skills.idSkill',
                        select: 'skillName status'
                    },
                        {
                            path: 'channels.servicechats.idSkill',
                            select: 'skillName status'
                        }]
                    , next);
            },
            function (result, next) {
                _GroupsProfileMail.populate(result, {
                    path: 'groupAgent.idProfileMail',
                    select: 'name status skills'
                }, next);
            },
            function (result, next) {
                _SkillsMail.populate(result,
                    [{
                        path: 'groupAgent.idProfileMail.skills.idSkill',
                        select: 'skillName status'
                    },
                        {
                            path: 'channels.servicemails.idSkill',
                            select: 'skillName status'
                        }]
                    , next);
            }
        ], function (err, result) {
            var tree = {};
            tree.ternal = _config.app._id;
            tree.node = result;
            if (!err || _.isEqual(err, 'null')) QUEUE_TernalPublish.queueOverride('TernalTree', tree);
            if (next) next(err, JSON.stringify(tree));
        });
    },
    replaceMultiSpaceAndTrim: function (obj) {
        return _.reduce(_.allKeys(obj), function (memo, key) {
            memo[key] = obj[key];
            if (_.isString(obj[key])) {
                memo[key] = replaceString(obj[key]);
            } else if (obj[key] instanceof Array) {
                memo[key] = replaceArray(obj[key]);
            } else if (obj[key] instanceof Object) {
                memo[key] = _.replaceMultiSpaceAndTrim(obj[key]);
            }
            return memo;
        }, {});

        function replaceString(str) {
            return str.replace(/\s\s+/g, ' ').trim();
        }

        function replaceArray(arr) {
            return _.reduce(arr, function (memo, item) {
                var temp = item;
                if (_.isString(item)) {
                    temp = replaceString(item);
                } else if (item instanceof Array) {
                    temp = replaceArray(item);
                } else if (item instanceof Object) {
                    temp = _.replaceMultiSpaceAndTrim(item);
                }
                memo.push(temp);
                return memo;
            }, []);
        }
    },
    log: function () {
        console.dir(_.values(arguments), {depth: 10});
    },
    convertObjectId: function (params) {
        if (_.isString(params) && mongodb.ObjectID.isValid(params)) {
            return new mongodb.ObjectID(params);
        }
        return params;
    },
    pushNotification: function (type, url, agentId, optional) {
        //Tạo bản ghi notification
        var body = {};
        body['agentId'] = _.convertObjectId(agentId);
        body['type'] = Number(type);
        body['url'] = url;
        if (optional && _.has(optional, 'msg') && _.has(optional, 'title')) {
            body['title'] = optional.title;
            body['msg'] = optional.msg;
        }
        else {
            switch (Number(type)) {
                case 0:
                {
                    //Nhắc ticket đến giờ hẹn xử lý
                    body['title'] = "Cảnh báo";
                    body['msg'] = "Ticket đến hạn xử lý";
                    break;
                }
                case 1:
                {
                    //Ticket được ủy quyền
                    body['title'] = "Thông báo";
                    body['msg'] = "Được ủy quyền xử lý ticket";
                    break;
                }
                case 2:
                {
                    //Được assign vào 1 nhóm
                    body['title'] = "Thông báo";
                    body['msg'] = "Được assign vào nhóm agent";
                    break;
                }
                case 3:
                {
                    //Có tin bài mới
                    body['title'] = "Thông báo";
                    body['msg'] = "Có bài viết mới";
                    break;
                }
                default:
                {
                    break;
                }
            }
        }
        _Notification.create(body, function (err, noti) {
            if (err) {
                console.log(err);
            }
            else {
                if (_.has(_socketUsers, agentId)) {
                    sendToClient(_socketUsers[agentId].sid, 'notification', _.pick(noti, 'type', 'url'));
                }
            }
        });

        //helper send data via socket
        sendToClient = function (sids, route, data) {
            sids.forEach(function (sid) {
                sio.sockets.socket(sid).emit(route, data);
            });
        }

    },

    dynamicInputFilter2: function (el) {
        var _tag = '';
        var _attr = {};
        var _sattr = [];
        var _childs = [];
        switch (el.fieldType) {
            case 2:
                _tag = 'input';
                _attr = {class: 'form-control', type: 'number', id: 'edit_' + el.modalName, name: el.modalName}

                _tag = 'div';
                _attr = {class: 'row '};
                _childs = [
                    {
                        tag: 'div',
                        attr: {class: 'col-sm-6'},
                        childs: [
                            {
                                tag: 'input',
                                attr:{
                                    value: '',
                                    class: 'form-control ',
                                    type: 'number',
                                    id: 'edit_' + el.modalName,
                                    name: el.modalName + '[]'
                                }
                            }
                        ]
                    },
                    {
                        tag: 'div',
                        attr: {class: 'col-sm-6'},
                        childs: [
                            {
                                tag: 'input',
                                attr:{
                                    value: '',
                                    class: 'form-control ',
                                    type: 'number',
                                    id: 'edit_' + el.modalName,
                                    name: el.modalName + '[]'
                                }
                            }
                        ]
                    }
                ];
                break;
        }
        return _.htmlTags([{tag: _tag, attr: _attr, sattr: _sattr, childs: _childs.length ? _childs : []}]);
    },

    switchAgg2: function (type, text) {
        switch (type) {
            case 2:
                var agg = {};
                if(_.isNumber(text[0])) agg.$gte = text[0];
                if(_.isNumber(text[1])) agg.$lte = text[1];
                return agg;
                break;
        }
    },

    getAgentData: function(id){
        var agent = null;
        if(_socketUsers[id.toString()] && _socketUsers[id.toString()].monitor){
            var d = Date.now();
            agent = {};
            var monitor = _socketUsers[id.toString()].monitor;
            agent._id = monitor.getId();
            agent.name = monitor.getUserData().name;
            agent.displayName = monitor.getUserData().displayName;
            agent.extension = monitor.getUserData().deviceID;
            agent.callType = _.getCallType(monitor.getCallType());
            agent.status = monitor.getStatus();
            agent.callStatus = monitor.getCallStatus();
            agent.callTime = monitor.getCallTime() ? _moment(monitor.getCallTime()).format('hh:mm:ss a') : '';
            agent.callDuration = d - monitor.getCallTime();
            agent.caller = monitor.getCaller();
            agent.called = monitor.getCalled();
            agent.timeStatus = monitor.getTimeStatus();
            agent.statusDuration = d - monitor.getTimeStatus();
            agent.groups = monitor.getGroups();
        }
        return agent;
    },

    getCallData: function(data){
        var monitor = _socketUsers[data.agentID.toString()] ? _socketUsers[data.agentID.toString()].monitor : null;
        var agentData = _socketUsers[data.agentID.toString()] ? _socketUsers[data.agentID.toString()].monitor.getUserData() : null;
        var name = agentData ? agentData.name + ' - ' + agentData.displayName : 'Waiting';
        var extension = monitor ? monitor.getDeviceID() : '';
        var d = Date.now();
        return {
            _id: data.callID,
            name: name,
            extension: extension,
            callType: _.getCallType(data.callType),
            agentId: data.agentID,
            callStatus: _.getQueueCallStatus(data.callStatusOnQueue),
            callTime: data.timeCall ? _moment(data.timeCall).format('hh:mm:ss a') : '',
            callDuration:  data.timeCall ? d - data.timeCall : null,
            caller: data.callerNumber,
            called: data.Callee,
            service: data.queueID,
            channelID: data.channelID
        };
    },

    getCallType: function(status){
        switch (status) {
            case 0:
                return 'UNKOWN';
                break;
            case 1:
                return 'CALL IN';
                break;
            case 2:
                return 'TRANSFER';
                break;
            case 3:
                return 'CONFERENCE';
                break;
            case 4:
                return 'LISTEN';
                break;
            case 5:
                return 'JOIN';
                break;
            case 6:
                return 'CALL OUT';
                break;
            case 7:
                return 'LOCAL';
                break;
            case 8:
                return 'PICK UP';
                break;
            case 9:
                return 'WHISPER';
                break;
        }
    },

    getQueueCallStatus: function(status){
        switch (status) {
            case 0:
                return 'UNKNOWN';
                break;
            case 1:
                return 'WAITING';
                break;
            case 2:
                return 'RINGING';
                break;
            case 3:
                return 'ASSIGNED';
                break;
            case 4:
                return 'ASSIGNED(HOLD)';
                break;
            case 5:
                return 'ASSIGNED(CONF)';
                break;
        };
    },

    getAgentCallStatus: function(status){
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
        };
    },

    updateCustomer: function(customerId, obj, callback){
        customerId = new mongodb.ObjectID(customerId);
        _async.waterfall([
            function (next) {
                _async.each(_.keys(obj), function (key, callback) {
                    if(obj[key] == ""){
                        obj[key] = null;
                        _CCKFields[key].db.remove(
                            {entityId: customerId},
                            callback);
                    }else{
                        switch (_CCKFields[key].type) {
                            case 6:
                                obj[key] = _moment(obj[key], 'DD/MM/YYYY')._d;
                                break;
                        }
                        _CCKFields[key].db.update(
                            {entityId: customerId},
                            {$set: {value: obj[key]}},
                            {upsert: true, new: true},
                            callback);
                    }
                }, next);
            },
            function (next) {
                mongoClient.collection('customerindex').update({_id: customerId}, {$set: obj}, next);
            }
        ], callback);
    },

    createID: function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + s4() + s4();
    },

    dynamicCustomerInfo: function (el, v) {
        var _tag = '';
        var _attr = {};
        var _sattr = [];
        var _childs = [];
        var _val = (v && _.has(v, el.modalName) && !_.isEmpty(v[el.modalName]) && !_.isNull(v[el.modalName]) && v[el.modalName].length && _.has(v[el.modalName][0], 'value')) ? v[el.modalName][0].value : '';
        switch (el.fieldType) {
            case 1:
            case 3:
                _tag = 'input';
                _attr = {
                    value: _val,
                    class: 'form-control' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
                    type: 'text',
                    id: 'edit_' + el.modalName,
                    name: el.modalName
                };
                break;
            case 2:
                _tag = 'input';
                _attr = {
                    value: _val,
                    class: 'form-control' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
                    type: 'number',
                    id: 'edit_' + el.modalName,
                    name: el.modalName
                };
                break;
            case 4:
                _sattr.push('multiple');
            case 5:
                _tag = 'select';
                _attr = {
                    class: 'selectpicker' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
                    id: 'edit_' + el.modalName,
                    name: el.modalName + '[]'
                };
                _childs.push({
                    tag: 'option',
                    attr: {value: ''},
                    sattr: ['selected'],
                    content: '---- Chọn ----'
                });
                _.each(el.fieldValue, function (ev) {
                    _childs.push({
                        tag: 'option',
                        attr: {value: ev},
                        sattr: _val == ev ? ['selected'] : [],
                        content: ev
                    });
                });
                break;
            case 6:
                _tag = 'div';
                _attr = {class: 'input-group'};
                _childs = [
                    {
                        tag: 'input',
                        attr: {
                            class: 'form-control date-picker' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
                            value: _moment(_val).format('DD/MM/YYYY'),
                            type: 'text',
                            id: 'edit_' + el.modalName,
                            name: el.modalName
                        }
                    },
                    {
                        tag: 'span',
                        attr: {class: 'input-group-addon p-l-10 bgm-gray c-white'},
                        childs: [{
                            tag: 'i',
                            attr: {
                                role: 'button',
                                class: 'zmdi zmdi-calendar'
                            }
                        }]
                    }
                ];
                break;
            case 7:
                _tag = 'div';
                _attr = {
                    class: 'input-group fg-line'
                };
                // 19.Mar.2017 hoangdv click to creat new ticket
                var clickToCreateTicket = {
                    tag: 'span'
                };
                if (el.modalName !== 'field_so_dien_thoai') {
                    clickToCreateTicket = {
						tag: 'span',
						attr: {
							class: 'input-group-btn clickToCreateTicket',
							'data-phone-number': _val
						},
						childs: [
							{
								tag: 'button',
								attr: {
									class: 'btn btn-default reveal',
									type: 'button',
									style: 'max-height: 31px;'
								},
								childs: [{
									tag: 'i',
									attr: {
										class: 'zmdi zmdi-open-in-new green f-17'
									}
								}]
							}
						]
					}
                }
				_childs.push(
                    {
                        tag: 'input',
                        attr: {
                            value: _val,
                            class: 'form-control 1233333 validate[custom[number]' + _.switch(el.isRequired, [0, 1], ['', ',required']) + ']',
                            type: 'text',
                            id: 'edit_' + el.modalName,
                            name: el.modalName + ':string'
                        }
                    },
                    clickToCreateTicket,
                    {
                        tag: 'span',
                        attr: {
                            class: 'input-group-btn clickToCall',
                            'data-phone-number': _val
                        },
                        childs: [
                            {
                                tag: 'button',
                                attr: {
                                    class: 'btn btn-default reveal',
                                    type: 'button',
                                    style: 'max-height: 31px;'
                                },
                                childs: [{
                                    tag: 'i',
                                    attr: {
                                        class: 'zmdi zmdi-phone-in-talk green f-17'
                                    }
                                }]
                            }
                        ]
                    }
                );
                break;
        }

        return _.htmlTags([{
            tag: _tag,
            attr: _attr,
            sattr: _sattr,
            childs: _childs.length ? _childs : []
        }]);
    }
};