/*
 Highcharts 4.2.4 JS v/Highstock 4.2.4 (2016-04-14)

 (c) 2009-2016 Torstein Honsi

 License: www.highcharts.com/license

 Highcharts funnel module

 (c) 2010-2016 Torstein Honsi

 License: www.highcharts.com/license
 Highcharts 4.2.4 JS v/Highstock 4.2.4 (2016-04-14)
 Exporting module

 (c) 2010-2016 Torstein Honsi

 License: www.highcharts.com/license
 Highcharts 4.2.4 JS v/Highstock 4.2.4 (2016-04-14)
 Client side exporting module

 (c) 2015 Torstein Honsi / Oystein Moseng

 License: www.highcharts.com/license
 Highcharts 4.2.4 JS v/Highstock 4.2.4 (2016-04-14)
 Data module

 (c) 2012-2016 Torstein Honsi

 License: www.highcharts.com/license
 Highcharts 4.2.4 JS v/Highstock 4.2.4 (2016-04-14)
 Plugin for displaying a message when there is no data visible in chart.

 (c) 2010-2016 Highsoft AS
 Author: Oystein Moseng

 License: www.highcharts.com/license
 Highcharts 4.2.4 JS v/Highstock 4.2.4 (2016-04-14)
 Solid angular gauge module

 (c) 2010-2016 Torstein Honsi

 License: www.highcharts.com/license
 Highcharts 4.2.4 JS v/Highstock 4.2.4 (2016-04-14)

 (c) 2011-2016 Torstein Honsi

 License: www.highcharts.com/license
 */
(function (t, T) {
    "object" === typeof module && module.exports ? module.exports = t.document ? T(t) : T : t.Highcharts = T(t)
})("undefined" !== typeof window ? window : this, function (t) {
    function T(a, b) {
        var c = "Highcharts error #" + a + ": www.highcharts.com/errors/" + a;
        if (b)throw Error(c);
        t.console && console.log(c)
    }

    function V(a, b, c) {
        this.options = b;
        this.elem = a;
        this.prop = c
    }

    function x() {
        var a, b = arguments, c, d = {}, e = function (a, b) {
            var c, d;
            "object" !== typeof a && (a = {});
            for (d in b)b.hasOwnProperty(d) && ((c = b[d]) && "object" === typeof c && "[object Array]" !==
            Object.prototype.toString.call(c) && "renderTo" !== d && "number" !== typeof c.nodeType ? a[d] = e(a[d] || {}, c) : a[d] = b[d]);
            return a
        };
        !0 === b[0] && (d = b[1], b = Array.prototype.slice.call(b, 2));
        c = b.length;
        for (a = 0; a < c; a++)d = e(d, b[a]);
        return d
    }

    function H(a, b) {
        return parseInt(a, b || 10)
    }

    function ea(a) {
        return "string" === typeof a
    }

    function R(a) {
        return a && "object" === typeof a
    }

    function N(a) {
        return "[object Array]" === Object.prototype.toString.call(a)
    }

    function r(a) {
        return "number" === typeof a
    }

    function p(a, b) {
        for (var c = a.length; c--;)if (a[c] ===
            b) {
            a.splice(c, 1);
            break
        }
    }

    function y(a) {
        return a !== J && null !== a
    }

    function K(a, b, c) {
        var d, e;
        if (ea(b))y(c) ? a.setAttribute(b, c) : a && a.getAttribute && (e = a.getAttribute(b)); else if (y(b) && R(b))for (d in b)a.setAttribute(d, b[d]);
        return e
    }

    function B(a) {
        return N(a) ? a : [a]
    }

    function D(a, b, c) {
        if (b)return setTimeout(a, b, c);
        a.call(0, c)
    }

    function F(a, b) {
        Ra && !Ba && b && b.opacity !== J && (b.filter = "alpha(opacity=" + 100 * b.opacity + ")");
        O(a.style, b)
    }

    function ia(a, b, c, d, e) {
        a = X.createElement(a);
        b && O(a, b);
        e && F(a, {
            padding: 0, border: "none",
            margin: 0
        });
        c && F(a, c);
        d && d.appendChild(a);
        return a
    }

    function I(a, b) {
        var c = function () {
        };
        c.prototype = new a;
        O(c.prototype, b);
        return c
    }

    function fa(a, b, c) {
        return Array((b || 2) + 1 - String(a).length).join(c || 0) + a
    }

    function v(a, b) {
        return /%$/.test(a) ? b * parseFloat(a) / 100 : parseFloat(a)
    }

    function l(a) {
        return 6E4 * (ib && ib(a) || Db || 0)
    }

    function q(a, b) {
        for (var c = "{", d = !1, e, f, g, h, k, m = []; -1 !== (c = a.indexOf(c));) {
            e = a.slice(0, c);
            if (d) {
                f = e.split(":");
                g = f.shift().split(".");
                k = g.length;
                e = b;
                for (h = 0; h < k; h++)e = e[g[h]];
                f.length && (f =
                    f.join(":"), g = /\.([0-9])/, h = pa.lang, k = void 0, /f$/.test(f) ? (k = (k = f.match(g)) ? k[1] : -1, null !== e && (e = U.numberFormat(e, k, h.decimalPoint, -1 < f.indexOf(",") ? h.thousandsSep : ""))) : e = Da(f, e))
            }
            m.push(e);
            a = a.slice(c + 1);
            c = (d = !d) ? "}" : "{"
        }
        m.push(a);
        return m.join("")
    }

    function E(a) {
        return qa.pow(10, ka(qa.log(a) / qa.LN10))
    }

    function P(a, b, c, d, e) {
        var f, g = a;
        c = z(c, 1);
        f = a / c;
        b || (b = [1, 2, 2.5, 5, 10], !1 === d && (1 === c ? b = [1, 2, 5, 10] : .1 >= c && (b = [1 / c])));
        for (d = 0; d < b.length && !(g = b[d], e && g * c >= a || !e && f <= (b[d] + (b[d + 1] || b[d])) / 2); d++);
        return g *
            c
    }

    function Z(a, b) {
        var c = a.length, d, e;
        for (e = 0; e < c; e++)a[e].safeI = e;
        a.sort(function (a, c) {
            d = b(a, c);
            return 0 === d ? a.safeI - c.safeI : d
        });
        for (e = 0; e < c; e++)delete a[e].safeI
    }

    function Y(a) {
        for (var b = a.length, c = a[0]; b--;)a[b] < c && (c = a[b]);
        return c
    }

    function ya(a) {
        for (var b = a.length, c = a[0]; b--;)a[b] > c && (c = a[b]);
        return c
    }

    function la(a, b) {
        for (var c in a)a[c] && a[c] !== b && a[c].destroy && a[c].destroy(), delete a[c]
    }

    function Sa(a) {
        tb || (tb = ia("div"));
        a && tb.appendChild(a);
        tb.innerHTML = ""
    }

    function ta(a, b) {
        return parseFloat(a.toPrecision(b ||
            14))
    }

    function za(a, b) {
        b.renderer.globalAnimation = z(a, b.animation)
    }

    function jb(a) {
        return R(a) ? x(a) : {duration: a ? 500 : 0}
    }

    function Tb() {
        var a = pa.global, b = a.useUTC, c = b ? "getUTC" : "get", d = b ? "setUTC" : "set";
        xa = a.Date || t.Date;
        Db = b && a.timezoneOffset;
        ib = b && a.getTimezoneOffset;
        ub = function (a, c, d, h, k, m) {
            var n;
            b ? (n = xa.UTC.apply(0, arguments), n += l(n)) : n = (new xa(a, c, z(d, 1), z(h, 0), z(k, 0), z(m, 0))).getTime();
            return n
        };
        Eb = c + "Minutes";
        Fb = c + "Hours";
        Gb = c + "Day";
        db = c + "Date";
        kb = c + "Month";
        lb = c + "FullYear";
        Ub = d + "Milliseconds";
        Vb =
            d + "Seconds";
        Wb = d + "Minutes";
        Xb = d + "Hours";
        vb = d + "Date";
        Hb = d + "Month";
        Ib = d + "FullYear"
    }

    function ha(a) {
        if (!(this instanceof ha))return new ha(a);
        this.init(a)
    }

    function ja() {
    }

    function ua(a, b, c, d) {
        this.axis = a;
        this.pos = b;
        this.type = c || "";
        this.isNew = !0;
        c || d || this.addLabel()
    }

    function $a(a, b, c, d, e) {
        var f = a.chart.inverted;
        this.axis = a;
        this.isNegative = c;
        this.options = b;
        this.x = d;
        this.total = null;
        this.points = {};
        this.stack = e;
        this.rightCliff = this.leftCliff = 0;
        this.alignOptions = {
            align: b.align || (f ? c ? "left" : "right" : "center"),
            verticalAlign: b.verticalAlign || (f ? "middle" : c ? "bottom" : "top"),
            y: z(b.y, f ? 4 : c ? 14 : -6),
            x: z(b.x, f ? c ? -6 : 6 : 0)
        };
        this.textAlign = b.textAlign || (f ? c ? "right" : "left" : "center")
    }

    function eb(a) {
        var b = a.options, c = b.navigator, d = c.enabled, b = b.scrollbar, e = b.enabled, f = d ? c.height : 0, g = e ? b.height : 0;
        this.handles = [];
        this.scrollbarButtons = [];
        this.elementsToDestroy = [];
        this.chart = a;
        this.setBaseSeries();
        this.height = f;
        this.scrollbarHeight = g;
        this.scrollbarEnabled = e;
        this.navigatorEnabled = d;
        this.navigatorOptions = c;
        this.scrollbarOptions =
            b;
        this.outlineHeight = f + g;
        this.init()
    }

    function fb(a) {
        this.init(a)
    }

    function Yb(a, b, c) {
        this.init(a, b, c)
    }

    var J, X = t.document, qa = Math, M = qa.round, ka = qa.floor, Oa = qa.ceil, L = qa.max, W = qa.min, ra = qa.abs, wa = qa.cos, Ca = qa.sin, Ma = qa.PI, Ga = 2 * Ma / 360, Ta = t.navigator && t.navigator.userAgent || "", Zb = t.opera, Ra = /(msie|trident|edge)/i.test(Ta) && !Zb, wb = X && 8 === X.documentMode, xb = !Ra && /AppleWebKit/.test(Ta), ab = /Firefox/.test(Ta), mb = /(Mobile|Android|Windows Phone)/.test(Ta), Ua = "http://www.w3.org/2000/svg", Ba = X && X.createElementNS && !!X.createElementNS(Ua, "svg").createSVGRect, jc = ab && 4 > parseInt(Ta.split("Firefox/")[1], 10), Ha = X && !Ba && !Ra && !!X.createElement("canvas").getContext, bb, gb, $b = {}, Jb = 0, tb, pa, Da, ma, oa = function () {
    }, va = [], nb = 0, kc = /^[0-9]+$/, yb = ["plotTop", "marginRight", "marginBottom", "plotLeft"], xa, ub, Db, ib, Eb, Fb, Gb, db, kb, lb, Ub, Vb, Wb, Xb, vb, Hb, Ib, S = {}, U;
    U = t.Highcharts ? T(16, !0) : {win: t};
    U.seriesTypes = S;
    var Va = [], Ka, Ia, C, Wa, Kb, Ea, aa, sa, na, hb, Xa;
    V.prototype = {
        dSetter: function () {
            var a = this.paths[0], b = this.paths[1], c = [], d = this.now,
                e = a.length, f;
            if (1 === d)c = this.toD; else if (e === b.length && 1 > d)for (; e--;)f = parseFloat(a[e]), c[e] = isNaN(f) ? a[e] : d * parseFloat(b[e] - f) + f; else c = b;
            this.elem.attr("d", c)
        }, update: function () {
            var a = this.elem, b = this.prop, c = this.now, d = this.options.step;
            if (this[b + "Setter"])this[b + "Setter"](); else a.attr ? a.element && a.attr(b, c) : a.style[b] = c + this.unit;
            d && d.call(a, c, this)
        }, run: function (a, b, c) {
            var d = this, e = function (a) {
                return e.stopped ? !1 : d.step(a)
            }, f;
            this.startTime = +new xa;
            this.start = a;
            this.end = b;
            this.unit = c;
            this.now =
                this.start;
            this.pos = 0;
            e.elem = this.elem;
            e() && 1 === Va.push(e) && (e.timerId = setInterval(function () {
                for (f = 0; f < Va.length; f++)Va[f]() || Va.splice(f--, 1);
                Va.length || clearInterval(e.timerId)
            }, 13))
        }, step: function (a) {
            var b = +new xa, c, d = this.options;
            c = this.elem;
            var e = d.complete, f = d.duration, g = d.curAnim, h;
            if (c.attr && !c.element)c = !1; else if (a || b >= f + this.startTime) {
                this.now = this.end;
                this.pos = 1;
                this.update();
                a = g[this.prop] = !0;
                for (h in g)!0 !== g[h] && (a = !1);
                a && e && e.call(c);
                c = !1
            } else this.pos = d.easing((b - this.startTime) /
                f), this.now = this.start + (this.end - this.start) * this.pos, this.update(), c = !0;
            return c
        }, initPath: function (a, b, c) {
            b = b || "";
            var d = a.shift, e = -1 < b.indexOf("C"), f = e ? 7 : 3, g;
            b = b.split(" ");
            c = [].concat(c);
            var h = a.isArea, k = h ? 2 : 1, m = function (a) {
                for (g = a.length; g--;)"M" !== a[g] && "L" !== a[g] || a.splice(g + 1, 0, a[g + 1], a[g + 2], a[g + 1], a[g + 2])
            };
            e && (m(b), m(c));
            if (d <= c.length / f && b.length === c.length)for (; d--;)c = c.slice(0, f).concat(c), h && (c = c.concat(c.slice(c.length - f)));
            a.shift = 0;
            if (b.length)for (a = c.length; b.length < a;)d = b.slice().splice(b.length /
                k - f, f * k), e && (d[f - 6] = d[f - 2], d[f - 5] = d[f - 1]), [].splice.apply(b, [b.length / k, 0].concat(d));
            return [b, c]
        }
    };
    var O = U.extend = function (a, b) {
        var c;
        a || (a = {});
        for (c in b)a[c] = b[c];
        return a
    }, z = U.pick = function () {
        var a = arguments, b, c, d = a.length;
        for (b = 0; b < d; b++)if (c = a[b], c !== J && null !== c)return c
    }, ca = U.wrap = function (a, b, c) {
        var d = a[b];
        a[b] = function () {
            var a = Array.prototype.slice.call(arguments);
            a.unshift(d);
            return c.apply(this, a)
        }
    };
    Da = function (a, b, c) {
        if (!y(b) || isNaN(b))return pa.lang.invalidDate || "";
        a = z(a, "%Y-%m-%d %H:%M:%S");
        var d = new xa(b - l(b)), e, f = d[Fb](), g = d[Gb](), h = d[db](), k = d[kb](), m = d[lb](), n = pa.lang, u = n.weekdays, w = n.shortWeekdays, d = O({
            a: w ? w[g] : u[g].substr(0, 3),
            A: u[g],
            d: fa(h),
            e: fa(h, 2, " "),
            w: g,
            b: n.shortMonths[k],
            B: n.months[k],
            m: fa(k + 1),
            y: m.toString().substr(2, 2),
            Y: m,
            H: fa(f),
            k: f,
            I: fa(f % 12 || 12),
            l: f % 12 || 12,
            M: fa(d[Eb]()),
            p: 12 > f ? "AM" : "PM",
            P: 12 > f ? "am" : "pm",
            S: fa(d.getSeconds()),
            L: fa(M(b % 1E3), 3)
        }, U.dateFormats);
        for (e in d)for (; -1 !== a.indexOf("%" + e);)a = a.replace("%" + e, "function" === typeof d[e] ? d[e](b) : d[e]);
        return c ? a.substr(0,
            1).toUpperCase() + a.substr(1) : a
    };
    ma = {
        millisecond: 1,
        second: 1E3,
        minute: 6E4,
        hour: 36E5,
        day: 864E5,
        week: 6048E5,
        month: 24192E5,
        year: 314496E5
    };
    U.numberFormat = function (a, b, c, d) {
        a = +a || 0;
        var e = pa.lang, f = (a.toString().split(".")[1] || "").length, g, h, k = Math.abs(a);
        -1 === b ? b = Math.min(f, 20) : isNaN(b) && (b = 2);
        g = String(H(k.toFixed(b)));
        h = 3 < g.length ? g.length % 3 : 0;
        c = z(c, e.decimalPoint);
        d = z(d, e.thousandsSep);
        a = (0 > a ? "-" : "") + (h ? g.substr(0, h) + d : "");
        a += g.substr(h).replace(/(\d{3})(?=\d)/g, "$1" + d);
        +b && (d = Math.abs(k - g + Math.pow(10,
                -Math.max(b, f) - 1)), a += c + d.toFixed(b).slice(2));
        return a
    };
    Math.easeInOutSine = function (a) {
        return -.5 * (Math.cos(Math.PI * a) - 1)
    };
    Ka = function (a, b) {
        var c;
        return "width" === b ? Math.min(a.offsetWidth, a.scrollWidth) - Ka(a, "padding-left") - Ka(a, "padding-right") : "height" === b ? Math.min(a.offsetHeight, a.scrollHeight) - Ka(a, "padding-top") - Ka(a, "padding-bottom") : (c = t.getComputedStyle(a, void 0)) && H(c.getPropertyValue(b))
    };
    Ia = function (a, b) {
        return b.indexOf ? b.indexOf(a) : [].indexOf.call(b, a)
    };
    Wa = function (a, b) {
        return [].filter.call(a,
            b)
    };
    Ea = function (a, b) {
        for (var c = [], d = 0, e = a.length; d < e; d++)c[d] = b.call(a[d], a[d], d, a);
        return c
    };
    Kb = function (a) {
        var b = X.documentElement;
        a = a.getBoundingClientRect();
        return {
            top: a.top + (t.pageYOffset || b.scrollTop) - (b.clientTop || 0),
            left: a.left + (t.pageXOffset || b.scrollLeft) - (b.clientLeft || 0)
        }
    };
    Xa = function (a) {
        for (var b = Va.length; b--;)Va[b].elem === a && (Va[b].stopped = !0)
    };
    C = function (a, b) {
        return Array.prototype.forEach.call(a, b)
    };
    aa = function (a, b, c) {
        function d(b) {
            b.target = b.srcElement || t;
            c.call(a, b)
        }

        var e = a.hcEvents =
            a.hcEvents || {};
        a.addEventListener ? a.addEventListener(b, c, !1) : a.attachEvent && (a.hcEventsIE || (a.hcEventsIE = {}), a.hcEventsIE[c.toString()] = d, a.attachEvent("on" + b, d));
        e[b] || (e[b] = []);
        e[b].push(c)
    };
    sa = function (a, b, c) {
        function d(b, c) {
            a.removeEventListener ? a.removeEventListener(b, c, !1) : a.attachEvent && (c = a.hcEventsIE[c.toString()], a.detachEvent("on" + b, c))
        }

        function e() {
            var c, e;
            if (a.nodeName)for (e in b ? (c = {}, c[b] = !0) : c = g, c)if (g[e])for (c = g[e].length; c--;)d(e, g[e][c])
        }

        var f, g = a.hcEvents, h;
        g && (b ? (f = g[b] || [], c ?
            (h = Ia(c, f), -1 < h && (f.splice(h, 1), g[b] = f), d(b, c)) : (e(), g[b] = [])) : (e(), a.hcEvents = {}))
    };
    na = function (a, b, c, d) {
        var e;
        e = a.hcEvents;
        var f, g;
        c = c || {};
        if (X.createEvent && (a.dispatchEvent || a.fireEvent))e = X.createEvent("Events"), e.initEvent(b, !0, !0), e.target = a, O(e, c), a.dispatchEvent ? a.dispatchEvent(e) : a.fireEvent(b, e); else if (e)for (e = e[b] || [], f = e.length, c.preventDefault || (c.preventDefault = function () {
            c.defaultPrevented = !0
        }), c.target = a, c.type || (c.type = b), b = 0; b < f; b++)g = e[b], !1 === g.call(a, c) && c.preventDefault();
        d && !c.defaultPrevented && d(c)
    };
    hb = function (a, b, c) {
        var d, e = "", f, g, h;
        R(c) || (d = arguments, c = {duration: d[2], easing: d[3], complete: d[4]});
        r(c.duration) || (c.duration = 400);
        c.easing = "function" === typeof c.easing ? c.easing : Math[c.easing] || Math.easeInOutSine;
        c.curAnim = x(b);
        for (h in b)g = new V(a, c, h), f = null, "d" === h ? (g.paths = g.initPath(a, a.d, b.d), g.toD = b.d, d = 0, f = 1) : a.attr ? d = a.attr(h) : (d = parseFloat(Ka(a, h)) || 0, "opacity" !== h && (e = "px")), f || (f = b[h]), f.match && f.match("px") && (f = f.replace(/px/g, "")), g.run(d, f, e)
    };
    t.jQuery &&
    (t.jQuery.fn.highcharts = function () {
        var a = [].slice.call(arguments);
        if (this[0])return a[0] ? (new (U[ea(a[0]) ? a.shift() : "Chart"])(this[0], a[0], a[1]), this) : va[K(this[0], "data-highcharts-chart")]
    });
    X && !X.defaultView && (Ka = function (a, b) {
        var c;
        c = {width: "clientWidth", height: "clientHeight"}[b];
        if (a.style[b])return H(a.style[b]);
        "opacity" === b && (b = "filter");
        if (c)return a.style.zoom = 1, Math.max(a[c] - 2 * Ka(a, "padding"), 0);
        c = a.currentStyle[b.replace(/\-(\w)/g, function (a, b) {
            return b.toUpperCase()
        })];
        "filter" === b && (c =
            c.replace(/alpha\(opacity=([0-9]+)\)/, function (a, b) {
                return b / 100
            }));
        return "" === c ? 1 : H(c)
    });
    Array.prototype.forEach || (C = function (a, b) {
        for (var c = 0, d = a.length; c < d; c++)if (!1 === b.call(a[c], a[c], c, a))return c
    });
    Array.prototype.indexOf || (Ia = function (a, b) {
        var c, d = 0;
        if (b)for (c = b.length; d < c; d++)if (b[d] === a)return d;
        return -1
    });
    Array.prototype.filter || (Wa = function (a, b) {
        for (var c = [], d = 0, e = a.length; d < e; d++)b(a[d], d) && c.push(a[d]);
        return c
    });
    U.Fx = V;
    U.inArray = Ia;
    U.each = C;
    U.grep = Wa;
    U.offset = Kb;
    U.map = Ea;
    U.addEvent =
        aa;
    U.removeEvent = sa;
    U.fireEvent = na;
    U.animate = hb;
    U.animObject = jb;
    U.stop = Xa;
    pa = {
        colors: "#7cb5ec #434348 #90ed7d #f7a35c #8085e9 #f15c80 #e4d354 #2b908f #f45b5b #91e8e1".split(" "),
        symbols: ["circle", "diamond", "square", "triangle", "triangle-down"],
        lang: {
            loading: "Loading...",
            months: "January February March April May June July August September October November December".split(" "),
            shortMonths: "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
            weekdays: "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
            decimalPoint: ".",
            numericSymbols: "kMGTPE".split(""),
            resetZoom: "Reset zoom",
            resetZoomTitle: "Reset zoom level 1:1",
            thousandsSep: " "
        },
        global: {
            useUTC: !0,
            canvasToolsURL: "http://code.highcharts.com@product.cdnpath@//Highstock 4.2.4/modules/canvas-tools.js",
            VMLRadialGradientURL: "http://code.highcharts.com@product.cdnpath@//Highstock 4.2.4/gfx/vml-radial-gradient.png"
        },
        chart: {
            borderColor: "#4572A7",
            borderRadius: 0,
            defaultSeriesType: "line",
            ignoreHiddenSeries: !0,
            spacing: [10, 10, 15, 10],
            backgroundColor: "#FFFFFF",
            plotBorderColor: "#C0C0C0",
            resetZoomButton: {theme: {zIndex: 20}, position: {align: "right", x: -10, y: 10}}
        },
        title: {text: "Chart title", align: "center", margin: 15, style: {color: "#333333", fontSize: "18px"}},
        subtitle: {text: "", align: "center", style: {color: "#555555"}},
        plotOptions: {
            line: {
                allowPointSelect: !1,
                showCheckbox: !1,
                animation: {duration: 1E3},
                events: {},
                lineWidth: 2,
                marker: {
                    lineWidth: 0, radius: 4, lineColor: "#FFFFFF", states: {
                        hover: {enabled: !0, lineWidthPlus: 1, radiusPlus: 2}, select: {
                            fillColor: "#FFFFFF", lineColor: "#000000",
                            lineWidth: 2
                        }
                    }
                },
                point: {events: {}},
                dataLabels: {
                    align: "center",
                    formatter: function () {
                        return null === this.y ? "" : U.numberFormat(this.y, -1)
                    },
                    style: {
                        color: "contrast",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textShadow: "0 0 6px contrast, 0 0 3px contrast"
                    },
                    verticalAlign: "bottom",
                    x: 0,
                    y: 0,
                    padding: 5
                },
                cropThreshold: 300,
                pointRange: 0,
                softThreshold: !0,
                states: {hover: {lineWidthPlus: 1, marker: {}, halo: {size: 10, opacity: .25}}, select: {marker: {}}},
                stickyTracking: !0,
                turboThreshold: 1E3
            }
        },
        labels: {style: {position: "absolute", color: "#3E576F"}},
        legend: {
            enabled: !0,
            align: "center",
            layout: "horizontal",
            labelFormatter: function () {
                return this.name
            },
            borderColor: "#909090",
            borderRadius: 0,
            navigation: {activeColor: "#274b6d", inactiveColor: "#CCC"},
            shadow: !1,
            itemStyle: {color: "#333333", fontSize: "12px", fontWeight: "bold"},
            itemHoverStyle: {color: "#000"},
            itemHiddenStyle: {color: "#CCC"},
            itemCheckboxStyle: {position: "absolute", width: "13px", height: "13px"},
            symbolPadding: 5,
            verticalAlign: "bottom",
            x: 0,
            y: 0,
            title: {style: {fontWeight: "bold"}}
        },
        loading: {
            labelStyle: {
                fontWeight: "bold",
                position: "relative", top: "45%"
            }, style: {position: "absolute", backgroundColor: "white", opacity: .5, textAlign: "center"}
        },
        tooltip: {
            enabled: !0,
            animation: Ba,
            backgroundColor: "rgba(249, 249, 249, .85)",
            borderWidth: 1,
            borderRadius: 3,
            dateTimeLabelFormats: {
                millisecond: "%A, %b %e, %H:%M:%S.%L",
                second: "%A, %b %e, %H:%M:%S",
                minute: "%A, %b %e, %H:%M",
                hour: "%A, %b %e, %H:%M",
                day: "%A, %b %e, %Y",
                week: "Week from %A, %b %e, %Y",
                month: "%B %Y",
                year: "%Y"
            },
            footerFormat: "",
            headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
            pointFormat: '<span style="color:{point.color}">\u25cf</span> {series.name}: <b>{point.y}</b><br/>',
            shadow: !0,
            snap: mb ? 25 : 10,
            style: {
                color: "#333333",
                cursor: "default",
                fontSize: "12px",
                padding: "8px",
                pointerEvents: "none",
                whiteSpace: "nowrap"
            }
        },
        credits: {
            enabled: !0,
            text: "Highcharts.com",
            href: "http://www.highcharts.com",
            position: {align: "right", x: -10, verticalAlign: "bottom", y: -5},
            style: {cursor: "pointer", color: "#909090", fontSize: "9px"}
        }
    };
    var ba = pa.plotOptions, ob = ba.line;
    Tb();
    ha.prototype = {
        parsers: [{
            regex: /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/,
            parse: function (a) {
                return [H(a[1]), H(a[2]), H(a[3]), parseFloat(a[4], 10)]
            }
        }, {
            regex: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/, parse: function (a) {
                return [H(a[1], 16), H(a[2], 16), H(a[3], 16), 1]
            }
        }, {
            regex: /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/, parse: function (a) {
                return [H(a[1]), H(a[2]), H(a[3]), 1]
            }
        }], init: function (a) {
            var b, c, d, e;
            if ((this.input = a) && a.stops)this.stops = Ea(a.stops, function (a) {
                return new ha(a[1])
            }); else for (d = this.parsers.length; d-- && !c;)e = this.parsers[d], (b = e.regex.exec(a)) &&
            (c = e.parse(b));
            this.rgba = c || []
        }, get: function (a) {
            var b = this.input, c = this.rgba, d;
            this.stops ? (d = x(b), d.stops = [].concat(d.stops), C(this.stops, function (b, c) {
                d.stops[c] = [d.stops[c][0], b.get(a)]
            })) : d = c && !isNaN(c[0]) ? "rgb" === a || !a && 1 === c[3] ? "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")" : "a" === a ? c[3] : "rgba(" + c.join(",") + ")" : b;
            return d
        }, brighten: function (a) {
            var b, c = this.rgba;
            if (this.stops)C(this.stops, function (b) {
                b.brighten(a)
            }); else if (r(a) && 0 !== a)for (b = 0; 3 > b; b++)c[b] += H(255 * a), 0 > c[b] && (c[b] = 0), 255 < c[b] && (c[b] = 255);
            return this
        },
        setOpacity: function (a) {
            this.rgba[3] = a;
            return this
        }
    };
    ja.prototype = {
        opacity: 1,
        textProps: "direction fontSize fontWeight fontFamily fontStyle color lineHeight width textDecoration textOverflow textShadow".split(" "),
        init: function (a, b) {
            this.element = "span" === b ? ia(b) : X.createElementNS(Ua, b);
            this.renderer = a
        },
        animate: function (a, b, c) {
            b = z(b, this.renderer.globalAnimation, !0);
            Xa(this);
            b ? (c && (b.complete = c), hb(this, a, b)) : this.attr(a, null, c);
            return this
        },
        colorGradient: function (a, b, c) {
            var d = this.renderer, e, f, g, h,
                k, m, n, u, w, A, G, Q = [], l;
            a.linearGradient ? f = "linearGradient" : a.radialGradient && (f = "radialGradient");
            if (f) {
                g = a[f];
                k = d.gradients;
                n = a.stops;
                A = c.radialReference;
                N(g) && (a[f] = g = {x1: g[0], y1: g[1], x2: g[2], y2: g[3], gradientUnits: "userSpaceOnUse"});
                "radialGradient" === f && A && !y(g.gradientUnits) && (h = g, g = x(g, d.getRadialAttr(A, h), {gradientUnits: "userSpaceOnUse"}));
                for (G in g)"id" !== G && Q.push(G, g[G]);
                for (G in n)Q.push(n[G]);
                Q = Q.join(",");
                k[Q] ? A = k[Q].attr("id") : (g.id = A = "highcharts-" + Jb++, k[Q] = m = d.createElement(f).attr(g).add(d.defs),
                    m.radAttr = h, m.stops = [], C(n, function (a) {
                    0 === a[1].indexOf("rgba") ? (e = ha(a[1]), u = e.get("rgb"), w = e.get("a")) : (u = a[1], w = 1);
                    a = d.createElement("stop").attr({offset: a[0], "stop-color": u, "stop-opacity": w}).add(m);
                    m.stops.push(a)
                }));
                l = "url(" + d.url + "#" + A + ")";
                c.setAttribute(b, l);
                c.gradient = Q;
                a.toString = function () {
                    return l
                }
            }
        },
        applyTextShadow: function (a) {
            var b = this.element, c, d = -1 !== a.indexOf("contrast"), e = {}, f = this.renderer.forExport, g = f || b.style.textShadow !== J && !Ra;
            d && (e.textShadow = a = a.replace(/contrast/g, this.renderer.getContrast(b.style.fill)));
            if (xb || f)e.textRendering = "geometricPrecision";
            g ? this.css(e) : (this.fakeTS = !0, this.ySetter = this.xSetter, c = [].slice.call(b.getElementsByTagName("tspan")), C(a.split(/\s?,\s?/g), function (a) {
                var d = b.firstChild, e, f;
                a = a.split(" ");
                e = a[a.length - 1];
                (f = a[a.length - 2]) && C(c, function (a, c) {
                    var g;
                    0 === c && (a.setAttribute("x", b.getAttribute("x")), c = b.getAttribute("y"), a.setAttribute("y", c || 0), null === c && b.setAttribute("y", 0));
                    g = a.cloneNode(1);
                    K(g, {
                        "class": "highcharts-text-shadow", fill: e, stroke: e, "stroke-opacity": 1 / L(H(f),
                            3), "stroke-width": f, "stroke-linejoin": "round"
                    });
                    b.insertBefore(g, d)
                })
            }))
        },
        attr: function (a, b, c) {
            var d, e = this.element, f, g = this, h;
            "string" === typeof a && b !== J && (d = a, a = {}, a[d] = b);
            if ("string" === typeof a)g = (this[a + "Getter"] || this._defaultGetter).call(this, a, e); else {
                for (d in a)b = a[d], h = !1, this.symbolName && /^(x|y|width|height|r|start|end|innerR|anchorX|anchorY)/.test(d) && (f || (this.symbolAttr(a), f = !0), h = !0), !this.rotation || "x" !== d && "y" !== d || (this.doTransform = !0), h || (h = this[d + "Setter"] || this._defaultSetter, h.call(this,
                    b, d, e), this.shadows && /^(width|height|visibility|x|y|d|transform|cx|cy|r)$/.test(d) && this.updateShadows(d, b, h));
                this.doTransform && (this.updateTransform(), this.doTransform = !1)
            }
            c && c();
            return g
        },
        updateShadows: function (a, b, c) {
            for (var d = this.shadows, e = d.length; e--;)c.call(d[e], "height" === a ? Math.max(b - (d[e].cutHeight || 0), 0) : "d" === a ? this.d : b, a, d[e])
        },
        addClass: function (a) {
            var b = this.element, c = K(b, "class") || "";
            -1 === c.indexOf(a) && K(b, "class", c + " " + a);
            return this
        },
        symbolAttr: function (a) {
            var b = this;
            C("x y r start end width height innerR anchorX anchorY".split(" "),
                function (c) {
                    b[c] = z(a[c], b[c])
                });
            b.attr({d: b.renderer.symbols[b.symbolName](b.x, b.y, b.width, b.height, b)})
        },
        clip: function (a) {
            return this.attr("clip-path", a ? "url(" + this.renderer.url + "#" + a.id + ")" : "none")
        },
        crisp: function (a) {
            var b, c = {}, d, e = this.strokeWidth || 0;
            d = M(e) % 2 / 2;
            a.x = ka(a.x || this.x || 0) + d;
            a.y = ka(a.y || this.y || 0) + d;
            a.width = ka((a.width || this.width || 0) - 2 * d);
            a.height = ka((a.height || this.height || 0) - 2 * d);
            a.strokeWidth = e;
            for (b in a)this[b] !== a[b] && (this[b] = c[b] = a[b]);
            return c
        },
        css: function (a) {
            var b = this.styles,
                c = {}, d = this.element, e, f, g = "";
            e = !b;
            a && a.color && (a.fill = a.color);
            if (b)for (f in a)a[f] !== b[f] && (c[f] = a[f], e = !0);
            if (e) {
                e = this.textWidth = a && a.width && "text" === d.nodeName.toLowerCase() && H(a.width) || this.textWidth;
                b && (a = O(b, c));
                this.styles = a;
                e && (Ha || !Ba && this.renderer.forExport) && delete a.width;
                if (Ra && !Ba)F(this.element, a); else {
                    b = function (a, b) {
                        return "-" + b.toLowerCase()
                    };
                    for (f in a)g += f.replace(/([A-Z])/g, b) + ":" + a[f] + ";";
                    K(d, "style", g)
                }
                e && this.added && this.renderer.buildText(this)
            }
            return this
        },
        on: function (a,
                      b) {
            var c = this, d = c.element;
            gb && "click" === a ? (d.ontouchstart = function (a) {
                c.touchEventFired = xa.now();
                a.preventDefault();
                b.call(d, a)
            }, d.onclick = function (a) {
                (-1 === Ta.indexOf("Android") || 1100 < xa.now() - (c.touchEventFired || 0)) && b.call(d, a)
            }) : d["on" + a] = b;
            return this
        },
        setRadialReference: function (a) {
            var b = this.renderer.gradients[this.element.gradient];
            this.element.radialReference = a;
            b && b.radAttr && b.animate(this.renderer.getRadialAttr(a, b.radAttr));
            return this
        },
        translate: function (a, b) {
            return this.attr({
                translateX: a,
                translateY: b
            })
        },
        invert: function () {
            this.inverted = !0;
            this.updateTransform();
            return this
        },
        updateTransform: function () {
            var a = this.translateX || 0, b = this.translateY || 0, c = this.scaleX, d = this.scaleY, e = this.inverted, f = this.rotation, g = this.element;
            e && (a += this.attr("width"), b += this.attr("height"));
            a = ["translate(" + a + "," + b + ")"];
            e ? a.push("rotate(90) scale(-1,1)") : f && a.push("rotate(" + f + " " + (g.getAttribute("x") || 0) + " " + (g.getAttribute("y") || 0) + ")");
            (y(c) || y(d)) && a.push("scale(" + z(c, 1) + " " + z(d, 1) + ")");
            a.length && g.setAttribute("transform",
                a.join(" "))
        },
        toFront: function () {
            var a = this.element;
            a.parentNode.appendChild(a);
            return this
        },
        align: function (a, b, c) {
            var d, e, f, g, h = {};
            e = this.renderer;
            f = e.alignedObjects;
            if (a) {
                if (this.alignOptions = a, this.alignByTranslate = b, !c || ea(c))this.alignTo = d = c || "renderer", p(f, this), f.push(this), c = null
            } else a = this.alignOptions, b = this.alignByTranslate, d = this.alignTo;
            c = z(c, e[d], e);
            d = a.align;
            e = a.verticalAlign;
            f = (c.x || 0) + (a.x || 0);
            g = (c.y || 0) + (a.y || 0);
            if ("right" === d || "center" === d)f += (c.width - (a.width || 0)) / {right: 1, center: 2}[d];
            h[b ? "translateX" : "x"] = M(f);
            if ("bottom" === e || "middle" === e)g += (c.height - (a.height || 0)) / ({bottom: 1, middle: 2}[e] || 1);
            h[b ? "translateY" : "y"] = M(g);
            this[this.placed ? "animate" : "attr"](h);
            this.placed = !0;
            this.alignAttr = h;
            return this
        },
        getBBox: function (a, b) {
            var c, d = this.renderer, e, f, g, h = this.element, k = this.styles;
            e = this.textStr;
            var m, n = h.style, u, w = d.cache, A = d.cacheKeys, G;
            f = z(b, this.rotation);
            g = f * Ga;
            e !== J && (G = ["", f || 0, k && k.fontSize, h.style.width].join(), G = "" === e || kc.test(e) ? "num:" + e.toString().length + G : e + G);
            G && !a && (c = w[G]);
            if (!c) {
                if (h.namespaceURI === Ua || d.forExport) {
                    try {
                        u = this.fakeTS && function (a) {
                                C(h.querySelectorAll(".highcharts-text-shadow"), function (b) {
                                    b.style.display = a
                                })
                            }, ab && n.textShadow ? (m = n.textShadow, n.textShadow = "") : u && u("none"), c = h.getBBox ? O({}, h.getBBox()) : {
                            width: h.offsetWidth,
                            height: h.offsetHeight
                        }, m ? n.textShadow = m : u && u("")
                    } catch (Q) {
                    }
                    if (!c || 0 > c.width)c = {width: 0, height: 0}
                } else c = this.htmlGetBBox();
                d.isSVG && (d = c.width, e = c.height, Ra && k && "11px" === k.fontSize && "16.9" === e.toPrecision(3) && (c.height =
                    e = 14), f && (c.width = ra(e * Ca(g)) + ra(d * wa(g)), c.height = ra(e * wa(g)) + ra(d * Ca(g))));
                if (G) {
                    for (; 250 < A.length;)delete w[A.shift()];
                    w[G] || A.push(G);
                    w[G] = c
                }
            }
            return c
        },
        show: function (a) {
            return this.attr({visibility: a ? "inherit" : "visible"})
        },
        hide: function () {
            return this.attr({visibility: "hidden"})
        },
        fadeOut: function (a) {
            var b = this;
            b.animate({opacity: 0}, {
                duration: a || 150, complete: function () {
                    b.attr({y: -9999})
                }
            })
        },
        add: function (a) {
            var b = this.renderer, c = this.element, d;
            a && (this.parentGroup = a);
            this.parentInverted = a && a.inverted;
            void 0 !== this.textStr && b.buildText(this);
            this.added = !0;
            if (!a || a.handleZ || this.zIndex)d = this.zIndexSetter();
            d || (a ? a.element : b.box).appendChild(c);
            if (this.onAdd)this.onAdd();
            return this
        },
        safeRemoveChild: function (a) {
            var b = a.parentNode;
            b && b.removeChild(a)
        },
        destroy: function () {
            var a = this, b = a.element || {}, c = a.shadows, d = a.renderer.isSVG && "SPAN" === b.nodeName && a.parentGroup, e, f;
            b.onclick = b.onmouseout = b.onmouseover = b.onmousemove = b.point = null;
            Xa(a);
            a.clipPath && (a.clipPath = a.clipPath.destroy());
            if (a.stops) {
                for (f =
                         0; f < a.stops.length; f++)a.stops[f] = a.stops[f].destroy();
                a.stops = null
            }
            a.safeRemoveChild(b);
            for (c && C(c, function (b) {
                a.safeRemoveChild(b)
            }); d && d.div && 0 === d.div.childNodes.length;)b = d.parentGroup, a.safeRemoveChild(d.div), delete d.div, d = b;
            a.alignTo && p(a.renderer.alignedObjects, a);
            for (e in a)delete a[e];
            return null
        },
        shadow: function (a, b, c) {
            var d = [], e, f, g = this.element, h, k, m, n;
            if (a) {
                k = z(a.width, 3);
                m = (a.opacity || .15) / k;
                n = this.parentInverted ? "(-1,-1)" : "(" + z(a.offsetX, 1) + ", " + z(a.offsetY, 1) + ")";
                for (e = 1; e <= k; e++)f =
                    g.cloneNode(0), h = 2 * k + 1 - 2 * e, K(f, {
                    isShadow: "true",
                    stroke: a.color || "black",
                    "stroke-opacity": m * e,
                    "stroke-width": h,
                    transform: "translate" + n,
                    fill: "none"
                }), c && (K(f, "height", L(K(f, "height") - h, 0)), f.cutHeight = h), b ? b.element.appendChild(f) : g.parentNode.insertBefore(f, g), d.push(f);
                this.shadows = d
            }
            return this
        },
        xGetter: function (a) {
            "circle" === this.element.nodeName && (a = {x: "cx", y: "cy"}[a] || a);
            return this._defaultGetter(a)
        },
        _defaultGetter: function (a) {
            a = z(this[a], this.element ? this.element.getAttribute(a) : null, 0);
            /^[\-0-9\.]+$/.test(a) &&
            (a = parseFloat(a));
            return a
        },
        dSetter: function (a, b, c) {
            a && a.join && (a = a.join(" "));
            /(NaN| {2}|^$)/.test(a) && (a = "M 0 0");
            c.setAttribute(b, a);
            this[b] = a
        },
        dashstyleSetter: function (a) {
            var b, c = this["stroke-width"];
            "inherit" === c && (c = 1);
            if (a = a && a.toLowerCase()) {
                a = a.replace("shortdashdotdot", "3,1,1,1,1,1,").replace("shortdashdot", "3,1,1,1").replace("shortdot", "1,1,").replace("shortdash", "3,1,").replace("longdash", "8,3,").replace(/dot/g, "1,3,").replace("dash", "4,3,").replace(/,$/, "").split(",");
                for (b = a.length; b--;)a[b] =
                    H(a[b]) * c;
                a = a.join(",").replace(/NaN/g, "none");
                this.element.setAttribute("stroke-dasharray", a)
            }
        },
        alignSetter: function (a) {
            this.element.setAttribute("text-anchor", {left: "start", center: "middle", right: "end"}[a])
        },
        opacitySetter: function (a, b, c) {
            this[b] = a;
            c.setAttribute(b, a)
        },
        titleSetter: function (a) {
            var b = this.element.getElementsByTagName("title")[0];
            b || (b = X.createElementNS(Ua, "title"), this.element.appendChild(b));
            b.appendChild(X.createTextNode(String(z(a), "").replace(/<[^>]*>/g, "")))
        },
        textSetter: function (a) {
            a !==
            this.textStr && (delete this.bBox, this.textStr = a, this.added && this.renderer.buildText(this))
        },
        fillSetter: function (a, b, c) {
            "string" === typeof a ? c.setAttribute(b, a) : a && this.colorGradient(a, b, c)
        },
        visibilitySetter: function (a, b, c) {
            "inherit" === a ? c.removeAttribute(b) : c.setAttribute(b, a)
        },
        zIndexSetter: function (a, b) {
            var c = this.renderer, d = this.parentGroup, c = (d || c).element || c.box, e, f, g = this.element, h;
            e = this.added;
            var k;
            y(a) && (g.zIndex = a, a = +a, this[b] === a && (e = !1), this[b] = a);
            if (e) {
                (a = this.zIndex) && d && (d.handleZ = !0);
                d = c.childNodes;
                for (k = 0; k < d.length && !h; k++)e = d[k], f = e.zIndex, e !== g && (H(f) > a || !y(a) && y(f)) && (c.insertBefore(g, e), h = !0);
                h || c.appendChild(g)
            }
            return h
        },
        _defaultSetter: function (a, b, c) {
            c.setAttribute(b, a)
        }
    };
    ja.prototype.yGetter = ja.prototype.xGetter;
    ja.prototype.translateXSetter = ja.prototype.translateYSetter = ja.prototype.rotationSetter = ja.prototype.verticalAlignSetter = ja.prototype.scaleXSetter = ja.prototype.scaleYSetter = function (a, b) {
        this[b] = a;
        this.doTransform = !0
    };
    ja.prototype["stroke-widthSetter"] = ja.prototype.strokeSetter =
        function (a, b, c) {
            this[b] = a;
            this.stroke && this["stroke-width"] ? (this.strokeWidth = this["stroke-width"], ja.prototype.fillSetter.call(this, this.stroke, "stroke", c), c.setAttribute("stroke-width", this["stroke-width"]), this.hasStroke = !0) : "stroke-width" === b && 0 === a && this.hasStroke && (c.removeAttribute("stroke"), this.hasStroke = !1)
        };
    var La = function () {
        this.init.apply(this, arguments)
    };
    La.prototype = {
        Element: ja, init: function (a, b, c, d, e, f) {
            var g;
            d = this.createElement("svg").attr({version: "1.1"}).css(this.getStyle(d));
            g = d.element;
            a.appendChild(g);
            -1 === a.innerHTML.indexOf("xmlns") && K(g, "xmlns", Ua);
            this.isSVG = !0;
            this.box = g;
            this.boxWrapper = d;
            this.alignedObjects = [];
            this.url = (ab || xb) && X.getElementsByTagName("base").length ? t.location.href.replace(/#.*?$/, "").replace(/([\('\)])/g, "\\$1").replace(/ /g, "%20") : "";
            this.createElement("desc").add().element.appendChild(X.createTextNode("Created with Highcharts 4.2.4 /Highstock 4.2.4"));
            this.defs = this.createElement("defs").add();
            this.allowHTML = f;
            this.forExport = e;
            this.gradients =
            {};
            this.cache = {};
            this.cacheKeys = [];
            this.imgCount = 0;
            this.setSize(b, c, !1);
            var h;
            ab && a.getBoundingClientRect && (this.subPixelFix = b = function () {
                F(a, {left: 0, top: 0});
                h = a.getBoundingClientRect();
                F(a, {left: Oa(h.left) - h.left + "px", top: Oa(h.top) - h.top + "px"})
            }, b(), aa(t, "resize", b))
        }, getStyle: function (a) {
            return this.style = O({
                fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
                fontSize: "12px"
            }, a)
        }, isHidden: function () {
            return !this.boxWrapper.getBBox().width
        }, destroy: function () {
            var a = this.defs;
            this.box = null;
            this.boxWrapper = this.boxWrapper.destroy();
            la(this.gradients || {});
            this.gradients = null;
            a && (this.defs = a.destroy());
            this.subPixelFix && sa(t, "resize", this.subPixelFix);
            return this.alignedObjects = null
        }, createElement: function (a) {
            var b = new this.Element;
            b.init(this, a);
            return b
        }, draw: function () {
        }, getRadialAttr: function (a, b) {
            return {cx: a[0] - a[2] / 2 + b.cx * a[2], cy: a[1] - a[2] / 2 + b.cy * a[2], r: b.r * a[2]}
        }, buildText: function (a) {
            for (var b = a.element, c = this, d = c.forExport, e = z(a.textStr, "").toString(), f = -1 !== e.indexOf("<"),
                     g = b.childNodes, h, k, m = K(b, "x"), n = a.styles, u = a.textWidth, w = n && n.lineHeight, A = n && n.textShadow, G = n && "ellipsis" === n.textOverflow, Q = g.length, l = u && !a.added && this.box, q = function (a) {
                    return w ? H(w) : c.fontMetrics(/(px|em)$/.test(a && a.style.fontSize) ? a.style.fontSize : n && n.fontSize || c.style.fontSize || 12, a).h
                }; Q--;)b.removeChild(g[Q]);
            f || A || G || -1 !== e.indexOf(" ") ? (h = /<.*style="([^"]+)".*>/, k = /<.*href="(http[^"]+)".*>/, l && l.appendChild(b), e = f ? e.replace(/<(b|strong)>/g, '<span style="font-weight:bold">').replace(/<(i|em)>/g,
                '<span style="font-style:italic">').replace(/<a/g, "<span").replace(/<\/(b|strong|i|em|a)>/g, "</span>").split(/<br.*?>/g) : [e], "" === e[e.length - 1] && e.pop(), C(e, function (e, f) {
                var g, w = 0;
                e = e.replace(/<span/g, "|||<span").replace(/<\/span>/g, "</span>|||");
                g = e.split("|||");
                C(g, function (e) {
                    if ("" !== e || 1 === g.length) {
                        var A = {}, Q = X.createElementNS(Ua, "tspan"), l;
                        h.test(e) && (l = e.match(h)[1].replace(/(;| |^)color([ :])/, "$1fill$2"), K(Q, "style", l));
                        k.test(e) && !d && (K(Q, "onclick", 'location.href="' + e.match(k)[1] + '"'),
                            F(Q, {cursor: "pointer"}));
                        e = (e.replace(/<(.|\n)*?>/g, "") || " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                        if (" " !== e) {
                            Q.appendChild(X.createTextNode(e));
                            w ? A.dx = 0 : f && null !== m && (A.x = m);
                            K(Q, A);
                            b.appendChild(Q);
                            !w && f && (!Ba && d && F(Q, {display: "block"}), K(Q, "dy", q(Q)));
                            if (u) {
                                for (var A = e.replace(/([^\^])-/g, "$1- ").split(" "), lc = 1 < g.length || f || 1 < A.length && "nowrap" !== n.whiteSpace, v, z, p, y = [], r = q(Q), E = 1, C = a.rotation, pb = e, t = pb.length; (lc || G) && (A.length || y.length);)a.rotation = 0, v = a.getBBox(!0), p = v.width, !Ba && c.forExport &&
                                (p = c.measureSpanWidth(Q.firstChild.data, a.styles)), v = p > u, void 0 === z && (z = v), G && z ? (t /= 2, "" === pb || !v && .5 > t ? A = [] : (v && (z = !0), pb = e.substring(0, pb.length + (v ? -1 : 1) * Oa(t)), A = [pb + (3 < u ? "\u2026" : "")], Q.removeChild(Q.firstChild))) : v && 1 !== A.length ? (Q.removeChild(Q.firstChild), y.unshift(A.pop())) : (A = y, y = [], A.length && (E++, Q = X.createElementNS(Ua, "tspan"), K(Q, {
                                    dy: r,
                                    x: m
                                }), l && K(Q, "style", l), b.appendChild(Q)), p > u && (u = p)), A.length && Q.appendChild(X.createTextNode(A.join(" ").replace(/- /g, "-")));
                                z && a.attr("title", a.textStr);
                                a.rotation = C
                            }
                            w++
                        }
                    }
                })
            }), l && l.removeChild(b), A && a.applyTextShadow && a.applyTextShadow(A)) : b.appendChild(X.createTextNode(e.replace(/&lt;/g, "<").replace(/&gt;/g, ">")))
        }, getContrast: function (a) {
            a = ha(a).rgba;
            return 384 < a[0] + a[1] + a[2] ? "#000000" : "#FFFFFF"
        }, button: function (a, b, c, d, e, f, g, h, k) {
            var m = this.label(a, b, c, k, null, null, null, null, "button"), n = 0, u, w, A, G, Q, l;
            a = {x1: 0, y1: 0, x2: 0, y2: 1};
            e = x({
                    "stroke-width": 1,
                    stroke: "#CCCCCC",
                    fill: {linearGradient: a, stops: [[0, "#FEFEFE"], [1, "#F6F6F6"]]},
                    r: 2,
                    padding: 5,
                    style: {color: "black"}
                },
                e);
            A = e.style;
            delete e.style;
            f = x(e, {stroke: "#68A", fill: {linearGradient: a, stops: [[0, "#FFF"], [1, "#ACF"]]}}, f);
            G = f.style;
            delete f.style;
            g = x(e, {stroke: "#68A", fill: {linearGradient: a, stops: [[0, "#9BD"], [1, "#CDF"]]}}, g);
            Q = g.style;
            delete g.style;
            h = x(e, {style: {color: "#CCC"}}, h);
            l = h.style;
            delete h.style;
            aa(m.element, Ra ? "mouseover" : "mouseenter", function () {
                3 !== n && m.attr(f).css(G)
            });
            aa(m.element, Ra ? "mouseout" : "mouseleave", function () {
                3 !== n && (u = [e, f, g][n], w = [A, G, Q][n], m.attr(u).css(w))
            });
            m.setState = function (a) {
                (m.state =
                    n = a) ? 2 === a ? m.attr(g).css(Q) : 3 === a && m.attr(h).css(l) : m.attr(e).css(A)
            };
            return m.on("click", function (a) {
                3 !== n && d.call(m, a)
            }).attr(e).css(O({cursor: "default"}, A))
        }, crispLine: function (a, b) {
            a[1] === a[4] && (a[1] = a[4] = M(a[1]) - b % 2 / 2);
            a[2] === a[5] && (a[2] = a[5] = M(a[2]) + b % 2 / 2);
            return a
        }, path: function (a) {
            var b = {fill: "none"};
            N(a) ? b.d = a : R(a) && O(b, a);
            return this.createElement("path").attr(b)
        }, circle: function (a, b, c) {
            a = R(a) ? a : {x: a, y: b, r: c};
            b = this.createElement("circle");
            b.xSetter = b.ySetter = function (a, b, c) {
                c.setAttribute("c" +
                    b, a)
            };
            return b.attr(a)
        }, arc: function (a, b, c, d, e, f) {
            R(a) && (b = a.y, c = a.r, d = a.innerR, e = a.start, f = a.end, a = a.x);
            a = this.symbol("arc", a || 0, b || 0, c || 0, c || 0, {innerR: d || 0, start: e || 0, end: f || 0});
            a.r = c;
            return a
        }, rect: function (a, b, c, d, e, f) {
            e = R(a) ? a.r : e;
            var g = this.createElement("rect");
            a = R(a) ? a : a === J ? {} : {x: a, y: b, width: L(c, 0), height: L(d, 0)};
            f !== J && (g.strokeWidth = f, a = g.crisp(a));
            e && (a.r = e);
            g.rSetter = function (a, b, c) {
                K(c, {rx: a, ry: a})
            };
            return g.attr(a)
        }, setSize: function (a, b, c) {
            var d = this.alignedObjects, e = d.length;
            this.width =
                a;
            this.height = b;
            for (this.boxWrapper[z(c, !0) ? "animate" : "attr"]({width: a, height: b}); e--;)d[e].align()
        }, g: function (a) {
            var b = this.createElement("g");
            return y(a) ? b.attr({"class": "highcharts-" + a}) : b
        }, image: function (a, b, c, d, e) {
            var f = {preserveAspectRatio: "none"};
            1 < arguments.length && O(f, {x: b, y: c, width: d, height: e});
            f = this.createElement("image").attr(f);
            f.element.setAttributeNS ? f.element.setAttributeNS("http://www.w3.org/1999/xlink", "href", a) : f.element.setAttribute("hc-svg-href", a);
            return f
        }, symbol: function (a,
                             b, c, d, e, f) {
            var g = this, h, k = this.symbols[a], k = k && k(M(b), M(c), d, e, f), m = /^url\((.*?)\)$/, n, u;
            k ? (h = this.path(k), O(h, {
                symbolName: a,
                x: b,
                y: c,
                width: d,
                height: e
            }), f && O(h, f)) : m.test(a) && (u = function (a, b) {
                a.element && (a.attr({
                    width: b[0],
                    height: b[1]
                }), a.alignByTranslate || a.translate(M((d - b[0]) / 2), M((e - b[1]) / 2)))
            }, n = a.match(m)[1], a = $b[n] || f && f.width && f.height && [f.width, f.height], h = this.image(n).attr({
                x: b,
                y: c
            }), h.isImg = !0, a ? u(h, a) : (h.attr({width: 0, height: 0}), ia("img", {
                onload: function () {
                    0 === this.width && (F(this, {
                        position: "absolute",
                        top: "-999em"
                    }), X.body.appendChild(this));
                    u(h, $b[n] = [this.width, this.height]);
                    this.parentNode && this.parentNode.removeChild(this);
                    g.imgCount--;
                    if (!g.imgCount && va[g.chartIndex].onload)va[g.chartIndex].onload()
                }, src: n
            }), this.imgCount++));
            return h
        }, symbols: {
            circle: function (a, b, c, d) {
                var e = .166 * c;
                return ["M", a + c / 2, b, "C", a + c + e, b, a + c + e, b + d, a + c / 2, b + d, "C", a - e, b + d, a - e, b, a + c / 2, b, "Z"]
            }, square: function (a, b, c, d) {
                return ["M", a, b, "L", a + c, b, a + c, b + d, a, b + d, "Z"]
            }, triangle: function (a, b, c, d) {
                return ["M", a + c / 2, b, "L", a + c, b + d,
                    a, b + d, "Z"]
            }, "triangle-down": function (a, b, c, d) {
                return ["M", a, b, "L", a + c, b, a + c / 2, b + d, "Z"]
            }, diamond: function (a, b, c, d) {
                return ["M", a + c / 2, b, "L", a + c, b + d / 2, a + c / 2, b + d, a, b + d / 2, "Z"]
            }, arc: function (a, b, c, d, e) {
                var f = e.start;
                c = e.r || c || d;
                var g = e.end - .001;
                d = e.innerR;
                var h = e.open, k = wa(f), m = Ca(f), n = wa(g), g = Ca(g);
                e = e.end - f < Ma ? 0 : 1;
                return ["M", a + c * k, b + c * m, "A", c, c, 0, e, 1, a + c * n, b + c * g, h ? "M" : "L", a + d * n, b + d * g, "A", d, d, 0, e, 0, a + d * k, b + d * m, h ? "" : "Z"]
            }, callout: function (a, b, c, d, e) {
                var f = W(e && e.r || 0, c, d), g = f + 6, h = e && e.anchorX;
                e = e && e.anchorY;
                var k;
                k = ["M", a + f, b, "L", a + c - f, b, "C", a + c, b, a + c, b, a + c, b + f, "L", a + c, b + d - f, "C", a + c, b + d, a + c, b + d, a + c - f, b + d, "L", a + f, b + d, "C", a, b + d, a, b + d, a, b + d - f, "L", a, b + f, "C", a, b, a, b, a + f, b];
                h && h > c && e > b + g && e < b + d - g ? k.splice(13, 3, "L", a + c, e - 6, a + c + 6, e, a + c, e + 6, a + c, b + d - f) : h && 0 > h && e > b + g && e < b + d - g ? k.splice(33, 3, "L", a, e + 6, a - 6, e, a, e - 6, a, b + f) : e && e > d && h > a + g && h < a + c - g ? k.splice(23, 3, "L", h + 6, b + d, h, b + d + 6, h - 6, b + d, a + f, b + d) : e && 0 > e && h > a + g && h < a + c - g && k.splice(3, 3, "L", h - 6, b, h, b - 6, h + 6, b, c - f, b);
                return k
            }
        }, clipRect: function (a, b, c, d) {
            var e = "highcharts-" +
                Jb++, f = this.createElement("clipPath").attr({id: e}).add(this.defs);
            a = this.rect(a, b, c, d, 0).add(f);
            a.id = e;
            a.clipPath = f;
            a.count = 0;
            return a
        }, text: function (a, b, c, d) {
            var e = Ha || !Ba && this.forExport, f = {};
            if (d && (this.allowHTML || !this.forExport))return this.html(a, b, c);
            f.x = Math.round(b || 0);
            c && (f.y = Math.round(c));
            if (a || 0 === a)f.text = a;
            a = this.createElement("text").attr(f);
            e && a.css({position: "absolute"});
            d || (a.xSetter = function (a, b, c) {
                var d = c.getElementsByTagName("tspan"), e, f = c.getAttribute(b), w;
                for (w = 0; w < d.length; w++)e =
                    d[w], e.getAttribute(b) === f && e.setAttribute(b, a);
                c.setAttribute(b, a)
            });
            return a
        }, fontMetrics: function (a, b) {
            var c, d;
            a = a || this.style.fontSize;
            !a && b && t.getComputedStyle && (b = b.element || b, a = (c = t.getComputedStyle(b, "")) && c.fontSize);
            a = /px/.test(a) ? H(a) : /em/.test(a) ? 12 * parseFloat(a) : 12;
            c = 24 > a ? a + 3 : M(1.2 * a);
            d = M(.8 * c);
            return {h: c, b: d, f: a}
        }, rotCorr: function (a, b, c) {
            var d = a;
            b && c && (d = L(d * wa(b * Ga), 4));
            return {x: -a / 3 * Ca(b * Ga), y: d}
        }, label: function (a, b, c, d, e, f, g, h, k) {
            var m = this, n = m.g(k), u = m.text("", 0, 0, g).attr({zIndex: 1}),
                w, A, G = 0, Q = 3, l = 0, q, v, z, p, r = 0, E = {}, t, P, D, Y, B;
            D = function () {
                var a, b;
                a = u.element.style;
                A = (void 0 === q || void 0 === v || n.styles.textAlign) && y(u.textStr) && u.getBBox();
                n.width = (q || A.width || 0) + 2 * Q + l;
                n.height = (v || A.height || 0) + 2 * Q;
                t = Q + m.fontMetrics(a && a.fontSize, u).b;
                P && (w || (a = r, b = (h ? -t : 0) + r, n.box = w = d ? m.symbol(d, a, b, n.width, n.height, E) : m.rect(a, b, n.width, n.height, 0, E["stroke-width"]), w.isImg || w.attr("fill", "none"), w.add(n)), w.isImg || w.attr(O({
                    width: M(n.width),
                    height: M(n.height)
                }, E)), E = null)
            };
            Y = function () {
                var a =
                    n.styles, a = a && a.textAlign, b = l + Q, c;
                c = h ? 0 : t;
                y(q) && A && ("center" === a || "right" === a) && (b += {center: .5, right: 1}[a] * (q - A.width));
                if (b !== u.x || c !== u.y)u.attr("x", b), c !== J && u.attr("y", c);
                u.x = b;
                u.y = c
            };
            B = function (a, b) {
                w ? w.attr(a, b) : E[a] = b
            };
            n.onAdd = function () {
                u.add(n);
                n.attr({text: a || 0 === a ? a : "", x: b, y: c});
                w && y(e) && n.attr({anchorX: e, anchorY: f})
            };
            n.widthSetter = function (a) {
                q = a
            };
            n.heightSetter = function (a) {
                v = a
            };
            n.paddingSetter = function (a) {
                y(a) && a !== Q && (Q = n.padding = a, Y())
            };
            n.paddingLeftSetter = function (a) {
                y(a) && a !== l &&
                (l = a, Y())
            };
            n.alignSetter = function (a) {
                a = {left: 0, center: .5, right: 1}[a];
                a !== G && (G = a, A && n.attr({x: z}))
            };
            n.textSetter = function (a) {
                a !== J && u.textSetter(a);
                D();
                Y()
            };
            n["stroke-widthSetter"] = function (a, b) {
                a && (P = !0);
                r = a % 2 / 2;
                B(b, a)
            };
            n.strokeSetter = n.fillSetter = n.rSetter = function (a, b) {
                "fill" === b && a && (P = !0);
                B(b, a)
            };
            n.anchorXSetter = function (a, b) {
                e = a;
                B(b, M(a) - r - z)
            };
            n.anchorYSetter = function (a, b) {
                f = a;
                B(b, a - p)
            };
            n.xSetter = function (a) {
                n.x = a;
                G && (a -= G * ((q || A.width) + 2 * Q));
                z = M(a);
                n.attr("translateX", z)
            };
            n.ySetter = function (a) {
                p =
                    n.y = M(a);
                n.attr("translateY", p)
            };
            var Z = n.css;
            return O(n, {
                css: function (a) {
                    if (a) {
                        var b = {};
                        a = x(a);
                        C(n.textProps, function (c) {
                            a[c] !== J && (b[c] = a[c], delete a[c])
                        });
                        u.css(b)
                    }
                    return Z.call(n, a)
                }, getBBox: function () {
                    return {width: A.width + 2 * Q, height: A.height + 2 * Q, x: A.x - Q, y: A.y - Q}
                }, shadow: function (a) {
                    w && w.shadow(a);
                    return n
                }, destroy: function () {
                    sa(n.element, "mouseenter");
                    sa(n.element, "mouseleave");
                    u && (u = u.destroy());
                    w && (w = w.destroy());
                    ja.prototype.destroy.call(n);
                    n = m = D = Y = B = null
                }
            })
        }
    };
    bb = La;
    O(ja.prototype, {
        htmlCss: function (a) {
            var b =
                this.element;
            if (b = a && "SPAN" === b.tagName && a.width)delete a.width, this.textWidth = b, this.updateTransform();
            a && "ellipsis" === a.textOverflow && (a.whiteSpace = "nowrap", a.overflow = "hidden");
            this.styles = O(this.styles, a);
            F(this.element, a);
            return this
        }, htmlGetBBox: function () {
            var a = this.element;
            "text" === a.nodeName && (a.style.position = "absolute");
            return {x: a.offsetLeft, y: a.offsetTop, width: a.offsetWidth, height: a.offsetHeight}
        }, htmlUpdateTransform: function () {
            if (this.added) {
                var a = this.renderer, b = this.element, c = this.translateX ||
                    0, d = this.translateY || 0, e = this.x || 0, f = this.y || 0, g = this.textAlign || "left", h = {
                    left: 0,
                    center: .5,
                    right: 1
                }[g], k = this.shadows, m = this.styles;
                F(b, {marginLeft: c, marginTop: d});
                k && C(k, function (a) {
                    F(a, {marginLeft: c + 1, marginTop: d + 1})
                });
                this.inverted && C(b.childNodes, function (c) {
                    a.invertChild(c, b)
                });
                if ("SPAN" === b.tagName) {
                    var k = this.rotation, n = H(this.textWidth), u = m && m.whiteSpace, w = [k, g, b.innerHTML, this.textWidth, this.textAlign].join();
                    w !== this.cTT && (m = a.fontMetrics(b.style.fontSize).b, y(k) && this.setSpanRotation(k,
                        h, m), b.offsetWidth > n && /[ \-]/.test(b.textContent || b.innerText) ? (F(b, {
                        width: n + "px",
                        display: "block",
                        whiteSpace: u || "normal"
                    }), this.hasTextWidth = !0) : this.hasTextWidth && (F(b, {
                        width: "",
                        display: "",
                        whiteSpace: u || "nowrap"
                    }), this.hasTextWidth = !1), this.getSpanCorrection(this.hasTextWidth ? n : b.offsetWidth, m, h, k, g));
                    F(b, {left: e + (this.xCorr || 0) + "px", top: f + (this.yCorr || 0) + "px"});
                    xb && (m = b.offsetHeight);
                    this.cTT = w
                }
            } else this.alignOnAdd = !0
        }, setSpanRotation: function (a, b, c) {
            var d = {}, e = Ra ? "-ms-transform" : xb ? "-webkit-transform" :
                ab ? "MozTransform" : Zb ? "-o-transform" : "";
            d[e] = d.transform = "rotate(" + a + "deg)";
            d[e + (ab ? "Origin" : "-origin")] = d.transformOrigin = 100 * b + "% " + c + "px";
            F(this.element, d)
        }, getSpanCorrection: function (a, b, c) {
            this.xCorr = -a * c;
            this.yCorr = -b
        }
    });
    O(La.prototype, {
        html: function (a, b, c) {
            var d = this.createElement("span"), e = d.element, f = d.renderer, g = f.isSVG, h = function (a, b) {
                C(["opacity", "visibility"], function (c) {
                    ca(a, c + "Setter", function (a, c, d, e) {
                        a.call(this, c, d, e);
                        b[d] = c
                    })
                })
            };
            d.textSetter = function (a) {
                a !== e.innerHTML && delete this.bBox;
                e.innerHTML = this.textStr = a;
                d.htmlUpdateTransform()
            };
            g && h(d, d.element.style);
            d.xSetter = d.ySetter = d.alignSetter = d.rotationSetter = function (a, b) {
                "align" === b && (b = "textAlign");
                d[b] = a;
                d.htmlUpdateTransform()
            };
            d.attr({text: a, x: M(b), y: M(c)}).css({
                position: "absolute",
                fontFamily: this.style.fontFamily,
                fontSize: this.style.fontSize
            });
            e.style.whiteSpace = "nowrap";
            d.css = d.htmlCss;
            g && (d.add = function (a) {
                var b, c = f.box.parentNode, g = [];
                if (this.parentGroup = a) {
                    if (b = a.div, !b) {
                        for (; a;)g.push(a), a = a.parentGroup;
                        C(g.reverse(),
                            function (a) {
                                var d, e = K(a.element, "class");
                                e && (e = {className: e});
                                b = a.div = a.div || ia("div", e, {
                                        position: "absolute",
                                        left: (a.translateX || 0) + "px",
                                        top: (a.translateY || 0) + "px",
                                        opacity: a.opacity
                                    }, b || c);
                                d = b.style;
                                O(a, {
                                    translateXSetter: function (b, c) {
                                        d.left = b + "px";
                                        a[c] = b;
                                        a.doTransform = !0
                                    }, translateYSetter: function (b, c) {
                                        d.top = b + "px";
                                        a[c] = b;
                                        a.doTransform = !0
                                    }
                                });
                                h(a, d)
                            })
                    }
                } else b = c;
                b.appendChild(e);
                d.added = !0;
                d.alignOnAdd && d.htmlUpdateTransform();
                return d
            });
            return d
        }
    });
    var qb, Pa;
    if (!Ba && !Ha) {
        Pa = {
            init: function (a, b) {
                var c =
                    ["<", b, ' filled="f" stroked="f"'], d = ["position: ", "absolute", ";"], e = "div" === b;
                ("shape" === b || e) && d.push("left:0;top:0;width:1px;height:1px;");
                d.push("visibility: ", e ? "hidden" : "visible");
                c.push(' style="', d.join(""), '"/>');
                b && (c = e || "span" === b || "img" === b ? c.join("") : a.prepVML(c), this.element = ia(c));
                this.renderer = a
            }, add: function (a) {
                var b = this.renderer, c = this.element, d = b.box, e = a && a.inverted, d = a ? a.element || a : d;
                a && (this.parentGroup = a);
                e && b.invertChild(c, d);
                d.appendChild(c);
                this.added = !0;
                this.alignOnAdd && !this.deferUpdateTransform && this.updateTransform();
                if (this.onAdd)this.onAdd();
                return this
            }, updateTransform: ja.prototype.htmlUpdateTransform, setSpanRotation: function () {
                var a = this.rotation, b = wa(a * Ga), c = Ca(a * Ga);
                F(this.element, {filter: a ? ["progid:DXImageTransform.Microsoft.Matrix(M11=", b, ", M12=", -c, ", M21=", c, ", M22=", b, ", sizingMethod='auto expand')"].join("") : "none"})
            }, getSpanCorrection: function (a, b, c, d, e) {
                var f = d ? wa(d * Ga) : 1, g = d ? Ca(d * Ga) : 0, h = z(this.elemHeight, this.element.offsetHeight), k;
                this.xCorr =
                    0 > f && -a;
                this.yCorr = 0 > g && -h;
                k = 0 > f * g;
                this.xCorr += g * b * (k ? 1 - c : c);
                this.yCorr -= f * b * (d ? k ? c : 1 - c : 1);
                e && "left" !== e && (this.xCorr -= a * c * (0 > f ? -1 : 1), d && (this.yCorr -= h * c * (0 > g ? -1 : 1)), F(this.element, {textAlign: e}))
            }, pathToVML: function (a) {
                for (var b = a.length, c = []; b--;)r(a[b]) ? c[b] = M(10 * a[b]) - 5 : "Z" === a[b] ? c[b] = "x" : (c[b] = a[b], !a.isArc || "wa" !== a[b] && "at" !== a[b] || (c[b + 5] === c[b + 7] && (c[b + 7] += a[b + 7] > a[b + 5] ? 1 : -1), c[b + 6] === c[b + 8] && (c[b + 8] += a[b + 8] > a[b + 6] ? 1 : -1)));
                return c.join(" ") || "x"
            }, clip: function (a) {
                var b = this, c;
                a ? (c = a.members,
                    p(c, b), c.push(b), b.destroyClip = function () {
                    p(c, b)
                }, a = a.getCSS(b)) : (b.destroyClip && b.destroyClip(), a = {clip: wb ? "inherit" : "rect(auto)"});
                return b.css(a)
            }, css: ja.prototype.htmlCss, safeRemoveChild: function (a) {
                a.parentNode && Sa(a)
            }, destroy: function () {
                this.destroyClip && this.destroyClip();
                return ja.prototype.destroy.apply(this)
            }, on: function (a, b) {
                this.element["on" + a] = function () {
                    var a = t.event;
                    a.target = a.srcElement;
                    b(a)
                };
                return this
            }, cutOffPath: function (a, b) {
                var c;
                a = a.split(/[ ,]/);
                c = a.length;
                if (9 === c || 11 === c)a[c -
                4] = a[c - 2] = H(a[c - 2]) - 10 * b;
                return a.join(" ")
            }, shadow: function (a, b, c) {
                var d = [], e, f = this.element, g = this.renderer, h, k = f.style, m, n = f.path, u, w, A, G;
                n && "string" !== typeof n.value && (n = "x");
                w = n;
                if (a) {
                    A = z(a.width, 3);
                    G = (a.opacity || .15) / A;
                    for (e = 1; 3 >= e; e++)u = 2 * A + 1 - 2 * e, c && (w = this.cutOffPath(n.value, u + .5)), m = ['<shape isShadow="true" strokeweight="', u, '" filled="false" path="', w, '" coordsize="10 10" style="', f.style.cssText, '" />'], h = ia(g.prepVML(m), null, {
                        left: H(k.left) + z(a.offsetX, 1),
                        top: H(k.top) + z(a.offsetY, 1)
                    }),
                    c && (h.cutOff = u + 1), m = ['<stroke color="', a.color || "black", '" opacity="', G * e, '"/>'], ia(g.prepVML(m), null, null, h), b ? b.element.appendChild(h) : f.parentNode.insertBefore(h, f), d.push(h);
                    this.shadows = d
                }
                return this
            }, updateShadows: oa, setAttr: function (a, b) {
                wb ? this.element[a] = b : this.element.setAttribute(a, b)
            }, classSetter: function (a) {
                this.element.className = a
            }, dashstyleSetter: function (a, b, c) {
                (c.getElementsByTagName("stroke")[0] || ia(this.renderer.prepVML(["<stroke/>"]), null, null, c))[b] = a || "solid";
                this[b] = a
            }, dSetter: function (a,
                                  b, c) {
                var d = this.shadows;
                a = a || [];
                this.d = a.join && a.join(" ");
                c.path = a = this.pathToVML(a);
                if (d)for (c = d.length; c--;)d[c].path = d[c].cutOff ? this.cutOffPath(a, d[c].cutOff) : a;
                this.setAttr(b, a)
            }, fillSetter: function (a, b, c) {
                var d = c.nodeName;
                "SPAN" === d ? c.style.color = a : "IMG" !== d && (c.filled = "none" !== a, this.setAttr("fillcolor", this.renderer.color(a, c, b, this)))
            }, "fill-opacitySetter": function (a, b, c) {
                ia(this.renderer.prepVML(["<", b.split("-")[0], ' opacity="', a, '"/>']), null, null, c)
            }, opacitySetter: oa, rotationSetter: function (a,
                                                            b, c) {
                c = c.style;
                this[b] = c[b] = a;
                c.left = -M(Ca(a * Ga) + 1) + "px";
                c.top = M(wa(a * Ga)) + "px"
            }, strokeSetter: function (a, b, c) {
                this.setAttr("strokecolor", this.renderer.color(a, c, b, this))
            }, "stroke-widthSetter": function (a, b, c) {
                c.stroked = !!a;
                this[b] = a;
                r(a) && (a += "px");
                this.setAttr("strokeweight", a)
            }, titleSetter: function (a, b) {
                this.setAttr(b, a)
            }, visibilitySetter: function (a, b, c) {
                "inherit" === a && (a = "visible");
                this.shadows && C(this.shadows, function (c) {
                    c.style[b] = a
                });
                "DIV" === c.nodeName && (a = "hidden" === a ? "-999em" : 0, wb || (c.style[b] =
                    a ? "visible" : "hidden"), b = "top");
                c.style[b] = a
            }, xSetter: function (a, b, c) {
                this[b] = a;
                "x" === b ? b = "left" : "y" === b && (b = "top");
                this.updateClipping ? (this[b] = a, this.updateClipping()) : c.style[b] = a
            }, zIndexSetter: function (a, b, c) {
                c.style[b] = a
            }
        };
        Pa["stroke-opacitySetter"] = Pa["fill-opacitySetter"];
        U.VMLElement = Pa = I(ja, Pa);
        Pa.prototype.ySetter = Pa.prototype.widthSetter = Pa.prototype.heightSetter = Pa.prototype.xSetter;
        var mc = {
            Element: Pa, isIE8: -1 < Ta.indexOf("MSIE 8.0"), init: function (a, b, c, d) {
                var e;
                this.alignedObjects = [];
                d =
                    this.createElement("div").css(O(this.getStyle(d), {position: "relative"}));
                e = d.element;
                a.appendChild(d.element);
                this.isVML = !0;
                this.box = e;
                this.boxWrapper = d;
                this.gradients = {};
                this.cache = {};
                this.cacheKeys = [];
                this.imgCount = 0;
                this.setSize(b, c, !1);
                if (!X.namespaces.hcv) {
                    X.namespaces.add("hcv", "urn:schemas-microsoft-com:vml");
                    try {
                        X.createStyleSheet().cssText = "hcv\\:fill, hcv\\:path, hcv\\:shape, hcv\\:stroke{ behavior:url(#default#VML); display: inline-block; } "
                    } catch (f) {
                        X.styleSheets[0].cssText += "hcv\\:fill, hcv\\:path, hcv\\:shape, hcv\\:stroke{ behavior:url(#default#VML); display: inline-block; } "
                    }
                }
            },
            isHidden: function () {
                return !this.box.offsetWidth
            }, clipRect: function (a, b, c, d) {
                var e = this.createElement(), f = R(a);
                return O(e, {
                    members: [],
                    count: 0,
                    left: (f ? a.x : a) + 1,
                    top: (f ? a.y : b) + 1,
                    width: (f ? a.width : c) - 1,
                    height: (f ? a.height : d) - 1,
                    getCSS: function (a) {
                        var b = a.element, c = b.nodeName;
                        a = a.inverted;
                        var d = this.top - ("shape" === c ? b.offsetTop : 0), e = this.left, b = e + this.width, f = d + this.height, d = {clip: "rect(" + M(a ? e : d) + "px," + M(a ? f : b) + "px," + M(a ? b : f) + "px," + M(a ? d : e) + "px)"};
                        !a && wb && "DIV" === c && O(d, {width: b + "px", height: f + "px"});
                        return d
                    },
                    updateClipping: function () {
                        C(e.members, function (a) {
                            a.element && a.css(e.getCSS(a))
                        })
                    }
                })
            }, color: function (a, b, c, d) {
                var e = this, f, g = /^rgba/, h, k, m = "none";
                a && a.linearGradient ? k = "gradient" : a && a.radialGradient && (k = "pattern");
                if (k) {
                    var n, u, w = a.linearGradient || a.radialGradient, A, G, Q, l, q, v = "";
                    a = a.stops;
                    var z, p = [], E = function () {
                        h = ['<fill colors="' + p.join(",") + '" opacity="', Q, '" o:opacity2="', G, '" type="', k, '" ', v, 'focus="100%" method="any" />'];
                        ia(e.prepVML(h), null, null, b)
                    };
                    A = a[0];
                    z = a[a.length - 1];
                    0 < A[0] && a.unshift([0,
                        A[1]]);
                    1 > z[0] && a.push([1, z[1]]);
                    C(a, function (a, b) {
                        g.test(a[1]) ? (f = ha(a[1]), n = f.get("rgb"), u = f.get("a")) : (n = a[1], u = 1);
                        p.push(100 * a[0] + "% " + n);
                        b ? (Q = u, l = n) : (G = u, q = n)
                    });
                    if ("fill" === c)if ("gradient" === k)c = w.x1 || w[0] || 0, a = w.y1 || w[1] || 0, A = w.x2 || w[2] || 0, w = w.y2 || w[3] || 0, v = 'angle="' + (90 - 180 * qa.atan((w - a) / (A - c)) / Ma) + '"', E(); else {
                        var m = w.r, r = 2 * m, y = 2 * m, t = w.cx, P = w.cy, D = b.radialReference, Y, m = function () {
                            D && (Y = d.getBBox(), t += (D[0] - Y.x) / Y.width - .5, P += (D[1] - Y.y) / Y.height - .5, r *= D[2] / Y.width, y *= D[2] / Y.height);
                            v = 'src="' +
                                pa.global.VMLRadialGradientURL + '" size="' + r + "," + y + '" origin="0.5,0.5" position="' + t + "," + P + '" color2="' + q + '" ';
                            E()
                        };
                        d.added ? m() : d.onAdd = m;
                        m = l
                    } else m = n
                } else g.test(a) && "IMG" !== b.tagName ? (f = ha(a), d[c + "-opacitySetter"](f.get("a"), c, b), m = f.get("rgb")) : (m = b.getElementsByTagName(c), m.length && (m[0].opacity = 1, m[0].type = "solid"), m = a);
                return m
            }, prepVML: function (a) {
                var b = this.isIE8;
                a = a.join("");
                b ? (a = a.replace("/>", ' xmlns="urn:schemas-microsoft-com:vml" />'), a = -1 === a.indexOf('style="') ? a.replace("/>", ' style="display:inline-block;behavior:url(#default#VML);" />') :
                    a.replace('style="', 'style="display:inline-block;behavior:url(#default#VML);')) : a = a.replace("<", "<hcv:");
                return a
            }, text: La.prototype.html, path: function (a) {
                var b = {coordsize: "10 10"};
                N(a) ? b.d = a : R(a) && O(b, a);
                return this.createElement("shape").attr(b)
            }, circle: function (a, b, c) {
                var d = this.symbol("circle");
                R(a) && (c = a.r, b = a.y, a = a.x);
                d.isCircle = !0;
                d.r = c;
                return d.attr({x: a, y: b})
            }, g: function (a) {
                var b;
                a && (b = {className: "highcharts-" + a, "class": "highcharts-" + a});
                return this.createElement("div").attr(b)
            }, image: function (a,
                                b, c, d, e) {
                var f = this.createElement("img").attr({src: a});
                1 < arguments.length && f.attr({x: b, y: c, width: d, height: e});
                return f
            }, createElement: function (a) {
                return "rect" === a ? this.symbol(a) : La.prototype.createElement.call(this, a)
            }, invertChild: function (a, b) {
                var c = this, d = b.style, e = "IMG" === a.tagName && a.style;
                F(a, {
                    flip: "x",
                    left: H(d.width) - (e ? H(e.top) : 1),
                    top: H(d.height) - (e ? H(e.left) : 1),
                    rotation: -90
                });
                C(a.childNodes, function (b) {
                    c.invertChild(b, a)
                })
            }, symbols: {
                arc: function (a, b, c, d, e) {
                    var f = e.start, g = e.end, h = e.r || c ||
                        d;
                    c = e.innerR;
                    d = wa(f);
                    var k = Ca(f), m = wa(g), n = Ca(g);
                    if (0 === g - f)return ["x"];
                    f = ["wa", a - h, b - h, a + h, b + h, a + h * d, b + h * k, a + h * m, b + h * n];
                    e.open && !c && f.push("e", "M", a, b);
                    f.push("at", a - c, b - c, a + c, b + c, a + c * m, b + c * n, a + c * d, b + c * k, "x", "e");
                    f.isArc = !0;
                    return f
                }, circle: function (a, b, c, d, e) {
                    e && (c = d = 2 * e.r);
                    e && e.isCircle && (a -= c / 2, b -= d / 2);
                    return ["wa", a, b, a + c, b + d, a + c, b + d / 2, a + c, b + d / 2, "e"]
                }, rect: function (a, b, c, d, e) {
                    return La.prototype.symbols[y(e) && e.r ? "callout" : "square"].call(0, a, b, c, d, e)
                }
            }
        };
        U.VMLRenderer = qb = function () {
            this.init.apply(this,
                arguments)
        };
        qb.prototype = x(La.prototype, mc);
        bb = qb
    }
    La.prototype.measureSpanWidth = function (a, b) {
        var c = X.createElement("span"), d;
        d = X.createTextNode(a);
        c.appendChild(d);
        F(c, b);
        this.box.appendChild(c);
        d = c.offsetWidth;
        Sa(c);
        return d
    };
    var Lb, ac;
    Ha && (U.CanVGRenderer = Lb = function () {
        Ua = "http://www.w3.org/1999/xhtml"
    }, Lb.prototype.symbols = {}, ac = function () {
        function a() {
            var a = b.length, d;
            for (d = 0; d < a; d++)b[d]();
            b = []
        }

        var b = [];
        return {
            push: function (c, d) {
                if (0 === b.length) {
                    var e = X.getElementsByTagName("head")[0], f = X.createElement("script");
                    f.type = "text/javascript";
                    f.src = d;
                    f.onload = a;
                    e.appendChild(f)
                }
                b.push(c)
            }
        }
    }(), bb = Lb);
    ua.prototype = {
        addLabel: function () {
            var a = this.axis, b = a.options, c = a.chart, d = a.categories, e = a.names, f = this.pos, g = b.labels, h = a.tickPositions, k = f === h[0], m = f === h[h.length - 1], e = d ? z(d[f], e[f], f) : f, d = this.label, h = h.info, n;
            a.isDatetimeAxis && h && (n = b.dateTimeLabelFormats[h.higherRanks[f] || h.unitName]);
            this.isFirst = k;
            this.isLast = m;
            b = a.labelFormatter.call({
                axis: a, chart: c, isFirst: k, isLast: m, dateTimeLabelFormat: n, value: a.isLog ? ta(a.lin2log(e)) :
                    e
            });
            y(d) ? d && d.attr({text: b}) : (this.labelLength = (this.label = d = y(b) && g.enabled ? c.renderer.text(b, 0, 0, g.useHTML).css(x(g.style)).add(a.labelGroup) : null) && d.getBBox().width, this.rotation = 0)
        }, getLabelSize: function () {
            return this.label ? this.label.getBBox()[this.axis.horiz ? "height" : "width"] : 0
        }, handleOverflow: function (a) {
            var b = this.axis, c = a.x, d = b.chart.chartWidth, e = b.chart.spacing, f = z(b.labelLeft, W(b.pos, e[3])), e = z(b.labelRight, L(b.pos + b.len, d - e[1])), g = this.label, h = this.rotation, k = {
                    left: 0,
                    center: .5,
                    right: 1
                }[b.labelAlign],
                m = g.getBBox().width, n = b.getSlotWidth(), u = n, w = 1, A, G = {};
            if (h)0 > h && c - k * m < f ? A = M(c / wa(h * Ga) - f) : 0 < h && c + k * m > e && (A = M((d - c) / wa(h * Ga))); else if (d = c + (1 - k) * m, c - k * m < f ? u = a.x + u * (1 - k) - f : d > e && (u = e - a.x + u * k, w = -1), u = W(n, u), u < n && "center" === b.labelAlign && (a.x += w * (n - u - k * (n - W(m, u)))), m > u || b.autoRotation && g.styles.width)A = u;
            A && (G.width = A, b.options.labels.style.textOverflow || (G.textOverflow = "ellipsis"), g.css(G))
        }, getPosition: function (a, b, c, d) {
            var e = this.axis, f = e.chart, g = d && f.oldChartHeight || f.chartHeight;
            return {
                x: a ? e.translate(b +
                    c, null, null, d) + e.transB : e.left + e.offset + (e.opposite ? (d && f.oldChartWidth || f.chartWidth) - e.right - e.left : 0),
                y: a ? g - e.bottom + e.offset - (e.opposite ? e.height : 0) : g - e.translate(b + c, null, null, d) - e.transB
            }
        }, getLabelPosition: function (a, b, c, d, e, f, g, h) {
            var k = this.axis, m = k.transA, n = k.reversed, u = k.staggerLines, w = k.tickRotCorr || {
                    x: 0,
                    y: 0
                }, A = e.y;
            y(A) || (A = 0 === k.side ? c.rotation ? -8 : -c.getBBox().height : 2 === k.side ? w.y + 8 : wa(c.rotation * Ga) * (w.y - c.getBBox(!1, 0).height / 2));
            a = a + e.x + w.x - (f && d ? f * m * (n ? -1 : 1) : 0);
            b = b + A - (f && !d ? f * m * (n ?
                    1 : -1) : 0);
            u && (c = g / (h || 1) % u, k.opposite && (c = u - c - 1), b += k.labelOffset / u * c);
            return {x: a, y: M(b)}
        }, getMarkPath: function (a, b, c, d, e, f) {
            return f.crispLine(["M", a, b, "L", a + (e ? 0 : -c), b + (e ? c : 0)], d)
        }, render: function (a, b, c) {
            var d = this.axis, e = d.options, f = d.chart.renderer, g = d.horiz, h = this.type, k = this.label, m = this.pos, n = e.labels, u = this.gridLine, w = h ? h + "Grid" : "grid", A = h ? h + "Tick" : "tick", G = e[w + "LineWidth"], Q = e[w + "LineColor"], l = e[w + "LineDashStyle"], w = d.tickSize(A), A = e[A + "Color"], q = this.mark, v = n.step, p = !0, r = d.tickmarkOffset,
                E = this.getPosition(g, m, r, b), y = E.x, E = E.y, t = g && y === d.pos + d.len || !g && E === d.pos ? -1 : 1;
            c = z(c, 1);
            this.isActive = !0;
            if (G && (m = d.getPlotLinePath(m + r, G * t, b, !0), u === J && (u = {
                    stroke: Q,
                    "stroke-width": G
                }, l && (u.dashstyle = l), h || (u.zIndex = 1), b && (u.opacity = 0), this.gridLine = u = G ? f.path(m).attr(u).add(d.gridGroup) : null), !b && u && m))u[this.isNew ? "attr" : "animate"]({
                d: m,
                opacity: c
            });
            w && (d.opposite && (w[0] = -w[0]), h = this.getMarkPath(y, E, w[0], w[1] * t, g, f), q ? q.animate({
                d: h,
                opacity: c
            }) : this.mark = f.path(h).attr({
                stroke: A, "stroke-width": w[1],
                opacity: c
            }).add(d.axisGroup));
            k && !isNaN(y) && (k.xy = E = this.getLabelPosition(y, E, k, g, n, r, a, v), this.isFirst && !this.isLast && !z(e.showFirstLabel, 1) || this.isLast && !this.isFirst && !z(e.showLastLabel, 1) ? p = !1 : !g || d.isRadial || n.step || n.rotation || b || 0 === c || this.handleOverflow(E), v && a % v && (p = !1), p && !isNaN(E.y) ? (E.opacity = c, k[this.isNew ? "attr" : "animate"](E), this.isNew = !1) : k.attr("y", -9999))
        }, destroy: function () {
            la(this, this.axis)
        }
    };
    U.PlotLineOrBand = function (a, b) {
        this.axis = a;
        b && (this.options = b, this.id = b.id)
    };
    U.PlotLineOrBand.prototype =
    {
        render: function () {
            var a = this, b = a.axis, c = b.horiz, d = a.options, e = d.label, f = a.label, g = d.width, h = d.to, k = d.from, m = y(k) && y(h), n = d.value, u = d.dashStyle, w = a.svgElem, A = [], G, Q = d.color, l = z(d.zIndex, 0), q = d.events, v = {}, E = b.chart.renderer, A = b.log2lin;
            b.isLog && (k = A(k), h = A(h), n = A(n));
            if (g)A = b.getPlotLinePath(n, g), v = {
                stroke: Q,
                "stroke-width": g
            }, u && (v.dashstyle = u); else if (m)A = b.getPlotBandPath(k, h, d), Q && (v.fill = Q), d.borderWidth && (v.stroke = d.borderColor, v["stroke-width"] = d.borderWidth); else return;
            v.zIndex = l;
            if (w)A ? (w.show(),
                w.animate({d: A})) : (w.hide(), f && (a.label = f = f.destroy())); else if (A && A.length && (a.svgElem = w = E.path(A).attr(v).add(), q))for (G in d = function (b) {
                w.on(b, function (c) {
                    q[b].apply(a, [c])
                })
            }, q)d(G);
            e && y(e.text) && A && A.length && 0 < b.width && 0 < b.height && !A.flat ? (e = x({
                align: c && m && "center",
                x: c ? !m && 4 : 10,
                verticalAlign: !c && m && "middle",
                y: c ? m ? 16 : 10 : m ? 6 : -4,
                rotation: c && !m && 90
            }, e), this.renderLabel(e, A, m, l)) : f && f.hide();
            return a
        }, renderLabel: function (a, b, c, d) {
        var e = this.label, f = this.axis.chart.renderer;
        e || (e = {
            align: a.textAlign ||
            a.align, rotation: a.rotation
        }, e.zIndex = d, this.label = e = f.text(a.text, 0, 0, a.useHTML).attr(e).css(a.style).add());
        d = [b[1], b[4], c ? b[6] : b[1]];
        b = [b[2], b[5], c ? b[7] : b[2]];
        c = Y(d);
        f = Y(b);
        e.align(a, !1, {x: c, y: f, width: ya(d) - c, height: ya(b) - f});
        e.show()
    }, destroy: function () {
        p(this.axis.plotLinesAndBands, this);
        delete this.axis;
        la(this)
    }
    };
    var ga = U.Axis = function () {
        this.init.apply(this, arguments)
    };
    ga.prototype = {
        defaultOptions: {
            dateTimeLabelFormats: {
                millisecond: "%H:%M:%S.%L", second: "%H:%M:%S", minute: "%H:%M", hour: "%H:%M",
                day: "%e. %b", week: "%e. %b", month: "%b '%y", year: "%Y"
            },
            endOnTick: !1,
            gridLineColor: "#D8D8D8",
            labels: {enabled: !0, style: {color: "#606060", cursor: "default", fontSize: "11px"}, x: 0},
            lineColor: "#C0D0E0",
            lineWidth: 1,
            minPadding: .01,
            maxPadding: .01,
            minorGridLineColor: "#E0E0E0",
            minorGridLineWidth: 1,
            minorTickColor: "#A0A0A0",
            minorTickLength: 2,
            minorTickPosition: "outside",
            startOfWeek: 1,
            startOnTick: !1,
            tickColor: "#C0D0E0",
            tickLength: 10,
            tickmarkPlacement: "between",
            tickPixelInterval: 100,
            tickPosition: "outside",
            title: {
                align: "middle",
                style: {color: "#707070"}
            },
            type: "linear"
        },
        defaultYAxisOptions: {
            endOnTick: !0,
            gridLineWidth: 1,
            tickPixelInterval: 72,
            showLastLabel: !0,
            labels: {x: -8},
            lineWidth: 0,
            maxPadding: .05,
            minPadding: .05,
            startOnTick: !0,
            title: {rotation: 270, text: "Values"},
            stackLabels: {
                enabled: !1, formatter: function () {
                    return U.numberFormat(this.total, -1)
                }, style: x(ba.line.dataLabels.style, {color: "#000000"})
            }
        },
        defaultLeftAxisOptions: {labels: {x: -15}, title: {rotation: 270}},
        defaultRightAxisOptions: {labels: {x: 15}, title: {rotation: 90}},
        defaultBottomAxisOptions: {
            labels: {
                autoRotation: [-45],
                x: 0
            }, title: {rotation: 0}
        },
        defaultTopAxisOptions: {labels: {autoRotation: [-45], x: 0}, title: {rotation: 0}},
        init: function (a, b) {
            var c = b.isX;
            this.chart = a;
            this.horiz = a.inverted ? !c : c;
            this.coll = (this.isXAxis = c) ? "xAxis" : "yAxis";
            this.opposite = b.opposite;
            this.side = b.side || (this.horiz ? this.opposite ? 0 : 2 : this.opposite ? 1 : 3);
            this.setOptions(b);
            var d = this.options, e = d.type;
            this.labelFormatter = d.labels.formatter || this.defaultLabelFormatter;
            this.userOptions = b;
            this.minPixelPadding = 0;
            this.reversed = d.reversed;
            this.visible = !1 !==
                d.visible;
            this.zoomEnabled = !1 !== d.zoomEnabled;
            this.categories = d.categories || "category" === e;
            this.names = this.names || [];
            this.isLog = "logarithmic" === e;
            this.isDatetimeAxis = "datetime" === e;
            this.isLinked = y(d.linkedTo);
            this.ticks = {};
            this.labelEdge = [];
            this.minorTicks = {};
            this.plotLinesAndBands = [];
            this.alternateBands = {};
            this.len = 0;
            this.minRange = this.userMinRange = d.minRange || d.maxZoom;
            this.range = d.range;
            this.offset = d.offset || 0;
            this.stacks = {};
            this.oldStacks = {};
            this.stacksTouched = 0;
            this.min = this.max = null;
            this.crosshair =
                z(d.crosshair, B(a.options.tooltip.crosshairs)[c ? 0 : 1], !1);
            var f, d = this.options.events;
            -1 === Ia(this, a.axes) && (c && !this.isColorAxis ? a.axes.splice(a.xAxis.length, 0, this) : a.axes.push(this), a[this.coll].push(this));
            this.series = this.series || [];
            a.inverted && c && this.reversed === J && (this.reversed = !0);
            this.removePlotLine = this.removePlotBand = this.removePlotBandOrLine;
            for (f in d)aa(this, f, d[f]);
            this.isLog && (this.val2lin = this.log2lin, this.lin2val = this.lin2log)
        },
        setOptions: function (a) {
            this.options = x(this.defaultOptions,
                this.isXAxis ? {} : this.defaultYAxisOptions, [this.defaultTopAxisOptions, this.defaultRightAxisOptions, this.defaultBottomAxisOptions, this.defaultLeftAxisOptions][this.side], x(pa[this.coll], a))
        },
        defaultLabelFormatter: function () {
            var a = this.axis, b = this.value, c = a.categories, d = this.dateTimeLabelFormat, e = pa.lang.numericSymbols, f = e && e.length, g, h = a.options.labels.format, a = a.isLog ? b : a.tickInterval;
            if (h)g = q(h, this); else if (c)g = b; else if (d)g = Da(d, b); else if (f && 1E3 <= a)for (; f-- && g === J;)c = Math.pow(1E3, f + 1), a >= c && 0 ===
            10 * b % c && null !== e[f] && (g = U.numberFormat(b / c, -1) + e[f]);
            g === J && (g = 1E4 <= ra(b) ? U.numberFormat(b, -1) : U.numberFormat(b, -1, J, ""));
            return g
        },
        getSeriesExtremes: function () {
            var a = this, b = a.chart;
            a.hasVisibleSeries = !1;
            a.dataMin = a.dataMax = a.threshold = null;
            a.softThreshold = !a.isXAxis;
            a.buildStacks && a.buildStacks();
            C(a.series, function (c) {
                if (c.visible || !b.options.chart.ignoreHiddenSeries) {
                    var d = c.options, e = d.threshold, f;
                    a.hasVisibleSeries = !0;
                    a.isLog && 0 >= e && (e = null);
                    if (a.isXAxis)d = c.xData, d.length && (a.dataMin = W(z(a.dataMin,
                        d[0]), Y(d)), a.dataMax = L(z(a.dataMax, d[0]), ya(d))); else if (c.getExtremes(), f = c.dataMax, c = c.dataMin, y(c) && y(f) && (a.dataMin = W(z(a.dataMin, c), c), a.dataMax = L(z(a.dataMax, f), f)), y(e) && (a.threshold = e), !d.softThreshold || a.isLog)a.softThreshold = !1
                }
            })
        },
        translate: function (a, b, c, d, e, f) {
            var g = this.linkedParent || this, h = 1, k = 0, m = d ? g.oldTransA : g.transA;
            d = d ? g.oldMin : g.min;
            var n = g.minPixelPadding;
            e = (g.isOrdinal || g.isBroken || g.isLog && e) && g.lin2val;
            m || (m = g.transA);
            c && (h *= -1, k = g.len);
            g.reversed && (h *= -1, k -= h * (g.sector ||
                g.len));
            b ? (a = a * h + k - n, a = a / m + d, e && (a = g.lin2val(a))) : (e && (a = g.val2lin(a)), "between" === f && (f = .5), a = h * (a - d) * m + k + h * n + (r(f) ? m * f * g.pointRange : 0));
            return a
        },
        toPixels: function (a, b) {
            return this.translate(a, !1, !this.horiz, null, !0) + (b ? 0 : this.pos)
        },
        toValue: function (a, b) {
            return this.translate(a - (b ? 0 : this.pos), !0, !this.horiz, null, !0)
        },
        getPlotLinePath: function (a, b, c, d, e) {
            var f = this.chart, g = this.left, h = this.top, k, m, n = c && f.oldChartHeight || f.chartHeight, u = c && f.oldChartWidth || f.chartWidth, w;
            k = this.transB;
            var A = function (a,
                              b, c) {
                if (a < b || a > c)d ? a = W(L(b, a), c) : w = !0;
                return a
            };
            e = z(e, this.translate(a, null, null, c));
            a = c = M(e + k);
            k = m = M(n - e - k);
            isNaN(e) ? w = !0 : this.horiz ? (k = h, m = n - this.bottom, a = c = A(a, g, g + this.width)) : (a = g, c = u - this.right, k = m = A(k, h, h + this.height));
            return w && !d ? null : f.renderer.crispLine(["M", a, k, "L", c, m], b || 1)
        },
        getLinearTickPositions: function (a, b, c) {
            var d, e = ta(ka(b / a) * a), f = ta(Oa(c / a) * a), g = [];
            if (b === c && r(b))return [b];
            for (b = e; b <= f;) {
                g.push(b);
                b = ta(b + a);
                if (b === d)break;
                d = b
            }
            return g
        },
        getMinorTickPositions: function () {
            var a = this.options,
                b = this.tickPositions, c = this.minorTickInterval, d = [], e, f = this.pointRangePadding || 0;
            e = this.min - f;
            var f = this.max + f, g = f - e;
            if (g && g / c < this.len / 3)if (this.isLog)for (f = b.length, e = 1; e < f; e++)d = d.concat(this.getLogTickPositions(c, b[e - 1], b[e], !0)); else if (this.isDatetimeAxis && "auto" === a.minorTickInterval)d = d.concat(this.getTimeTicks(this.normalizeTimeTickInterval(c), e, f, a.startOfWeek)); else for (b = e + (b[0] - e) % c; b <= f; b += c)d.push(b);
            0 !== d.length && this.trimTicks(d, a.startOnTick, a.endOnTick);
            return d
        },
        adjustForMinRange: function () {
            var a =
                this.options, b = this.min, c = this.max, d, e = this.dataMax - this.dataMin >= this.minRange, f, g, h, k, m, n;
            this.isXAxis && this.minRange === J && !this.isLog && (y(a.min) || y(a.max) ? this.minRange = null : (C(this.series, function (a) {
                k = a.xData;
                for (g = m = a.xIncrement ? 1 : k.length - 1; 0 < g; g--)if (h = k[g] - k[g - 1], f === J || h < f)f = h
            }), this.minRange = W(5 * f, this.dataMax - this.dataMin)));
            c - b < this.minRange && (n = this.minRange, d = (n - c + b) / 2, d = [b - d, z(a.min, b - d)], e && (d[2] = this.dataMin), b = ya(d), c = [b + n, z(a.max, b + n)], e && (c[2] = this.dataMax), c = Y(c), c - b < n && (d[0] =
                c - n, d[1] = z(a.min, c - n), b = ya(d)));
            this.min = b;
            this.max = c
        },
        getClosest: function () {
            var a;
            C(this.series, function (b) {
                var c = b.closestPointRange;
                !b.noSharedTooltip && y(c) && (a = y(a) ? W(a, c) : c)
            });
            return a
        },
        setAxisTranslation: function (a) {
            var b = this, c = b.max - b.min, d = b.axisPointRange || 0, e, f = 0, g = 0, h = b.linkedParent, k = !!b.categories, m = b.transA, n = b.isXAxis;
            if (n || k || d)h ? (f = h.minPointOffset, g = h.pointRangePadding) : (e = b.getClosest(), C(b.series, function (a) {
                var c = k ? 1 : n ? z(a.options.pointRange, e, 0) : b.axisPointRange || 0;
                a = a.options.pointPlacement;
                d = L(d, c);
                b.single || (f = L(f, ea(a) ? 0 : c / 2), g = L(g, "on" === a ? 0 : c))
            })), h = b.ordinalSlope && e ? b.ordinalSlope / e : 1, b.minPointOffset = f *= h, b.pointRangePadding = g *= h, b.pointRange = W(d, c), n && (b.closestPointRange = e);
            a && (b.oldTransA = m);
            b.translationSlope = b.transA = m = b.len / (c + g || 1);
            b.transB = b.horiz ? b.left : b.bottom;
            b.minPixelPadding = m * f
        },
        minFromRange: function () {
            return this.max - this.range
        },
        setTickInterval: function (a) {
            var b = this, c = b.chart, d = b.options, e = b.isLog, f = b.log2lin, g = b.isDatetimeAxis, h = b.isXAxis, k = b.isLinked, m = d.maxPadding,
                n = d.minPadding, u = d.tickInterval, w = d.tickPixelInterval, A = b.categories, G = b.threshold, Q = b.softThreshold, l, v, q, p;
            g || A || k || this.getTickAmount();
            q = z(b.userMin, d.min);
            p = z(b.userMax, d.max);
            k ? (b.linkedParent = c[b.coll][d.linkedTo], c = b.linkedParent.getExtremes(), b.min = z(c.min, c.dataMin), b.max = z(c.max, c.dataMax), d.type !== b.linkedParent.options.type && T(11, 1)) : (!Q && y(G) && (b.dataMin >= G ? (l = G, n = 0) : b.dataMax <= G && (v = G, m = 0)), b.min = z(q, l, b.dataMin), b.max = z(p, v, b.dataMax));
            e && (!a && 0 >= W(b.min, z(b.dataMin, b.min)) && T(10,
                1), b.min = ta(f(b.min), 15), b.max = ta(f(b.max), 15));
            b.range && y(b.max) && (b.userMin = b.min = q = L(b.min, b.minFromRange()), b.userMax = p = b.max, b.range = null);
            b.beforePadding && b.beforePadding();
            b.adjustForMinRange();
            !(A || b.axisPointRange || b.usePercentage || k) && y(b.min) && y(b.max) && (f = b.max - b.min) && (!y(q) && n && (b.min -= f * n), !y(p) && m && (b.max += f * m));
            r(d.floor) && (b.min = L(b.min, d.floor));
            r(d.ceiling) && (b.max = W(b.max, d.ceiling));
            Q && y(b.dataMin) && (G = G || 0, !y(q) && b.min < G && b.dataMin >= G ? b.min = G : !y(p) && b.max > G && b.dataMax <= G && (b.max =
                G));
            b.tickInterval = b.min === b.max || void 0 === b.min || void 0 === b.max ? 1 : k && !u && w === b.linkedParent.options.tickPixelInterval ? u = b.linkedParent.tickInterval : z(u, this.tickAmount ? (b.max - b.min) / L(this.tickAmount - 1, 1) : void 0, A ? 1 : (b.max - b.min) * w / L(b.len, w));
            h && !a && C(b.series, function (a) {
                a.processData(b.min !== b.oldMin || b.max !== b.oldMax)
            });
            b.setAxisTranslation(!0);
            b.beforeSetTickPositions && b.beforeSetTickPositions();
            b.postProcessTickInterval && (b.tickInterval = b.postProcessTickInterval(b.tickInterval));
            b.pointRange && !u && (b.tickInterval = L(b.pointRange, b.tickInterval));
            a = z(d.minTickInterval, b.isDatetimeAxis && b.closestPointRange);
            !u && b.tickInterval < a && (b.tickInterval = a);
            g || e || u || (b.tickInterval = P(b.tickInterval, null, E(b.tickInterval), z(d.allowDecimals, !(.5 < b.tickInterval && 5 > b.tickInterval && 1E3 < b.max && 9999 > b.max)), !!this.tickAmount));
            !this.tickAmount && this.len && (b.tickInterval = b.unsquish());
            this.setTickPositions()
        },
        setTickPositions: function () {
            var a = this.options, b, c = a.tickPositions, d = a.tickPositioner, e = a.startOnTick,
                f = a.endOnTick, g;
            this.tickmarkOffset = this.categories && "between" === a.tickmarkPlacement && 1 === this.tickInterval ? .5 : 0;
            this.minorTickInterval = "auto" === a.minorTickInterval && this.tickInterval ? this.tickInterval / 5 : a.minorTickInterval;
            this.tickPositions = b = c && c.slice();
            !b && (b = this.isDatetimeAxis ? this.getTimeTicks(this.normalizeTimeTickInterval(this.tickInterval, a.units), this.min, this.max, a.startOfWeek, this.ordinalPositions, this.closestPointRange, !0) : this.isLog ? this.getLogTickPositions(this.tickInterval, this.min,
                this.max) : this.getLinearTickPositions(this.tickInterval, this.min, this.max), b.length > this.len && (b = [b[0], b.pop()]), this.tickPositions = b, d && (d = d.apply(this, [this.min, this.max]))) && (this.tickPositions = b = d);
            this.isLinked || (this.trimTicks(b, e, f), this.min === this.max && y(this.min) && !this.tickAmount && (g = !0, this.min -= .5, this.max += .5), this.single = g, c || d || this.adjustTickAmount())
        },
        trimTicks: function (a, b, c) {
            var d = a[0], e = a[a.length - 1], f = this.minPointOffset || 0;
            if (b)this.min = d; else for (; this.min - f > a[0];)a.shift();
            if (c)this.max = e; else for (; this.max + f < a[a.length - 1];)a.pop();
            0 === a.length && y(d) && a.push((e + d) / 2)
        },
        alignToOthers: function () {
            var a = {}, b, c = this.options;
            !1 !== this.chart.options.chart.alignTicks && !1 !== c.alignTicks && C(this.chart[this.coll], function (c) {
                var e = c.options, e = [c.horiz ? e.left : e.top, e.width, e.height, e.pane].join();
                c.series.length && (a[e] ? b = !0 : a[e] = 1)
            });
            return b
        },
        getTickAmount: function () {
            var a = this.options, b = a.tickAmount, c = a.tickPixelInterval;
            !y(a.tickInterval) && this.len < c && !this.isRadial && !this.isLog &&
            a.startOnTick && a.endOnTick && (b = 2);
            !b && this.alignToOthers() && (b = Oa(this.len / c) + 1);
            4 > b && (this.finalTickAmt = b, b = 5);
            this.tickAmount = b
        },
        adjustTickAmount: function () {
            var a = this.tickInterval, b = this.tickPositions, c = this.tickAmount, d = this.finalTickAmt, e = b && b.length;
            if (e < c) {
                for (; b.length < c;)b.push(ta(b[b.length - 1] + a));
                this.transA *= (e - 1) / (c - 1);
                this.max = b[b.length - 1]
            } else e > c && (this.tickInterval *= 2, this.setTickPositions());
            if (y(d)) {
                for (a = c = b.length; a--;)(3 === d && 1 === a % 2 || 2 >= d && 0 < a && a < c - 1) && b.splice(a, 1);
                this.finalTickAmt =
                    J
            }
        },
        setScale: function () {
            var a, b;
            this.oldMin = this.min;
            this.oldMax = this.max;
            this.oldAxisLength = this.len;
            this.setAxisSize();
            b = this.len !== this.oldAxisLength;
            C(this.series, function (b) {
                if (b.isDirtyData || b.isDirty || b.xAxis.isDirty)a = !0
            });
            b || a || this.isLinked || this.forceRedraw || this.userMin !== this.oldUserMin || this.userMax !== this.oldUserMax || this.alignToOthers() ? (this.resetStacks && this.resetStacks(), this.forceRedraw = !1, this.getSeriesExtremes(), this.setTickInterval(), this.oldUserMin = this.userMin, this.oldUserMax =
                this.userMax, this.isDirty || (this.isDirty = b || this.min !== this.oldMin || this.max !== this.oldMax)) : this.cleanStacks && this.cleanStacks()
        },
        setExtremes: function (a, b, c, d, e) {
            var f = this, g = f.chart;
            c = z(c, !0);
            C(f.series, function (a) {
                delete a.kdTree
            });
            e = O(e, {min: a, max: b});
            na(f, "setExtremes", e, function () {
                f.userMin = a;
                f.userMax = b;
                f.eventArgs = e;
                c && g.redraw(d)
            })
        },
        zoom: function (a, b) {
            var c = this.dataMin, d = this.dataMax, e = this.options, f = W(c, z(e.min, c)), e = L(d, z(e.max, d));
            this.allowZoomOutside || (y(c) && a <= f && (a = f), y(d) && b >= e &&
            (b = e));
            this.displayBtn = a !== J || b !== J;
            this.setExtremes(a, b, !1, J, {trigger: "zoom"});
            return !0
        },
        setAxisSize: function () {
            var a = this.chart, b = this.options, c = b.offsetLeft || 0, d = this.horiz, e = z(b.width, a.plotWidth - c + (b.offsetRight || 0)), f = z(b.height, a.plotHeight), g = z(b.top, a.plotTop), b = z(b.left, a.plotLeft + c), c = /%$/;
            c.test(f) && (f = Math.round(parseFloat(f) / 100 * a.plotHeight));
            c.test(g) && (g = Math.round(parseFloat(g) / 100 * a.plotHeight + a.plotTop));
            this.left = b;
            this.top = g;
            this.width = e;
            this.height = f;
            this.bottom = a.chartHeight -
                f - g;
            this.right = a.chartWidth - e - b;
            this.len = L(d ? e : f, 0);
            this.pos = d ? b : g
        },
        getExtremes: function () {
            var a = this.isLog, b = this.lin2log;
            return {
                min: a ? ta(b(this.min)) : this.min,
                max: a ? ta(b(this.max)) : this.max,
                dataMin: this.dataMin,
                dataMax: this.dataMax,
                userMin: this.userMin,
                userMax: this.userMax
            }
        },
        getThreshold: function (a) {
            var b = this.isLog, c = this.lin2log, d = b ? c(this.min) : this.min, b = b ? c(this.max) : this.max;
            null === a ? a = 0 > b ? b : d : d > a ? a = d : b < a && (a = b);
            return this.translate(a, 0, 1, 0, 1)
        },
        autoLabelAlign: function (a) {
            a = (z(a, 0) - 90 * this.side +
                720) % 360;
            return 15 < a && 165 > a ? "right" : 195 < a && 345 > a ? "left" : "center"
        },
        tickSize: function (a) {
            var b = this.options, c = b[a + "Length"], d = z(b[a + "Width"], "tick" === a && this.isXAxis ? 1 : 0);
            if (d && c)return "inside" === b[a + "Position"] && (c = -c), [c, d]
        },
        labelMetrics: function () {
            return this.chart.renderer.fontMetrics(this.options.labels.style.fontSize, this.ticks[0] && this.ticks[0].label)
        },
        unsquish: function () {
            var a = this.options.labels, b = this.horiz, c = this.tickInterval, d = c, e = this.len / (((this.categories ? 1 : 0) + this.max - this.min) / c), f,
                g = a.rotation, h = this.labelMetrics(), k, m = Number.MAX_VALUE, n, u = function (a) {
                    a /= e || 1;
                    a = 1 < a ? Oa(a) : 1;
                    return a * c
                };
            b ? (n = !a.staggerLines && !a.step && (y(g) ? [g] : e < z(a.autoRotationLimit, 80) && a.autoRotation)) && C(n, function (a) {
                var b;
                if (a === g || a && -90 <= a && 90 >= a)k = u(ra(h.h / Ca(Ga * a))), b = k + ra(a / 360), b < m && (m = b, f = a, d = k)
            }) : a.step || (d = u(h.h));
            this.autoRotation = n;
            this.labelRotation = z(f, g);
            return d
        },
        getSlotWidth: function () {
            var a = this.chart, b = this.horiz, c = this.options.labels, d = Math.max(this.tickPositions.length - (this.categories ?
                    0 : 1), 1), e = a.margin[3];
            return b && 2 > (c.step || 0) && !c.rotation && (this.staggerLines || 1) * a.plotWidth / d || !b && (e && e - a.spacing[3] || .33 * a.chartWidth)
        },
        renderUnsquish: function () {
            var a = this.chart, b = a.renderer, c = this.tickPositions, d = this.ticks, e = this.options.labels, f = this.horiz, g = this.getSlotWidth(), h = L(1, M(g - 2 * (e.padding || 5))), k = {}, m = this.labelMetrics(), n = e.style.textOverflow, u, w = 0, A, G;
            ea(e.rotation) || (k.rotation = e.rotation || 0);
            if (this.autoRotation)C(c, function (a) {
                (a = d[a]) && a.labelLength > w && (w = a.labelLength)
            }),
                w > h && w > m.h ? k.rotation = this.labelRotation : this.labelRotation = 0; else if (g && (u = {width: h + "px"}, !n))for (u.textOverflow = "clip", A = c.length; !f && A--;)if (G = c[A], h = d[G].label)"ellipsis" === h.styles.textOverflow ? h.css({textOverflow: "clip"}) : d[G].labelLength > g && h.css({width: g + "px"}), h.getBBox().height > this.len / c.length - (m.h - m.f) && (h.specCss = {textOverflow: "ellipsis"});
            k.rotation && (u = {width: (w > .5 * a.chartHeight ? .33 * a.chartHeight : a.chartHeight) + "px"}, n || (u.textOverflow = "ellipsis"));
            if (this.labelAlign = e.align || this.autoLabelAlign(this.labelRotation))k.align =
                this.labelAlign;
            C(c, function (a) {
                var b = (a = d[a]) && a.label;
                b && (b.attr(k), u && b.css(x(u, b.specCss)), delete b.specCss, a.rotation = k.rotation)
            });
            this.tickRotCorr = b.rotCorr(m.b, this.labelRotation || 0, 0 !== this.side)
        },
        hasData: function () {
            return this.hasVisibleSeries || y(this.min) && y(this.max) && !!this.tickPositions
        },
        getOffset: function () {
            var a = this, b = a.chart, c = b.renderer, d = a.options, e = a.tickPositions, f = a.ticks, g = a.horiz, h = a.side, k = b.inverted ? [1, 0, 3, 2][h] : h, m, n, u = 0, w, A = 0, G = d.title, Q = d.labels, l = 0, q = a.opposite, v = b.axisOffset,
                b = b.clipOffset, p = [-1, 1, 1, -1][h], E, r = a.axisParent, t = this.tickSize("tick");
            m = a.hasData();
            a.showAxis = n = m || z(d.showEmpty, !0);
            a.staggerLines = a.horiz && Q.staggerLines;
            a.axisGroup || (a.gridGroup = c.g("grid").attr({zIndex: d.gridZIndex || 1}).add(r), a.axisGroup = c.g("axis").attr({zIndex: d.zIndex || 2}).add(r), a.labelGroup = c.g("axis-labels").attr({zIndex: Q.zIndex || 7}).addClass("highcharts-" + a.coll.toLowerCase() + "-labels").add(r));
            if (m || a.isLinked)C(e, function (b) {
                f[b] ? f[b].addLabel() : f[b] = new ua(a, b)
            }), a.renderUnsquish(),
            !1 === Q.reserveSpace || 0 !== h && 2 !== h && {
                1: "left",
                3: "right"
            }[h] !== a.labelAlign && "center" !== a.labelAlign || C(e, function (a) {
                l = L(f[a].getLabelSize(), l)
            }), a.staggerLines && (l *= a.staggerLines, a.labelOffset = l * (a.opposite ? -1 : 1)); else for (E in f)f[E].destroy(), delete f[E];
            G && G.text && !1 !== G.enabled && (a.axisTitle || (a.axisTitle = c.text(G.text, 0, 0, G.useHTML).attr({
                zIndex: 7,
                rotation: G.rotation || 0,
                align: G.textAlign || {low: q ? "right" : "left", middle: "center", high: q ? "left" : "right"}[G.align]
            }).addClass("highcharts-" + this.coll.toLowerCase() +
                "-title").css(G.style).add(a.axisGroup), a.axisTitle.isNew = !0), n && (u = a.axisTitle.getBBox()[g ? "height" : "width"], w = G.offset, A = y(w) ? 0 : z(G.margin, g ? 5 : 10)), a.axisTitle[n ? "show" : "hide"](!0));
            a.offset = p * z(d.offset, v[h]);
            a.tickRotCorr = a.tickRotCorr || {x: 0, y: 0};
            c = 0 === h ? -a.labelMetrics().h : 2 === h ? a.tickRotCorr.y : 0;
            A = Math.abs(l) + A;
            l && (A = A - c + p * (g ? z(Q.y, a.tickRotCorr.y + 8 * p) : Q.x));
            a.axisTitleMargin = z(w, A);
            v[h] = L(v[h], a.axisTitleMargin + u + p * a.offset, A, m && e.length && t ? t[0] : 0);
            d = d.offset ? 0 : 2 * ka(d.lineWidth / 2);
            b[k] = L(b[k],
                d)
        },
        getLinePath: function (a) {
            var b = this.chart, c = this.opposite, d = this.offset, e = this.horiz, f = this.left + (c ? this.width : 0) + d, d = b.chartHeight - this.bottom - (c ? this.height : 0) + d;
            c && (a *= -1);
            return b.renderer.crispLine(["M", e ? this.left : f, e ? d : this.top, "L", e ? b.chartWidth - this.right : f, e ? d : b.chartHeight - this.bottom], a)
        },
        getTitlePosition: function () {
            var a = this.horiz, b = this.left, c = this.top, d = this.len, e = this.options.title, f = a ? b : c, g = this.opposite, h = this.offset, k = e.x || 0, m = e.y || 0, n = H(e.style.fontSize || 12), d = {
                low: f + (a ? 0 :
                    d), middle: f + d / 2, high: f + (a ? d : 0)
            }[e.align], b = (a ? c + this.height : b) + (a ? 1 : -1) * (g ? -1 : 1) * this.axisTitleMargin + (2 === this.side ? n : 0);
            return {x: a ? d + k : b + (g ? this.width : 0) + h + k, y: a ? b + m - (g ? this.height : 0) + h : d + m}
        },
        render: function () {
            var a = this, b = a.chart, c = b.renderer, d = a.options, e = a.isLog, f = a.lin2log, g = a.isLinked, h = a.tickPositions, k = a.axisTitle, m = a.ticks, n = a.minorTicks, u = a.alternateBands, w = d.stackLabels, A = d.alternateGridColor, G = a.tickmarkOffset, Q = d.lineWidth, l, v = b.hasRendered && y(a.oldMin) && !isNaN(a.oldMin), q = a.showAxis,
                p = jb(c.globalAnimation), E, z;
            a.labelEdge.length = 0;
            a.overlap = !1;
            C([m, n, u], function (a) {
                for (var b in a)a[b].isActive = !1
            });
            if (a.hasData() || g)a.minorTickInterval && !a.categories && C(a.getMinorTickPositions(), function (b) {
                n[b] || (n[b] = new ua(a, b, "minor"));
                v && n[b].isNew && n[b].render(null, !0);
                n[b].render(null, !1, 1)
            }), h.length && (C(h, function (b, c) {
                if (!g || b >= a.min && b <= a.max)m[b] || (m[b] = new ua(a, b)), v && m[b].isNew && m[b].render(c, !0, .1), m[b].render(c)
            }), G && (0 === a.min || a.single) && (m[-1] || (m[-1] = new ua(a, -1, null, !0)),
                m[-1].render(-1))), A && C(h, function (c, d) {
                z = h[d + 1] !== J ? h[d + 1] + G : a.max - G;
                0 === d % 2 && c < a.max && z <= a.max + (b.polar ? -G : G) && (u[c] || (u[c] = new U.PlotLineOrBand(a)), E = c + G, u[c].options = {
                    from: e ? f(E) : E,
                    to: e ? f(z) : z,
                    color: A
                }, u[c].render(), u[c].isActive = !0)
            }), a._addedPlotLB || (C((d.plotLines || []).concat(d.plotBands || []), function (b) {
                a.addPlotBandOrLine(b)
            }), a._addedPlotLB = !0);
            C([m, n, u], function (a) {
                var c, d, e = [], f = p.duration;
                for (c in a)a[c].isActive || (a[c].render(c, !1, 0), a[c].isActive = !1, e.push(c));
                D(function () {
                    for (d = e.length; d--;)a[e[d]] && !a[e[d]].isActive && (a[e[d]].destroy(), delete a[e[d]])
                }, a !== u && b.hasRendered && f ? f : 0)
            });
            Q && (l = a.getLinePath(Q), a.axisLine ? a.axisLine.animate({d: l}) : a.axisLine = c.path(l).attr({
                stroke: d.lineColor,
                "stroke-width": Q,
                zIndex: 7
            }).add(a.axisGroup), a.axisLine[q ? "show" : "hide"](!0));
            k && q && (k[k.isNew ? "attr" : "animate"](a.getTitlePosition()), k.isNew = !1);
            w && w.enabled && a.renderStackTotals();
            a.isDirty = !1
        },
        redraw: function () {
            this.visible && (this.render(), C(this.plotLinesAndBands, function (a) {
                a.render()
            }));
            C(this.series,
                function (a) {
                    a.isDirty = !0
                })
        },
        destroy: function (a) {
            var b = this, c = b.stacks, d, e = b.plotLinesAndBands;
            a || sa(b);
            for (d in c)la(c[d]), c[d] = null;
            C([b.ticks, b.minorTicks, b.alternateBands], function (a) {
                la(a)
            });
            for (a = e.length; a--;)e[a].destroy();
            C("stackTotalGroup axisLine axisTitle axisGroup cross gridGroup labelGroup".split(" "), function (a) {
                b[a] && (b[a] = b[a].destroy())
            });
            this.cross && this.cross.destroy()
        },
        drawCrosshair: function (a, b) {
            var c, d = this.crosshair, e, f;
            this.crosshair && !1 !== (y(b) || !z(d.snap, !0)) ? (z(d.snap,
                !0) ? y(b) && (c = this.isXAxis ? b.plotX : this.len - b.plotY) : c = this.horiz ? a.chartX - this.pos : this.len - a.chartY + this.pos, c = this.isRadial ? this.getPlotLinePath(this.isXAxis ? b.x : z(b.stackY, b.y)) || null : this.getPlotLinePath(null, null, null, null, c) || null, null === c ? this.hideCrosshair() : (e = this.categories && !this.isRadial, f = z(d.width, e ? this.transA : 1), this.cross ? this.cross.attr({
                d: c,
                visibility: "visible",
                "stroke-width": f
            }) : (e = {
                "stroke-width": f,
                stroke: d.color || (e ? "rgba(155,200,255,0.2)" : "#C0C0C0"),
                zIndex: z(d.zIndex, 2)
            }, d.dashStyle &&
            (e.dashstyle = d.dashStyle), this.cross = this.chart.renderer.path(c).attr(e).add()))) : this.hideCrosshair()
        },
        hideCrosshair: function () {
            this.cross && this.cross.hide()
        }
    };
    O(ga.prototype, {
        getPlotBandPath: function (a, b) {
            var c = this.getPlotLinePath(b, null, null, !0), d = this.getPlotLinePath(a, null, null, !0);
            d && c ? (d.flat = d.toString() === c.toString(), d.push(c[4], c[5], c[1], c[2])) : d = null;
            return d
        }, addPlotBand: function (a) {
            return this.addPlotBandOrLine(a, "plotBands")
        }, addPlotLine: function (a) {
            return this.addPlotBandOrLine(a,
                "plotLines")
        }, addPlotBandOrLine: function (a, b) {
            var c = (new U.PlotLineOrBand(this, a)).render(), d = this.userOptions;
            c && (b && (d[b] = d[b] || [], d[b].push(a)), this.plotLinesAndBands.push(c));
            return c
        }, removePlotBandOrLine: function (a) {
            for (var b = this.plotLinesAndBands, c = this.options, d = this.userOptions, e = b.length; e--;)b[e].id === a && b[e].destroy();
            C([c.plotLines || [], d.plotLines || [], c.plotBands || [], d.plotBands || []], function (b) {
                for (e = b.length; e--;)b[e].id === a && p(b, b[e])
            })
        }
    });
    ga.prototype.getTimeTicks = function (a, b, c,
                                          d) {
        var e = [], f = {}, g = pa.global.useUTC, h, k = new xa(b - l(b)), m = a.unitRange, n = a.count;
        if (y(b)) {
            k[Ub](m >= ma.second ? 0 : n * ka(k.getMilliseconds() / n));
            if (m >= ma.second)k[Vb](m >= ma.minute ? 0 : n * ka(k.getSeconds() / n));
            if (m >= ma.minute)k[Wb](m >= ma.hour ? 0 : n * ka(k[Eb]() / n));
            if (m >= ma.hour)k[Xb](m >= ma.day ? 0 : n * ka(k[Fb]() / n));
            if (m >= ma.day)k[vb](m >= ma.month ? 1 : n * ka(k[db]() / n));
            m >= ma.month && (k[Hb](m >= ma.year ? 0 : n * ka(k[kb]() / n)), h = k[lb]());
            if (m >= ma.year)k[Ib](h - h % n);
            if (m === ma.week)k[vb](k[db]() - k[Gb]() + z(d, 1));
            b = 1;
            if (Db || ib)k = k.getTime(),
                k = new xa(k + l(k));
            h = k[lb]();
            d = k.getTime();
            for (var u = k[kb](), w = k[db](), A = !g || !!ib, G = (ma.day + (g ? l(k) : 6E4 * k.getTimezoneOffset())) % ma.day; d < c;)e.push(d), d = m === ma.year ? ub(h + b * n, 0) : m === ma.month ? ub(h, u + b * n) : !A || m !== ma.day && m !== ma.week ? d + m * n : ub(h, u, w + b * n * (m === ma.day ? 1 : 7)), b++;
            e.push(d);
            C(Wa(e, function (a) {
                return m <= ma.hour && a % ma.day === G
            }), function (a) {
                f[a] = "day"
            })
        }
        e.info = O(a, {higherRanks: f, totalRange: m * n});
        return e
    };
    ga.prototype.normalizeTimeTickInterval = function (a, b) {
        var c = b || [["millisecond", [1, 2, 5, 10, 20, 25,
                50, 100, 200, 500]], ["second", [1, 2, 5, 10, 15, 30]], ["minute", [1, 2, 5, 10, 15, 30]], ["hour", [1, 2, 3, 4, 6, 8, 12]], ["day", [1, 2]], ["week", [1, 2]], ["month", [1, 2, 3, 4, 6]], ["year", null]], d = c[c.length - 1], e = ma[d[0]], f = d[1], g;
        for (g = 0; g < c.length && !(d = c[g], e = ma[d[0]], f = d[1], c[g + 1] && a <= (e * f[f.length - 1] + ma[c[g + 1][0]]) / 2); g++);
        e === ma.year && a < 5 * e && (f = [1, 2, 5]);
        c = P(a / e, f, "year" === d[0] ? L(E(a / e), 1) : 1);
        return {unitRange: e, count: c, unitName: d[0]}
    };
    ga.prototype.getLogTickPositions = function (a, b, c, d) {
        var e = this.options, f = this.len, g = this.lin2log,
            h = this.log2lin, k = [];
        d || (this._minorAutoInterval = null);
        if (.5 <= a)a = M(a), k = this.getLinearTickPositions(a, b, c); else if (.08 <= a)for (var f = ka(b), m, n, u, w, A, e = .3 < a ? [1, 2, 4] : .15 < a ? [1, 2, 4, 6, 8] : [1, 2, 3, 4, 5, 6, 7, 8, 9]; f < c + 1 && !A; f++)for (n = e.length, m = 0; m < n && !A; m++)u = h(g(f) * e[m]), u > b && (!d || w <= c) && w !== J && k.push(w), w > c && (A = !0), w = u; else b = g(b), c = g(c), a = e[d ? "minorTickInterval" : "tickInterval"], a = z("auto" === a ? null : a, this._minorAutoInterval, e.tickPixelInterval / (d ? 5 : 1) * (c - b) / ((d ? f / this.tickPositions.length : f) || 1)), a = P(a, null,
            E(a)), k = Ea(this.getLinearTickPositions(a, b, c), h), d || (this._minorAutoInterval = a / 5);
        d || (this.tickInterval = a);
        return k
    };
    ga.prototype.log2lin = function (a) {
        return qa.log(a) / qa.LN10
    };
    ga.prototype.lin2log = function (a) {
        return qa.pow(10, a)
    };
    var Mb = U.Tooltip = function () {
        this.init.apply(this, arguments)
    };
    Mb.prototype = {
        init: function (a, b) {
            var c = b.borderWidth, d = b.style, e = H(d.padding);
            this.chart = a;
            this.options = b;
            this.crosshairs = [];
            this.now = {x: 0, y: 0};
            this.isHidden = !0;
            this.label = a.renderer.label("", 0, 0, b.shape || "callout",
                null, null, b.useHTML, null, "tooltip").attr({
                    padding: e,
                    fill: b.backgroundColor,
                    "stroke-width": c,
                    r: b.borderRadius,
                    zIndex: 8
                }).css(d).css({padding: 0}).add().attr({y: -9999});
            Ha || this.label.shadow(b.shadow);
            this.shared = b.shared
        }, destroy: function () {
            this.label && (this.label = this.label.destroy());
            clearTimeout(this.hideTimer);
            clearTimeout(this.tooltipTimeout)
        }, move: function (a, b, c, d) {
            var e = this, f = e.now, g = !1 !== e.options.animation && !e.isHidden && (1 < ra(a - f.x) || 1 < ra(b - f.y)), h = e.followPointer || 1 < e.len;
            O(f, {
                x: g ? (2 * f.x +
                a) / 3 : a,
                y: g ? (f.y + b) / 2 : b,
                anchorX: h ? J : g ? (2 * f.anchorX + c) / 3 : c,
                anchorY: h ? J : g ? (f.anchorY + d) / 2 : d
            });
            e.label.attr(f);
            g && (clearTimeout(this.tooltipTimeout), this.tooltipTimeout = setTimeout(function () {
                e && e.move(a, b, c, d)
            }, 32))
        }, hide: function (a) {
            var b = this;
            clearTimeout(this.hideTimer);
            a = z(a, this.options.hideDelay, 500);
            this.isHidden || (this.hideTimer = D(function () {
                b.label[a ? "fadeOut" : "hide"]();
                b.isHidden = !0
            }, a))
        }, getAnchor: function (a, b) {
            var c, d = this.chart, e = d.inverted, f = d.plotTop, g = d.plotLeft, h = 0, k = 0, m, n;
            a = B(a);
            c = a[0].tooltipPos;
            this.followPointer && b && (b.chartX === J && (b = d.pointer.normalize(b)), c = [b.chartX - d.plotLeft, b.chartY - f]);
            c || (C(a, function (a) {
                m = a.series.yAxis;
                n = a.series.xAxis;
                h += a.plotX + (!e && n ? n.left - g : 0);
                k += (a.plotLow ? (a.plotLow + a.plotHigh) / 2 : a.plotY) + (!e && m ? m.top - f : 0)
            }), h /= a.length, k /= a.length, c = [e ? d.plotWidth - k : h, this.shared && !e && 1 < a.length && b ? b.chartY - f : e ? d.plotHeight - h : k]);
            return Ea(c, M)
        }, getPosition: function (a, b, c) {
            var d = this.chart, e = this.distance, f = {}, g = c.h || 0, h, k = ["y", d.chartHeight, b, c.plotY + d.plotTop, d.plotTop,
                d.plotTop + d.plotHeight], m = ["x", d.chartWidth, a, c.plotX + d.plotLeft, d.plotLeft, d.plotLeft + d.plotWidth], n = !this.followPointer && z(c.ttBelow, !d.inverted === !!c.negative), u = function (a, b, c, d, h, k) {
                var m = c < d - e, u = d + e + c < b, w = d - e - c;
                d += e;
                if (n && u)f[a] = d; else if (!n && m)f[a] = w; else if (m)f[a] = W(k - c, 0 > w - g ? w : w - g); else if (u)f[a] = L(h, d + g + c > b ? d : d + g); else return !1
            }, w = function (a, b, c, d) {
                var g;
                d < e || d > b - e ? g = !1 : f[a] = d < c / 2 ? 1 : d > b - c / 2 ? b - c - 2 : d - c / 2;
                return g
            }, A = function (a) {
                var b = k;
                k = m;
                m = b;
                h = a
            }, G = function () {
                !1 !== u.apply(0, k) ? !1 !== w.apply(0,
                    m) || h || (A(!0), G()) : h ? f.x = f.y = 0 : (A(!0), G())
            };
            (d.inverted || 1 < this.len) && A();
            G();
            return f
        }, defaultFormatter: function (a) {
            var b = this.points || B(this), c;
            c = [a.tooltipFooterHeaderFormatter(b[0])];
            c = c.concat(a.bodyFormatter(b));
            c.push(a.tooltipFooterHeaderFormatter(b[0], !0));
            return c.join("")
        }, refresh: function (a, b) {
            var c = this.chart, d = this.label, e = this.options, f, g, h, k = {}, m, n = [];
            m = e.formatter || this.defaultFormatter;
            var k = c.hoverPoints, u, w = this.shared;
            clearTimeout(this.hideTimer);
            this.followPointer = B(a)[0].series.tooltipOptions.followPointer;
            h = this.getAnchor(a, b);
            f = h[0];
            g = h[1];
            !w || a.series && a.series.noSharedTooltip ? k = a.getLabelConfig() : (c.hoverPoints = a, k && C(k, function (a) {
                a.setState()
            }), C(a, function (a) {
                a.setState("hover");
                n.push(a.getLabelConfig())
            }), k = {x: a[0].category, y: a[0].y}, k.points = n, this.len = n.length, a = a[0]);
            m = m.call(k, this);
            k = a.series;
            this.distance = z(k.tooltipOptions.distance, 16);
            !1 === m ? this.hide() : (this.isHidden && (Xa(d), d.attr("opacity", 1).show()), d.attr({text: m}), u = e.borderColor || a.color || k.color || "#606060", d.attr({stroke: u}),
                this.updatePosition({
                    plotX: f,
                    plotY: g,
                    negative: a.negative,
                    ttBelow: a.ttBelow,
                    h: h[2] || 0
                }), this.isHidden = !1);
            na(c, "tooltipRefresh", {text: m, x: f + c.plotLeft, y: g + c.plotTop, borderColor: u})
        }, updatePosition: function (a) {
            var b = this.chart, c = this.label, c = (this.options.positioner || this.getPosition).call(this, c.width, c.height, a);
            this.move(M(c.x), M(c.y || 0), a.plotX + b.plotLeft, a.plotY + b.plotTop)
        }, getXDateFormat: function (a, b, c) {
            var d;
            b = b.dateTimeLabelFormats;
            var e = c && c.closestPointRange, f, g = {
                millisecond: 15, second: 12,
                minute: 9, hour: 6, day: 3
            }, h, k = "millisecond";
            if (e) {
                h = Da("%m-%d %H:%M:%S.%L", a.x);
                for (f in ma) {
                    if (e === ma.week && +Da("%w", a.x) === c.options.startOfWeek && "00:00:00.000" === h.substr(6)) {
                        f = "week";
                        break
                    }
                    if (ma[f] > e) {
                        f = k;
                        break
                    }
                    if (g[f] && h.substr(g[f]) !== "01-01 00:00:00.000".substr(g[f]))break;
                    "week" !== f && (k = f)
                }
                f && (d = b[f])
            } else d = b.day;
            return d || b.year
        }, tooltipFooterHeaderFormatter: function (a, b) {
            var c = b ? "footer" : "header", d = a.series, e = d.tooltipOptions, f = e.xDateFormat, g = d.xAxis, h = g && "datetime" === g.options.type && r(a.key),
                c = e[c + "Format"];
            h && !f && (f = this.getXDateFormat(a, e, g));
            h && f && (c = c.replace("{point.key}", "{point.key:" + f + "}"));
            return q(c, {point: a, series: d})
        }, bodyFormatter: function (a) {
            return Ea(a, function (a) {
                var c = a.series.tooltipOptions;
                return (c.pointFormatter || a.point.tooltipFormatter).call(a.point, c.pointFormat)
            })
        }
    };
    var Fa;
    gb = X && X.documentElement.ontouchstart !== J;
    var Ya = U.Pointer = function (a, b) {
        this.init(a, b)
    };
    Ya.prototype = {
        init: function (a, b) {
            var c = b.chart, d = c.events, e = Ha ? "" : c.zoomType, c = a.inverted, f;
            this.options =
                b;
            this.chart = a;
            this.zoomX = f = /x/.test(e);
            this.zoomY = e = /y/.test(e);
            this.zoomHor = f && !c || e && c;
            this.zoomVert = e && !c || f && c;
            this.hasZoom = f || e;
            this.runChartClick = d && !!d.click;
            this.pinchDown = [];
            this.lastValidTouch = {};
            U.Tooltip && b.tooltip.enabled && (a.tooltip = new Mb(a, b.tooltip), this.followTouchMove = z(b.tooltip.followTouchMove, !0));
            this.setDOMEvents()
        }, normalize: function (a, b) {
            var c, d;
            a = a || t.event;
            a.target || (a.target = a.srcElement);
            d = a.touches ? a.touches.length ? a.touches.item(0) : a.changedTouches[0] : a;
            b || (this.chartPosition =
                b = Kb(this.chart.container));
            d.pageX === J ? (c = L(a.x, a.clientX - b.left), d = a.y) : (c = d.pageX - b.left, d = d.pageY - b.top);
            return O(a, {chartX: M(c), chartY: M(d)})
        }, getCoordinates: function (a) {
            var b = {xAxis: [], yAxis: []};
            C(this.chart.axes, function (c) {
                b[c.isXAxis ? "xAxis" : "yAxis"].push({axis: c, value: c.toValue(a[c.horiz ? "chartX" : "chartY"])})
            });
            return b
        }, runPointActions: function (a) {
            var b = this.chart, c = b.series, d = b.tooltip, e = d ? d.shared : !1, f = b.hoverPoint, g = b.hoverSeries, h, k = [Number.MAX_VALUE, Number.MAX_VALUE], m, n, u = [], w = [],
                A;
            if (!e && !g)for (h = 0; h < c.length; h++)if (c[h].directTouch || !c[h].options.stickyTracking)c = [];
            g && (e ? g.noSharedTooltip : g.directTouch) && f ? w = [f] : (C(c, function (b) {
                m = b.noSharedTooltip && e;
                n = !e && b.directTouch;
                b.visible && !m && !n && z(b.options.enableMouseTracking, !0) && (A = b.searchPoint(a, !m && 1 === b.kdDimensions)) && u.push(A)
            }), C(u, function (a) {
                a && C(["dist", "distX"], function (b, c) {
                    if ("number" === typeof a[b]) {
                        var d = a[b] === k[c] && a.series.group.zIndex >= w[c].series.group.zIndex;
                        if (a[b] < k[c] || d)k[c] = a[b], w[c] = a
                    }
                })
            }));
            if (e)for (h =
                           u.length; h--;)(u[h].clientX !== w[1].clientX || u[h].series.noSharedTooltip) && u.splice(h, 1);
            if (w[0] && (w[0] !== this.prevKDPoint || d && d.isHidden))if (e && !w[0].series.noSharedTooltip)u.length && d && d.refresh(u, a), C(u, function (b) {
                b.onMouseOver(a, b !== (g && g.directTouch && f || w[0]))
            }), this.prevKDPoint = w[1]; else {
                d && d.refresh(w[0], a);
                if (!g || !g.directTouch)w[0].onMouseOver(a);
                this.prevKDPoint = w[0]
            } else c = g && g.tooltipOptions.followPointer, d && c && !d.isHidden && (c = d.getAnchor([{}], a), d.updatePosition({
                plotX: c[0],
                plotY: c[1]
            }));
            this._onDocumentMouseMove || (this._onDocumentMouseMove = function (a) {
                if (va[Fa])va[Fa].pointer.onDocumentMouseMove(a)
            }, aa(X, "mousemove", this._onDocumentMouseMove));
            C(e ? u : [z(w[1], f)], function (c) {
                C(b.axes, function (b) {
                    c && c.series[b.coll] !== b || b.drawCrosshair(a, c)
                })
            })
        }, reset: function (a, b) {
            var c = this.chart, d = c.hoverSeries, e = c.hoverPoint, f = c.hoverPoints, g = c.tooltip, h = g && g.shared ? f : e;
            a && h && C(B(h), function (b) {
                b.series.isCartesian && void 0 === b.plotX && (a = !1)
            });
            if (a)g && h && (g.refresh(h), e && (e.setState(e.state, !0),
                C(c.axes, function (a) {
                    z(a.crosshair && a.crosshair.snap, !0) ? a.drawCrosshair(null, e) : a.hideCrosshair()
                }))); else {
                if (e)e.onMouseOut();
                f && C(f, function (a) {
                    a.setState()
                });
                if (d)d.onMouseOut();
                g && g.hide(b);
                this._onDocumentMouseMove && (sa(X, "mousemove", this._onDocumentMouseMove), this._onDocumentMouseMove = null);
                C(c.axes, function (a) {
                    a.hideCrosshair()
                });
                this.hoverX = c.hoverPoints = c.hoverPoint = null
            }
        }, scaleGroups: function (a, b) {
            var c = this.chart, d;
            C(c.series, function (e) {
                d = a || e.getPlotBox();
                e.xAxis && e.xAxis.zoomEnabled &&
                (e.group.attr(d), e.markerGroup && (e.markerGroup.attr(d), e.markerGroup.clip(b ? c.clipRect : null)), e.dataLabelsGroup && e.dataLabelsGroup.attr(d))
            });
            c.clipRect.attr(b || c.clipBox)
        }, dragStart: function (a) {
            var b = this.chart;
            b.mouseIsDown = a.type;
            b.cancelClick = !1;
            b.mouseDownX = this.mouseDownX = a.chartX;
            b.mouseDownY = this.mouseDownY = a.chartY
        }, drag: function (a) {
            var b = this.chart, c = b.options.chart, d = a.chartX, e = a.chartY, f = this.zoomHor, g = this.zoomVert, h = b.plotLeft, k = b.plotTop, m = b.plotWidth, n = b.plotHeight, u, w = this.selectionMarker,
                A = this.mouseDownX, G = this.mouseDownY, l = c.panKey && a[c.panKey + "Key"];
            w && w.touch || (d < h ? d = h : d > h + m && (d = h + m), e < k ? e = k : e > k + n && (e = k + n), this.hasDragged = Math.sqrt(Math.pow(A - d, 2) + Math.pow(G - e, 2)), 10 < this.hasDragged && (u = b.isInsidePlot(A - h, G - k), b.hasCartesianSeries && (this.zoomX || this.zoomY) && u && !l && !w && (this.selectionMarker = w = b.renderer.rect(h, k, f ? 1 : m, g ? 1 : n, 0).attr({
                fill: c.selectionMarkerFill || "rgba(69,114,167,0.25)",
                zIndex: 7
            }).add()), w && f && (d -= A, w.attr({
                width: ra(d),
                x: (0 < d ? 0 : d) + A
            })), w && g && (d = e - G, w.attr({
                height: ra(d),
                y: (0 < d ? 0 : d) + G
            })), u && !w && c.panning && b.pan(a, c.panning)))
        }, drop: function (a) {
            var b = this, c = this.chart, d = this.hasPinched;
            if (this.selectionMarker) {
                var e = {
                    originalEvent: a,
                    xAxis: [],
                    yAxis: []
                }, f = this.selectionMarker, g = f.attr ? f.attr("x") : f.x, h = f.attr ? f.attr("y") : f.y, k = f.attr ? f.attr("width") : f.width, m = f.attr ? f.attr("height") : f.height, n;
                if (this.hasDragged || d)C(c.axes, function (c) {
                    if (c.zoomEnabled && y(c.min) && (d || b[{xAxis: "zoomX", yAxis: "zoomY"}[c.coll]])) {
                        var f = c.horiz, A = "touchend" === a.type ? c.minPixelPadding : 0, G =
                            c.toValue((f ? g : h) + A), f = c.toValue((f ? g + k : h + m) - A);
                        e[c.coll].push({axis: c, min: W(G, f), max: L(G, f)});
                        n = !0
                    }
                }), n && na(c, "selection", e, function (a) {
                    c.zoom(O(a, d ? {animation: !1} : null))
                });
                this.selectionMarker = this.selectionMarker.destroy();
                d && this.scaleGroups()
            }
            c && (F(c.container, {cursor: c._cursor}), c.cancelClick = 10 < this.hasDragged, c.mouseIsDown = this.hasDragged = this.hasPinched = !1, this.pinchDown = [])
        }, onContainerMouseDown: function (a) {
            a = this.normalize(a);
            a.preventDefault && a.preventDefault();
            this.dragStart(a)
        }, onDocumentMouseUp: function (a) {
            va[Fa] &&
            va[Fa].pointer.drop(a)
        }, onDocumentMouseMove: function (a) {
            var b = this.chart, c = this.chartPosition;
            a = this.normalize(a, c);
            !c || this.inClass(a.target, "highcharts-tracker") || b.isInsidePlot(a.chartX - b.plotLeft, a.chartY - b.plotTop) || this.reset()
        }, onContainerMouseLeave: function (a) {
            var b = va[Fa];
            b && (a.relatedTarget || a.toElement) && (b.pointer.reset(), b.pointer.chartPosition = null)
        }, onContainerMouseMove: function (a) {
            var b = this.chart;
            y(Fa) && va[Fa] && va[Fa].mouseIsDown || (Fa = b.index);
            a = this.normalize(a);
            a.returnValue = !1;
            "mousedown" === b.mouseIsDown && this.drag(a);
            !this.inClass(a.target, "highcharts-tracker") && !b.isInsidePlot(a.chartX - b.plotLeft, a.chartY - b.plotTop) || b.openMenu || this.runPointActions(a)
        }, inClass: function (a, b) {
            for (var c; a;) {
                if (c = K(a, "class")) {
                    if (-1 !== c.indexOf(b))return !0;
                    if (-1 !== c.indexOf("highcharts-container"))return !1
                }
                a = a.parentNode
            }
        }, onTrackerMouseOut: function (a) {
            var b = this.chart.hoverSeries;
            a = a.relatedTarget || a.toElement;
            if (b && a && !b.options.stickyTracking && !this.inClass(a, "highcharts-tooltip") && !this.inClass(a,
                    "highcharts-series-" + b.index))b.onMouseOut()
        }, onContainerClick: function (a) {
            var b = this.chart, c = b.hoverPoint, d = b.plotLeft, e = b.plotTop;
            a = this.normalize(a);
            b.cancelClick || (c && this.inClass(a.target, "highcharts-tracker") ? (na(c.series, "click", O(a, {point: c})), b.hoverPoint && c.firePointEvent("click", a)) : (O(a, this.getCoordinates(a)), b.isInsidePlot(a.chartX - d, a.chartY - e) && na(b, "click", a)))
        }, setDOMEvents: function () {
            var a = this, b = a.chart.container;
            b.onmousedown = function (b) {
                a.onContainerMouseDown(b)
            };
            b.onmousemove =
                function (b) {
                    a.onContainerMouseMove(b)
                };
            b.onclick = function (b) {
                a.onContainerClick(b)
            };
            aa(b, "mouseleave", a.onContainerMouseLeave);
            1 === nb && aa(X, "mouseup", a.onDocumentMouseUp);
            gb && (b.ontouchstart = function (b) {
                a.onContainerTouchStart(b)
            }, b.ontouchmove = function (b) {
                a.onContainerTouchMove(b)
            }, 1 === nb && aa(X, "touchend", a.onDocumentTouchEnd))
        }, destroy: function () {
            var a;
            sa(this.chart.container, "mouseleave", this.onContainerMouseLeave);
            nb || (sa(X, "mouseup", this.onDocumentMouseUp), sa(X, "touchend", this.onDocumentTouchEnd));
            clearInterval(this.tooltipTimeout);
            for (a in this)this[a] = null
        }
    };
    O(U.Pointer.prototype, {
        pinchTranslate: function (a, b, c, d, e, f) {
            (this.zoomHor || this.pinchHor) && this.pinchTranslateDirection(!0, a, b, c, d, e, f);
            (this.zoomVert || this.pinchVert) && this.pinchTranslateDirection(!1, a, b, c, d, e, f)
        }, pinchTranslateDirection: function (a, b, c, d, e, f, g, h) {
            var k = this.chart, m = a ? "x" : "y", n = a ? "X" : "Y", u = "chart" + n, w = a ? "width" : "height", A = k["plot" + (a ? "Left" : "Top")], G, l, v = h || 1, q = k.inverted, E = k.bounds[a ? "h" : "v"], p = 1 === b.length, z = b[0][u],
                r = c[0][u], y = !p && b[1][u], t = !p && c[1][u], C;
            c = function () {
                !p && 20 < ra(z - y) && (v = h || ra(r - t) / ra(z - y));
                l = (A - r) / v + z;
                G = k["plot" + (a ? "Width" : "Height")] / v
            };
            c();
            b = l;
            b < E.min ? (b = E.min, C = !0) : b + G > E.max && (b = E.max - G, C = !0);
            C ? (r -= .8 * (r - g[m][0]), p || (t -= .8 * (t - g[m][1])), c()) : g[m] = [r, t];
            q || (f[m] = l - A, f[w] = G);
            f = q ? 1 / v : v;
            e[w] = G;
            e[m] = b;
            d[q ? a ? "scaleY" : "scaleX" : "scale" + n] = v;
            d["translate" + n] = f * A + (r - f * z)
        }, pinch: function (a) {
            var b = this, c = b.chart, d = b.pinchDown, e = a.touches, f = e.length, g = b.lastValidTouch, h = b.hasZoom, k = b.selectionMarker, m = {},
                n = 1 === f && (b.inClass(a.target, "highcharts-tracker") && c.runTrackerClick || b.runChartClick), u = {};
            1 < f && (b.initiated = !0);
            h && b.initiated && !n && a.preventDefault();
            Ea(e, function (a) {
                return b.normalize(a)
            });
            "touchstart" === a.type ? (C(e, function (a, b) {
                d[b] = {chartX: a.chartX, chartY: a.chartY}
            }), g.x = [d[0].chartX, d[1] && d[1].chartX], g.y = [d[0].chartY, d[1] && d[1].chartY], C(c.axes, function (a) {
                if (a.zoomEnabled) {
                    var b = c.bounds[a.horiz ? "h" : "v"], d = a.minPixelPadding, e = a.toPixels(z(a.options.min, a.dataMin)), f = a.toPixels(z(a.options.max,
                        a.dataMax)), g = W(e, f), e = L(e, f);
                    b.min = W(a.pos, g - d);
                    b.max = L(a.pos + a.len, e + d)
                }
            }), b.res = !0) : d.length && (k || (b.selectionMarker = k = O({
                destroy: oa,
                touch: !0
            }, c.plotBox)), b.pinchTranslate(d, e, m, k, u, g), b.hasPinched = h, b.scaleGroups(m, u), !h && b.followTouchMove && 1 === f ? this.runPointActions(b.normalize(a)) : b.res && (b.res = !1, this.reset(!1, 0)))
        }, touch: function (a, b) {
            var c = this.chart, d;
            Fa = c.index;
            1 === a.touches.length ? (a = this.normalize(a), c.isInsidePlot(a.chartX - c.plotLeft, a.chartY - c.plotTop) && !c.openMenu ? (b && this.runPointActions(a),
            "touchmove" === a.type && (c = this.pinchDown, d = 4 <= Math.sqrt(Math.pow(c[0].chartX - a.chartX, 2) + Math.pow(c[0].chartY - a.chartY, 2))), z(d, !0) && this.pinch(a)) : b && this.reset()) : 2 === a.touches.length && this.pinch(a)
        }, onContainerTouchStart: function (a) {
            this.touch(a, !0)
        }, onContainerTouchMove: function (a) {
            this.touch(a)
        }, onDocumentTouchEnd: function (a) {
            va[Fa] && va[Fa].pointer.drop(a)
        }
    });
    if (t.PointerEvent || t.MSPointerEvent) {
        var Qa = {}, Nb = !!t.PointerEvent, nc = function () {
            var a, b = [];
            b.item = function (a) {
                return this[a]
            };
            for (a in Qa)Qa.hasOwnProperty(a) &&
            b.push({pageX: Qa[a].pageX, pageY: Qa[a].pageY, target: Qa[a].target});
            return b
        }, Ob = function (a, b, c, d) {
            "touch" !== a.pointerType && a.pointerType !== a.MSPOINTER_TYPE_TOUCH || !va[Fa] || (d(a), d = va[Fa].pointer, d[b]({
                type: c,
                target: a.currentTarget,
                preventDefault: oa,
                touches: nc()
            }))
        };
        O(Ya.prototype, {
            onContainerPointerDown: function (a) {
                Ob(a, "onContainerTouchStart", "touchstart", function (a) {
                    Qa[a.pointerId] = {pageX: a.pageX, pageY: a.pageY, target: a.currentTarget}
                })
            }, onContainerPointerMove: function (a) {
                Ob(a, "onContainerTouchMove",
                    "touchmove", function (a) {
                        Qa[a.pointerId] = {pageX: a.pageX, pageY: a.pageY};
                        Qa[a.pointerId].target || (Qa[a.pointerId].target = a.currentTarget)
                    })
            }, onDocumentPointerUp: function (a) {
                Ob(a, "onDocumentTouchEnd", "touchend", function (a) {
                    delete Qa[a.pointerId]
                })
            }, batchMSEvents: function (a) {
                a(this.chart.container, Nb ? "pointerdown" : "MSPointerDown", this.onContainerPointerDown);
                a(this.chart.container, Nb ? "pointermove" : "MSPointerMove", this.onContainerPointerMove);
                a(X, Nb ? "pointerup" : "MSPointerUp", this.onDocumentPointerUp)
            }
        });
        ca(Ya.prototype, "init", function (a, b, c) {
            a.call(this, b, c);
            this.hasZoom && F(b.container, {"-ms-touch-action": "none", "touch-action": "none"})
        });
        ca(Ya.prototype, "setDOMEvents", function (a) {
            a.apply(this);
            (this.hasZoom || this.followTouchMove) && this.batchMSEvents(aa)
        });
        ca(Ya.prototype, "destroy", function (a) {
            this.batchMSEvents(sa);
            a.call(this)
        })
    }
    var zb = U.Legend = function (a, b) {
        this.init(a, b)
    };
    zb.prototype = {
        init: function (a, b) {
            var c = this, d = b.itemStyle, e = b.itemMarginTop || 0;
            this.options = b;
            b.enabled && (c.itemStyle = d, c.itemHiddenStyle =
                x(d, b.itemHiddenStyle), c.itemMarginTop = e, c.padding = d = z(b.padding, 8), c.initialItemX = d, c.initialItemY = d - 5, c.maxItemWidth = 0, c.chart = a, c.itemHeight = 0, c.symbolWidth = z(b.symbolWidth, 16), c.pages = [], c.render(), aa(c.chart, "endResize", function () {
                c.positionCheckboxes()
            }))
        }, colorizeItem: function (a, b) {
            var c = this.options, d = a.legendItem, e = a.legendLine, f = a.legendSymbol, g = this.itemHiddenStyle.color, c = b ? c.itemStyle.color : g, h = b ? a.legendColor || a.color || "#CCC" : g, g = a.options && a.options.marker, k = {fill: h}, m;
            d && d.css({
                fill: c,
                color: c
            });
            e && e.attr({stroke: h});
            if (f) {
                if (g && f.isMarker)for (m in k.stroke = h, g = a.convertAttribs(g), g)d = g[m], d !== J && (k[m] = d);
                f.attr(k)
            }
        }, positionItem: function (a) {
            var b = this.options, c = b.symbolPadding, b = !b.rtl, d = a._legendItemPos, e = d[0], d = d[1], f = a.checkbox;
            (a = a.legendGroup) && a.element && a.translate(b ? e : this.legendWidth - e - 2 * c - 4, d);
            f && (f.x = e, f.y = d)
        }, destroyItem: function (a) {
            var b = a.checkbox;
            C(["legendItem", "legendLine", "legendSymbol", "legendGroup"], function (b) {
                a[b] && (a[b] = a[b].destroy())
            });
            b && Sa(a.checkbox)
        },
        destroy: function () {
            var a = this.group, b = this.box;
            b && (this.box = b.destroy());
            a && (this.group = a.destroy())
        }, positionCheckboxes: function (a) {
            var b = this.group.alignAttr, c, d = this.clipHeight || this.legendHeight, e = this.titleHeight;
            b && (c = b.translateY, C(this.allItems, function (f) {
                var g = f.checkbox, h;
                g && (h = c + e + g.y + (a || 0) + 3, F(g, {
                    left: b.translateX + f.checkboxOffset + g.x - 20 + "px",
                    top: h + "px",
                    display: h > c - 6 && h < c + d - 6 ? "" : "none"
                }))
            }))
        }, renderTitle: function () {
            var a = this.padding, b = this.options.title, c = 0;
            b.text && (this.title || (this.title =
                this.chart.renderer.label(b.text, a - 3, a - 4, null, null, null, null, null, "legend-title").attr({zIndex: 1}).css(b.style).add(this.group)), a = this.title.getBBox(), c = a.height, this.offsetWidth = a.width, this.contentGroup.attr({translateY: c}));
            this.titleHeight = c
        }, setText: function (a) {
            var b = this.options;
            a.legendItem.attr({text: b.labelFormat ? q(b.labelFormat, a) : b.labelFormatter.call(a)})
        }, renderItem: function (a) {
            var b = this.chart, c = b.renderer, d = this.options, e = "horizontal" === d.layout, f = this.symbolWidth, g = d.symbolPadding,
                h = this.itemStyle, k = this.itemHiddenStyle, m = this.padding, n = e ? z(d.itemDistance, 20) : 0, u = !d.rtl, w = d.width, A = d.itemMarginBottom || 0, G = this.itemMarginTop, l = this.initialItemX, v = a.legendItem, q = a.series && a.series.drawLegendSymbol ? a.series : a, E = q.options, E = this.createCheckboxForItem && E && E.showCheckbox, p = d.useHTML;
            v || (a.legendGroup = c.g("legend-item").attr({zIndex: 1}).add(this.scrollGroup), a.legendItem = v = c.text("", u ? f + g : -g, this.baseline || 0, p).css(x(a.visible ? h : k)).attr({
                align: u ? "left" : "right",
                zIndex: 2
            }).add(a.legendGroup),
            this.baseline || (this.fontMetrics = c.fontMetrics(h.fontSize, v), this.baseline = this.fontMetrics.f + 3 + G, v.attr("y", this.baseline)), q.drawLegendSymbol(this, a), this.setItemEvents && this.setItemEvents(a, v, p, h, k), E && this.createCheckboxForItem(a));
            this.colorizeItem(a, a.visible);
            this.setText(a);
            c = v.getBBox();
            f = a.checkboxOffset = d.itemWidth || a.legendItemWidth || f + g + c.width + n + (E ? 20 : 0);
            this.itemHeight = g = M(a.legendItemHeight || c.height);
            e && this.itemX - l + f > (w || b.chartWidth - 2 * m - l - d.x) && (this.itemX = l, this.itemY += G + this.lastLineHeight +
                A, this.lastLineHeight = 0);
            this.maxItemWidth = L(this.maxItemWidth, f);
            this.lastItemY = G + this.itemY + A;
            this.lastLineHeight = L(g, this.lastLineHeight);
            a._legendItemPos = [this.itemX, this.itemY];
            e ? this.itemX += f : (this.itemY += G + g + A, this.lastLineHeight = g);
            this.offsetWidth = w || L((e ? this.itemX - l - n : f) + m, this.offsetWidth)
        }, getAllItems: function () {
            var a = [];
            C(this.chart.series, function (b) {
                var c = b.options;
                z(c.showInLegend, y(c.linkedTo) ? !1 : J, !0) && (a = a.concat(b.legendItems || ("point" === c.legendType ? b.data : b)))
            });
            return a
        }, adjustMargins: function (a,
                                    b) {
            var c = this.chart, d = this.options, e = d.align.charAt(0) + d.verticalAlign.charAt(0) + d.layout.charAt(0);
            this.display && !d.floating && C([/(lth|ct|rth)/, /(rtv|rm|rbv)/, /(rbh|cb|lbh)/, /(lbv|lm|ltv)/], function (f, g) {
                f.test(e) && !y(a[g]) && (c[yb[g]] = L(c[yb[g]], c.legend[(g + 1) % 2 ? "legendHeight" : "legendWidth"] + [1, -1, -1, 1][g] * d[g % 2 ? "x" : "y"] + z(d.margin, 12) + b[g]))
            })
        }, render: function () {
            var a = this, b = a.chart, c = b.renderer, d = a.group, e, f, g, h, k = a.box, m = a.options, n = a.padding, u = m.borderWidth, w = m.backgroundColor;
            a.itemX = a.initialItemX;
            a.itemY = a.initialItemY;
            a.offsetWidth = 0;
            a.lastItemY = 0;
            d || (a.group = d = c.g("legend").attr({zIndex: 7}).add(), a.contentGroup = c.g().attr({zIndex: 1}).add(d), a.scrollGroup = c.g().add(a.contentGroup));
            a.renderTitle();
            e = a.getAllItems();
            Z(e, function (a, b) {
                return (a.options && a.options.legendIndex || 0) - (b.options && b.options.legendIndex || 0)
            });
            m.reversed && e.reverse();
            a.allItems = e;
            a.display = f = !!e.length;
            a.lastLineHeight = 0;
            C(e, function (b) {
                a.renderItem(b)
            });
            g = (m.width || a.offsetWidth) + n;
            h = a.lastItemY + a.lastLineHeight + a.titleHeight;
            h = a.handleOverflow(h);
            h += n;
            if (u || w)k ? 0 < g && 0 < h && (k[k.isNew ? "attr" : "animate"](k.crisp({
                width: g,
                height: h
            })), k.isNew = !1) : (a.box = k = c.rect(0, 0, g, h, m.borderRadius, u || 0).attr({
                stroke: m.borderColor,
                "stroke-width": u || 0,
                fill: w || "none"
            }).add(d).shadow(m.shadow), k.isNew = !0), k[f ? "show" : "hide"]();
            a.legendWidth = g;
            a.legendHeight = h;
            C(e, function (b) {
                a.positionItem(b)
            });
            f && d.align(O({width: g, height: h}, m), !0, "spacingBox");
            b.isResizing || this.positionCheckboxes()
        }, handleOverflow: function (a) {
            var b = this, c = this.chart, d = c.renderer,
                e = this.options, f = e.y, f = c.spacingBox.height + ("top" === e.verticalAlign ? -f : f) - this.padding, g = e.maxHeight, h, k = this.clipRect, m = e.navigation, n = z(m.animation, !0), u = m.arrowSize || 12, w = this.nav, A = this.pages, G = this.padding, l, v = this.allItems, q = function (a) {
                    k.attr({height: a});
                    b.contentGroup.div && (b.contentGroup.div.style.clip = "rect(" + G + "px,9999px," + (G + a) + "px,0)")
                };
            "horizontal" === e.layout && (f /= 2);
            g && (f = W(f, g));
            A.length = 0;
            a > f && !1 !== m.enabled ? (this.clipHeight = h = L(f - 20 - this.titleHeight - G, 0), this.currentPage = z(this.currentPage,
                1), this.fullHeight = a, C(v, function (a, b) {
                var c = a._legendItemPos[1], d = M(a.legendItem.getBBox().height), e = A.length;
                if (!e || c - A[e - 1] > h && (l || c) !== A[e - 1])A.push(l || c), e++;
                b === v.length - 1 && c + d - A[e - 1] > h && A.push(c);
                c !== l && (l = c)
            }), k || (k = b.clipRect = d.clipRect(0, G, 9999, 0), b.contentGroup.clip(k)), q(h), w || (this.nav = w = d.g().attr({zIndex: 1}).add(this.group), this.up = d.symbol("triangle", 0, 0, u, u).on("click", function () {
                b.scroll(-1, n)
            }).add(w), this.pager = d.text("", 15, 10).css(m.style).add(w), this.down = d.symbol("triangle-down",
                0, 0, u, u).on("click", function () {
                    b.scroll(1, n)
                }).add(w)), b.scroll(0), a = f) : w && (q(c.chartHeight), w.hide(), this.scrollGroup.attr({translateY: 1}), this.clipHeight = 0);
            return a
        }, scroll: function (a, b) {
            var c = this.pages, d = c.length, e = this.currentPage + a, f = this.clipHeight, g = this.options.navigation, h = g.activeColor, g = g.inactiveColor, k = this.pager, m = this.padding;
            e > d && (e = d);
            0 < e && (b !== J && za(b, this.chart), this.nav.attr({
                translateX: m,
                translateY: f + this.padding + 7 + this.titleHeight,
                visibility: "visible"
            }), this.up.attr({
                fill: 1 ===
                e ? g : h
            }).css({cursor: 1 === e ? "default" : "pointer"}), k.attr({text: e + "/" + d}), this.down.attr({
                x: 18 + this.pager.getBBox().width,
                fill: e === d ? g : h
            }).css({cursor: e === d ? "default" : "pointer"}), c = -c[e - 1] + this.initialItemY, this.scrollGroup.animate({translateY: c}), this.currentPage = e, this.positionCheckboxes(c))
        }
    };
    var rb = U.LegendSymbolMixin = {
        drawRectangle: function (a, b) {
            var c = a.options.symbolHeight || a.fontMetrics.f;
            b.legendSymbol = this.chart.renderer.rect(0, a.baseline - c + 1, a.symbolWidth, c, a.options.symbolRadius || 0).attr({zIndex: 3}).add(b.legendGroup)
        },
        drawLineMarker: function (a) {
            var b = this.options, c = b.marker, d = a.symbolWidth, e = this.chart.renderer, f = this.legendGroup;
            a = a.baseline - M(.3 * a.fontMetrics.b);
            var g;
            b.lineWidth && (g = {"stroke-width": b.lineWidth}, b.dashStyle && (g.dashstyle = b.dashStyle), this.legendLine = e.path(["M", 0, a, "L", d, a]).attr(g).add(f));
            c && !1 !== c.enabled && (b = c.radius, this.legendSymbol = c = e.symbol(this.symbol, d / 2 - b, a - b, 2 * b, 2 * b, c).add(f), c.isMarker = !0)
        }
    };
    (/Trident\/7\.0/.test(Ta) || ab) && ca(zb.prototype, "positionItem", function (a, b) {
        var c = this,
            d = function () {
                b._legendItemPos && a.call(c, b)
            };
        d();
        setTimeout(d)
    });
    var Na = U.Chart = function () {
        this.getArgs.apply(this, arguments)
    };
    U.chart = function (a, b, c) {
        return new Na(a, b, c)
    };
    Na.prototype = {
        callbacks: [], getArgs: function () {
            var a = [].slice.call(arguments);
            if (ea(a[0]) || a[0].nodeName)this.renderTo = a.shift();
            this.init(a[0], a[1])
        }, init: function (a, b) {
            var c, d = a.series;
            a.series = null;
            c = x(pa, a);
            c.series = a.series = d;
            this.userOptions = a;
            d = c.chart;
            this.margin = this.splashArray("margin", d);
            this.spacing = this.splashArray("spacing",
                d);
            var e = d.events;
            this.bounds = {h: {}, v: {}};
            this.callback = b;
            this.isResizing = 0;
            this.options = c;
            this.axes = [];
            this.series = [];
            this.hasCartesianSeries = d.showAxes;
            var f = this, g;
            f.index = va.length;
            va.push(f);
            nb++;
            !1 !== d.reflow && aa(f, "load", function () {
                f.initReflow()
            });
            if (e)for (g in e)aa(f, g, e[g]);
            f.xAxis = [];
            f.yAxis = [];
            f.animation = Ha ? !1 : z(d.animation, !0);
            f.pointCount = f.colorCounter = f.symbolCounter = 0;
            f.firstRender()
        }, initSeries: function (a) {
            var b = this.options.chart;
            (b = S[a.type || b.type || b.defaultSeriesType]) || T(17,
                !0);
            b = new b;
            b.init(this, a);
            return b
        }, isInsidePlot: function (a, b, c) {
            var d = c ? b : a;
            a = c ? a : b;
            return 0 <= d && d <= this.plotWidth && 0 <= a && a <= this.plotHeight
        }, redraw: function (a) {
            var b = this.axes, c = this.series, d = this.pointer, e = this.legend, f = this.isDirtyLegend, g, h, k = this.hasCartesianSeries, m = this.isDirtyBox, n = c.length, u = n, w = this.renderer, A = w.isHidden(), G = [];
            za(a, this);
            A && this.cloneRenderTo();
            for (this.layOutTitles(); u--;)if (a = c[u], a.options.stacking && (g = !0, a.isDirty)) {
                h = !0;
                break
            }
            if (h)for (u = n; u--;)a = c[u], a.options.stacking &&
            (a.isDirty = !0);
            C(c, function (a) {
                a.isDirty && "point" === a.options.legendType && (a.updateTotals && a.updateTotals(), f = !0)
            });
            f && e.options.enabled && (e.render(), this.isDirtyLegend = !1);
            g && this.getStacks();
            k && !this.isResizing && (this.maxTicks = null, C(b, function (a) {
                a.setScale()
            }));
            this.getMargins();
            k && (C(b, function (a) {
                a.isDirty && (m = !0)
            }), C(b, function (a) {
                var b = a.min + "," + a.max;
                a.extKey !== b && (a.extKey = b, G.push(function () {
                    na(a, "afterSetExtremes", O(a.eventArgs, a.getExtremes()));
                    delete a.eventArgs
                }));
                (m || g) && a.redraw()
            }));
            m && this.drawChartBox();
            C(c, function (a) {
                a.isDirty && a.visible && (!a.isCartesian || a.xAxis) && a.redraw()
            });
            d && d.reset(!0);
            w.draw();
            na(this, "redraw");
            A && this.cloneRenderTo(!0);
            C(G, function (a) {
                a.call()
            })
        }, get: function (a) {
            var b = this.axes, c = this.series, d, e;
            for (d = 0; d < b.length; d++)if (b[d].options.id === a)return b[d];
            for (d = 0; d < c.length; d++)if (c[d].options.id === a)return c[d];
            for (d = 0; d < c.length; d++)for (e = c[d].points || [], b = 0; b < e.length; b++)if (e[b].id === a)return e[b];
            return null
        }, getAxes: function () {
            var a = this, b = this.options,
                c = b.xAxis = B(b.xAxis || {}), b = b.yAxis = B(b.yAxis || {});
            C(c, function (a, b) {
                a.index = b;
                a.isX = !0
            });
            C(b, function (a, b) {
                a.index = b
            });
            c = c.concat(b);
            C(c, function (b) {
                new ga(a, b)
            })
        }, getSelectedPoints: function () {
            var a = [];
            C(this.series, function (b) {
                a = a.concat(Wa(b.points || [], function (a) {
                    return a.selected
                }))
            });
            return a
        }, getSelectedSeries: function () {
            return Wa(this.series, function (a) {
                return a.selected
            })
        }, setTitle: function (a, b, c) {
            var d = this, e = d.options, f;
            f = e.title = x(e.title, a);
            e = e.subtitle = x(e.subtitle, b);
            C([["title", a, f],
                ["subtitle", b, e]], function (a) {
                var b = a[0], c = d[b], e = a[1];
                a = a[2];
                c && e && (d[b] = c = c.destroy());
                a && a.text && !c && (d[b] = d.renderer.text(a.text, 0, 0, a.useHTML).attr({
                    align: a.align,
                    "class": "highcharts-" + b,
                    zIndex: a.zIndex || 4
                }).css(a.style).add())
            });
            d.layOutTitles(c)
        }, layOutTitles: function (a) {
            var b = 0, c = this.title, d = this.subtitle, e = this.options, f = e.title, e = e.subtitle, g = this.renderer, h = this.spacingBox.width - 44;
            c && (c.css({width: (f.width || h) + "px"}).align(O({y: g.fontMetrics(f.style.fontSize, c).b - 3}, f), !1, "spacingBox"),
            f.floating || f.verticalAlign || (b = c.getBBox().height));
            d && (d.css({width: (e.width || h) + "px"}).align(O({y: b + (f.margin - 13) + g.fontMetrics(e.style.fontSize, c).b}, e), !1, "spacingBox"), e.floating || e.verticalAlign || (b = Oa(b + d.getBBox().height)));
            c = this.titleOffset !== b;
            this.titleOffset = b;
            !this.isDirtyBox && c && (this.isDirtyBox = c, this.hasRendered && z(a, !0) && this.isDirtyBox && this.redraw())
        }, getChartSize: function () {
            var a = this.options.chart, b = a.width, a = a.height, c = this.renderToClone || this.renderTo;
            y(b) || (this.containerWidth =
                Ka(c, "width"));
            y(a) || (this.containerHeight = Ka(c, "height"));
            this.chartWidth = L(0, b || this.containerWidth || 600);
            this.chartHeight = L(0, z(a, 19 < this.containerHeight ? this.containerHeight : 400))
        }, cloneRenderTo: function (a) {
            var b = this.renderToClone, c = this.container;
            a ? b && (this.renderTo.appendChild(c), Sa(b), delete this.renderToClone) : (c && c.parentNode === this.renderTo && this.renderTo.removeChild(c), this.renderToClone = b = this.renderTo.cloneNode(0), F(b, {
                position: "absolute",
                top: "-9999px",
                display: "block"
            }), b.style.setProperty &&
            b.style.setProperty("display", "block", "important"), X.body.appendChild(b), c && b.appendChild(c))
        }, getContainer: function () {
            var a, b = this.options, c = b.chart, d, e;
            a = this.renderTo;
            var f = "highcharts-" + Jb++;
            a || (this.renderTo = a = c.renderTo);
            ea(a) && (this.renderTo = a = X.getElementById(a));
            a || T(13, !0);
            d = H(K(a, "data-highcharts-chart"));
            !isNaN(d) && va[d] && va[d].hasRendered && va[d].destroy();
            K(a, "data-highcharts-chart", this.index);
            a.innerHTML = "";
            c.skipClone || a.offsetWidth || this.cloneRenderTo();
            this.getChartSize();
            d = this.chartWidth;
            e = this.chartHeight;
            this.container = a = ia("div", {
                className: "highcharts-container" + (c.className ? " " + c.className : ""),
                id: f
            }, O({
                position: "relative",
                overflow: "hidden",
                width: d + "px",
                height: e + "px",
                textAlign: "left",
                lineHeight: "normal",
                zIndex: 0,
                "-webkit-tap-highlight-color": "rgba(0,0,0,0)"
            }, c.style), this.renderToClone || a);
            this._cursor = a.style.cursor;
            this.renderer = new (U[c.renderer] || bb)(a, d, e, c.style, c.forExport, b.exporting && b.exporting.allowHTML);
            Ha && this.renderer.create(this, a, d, e);
            this.renderer.chartIndex =
                this.index
        }, getMargins: function (a) {
            var b = this.spacing, c = this.margin, d = this.titleOffset;
            this.resetMargins();
            d && !y(c[0]) && (this.plotTop = L(this.plotTop, d + this.options.title.margin + b[0]));
            this.legend.adjustMargins(c, b);
            this.extraBottomMargin && (this.marginBottom += this.extraBottomMargin);
            this.extraTopMargin && (this.plotTop += this.extraTopMargin);
            a || this.getAxisMargins()
        }, getAxisMargins: function () {
            var a = this, b = a.axisOffset = [0, 0, 0, 0], c = a.margin;
            a.hasCartesianSeries && C(a.axes, function (a) {
                a.visible && a.getOffset()
            });
            C(yb, function (d, e) {
                y(c[e]) || (a[d] += b[e])
            });
            a.setChartSize()
        }, reflow: function (a) {
            var b = this, c = b.options.chart, d = b.renderTo, e = c.width || Ka(d, "width"), f = c.height || Ka(d, "height"), c = a ? a.target : t;
            if (!b.hasUserSize && !b.isPrinting && e && f && (c === t || c === X)) {
                if (e !== b.containerWidth || f !== b.containerHeight)clearTimeout(b.reflowTimeout), b.reflowTimeout = D(function () {
                    b.container && (b.setSize(e, f, !1), b.hasUserSize = null)
                }, a ? 100 : 0);
                b.containerWidth = e;
                b.containerHeight = f
            }
        }, initReflow: function () {
            var a = this, b = function (b) {
                a.reflow(b)
            };
            aa(t, "resize", b);
            aa(a, "destroy", function () {
                sa(t, "resize", b)
            })
        }, setSize: function (a, b, c) {
            var d = this, e, f, g = d.renderer;
            d.isResizing += 1;
            za(c, d);
            d.oldChartHeight = d.chartHeight;
            d.oldChartWidth = d.chartWidth;
            y(a) && (d.chartWidth = e = L(0, M(a)), d.hasUserSize = !!e);
            y(b) && (d.chartHeight = f = L(0, M(b)));
            a = g.globalAnimation;
            (a ? hb : F)(d.container, {width: e + "px", height: f + "px"}, a);
            d.setChartSize(!0);
            g.setSize(e, f, c);
            d.maxTicks = null;
            C(d.axes, function (a) {
                a.isDirty = !0;
                a.setScale()
            });
            C(d.series, function (a) {
                a.isDirty = !0
            });
            d.isDirtyLegend = !0;
            d.isDirtyBox = !0;
            d.layOutTitles();
            d.getMargins();
            d.redraw(c);
            d.oldChartHeight = null;
            na(d, "resize");
            D(function () {
                d && na(d, "endResize", null, function () {
                    --d.isResizing
                })
            }, jb(a).duration)
        }, setChartSize: function (a) {
            var b = this.inverted, c = this.renderer, d = this.chartWidth, e = this.chartHeight, f = this.options.chart, g = this.spacing, h = this.clipOffset, k, m, n, u;
            this.plotLeft = k = M(this.plotLeft);
            this.plotTop = m = M(this.plotTop);
            this.plotWidth = n = L(0, M(d - k - this.marginRight));
            this.plotHeight = u = L(0, M(e - m - this.marginBottom));
            this.plotSizeX = b ? u : n;
            this.plotSizeY = b ? n : u;
            this.plotBorderWidth = f.plotBorderWidth || 0;
            this.spacingBox = c.spacingBox = {x: g[3], y: g[0], width: d - g[3] - g[1], height: e - g[0] - g[2]};
            this.plotBox = c.plotBox = {x: k, y: m, width: n, height: u};
            d = 2 * ka(this.plotBorderWidth / 2);
            b = Oa(L(d, h[3]) / 2);
            c = Oa(L(d, h[0]) / 2);
            this.clipBox = {
                x: b,
                y: c,
                width: ka(this.plotSizeX - L(d, h[1]) / 2 - b),
                height: L(0, ka(this.plotSizeY - L(d, h[2]) / 2 - c))
            };
            a || C(this.axes, function (a) {
                a.setAxisSize();
                a.setAxisTranslation()
            })
        }, resetMargins: function () {
            var a = this;
            C(yb, function (b,
                            c) {
                a[b] = z(a.margin[c], a.spacing[c])
            });
            a.axisOffset = [0, 0, 0, 0];
            a.clipOffset = [0, 0, 0, 0]
        }, drawChartBox: function () {
            var a = this.options.chart, b = this.renderer, c = this.chartWidth, d = this.chartHeight, e = this.chartBackground, f = this.plotBackground, g = this.plotBorder, h = this.plotBGImage, k = a.borderWidth || 0, m = a.backgroundColor, n = a.plotBackgroundColor, u = a.plotBackgroundImage, w = a.plotBorderWidth || 0, A, G = this.plotLeft, l = this.plotTop, v = this.plotWidth, q = this.plotHeight, E = this.plotBox, p = this.clipRect, z = this.clipBox;
            A = k + (a.shadow ?
                    8 : 0);
            if (k || m)e ? e.animate(e.crisp({
                width: c - A,
                height: d - A
            })) : (e = {fill: m || "none"}, k && (e.stroke = a.borderColor, e["stroke-width"] = k), this.chartBackground = b.rect(A / 2, A / 2, c - A, d - A, a.borderRadius, k).attr(e).addClass("highcharts-background").add().shadow(a.shadow));
            n && (f ? f.animate(E) : this.plotBackground = b.rect(G, l, v, q, 0).attr({fill: n}).add().shadow(a.plotShadow));
            u && (h ? h.animate(E) : this.plotBGImage = b.image(u, G, l, v, q).add());
            p ? p.animate({width: z.width, height: z.height}) : this.clipRect = b.clipRect(z);
            w && (g ? (g.strokeWidth = -w, g.animate(g.crisp({
                x: G,
                y: l,
                width: v,
                height: q
            }))) : this.plotBorder = b.rect(G, l, v, q, 0, -w).attr({
                stroke: a.plotBorderColor,
                "stroke-width": w,
                fill: "none",
                zIndex: 1
            }).add());
            this.isDirtyBox = !1
        }, propFromSeries: function () {
            var a = this, b = a.options.chart, c, d = a.options.series, e, f;
            C(["inverted", "angular", "polar"], function (g) {
                c = S[b.type || b.defaultSeriesType];
                f = a[g] || b[g] || c && c.prototype[g];
                for (e = d && d.length; !f && e--;)(c = S[d[e].type]) && c.prototype[g] && (f = !0);
                a[g] = f
            })
        }, linkSeries: function () {
            var a = this, b = a.series;
            C(b,
                function (a) {
                    a.linkedSeries.length = 0
                });
            C(b, function (b) {
                var d = b.options.linkedTo;
                ea(d) && (d = ":previous" === d ? a.series[b.index - 1] : a.get(d)) && (d.linkedSeries.push(b), b.linkedParent = d, b.visible = z(b.options.visible, d.options.visible, b.visible))
            })
        }, renderSeries: function () {
            C(this.series, function (a) {
                a.translate();
                a.render()
            })
        }, renderLabels: function () {
            var a = this, b = a.options.labels;
            b.items && C(b.items, function (c) {
                var d = O(b.style, c.style), e = H(d.left) + a.plotLeft, f = H(d.top) + a.plotTop + 12;
                delete d.left;
                delete d.top;
                a.renderer.text(c.html, e, f).attr({zIndex: 2}).css(d).add()
            })
        }, render: function () {
            var a = this.axes, b = this.renderer, c = this.options, d, e, f, g;
            this.setTitle();
            this.legend = new zb(this, c.legend);
            this.getStacks && this.getStacks();
            this.getMargins(!0);
            this.setChartSize();
            d = this.plotWidth;
            e = this.plotHeight -= 21;
            C(a, function (a) {
                a.setScale()
            });
            this.getAxisMargins();
            f = 1.1 < d / this.plotWidth;
            g = 1.05 < e / this.plotHeight;
            if (f || g)this.maxTicks = null, C(a, function (a) {
                (a.horiz && f || !a.horiz && g) && a.setTickInterval(!0)
            }), this.getMargins();
            this.drawChartBox();
            this.hasCartesianSeries && C(a, function (a) {
                a.visible && a.render()
            });
            this.seriesGroup || (this.seriesGroup = b.g("series-group").attr({zIndex: 3}).add());
            this.renderSeries();
            this.renderLabels();
            this.showCredits(c.credits);
            this.hasRendered = !0
        }, showCredits: function (a) {
            a.enabled && !this.credits && (this.credits = this.renderer.text(a.text, 0, 0).on("click", function () {
                a.href && (t.location.href = a.href)
            }).attr({align: a.position.align, zIndex: 8}).css(a.style).add().align(a.position))
        }, destroy: function () {
            var a =
                this, b = a.axes, c = a.series, d = a.container, e, f = d && d.parentNode;
            na(a, "destroy");
            va[a.index] = J;
            nb--;
            a.renderTo.removeAttribute("data-highcharts-chart");
            sa(a);
            for (e = b.length; e--;)b[e] = b[e].destroy();
            for (e = c.length; e--;)c[e] = c[e].destroy();
            C("title subtitle chartBackground plotBackground plotBGImage plotBorder seriesGroup clipRect credits pointer scroller rangeSelector legend resetZoomButton tooltip renderer".split(" "), function (b) {
                var c = a[b];
                c && c.destroy && (a[b] = c.destroy())
            });
            d && (d.innerHTML = "", sa(d), f &&
            Sa(d));
            for (e in a)delete a[e]
        }, isReadyToRender: function () {
            var a = this;
            return !Ba && t == t.top && "complete" !== X.readyState || Ha && !t.canvg ? (Ha ? ac.push(function () {
                a.firstRender()
            }, a.options.global.canvasToolsURL) : X.attachEvent("onreadystatechange", function () {
                X.detachEvent("onreadystatechange", a.firstRender);
                "complete" === X.readyState && a.firstRender()
            }), !1) : !0
        }, firstRender: function () {
            var a = this, b = a.options;
            if (a.isReadyToRender()) {
                a.getContainer();
                na(a, "init");
                a.resetMargins();
                a.setChartSize();
                a.propFromSeries();
                a.getAxes();
                C(b.series || [], function (b) {
                    a.initSeries(b)
                });
                a.linkSeries();
                na(a, "beforeRender");
                U.Pointer && (a.pointer = new Ya(a, b));
                a.render();
                a.renderer.draw();
                if (!a.renderer.imgCount && a.onload)a.onload();
                a.cloneRenderTo(!0)
            }
        }, onload: function () {
            var a = this;
            C([this.callback].concat(this.callbacks), function (b) {
                b && void 0 !== a.index && b.apply(a, [a])
            });
            na(a, "load");
            this.onload = null
        }, splashArray: function (a, b) {
            var c = b[a], c = R(c) ? c : [c, c, c, c];
            return [z(b[a + "Top"], c[0]), z(b[a + "Right"], c[1]), z(b[a + "Bottom"], c[2]), z(b[a +
            "Left"], c[3])]
        }
    };
    var bc = U.CenteredSeriesMixin = {
        getCenter: function () {
            var a = this.options, b = this.chart, c = 2 * (a.slicedOffset || 0), d = b.plotWidth - 2 * c, b = b.plotHeight - 2 * c, e = a.center, e = [z(e[0], "50%"), z(e[1], "50%"), a.size || "100%", a.innerSize || 0], f = W(d, b), g, h;
            for (g = 0; 4 > g; ++g)h = e[g], a = 2 > g || 2 === g && /%$/.test(h), e[g] = v(h, [d, b, f, e[2]][g]) + (a ? c : 0);
            e[3] > e[2] && (e[3] = e[2]);
            return e
        }
    }, Ja = function () {
    };
    Ja.prototype = {
        init: function (a, b, c) {
            this.series = a;
            this.color = a.color;
            this.applyOptions(b, c);
            this.pointAttr = {};
            a.options.colorByPoint &&
            (b = a.options.colors || a.chart.options.colors, this.color = this.color || b[a.colorCounter++], a.colorCounter === b.length && (a.colorCounter = 0));
            a.chart.pointCount++;
            return this
        }, applyOptions: function (a, b) {
            var c = this.series, d = c.options.pointValKey || c.pointValKey;
            a = Ja.prototype.optionsToObject.call(this, a);
            O(this, a);
            this.options = this.options ? O(this.options, a) : a;
            d && (this.y = this[d]);
            this.isNull = null === this.y;
            void 0 === this.x && c && (this.x = void 0 === b ? c.autoIncrement() : b);
            return this
        }, optionsToObject: function (a) {
            var b =
            {}, c = this.series, d = c.options.keys, e = d || c.pointArrayMap || ["y"], f = e.length, g = 0, h = 0;
            if ("number" === typeof a || null === a)b[e[0]] = a; else if (N(a))for (!d && a.length > f && (c = typeof a[0], "string" === c ? b.name = a[0] : "number" === c && (b.x = a[0]), g++); h < f;)d && void 0 === a[g] || (b[e[h]] = a[g]), g++, h++; else"object" === typeof a && (b = a, a.dataLabels && (c._hasPointLabels = !0), a.marker && (c._hasPointMarkers = !0));
            return b
        }, destroy: function () {
            var a = this.series.chart, b = a.hoverPoints, c;
            a.pointCount--;
            b && (this.setState(), p(b, this), b.length ||
            (a.hoverPoints = null));
            if (this === a.hoverPoint)this.onMouseOut();
            if (this.graphic || this.dataLabel)sa(this), this.destroyElements();
            this.legendItem && a.legend.destroyItem(this);
            for (c in this)this[c] = null
        }, destroyElements: function () {
            for (var a = ["graphic", "dataLabel", "dataLabelUpper", "connector", "shadowGroup"], b, c = 6; c--;)b = a[c], this[b] && (this[b] = this[b].destroy())
        }, getLabelConfig: function () {
            return {
                x: this.category,
                y: this.y,
                color: this.color,
                key: this.name || this.category,
                series: this.series,
                point: this,
                percentage: this.percentage,
                total: this.total || this.stackTotal
            }
        }, tooltipFormatter: function (a) {
            var b = this.series, c = b.tooltipOptions, d = z(c.valueDecimals, ""), e = c.valuePrefix || "", f = c.valueSuffix || "";
            C(b.pointArrayMap || ["y"], function (b) {
                b = "{point." + b;
                if (e || f)a = a.replace(b + "}", e + b + "}" + f);
                a = a.replace(b + "}", b + ":,." + d + "f}")
            });
            return q(a, {point: this, series: this.series})
        }, firePointEvent: function (a, b, c) {
            var d = this, e = this.series.options;
            (e.point.events[a] || d.options && d.options.events && d.options.events[a]) && this.importEvents();
            "click" === a &&
            e.allowPointSelect && (c = function (a) {
                d.select && d.select(null, a.ctrlKey || a.metaKey || a.shiftKey)
            });
            na(this, a, b, c)
        }, visible: !0
    };
    var da = U.Series = function () {
    };
    da.prototype = {
        isCartesian: !0,
        type: "line",
        pointClass: Ja,
        sorted: !0,
        requireSorting: !0,
        pointAttrToOptions: {stroke: "lineColor", "stroke-width": "lineWidth", fill: "fillColor", r: "radius"},
        directTouch: !1,
        axisTypes: ["xAxis", "yAxis"],
        colorCounter: 0,
        parallelArrays: ["x", "y"],
        init: function (a, b) {
            var c = this, d, e, f = a.series, g = function (a, b) {
                return z(a.options.index, a._i) -
                    z(b.options.index, b._i)
            };
            c.chart = a;
            c.options = b = c.setOptions(b);
            c.linkedSeries = [];
            c.bindAxes();
            O(c, {name: b.name, state: "", pointAttr: {}, visible: !1 !== b.visible, selected: !0 === b.selected});
            Ha && (b.animation = !1);
            e = b.events;
            for (d in e)aa(c, d, e[d]);
            if (e && e.click || b.point && b.point.events && b.point.events.click || b.allowPointSelect)a.runTrackerClick = !0;
            c.getColor();
            c.getSymbol();
            C(c.parallelArrays, function (a) {
                c[a + "Data"] = []
            });
            c.setData(b.data, !1);
            c.isCartesian && (a.hasCartesianSeries = !0);
            f.push(c);
            c._i = f.length -
                1;
            Z(f, g);
            this.yAxis && Z(this.yAxis.series, g);
            C(f, function (a, b) {
                a.index = b;
                a.name = a.name || "Series " + (b + 1)
            })
        },
        bindAxes: function () {
            var a = this, b = a.options, c = a.chart, d;
            C(a.axisTypes || [], function (e) {
                C(c[e], function (c) {
                    d = c.options;
                    if (b[e] === d.index || b[e] !== J && b[e] === d.id || b[e] === J && 0 === d.index)c.series.push(a), a[e] = c, c.isDirty = !0
                });
                a[e] || a.optionalAxis === e || T(18, !0)
            })
        },
        updateParallelArrays: function (a, b) {
            var c = a.series, d = arguments;
            C(c.parallelArrays, "number" === typeof b ? function (d) {
                var f = "y" === d && c.toYData ?
                    c.toYData(a) : a[d];
                c[d + "Data"][b] = f
            } : function (a) {
                Array.prototype[b].apply(c[a + "Data"], Array.prototype.slice.call(d, 2))
            })
        },
        autoIncrement: function () {
            var a = this.options, b = this.xIncrement, c, d = a.pointIntervalUnit, b = z(b, a.pointStart, 0);
            this.pointInterval = c = z(this.pointInterval, a.pointInterval, 1);
            d && (a = new xa(b), "day" === d ? a = +a[vb](a[db]() + c) : "month" === d ? a = +a[Hb](a[kb]() + c) : "year" === d && (a = +a[Ib](a[lb]() + c)), c = a - b);
            this.xIncrement = b + c;
            return b
        },
        setOptions: function (a) {
            var b = this.chart, c = b.options.plotOptions,
                b = b.userOptions || {}, d = b.plotOptions || {}, e = c[this.type];
            this.userOptions = a;
            c = x(e, c.series, a);
            this.tooltipOptions = x(pa.tooltip, pa.plotOptions[this.type].tooltip, b.tooltip, d.series && d.series.tooltip, d[this.type] && d[this.type].tooltip, a.tooltip);
            null === e.marker && delete c.marker;
            this.zoneAxis = c.zoneAxis;
            a = this.zones = (c.zones || []).slice();
            !c.negativeColor && !c.negativeFillColor || c.zones || a.push({
                value: c[this.zoneAxis + "Threshold"] || c.threshold || 0,
                color: c.negativeColor,
                fillColor: c.negativeFillColor
            });
            a.length &&
            y(a[a.length - 1].value) && a.push({color: this.color, fillColor: this.fillColor});
            return c
        },
        getCyclic: function (a, b, c) {
            var d = this.userOptions, e = "_" + a + "Index", f = a + "Counter";
            b || (y(d[e]) ? b = d[e] : (d[e] = b = this.chart[f] % c.length, this.chart[f] += 1), b = c[b]);
            this[a] = b
        },
        getColor: function () {
            this.options.colorByPoint ? this.options.color = null : this.getCyclic("color", this.options.color || ba[this.type].color, this.chart.options.colors)
        },
        getSymbol: function () {
            var a = this.options.marker;
            this.getCyclic("symbol", a.symbol, this.chart.options.symbols);
            /^url/.test(this.symbol) && (a.radius = 0)
        },
        drawLegendSymbol: rb.drawLineMarker,
        setData: function (a, b, c, d) {
            var e = this, f = e.points, g = f && f.length || 0, h, k = e.options, m = e.chart, n = null, u = e.xAxis, w = u && !!u.categories, A = k.turboThreshold, G = this.xData, l = this.yData, v = (h = e.pointArrayMap) && h.length;
            a = a || [];
            h = a.length;
            b = z(b, !0);
            if (!1 !== d && h && g === h && !e.cropped && !e.hasGroupedData && e.visible)C(a, function (a, b) {
                f[b].update && a !== k.data[b] && f[b].update(a, !1, null, !1)
            }); else {
                e.xIncrement = null;
                e.colorCounter = 0;
                C(this.parallelArrays,
                    function (a) {
                        e[a + "Data"].length = 0
                    });
                if (A && h > A) {
                    for (c = 0; null === n && c < h;)n = a[c], c++;
                    if (r(n)) {
                        w = z(k.pointStart, 0);
                        n = z(k.pointInterval, 1);
                        for (c = 0; c < h; c++)G[c] = w, l[c] = a[c], w += n;
                        e.xIncrement = w
                    } else if (N(n))if (v)for (c = 0; c < h; c++)n = a[c], G[c] = n[0], l[c] = n.slice(1, v + 1); else for (c = 0; c < h; c++)n = a[c], G[c] = n[0], l[c] = n[1]; else T(12)
                } else for (c = 0; c < h; c++)a[c] !== J && (n = {series: e}, e.pointClass.prototype.applyOptions.apply(n, [a[c]]), e.updateParallelArrays(n, c), w && y(n.name) && (u.names[n.x] = n.name));
                ea(l[0]) && T(14, !0);
                e.data =
                    [];
                e.options.data = e.userOptions.data = a;
                for (c = g; c--;)f[c] && f[c].destroy && f[c].destroy();
                u && (u.minRange = u.userMinRange);
                e.isDirty = e.isDirtyData = m.isDirtyBox = !0;
                c = !1
            }
            "point" === k.legendType && (this.processData(), this.generatePoints());
            b && m.redraw(c)
        },
        processData: function (a) {
            var b = this.xData, c = this.yData, d = b.length, e;
            e = 0;
            var f, g, h = this.xAxis, k, m = this.options;
            k = m.cropThreshold;
            var n = this.getExtremesFromAll || m.getExtremesFromAll, u = this.isCartesian, m = h && h.val2lin, w = h && h.isLog, A, G;
            if (u && !this.isDirty && !h.isDirty && !this.yAxis.isDirty && !a)return !1;
            h && (a = h.getExtremes(), A = a.min, G = a.max);
            if (u && this.sorted && !n && (!k || d > k || this.forceCrop))if (b[d - 1] < A || b[0] > G)b = [], c = []; else if (b[0] < A || b[d - 1] > G)e = this.cropData(this.xData, this.yData, A, G), b = e.xData, c = e.yData, e = e.start, f = !0;
            for (k = b.length || 1; --k;)d = w ? m(b[k]) - m(b[k - 1]) : b[k] - b[k - 1], 0 < d && (g === J || d < g) ? g = d : 0 > d && this.requireSorting && T(15);
            this.cropped = f;
            this.cropStart = e;
            this.processedXData = b;
            this.processedYData = c;
            this.closestPointRange = g
        },
        cropData: function (a, b, c, d) {
            var e = a.length,
                f = 0, g = e, h = z(this.cropShoulder, 1), k;
            for (k = 0; k < e; k++)if (a[k] >= c) {
                f = L(0, k - h);
                break
            }
            for (c = k; c < e; c++)if (a[c] > d) {
                g = c + h;
                break
            }
            return {xData: a.slice(f, g), yData: b.slice(f, g), start: f, end: g}
        },
        generatePoints: function () {
            var a = this.options.data, b = this.data, c, d = this.processedXData, e = this.processedYData, f = this.pointClass, g = d.length, h = this.cropStart || 0, k, m = this.hasGroupedData, n, u = [], w;
            b || m || (b = [], b.length = a.length, b = this.data = b);
            for (w = 0; w < g; w++)k = h + w, m ? (u[w] = (new f).init(this, [d[w]].concat(B(e[w]))), u[w].dataGroup =
                this.groupMap[w]) : (b[k] ? n = b[k] : a[k] !== J && (b[k] = n = (new f).init(this, a[k], d[w])), u[w] = n), u[w].index = k;
            if (b && (g !== (c = b.length) || m))for (w = 0; w < c; w++)w !== h || m || (w += g), b[w] && (b[w].destroyElements(), b[w].plotX = J);
            this.data = b;
            this.points = u
        },
        getExtremes: function (a) {
            var b = this.yAxis, c = this.processedXData, d, e = [], f = 0;
            d = this.xAxis.getExtremes();
            var g = d.min, h = d.max, k, m, n, u;
            a = a || this.stackedYData || this.processedYData;
            d = a.length;
            for (u = 0; u < d; u++)if (m = c[u], n = a[u], k = null !== n && n !== J && (!b.isLog || n.length || 0 < n), m = this.getExtremesFromAll ||
                    this.options.getExtremesFromAll || this.cropped || (c[u + 1] || m) >= g && (c[u - 1] || m) <= h, k && m)if (k = n.length)for (; k--;)null !== n[k] && (e[f++] = n[k]); else e[f++] = n;
            this.dataMin = Y(e);
            this.dataMax = ya(e)
        },
        translate: function () {
            this.processedXData || this.processData();
            this.generatePoints();
            for (var a = this.options, b = a.stacking, c = this.xAxis, d = c.categories, e = this.yAxis, f = this.points, g = f.length, h = !!this.modifyValue, k = a.pointPlacement, m = "between" === k || r(k), n = a.threshold, u = a.startFromThreshold ? n : 0, w, A, G, l, v = Number.MAX_VALUE,
                     a = 0; a < g; a++) {
                var q = f[a], E = q.x, p = q.y;
                A = q.low;
                var t = b && e.stacks[(this.negStacks && p < (u ? 0 : n) ? "-" : "") + this.stackKey];
                e.isLog && null !== p && 0 >= p && (q.y = p = null, T(10));
                q.plotX = w = W(L(-1E5, c.translate(E, 0, 0, 0, 1, k, "flags" === this.type)), 1E5);
                b && this.visible && !q.isNull && t && t[E] && (l = this.getStackIndicator(l, E, this.index), t = t[E], p = t.points[l.key], A = p[0], p = p[1], A === u && (A = z(n, e.min)), e.isLog && 0 >= A && (A = null), q.total = q.stackTotal = t.total, q.percentage = t.total && q.y / t.total * 100, q.stackY = p, t.setOffset(this.pointXOffset || 0,
                    this.barW || 0));
                q.yBottom = y(A) ? e.translate(A, 0, 1, 0, 1) : null;
                h && (p = this.modifyValue(p, q));
                q.plotY = A = "number" === typeof p && Infinity !== p ? W(L(-1E5, e.translate(p, 0, 1, 0, 1)), 1E5) : J;
                q.isInside = A !== J && 0 <= A && A <= e.len && 0 <= w && w <= c.len;
                q.clientX = m ? c.translate(E, 0, 0, 0, 1) : w;
                q.negative = q.y < (n || 0);
                q.category = d && d[q.x] !== J ? d[q.x] : q.x;
                q.isNull || (void 0 !== G && (v = W(v, ra(w - G))), G = w)
            }
            this.closestPointRangePx = v
        },
        getValidPoints: function (a, b) {
            var c = this.chart;
            return Wa(a || this.points || [], function (a) {
                return b && !c.isInsidePlot(a.plotX,
                    a.plotY, c.inverted) ? !1 : !a.isNull
            })
        },
        setClip: function (a) {
            var b = this.chart, c = this.options, d = b.renderer, e = b.inverted, f = this.clipBox, g = f || b.clipBox, h = this.sharedClipKey || ["_sharedClip", a && a.duration, a && a.easing, g.height, c.xAxis, c.yAxis].join(), k = b[h], m = b[h + "m"];
            k || (a && (g.width = 0, b[h + "m"] = m = d.clipRect(-99, e ? -b.plotLeft : -b.plotTop, 99, e ? b.chartWidth : b.chartHeight)), b[h] = k = d.clipRect(g));
            a && (k.count += 1);
            !1 !== c.clip && (this.group.clip(a || f ? k : b.clipRect), this.markerGroup.clip(m), this.sharedClipKey = h);
            a || (--k.count,
            0 >= k.count && h && b[h] && (f || (b[h] = b[h].destroy()), b[h + "m"] && (b[h + "m"] = b[h + "m"].destroy())))
        },
        animate: function (a) {
            var b = this.chart, c = this.options.animation, d;
            c && !R(c) && (c = ba[this.type].animation);
            a ? this.setClip(c) : (d = this.sharedClipKey, (a = b[d]) && a.animate({width: b.plotSizeX}, c), b[d + "m"] && b[d + "m"].animate({width: b.plotSizeX + 99}, c), this.animate = null)
        },
        afterAnimate: function () {
            this.setClip();
            na(this, "afterAnimate")
        },
        drawPoints: function () {
            var a, b = this.points, c = this.chart, d, e, f, g, h, k, m, n, u = this.options.marker,
                w = this.pointAttr[""], A, G, l, q = this.markerGroup, v = z(u.enabled, this.xAxis.isRadial, this.closestPointRangePx > 2 * u.radius);
            if (!1 !== u.enabled || this._hasPointMarkers)for (f = b.length; f--;)g = b[f], d = ka(g.plotX), e = g.plotY, n = g.graphic, A = g.marker || {}, G = !!g.marker, a = v && A.enabled === J || A.enabled, l = g.isInside, a && e !== J && !isNaN(e) && null !== g.y ? (a = g.pointAttr[g.selected ? "select" : ""] || w, h = a.r, k = z(A.symbol, this.symbol), m = 0 === k.indexOf("url"), n ? n[l ? "show" : "hide"](!0).attr(a).animate(O({
                x: d - h,
                y: e - h
            }, n.symbolName ? {
                width: 2 * h,
                height: 2 * h
            } : {})) : l && (0 < h || m) && (g.graphic = c.renderer.symbol(k, d - h, e - h, 2 * h, 2 * h, G ? A : u).attr(a).add(q))) : n && (g.graphic = n.destroy())
        },
        convertAttribs: function (a, b, c, d) {
            var e = this.pointAttrToOptions, f, g, h = {};
            a = a || {};
            b = b || {};
            c = c || {};
            d = d || {};
            for (f in e)g = e[f], h[f] = z(a[g], b[f], c[f], d[f]);
            return h
        },
        getAttribs: function () {
            var a = this, b = a.options, c = ba[a.type].marker ? b.marker : b, d = c.states, e = d.hover, f, g = a.color, h = a.options.negativeColor;
            f = {stroke: g, fill: g};
            var k = a.points || [], m, n, u = [], w = a.pointAttrToOptions;
            m = a.hasPointSpecificOptions;
            var A = c.lineColor, G = c.fillColor;
            n = b.turboThreshold;
            var l = a.zones, q = a.zoneAxis || "y", v;
            b.marker ? (e.radius = e.radius || c.radius + e.radiusPlus, e.lineWidth = e.lineWidth || c.lineWidth + e.lineWidthPlus) : (e.color = e.color || ha(e.color || g).brighten(e.brightness).get(), e.negativeColor = e.negativeColor || ha(e.negativeColor || h).brighten(e.brightness).get());
            u[""] = a.convertAttribs(c, f);
            C(["hover", "select"], function (b) {
                u[b] = a.convertAttribs(d[b], u[""])
            });
            a.pointAttr = u;
            g = k.length;
            if (!n || g < n || m)for (; g--;) {
                n = k[g];
                (c = n.options &&
                    n.options.marker || n.options) && !1 === c.enabled && (c.radius = 0);
                if (l.length) {
                    m = 0;
                    for (f = l[m]; n[q] >= f.value;)f = l[++m];
                    n.color = n.fillColor = z(f.color, a.color)
                }
                m = b.colorByPoint || n.color;
                if (n.options)for (v in w)y(c[w[v]]) && (m = !0);
                if (m) {
                    c = c || {};
                    m = [];
                    d = c.states || {};
                    f = d.hover = d.hover || {};
                    if (!b.marker || n.negative && !f.fillColor && !e.fillColor)f[a.pointAttrToOptions.fill] = f.color || !n.options.color && e[n.negative && h ? "negativeColor" : "color"] || ha(n.color).brighten(f.brightness || e.brightness).get();
                    f = {color: n.color};
                    G ||
                    (f.fillColor = n.color);
                    A || (f.lineColor = n.color);
                    c.hasOwnProperty("color") && !c.color && delete c.color;
                    m[""] = a.convertAttribs(O(f, c), u[""]);
                    m.hover = a.convertAttribs(d.hover, u.hover, m[""]);
                    m.select = a.convertAttribs(d.select, u.select, m[""])
                } else m = u;
                n.pointAttr = m
            }
        },
        destroy: function () {
            var a = this, b = a.chart, c = /AppleWebKit\/533/.test(Ta), d, e = a.data || [], f, g, h;
            na(a, "destroy");
            sa(a);
            C(a.axisTypes || [], function (b) {
                if (h = a[b])p(h.series, a), h.isDirty = h.forceRedraw = !0
            });
            a.legendItem && a.chart.legend.destroyItem(a);
            for (d =
                     e.length; d--;)(f = e[d]) && f.destroy && f.destroy();
            a.points = null;
            clearTimeout(a.animationTimeout);
            for (g in a)a[g]instanceof ja && !a[g].survive && (d = c && "group" === g ? "hide" : "destroy", a[g][d]());
            b.hoverSeries === a && (b.hoverSeries = null);
            p(b.series, a);
            for (g in a)delete a[g]
        },
        getGraphPath: function (a, b, c) {
            var d = this, e = d.options, f = e.step, g, h = [], k;
            a = a || d.points;
            (g = a.reversed) && a.reverse();
            (f = {right: 1, center: 2}[f] || f && 3) && g && (f = 4 - f);
            !e.connectNulls || b || c || (a = this.getValidPoints(a));
            C(a, function (g, n) {
                var u = g.plotX,
                    w = g.plotY, A = a[n - 1];
                (g.leftCliff || A && A.rightCliff) && !c && (k = !0);
                g.isNull && !y(b) && 0 < n ? k = !e.connectNulls : g.isNull && !b ? k = !0 : (0 === n || k ? A = ["M", g.plotX, g.plotY] : d.getPointSpline ? A = d.getPointSpline(a, g, n) : f ? (A = 1 === f ? ["L", A.plotX, w] : 2 === f ? ["L", (A.plotX + u) / 2, A.plotY, "L", (A.plotX + u) / 2, w] : ["L", u, A.plotY], A.push("L", u, w)) : A = ["L", u, w], h.push.apply(h, A), k = !1)
            });
            return d.graphPath = h
        },
        drawGraph: function () {
            var a = this, b = this.options, c = [["graph", b.lineColor || this.color, b.dashStyle]], d = b.lineWidth, e = "square" !== b.linecap,
                f = (this.gappedPath || this.getGraphPath).call(this), g = this.fillGraph && this.color || "none";
            C(this.zones, function (d, e) {
                c.push(["zoneGraph" + e, d.color || a.color, d.dashStyle || b.dashStyle])
            });
            C(c, function (c, k) {
                var m = c[0], n = a[m];
                n ? n.animate({d: f}) : (d || g) && f.length && (n = {
                    stroke: c[1],
                    "stroke-width": d,
                    fill: g,
                    zIndex: 1
                }, c[2] ? n.dashstyle = c[2] : e && (n["stroke-linecap"] = n["stroke-linejoin"] = "round"), a[m] = a.chart.renderer.path(f).attr(n).add(a.group).shadow(2 > k && b.shadow))
            })
        },
        applyZones: function () {
            var a = this, b = this.chart,
                c = b.renderer, d = this.zones, e, f, g = this.clips || [], h, k = this.graph, m = this.area, n = L(b.chartWidth, b.chartHeight), u = this[(this.zoneAxis || "y") + "Axis"], w, A = u.reversed, G = b.inverted, l = u.horiz, q, v, p, E = !1;
            d.length && (k || m) && u.min !== J && (k && k.hide(), m && m.hide(), w = u.getExtremes(), C(d, function (d, r) {
                e = A ? l ? b.plotWidth : 0 : l ? 0 : u.toPixels(w.min);
                e = W(L(z(f, e), 0), n);
                f = W(L(M(u.toPixels(z(d.value, w.max), !0)), 0), n);
                E && (e = f = u.toPixels(w.max));
                q = Math.abs(e - f);
                v = W(e, f);
                p = L(e, f);
                u.isXAxis ? (h = {x: G ? p : v, y: 0, width: q, height: n}, l || (h.x =
                    b.plotHeight - h.x)) : (h = {
                    x: 0,
                    y: G ? p : v,
                    width: n,
                    height: q
                }, l && (h.y = b.plotWidth - h.y));
                b.inverted && c.isVML && (h = u.isXAxis ? {
                    x: 0,
                    y: A ? v : p,
                    height: h.width,
                    width: b.chartWidth
                } : {x: h.y - b.plotLeft - b.spacingBox.x, y: 0, width: h.height, height: b.chartHeight});
                g[r] ? g[r].animate(h) : (g[r] = c.clipRect(h), k && a["zoneGraph" + r].clip(g[r]), m && a["zoneArea" + r].clip(g[r]));
                E = d.value > w.max
            }), this.clips = g)
        },
        invertGroups: function () {
            function a() {
                var a = {width: b.yAxis.len, height: b.xAxis.len};
                C(["group", "markerGroup"], function (c) {
                    b[c] && b[c].attr(a).invert()
                })
            }

            var b = this, c = b.chart;
            b.xAxis && (aa(c, "resize", a), aa(b, "destroy", function () {
                sa(c, "resize", a)
            }), a(), b.invertGroups = a)
        },
        plotGroup: function (a, b, c, d, e) {
            var f = this[a], g = !f;
            g && (this[a] = f = this.chart.renderer.g(b).attr({zIndex: d || .1}).add(e), f.addClass("highcharts-series-" + this.index));
            f.attr({visibility: c})[g ? "attr" : "animate"](this.getPlotBox());
            return f
        },
        getPlotBox: function () {
            var a = this.chart, b = this.xAxis, c = this.yAxis;
            a.inverted && (b = c, c = this.xAxis);
            return {
                translateX: b ? b.left : a.plotLeft, translateY: c ? c.top :
                    a.plotTop, scaleX: 1, scaleY: 1
            }
        },
        render: function () {
            var a = this, b = a.chart, c, d = a.options, e = !!a.animate && b.renderer.isSVG && jb(d.animation).duration, f = a.visible ? "inherit" : "hidden", g = d.zIndex, h = a.hasRendered, k = b.seriesGroup;
            c = a.plotGroup("group", "series", f, g, k);
            a.markerGroup = a.plotGroup("markerGroup", "markers", f, g, k);
            e && a.animate(!0);
            a.getAttribs();
            c.inverted = a.isCartesian ? b.inverted : !1;
            a.drawGraph && (a.drawGraph(), a.applyZones());
            C(a.points, function (a) {
                a.redraw && a.redraw()
            });
            a.drawDataLabels && a.drawDataLabels();
            a.visible && a.drawPoints();
            a.drawTracker && !1 !== a.options.enableMouseTracking && a.drawTracker();
            b.inverted && a.invertGroups();
            !1 === d.clip || a.sharedClipKey || h || c.clip(b.clipRect);
            e && a.animate();
            h || (a.animationTimeout = D(function () {
                a.afterAnimate()
            }, e));
            a.isDirty = a.isDirtyData = !1;
            a.hasRendered = !0
        },
        redraw: function () {
            var a = this.chart, b = this.isDirtyData, c = this.isDirty, d = this.group, e = this.xAxis, f = this.yAxis;
            d && (a.inverted && d.attr({width: a.plotWidth, height: a.plotHeight}), d.animate({
                translateX: z(e && e.left, a.plotLeft),
                translateY: z(f && f.top, a.plotTop)
            }));
            this.translate();
            this.render();
            b && na(this, "updatedData");
            (c || b) && delete this.kdTree
        },
        kdDimensions: 1,
        kdAxisArray: ["clientX", "plotY"],
        searchPoint: function (a, b) {
            var c = this.xAxis, d = this.yAxis, e = this.chart.inverted;
            return this.searchKDTree({
                clientX: e ? c.len - a.chartY + c.pos : a.chartX - c.pos,
                plotY: e ? d.len - a.chartX + d.pos : a.chartY - d.pos
            }, b)
        },
        buildKDTree: function () {
            function a(c, e, f) {
                var g, h;
                if (h = c && c.length)return g = b.kdAxisArray[e % f], c.sort(function (a, b) {
                    return a[g] - b[g]
                }),
                    h = Math.floor(h / 2), {
                    point: c[h],
                    left: a(c.slice(0, h), e + 1, f),
                    right: a(c.slice(h + 1), e + 1, f)
                }
            }

            var b = this, c = b.kdDimensions;
            delete b.kdTree;
            D(function () {
                b.kdTree = a(b.getValidPoints(null, !b.directTouch), c, c)
            }, b.options.kdNow ? 0 : 1)
        },
        searchKDTree: function (a, b) {
            function c(a, b, m, n) {
                var u = b.point, w = d.kdAxisArray[m % n], A, G, l = u;
                G = y(a[e]) && y(u[e]) ? Math.pow(a[e] - u[e], 2) : null;
                A = y(a[f]) && y(u[f]) ? Math.pow(a[f] - u[f], 2) : null;
                A = (G || 0) + (A || 0);
                u.dist = y(A) ? Math.sqrt(A) : Number.MAX_VALUE;
                u.distX = y(G) ? Math.sqrt(G) : Number.MAX_VALUE;
                w = a[w] - u[w];
                A = 0 > w ? "left" : "right";
                G = 0 > w ? "right" : "left";
                b[A] && (A = c(a, b[A], m + 1, n), l = A[g] < l[g] ? A : u);
                b[G] && Math.sqrt(w * w) < l[g] && (a = c(a, b[G], m + 1, n), l = a[g] < l[g] ? a : l);
                return l
            }

            var d = this, e = this.kdAxisArray[0], f = this.kdAxisArray[1], g = b ? "distX" : "dist";
            this.kdTree || this.buildKDTree();
            if (this.kdTree)return c(a, this.kdTree, this.kdDimensions, this.kdDimensions)
        }
    };
    $a.prototype = {
        destroy: function () {
            la(this, this.axis)
        }, render: function (a) {
            var b = this.options, c = b.format, c = c ? q(c, this) : b.formatter.call(this);
            this.label ?
                this.label.attr({
                    text: c,
                    visibility: "hidden"
                }) : this.label = this.axis.chart.renderer.text(c, null, null, b.useHTML).css(b.style).attr({
                align: this.textAlign,
                rotation: b.rotation,
                visibility: "hidden"
            }).add(a)
        }, setOffset: function (a, b) {
            var c = this.axis, d = c.chart, e = d.inverted, f = c.reversed, f = this.isNegative && !f || !this.isNegative && f, g = c.translate(c.usePercentage ? 100 : this.total, 0, 0, 0, 1), c = c.translate(0), c = ra(g - c), h = d.xAxis[0].translate(this.x) + a, k = d.plotHeight, f = {
                x: e ? f ? g : g - c : h, y: e ? k - h - b : f ? k - g - c : k - g, width: e ? c : b, height: e ?
                    b : c
            };
            if (e = this.label)e.align(this.alignOptions, null, f), f = e.alignAttr, e[!1 === this.options.crop || d.isInsidePlot(f.x, f.y) ? "show" : "hide"](!0)
        }
    };
    Na.prototype.getStacks = function () {
        var a = this;
        C(a.yAxis, function (a) {
            a.stacks && a.hasVisibleSeries && (a.oldStacks = a.stacks)
        });
        C(a.series, function (b) {
            !b.options.stacking || !0 !== b.visible && !1 !== a.options.chart.ignoreHiddenSeries || (b.stackKey = b.type + z(b.options.stack, ""))
        })
    };
    ga.prototype.buildStacks = function () {
        var a = this.series, b, c = z(this.options.reversedStacks, !0), d =
            a.length, e;
        if (!this.isXAxis) {
            this.usePercentage = !1;
            for (e = d; e--;)a[c ? e : d - e - 1].setStackedPoints();
            for (e = d; e--;)b = a[c ? e : d - e - 1], b.setStackCliffs && b.setStackCliffs();
            if (this.usePercentage)for (e = 0; e < d; e++)a[e].setPercentStacks()
        }
    };
    ga.prototype.renderStackTotals = function () {
        var a = this.chart, b = a.renderer, c = this.stacks, d, e, f = this.stackTotalGroup;
        f || (this.stackTotalGroup = f = b.g("stack-labels").attr({visibility: "visible", zIndex: 6}).add());
        f.translate(a.plotLeft, a.plotTop);
        for (d in c)for (e in a = c[d], a)a[e].render(f)
    };
    ga.prototype.resetStacks = function () {
        var a = this.stacks, b, c;
        if (!this.isXAxis)for (b in a)for (c in a[b])a[b][c].touched < this.stacksTouched ? (a[b][c].destroy(), delete a[b][c]) : (a[b][c].total = null, a[b][c].cum = 0)
    };
    ga.prototype.cleanStacks = function () {
        var a, b, c;
        if (!this.isXAxis)for (b in this.oldStacks && (a = this.stacks = this.oldStacks), a)for (c in a[b])a[b][c].cum = a[b][c].total
    };
    da.prototype.setStackedPoints = function () {
        if (this.options.stacking && (!0 === this.visible || !1 === this.chart.options.chart.ignoreHiddenSeries)) {
            var a =
                this.processedXData, b = this.processedYData, c = [], d = b.length, e = this.options, f = e.threshold, g = e.startFromThreshold ? f : 0, h = e.stack, e = e.stacking, k = this.stackKey, m = "-" + k, n = this.negStacks, u = this.yAxis, w = u.stacks, A = u.oldStacks, G, l, q, v, p, E, r;
            u.stacksTouched += 1;
            for (p = 0; p < d; p++)E = a[p], r = b[p], G = this.getStackIndicator(G, E, this.index), v = G.key, q = (l = n && r < (g ? 0 : f)) ? m : k, w[q] || (w[q] = {}), w[q][E] || (A[q] && A[q][E] ? (w[q][E] = A[q][E], w[q][E].total = null) : w[q][E] = new $a(u, u.options.stackLabels, l, E, h)), q = w[q][E], null !== r && (q.points[v] =
                q.points[this.index] = [z(q.cum, g)], q.touched = u.stacksTouched, 0 < G.index && !1 === this.singleStacks && (q.points[v][0] = q.points[this.index + "," + E + ",0"][0])), "percent" === e ? (l = l ? k : m, n && w[l] && w[l][E] ? (l = w[l][E], q.total = l.total = L(l.total, q.total) + ra(r) || 0) : q.total = ta(q.total + (ra(r) || 0))) : q.total = ta(q.total + (r || 0)), q.cum = z(q.cum, g) + (r || 0), null !== r && (q.points[v].push(q.cum), c[p] = q.cum);
            "percent" === e && (u.usePercentage = !0);
            this.stackedYData = c;
            u.oldStacks = {}
        }
    };
    da.prototype.setPercentStacks = function () {
        var a = this, b =
            a.stackKey, c = a.yAxis.stacks, d = a.processedXData, e;
        C([b, "-" + b], function (b) {
            for (var g = d.length, h, k; g--;)if (h = d[g], e = a.getStackIndicator(e, h, a.index), h = (k = c[b] && c[b][h]) && k.points[e.key])k = k.total ? 100 / k.total : 0, h[0] = ta(h[0] * k), h[1] = ta(h[1] * k), a.stackedYData[g] = h[1]
        })
    };
    da.prototype.getStackIndicator = function (a, b, c) {
        y(a) && a.x === b ? a.index++ : a = {x: b, index: 0};
        a.key = [c, b, a.index].join();
        return a
    };
    O(Na.prototype, {
        addSeries: function (a, b, c) {
            var d, e = this;
            a && (b = z(b, !0), na(e, "addSeries", {options: a}, function () {
                d = e.initSeries(a);
                e.isDirtyLegend = !0;
                e.linkSeries();
                b && e.redraw(c)
            }));
            return d
        }, addAxis: function (a, b, c, d) {
            var e = b ? "xAxis" : "yAxis", f = this.options;
            a = x(a, {index: this[e].length, isX: b});
            new ga(this, a);
            f[e] = B(f[e] || {});
            f[e].push(a);
            z(c, !0) && this.redraw(d)
        }, showLoading: function (a) {
            var b = this, c = b.options, d = b.loadingDiv, e = c.loading, f = function () {
                d && F(d, {
                    left: b.plotLeft + "px",
                    top: b.plotTop + "px",
                    width: b.plotWidth + "px",
                    height: b.plotHeight + "px"
                })
            };
            d || (b.loadingDiv = d = ia("div", {className: "highcharts-loading"}, O(e.style, {
                zIndex: 10,
                display: "none"
            }), b.container), b.loadingSpan = ia("span", null, e.labelStyle, d), aa(b, "redraw", f));
            b.loadingSpan.innerHTML = a || c.lang.loading;
            b.loadingShown || (F(d, {
                opacity: 0,
                display: ""
            }), hb(d, {opacity: e.style.opacity}, {duration: e.showDuration || 0}), b.loadingShown = !0);
            f()
        }, hideLoading: function () {
            var a = this.options, b = this.loadingDiv;
            b && hb(b, {opacity: 0}, {
                duration: a.loading.hideDuration || 100, complete: function () {
                    F(b, {display: "none"})
                }
            });
            this.loadingShown = !1
        }
    });
    O(Ja.prototype, {
        update: function (a, b, c, d) {
            function e() {
                f.applyOptions(a);
                null === f.y && h && (f.graphic = h.destroy());
                R(a) && !N(a) && (f.redraw = function () {
                    h && h.element && a && a.marker && a.marker.symbol && (f.graphic = h.destroy());
                    a && a.dataLabels && f.dataLabel && (f.dataLabel = f.dataLabel.destroy());
                    f.redraw = null
                });
                k = f.index;
                g.updateParallelArrays(f, k);
                u && f.name && (u[f.x] = f.name);
                n.data[k] = R(n.data[k]) && !N(n.data[k]) ? f.options : a;
                g.isDirty = g.isDirtyData = !0;
                !g.fixedBox && g.hasCartesianSeries && (m.isDirtyBox = !0);
                "point" === n.legendType && (m.isDirtyLegend = !0);
                b && m.redraw(c)
            }

            var f = this, g = f.series, h =
                f.graphic, k, m = g.chart, n = g.options, u = g.xAxis && g.xAxis.names;
            b = z(b, !0);
            !1 === d ? e() : f.firePointEvent("update", {options: a}, e)
        }, remove: function (a, b) {
            this.series.removePoint(Ia(this, this.series.data), a, b)
        }
    });
    O(da.prototype, {
        addPoint: function (a, b, c, d) {
            var e = this, f = e.options, g = e.data, h = e.graph, k = e.area, m = e.chart, n = e.xAxis && e.xAxis.names, u = h && h.shift || 0, w = ["graph", "area"], h = f.data, A, l = e.xData;
            za(d, m);
            if (c) {
                for (d = e.zones.length; d--;)w.push("zoneGraph" + d, "zoneArea" + d);
                C(w, function (a) {
                    e[a] && (e[a].shift = u + (f.step ?
                            2 : 1))
                })
            }
            k && (k.isArea = !0);
            b = z(b, !0);
            k = {series: e};
            e.pointClass.prototype.applyOptions.apply(k, [a]);
            w = k.x;
            d = l.length;
            if (e.requireSorting && w < l[d - 1])for (A = !0; d && l[d - 1] > w;)d--;
            e.updateParallelArrays(k, "splice", d, 0, 0);
            e.updateParallelArrays(k, d);
            n && k.name && (n[w] = k.name);
            h.splice(d, 0, a);
            A && (e.data.splice(d, 0, null), e.processData());
            "point" === f.legendType && e.generatePoints();
            c && (g[0] && g[0].remove ? g[0].remove(!1) : (g.shift(), e.updateParallelArrays(k, "shift"), h.shift()));
            e.isDirty = !0;
            e.isDirtyData = !0;
            b && (e.getAttribs(),
                m.redraw())
        }, removePoint: function (a, b, c) {
            var d = this, e = d.data, f = e[a], g = d.points, h = d.chart, k = function () {
                g && g.length === e.length && g.splice(a, 1);
                e.splice(a, 1);
                d.options.data.splice(a, 1);
                d.updateParallelArrays(f || {series: d}, "splice", a, 1);
                f && f.destroy();
                d.isDirty = !0;
                d.isDirtyData = !0;
                b && h.redraw()
            };
            za(c, h);
            b = z(b, !0);
            f ? f.firePointEvent("remove", null, k) : k()
        }, remove: function (a, b) {
            var c = this, d = c.chart;
            na(c, "remove", null, function () {
                c.destroy();
                d.isDirtyLegend = d.isDirtyBox = !0;
                d.linkSeries();
                z(a, !0) && d.redraw(b)
            })
        },
        update: function (a, b) {
            var c = this, d = this.chart, e = this.userOptions, f = this.type, g = S[f].prototype, h = ["group", "markerGroup", "dataLabelsGroup"], k;
            if (a.type && a.type !== f || void 0 !== a.zIndex)h.length = 0;
            C(h, function (a) {
                h[a] = c[a];
                delete c[a]
            });
            a = x(e, {animation: !1, index: this.index, pointStart: this.xData[0]}, {data: this.options.data}, a);
            this.remove(!1);
            for (k in g)this[k] = J;
            O(this, S[a.type || f].prototype);
            C(h, function (a) {
                c[a] = h[a]
            });
            this.init(d, a);
            d.linkSeries();
            z(b, !0) && d.redraw(!1)
        }
    });
    O(ga.prototype, {
        update: function (a,
                          b) {
            var c = this.chart;
            a = c.options[this.coll][this.options.index] = x(this.userOptions, a);
            this.destroy(!0);
            this._addedPlotLB = this.chart._labelPanes = J;
            this.init(c, O(a, {events: J}));
            c.isDirtyBox = !0;
            z(b, !0) && c.redraw()
        }, remove: function (a) {
            for (var b = this.chart, c = this.coll, d = this.series, e = d.length; e--;)d[e] && d[e].remove(!1);
            p(b.axes, this);
            p(b[c], this);
            b.options[c].splice(this.options.index, 1);
            C(b[c], function (a, b) {
                a.options.index = b
            });
            this.destroy();
            b.isDirtyBox = !0;
            z(a, !0) && b.redraw()
        }, setTitle: function (a, b) {
            this.update({title: a},
                b)
        }, setCategories: function (a, b) {
            this.update({categories: a}, b)
        }
    });
    var oc = I(da);
    S.line = oc;
    ba.area = x(ob, {softThreshold: !1, threshold: 0});
    var cc = I(da, {
        type: "area", singleStacks: !1, getStackPoints: function () {
            var a = [], b = [], c = this.xAxis, d = this.yAxis, e = d.stacks[this.stackKey], f = {}, g = this.points, h = this.index, k = d.series, m = k.length, n, u = z(d.options.reversedStacks, !0) ? 1 : -1, w, A;
            if (this.options.stacking) {
                for (w = 0; w < g.length; w++)f[g[w].x] = g[w];
                for (A in e)null !== e[A].total && b.push(A);
                b.sort(function (a, b) {
                    return a - b
                });
                n = Ea(k, function () {
                    return this.visible
                });
                C(b, function (g, k) {
                    var A = 0, l, q;
                    if (f[g] && !f[g].isNull)a.push(f[g]), C([-1, 1], function (a) {
                        var c = 1 === a ? "rightNull" : "leftNull", d = 0, A = e[b[k + a]];
                        if (A)for (w = h; 0 <= w && w < m;)l = A.points[w], l || (w === h ? f[g][c] = !0 : n[w] && (q = e[g].points[w]) && (d -= q[1] - q[0])), w += u;
                        f[g][1 === a ? "rightCliff" : "leftCliff"] = d
                    }); else {
                        for (w = h; 0 <= w && w < m;) {
                            if (l = e[g].points[w]) {
                                A = l[1];
                                break
                            }
                            w += u
                        }
                        A = d.toPixels(A, !0);
                        a.push({isNull: !0, plotX: c.toPixels(g, !0), plotY: A, yBottom: A})
                    }
                })
            }
            return a
        }, getGraphPath: function (a) {
            var b =
                da.prototype.getGraphPath, c = this.options, d = c.stacking, e = this.yAxis, f, g, h = [], k = [], m = this.index, n, u = e.stacks[this.stackKey], w = c.threshold, A = e.getThreshold(c.threshold), l, c = c.connectNulls || "percent" === d, q = function (b, c, f) {
                var g = a[b];
                b = d && u[g.x].points[m];
                var l = g[f + "Null"] || 0;
                f = g[f + "Cliff"] || 0;
                var G, q, g = !0;
                f || l ? (G = (l ? b[0] : b[1]) + f, q = b[0] + f, g = !!l) : !d && a[c] && a[c].isNull && (G = q = w);
                void 0 !== G && (k.push({
                    plotX: n,
                    plotY: null === G ? A : e.getThreshold(G),
                    isNull: g
                }), h.push({plotX: n, plotY: null === q ? A : e.getThreshold(q)}))
            };
            a = a || this.points;
            d && (a = this.getStackPoints());
            for (f = 0; f < a.length; f++)if (g = a[f].isNull, n = z(a[f].rectPlotX, a[f].plotX), l = z(a[f].yBottom, A), !g || c)c || q(f, f - 1, "left"), g && !d && c || (k.push(a[f]), h.push({
                x: f,
                plotX: n,
                plotY: l
            })), c || q(f, f + 1, "right");
            f = b.call(this, k, !0, !0);
            h.reversed = !0;
            g = b.call(this, h, !0, !0);
            g.length && (g[0] = "L");
            f = f.concat(g);
            b = b.call(this, k, !1, c);
            this.areaPath = f;
            return b
        }, drawGraph: function () {
            this.areaPath = [];
            da.prototype.drawGraph.apply(this);
            var a = this, b = this.areaPath, c = this.options, d = [["area",
                this.color, c.fillColor]];
            C(this.zones, function (b, f) {
                d.push(["zoneArea" + f, b.color || a.color, b.fillColor || c.fillColor])
            });
            C(d, function (d) {
                var f = d[0], g = a[f];
                g ? g.animate({d: b}) : (g = {
                    fill: d[2] || d[1],
                    zIndex: 0
                }, d[2] || (g["fill-opacity"] = z(c.fillOpacity, .75)), a[f] = a.chart.renderer.path(b).attr(g).add(a.group))
            })
        }, drawLegendSymbol: rb.drawRectangle
    });
    S.area = cc;
    ba.spline = x(ob);
    var dc = I(da, {
        type: "spline", getPointSpline: function (a, b, c) {
            var d = b.plotX, e = b.plotY, f = a[c - 1];
            c = a[c + 1];
            var g, h, k, m;
            if (f && !f.isNull && c && !c.isNull) {
                a =
                    f.plotY;
                k = c.plotX;
                c = c.plotY;
                var n = 0;
                g = (1.5 * d + f.plotX) / 2.5;
                h = (1.5 * e + a) / 2.5;
                k = (1.5 * d + k) / 2.5;
                m = (1.5 * e + c) / 2.5;
                k !== g && (n = (m - h) * (k - d) / (k - g) + e - m);
                h += n;
                m += n;
                h > a && h > e ? (h = L(a, e), m = 2 * e - h) : h < a && h < e && (h = W(a, e), m = 2 * e - h);
                m > c && m > e ? (m = L(c, e), h = 2 * e - m) : m < c && m < e && (m = W(c, e), h = 2 * e - m);
                b.rightContX = k;
                b.rightContY = m
            }
            b = ["C", z(f.rightContX, f.plotX), z(f.rightContY, f.plotY), z(g, d), z(h, e), d, e];
            f.rightContX = f.rightContY = null;
            return b
        }
    });
    S.spline = dc;
    ba.areaspline = x(ba.area);
    var Ab = cc.prototype, pc = I(dc, {
        type: "areaspline",
        getStackPoints: Ab.getStackPoints,
        getGraphPath: Ab.getGraphPath,
        setStackCliffs: Ab.setStackCliffs,
        drawGraph: Ab.drawGraph,
        drawLegendSymbol: rb.drawRectangle
    });
    S.areaspline = pc;
    ba.column = x(ob, {
        borderColor: "#FFFFFF",
        borderRadius: 0,
        groupPadding: .2,
        marker: null,
        pointPadding: .1,
        minPointLength: 0,
        cropThreshold: 50,
        pointRange: null,
        states: {
            hover: {brightness: .1, shadow: !1, halo: !1},
            select: {color: "#C0C0C0", borderColor: "#000000", shadow: !1}
        },
        dataLabels: {align: null, verticalAlign: null, y: null},
        softThreshold: !1,
        startFromThreshold: !0,
        stickyTracking: !1,
        tooltip: {distance: 6},
        threshold: 0
    });
    var Pb = I(da, {
        type: "column",
        pointAttrToOptions: {stroke: "borderColor", fill: "color", r: "borderRadius"},
        cropShoulder: 0,
        directTouch: !0,
        trackerGroups: ["group", "dataLabelsGroup"],
        negStacks: !0,
        init: function () {
            da.prototype.init.apply(this, arguments);
            var a = this, b = a.chart;
            b.hasRendered && C(b.series, function (b) {
                b.type === a.type && (b.isDirty = !0)
            })
        },
        getColumnMetrics: function () {
            var a = this, b = a.options, c = a.xAxis, d = a.yAxis, e = c.reversed, f, g = {}, h = 0;
            !1 === b.grouping ? h = 1 : C(a.chart.series, function (b) {
                var c = b.options,
                    e = b.yAxis, k;
                b.type === a.type && b.visible && d.len === e.len && d.pos === e.pos && (c.stacking ? (f = b.stackKey, g[f] === J && (g[f] = h++), k = g[f]) : !1 !== c.grouping && (k = h++), b.columnIndex = k)
            });
            var k = W(ra(c.transA) * (c.ordinalSlope || b.pointRange || c.closestPointRange || c.tickInterval || 1), c.len), m = k * b.groupPadding, n = (k - 2 * m) / h, b = W(b.maxPointWidth || c.len, z(b.pointWidth, n * (1 - 2 * b.pointPadding)));
            a.columnMetrics = {
                width: b,
                offset: (n - b) / 2 + (m + ((a.columnIndex || 0) + (e ? 1 : 0)) * n - k / 2) * (e ? -1 : 1)
            };
            return a.columnMetrics
        },
        crispCol: function (a, b,
                            c, d) {
            var e = this.chart, f = this.borderWidth, g = -(f % 2 ? .5 : 0), f = f % 2 ? .5 : 1;
            e.inverted && e.renderer.isVML && (f += 1);
            c = Math.round(a + c) + g;
            a = Math.round(a) + g;
            c -= a;
            d = Math.round(b + d) + f;
            g = .5 >= ra(b) && .5 < d;
            b = Math.round(b) + f;
            d -= b;
            g && d && (--b, d += 1);
            return {x: a, y: b, width: c, height: d}
        },
        translate: function () {
            var a = this, b = a.chart, c = a.options, d = a.borderWidth = z(c.borderWidth, 2 > a.closestPointRange * a.xAxis.transA ? 0 : 1), e = a.yAxis, f = a.translatedThreshold = e.getThreshold(c.threshold), g = z(c.minPointLength, 5), h = a.getColumnMetrics(), k = h.width,
                m = a.barW = L(k, 1 + 2 * d), n = a.pointXOffset = h.offset;
            b.inverted && (f -= .5);
            c.pointPadding && (m = Oa(m));
            da.prototype.translate.apply(a);
            C(a.points, function (c) {
                var d = W(z(c.yBottom, f), 9E4), h = 999 + ra(d), h = W(L(-h, c.plotY), e.len + h), l = c.plotX + n, q = m, v = W(h, d), p, E = L(h, d) - v;
                ra(E) < g && g && (E = g, p = !e.reversed && !c.negative || e.reversed && c.negative, v = ra(v - f) > g ? d - g : f - (p ? g : 0));
                c.barX = l;
                c.pointWidth = k;
                c.tooltipPos = b.inverted ? [e.len + e.pos - b.plotLeft - h, a.xAxis.len - l - q / 2, E] : [l + q / 2, h + e.pos - b.plotTop, E];
                c.shapeType = "rect";
                c.shapeArgs =
                    a.crispCol(l, v, q, E)
            })
        },
        getSymbol: oa,
        drawLegendSymbol: rb.drawRectangle,
        drawGraph: oa,
        drawPoints: function () {
            var a = this, b = this.chart, c = a.options, d = b.renderer, e = c.animationLimit || 250, f, g;
            C(a.points, function (h) {
                var k = h.plotY, m = h.graphic;
                k === J || isNaN(k) || null === h.y ? m && (h.graphic = m.destroy()) : (f = h.shapeArgs, k = y(a.borderWidth) ? {"stroke-width": a.borderWidth} : {}, g = h.pointAttr[h.selected ? "select" : ""] || a.pointAttr[""], m ? (Xa(m), m.attr(k).attr(g)[b.pointCount < e ? "animate" : "attr"](x(f))) : h.graphic = d[h.shapeType](f).attr(k).attr(g).add(h.group ||
                    a.group).shadow(c.shadow, null, c.stacking && !c.borderRadius))
            })
        },
        animate: function (a) {
            var b = this, c = this.yAxis, d = b.options, e = this.chart.inverted, f = {};
            Ba && (a ? (f.scaleY = .001, a = W(c.pos + c.len, L(c.pos, c.toPixels(d.threshold))), e ? f.translateX = a - c.len : f.translateY = a, b.group.attr(f)) : (f[e ? "translateX" : "translateY"] = c.pos, b.group.animate(f, O(jb(b.options.animation), {
                step: function (a, c) {
                    b.group.attr({scaleY: c.pos})
                }
            })), b.animate = null))
        },
        remove: function () {
            var a = this, b = a.chart;
            b.hasRendered && C(b.series, function (b) {
                b.type ===
                a.type && (b.isDirty = !0)
            });
            da.prototype.remove.apply(a, arguments)
        }
    });
    S.column = Pb;
    ba.bar = x(ba.column);
    var qc = I(Pb, {type: "bar", inverted: !0});
    S.bar = qc;
    ba.scatter = x(ob, {
        lineWidth: 0,
        marker: {enabled: !0},
        tooltip: {
            headerFormat: '<span style="color:{point.color}">\u25cf</span> <span style="font-size: 10px;"> {series.name}</span><br/>',
            pointFormat: "x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>"
        }
    });
    var ec = I(da, {
        type: "scatter", sorted: !1, requireSorting: !1, noSharedTooltip: !0, trackerGroups: ["group", "markerGroup",
            "dataLabelsGroup"], takeOrdinalPosition: !1, kdDimensions: 2, drawGraph: function () {
            this.options.lineWidth && da.prototype.drawGraph.call(this)
        }
    });
    S.scatter = ec;
    ba.pie = x(ob, {
        borderColor: "#FFFFFF",
        borderWidth: 1,
        center: [null, null],
        clip: !1,
        colorByPoint: !0,
        dataLabels: {
            distance: 30, enabled: !0, formatter: function () {
                return null === this.y ? void 0 : this.point.name
            }, x: 0
        },
        ignoreHiddenPoint: !0,
        legendType: "point",
        marker: null,
        size: null,
        showInLegend: !1,
        slicedOffset: 10,
        states: {hover: {brightness: .1, shadow: !1}},
        stickyTracking: !1,
        tooltip: {followPointer: !0}
    });
    var Qb = {
        type: "pie",
        isCartesian: !1,
        pointClass: I(Ja, {
            init: function () {
                Ja.prototype.init.apply(this, arguments);
                var a = this, b;
                a.name = z(a.name, "Slice");
                b = function (b) {
                    a.slice("select" === b.type)
                };
                aa(a, "select", b);
                aa(a, "unselect", b);
                return a
            }, setVisible: function (a, b) {
                var c = this, d = c.series, e = d.chart, f = d.options.ignoreHiddenPoint;
                b = z(b, f);
                a !== c.visible && (c.visible = c.options.visible = a = a === J ? !c.visible : a, d.options.data[Ia(c, d.data)] = c.options, C(["graphic", "dataLabel", "connector", "shadowGroup"],
                    function (b) {
                        if (c[b])c[b][a ? "show" : "hide"](!0)
                    }), c.legendItem && e.legend.colorizeItem(c, a), a || "hover" !== c.state || c.setState(""), f && (d.isDirty = !0), b && e.redraw())
            }, slice: function (a, b, c) {
                var d = this.series;
                za(c, d.chart);
                z(b, !0);
                this.sliced = this.options.sliced = a = y(a) ? a : !this.sliced;
                d.options.data[Ia(this, d.data)] = this.options;
                a = a ? this.slicedTranslation : {translateX: 0, translateY: 0};
                this.graphic.animate(a);
                this.shadowGroup && this.shadowGroup.animate(a)
            }, haloPath: function (a) {
                var b = this.shapeArgs, c = this.series.chart;
                return this.sliced || !this.visible ? [] : this.series.chart.renderer.symbols.arc(c.plotLeft + b.x, c.plotTop + b.y, b.r + a, b.r + a, {
                    innerR: this.shapeArgs.r,
                    start: b.start,
                    end: b.end
                })
            }
        }),
        requireSorting: !1,
        directTouch: !0,
        noSharedTooltip: !0,
        trackerGroups: ["group", "dataLabelsGroup"],
        axisTypes: [],
        pointAttrToOptions: {stroke: "borderColor", "stroke-width": "borderWidth", fill: "color"},
        animate: function (a) {
            var b = this, c = b.points, d = b.startAngleRad;
            a || (C(c, function (a) {
                var c = a.graphic, g = a.shapeArgs;
                c && (c.attr({
                    r: a.startR || b.center[3] /
                    2, start: d, end: d
                }), c.animate({r: g.r, start: g.start, end: g.end}, b.options.animation))
            }), b.animate = null)
        },
        updateTotals: function () {
            var a, b = 0, c = this.points, d = c.length, e, f = this.options.ignoreHiddenPoint;
            for (a = 0; a < d; a++)e = c[a], b += f && !e.visible ? 0 : e.y;
            this.total = b;
            for (a = 0; a < d; a++)e = c[a], e.percentage = 0 < b && (e.visible || !f) ? e.y / b * 100 : 0, e.total = b
        },
        generatePoints: function () {
            da.prototype.generatePoints.call(this);
            this.updateTotals()
        },
        translate: function (a) {
            this.generatePoints();
            var b = 0, c = this.options, d = c.slicedOffset,
                e = d + c.borderWidth, f, g, h, k = c.startAngle || 0, m = this.startAngleRad = Ma / 180 * (k - 90), k = (this.endAngleRad = Ma / 180 * (z(c.endAngle, k + 360) - 90)) - m, n = this.points, u = c.dataLabels.distance, c = c.ignoreHiddenPoint, w, A = n.length, l;
            a || (this.center = a = this.getCenter());
            this.getX = function (b, c) {
                h = qa.asin(W((b - a[1]) / (a[2] / 2 + u), 1));
                return a[0] + (c ? -1 : 1) * wa(h) * (a[2] / 2 + u)
            };
            for (w = 0; w < A; w++) {
                l = n[w];
                f = m + b * k;
                if (!c || l.visible)b += l.percentage / 100;
                g = m + b * k;
                l.shapeType = "arc";
                l.shapeArgs = {
                    x: a[0], y: a[1], r: a[2] / 2, innerR: a[3] / 2, start: M(1E3 * f) /
                    1E3, end: M(1E3 * g) / 1E3
                };
                h = (g + f) / 2;
                h > 1.5 * Ma ? h -= 2 * Ma : h < -Ma / 2 && (h += 2 * Ma);
                l.slicedTranslation = {translateX: M(wa(h) * d), translateY: M(Ca(h) * d)};
                f = wa(h) * a[2] / 2;
                g = Ca(h) * a[2] / 2;
                l.tooltipPos = [a[0] + .7 * f, a[1] + .7 * g];
                l.half = h < -Ma / 2 || h > Ma / 2 ? 1 : 0;
                l.angle = h;
                e = W(e, u / 2);
                l.labelPos = [a[0] + f + wa(h) * u, a[1] + g + Ca(h) * u, a[0] + f + wa(h) * e, a[1] + g + Ca(h) * e, a[0] + f, a[1] + g, 0 > u ? "center" : l.half ? "right" : "left", h]
            }
        },
        drawGraph: null,
        drawPoints: function () {
            var a = this, b = a.chart.renderer, c, d, e = a.options.shadow, f, g, h, k;
            e && !a.shadowGroup && (a.shadowGroup =
                b.g("shadow").add(a.group));
            C(a.points, function (m) {
                null !== m.y && (d = m.graphic, h = m.shapeArgs, f = m.shadowGroup, g = m.pointAttr[m.selected ? "select" : ""], g.stroke || (g.stroke = g.fill), e && !f && (f = m.shadowGroup = b.g("shadow").add(a.shadowGroup)), c = m.sliced ? m.slicedTranslation : {
                    translateX: 0,
                    translateY: 0
                }, f && f.attr(c), d ? d.setRadialReference(a.center).attr(g).animate(O(h, c)) : (k = {"stroke-linejoin": "round"}, m.visible || (k.visibility = "hidden"), m.graphic = d = b[m.shapeType](h).setRadialReference(a.center).attr(g).attr(k).attr(c).add(a.group).shadow(e,
                    f)))
            })
        },
        searchPoint: oa,
        sortByAngle: function (a, b) {
            a.sort(function (a, d) {
                return void 0 !== a.angle && (d.angle - a.angle) * b
            })
        },
        drawLegendSymbol: rb.drawRectangle,
        getCenter: bc.getCenter,
        getSymbol: oa
    }, Qb = I(da, Qb);
    S.pie = Qb;
    da.prototype.drawDataLabels = function () {
        var a = this, b = a.options, c = b.cursor, d = b.dataLabels, e = a.points, f, g, h = a.hasRendered || 0, k, m, n = z(d.defer, !0), u = a.chart.renderer;
        if (d.enabled || a._hasPointLabels)a.dlProcessOptions && a.dlProcessOptions(d), m = a.plotGroup("dataLabelsGroup", "data-labels", n && !h ? "hidden" :
            "visible", d.zIndex || 6), n && (m.attr({opacity: +h}), h || aa(a, "afterAnimate", function () {
            a.visible && m.show();
            m[b.animation ? "animate" : "attr"]({opacity: 1}, {duration: 200})
        })), g = d, C(e, function (e) {
            var h, n = e.dataLabel, l, v, E = e.connector, p = !0, r, t = {};
            f = e.dlOptions || e.options && e.options.dataLabels;
            h = z(f && f.enabled, g.enabled) && null !== e.y;
            if (n && !h)e.dataLabel = n.destroy(); else if (h) {
                d = x(g, f);
                r = d.style;
                h = d.rotation;
                l = e.getLabelConfig();
                k = d.format ? q(d.format, l) : d.formatter.call(l, d);
                r.color = z(d.color, r.color, a.color, "black");
                if (n)y(k) ? (n.attr({text: k}), p = !1) : (e.dataLabel = n = n.destroy(), E && (e.connector = E.destroy())); else if (y(k)) {
                    n = {
                        fill: d.backgroundColor,
                        stroke: d.borderColor,
                        "stroke-width": d.borderWidth,
                        r: d.borderRadius || 0,
                        rotation: h,
                        padding: d.padding,
                        zIndex: 1
                    };
                    "contrast" === r.color && (t.color = d.inside || 0 > d.distance || b.stacking ? u.getContrast(e.color || a.color) : "#000000");
                    c && (t.cursor = c);
                    for (v in n)n[v] === J && delete n[v];
                    n = e.dataLabel = u[h ? "text" : "label"](k, 0, -9999, d.shape, null, null, d.useHTML).attr(n).css(O(r, t)).add(m).shadow(d.shadow)
                }
                n &&
                a.alignDataLabel(e, n, d, null, p)
            }
        })
    };
    da.prototype.alignDataLabel = function (a, b, c, d, e) {
        var f = this.chart, g = f.inverted, h = z(a.plotX, -9999), k = z(a.plotY, -9999), m = b.getBBox(), n = f.renderer.fontMetrics(c.style.fontSize).b, u = c.rotation, w = c.align, A = this.visible && (a.series.forceDL || f.isInsidePlot(h, M(k), g) || d && f.isInsidePlot(h, g ? d.x + 1 : d.y + d.height - 1, g)), l = "justify" === z(c.overflow, "justify");
        A && (d = O({
            x: g ? f.plotWidth - k : h,
            y: M(g ? f.plotHeight - h : k),
            width: 0,
            height: 0
        }, d), O(c, {width: m.width, height: m.height}), u ? (l = !1, g = f.renderer.rotCorr(n,
            u), g = {
            x: d.x + c.x + d.width / 2 + g.x,
            y: d.y + c.y + d.height / 2
        }, b[e ? "attr" : "animate"](g).attr({align: c.align}), h = (u + 720) % 360, h = 180 < h && 360 > h, "left" === w ? g.y -= h ? m.height : 0 : "center" === w ? (g.x -= m.width / 2, g.y -= m.height / 2) : "right" === w && (g.x -= m.width, g.y -= h ? 0 : m.height)) : (b.align(c, null, d), g = b.alignAttr), l ? this.justifyDataLabel(b, c, g, m, d, e) : z(c.crop, !0) && (A = f.isInsidePlot(g.x, g.y) && f.isInsidePlot(g.x + m.width, g.y + m.height)), c.shape && !u && b.attr({
            anchorX: a.plotX,
            anchorY: a.plotY
        }));
        A || (Xa(b), b.attr({y: -9999}), b.placed = !1)
    };
    da.prototype.justifyDataLabel = function (a, b, c, d, e, f) {
        var g = this.chart, h = b.align, k = b.verticalAlign, m, n, u = a.box ? 0 : a.padding || 0;
        m = c.x + u;
        0 > m && ("right" === h ? b.align = "left" : b.x = -m, n = !0);
        m = c.x + d.width - u;
        m > g.plotWidth && ("left" === h ? b.align = "right" : b.x = g.plotWidth - m, n = !0);
        m = c.y + u;
        0 > m && ("bottom" === k ? b.verticalAlign = "top" : b.y = -m, n = !0);
        m = c.y + d.height - u;
        m > g.plotHeight && ("top" === k ? b.verticalAlign = "bottom" : b.y = g.plotHeight - m, n = !0);
        n && (a.placed = !f, a.align(b, null, e))
    };
    S.pie && (S.pie.prototype.drawDataLabels = function () {
        var a =
            this, b = a.data, c, d = a.chart, e = a.options.dataLabels, f = z(e.connectorPadding, 10), g = z(e.connectorWidth, 1), h = d.plotWidth, k = d.plotHeight, m, n, u = z(e.softConnector, !0), w = e.distance, A = a.center, l = A[2] / 2, q = A[1], v = 0 < w, E, p, r, t = [[], []], y, P, D, Y, B, Z = [0, 0, 0, 0], K = function (a, b) {
            return b.y - a.y
        };
        if (a.visible && (e.enabled || a._hasPointLabels)) {
            da.prototype.drawDataLabels.apply(a);
            C(b, function (a) {
                a.dataLabel && a.visible && (t[a.half].push(a), a.dataLabel._pos = null)
            });
            for (Y = 2; Y--;) {
                var F = [], la = [], x = t[Y], I = x.length, J;
                if (I) {
                    a.sortByAngle(x,
                        Y - .5);
                    for (B = b = 0; !b && x[B];)b = x[B] && x[B].dataLabel && (x[B].dataLabel.getBBox().height || 21), B++;
                    if (0 < w) {
                        p = W(q + l + w, d.plotHeight);
                        for (B = L(0, q - l - w); B <= p; B += b)F.push(B);
                        p = F.length;
                        if (I > p) {
                            c = [].concat(x);
                            c.sort(K);
                            for (B = I; B--;)c[B].rank = B;
                            for (B = I; B--;)x[B].rank >= p && x.splice(B, 1);
                            I = x.length
                        }
                        for (B = 0; B < I; B++) {
                            c = x[B];
                            r = c.labelPos;
                            c = 9999;
                            var R, N;
                            for (N = 0; N < p; N++)R = ra(F[N] - r[1]), R < c && (c = R, J = N);
                            if (J < B && null !== F[B])J = B; else for (p < I - B + J && null !== F[B] && (J = p - I + B); null === F[J];)J++;
                            la.push({i: J, y: F[J]});
                            F[J] = null
                        }
                        la.sort(K)
                    }
                    for (B =
                             0; B < I; B++) {
                        c = x[B];
                        r = c.labelPos;
                        E = c.dataLabel;
                        D = !1 === c.visible ? "hidden" : "inherit";
                        c = r[1];
                        if (0 < w) {
                            if (p = la.pop(), J = p.i, P = p.y, c > P && null !== F[J + 1] || c < P && null !== F[J - 1])P = W(L(0, c), d.plotHeight)
                        } else P = c;
                        y = e.justify ? A[0] + (Y ? -1 : 1) * (l + w) : a.getX(P === q - l - w || P === q + l + w ? c : P, Y);
                        E._attr = {visibility: D, align: r[6]};
                        E._pos = {x: y + e.x + ({left: f, right: -f}[r[6]] || 0), y: P + e.y - 10};
                        E.connX = y;
                        E.connY = P;
                        null === this.options.size && (p = E.width, y - p < f ? Z[3] = L(M(p - y + f), Z[3]) : y + p > h - f && (Z[1] = L(M(y + p - h + f), Z[1])), 0 > P - b / 2 ? Z[0] = L(M(-P + b / 2), Z[0]) :
                        P + b / 2 > k && (Z[2] = L(M(P + b / 2 - k), Z[2])))
                    }
                }
            }
            if (0 === ya(Z) || this.verifyDataLabelOverflow(Z))this.placeDataLabels(), v && g && C(this.points, function (b) {
                m = b.connector;
                r = b.labelPos;
                (E = b.dataLabel) && E._pos && b.visible ? (D = E._attr.visibility, y = E.connX, P = E.connY, n = u ? ["M", y + ("left" === r[6] ? 5 : -5), P, "C", y, P, 2 * r[2] - r[4], 2 * r[3] - r[5], r[2], r[3], "L", r[4], r[5]] : ["M", y + ("left" === r[6] ? 5 : -5), P, "L", r[2], r[3], "L", r[4], r[5]], m ? (m.animate({d: n}), m.attr("visibility", D)) : b.connector = m = a.chart.renderer.path(n).attr({
                    "stroke-width": g, stroke: e.connectorColor ||
                    b.color || "#606060", visibility: D
                }).add(a.dataLabelsGroup)) : m && (b.connector = m.destroy())
            })
        }
    }, S.pie.prototype.placeDataLabels = function () {
        C(this.points, function (a) {
            var b = a.dataLabel;
            b && a.visible && ((a = b._pos) ? (b.attr(b._attr), b[b.moved ? "animate" : "attr"](a), b.moved = !0) : b && b.attr({y: -9999}))
        })
    }, S.pie.prototype.alignDataLabel = oa, S.pie.prototype.verifyDataLabelOverflow = function (a) {
        var b = this.center, c = this.options, d = c.center, e = c.minSize || 80, f = e, g;
        null !== d[0] ? f = L(b[2] - L(a[1], a[3]), e) : (f = L(b[2] - a[1] - a[3], e),
            b[0] += (a[3] - a[1]) / 2);
        null !== d[1] ? f = L(W(f, b[2] - L(a[0], a[2])), e) : (f = L(W(f, b[2] - a[0] - a[2]), e), b[1] += (a[0] - a[2]) / 2);
        f < b[2] ? (b[2] = f, b[3] = Math.min(v(c.innerSize || 0, f), f), this.translate(b), this.drawDataLabels && this.drawDataLabels()) : g = !0;
        return g
    });
    S.column && (S.column.prototype.alignDataLabel = function (a, b, c, d, e) {
        var f = this.chart.inverted, g = a.series, h = a.dlBox || a.shapeArgs, k = z(a.below, a.plotY > z(this.translatedThreshold, g.yAxis.len)), m = z(c.inside, !!this.options.stacking);
        h && (d = x(h), 0 > d.y && (d.height += d.y, d.y =
            0), h = d.y + d.height - g.yAxis.len, 0 < h && (d.height -= h), f && (d = {
            x: g.yAxis.len - d.y - d.height,
            y: g.xAxis.len - d.x - d.width,
            width: d.height,
            height: d.width
        }), m || (f ? (d.x += k ? 0 : d.width, d.width = 0) : (d.y += k ? d.height : 0, d.height = 0)));
        c.align = z(c.align, !f || m ? "center" : k ? "right" : "left");
        c.verticalAlign = z(c.verticalAlign, f || m ? "middle" : k ? "top" : "bottom");
        da.prototype.alignDataLabel.call(this, a, b, c, d, e)
    });
    var cb = U.TrackerMixin = {
        drawTrackerPoint: function () {
            var a = this, b = a.chart, c = b.pointer, d = a.options.cursor, e = d && {cursor: d}, f = function (a) {
                for (var c =
                    a.target, d; c && !d;)d = c.point, c = c.parentNode;
                if (d !== J && d !== b.hoverPoint)d.onMouseOver(a)
            };
            C(a.points, function (a) {
                a.graphic && (a.graphic.element.point = a);
                a.dataLabel && (a.dataLabel.element.point = a)
            });
            a._hasTracking || (C(a.trackerGroups, function (b) {
                if (a[b] && (a[b].addClass("highcharts-tracker").on("mouseover", f).on("mouseout", function (a) {
                        c.onTrackerMouseOut(a)
                    }).css(e), gb))a[b].on("touchstart", f)
            }), a._hasTracking = !0)
        }, drawTrackerGraph: function () {
            var a = this, b = a.options, c = b.trackByArea, d = [].concat(c ? a.areaPath :
                a.graphPath), e = d.length, f = a.chart, g = f.pointer, h = f.renderer, k = f.options.tooltip.snap, m = a.tracker, n = b.cursor, u = n && {cursor: n}, w = function () {
                if (f.hoverSeries !== a)a.onMouseOver()
            }, l = "rgba(192,192,192," + (Ba ? 1E-4 : .002) + ")";
            if (e && !c)for (n = e + 1; n--;)"M" === d[n] && d.splice(n + 1, 0, d[n + 1] - k, d[n + 2], "L"), (n && "M" === d[n] || n === e) && d.splice(n, 0, "L", d[n - 2] + k, d[n - 1]);
            m ? m.attr({d: d}) : (a.tracker = h.path(d).attr({
                "stroke-linejoin": "round",
                visibility: a.visible ? "visible" : "hidden",
                stroke: l,
                fill: c ? l : "none",
                "stroke-width": b.lineWidth +
                (c ? 0 : 2 * k),
                zIndex: 2
            }).add(a.group), C([a.tracker, a.markerGroup], function (a) {
                a.addClass("highcharts-tracker").on("mouseover", w).on("mouseout", function (a) {
                    g.onTrackerMouseOut(a)
                }).css(u);
                if (gb)a.on("touchstart", w)
            }))
        }
    };
    S.column && (Pb.prototype.drawTracker = cb.drawTrackerPoint);
    S.pie && (S.pie.prototype.drawTracker = cb.drawTrackerPoint);
    S.scatter && (ec.prototype.drawTracker = cb.drawTrackerPoint);
    O(zb.prototype, {
        setItemEvents: function (a, b, c, d, e) {
            var f = this;
            (c ? b : a.legendGroup).on("mouseover", function () {
                a.setState("hover");
                b.css(f.options.itemHoverStyle)
            }).on("mouseout", function () {
                b.css(a.visible ? d : e);
                a.setState()
            }).on("click", function (b) {
                var c = function () {
                    a.setVisible && a.setVisible()
                };
                b = {browserEvent: b};
                a.firePointEvent ? a.firePointEvent("legendItemClick", b, c) : na(a, "legendItemClick", b, c)
            })
        }, createCheckboxForItem: function (a) {
            a.checkbox = ia("input", {
                type: "checkbox",
                checked: a.selected,
                defaultChecked: a.selected
            }, this.options.itemCheckboxStyle, this.chart.container);
            aa(a.checkbox, "click", function (b) {
                na(a.series || a, "checkboxClick",
                    {checked: b.target.checked, item: a}, function () {
                        a.select()
                    })
            })
        }
    });
    pa.legend.itemStyle.cursor = "pointer";
    O(Na.prototype, {
        showResetZoom: function () {
            var a = this, b = pa.lang, c = a.options.chart.resetZoomButton, d = c.theme, e = d.states, f = "chart" === c.relativeTo ? null : "plotBox";
            this.resetZoomButton = a.renderer.button(b.resetZoom, null, null, function () {
                a.zoomOut()
            }, d, e && e.hover).attr({align: c.position.align, title: b.resetZoomTitle}).add().align(c.position, !1, f)
        }, zoomOut: function () {
            var a = this;
            na(a, "selection", {resetSelection: !0},
                function () {
                    a.zoom()
                })
        }, zoom: function (a) {
            var b, c = this.pointer, d = !1, e;
            !a || a.resetSelection ? C(this.axes, function (a) {
                b = a.zoom()
            }) : C(a.xAxis.concat(a.yAxis), function (a) {
                var e = a.axis, h = e.isXAxis;
                if (c[h ? "zoomX" : "zoomY"] || c[h ? "pinchX" : "pinchY"])b = e.zoom(a.min, a.max), e.displayBtn && (d = !0)
            });
            e = this.resetZoomButton;
            d && !e ? this.showResetZoom() : !d && R(e) && (this.resetZoomButton = e.destroy());
            b && this.redraw(z(this.options.chart.animation, a && a.animation, 100 > this.pointCount))
        }, pan: function (a, b) {
            var c = this, d = c.hoverPoints,
                e;
            d && C(d, function (a) {
                a.setState()
            });
            C("xy" === b ? [1, 0] : [1], function (b) {
                b = c[b ? "xAxis" : "yAxis"][0];
                var d = b.horiz, h = a[d ? "chartX" : "chartY"], d = d ? "mouseDownX" : "mouseDownY", k = c[d], m = (b.pointRange || 0) / 2, n = b.getExtremes(), u = b.toValue(k - h, !0) + m, m = b.toValue(k + b.len - h, !0) - m, k = k > h;
                b.series.length && (k || u > W(n.dataMin, n.min)) && (!k || m < L(n.dataMax, n.max)) && (b.setExtremes(u, m, !1, !1, {trigger: "pan"}), e = !0);
                c[d] = h
            });
            e && c.redraw(!1);
            F(c.container, {cursor: "move"})
        }
    });
    O(Ja.prototype, {
        select: function (a, b) {
            var c = this, d = c.series,
                e = d.chart;
            a = z(a, !c.selected);
            c.firePointEvent(a ? "select" : "unselect", {accumulate: b}, function () {
                c.selected = c.options.selected = a;
                d.options.data[Ia(c, d.data)] = c.options;
                c.setState(a && "select");
                b || C(e.getSelectedPoints(), function (a) {
                    a.selected && a !== c && (a.selected = a.options.selected = !1, d.options.data[Ia(a, d.data)] = a.options, a.setState(""), a.firePointEvent("unselect"))
                })
            })
        }, onMouseOver: function (a, b) {
            var c = this.series, d = c.chart, e = d.tooltip, f = d.hoverPoint;
            if (d.hoverSeries !== c)c.onMouseOver();
            if (f && f !== this)f.onMouseOut();
            this.series && (this.firePointEvent("mouseOver"), !e || e.shared && !c.noSharedTooltip || e.refresh(this, a), this.setState("hover"), b || (d.hoverPoint = this))
        }, onMouseOut: function () {
            var a = this.series.chart, b = a.hoverPoints;
            this.firePointEvent("mouseOut");
            b && -1 !== Ia(this, b) || (this.setState(), a.hoverPoint = null)
        }, importEvents: function () {
            if (!this.hasImportedEvents) {
                var a = x(this.series.options.point, this.options).events, b;
                this.events = a;
                for (b in a)aa(this, b, a[b]);
                this.hasImportedEvents = !0
            }
        }, setState: function (a, b) {
            var c =
                ka(this.plotX), d = this.plotY, e = this.series, f = e.options.states, g = ba[e.type].marker && e.options.marker, h = g && !g.enabled, k = g && g.states[a], m = k && !1 === k.enabled, n = e.stateMarkerGraphic, u = this.marker || {}, w = e.chart, l = e.halo, q;
            a = a || "";
            q = this.pointAttr[a] || e.pointAttr[a];
            if (!(a === this.state && !b || this.selected && "select" !== a || f[a] && !1 === f[a].enabled || a && (m || h && !1 === k.enabled) || a && u.states && u.states[a] && !1 === u.states[a].enabled)) {
                if (this.graphic)g = g && this.graphic.symbolName && q.r, this.graphic.attr(x(q, g ? {
                    x: c - g, y: d -
                    g, width: 2 * g, height: 2 * g
                } : {})), n && n.hide(); else {
                    if (a && k)if (g = k.radius, u = u.symbol || e.symbol, n && n.currentSymbol !== u && (n = n.destroy()), n)n[b ? "animate" : "attr"]({
                        x: c - g,
                        y: d - g
                    }); else u && (e.stateMarkerGraphic = n = w.renderer.symbol(u, c - g, d - g, 2 * g, 2 * g).attr(q).add(e.markerGroup), n.currentSymbol = u);
                    n && (n[a && w.isInsidePlot(c, d, w.inverted) ? "show" : "hide"](), n.element.point = this)
                }
                (c = f[a] && f[a].halo) && c.size ? (l || (e.halo = l = w.renderer.path().add(w.seriesGroup)), l.attr(O({
                    fill: this.color || e.color, "fill-opacity": c.opacity,
                    zIndex: -1
                }, c.attributes))[b ? "animate" : "attr"]({d: this.haloPath(c.size)})) : l && l.attr({d: []});
                this.state = a
            }
        }, haloPath: function (a) {
            var b = this.series, c = b.chart, d = b.getPlotBox(), e = c.inverted, f = Math.floor(this.plotX);
            return c.renderer.symbols.circle(d.translateX + (e ? b.yAxis.len - this.plotY : f) - a, d.translateY + (e ? b.xAxis.len - f : this.plotY) - a, 2 * a, 2 * a)
        }
    });
    O(da.prototype, {
        onMouseOver: function () {
            var a = this.chart, b = a.hoverSeries;
            if (b && b !== this)b.onMouseOut();
            this.options.events.mouseOver && na(this, "mouseOver");
            this.setState("hover");
            a.hoverSeries = this
        }, onMouseOut: function () {
            var a = this.options, b = this.chart, c = b.tooltip, d = b.hoverPoint;
            b.hoverSeries = null;
            if (d)d.onMouseOut();
            this && a.events.mouseOut && na(this, "mouseOut");
            !c || a.stickyTracking || c.shared && !this.noSharedTooltip || c.hide();
            this.setState()
        }, setState: function (a) {
            var b = this.options, c = this.graph, d = b.states, e = b.lineWidth, b = 0;
            a = a || "";
            if (this.state !== a && (this.state = a, !d[a] || !1 !== d[a].enabled) && (a && (e = d[a].lineWidth || e + (d[a].lineWidthPlus || 0)), c && !c.dashstyle))for (a = {"stroke-width": e},
                                                                                                                                                                               c.attr(a); this["zoneGraph" + b];)this["zoneGraph" + b].attr(a), b += 1
        }, setVisible: function (a, b) {
            var c = this, d = c.chart, e = c.legendItem, f, g = d.options.chart.ignoreHiddenSeries, h = c.visible;
            f = (c.visible = a = c.userOptions.visible = a === J ? !h : a) ? "show" : "hide";
            C(["group", "dataLabelsGroup", "markerGroup", "tracker"], function (a) {
                if (c[a])c[a][f]()
            });
            if (d.hoverSeries === c || (d.hoverPoint && d.hoverPoint.series) === c)c.onMouseOut();
            e && d.legend.colorizeItem(c, a);
            c.isDirty = !0;
            c.options.stacking && C(d.series, function (a) {
                a.options.stacking &&
                a.visible && (a.isDirty = !0)
            });
            C(c.linkedSeries, function (b) {
                b.setVisible(a, !1)
            });
            g && (d.isDirtyBox = !0);
            !1 !== b && d.redraw();
            na(c, f)
        }, show: function () {
            this.setVisible(!0)
        }, hide: function () {
            this.setVisible(!1)
        }, select: function (a) {
            this.selected = a = a === J ? !this.selected : a;
            this.checkbox && (this.checkbox.checked = a);
            na(this, a ? "select" : "unselect")
        }, drawTracker: cb.drawTrackerGraph
    });
    ca(da.prototype, "init", function (a) {
        var b;
        a.apply(this, Array.prototype.slice.call(arguments, 1));
        (b = this.xAxis) && b.options.ordinal && aa(this,
            "updatedData", function () {
                delete b.ordinalIndex
            })
    });
    ca(ga.prototype, "getTimeTicks", function (a, b, c, d, e, f, g, h) {
        var k = 0, m, n, u = {}, w, l, q, v = [], p = -Number.MAX_VALUE, E = this.options.tickPixelInterval;
        if (!this.options.ordinal && !this.options.breaks || !f || 3 > f.length || c === J)return a.call(this, b, c, d, e);
        l = f.length;
        for (m = 0; m < l; m++) {
            q = m && f[m - 1] > d;
            f[m] < c && (k = m);
            if (m === l - 1 || f[m + 1] - f[m] > 5 * g || q) {
                if (f[m] > p) {
                    for (n = a.call(this, b, f[k], f[m], e); n.length && n[0] <= p;)n.shift();
                    n.length && (p = n[n.length - 1]);
                    v = v.concat(n)
                }
                k = m + 1
            }
            if (q)break
        }
        a =
            n.info;
        if (h && a.unitRange <= ma.hour) {
            m = v.length - 1;
            for (k = 1; k < m; k++)Da("%d", v[k]) !== Da("%d", v[k - 1]) && (u[v[k]] = "day", w = !0);
            w && (u[v[0]] = "day");
            a.higherRanks = u
        }
        v.info = a;
        if (h && y(E)) {
            h = a = v.length;
            m = [];
            var r;
            for (w = []; h--;)k = this.translate(v[h]), r && (w[h] = r - k), m[h] = r = k;
            w.sort();
            w = w[ka(w.length / 2)];
            w < .6 * E && (w = null);
            h = v[a - 1] > d ? a - 1 : a;
            for (r = void 0; h--;)k = m[h], d = r - k, r && d < .8 * E && (null === w || d < .8 * w) ? (u[v[h]] && !u[v[h + 1]] ? (d = h + 1, r = k) : d = h, v.splice(d, 1)) : r = k
        }
        return v
    });
    O(ga.prototype, {
        beforeSetTickPositions: function () {
            var a,
                b = [], c = !1, d, e = this.getExtremes(), f = e.min, g = e.max, h, k = this.isXAxis && !!this.options.breaks;
            if ((e = this.options.ordinal) || k) {
                C(this.series, function (c, d) {
                    if (!1 !== c.visible && (!1 !== c.takeOrdinalPosition || k) && (b = b.concat(c.processedXData), a = b.length, b.sort(function (a, b) {
                            return a - b
                        }), a))for (d = a - 1; d--;)b[d] === b[d + 1] && b.splice(d, 1)
                });
                a = b.length;
                if (2 < a) {
                    d = b[1] - b[0];
                    for (h = a - 1; h-- && !c;)b[h + 1] - b[h] !== d && (c = !0);
                    !this.options.keepOrdinalPadding && (b[0] - f > d || g - b[b.length - 1] > d) && (c = !0)
                }
                c ? (this.ordinalPositions = b, d = this.val2lin(L(f,
                    b[0]), !0), h = L(this.val2lin(W(g, b[b.length - 1]), !0), 1), this.ordinalSlope = g = (g - f) / (h - d), this.ordinalOffset = f - d * g) : this.ordinalPositions = this.ordinalSlope = this.ordinalOffset = J
            }
            this.isOrdinal = e && c;
            this.groupIntervalFactor = null
        }, val2lin: function (a, b) {
            var c = this.ordinalPositions, d;
            if (c) {
                var e = c.length, f;
                for (d = e; d--;)if (c[d] === a) {
                    f = d;
                    break
                }
                for (d = e - 1; d--;)if (a > c[d] || 0 === d) {
                    c = (a - c[d]) / (c[d + 1] - c[d]);
                    f = d + c;
                    break
                }
                d = b ? f : this.ordinalSlope * (f || 0) + this.ordinalOffset
            } else d = a;
            return d
        }, lin2val: function (a, b) {
            var c =
                this.ordinalPositions;
            if (c) {
                var d = this.ordinalSlope, e = this.ordinalOffset, f = c.length - 1, g, h;
                if (b)0 > a ? a = c[0] : a > f ? a = c[f] : (f = ka(a), h = a - f); else for (; f--;)if (g = d * f + e, a >= g) {
                    d = d * (f + 1) + e;
                    h = (a - g) / (d - g);
                    break
                }
                c = h !== J && c[f] !== J ? c[f] + (h ? h * (c[f + 1] - c[f]) : 0) : a
            } else c = a;
            return c
        }, getExtendedPositions: function () {
            var a = this.chart, b = this.series[0].currentDataGrouping, c = this.ordinalIndex, d = b ? b.count + b.unitName : "raw", e = this.getExtremes(), f, g;
            c || (c = this.ordinalIndex = {});
            c[d] || (f = {
                series: [], getExtremes: function () {
                    return {
                        min: e.dataMin,
                        max: e.dataMax
                    }
                }, options: {ordinal: !0}, val2lin: ga.prototype.val2lin
            }, C(this.series, function (c) {
                g = {xAxis: f, xData: c.xData, chart: a, destroyGroupedData: oa};
                g.options = {
                    dataGrouping: b ? {
                        enabled: !0,
                        forced: !0,
                        approximation: "open",
                        units: [[b.unitName, [b.count]]]
                    } : {enabled: !1}
                };
                c.processData.apply(g);
                f.series.push(g)
            }), this.beforeSetTickPositions.apply(f), c[d] = f.ordinalPositions);
            return c[d]
        }, getGroupIntervalFactor: function (a, b, c) {
            var d;
            c = c.processedXData;
            var e = c.length, f = [];
            d = this.groupIntervalFactor;
            if (!d) {
                for (d =
                         0; d < e - 1; d++)f[d] = c[d + 1] - c[d];
                f.sort(function (a, b) {
                    return a - b
                });
                f = f[ka(e / 2)];
                a = L(a, c[0]);
                b = W(b, c[e - 1]);
                this.groupIntervalFactor = d = e * f / (b - a)
            }
            return d
        }, postProcessTickInterval: function (a) {
            var b = this.ordinalSlope;
            return b ? this.options.breaks ? this.closestPointRange : a / (b / this.closestPointRange) : a
        }
    });
    ca(Na.prototype, "pan", function (a, b) {
        var c = this.xAxis[0], d = b.chartX, e = !1;
        if (c.options.ordinal && c.series.length) {
            var f = this.mouseDownX, g = c.getExtremes(), h = g.dataMax, k = g.min, m = g.max, n = this.hoverPoints, u = c.closestPointRange,
                f = (f - d) / (c.translationSlope * (c.ordinalSlope || u)), w = {ordinalPositions: c.getExtendedPositions()}, u = c.lin2val, l = c.val2lin, q;
            w.ordinalPositions ? 1 < ra(f) && (n && C(n, function (a) {
                a.setState()
            }), 0 > f ? (n = w, q = c.ordinalPositions ? c : w) : (n = c.ordinalPositions ? c : w, q = w), w = q.ordinalPositions, h > w[w.length - 1] && w.push(h), this.fixedRange = m - k, f = c.toFixedRange(null, null, u.apply(n, [l.apply(n, [k, !0]) + f, !0]), u.apply(q, [l.apply(q, [m, !0]) + f, !0])), f.min >= W(g.dataMin, k) && f.max <= L(h, m) && c.setExtremes(f.min, f.max, !0, !1, {trigger: "pan"}),
                this.mouseDownX = d, F(this.container, {cursor: "move"})) : e = !0
        } else e = !0;
        e && a.apply(this, Array.prototype.slice.call(arguments, 1))
    });
    da.prototype.gappedPath = function () {
        var a = this.options.gapSize, b = this.points.slice(), c = b.length - 1;
        if (a && 0 < c)for (; c--;)b[c + 1].x - b[c].x > this.closestPointRange * a && b.splice(c + 1, 0, {isNull: !0});
        return this.getGraphPath(b)
    };
    var Aa = da.prototype, rc = Aa.processData, sc = Aa.generatePoints, tc = Aa.destroy, uc = {
        approximation: "average", groupPixelWidth: 2, dateTimeLabelFormats: {
            millisecond: ["%A, %b %e, %H:%M:%S.%L",
                "%A, %b %e, %H:%M:%S.%L", "-%H:%M:%S.%L"],
            second: ["%A, %b %e, %H:%M:%S", "%A, %b %e, %H:%M:%S", "-%H:%M:%S"],
            minute: ["%A, %b %e, %H:%M", "%A, %b %e, %H:%M", "-%H:%M"],
            hour: ["%A, %b %e, %H:%M", "%A, %b %e, %H:%M", "-%H:%M"],
            day: ["%A, %b %e, %Y", "%A, %b %e", "-%A, %b %e, %Y"],
            week: ["Week from %A, %b %e, %Y", "%A, %b %e", "-%A, %b %e, %Y"],
            month: ["%B %Y", "%B", "-%B %Y"],
            year: ["%Y", "%Y", "-%Y"]
        }
    }, fc = {
        line: {},
        spline: {},
        area: {},
        areaspline: {},
        column: {approximation: "sum", groupPixelWidth: 10},
        arearange: {approximation: "range"},
        areasplinerange: {approximation: "range"},
        columnrange: {approximation: "range", groupPixelWidth: 10},
        candlestick: {approximation: "ohlc", groupPixelWidth: 10},
        ohlc: {approximation: "ohlc", groupPixelWidth: 5}
    }, gc = [["millisecond", [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]], ["second", [1, 2, 5, 10, 15, 30]], ["minute", [1, 2, 5, 10, 15, 30]], ["hour", [1, 2, 3, 4, 6, 8, 12]], ["day", [1]], ["week", [1]], ["month", [1, 3, 6]], ["year", null]], Za = {
        sum: function (a) {
            var b = a.length, c;
            if (!b && a.hasNulls)c = null; else if (b)for (c = 0; b--;)c += a[b];
            return c
        }, average: function (a) {
            var b =
                a.length;
            a = Za.sum(a);
            "number" === typeof a && b && (a /= b);
            return a
        }, open: function (a) {
            return a.length ? a[0] : a.hasNulls ? null : J
        }, high: function (a) {
            return a.length ? ya(a) : a.hasNulls ? null : J
        }, low: function (a) {
            return a.length ? Y(a) : a.hasNulls ? null : J
        }, close: function (a) {
            return a.length ? a[a.length - 1] : a.hasNulls ? null : J
        }, ohlc: function (a, b, c, d) {
            a = Za.open(a);
            b = Za.high(b);
            c = Za.low(c);
            d = Za.close(d);
            if ("number" === typeof a || "number" === typeof b || "number" === typeof c || "number" === typeof d)return [a, b, c, d]
        }, range: function (a, b) {
            a = Za.low(a);
            b = Za.high(b);
            if ("number" === typeof a || "number" === typeof b)return [a, b]
        }
    };
    Aa.groupData = function (a, b, c, d) {
        var e = this.data, f = this.options.data, g = [], h = [], k = [], m = a.length, n, u, w = !!b, l = [[], [], [], []];
        d = "function" === typeof d ? d : Za[d];
        var q = this.pointArrayMap, v = q && q.length, p, E = 0;
        for (p = 0; p <= m && !(a[p] >= c[0]); p++);
        for (p; p <= m; p++) {
            for (; (c[1] !== J && a[p] >= c[1] || p === m) && (n = c.shift(), u = d.apply(0, l), u !== J && (g.push(n), h.push(u), k.push({
                start: E,
                length: l[0].length
            })), E = p, l[0] = [], l[1] = [], l[2] = [], l[3] = [], p !== m););
            if (p === m)break;
            if (q) {
                n = this.cropStart + p;
                n = e && e[n] || this.pointClass.prototype.applyOptions.apply({series: this}, [f[n]]);
                var r;
                for (u = 0; u < v; u++)r = n[q[u]], "number" === typeof r ? l[u].push(r) : null === r && (l[u].hasNulls = !0)
            } else n = w ? b[p] : null, "number" === typeof n ? l[0].push(n) : null === n && (l[0].hasNulls = !0)
        }
        return [g, h, k]
    };
    Aa.processData = function () {
        var a = this.chart, b = this.options.dataGrouping, c = !1 !== this.allowDG && b && z(b.enabled, a.options._stock), d;
        this.forceCrop = c;
        this.groupPixelWidth = null;
        this.hasProcessed = !0;
        if (!1 !== rc.apply(this,
                arguments) && c) {
            this.destroyGroupedData();
            var e = this.processedXData, f = this.processedYData, g = a.plotSizeX, a = this.xAxis, h = a.options.ordinal, k = this.groupPixelWidth = a.getGroupPixelWidth && a.getGroupPixelWidth();
            if (k) {
                d = !0;
                this.points = null;
                var m = a.getExtremes(), c = m.min, m = m.max, h = h && a.getGroupIntervalFactor(c, m, this) || 1, g = k * (m - c) / g * h, k = a.getTimeTicks(a.normalizeTimeTickInterval(g, b.units || gc), Math.min(c, e[0]), Math.max(m, e[e.length - 1]), a.options.startOfWeek, e, this.closestPointRange), e = Aa.groupData.apply(this,
                    [e, f, k, b.approximation]), f = e[0], h = e[1];
                if (b.smoothed) {
                    b = f.length - 1;
                    for (f[b] = Math.min(f[b], m); b-- && 0 < b;)f[b] += g / 2;
                    f[0] = Math.max(f[0], c)
                }
                this.currentDataGrouping = k.info;
                this.closestPointRange = k.info.totalRange;
                this.groupMap = e[2];
                y(f[0]) && f[0] < a.dataMin && (a.min === a.dataMin && (a.min = f[0]), a.dataMin = f[0]);
                this.processedXData = f;
                this.processedYData = h
            } else this.currentDataGrouping = this.groupMap = null;
            this.hasGroupedData = d
        }
    };
    Aa.destroyGroupedData = function () {
        var a = this.groupedData;
        C(a || [], function (b, c) {
            b && (a[c] =
                b.destroy ? b.destroy() : null)
        });
        this.groupedData = null
    };
    Aa.generatePoints = function () {
        sc.apply(this);
        this.destroyGroupedData();
        this.groupedData = this.hasGroupedData ? this.points : null
    };
    ca(Mb.prototype, "tooltipFooterHeaderFormatter", function (a, b, c) {
        var d = b.series, e = d.tooltipOptions, f = d.options.dataGrouping, g = e.xDateFormat, h, k = d.xAxis;
        return k && "datetime" === k.options.type && f && r(b.key) ? (a = d.currentDataGrouping, f = f.dateTimeLabelFormats, a ? (k = f[a.unitName], 1 === a.count ? g = k[0] : (g = k[1], h = k[2])) : !g && f && (g = this.getXDateFormat(b,
            e, k)), g = Da(g, b.key), h && (g += Da(h, b.key + a.totalRange - 1)), q(e[(c ? "footer" : "header") + "Format"], {
            point: O(b, {key: g}),
            series: d
        })) : a.call(this, b, c)
    });
    Aa.destroy = function () {
        for (var a = this.groupedData || [], b = a.length; b--;)a[b] && a[b].destroy();
        tc.apply(this)
    };
    ca(Aa, "setOptions", function (a, b) {
        var c = a.call(this, b), d = this.type, e = this.chart.options.plotOptions, f = ba[d].dataGrouping;
        fc[d] && (f || (f = x(uc, fc[d])), c.dataGrouping = x(f, e.series && e.series.dataGrouping, e[d].dataGrouping, b.dataGrouping));
        this.chart.options._stock &&
        (this.requireSorting = !0);
        return c
    });
    ca(ga.prototype, "setScale", function (a) {
        a.call(this);
        C(this.series, function (a) {
            a.hasProcessed = !1
        })
    });
    ga.prototype.getGroupPixelWidth = function () {
        var a = this.series, b = a.length, c, d = 0, e = !1, f;
        for (c = b; c--;)(f = a[c].options.dataGrouping) && (d = L(d, f.groupPixelWidth));
        for (c = b; c--;)(f = a[c].options.dataGrouping) && a[c].hasProcessed && (b = (a[c].processedXData || a[c].data).length, a[c].groupPixelWidth || b > this.chart.plotSizeX / d || b && f.forced) && (e = !0);
        return e ? d : 0
    };
    ga.prototype.setDataGrouping =
        function (a, b) {
            var c;
            b = z(b, !0);
            a || (a = {forced: !1, units: null});
            if (this instanceof ga)for (c = this.series.length; c--;)this.series[c].update({dataGrouping: a}, !1); else C(this.chart.options.series, function (b) {
                b.dataGrouping = a
            }, !1);
            b && this.chart.redraw()
        };
    ba.ohlc = x(ba.column, {
        lineWidth: 1,
        tooltip: {pointFormat: '<span style="color:{point.color}">\u25cf</span> <b> {series.name}</b><br/>Open: {point.open}<br/>High: {point.high}<br/>Low: {point.low}<br/>Close: {point.close}<br/>'},
        states: {hover: {lineWidth: 3}},
        threshold: null
    });
    var hc = I(S.column, {
        type: "ohlc",
        pointArrayMap: ["open", "high", "low", "close"],
        toYData: function (a) {
            return [a.open, a.high, a.low, a.close]
        },
        pointValKey: "high",
        pointAttrToOptions: {stroke: "color", "stroke-width": "lineWidth"},
        upColorProp: "stroke",
        getAttribs: function () {
            S.column.prototype.getAttribs.apply(this, arguments);
            var a = this.options, b = a.states, a = a.upColor || this.color, c = x(this.pointAttr), d = this.upColorProp;
            c[""][d] = a;
            c.hover[d] = b.hover.upColor || a;
            c.select[d] = b.select.upColor || a;
            C(this.points, function (a) {
                a.open <
                a.close && !a.options.color && (a.pointAttr = c)
            })
        },
        translate: function () {
            var a = this.yAxis;
            S.column.prototype.translate.apply(this);
            C(this.points, function (b) {
                null !== b.open && (b.plotOpen = a.translate(b.open, 0, 1, 0, 1));
                null !== b.close && (b.plotClose = a.translate(b.close, 0, 1, 0, 1))
            })
        },
        drawPoints: function () {
            var a = this, b = a.chart, c, d, e, f, g, h, k, m;
            C(a.points, function (n) {
                n.plotY !== J && (k = n.graphic, c = n.pointAttr[n.selected ? "selected" : ""] || a.pointAttr[""], f = c["stroke-width"] % 2 / 2, m = M(n.plotX) - f, g = M(n.shapeArgs.width / 2), h = ["M",
                    m, M(n.yBottom), "L", m, M(n.plotY)], null !== n.open && (d = M(n.plotOpen) + f, h.push("M", m, d, "L", m - g, d)), null !== n.close && (e = M(n.plotClose) + f, h.push("M", m, e, "L", m + g, e)), k ? k.attr(c).animate({d: h}) : n.graphic = b.renderer.path(h).attr(c).add(a.group))
            })
        },
        animate: null
    });
    S.ohlc = hc;
    ba.candlestick = x(ba.column, {
        lineColor: "black",
        lineWidth: 1,
        states: {hover: {lineWidth: 2}},
        tooltip: ba.ohlc.tooltip,
        threshold: null,
        upColor: "white"
    });
    var vc = I(hc, {
        type: "candlestick", pointAttrToOptions: {fill: "color", stroke: "lineColor", "stroke-width": "lineWidth"},
        upColorProp: "fill", getAttribs: function () {
            S.ohlc.prototype.getAttribs.apply(this, arguments);
            var a = this.options, b = a.states, c = a.upLineColor || a.lineColor, d = b.hover.upLineColor || c, e = b.select.upLineColor || c;
            C(this.points, function (a) {
                a.open < a.close && (a.lineColor && (a.pointAttr = x(a.pointAttr), c = a.lineColor), a.pointAttr[""].stroke = c, a.pointAttr.hover.stroke = d, a.pointAttr.select.stroke = e)
            })
        }, drawPoints: function () {
            var a = this, b = a.chart, c, d = a.pointAttr[""], e, f, g, h, k, m, n, u, w, l, q;
            C(a.points, function (v) {
                w = v.graphic;
                v.plotY !== J && (c = v.pointAttr[v.selected ? "selected" : ""] || d, n = c["stroke-width"] % 2 / 2, u = M(v.plotX) - n, e = v.plotOpen, f = v.plotClose, g = qa.min(e, f), h = qa.max(e, f), q = M(v.shapeArgs.width / 2), k = M(g) !== M(v.plotY), m = h !== v.yBottom, g = M(g) + n, h = M(h) + n, l = ["M", u - q, h, "L", u - q, g, "L", u + q, g, "L", u + q, h, "Z", "M", u, g, "L", u, k ? M(v.plotY) : g, "M", u, h, "L", u, m ? M(v.yBottom) : h], w ? w.attr(c).animate({d: l}) : v.graphic = b.renderer.path(l).attr(c).add(a.group).shadow(a.options.shadow))
            })
        }
    });
    S.candlestick = vc;
    var Bb = La.prototype.symbols;
    ba.flags = x(ba.column,
        {
            fillColor: "white",
            lineWidth: 1,
            pointRange: 0,
            shape: "flag",
            stackDistance: 12,
            states: {hover: {lineColor: "black", fillColor: "#FCFFC5"}},
            style: {fontSize: "11px", fontWeight: "bold", textAlign: "center"},
            tooltip: {pointFormat: "{point.text}<br/>"},
            threshold: null,
            y: -30
        });
    S.flags = I(S.column, {
        type: "flags",
        sorted: !1,
        noSharedTooltip: !0,
        allowDG: !1,
        takeOrdinalPosition: !1,
        trackerGroups: ["markerGroup"],
        forceCrop: !0,
        init: da.prototype.init,
        pointAttrToOptions: {fill: "fillColor", stroke: "color", "stroke-width": "lineWidth", r: "radius"},
        translate: function () {
            S.column.prototype.translate.apply(this);
            var a = this.options, b = this.chart, c = this.points, d = c.length - 1, e, f, g = a.onSeries;
            e = g && b.get(g);
            var a = a.onKey || "y", g = e && e.options.step, h = e && e.points, k = h && h.length, m = this.xAxis, n = m.getExtremes(), u, w, l;
            if (e && e.visible && k)for (e = e.currentDataGrouping, w = h[k - 1].x + (e ? e.totalRange : 0), c.sort(function (a, b) {
                return a.x - b.x
            }), a = "plot" + a[0].toUpperCase() + a.substr(1); k-- && c[d] && !(e = c[d], u = h[k], u.x <= e.x && void 0 !== u[a] && (e.x <= w && (e.plotY = u[a], u.x < e.x && !g && (l =
                h[k + 1]) && l[a] !== J && (e.plotY += (e.x - u.x) / (l.x - u.x) * (l[a] - u[a]))), d--, k++, 0 > d)););
            C(c, function (a, d) {
                var e;
                a.plotY === J && (a.x >= n.min && a.x <= n.max ? a.plotY = b.chartHeight - m.bottom - (m.opposite ? m.height : 0) + m.offset - b.plotTop : a.shapeArgs = {});
                (f = c[d - 1]) && f.plotX === a.plotX && (f.stackIndex === J && (f.stackIndex = 0), e = f.stackIndex + 1);
                a.stackIndex = e
            })
        },
        drawPoints: function () {
            var a, b = this.pointAttr[""], c = this.points, d = this.chart, e = d.renderer, f, g, h = this.options, k = h.y, m, n, u, w, l, q, v = this.yAxis;
            for (n = c.length; n--;)u = c[n], a =
                u.plotX > this.xAxis.len, f = u.plotX, 0 < f && (f -= z(u.lineWidth, h.lineWidth) % 2), w = u.stackIndex, m = u.options.shape || h.shape, g = u.plotY, g !== J && (g = u.plotY + k - (w !== J && w * h.stackDistance)), l = w ? J : u.plotX, q = w ? J : u.plotY, w = u.graphic, g !== J && 0 <= f && !a ? (a = u.pointAttr[u.selected ? "select" : ""] || b, w ? w.attr({
                x: f,
                y: g,
                r: a.r,
                anchorX: l,
                anchorY: q
            }) : u.graphic = e.label(u.options.title || h.title || "A", f, g, m, l, q, h.useHTML).css(x(h.style, u.style)).attr(a).attr({
                align: "flag" === m ? "left" : "center",
                width: h.width,
                height: h.height
            }).add(this.markerGroup).shadow(h.shadow),
                u.tooltipPos = d.inverted ? [v.len + v.pos - d.plotLeft - g, this.xAxis.len - f] : [f, g]) : w && (u.graphic = w.destroy())
        },
        drawTracker: function () {
            var a = this.points;
            cb.drawTrackerPoint.apply(this);
            C(a, function (b) {
                var c = b.graphic;
                c && aa(c.element, "mouseover", function () {
                    0 < b.stackIndex && !b.raised && (b._y = c.y, c.attr({y: b._y - 8}), b.raised = !0);
                    C(a, function (a) {
                        a !== b && a.raised && a.graphic && (a.graphic.attr({y: a._y}), a.raised = !1)
                    })
                })
            })
        },
        animate: oa,
        buildKDTree: oa,
        setClip: oa
    });
    Bb.flag = function (a, b, c, d, e) {
        return ["M", e && e.anchorX || a, e &&
        e.anchorY || b, "L", a, b + d, a, b, a + c, b, a + c, b + d, a, b + d, "Z"]
    };
    C(["circle", "square"], function (a) {
        Bb[a + "pin"] = function (b, c, d, e, f) {
            var g = f && f.anchorX;
            f = f && f.anchorY;
            "circle" === a && e > d && (b -= M((e - d) / 2), d = e);
            b = Bb[a](b, c, d, e);
            g && f && b.push("M", g, c > f ? c : c + e, "L", g, f);
            return b
        }
    });
    bb === U.VMLRenderer && C(["flag", "circlepin", "squarepin"], function (a) {
        qb.prototype.symbols[a] = Bb[a]
    });
    var Rb = [].concat(gc), Cb = function (a) {
        var b = Wa(arguments, function (a) {
            return "number" === typeof a
        });
        if (b.length)return Math[a].apply(0, b)
    };
    Rb[4] = ["day",
        [1, 2, 3, 4]];
    Rb[5] = ["week", [1, 2, 3]];
    O(pa, {
        navigator: {
            handles: {backgroundColor: "#ebe7e8", borderColor: "#b2b1b6"},
            height: 40,
            margin: 25,
            maskFill: "rgba(128,179,236,0.3)",
            maskInside: !0,
            outlineColor: "#b2b1b6",
            outlineWidth: 1,
            series: {
                type: S.areaspline === J ? "line" : "areaspline",
                color: "#4572A7",
                compare: null,
                fillOpacity: .05,
                dataGrouping: {approximation: "average", enabled: !0, groupPixelWidth: 2, smoothed: !0, units: Rb},
                dataLabels: {enabled: !1, zIndex: 2},
                id: "highcharts-navigator-series",
                lineColor: null,
                lineWidth: 1,
                marker: {enabled: !1},
                pointRange: 0,
                shadow: !1,
                threshold: null
            },
            xAxis: {
                tickWidth: 0,
                lineWidth: 0,
                gridLineColor: "#EEE",
                gridLineWidth: 1,
                tickPixelInterval: 200,
                labels: {align: "left", style: {color: "#888"}, x: 3, y: -4},
                crosshair: !1
            },
            yAxis: {
                gridLineWidth: 0,
                startOnTick: !1,
                endOnTick: !1,
                minPadding: .1,
                maxPadding: .1,
                labels: {enabled: !1},
                crosshair: !1,
                title: {text: null},
                tickWidth: 0
            }
        }, scrollbar: {
            height: mb ? 20 : 14,
            barBackgroundColor: "#bfc8d1",
            barBorderRadius: 0,
            barBorderWidth: 1,
            barBorderColor: "#bfc8d1",
            buttonArrowColor: "#666",
            buttonBackgroundColor: "#ebe7e8",
            buttonBorderColor: "#bbb",
            buttonBorderRadius: 0,
            buttonBorderWidth: 1,
            minWidth: 6,
            rifleColor: "#666",
            trackBackgroundColor: "#eeeeee",
            trackBorderColor: "#eeeeee",
            trackBorderWidth: 1,
            liveRedraw: Ba && !mb
        }
    });
    eb.prototype = {
        drawHandle: function (a, b) {
            var c = this.chart, d = c.renderer, e = this.elementsToDestroy, f = this.handles, g = this.navigatorOptions.handles, g = {
                fill: g.backgroundColor,
                stroke: g.borderColor,
                "stroke-width": 1
            }, h;
            this.rendered || (f[b] = d.g("navigator-handle-" + ["left", "right"][b]).css({cursor: "ew-resize"}).attr({
                zIndex: 10 -
                b
            }).add(), h = d.rect(-4.5, 0, 9, 16, 0, 1).attr(g).add(f[b]), e.push(h), h = d.path(["M", -1.5, 4, "L", -1.5, 12, "M", .5, 4, "L", .5, 12]).attr(g).add(f[b]), e.push(h));
            f[b][c.isResizing ? "animate" : "attr"]({
                translateX: this.scrollerLeft + this.scrollbarHeight + parseInt(a, 10),
                translateY: this.top + this.height / 2 - 8
            })
        }, drawScrollbarButton: function (a) {
            var b = this.chart.renderer, c = this.elementsToDestroy, d = this.scrollbarButtons, e = this.scrollbarHeight, f = this.scrollbarOptions, g;
            this.rendered || (d[a] = b.g().add(this.scrollbarGroup), g = b.rect(-.5,
                -.5, e + 1, e + 1, f.buttonBorderRadius, f.buttonBorderWidth).attr({
                    stroke: f.buttonBorderColor,
                    "stroke-width": f.buttonBorderWidth,
                    fill: f.buttonBackgroundColor
                }).add(d[a]), c.push(g), g = b.path(["M", e / 2 + (a ? -1 : 1), e / 2 - 3, "L", e / 2 + (a ? -1 : 1), e / 2 + 3, e / 2 + (a ? 2 : -2), e / 2]).attr({fill: f.buttonArrowColor}).add(d[a]), c.push(g));
            a && d[a].attr({translateX: this.scrollerWidth - e})
        }, render: function (a, b, c, d) {
            var e = this.chart, f = e.renderer, g, h, k, m, n = this.scrollbarGroup, u = this.navigatorGroup, w = this.scrollbar, u = this.xAxis, l = this.scrollbarTrack,
                q = this.scrollbarHeight, v = this.scrollbarEnabled, p = this.navigatorOptions, E = this.scrollbarOptions, r = E.minWidth, t = this.height, P = this.top, C = this.navigatorEnabled, B = p.outlineWidth, D = B / 2, Y = 0, Z = this.outlineHeight, K = E.barBorderRadius, F = E.barBorderWidth, x = P + D, la;
            if (y(a) && !isNaN(a) && y(b) && !isNaN(b) && (!this.hasDragged || y(c))) {
                this.navigatorLeft = g = z(u.left, e.plotLeft + q);
                this.navigatorWidth = h = z(u.len, e.plotWidth - 2 * q);
                this.scrollerLeft = k = g - q;
                this.scrollerWidth = m = m = h + 2 * q;
                u.getExtremes && (la = this.getUnionExtremes(!0),
                !la || la.dataMin === u.min && la.dataMax === u.max || u.setExtremes(la.dataMin, la.dataMax, !0, !1));
                c = z(c, u.translate(a));
                d = z(d, u.translate(b));
                if (isNaN(c) || Infinity === ra(c))c = 0, d = m;
                if (!(u.translate(d, !0) - u.translate(c, !0) < e.xAxis[0].minRange)) {
                    this.zoomedMax = W(L(c, d, 0), h);
                    this.zoomedMin = W(L(this.fixedWidth ? this.zoomedMax - this.fixedWidth : W(c, d), 0), h);
                    this.range = this.zoomedMax - this.zoomedMin;
                    c = M(this.zoomedMax);
                    b = M(this.zoomedMin);
                    a = c - b;
                    this.rendered || (C && (this.navigatorGroup = u = f.g("navigator").attr({zIndex: 3}).add(),
                        this.leftShade = f.rect().attr({fill: p.maskFill}).add(u), p.maskInside ? this.leftShade.css({cursor: "ew-resize"}) : this.rightShade = f.rect().attr({fill: p.maskFill}).add(u), this.outline = f.path().attr({
                        "stroke-width": B,
                        stroke: p.outlineColor
                    }).add(u)), v && (this.scrollbarGroup = n = f.g("scrollbar").add(), w = E.trackBorderWidth, this.scrollbarTrack = l = f.rect().attr({
                        x: 0,
                        y: -w % 2 / 2,
                        fill: E.trackBackgroundColor,
                        stroke: E.trackBorderColor,
                        "stroke-width": w,
                        r: E.trackBorderRadius || 0,
                        height: q
                    }).add(n), this.scrollbar = w = f.rect().attr({
                        y: -F %
                        2 / 2, height: q, fill: E.barBackgroundColor, stroke: E.barBorderColor, "stroke-width": F, r: K
                    }).add(n), this.scrollbarRifles = f.path().attr({stroke: E.rifleColor, "stroke-width": 1}).add(n)));
                    e = e.isResizing ? "animate" : "attr";
                    if (C) {
                        this.leftShade[e](p.maskInside ? {x: g + b, y: P, width: c - b, height: t} : {
                            x: g,
                            y: P,
                            width: b,
                            height: t
                        });
                        if (this.rightShade)this.rightShade[e]({x: g + c, y: P, width: h - c, height: t});
                        this.outline[e]({
                            d: ["M", k, x, "L", g + b - D, x, g + b - D, x + Z, "L", g + c - D, x + Z, "L", g + c - D, x, k + m, x].concat(p.maskInside ? ["M", g + b + D, x, "L", g + c - D,
                                x] : [])
                        });
                        this.drawHandle(b + D, 0);
                        this.drawHandle(c + D, 1)
                    }
                    v && n && (this.drawScrollbarButton(0), this.drawScrollbarButton(1), n[e]({
                        translateX: k,
                        translateY: M(x + t)
                    }), l[e]({width: m}), g = q + b, h = a - F, h < r && (Y = (r - h) / 2, h = r, g -= Y), this.scrollbarPad = Y, w[e]({
                        x: ka(g) + F % 2 / 2,
                        width: h
                    }), r = q + b + a / 2 - .5, this.scrollbarRifles.attr({visibility: 12 < a ? "visible" : "hidden"})[e]({d: ["M", r - 3, q / 4, "L", r - 3, 2 * q / 3, "M", r, q / 4, "L", r, 2 * q / 3, "M", r + 3, q / 4, "L", r + 3, 2 * q / 3]}));
                    this.scrollbarPad = Y;
                    this.rendered = !0
                }
            }
        }, addEvents: function () {
            var a = this.chart.container,
                b = this.mouseDownHandler, c = this.mouseMoveHandler, d = this.mouseUpHandler, e;
            e = [[a, "mousedown", b], [a, "mousemove", c], [X, "mouseup", d]];
            gb && e.push([a, "touchstart", b], [a, "touchmove", c], [X, "touchend", d]);
            C(e, function (a) {
                aa.apply(null, a)
            });
            this._events = e
        }, removeEvents: function () {
            C(this._events, function (a) {
                sa.apply(null, a)
            });
            this._events = J;
            this.navigatorEnabled && this.baseSeries && sa(this.baseSeries, "updatedData", this.updatedDataHandler)
        }, init: function () {
            var a = this, b = a.chart, c, d, e = a.scrollbarHeight, f = a.navigatorOptions,
                g = a.height, h = a.top, k, m = a.baseSeries;
            a.mouseDownHandler = function (d) {
                d = b.pointer.normalize(d);
                var e = a.zoomedMin, f = a.zoomedMax, h = a.top, m = a.scrollbarHeight, n = a.scrollerLeft, u = a.scrollerWidth, l = a.navigatorLeft, q = a.navigatorWidth, v = a.scrollbarPad, p = a.range, E = d.chartX, r = d.chartY;
                d = b.xAxis[0];
                var z, y = mb ? 10 : 7;
                r > h && r < h + g + m && ((h = !a.scrollbarEnabled || r < h + g) && qa.abs(E - e - l) < y ? (a.grabbedLeft = !0, a.otherHandlePos = f, a.fixedExtreme = d.max, b.fixedRange = null) : h && qa.abs(E - f - l) < y ? (a.grabbedRight = !0, a.otherHandlePos = e, a.fixedExtreme =
                    d.min, b.fixedRange = null) : E > l + e - v && E < l + f + v ? (a.grabbedCenter = E, a.fixedWidth = p, k = E - e) : E > n && E < n + u && (f = h ? E - l - p / 2 : E < l ? e - .2 * p : E > n + u - m ? e + .2 * p : E < l + e ? e - p : f, 0 > f ? f = 0 : f + p >= q && (f = q - p, z = a.getUnionExtremes().dataMax), f !== e && (a.fixedWidth = p, e = c.toFixedRange(f, f + p, null, z), d.setExtremes(e.min, e.max, !0, !1, {trigger: "navigator"}))))
            };
            a.mouseMoveHandler = function (c) {
                var d = a.scrollbarHeight, e = a.navigatorLeft, f = a.navigatorWidth, g = a.scrollerLeft, h = a.scrollerWidth, m = a.range, n, u;
                c.touches && 0 === c.touches[0].pageX || (c = b.pointer.normalize(c),
                    n = c.chartX, n < e ? n = e : n > g + h - d && (n = g + h - d), a.grabbedLeft ? (u = !0, a.render(0, 0, n - e, a.otherHandlePos)) : a.grabbedRight ? (u = !0, a.render(0, 0, a.otherHandlePos, n - e)) : a.grabbedCenter && (u = !0, n < k ? n = k : n > f + k - m && (n = f + k - m), a.render(0, 0, n - k, n - k + m)), u && a.scrollbarOptions.liveRedraw && setTimeout(function () {
                    a.mouseUpHandler(c)
                }, 0), a.hasDragged = u)
            };
            a.mouseUpHandler = function (d) {
                var e, f;
                a.hasDragged && (a.zoomedMin === a.otherHandlePos ? e = a.fixedExtreme : a.zoomedMax === a.otherHandlePos && (f = a.fixedExtreme), a.zoomedMax === a.navigatorWidth &&
                (f = a.getUnionExtremes().dataMax), e = c.toFixedRange(a.zoomedMin, a.zoomedMax, e, f), y(e.min) && b.xAxis[0].setExtremes(e.min, e.max, !0, !1, {
                    trigger: "navigator",
                    triggerOp: "navigator-drag",
                    DOMEvent: d
                }));
                "mousemove" !== d.type && (a.grabbedLeft = a.grabbedRight = a.grabbedCenter = a.fixedWidth = a.fixedExtreme = a.otherHandlePos = a.hasDragged = k = null)
            };
            var n = b.xAxis.length, u = b.yAxis.length;
            b.extraBottomMargin = a.outlineHeight + f.margin;
            a.navigatorEnabled ? (a.xAxis = c = new ga(b, x({
                    breaks: m && m.xAxis.options.breaks,
                    ordinal: m && m.xAxis.options.ordinal
                },
                f.xAxis, {
                    id: "navigator-x-axis",
                    isX: !0,
                    type: "datetime",
                    index: n,
                    height: g,
                    offset: 0,
                    offsetLeft: e,
                    offsetRight: -e,
                    keepOrdinalPadding: !0,
                    startOnTick: !1,
                    endOnTick: !1,
                    minPadding: 0,
                    maxPadding: 0,
                    zoomEnabled: !1
                })), a.yAxis = d = new ga(b, x(f.yAxis, {
                id: "navigator-y-axis",
                alignTicks: !1,
                height: g,
                offset: 0,
                index: u,
                zoomEnabled: !1
            })), m || f.series.data ? a.addBaseSeries() : 0 === b.series.length && ca(b, "redraw", function (c, d) {
                0 < b.series.length && !a.series && (a.setBaseSeries(), b.redraw = c);
                c.call(b, d)
            })) : a.xAxis = c = {
                translate: function (a,
                                     c) {
                    var d = b.xAxis[0], f = d.getExtremes(), g = b.plotWidth - 2 * e, h = Cb("min", d.options.min, f.dataMin), d = Cb("max", d.options.max, f.dataMax) - h;
                    return c ? a * d / g + h : g * (a - h) / d
                }, toFixedRange: ga.prototype.toFixedRange
            };
            ca(b, "getMargins", function (b) {
                var e = this.legend, f = e.options;
                b.apply(this, [].slice.call(arguments, 1));
                a.top = h = a.navigatorOptions.top || this.chartHeight - a.height - a.scrollbarHeight - this.spacing[2] - ("bottom" === f.verticalAlign && f.enabled && !f.floating ? e.legendHeight + z(f.margin, 10) : 0);
                c && d && (c.options.top = d.options.top =
                    h, c.setAxisSize(), d.setAxisSize())
            });
            a.addEvents()
        }, getUnionExtremes: function (a) {
            var b = this.chart.xAxis[0], c = this.xAxis, d = c.options, e = b.options, f;
            a && null === b.dataMin || (f = {
                dataMin: z(d && d.min, Cb("min", e.min, b.dataMin, c.dataMin)),
                dataMax: z(d && d.max, Cb("max", e.max, b.dataMax, c.dataMax))
            });
            return f
        }, setBaseSeries: function (a) {
            var b = this.chart;
            a = a || b.options.navigator.baseSeries;
            this.series && this.series.remove();
            this.baseSeries = b.series[a] || "string" === typeof a && b.get(a) || b.series[0];
            this.xAxis && this.addBaseSeries()
        },
        addBaseSeries: function () {
            var a = this.baseSeries, b = a ? a.options : {}, c = b.data, d = this.navigatorOptions.series, e;
            e = d.data;
            this.hasNavigatorData = !!e;
            b = x(b, d, {
                enableMouseTracking: !1,
                group: "nav",
                padXAxis: !1,
                xAxis: "navigator-x-axis",
                yAxis: "navigator-y-axis",
                name: "Navigator",
                showInLegend: !1,
                stacking: !1,
                isInternal: !0,
                visible: !0
            });
            b.data = e || c.slice(0);
            this.series = this.chart.initSeries(b);
            a && !1 !== this.navigatorOptions.adaptToUpdatedData && (aa(a, "updatedData", this.updatedDataHandler), a.userOptions.events = O(a.userOptions.event,
                {updatedData: this.updatedDataHandler}))
        }, updatedDataHandler: function () {
            var a = this.chart.scroller, b = a.baseSeries, c = b.xAxis, d = c.getExtremes(), e = d.min, f = d.max, g = d.dataMin, d = d.dataMax, h = f - e, k, m, n, u, l, q = a.series;
            k = q.xData;
            var v = !!c.setExtremes;
            m = f >= k[k.length - 1] - (this.closestPointRange || 0);
            k = e <= g;
            a.hasNavigatorData || (q.options.pointStart = b.xData[0], q.setData(b.options.data, !1), l = !0);
            k && (u = g, n = u + h);
            m && (n = d, k || (u = L(n - h, q.xData[0])));
            v && (k || m) ? isNaN(u) || c.setExtremes(u, n, !0, !1, {trigger: "updatedData"}) : (l &&
            this.chart.redraw(!1), a.render(L(e, g), W(f, d)))
        }, destroy: function () {
            this.removeEvents();
            C([this.xAxis, this.yAxis, this.leftShade, this.rightShade, this.outline, this.scrollbarTrack, this.scrollbarRifles, this.scrollbarGroup, this.scrollbar], function (a) {
                a && a.destroy && a.destroy()
            });
            this.xAxis = this.yAxis = this.leftShade = this.rightShade = this.outline = this.scrollbarTrack = this.scrollbarRifles = this.scrollbarGroup = this.scrollbar = null;
            C([this.scrollbarButtons, this.handles, this.elementsToDestroy], function (a) {
                la(a)
            })
        }
    };
    U.Scroller = eb;
    ca(ga.prototype, "zoom", function (a, b, c) {
        var d = this.chart, e = d.options, f = e.chart.zoomType, g = e.navigator, e = e.rangeSelector, h;
        this.isXAxis && (g && g.enabled || e && e.enabled) && ("x" === f ? d.resetZoomButton = "blocked" : "y" === f ? h = !1 : "xy" === f && (d = this.previousZoom, y(b) ? this.previousZoom = [this.min, this.max] : d && (b = d[0], c = d[1], delete this.previousZoom)));
        return h !== J ? h : a.call(this, b, c)
    });
    ca(Na.prototype, "init", function (a, b, c) {
        aa(this, "beforeRender", function () {
            var a = this.options;
            if (a.navigator.enabled || a.scrollbar.enabled)this.scroller =
                new eb(this)
        });
        a.call(this, b, c)
    });
    ca(da.prototype, "addPoint", function (a, b, c, d, e) {
        var f = this.options.turboThreshold;
        f && this.xData.length > f && R(b) && !N(b) && this.chart.scroller && T(20, !0);
        a.call(this, b, c, d, e)
    });
    O(pa, {
        rangeSelector: {
            buttonTheme: {
                width: 28,
                height: 18,
                fill: "#f7f7f7",
                padding: 2,
                r: 0,
                "stroke-width": 0,
                style: {color: "#444", cursor: "pointer", fontWeight: "normal"},
                zIndex: 7,
                states: {
                    hover: {fill: "#e7e7e7"},
                    select: {fill: "#e7f0f9", style: {color: "black", fontWeight: "bold"}}
                }
            }, height: 35, inputPosition: {align: "right"},
            labelStyle: {color: "#666"}
        }
    });
    pa.lang = x(pa.lang, {rangeSelectorZoom: "Zoom", rangeSelectorFrom: "From", rangeSelectorTo: "To"});
    fb.prototype = {
        clickButton: function (a, b) {
            var c = this, d = c.selected, e = c.chart, f = c.buttons, g = c.buttonOptions[a], h = e.xAxis[0], k = e.scroller && e.scroller.getUnionExtremes() || h || {}, m = k.dataMin, n = k.dataMax, u, l = h && M(W(h.max, z(n, h.max))), q = g.type, v, k = g._range, p, E, r, y = g.dataGrouping;
            if (null !== m && null !== n && a !== c.selected) {
                e.fixedRange = k;
                y && (this.forcedDataGrouping = !0, ga.prototype.setDataGrouping.call(h ||
                    {chart: this.chart}, y, !1));
                if ("month" === q || "year" === q)h ? (q = {
                    range: g,
                    max: l,
                    dataMin: m,
                    dataMax: n
                }, u = h.minFromRange.call(q), "number" === typeof q.newMax && (l = q.newMax)) : k = g; else if (k)u = L(l - k, m), l = W(u + k, n); else if ("ytd" === q)if (h)n === J && (m = Number.MAX_VALUE, n = Number.MIN_VALUE, C(e.series, function (a) {
                    a = a.xData;
                    m = W(a[0], m);
                    n = L(a[a.length - 1], n)
                }), b = !1), l = new xa(n), u = l.getFullYear(), u = p = L(m || 0, xa.UTC(u, 0, 1)), l = l.getTime(), l = W(n || l, l); else {
                    aa(e, "beforeRender", function () {
                        c.clickButton(a)
                    });
                    return
                } else"all" === q && h &&
                (u = m, l = n);
                f[d] && f[d].setState(0);
                f[a] && (f[a].setState(2), c.lastSelected = a);
                h ? (h.setExtremes(u, l, z(b, 1), 0, {
                    trigger: "rangeSelectorButton",
                    rangeSelectorButton: g
                }), c.setSelected(a)) : (v = e.options.xAxis[0], r = v.range, v.range = k, E = v.min, v.min = p, c.setSelected(a), aa(e, "load", function () {
                    v.range = r;
                    v.min = E
                }))
            }
        },
        setSelected: function (a) {
            this.selected = this.options.selected = a
        },
        defaultButtons: [{type: "month", count: 1, text: "1m"}, {type: "month", count: 3, text: "3m"}, {
            type: "month",
            count: 6,
            text: "6m"
        }, {type: "ytd", text: "YTD"},
            {type: "year", count: 1, text: "1y"}, {type: "all", text: "All"}],
        init: function (a) {
            var b = this, c = a.options.rangeSelector, d = c.buttons || [].concat(b.defaultButtons), e = c.selected, f = b.blurInputs = function () {
                var a = b.minInput, c = b.maxInput;
                a && a.blur && na(a, "blur");
                c && c.blur && na(c, "blur")
            };
            b.chart = a;
            b.options = c;
            b.buttons = [];
            a.extraTopMargin = c.height;
            b.buttonOptions = d;
            aa(a.container, "mousedown", f);
            aa(a, "resize", f);
            C(d, b.computeButtonRange);
            e !== J && d[e] && this.clickButton(e, !1);
            aa(a, "load", function () {
                aa(a.xAxis[0], "setExtremes",
                    function (c) {
                        this.max - this.min !== a.fixedRange && "rangeSelectorButton" !== c.trigger && "updatedData" !== c.trigger && b.forcedDataGrouping && this.setDataGrouping(!1, !1)
                    });
                aa(a.xAxis[0], "afterSetExtremes", function () {
                    b.updateButtonStates(!0)
                })
            })
        },
        updateButtonStates: function (a) {
            var b = this, c = this.chart, d = c.xAxis[0], e = c.scroller && c.scroller.getUnionExtremes() || d, f = e.dataMin, g = e.dataMax, h = b.selected, k = b.options.allButtonsEnabled, m = b.buttons;
            a && c.fixedRange !== M(d.max - d.min) && (m[h] && m[h].setState(0), b.setSelected(null));
            C(b.buttonOptions, function (a, e) {
                var l = M(d.max - d.min), q = a._range, v = a.type, p = a.count || 1, E = q > g - f, r = q < d.minRange, z = "all" === a.type && d.max - d.min >= g - f && 2 !== m[e].state, y = "ytd" === a.type && Da("%Y", f) === Da("%Y", g), t = c.renderer.forExport && e === h, q = q === l, P = !d.hasVisibleSeries;
                ("month" === v || "year" === v) && l >= 864E5 * {
                    month: 28,
                    year: 365
                }[v] * p && l <= 864E5 * {month: 31, year: 366}[v] * p && (q = !0);
                t || q && e !== h && e === b.lastSelected ? (b.setSelected(e), m[e].setState(2)) : !k && (E || r || z || y || P) ? m[e].setState(3) : 3 === m[e].state && m[e].setState(0)
            })
        },
        computeButtonRange: function (a) {
            var b = a.type, c = a.count || 1, d = {
                millisecond: 1,
                second: 1E3,
                minute: 6E4,
                hour: 36E5,
                day: 864E5,
                week: 6048E5
            };
            if (d[b])a._range = d[b] * c; else if ("month" === b || "year" === b)a._range = 864E5 * {
                    month: 30,
                    year: 365
                }[b] * c
        },
        setInputValue: function (a, b) {
            var c = this.chart.options.rangeSelector;
            y(b) && (this[a + "Input"].HCTime = b);
            this[a + "Input"].value = Da(c.inputEditDateFormat || "%Y-%m-%d", this[a + "Input"].HCTime);
            this[a + "DateBox"].attr({text: Da(c.inputDateFormat || "%b %e, %Y", this[a + "Input"].HCTime)})
        },
        showInput: function (a) {
            var b =
                this.inputGroup, c = this[a + "DateBox"];
            F(this[a + "Input"], {
                left: b.translateX + c.x + "px",
                top: b.translateY + "px",
                width: c.width - 2 + "px",
                height: c.height - 2 + "px",
                border: "2px solid silver"
            })
        },
        hideInput: function (a) {
            F(this[a + "Input"], {border: 0, width: "1px", height: "1px"});
            this.setInputValue(a)
        },
        drawInput: function (a) {
            function b() {
                var a = m.value, b = (g.inputDateParser || xa.parse)(a), e = d.xAxis[0], f = e.dataMin, h = e.dataMax;
                b !== m.previousValue && (m.previousValue = b, isNaN(b) && (b = a.split("-"), b = xa.UTC(H(b[0]), H(b[1]) - 1, H(b[2]))),
                isNaN(b) || (pa.global.useUTC || (b += 6E4 * (new xa).getTimezoneOffset()), k ? b > c.maxInput.HCTime ? b = J : b < f && (b = f) : b < c.minInput.HCTime ? b = J : b > h && (b = h), b !== J && d.xAxis[0].setExtremes(k ? b : e.min, k ? e.max : b, J, J, {trigger: "rangeSelectorInput"})))
            }

            var c = this, d = c.chart, e = d.renderer.style, f = d.renderer, g = d.options.rangeSelector, h = c.div, k = "min" === a, m, n, l = this.inputGroup;
            this[a + "Label"] = n = f.label(pa.lang[k ? "rangeSelectorFrom" : "rangeSelectorTo"], this.inputGroup.offset).attr({padding: 2}).css(x(e, g.labelStyle)).add(l);
            l.offset +=
                n.width + 5;
            this[a + "DateBox"] = f = f.label("", l.offset).attr({
                padding: 2,
                width: g.inputBoxWidth || 90,
                height: g.inputBoxHeight || 17,
                stroke: g.inputBoxBorderColor || "silver",
                "stroke-width": 1
            }).css(x({textAlign: "center", color: "#444"}, e, g.inputStyle)).on("click", function () {
                c.showInput(a);
                c[a + "Input"].focus()
            }).add(l);
            l.offset += f.width + (k ? 10 : 0);
            this[a + "Input"] = m = ia("input", {name: a, className: "highcharts-range-selector", type: "text"}, O({
                position: "absolute", border: 0, width: "1px", height: "1px", padding: 0, textAlign: "center",
                fontSize: e.fontSize, fontFamily: e.fontFamily, left: "-9em", top: d.plotTop + "px"
            }, g.inputStyle), h);
            m.onfocus = function () {
                c.showInput(a)
            };
            m.onblur = function () {
                c.hideInput(a)
            };
            m.onchange = b;
            m.onkeypress = function (a) {
                13 === a.keyCode && b()
            }
        },
        getPosition: function () {
            var a = this.chart, b = a.options.rangeSelector, a = z((b.buttonPosition || {}).y, a.plotTop - a.axisOffset[0] - b.height);
            return {buttonTop: a, inputTop: a - 10}
        },
        render: function (a, b) {
            var c = this, d = c.chart, e = d.renderer, f = d.container, g = d.options, h = g.exporting && !1 !== g.exporting.enabled &&
                g.navigation && g.navigation.buttonOptions, k = g.rangeSelector, m = c.buttons, g = pa.lang, n = c.div, n = c.inputGroup, l = k.buttonTheme, q = k.buttonPosition || {}, v = k.inputEnabled, p = l && l.states, E = d.plotLeft, r, t = this.getPosition(), P = c.group, B = c.rendered;
            B || (c.group = P = e.g("range-selector-buttons").add(), c.zoomText = e.text(g.rangeSelectorZoom, z(q.x, E), 15).css(k.labelStyle).add(P), r = z(q.x, E) + c.zoomText.getBBox().width + 5, C(c.buttonOptions, function (a, b) {
                m[b] = e.button(a.text, r, 0, function () {
                        c.clickButton(b);
                        c.isActive = !0
                    }, l,
                    p && p.hover, p && p.select, p && p.disabled).css({textAlign: "center"}).add(P);
                r += m[b].width + z(k.buttonSpacing, 5);
                c.selected === b && m[b].setState(2)
            }), c.updateButtonStates(), !1 !== v && (c.div = n = ia("div", null, {
                position: "relative",
                height: 0,
                zIndex: 1
            }), f.parentNode.insertBefore(n, f), c.inputGroup = n = e.g("input-group").add(), n.offset = 0, c.drawInput("min"), c.drawInput("max")));
            P[B ? "animate" : "attr"]({translateY: t.buttonTop});
            !1 !== v && (n.align(O({
                y: t.inputTop, width: n.offset, x: h && t.inputTop < (h.y || 0) + h.height - d.spacing[0] ?
                    -40 : 0
            }, k.inputPosition), !0, d.spacingBox), y(v) || (d = P.getBBox(), n[n.translateX < d.x + d.width + 10 ? "hide" : "show"]()), c.setInputValue("min", a), c.setInputValue("max", b));
            c.rendered = !0
        },
        destroy: function () {
            var a = this.minInput, b = this.maxInput, c = this.chart, d = this.blurInputs, e;
            sa(c.container, "mousedown", d);
            sa(c, "resize", d);
            la(this.buttons);
            a && (a.onfocus = a.onblur = a.onchange = null);
            b && (b.onfocus = b.onblur = b.onchange = null);
            for (e in this)this[e] && "chart" !== e && (this[e].destroy ? this[e].destroy() : this[e].nodeType && Sa(this[e])),
                this[e] = null
        }
    };
    ga.prototype.toFixedRange = function (a, b, c, d) {
        var e = this.chart && this.chart.fixedRange;
        a = z(c, this.translate(a, !0));
        b = z(d, this.translate(b, !0));
        c = e && (b - a) / e;
        .7 < c && 1.3 > c && (d ? a = b - e : b = a + e);
        isNaN(a) && (a = b = void 0);
        return {min: a, max: b}
    };
    ga.prototype.minFromRange = function () {
        var a = this.range, b = {month: "Month", year: "FullYear"}[a.type], c, d = this.max, e, f, g = function (a, c) {
            var d = new xa(a);
            d["set" + b](d["get" + b]() + c);
            return d.getTime() - a
        };
        "number" === typeof a ? (c = this.max - a, f = a) : c = d + g(d, -a.count);
        e = z(this.dataMin,
            Number.MIN_VALUE);
        isNaN(c) && (c = e);
        c <= e && (c = e, void 0 === f && (f = g(c, a.count)), this.newMax = W(c + f, this.dataMax));
        isNaN(d) && (c = void 0);
        return c
    };
    ca(Na.prototype, "init", function (a, b, c) {
        aa(this, "init", function () {
            this.options.rangeSelector.enabled && (this.rangeSelector = new fb(this))
        });
        a.call(this, b, c)
    });
    U.RangeSelector = fb;
    Na.prototype.callbacks.push(function (a) {
        function b() {
            f = a.xAxis[0].getExtremes();
            g.render(f.min, f.max)
        }

        function c() {
            f = a.xAxis[0].getExtremes();
            isNaN(f.min) || h.render(f.min, f.max)
        }

        function d(a) {
            "navigator-drag" !==
            a.triggerOp && g.render(a.min, a.max)
        }

        function e(a) {
            h.render(a.min, a.max)
        }

        var f, g = a.scroller, h = a.rangeSelector;
        g && (aa(a.xAxis[0], "afterSetExtremes", d), ca(a, "drawChartBox", function (a) {
            var c = this.isDirtyBox;
            a.call(this);
            c && b()
        }), b());
        h && (aa(a.xAxis[0], "afterSetExtremes", e), aa(a, "resize", c), c());
        aa(a, "destroy", function () {
            g && sa(a.xAxis[0], "afterSetExtremes", d);
            h && (sa(a, "resize", c), sa(a.xAxis[0], "afterSetExtremes", e))
        })
    });
    U.StockChart = U.stockChart = function (a, b, c) {
        var d = ea(a) || a.nodeName, e = arguments[d ? 1 : 0],
            f = e.series, g, h = z(e.navigator && e.navigator.enabled, !0) ? {
                startOnTick: !1,
                endOnTick: !1
            } : null, k = {marker: {enabled: !1, radius: 2}}, m = {shadow: !1, borderWidth: 0};
        e.xAxis = Ea(B(e.xAxis || {}), function (a) {
            return x({
                minPadding: 0,
                maxPadding: 0,
                ordinal: !0,
                title: {text: null},
                labels: {overflow: "justify"},
                showLastLabel: !0
            }, a, {type: "datetime", categories: null}, h)
        });
        e.yAxis = Ea(B(e.yAxis || {}), function (a) {
            g = z(a.opposite, !0);
            return x({labels: {y: -2}, opposite: g, showLastLabel: !1, title: {text: null}}, a)
        });
        e.series = null;
        e = x({
            chart: {
                panning: !0,
                pinchType: "x"
            },
            navigator: {enabled: !0},
            scrollbar: {enabled: !0},
            rangeSelector: {enabled: !0},
            title: {text: null, style: {fontSize: "16px"}},
            tooltip: {shared: !0, crosshairs: !0},
            legend: {enabled: !1},
            plotOptions: {
                line: k,
                spline: k,
                area: k,
                areaspline: k,
                arearange: k,
                areasplinerange: k,
                column: m,
                columnrange: m,
                candlestick: m,
                ohlc: m
            }
        }, e, {_stock: !0, chart: {inverted: !1}});
        e.series = f;
        return d ? new Na(a, e, c) : new Na(e, b)
    };
    ca(Ya.prototype, "init", function (a, b, c) {
        var d = c.chart.pinchType || "";
        a.call(this, b, c);
        this.pinchX = this.pinchHor =
            -1 !== d.indexOf("x");
        this.pinchY = this.pinchVert = -1 !== d.indexOf("y");
        this.hasZoom = this.hasZoom || this.pinchHor || this.pinchVert
    });
    ca(ga.prototype, "autoLabelAlign", function (a) {
        var b = this.chart, c = this.options, b = b._labelPanes = b._labelPanes || {}, d = this.options.labels;
        return this.chart.options._stock && "yAxis" === this.coll && (c = c.top + "," + c.height, !b[c] && d.enabled) ? (15 === d.x && (d.x = 0), void 0 === d.align && (d.align = "right"), b[c] = 1, "right") : a.call(this, [].slice.call(arguments, 1))
    });
    ca(ga.prototype, "getPlotLinePath",
        function (a, b, c, d, e, f) {
            var g = this, h = this.isLinked && !this.series ? this.linkedParent.series : this.series, k = g.chart, m = k.renderer, n = g.left, l = g.top, q, v, p, E, r = [], t = [], P, B;
            if ("colorAxis" === g.coll)return a.apply(this, [].slice.call(arguments, 1));
            t = g.isXAxis ? y(g.options.yAxis) ? [k.yAxis[g.options.yAxis]] : Ea(h, function (a) {
                return a.yAxis
            }) : y(g.options.xAxis) ? [k.xAxis[g.options.xAxis]] : Ea(h, function (a) {
                return a.xAxis
            });
            C(g.isXAxis ? k.yAxis : k.xAxis, function (a) {
                if (y(a.options.id) ? -1 === a.options.id.indexOf("navigator") :
                        1) {
                    var b = a.isXAxis ? "yAxis" : "xAxis", b = y(a.options[b]) ? k[b][a.options[b]] : k[b][0];
                    g === b && t.push(a)
                }
            });
            P = t.length ? [] : [g.isXAxis ? k.yAxis[0] : k.xAxis[0]];
            C(t, function (a) {
                -1 === Ia(a, P) && P.push(a)
            });
            B = z(f, g.translate(b, null, null, d));
            isNaN(B) || (g.horiz ? C(P, function (a) {
                var b;
                v = a.pos;
                E = v + a.len;
                q = p = M(B + g.transB);
                if (q < n || q > n + g.width)e ? q = p = W(L(n, q), n + g.width) : b = !0;
                b || r.push("M", q, v, "L", p, E)
            }) : C(P, function (a) {
                var b;
                q = a.pos;
                p = q + a.len;
                v = E = M(l + g.height - B);
                if (v < l || v > l + g.height)e ? v = E = W(L(l, v), g.top + g.height) : b = !0;
                b ||
                r.push("M", q, v, "L", p, E)
            }));
            return 0 < r.length ? m.crispPolyLine(r, c || 1) : null
        });
    ga.prototype.getPlotBandPath = function (a, b) {
        var c = this.getPlotLinePath(b, null, null, !0), d = this.getPlotLinePath(a, null, null, !0), e = [], f;
        if (d && c && d.toString() !== c.toString())for (f = 0; f < d.length; f += 6)e.push("M", d[f + 1], d[f + 2], "L", d[f + 4], d[f + 5], c[f + 4], c[f + 5], c[f + 1], c[f + 2]); else e = null;
        return e
    };
    La.prototype.crispPolyLine = function (a, b) {
        var c;
        for (c = 0; c < a.length; c += 6)a[c + 1] === a[c + 4] && (a[c + 1] = a[c + 4] = M(a[c + 1]) - b % 2 / 2), a[c + 2] === a[c + 5] && (a[c +
        2] = a[c + 5] = M(a[c + 2]) + b % 2 / 2);
        return a
    };
    bb === U.VMLRenderer && (qb.prototype.crispPolyLine = La.prototype.crispPolyLine);
    ca(ga.prototype, "hideCrosshair", function (a, b) {
        a.call(this, b);
        this.crossLabel && (this.crossLabel = this.crossLabel.hide())
    });
    ca(ga.prototype, "drawCrosshair", function (a, b, c) {
        var d, e;
        a.call(this, b, c);
        if (y(this.crosshair.label) && this.crosshair.label.enabled) {
            e = this.chart;
            var f = this.options.crosshair.label;
            d = this.horiz;
            var g = this.opposite, h = this.left, k = this.top;
            a = this.crossLabel;
            var m, n = f.format,
                l = "", w = "inside" === this.options.tickPosition, v = !1 !== this.crosshair.snap;
            m = d ? "center" : g ? "right" === this.labelAlign ? "right" : "left" : "left" === this.labelAlign ? "left" : "center";
            a || (a = this.crossLabel = e.renderer.label(null, null, null, f.shape || "callout").attr({
                align: f.align || m,
                zIndex: 12,
                fill: f.backgroundColor || this.series[0] && this.series[0].color || "gray",
                padding: z(f.padding, 8),
                stroke: f.borderColor || "",
                "stroke-width": f.borderWidth || 0,
                r: z(f.borderRadius, 3)
            }).css(O({
                color: "white", fontWeight: "normal", fontSize: "11px",
                textAlign: "center"
            }, f.style)).add());
            d ? (m = v ? c.plotX + h : b.chartX, k += g ? 0 : this.height) : (m = g ? this.width + h : 0, k = v ? c.plotY + k : b.chartY);
            n || f.formatter || (this.isDatetimeAxis && (l = "%b %d, %Y"), n = "{value" + (l ? ":" + l : "") + "}");
            b = v ? c[this.isXAxis ? "x" : "y"] : this.toValue(d ? b.chartX : b.chartY);
            a.attr({
                text: n ? q(n, {value: b}) : f.formatter.call(this, b),
                anchorX: d ? m : this.opposite ? 0 : e.chartWidth,
                anchorY: d ? this.opposite ? e.chartHeight : 0 : k,
                x: m,
                y: k,
                visibility: "visible"
            });
            b = a.getBBox();
            if (d) {
                if (w && !g || !w && g)k = a.y - b.height
            } else k = a.y -
                b.height / 2;
            d ? (d = h - b.x, e = h + this.width - b.x) : (d = "left" === this.labelAlign ? h : 0, e = "right" === this.labelAlign ? h + this.width : e.chartWidth);
            a.translateX < d && (m += d - a.translateX);
            a.translateX + b.width >= e && (m -= a.translateX + b.width - e);
            a.attr({x: m, y: k, visibility: "visible"})
        }
    });
    var wc = Aa.init, xc = Aa.processData, yc = Ja.prototype.tooltipFormatter;
    Aa.init = function () {
        wc.apply(this, arguments);
        this.setCompare(this.options.compare)
    };
    Aa.setCompare = function (a) {
        this.modifyValue = "value" === a || "percent" === a ? function (b, c) {
            var d = this.compareValue;
            b !== J && (b = "value" === a ? b - d : b = b / d * 100 - 100, c && (c.change = b));
            return b
        } : null;
        this.chart.hasRendered && (this.isDirty = !0)
    };
    Aa.processData = function () {
        var a, b = -1, c, d, e, f;
        xc.apply(this, arguments);
        if (this.xAxis && this.processedYData)for (c = this.processedXData, d = this.processedYData, e = d.length, this.pointArrayMap && (b = Ia(this.pointValKey || "y", this.pointArrayMap)), a = 0; a < e; a++)if (f = -1 < b ? d[a][b] : d[a], "number" === typeof f && c[a] >= this.xAxis.min && 0 !== f) {
            this.compareValue = f;
            break
        }
    };
    ca(Aa, "getExtremes", function (a) {
        var b;
        a.apply(this,
            [].slice.call(arguments, 1));
        this.modifyValue && (b = [this.modifyValue(this.dataMin), this.modifyValue(this.dataMax)], this.dataMin = Y(b), this.dataMax = ya(b))
    });
    ga.prototype.setCompare = function (a, b) {
        this.isXAxis || (C(this.series, function (b) {
            b.setCompare(a)
        }), z(b, !0) && this.chart.redraw())
    };
    Ja.prototype.tooltipFormatter = function (a) {
        a = a.replace("{point.change}", (0 < this.change ? "+" : "") + U.numberFormat(this.change, z(this.series.tooltipOptions.changeDecimals, 2)));
        return yc.apply(this, [a])
    };
    ca(da.prototype, "render",
        function (a) {
            this.chart.options._stock && this.xAxis && (!this.clipBox && this.animate ? (this.clipBox = x(this.chart.clipBox), this.clipBox.width = this.xAxis.len, this.clipBox.height = this.yAxis.len) : this.chart[this.sharedClipKey] && (Xa(this.chart[this.sharedClipKey]), this.chart[this.sharedClipKey].attr({
                width: this.xAxis.len,
                height: this.yAxis.len
            })));
            a.call(this)
        });
    O(Yb.prototype, {
        init: function (a, b, c) {
            var d = this, e = d.defaultOptions;
            d.chart = b;
            d.options = a = x(e, b.angular ? {background: {}} : void 0, a);
            (a = a.background) && C([].concat(B(a)).reverse(),
                function (a) {
                    var b = a.backgroundColor, e = c.userOptions;
                    a = x(d.defaultBackgroundOptions, a);
                    b && (a.backgroundColor = b);
                    a.color = a.backgroundColor;
                    c.options.plotBands.unshift(a);
                    e.plotBands = e.plotBands || [];
                    e.plotBands !== c.options.plotBands && e.plotBands.unshift(a)
                })
        }, defaultOptions: {center: ["50%", "50%"], size: "85%", startAngle: 0}, defaultBackgroundOptions: {
            shape: "circle",
            borderWidth: 1,
            borderColor: "silver",
            backgroundColor: {linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1}, stops: [[0, "#FFF"], [1, "#DDD"]]},
            from: -Number.MAX_VALUE,
            innerRadius: 0,
            to: Number.MAX_VALUE,
            outerRadius: "105%"
        }
    });
    var sb = ga.prototype, Sb = ua.prototype, zc = {
        getOffset: oa, redraw: function () {
            this.isDirty = !1
        }, render: function () {
            this.isDirty = !1
        }, setScale: oa, setCategories: oa, setTitle: oa
    }, ic = {
        isRadial: !0,
        defaultRadialGaugeOptions: {
            labels: {align: "center", x: 0, y: null},
            minorGridLineWidth: 0,
            minorTickInterval: "auto",
            minorTickLength: 10,
            minorTickPosition: "inside",
            minorTickWidth: 1,
            tickLength: 10,
            tickPosition: "inside",
            tickWidth: 2,
            title: {rotation: 0},
            zIndex: 2
        },
        defaultRadialXOptions: {
            gridLineWidth: 1,
            labels: {align: null, distance: 15, x: 0, y: null},
            maxPadding: 0,
            minPadding: 0,
            showLastLabel: !1,
            tickLength: 0
        },
        defaultRadialYOptions: {
            gridLineInterpolation: "circle",
            labels: {align: "right", x: -3, y: -2},
            showLastLabel: !1,
            title: {x: 4, text: null, rotation: 90}
        },
        setOptions: function (a) {
            a = this.options = x(this.defaultOptions, this.defaultRadialOptions, a);
            a.plotBands || (a.plotBands = [])
        },
        getOffset: function () {
            sb.getOffset.call(this);
            this.chart.axisOffset[this.side] = 0;
            this.center = this.pane.center = bc.getCenter.call(this.pane)
        },
        getLinePath: function (a,
                               b) {
            var c = this.center;
            b = z(b, c[2] / 2 - this.offset);
            return this.chart.renderer.symbols.arc(this.left + c[0], this.top + c[1], b, b, {
                start: this.startAngleRad,
                end: this.endAngleRad,
                open: !0,
                innerR: 0
            })
        },
        setAxisTranslation: function () {
            sb.setAxisTranslation.call(this);
            this.center && (this.transA = this.isCircular ? (this.endAngleRad - this.startAngleRad) / (this.max - this.min || 1) : this.center[2] / 2 / (this.max - this.min || 1), this.minPixelPadding = this.isXAxis ? this.transA * this.minPointOffset : 0)
        },
        beforeSetTickPositions: function () {
            this.autoConnect &&
            (this.max += this.categories && 1 || this.pointRange || this.closestPointRange || 0)
        },
        setAxisSize: function () {
            sb.setAxisSize.call(this);
            this.isRadial && (this.center = this.pane.center = U.CenteredSeriesMixin.getCenter.call(this.pane), this.isCircular && (this.sector = this.endAngleRad - this.startAngleRad), this.len = this.width = this.height = this.center[2] * z(this.sector, 1) / 2)
        },
        getPosition: function (a, b) {
            return this.postTranslate(this.isCircular ? this.translate(a) : 0, z(this.isCircular ? b : this.translate(a), this.center[2] / 2) - this.offset)
        },
        postTranslate: function (a, b) {
            var c = this.chart, d = this.center;
            a = this.startAngleRad + a;
            return {x: c.plotLeft + d[0] + Math.cos(a) * b, y: c.plotTop + d[1] + Math.sin(a) * b}
        },
        getPlotBandPath: function (a, b, c) {
            var d = this.center, e = this.startAngleRad, f = d[2] / 2, g = [z(c.outerRadius, "100%"), c.innerRadius, z(c.thickness, 10)], h = /%$/, k, m = this.isCircular;
            "polygon" === this.options.gridLineInterpolation ? d = this.getPlotLinePath(a).concat(this.getPlotLinePath(b, !0)) : (a = Math.max(a, this.min), b = Math.min(b, this.max), m || (g[0] = this.translate(a),
                g[1] = this.translate(b)), g = Ea(g, function (a) {
                h.test(a) && (a = H(a, 10) * f / 100);
                return a
            }), "circle" !== c.shape && m ? (a = e + this.translate(a), b = e + this.translate(b)) : (a = -Math.PI / 2, b = 1.5 * Math.PI, k = !0), d = this.chart.renderer.symbols.arc(this.left + d[0], this.top + d[1], g[0], g[0], {
                start: Math.min(a, b),
                end: Math.max(a, b),
                innerR: z(g[1], g[0] - g[2]),
                open: k
            }));
            return d
        },
        getPlotLinePath: function (a, b) {
            var c = this, d = c.center, e = c.chart, f = c.getPosition(a), g, h, k;
            c.isCircular ? k = ["M", d[0] + e.plotLeft, d[1] + e.plotTop, "L", f.x, f.y] : "circle" ===
            c.options.gridLineInterpolation ? (a = c.translate(a)) && (k = c.getLinePath(0, a)) : (C(e.xAxis, function (a) {
                a.pane === c.pane && (g = a)
            }), k = [], a = c.translate(a), d = g.tickPositions, g.autoConnect && (d = d.concat([d[0]])), b && (d = [].concat(d).reverse()), C(d, function (b, c) {
                h = g.getPosition(b, a);
                k.push(c ? "L" : "M", h.x, h.y)
            }));
            return k
        },
        getTitlePosition: function () {
            var a = this.center, b = this.chart, c = this.options.title;
            return {
                x: b.plotLeft + a[0] + (c.x || 0),
                y: b.plotTop + a[1] - {high: .5, middle: .25, low: 0}[c.align] * a[2] + (c.y || 0)
            }
        }
    };
    ca(sb, "init",
        function (a, b, c) {
            var d = b.angular, e = b.polar, f = c.isX, g = d && f, h, k;
            k = b.options;
            var m = c.pane || 0;
            if (d) {
                if (O(this, g ? zc : ic), h = !f)this.defaultRadialOptions = this.defaultRadialGaugeOptions
            } else e && (O(this, ic), this.defaultRadialOptions = (h = f) ? this.defaultRadialXOptions : x(this.defaultYAxisOptions, this.defaultRadialYOptions));
            a.call(this, b, c);
            g || !d && !e || (a = this.options, b.panes || (b.panes = []), this.pane = m = b.panes[m] = b.panes[m] || new Yb(B(k.pane)[m], b, this), m = m.options, b.inverted = !1, k.chart.zoomType = null, this.startAngleRad =
                b = (m.startAngle - 90) * Math.PI / 180, this.endAngleRad = k = (z(m.endAngle, m.startAngle + 360) - 90) * Math.PI / 180, this.offset = a.offset || 0, (this.isCircular = h) && c.max === J && k - b === 2 * Math.PI && (this.autoConnect = !0))
        });
    ca(sb, "autoLabelAlign", function (a) {
        if (!this.isRadial)return a.apply(this, [].slice.call(arguments, 1))
    });
    ca(Sb, "getPosition", function (a, b, c, d, e) {
        var f = this.axis;
        return f.getPosition ? f.getPosition(c) : a.call(this, b, c, d, e)
    });
    ca(Sb, "getLabelPosition", function (a, b, c, d, e, f, g, h, k) {
        var m = this.axis, n = f.y, l = 20, q = f.align,
            v = (m.translate(this.pos) + m.startAngleRad + Math.PI / 2) / Math.PI * 180 % 360;
        m.isRadial ? (a = m.getPosition(this.pos, m.center[2] / 2 + z(f.distance, -25)), "auto" === f.rotation ? d.attr({rotation: v}) : null === n && (n = m.chart.renderer.fontMetrics(d.styles.fontSize).b - d.getBBox().height / 2), null === q && (m.isCircular ? (this.label.getBBox().width > m.len * m.tickInterval / (m.max - m.min) && (l = 0), q = v > l && v < 180 - l ? "left" : v > 180 + l && v < 360 - l ? "right" : "center") : q = "center", d.attr({align: q})), a.x += f.x, a.y += n) : a = a.call(this, b, c, d, e, f, g, h, k);
        return a
    });
    ca(Sb, "getMarkPath", function (a, b, c, d, e, f, g) {
        var h = this.axis;
        h.isRadial ? (a = h.getPosition(this.pos, h.center[2] / 2 + d), b = ["M", b, c, "L", a.x, a.y]) : b = a.call(this, b, c, d, e, f, g);
        return b
    });
    ba.arearange = x(ba.area, {
        lineWidth: 1,
        marker: null,
        threshold: null,
        tooltip: {pointFormat: '<span style="color:{series.color}">\u25cf</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>'},
        trackByArea: !0,
        dataLabels: {align: null, verticalAlign: null, xLow: 0, xHigh: 0, yLow: 0, yHigh: 0},
        states: {hover: {halo: !1}}
    });
    S.arearange =
        I(S.area, {
            type: "arearange",
            pointArrayMap: ["low", "high"],
            dataLabelCollections: ["dataLabel", "dataLabelUpper"],
            toYData: function (a) {
                return [a.low, a.high]
            },
            pointValKey: "low",
            deferTranslatePolar: !0,
            highToXY: function (a) {
                var b = this.chart, c = this.xAxis.postTranslate(a.rectPlotX, this.yAxis.len - a.plotHigh);
                a.plotHighX = c.x - b.plotLeft;
                a.plotHigh = c.y - b.plotTop
            },
            translate: function () {
                var a = this, b = a.yAxis;
                S.area.prototype.translate.apply(a);
                C(a.points, function (a) {
                    var d = a.low, e = a.high, f = a.plotY;
                    null === e || null === d ? a.isNull = !0 : (a.plotLow = f, a.plotHigh = b.translate(e, 0, 1, 0, 1))
                });
                this.chart.polar && C(this.points, function (b) {
                    a.highToXY(b)
                })
            },
            getGraphPath: function () {
                var a = this.points, b = [], c = [], d = a.length, e = da.prototype.getGraphPath, f, g, h;
                h = this.options;
                for (var k = h.step, d = a.length; d--;)f = a[d], f.isNull || a[d + 1] && !a[d + 1].isNull || c.push({
                    plotX: f.plotX,
                    plotY: f.plotLow
                }), g = {
                    plotX: f.plotX,
                    plotY: f.plotHigh,
                    isNull: f.isNull
                }, c.push(g), b.push(g), f.isNull || a[d - 1] && !a[d - 1].isNull || c.push({
                    plotX: f.plotX,
                    plotY: f.plotLow
                });
                a = e.call(this, a);
                k && (!0 === k && (k = "left"), h.step = {left: "right", center: "center", right: "left"}[k]);
                b = e.call(this, b);
                c = e.call(this, c);
                h.step = k;
                h = [].concat(a, b);
                this.chart.polar || "M" !== c[0] || (c[0] = "L");
                this.areaPath = this.areaPath.concat(a, c);
                return h
            },
            drawDataLabels: function () {
                var a = this.data, b = a.length, c, d = [], e = da.prototype, f = this.options.dataLabels, g = f.align, h = f.verticalAlign, k = f.inside, m, n, l = this.chart.inverted;
                if (f.enabled || this._hasPointLabels) {
                    for (c = b; c--;)if (m = a[c])n = k ? m.plotHigh < m.plotLow : m.plotHigh > m.plotLow, m.y =
                        m.high, m._plotY = m.plotY, m.plotY = m.plotHigh, d[c] = m.dataLabel, m.dataLabel = m.dataLabelUpper, m.below = n, l ? g || (f.align = n ? "right" : "left") : h || (f.verticalAlign = n ? "top" : "bottom"), f.x = f.xHigh, f.y = f.yHigh;
                    e.drawDataLabels && e.drawDataLabels.apply(this, arguments);
                    for (c = b; c--;)if (m = a[c])n = k ? m.plotHigh < m.plotLow : m.plotHigh > m.plotLow, m.dataLabelUpper = m.dataLabel, m.dataLabel = d[c], m.y = m.low, m.plotY = m._plotY, m.below = !n, l ? g || (f.align = n ? "left" : "right") : h || (f.verticalAlign = n ? "bottom" : "top"), f.x = f.xLow, f.y = f.yLow;
                    e.drawDataLabels &&
                    e.drawDataLabels.apply(this, arguments)
                }
                f.align = g;
                f.verticalAlign = h
            },
            alignDataLabel: function () {
                S.column.prototype.alignDataLabel.apply(this, arguments)
            },
            setStackedPoints: oa,
            getSymbol: oa,
            drawPoints: oa
        });
    ba.areasplinerange = x(ba.arearange);
    S.areasplinerange = I(S.arearange, {type: "areasplinerange", getPointSpline: S.spline.prototype.getPointSpline});
    (function () {
        var a = S.column.prototype;
        ba.columnrange = x(ba.column, ba.arearange, {lineWidth: 1, pointRange: null});
        S.columnrange = I(S.arearange, {
            type: "columnrange",
            translate: function () {
                var b =
                    this, c = b.yAxis, d = b.xAxis, e = d.startAngleRad, f, g = b.chart, h = b.xAxis.isRadial, k;
                a.translate.apply(b);
                C(b.points, function (a) {
                    var n = a.shapeArgs, l = b.options.minPointLength, q, v;
                    a.plotHigh = k = c.translate(a.high, 0, 1, 0, 1);
                    a.plotLow = a.plotY;
                    v = k;
                    q = z(a.rectPlotY, a.plotY) - k;
                    Math.abs(q) < l ? (l -= q, q += l, v -= l / 2) : 0 > q && (q *= -1, v -= q);
                    h ? (f = a.barX + e, a.shapeType = "path", a.shapeArgs = {d: b.polarArc(v + q, v, f, f + a.pointWidth)}) : (n.height = q, n.y = v, a.tooltipPos = g.inverted ? [c.len + c.pos - g.plotLeft - v - q / 2, d.len + d.pos - g.plotTop - n.x - n.width /
                    2, q] : [d.left - g.plotLeft + n.x + n.width / 2, c.pos - g.plotTop + v + q / 2, q])
                })
            },
            directTouch: !0,
            trackerGroups: ["group", "dataLabelsGroup"],
            drawGraph: oa,
            crispCol: a.crispCol,
            pointAttrToOptions: a.pointAttrToOptions,
            drawPoints: a.drawPoints,
            drawTracker: a.drawTracker,
            getColumnMetrics: a.getColumnMetrics,
            animate: function () {
                return a.animate.apply(this, arguments)
            },
            polarArc: function () {
                return a.polarArc.apply(this, arguments)
            }
        })
    })();
    ba.gauge = x(ba.line, {
        dataLabels: {
            enabled: !0, defer: !1, y: 15, borderWidth: 1, borderColor: "silver",
            borderRadius: 3, crop: !1, verticalAlign: "top", zIndex: 2
        }, dial: {}, pivot: {}, tooltip: {headerFormat: ""}, showInLegend: !1
    });
    var Ac = {
        type: "gauge",
        pointClass: I(Ja, {
            setState: function (a) {
                this.state = a
            }
        }),
        angular: !0,
        directTouch: !0,
        drawGraph: oa,
        fixedBox: !0,
        forceDL: !0,
        trackerGroups: ["group", "dataLabelsGroup"],
        translate: function () {
            var a = this.yAxis, b = this.options, c = a.center;
            this.generatePoints();
            C(this.points, function (d) {
                var e = x(b.dial, d.dial), f = H(z(e.radius, 80)) * c[2] / 200, g = H(z(e.baseLength, 70)) * f / 100, h = H(z(e.rearLength,
                        10)) * f / 100, k = e.baseWidth || 3, m = e.topWidth || 1, n = b.overshoot, l = a.startAngleRad + a.translate(d.y, null, null, null, !0);
                n && "number" === typeof n ? (n = n / 180 * Math.PI, l = Math.max(a.startAngleRad - n, Math.min(a.endAngleRad + n, l))) : !1 === b.wrap && (l = Math.max(a.startAngleRad, Math.min(a.endAngleRad, l)));
                l = 180 * l / Math.PI;
                d.shapeType = "path";
                d.shapeArgs = {
                    d: e.path || ["M", -h, -k / 2, "L", g, -k / 2, f, -m / 2, f, m / 2, g, k / 2, -h, k / 2, "z"],
                    translateX: c[0],
                    translateY: c[1],
                    rotation: l
                };
                d.plotX = c[0];
                d.plotY = c[1]
            })
        },
        drawPoints: function () {
            var a = this, b = a.yAxis.center,
                c = a.pivot, d = a.options, e = d.pivot, f = a.chart.renderer;
            C(a.points, function (b) {
                var c = b.graphic, e = b.shapeArgs, m = e.d, n = x(d.dial, b.dial);
                c ? (c.animate(e), e.d = m) : b.graphic = f[b.shapeType](e).attr({
                    stroke: n.borderColor || "none",
                    "stroke-width": n.borderWidth || 0,
                    fill: n.backgroundColor || "black",
                    rotation: e.rotation,
                    zIndex: 1
                }).add(a.group)
            });
            c ? c.animate({translateX: b[0], translateY: b[1]}) : a.pivot = f.circle(0, 0, z(e.radius, 5)).attr({
                "stroke-width": e.borderWidth || 0, stroke: e.borderColor || "silver", fill: e.backgroundColor ||
                "black", zIndex: 2
            }).translate(b[0], b[1]).add(a.group)
        },
        animate: function (a) {
            var b = this;
            a || (C(b.points, function (a) {
                var d = a.graphic;
                d && (d.attr({rotation: 180 * b.yAxis.startAngleRad / Math.PI}), d.animate({rotation: a.shapeArgs.rotation}, b.options.animation))
            }), b.animate = null)
        },
        render: function () {
            this.group = this.plotGroup("group", "series", this.visible ? "visible" : "hidden", this.options.zIndex, this.chart.seriesGroup);
            da.prototype.render.call(this);
            this.group.clip(this.chart.clipRect)
        },
        setData: function (a, b) {
            da.prototype.setData.call(this,
                a, !1);
            this.processData();
            this.generatePoints();
            z(b, !0) && this.chart.redraw()
        },
        drawTracker: cb && cb.drawTrackerPoint
    };
    S.gauge = I(S.line, Ac);
    ba.boxplot = x(ba.column, {
        fillColor: "#FFFFFF",
        lineWidth: 1,
        medianWidth: 2,
        states: {hover: {brightness: -.3}},
        threshold: null,
        tooltip: {pointFormat: '<span style="color:{point.color}">\u25cf</span> <b> {series.name}</b><br/>Maximum: {point.high}<br/>Upper quartile: {point.q3}<br/>Median: {point.median}<br/>Lower quartile: {point.q1}<br/>Minimum: {point.low}<br/>'},
        whiskerLength: "50%",
        whiskerWidth: 2
    });
    S.boxplot = I(S.column, {
        type: "boxplot",
        pointArrayMap: ["low", "q1", "median", "q3", "high"],
        toYData: function (a) {
            return [a.low, a.q1, a.median, a.q3, a.high]
        },
        pointValKey: "high",
        pointAttrToOptions: {fill: "fillColor", stroke: "color", "stroke-width": "lineWidth"},
        drawDataLabels: oa,
        translate: function () {
            var a = this.yAxis, b = this.pointArrayMap;
            S.column.prototype.translate.apply(this);
            C(this.points, function (c) {
                C(b, function (b) {
                    null !== c[b] && (c[b + "Plot"] = a.translate(c[b], 0, 1, 0, 1))
                })
            })
        },
        drawPoints: function () {
            var a =
                this, b = a.options, c = a.chart.renderer, d, e, f, g, h, k, m, n, l, q, v, p, E, r, t, y, P, B, D, Y, Z, K, x = !1 !== a.doQuartiles, F, la = a.options.whiskerLength;
            C(a.points, function (C) {
                l = C.graphic;
                Z = C.shapeArgs;
                v = {};
                r = {};
                y = {};
                K = C.color || a.color;
                C.plotY !== J && (d = C.pointAttr[C.selected ? "selected" : ""], P = Z.width, B = ka(Z.x), D = B + P, Y = M(P / 2), e = ka(x ? C.q1Plot : C.lowPlot), f = ka(x ? C.q3Plot : C.lowPlot), g = ka(C.highPlot), h = ka(C.lowPlot), v.stroke = C.stemColor || b.stemColor || K, v["stroke-width"] = z(C.stemWidth, b.stemWidth, b.lineWidth), v.dashstyle = C.stemDashStyle ||
                    b.stemDashStyle, r.stroke = C.whiskerColor || b.whiskerColor || K, r["stroke-width"] = z(C.whiskerWidth, b.whiskerWidth, b.lineWidth), y.stroke = C.medianColor || b.medianColor || K, y["stroke-width"] = z(C.medianWidth, b.medianWidth, b.lineWidth), m = v["stroke-width"] % 2 / 2, n = B + Y + m, q = ["M", n, f, "L", n, g, "M", n, e, "L", n, h], x && (m = d["stroke-width"] % 2 / 2, n = ka(n) + m, e = ka(e) + m, f = ka(f) + m, B += m, D += m, p = ["M", B, f, "L", B, e, "L", D, e, "L", D, f, "L", B, f, "z"]), la && (m = r["stroke-width"] % 2 / 2, g += m, h += m, F = /%$/.test(la) ? Y * parseFloat(la) / 100 : la / 2, E = ["M", n - F,
                    g, "L", n + F, g, "M", n - F, h, "L", n + F, h]), m = y["stroke-width"] % 2 / 2, k = M(C.medianPlot) + m, t = ["M", B, k, "L", D, k], l ? (C.stem.animate({d: q}), la && C.whiskers.animate({d: E}), x && C.box.animate({d: p}), C.medianShape.animate({d: t})) : (C.graphic = l = c.g().add(a.group), C.stem = c.path(q).attr(v).add(l), la && (C.whiskers = c.path(E).attr(r).add(l)), x && (C.box = c.path(p).attr(d).add(l)), C.medianShape = c.path(t).attr(y).add(l)))
            })
        },
        setStackedPoints: oa
    });
    ba.errorbar = x(ba.boxplot, {
        color: "#000000",
        grouping: !1,
        linkedTo: ":previous",
        tooltip: {pointFormat: '<span style="color:{point.color}">\u25cf</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>'},
        whiskerWidth: null
    });
    S.errorbar = I(S.boxplot, {
        type: "errorbar",
        pointArrayMap: ["low", "high"],
        toYData: function (a) {
            return [a.low, a.high]
        },
        pointValKey: "high",
        doQuartiles: !1,
        drawDataLabels: S.arearange ? S.arearange.prototype.drawDataLabels : oa,
        getColumnMetrics: function () {
            return this.linkedParent && this.linkedParent.columnMetrics || S.column.prototype.getColumnMetrics.call(this)
        }
    });
    ba.waterfall = x(ba.column, {
        lineWidth: 1,
        lineColor: "#333",
        dashStyle: "dot",
        borderColor: "#333",
        dataLabels: {inside: !0},
        states: {hover: {lineWidthPlus: 0}}
    });
    S.waterfall = I(S.column, {
        type: "waterfall", upColorProp: "fill", pointValKey: "y", translate: function () {
            var a = this.options, b = this.yAxis, c, d, e, f, g, h, k, m, n, l = z(a.minPointLength, 5), q = a.threshold, v = a.stacking;
            S.column.prototype.translate.apply(this);
            this.minPointLengthOffset = 0;
            k = m = q;
            d = this.points;
            c = 0;
            for (a = d.length; c < a; c++)e = d[c], h = this.processedYData[c], f = e.shapeArgs, n = (g = v && b.stacks[(this.negStacks && h < q ? "-" : "") + this.stackKey]) ? g[e.x].points[this.index + "," + c] : [0, h], e.isSum ? e.y = ta(h) : e.isIntermediateSum && (e.y =
                ta(h - m)), g = L(k, k + e.y) + n[0], f.y = b.translate(g, 0, 1), e.isSum ? (f.y = b.translate(n[1], 0, 1), f.height = Math.min(b.translate(n[0], 0, 1), b.len) - f.y + this.minPointLengthOffset) : e.isIntermediateSum ? (f.y = b.translate(n[1], 0, 1), f.height = Math.min(b.translate(m, 0, 1), b.len) - f.y + this.minPointLengthOffset, m = n[1]) : (0 !== k && (f.height = 0 < h ? b.translate(k, 0, 1) - f.y : b.translate(k, 0, 1) - b.translate(k - h, 0, 1)), k += h), 0 > f.height && (f.y += f.height, f.height *= -1), e.plotY = f.y = M(f.y) - this.borderWidth % 2 / 2, f.height = L(M(f.height), .001), e.yBottom =
                f.y + f.height, f.height <= l && (f.height = l, this.minPointLengthOffset += l), f.y -= this.minPointLengthOffset, f = e.plotY + (e.negative ? f.height : 0) - this.minPointLengthOffset, this.chart.inverted ? e.tooltipPos[0] = b.len - f : e.tooltipPos[1] = f
        }, processData: function (a) {
            var b = this.yData, c = this.options.data, d, e = b.length, f, g, h, k, m, n;
            g = f = h = k = this.options.threshold || 0;
            for (n = 0; n < e; n++)m = b[n], d = c && c[n] ? c[n] : {}, "sum" === m || d.isSum ? b[n] = ta(g) : "intermediateSum" === m || d.isIntermediateSum ? b[n] = ta(f) : (g += m, f += m), h = Math.min(g, h), k = Math.max(g,
                k);
            da.prototype.processData.call(this, a);
            this.dataMin = h;
            this.dataMax = k
        }, toYData: function (a) {
            return a.isSum ? 0 === a.x ? null : "sum" : a.isIntermediateSum ? 0 === a.x ? null : "intermediateSum" : a.y
        }, getAttribs: function () {
            S.column.prototype.getAttribs.apply(this, arguments);
            var a = this, b = a.options, c = b.states, d = b.upColor || a.color, b = U.Color(d).brighten(.1).get(), e = x(a.pointAttr), f = a.upColorProp;
            e[""][f] = d;
            e.hover[f] = c.hover.upColor || b;
            e.select[f] = c.select.upColor || d;
            C(a.points, function (b) {
                b.options.color || (0 < b.y ? (b.pointAttr =
                    e, b.color = d) : b.pointAttr = a.pointAttr)
            })
        }, getGraphPath: function () {
            var a = this.data, b = a.length, c = M(this.options.lineWidth + this.borderWidth) % 2 / 2, d = [], e, f, g;
            for (g = 1; g < b; g++)f = a[g].shapeArgs, e = a[g - 1].shapeArgs, f = ["M", e.x + e.width, e.y + c, "L", f.x, e.y + c], 0 > a[g - 1].y && (f[2] += e.height, f[5] += e.height), d = d.concat(f);
            return d
        }, getExtremes: oa, drawGraph: da.prototype.drawGraph
    });
    ba.bubble = x(ba.scatter, {
        dataLabels: {
            formatter: function () {
                return this.point.z
            }, inside: !0, verticalAlign: "middle"
        },
        marker: {lineColor: null, lineWidth: 1},
        minSize: 8,
        maxSize: "20%",
        softThreshold: !1,
        states: {hover: {halo: {size: 5}}},
        tooltip: {pointFormat: "({point.x}, {point.y}), Size: {point.z}"},
        turboThreshold: 0,
        zThreshold: 0,
        zoneAxis: "z"
    });
    var Bc = I(Ja, {
        haloPath: function () {
            return Ja.prototype.haloPath.call(this, this.shapeArgs.r + this.series.options.states.hover.halo.size)
        }, ttBelow: !1
    });
    S.bubble = I(S.scatter, {
        type: "bubble",
        pointClass: Bc,
        pointArrayMap: ["y", "z"],
        parallelArrays: ["x", "y", "z"],
        trackerGroups: ["group", "dataLabelsGroup"],
        bubblePadding: !0,
        zoneAxis: "z",
        pointAttrToOptions: {stroke: "lineColor", "stroke-width": "lineWidth", fill: "fillColor"},
        applyOpacity: function (a) {
            var b = this.options.marker, c = z(b.fillOpacity, .5);
            a = a || b.fillColor || this.color;
            1 !== c && (a = ha(a).setOpacity(c).get("rgba"));
            return a
        },
        convertAttribs: function () {
            var a = da.prototype.convertAttribs.apply(this, arguments);
            a.fill = this.applyOpacity(a.fill);
            return a
        },
        getRadii: function (a, b, c, d) {
            var e, f, g, h = this.zData, k = [], m = this.options, n = "width" !== m.sizeBy, l = m.zThreshold, q = b - a;
            f = 0;
            for (e = h.length; f < e; f++)g =
                h[f], m.sizeByAbsoluteValue && null !== g && (g = Math.abs(g - l), b = Math.max(b - l, Math.abs(a - l)), a = 0), null === g ? g = null : g < a ? g = c / 2 - 1 : (g = 0 < q ? (g - a) / q : .5, n && 0 <= g && (g = Math.sqrt(g)), g = qa.ceil(c + g * (d - c)) / 2), k.push(g);
            this.radii = k
        },
        animate: function (a) {
            var b = this.options.animation;
            a || (C(this.points, function (a) {
                var d = a.graphic;
                a = a.shapeArgs;
                d && a && (d.attr("r", 1), d.animate({r: a.r}, b))
            }), this.animate = null)
        },
        translate: function () {
            var a, b = this.data, c, d, e = this.radii;
            S.scatter.prototype.translate.call(this);
            for (a = b.length; a--;)c =
                b[a], d = e ? e[a] : 0, "number" === typeof d && d >= this.minPxSize / 2 ? (c.shapeType = "circle", c.shapeArgs = {
                x: c.plotX,
                y: c.plotY,
                r: d
            }, c.dlBox = {
                x: c.plotX - d,
                y: c.plotY - d,
                width: 2 * d,
                height: 2 * d
            }) : c.shapeArgs = c.plotY = c.dlBox = J
        },
        drawLegendSymbol: function (a, b) {
            var c = this.chart.renderer, d = c.fontMetrics(a.itemStyle.fontSize).f / 2;
            b.legendSymbol = c.circle(d, a.baseline - d, d).attr({zIndex: 3}).add(b.legendGroup);
            b.legendSymbol.isMarker = !0
        },
        drawPoints: S.column.prototype.drawPoints,
        alignDataLabel: S.column.prototype.alignDataLabel,
        buildKDTree: oa,
        applyZones: oa
    });
    ga.prototype.beforePadding = function () {
        var a = this, b = this.len, c = this.chart, d = 0, e = b, f = this.isXAxis, g = f ? "xData" : "yData", h = this.min, k = {}, m = qa.min(c.plotWidth, c.plotHeight), n = Number.MAX_VALUE, l = -Number.MAX_VALUE, q = this.max - h, v = b / q, p = [];
        C(this.series, function (b) {
            var d = b.options;
            !b.bubblePadding || !b.visible && c.options.chart.ignoreHiddenSeries || (a.allowZoomOutside = !0, p.push(b), f && (C(["minSize", "maxSize"], function (a) {
                var b = d[a], c = /%$/.test(b), b = H(b);
                k[a] = c ? m * b / 100 : b
            }), b.minPxSize = k.minSize,
                b.maxPxSize = k.maxSize, b = b.zData, b.length && (n = z(d.zMin, qa.min(n, qa.max(Y(b), !1 === d.displayNegative ? d.zThreshold : -Number.MAX_VALUE))), l = z(d.zMax, qa.max(l, ya(b))))))
        });
        C(p, function (b) {
            var c = b[g], k = c.length, m;
            f && b.getRadii(n, l, b.minPxSize, b.maxPxSize);
            if (0 < q)for (; k--;)"number" === typeof c[k] && a.dataMin <= c[k] && c[k] <= a.dataMax && (m = b.radii[k], d = Math.min((c[k] - h) * v - m, d), e = Math.max((c[k] - h) * v + m, e))
        });
        p.length && 0 < q && !this.isLog && (e -= b, v *= (b + d - e) / b, C([["min", "userMin", d], ["max", "userMax", e]], function (b) {
            z(a.options[b[0]],
                a[b[1]]) === J && (a[b[0]] += b[2] / v)
        }))
    };
    (function () {
        function a(a, b) {
            var c = this.chart, d = this.options.animation, k = this.group, m = this.markerGroup, n = this.xAxis.center, l = c.plotLeft, q = c.plotTop;
            c.polar ? c.renderer.isSVG && (!0 === d && (d = {}), b ? (c = {
                translateX: n[0] + l,
                translateY: n[1] + q,
                scaleX: .001,
                scaleY: .001
            }, k.attr(c), m && m.attr(c)) : (c = {
                translateX: l,
                translateY: q,
                scaleX: 1,
                scaleY: 1
            }, k.animate(c, d), m && m.animate(c, d), this.animate = null)) : a.call(this, b)
        }

        var b = da.prototype, c = Ya.prototype, d;
        b.searchPointByAngle = function (a) {
            var b =
                this.chart, c = this.xAxis.pane.center;
            return this.searchKDTree({clientX: 180 + -180 / Math.PI * Math.atan2(a.chartX - c[0] - b.plotLeft, a.chartY - c[1] - b.plotTop)})
        };
        ca(b, "buildKDTree", function (a) {
            this.chart.polar && (this.kdByAngle ? this.searchPoint = this.searchPointByAngle : this.kdDimensions = 2);
            a.apply(this)
        });
        b.toXY = function (a) {
            var b, c = this.chart, d = a.plotX;
            b = a.plotY;
            a.rectPlotX = d;
            a.rectPlotY = b;
            b = this.xAxis.postTranslate(a.plotX, this.yAxis.len - b);
            a.plotX = a.polarPlotX = b.x - c.plotLeft;
            a.plotY = a.polarPlotY = b.y - c.plotTop;
            this.kdByAngle ? (c = (d / Math.PI * 180 + this.xAxis.pane.options.startAngle) % 360, 0 > c && (c += 360), a.clientX = c) : a.clientX = a.plotX
        };
        S.spline && ca(S.spline.prototype, "getPointSpline", function (a, b, c, d) {
            var k, m, n, l, q, v, p;
            this.chart.polar ? (k = c.plotX, m = c.plotY, a = b[d - 1], n = b[d + 1], this.connectEnds && (a || (a = b[b.length - 2]), n || (n = b[1])), a && n && (l = a.plotX, q = a.plotY, b = n.plotX, v = n.plotY, l = (1.5 * k + l) / 2.5, q = (1.5 * m + q) / 2.5, n = (1.5 * k + b) / 2.5, p = (1.5 * m + v) / 2.5, b = Math.sqrt(Math.pow(l - k, 2) + Math.pow(q - m, 2)), v = Math.sqrt(Math.pow(n - k, 2) + Math.pow(p -
                    m, 2)), l = Math.atan2(q - m, l - k), q = Math.atan2(p - m, n - k), p = Math.PI / 2 + (l + q) / 2, Math.abs(l - p) > Math.PI / 2 && (p -= Math.PI), l = k + Math.cos(p) * b, q = m + Math.sin(p) * b, n = k + Math.cos(Math.PI + p) * v, p = m + Math.sin(Math.PI + p) * v, c.rightContX = n, c.rightContY = p), d ? (c = ["C", a.rightContX || a.plotX, a.rightContY || a.plotY, l || k, q || m, k, m], a.rightContX = a.rightContY = null) : c = ["M", k, m]) : c = a.call(this, b, c, d);
            return c
        });
        ca(b, "translate", function (a) {
            var b = this.chart;
            a.call(this);
            if (b.polar && (this.kdByAngle = b.tooltip && b.tooltip.shared, !this.preventPostTranslate))for (a =
                                                                                                                 this.points, b = a.length; b--;)this.toXY(a[b])
        });
        ca(b, "getGraphPath", function (a, b) {
            var c = this;
            this.chart.polar && (b = b || this.points, !1 !== this.options.connectEnds && null !== b[0].y && (this.connectEnds = !0, b.splice(b.length, 0, b[0])), C(b, function (a) {
                void 0 === a.polarPlotY && c.toXY(a)
            }));
            return a.apply(this, [].slice.call(arguments, 1))
        });
        ca(b, "animate", a);
        S.column && (d = S.column.prototype, d.polarArc = function (a, b, c, d) {
            var k = this.xAxis.center, m = this.yAxis.len;
            return this.chart.renderer.symbols.arc(k[0], k[1], m - b, null,
                {start: c, end: d, innerR: m - z(a, m)})
        }, ca(d, "animate", a), ca(d, "translate", function (a) {
            var b = this.xAxis, c = b.startAngleRad, d, k, m;
            this.preventPostTranslate = !0;
            a.call(this);
            if (b.isRadial)for (d = this.points, m = d.length; m--;)k = d[m], a = k.barX + c, k.shapeType = "path", k.shapeArgs = this.polarArc(k.yBottom, k.plotY, a, a + k.pointWidth), this.toXY(k), k.tooltipPos = [k.plotX, k.plotY], k.ttBelow = k.plotY > b.center[1]
        }), ca(d, "alignDataLabel", function (a, c, d, h, k, m) {
            this.chart.polar ? (a = c.rectPlotX / Math.PI * 180, null === h.align && (h.align = 20 <
            a && 160 > a ? "left" : 200 < a && 340 > a ? "right" : "center"), null === h.verticalAlign && (h.verticalAlign = 45 > a || 315 < a ? "bottom" : 135 < a && 225 > a ? "top" : "middle"), b.alignDataLabel.call(this, c, d, h, k, m)) : a.call(this, c, d, h, k, m)
        }));
        ca(c, "getCoordinates", function (a, b) {
            var c = this.chart, d = {xAxis: [], yAxis: []};
            c.polar ? C(c.axes, function (a) {
                var e = a.isXAxis, n = a.center, l = b.chartX - n[0] - c.plotLeft, n = b.chartY - n[1] - c.plotTop;
                d[e ? "xAxis" : "yAxis"].push({
                    axis: a,
                    value: a.translate(e ? Math.PI - Math.atan2(l, n) : Math.sqrt(Math.pow(l, 2) + Math.pow(n, 2)),
                        !0)
                })
            }) : d = a.call(this, b);
            return d
        })
    })();
    O(U, {
        Color: ha,
        Point: Ja,
        Tick: ua,
        Renderer: bb,
        SVGElement: ja,
        SVGRenderer: La,
        arrayMin: Y,
        arrayMax: ya,
        charts: va,
        correctFloat: ta,
        dateFormat: Da,
        error: T,
        format: q,
        pathAnim: void 0,
        getOptions: function () {
            return pa
        },
        hasBidiBug: jc,
        isTouchDevice: mb,
        setOptions: function (a) {
            pa = x(!0, pa, a);
            Tb();
            return pa
        },
        addEvent: aa,
        removeEvent: sa,
        createElement: ia,
        discardElement: Sa,
        css: F,
        each: C,
        map: Ea,
        merge: x,
        splat: B,
        stableSort: Z,
        extendClass: I,
        pInt: H,
        svg: Ba,
        canvas: Ha,
        vml: !Ba && !Ha,
        product: "Highcharts 4.2.4",
        version: "/Highstock 4.2.4"
    });
    return U
});
(function (t) {
    "object" === typeof module && module.exports ? module.exports = t : t(Highcharts)
})(function (t) {
    var T = t.getOptions(), V = T.plotOptions, x = t.seriesTypes, H = t.merge, ea = function () {
    }, R = t.each;
    V.funnel = H(V.pie, {
        animation: !1,
        center: ["50%", "50%"],
        width: "90%",
        neckWidth: "30%",
        height: "100%",
        neckHeight: "25%",
        reversed: !1,
        dataLabels: {connectorWidth: 1, connectorColor: "#606060"},
        size: !0,
        states: {select: {color: "#C0C0C0", borderColor: "#000000", shadow: !1}}
    });
    x.funnel = t.extendClass(x.pie, {
        type: "funnel", animate: ea, translate: function () {
            var t =
                function (l, q) {
                    return /%$/.test(l) ? q * parseInt(l, 10) / 100 : parseInt(l, 10)
                }, r = 0, p = this.chart, y = this.options, x = y.reversed, B = y.ignoreHiddenPoint, D = p.plotWidth, F = p.plotHeight, H = 0, p = y.center, I = t(p[0], D), fa = t(p[1], F), v = t(y.width, D), l, q, E = t(y.height, F), P = t(y.neckWidth, D), Z = t(y.neckHeight, F), Y = fa - E / 2 + E - Z, t = this.data, ya, la, Sa = "left" === y.dataLabels.position ? 1 : 0, ta, za, V, T, ha, ja, ua;
            this.getWidthAt = q = function (l) {
                var q = fa - E / 2;
                return l > Y || E === Z ? P : P + (v - P) * (1 - (l - q) / (E - Z))
            };
            this.getX = function (l, v) {
                return I + (v ? -1 : 1) * (q(x ?
                    F - l : l) / 2 + y.dataLabels.distance)
            };
            this.center = [I, fa, E];
            this.centerX = I;
            R(t, function (l) {
                B && !1 === l.visible || (r += l.y)
            });
            R(t, function (v) {
                ua = null;
                la = r ? v.y / r : 0;
                za = fa - E / 2 + H * E;
                ha = za + la * E;
                l = q(za);
                ta = I - l / 2;
                V = ta + l;
                l = q(ha);
                T = I - l / 2;
                ja = T + l;
                za > Y ? (ta = T = I - P / 2, V = ja = I + P / 2) : ha > Y && (ua = ha, l = q(Y), T = I - l / 2, ja = T + l, ha = Y);
                x && (za = E - za, ha = E - ha, ua = ua ? E - ua : null);
                ya = ["M", ta, za, "L", V, za, ja, ha];
                ua && ya.push(ja, ua, T, ua);
                ya.push(T, ha, "Z");
                v.shapeType = "path";
                v.shapeArgs = {d: ya};
                v.percentage = 100 * la;
                v.plotX = I;
                v.plotY = (za + (ua || ha)) / 2;
                v.tooltipPos =
                    [I, v.plotY];
                v.slice = ea;
                v.half = Sa;
                B && !1 === v.visible || (H += la)
            })
        }, drawPoints: function () {
            var t = this, r = t.chart.renderer, p, y, x;
            R(t.data, function (B) {
                x = B.graphic;
                y = B.shapeArgs;
                p = B.pointAttr[B.selected ? "select" : ""];
                x ? x.attr(p).animate(y) : B.graphic = r.path(y).attr(p).add(t.group)
            })
        }, sortByAngle: function (t) {
            t.sort(function (r, p) {
                return r.plotY - p.plotY
            })
        }, drawDataLabels: function () {
            var t = this.data, r = this.options.dataLabels.distance, p, y, K, B = t.length, D, F;
            for (this.center[2] -= 2 * r; B--;)K = t[B], y = (p = K.half) ? 1 : -1, F = K.plotY,
                D = this.getX(F, p), K.labelPos = [0, F, D + (r - 5) * y, F, D + r * y, F, p ? "right" : "left", 0];
            x.pie.prototype.drawDataLabels.call(this)
        }
    });
    T.plotOptions.pyramid = t.merge(T.plotOptions.funnel, {neckWidth: "0%", neckHeight: "0%", reversed: !0});
    t.seriesTypes.pyramid = t.extendClass(t.seriesTypes.funnel, {type: "pyramid"})
});
(function (t) {
    "object" === typeof module && module.exports ? module.exports = t : t(Highcharts)
})(function (t) {
    var T = t.win, V = T.document, x = t.Chart, H = t.addEvent, ea = t.removeEvent, R = t.fireEvent, N = t.createElement, r = t.discardElement, p = t.css, y = t.merge, K = t.each, B = t.extend, D = t.splat, F = Math.max, ia = t.isTouchDevice, I = t.Renderer.prototype.symbols, fa = t.getOptions(), v;
    B(fa.lang, {
        printChart: "Print chart",
        downloadPNG: "Download PNG image",
        downloadJPEG: "Download JPEG image",
        downloadPDF: "Download PDF document",
        downloadSVG: "Download SVG vector image",
        contextButtonTitle: "Chart context menu"
    });
    fa.navigation = {
        menuStyle: {border: "1px solid #A0A0A0", background: "#FFFFFF", padding: "5px 0"},
        menuItemStyle: {padding: "0 10px", background: "none", color: "#303030", fontSize: ia ? "14px" : "11px"},
        menuItemHoverStyle: {background: "#4572A5", color: "#FFFFFF"},
        buttonOptions: {
            symbolFill: "#E0E0E0",
            symbolSize: 14,
            symbolStroke: "#666",
            symbolStrokeWidth: 3,
            symbolX: 12.5,
            symbolY: 10.5,
            align: "right",
            buttonSpacing: 3,
            height: 22,
            theme: {fill: "white", stroke: "none"},
            verticalAlign: "top",
            width: 24
        }
    };
    fa.exporting = {
        type: "image/png", url: "http://export.highcharts.com/", buttons: {
            contextButton: {
                menuClassName: "highcharts-contextmenu",
                symbol: "menu",
                _titleKey: "contextButtonTitle",
                menuItems: [{
                    textKey: "printChart", onclick: function () {
                        this.print()
                    }
                }, {separator: !0}, {
                    textKey: "downloadPNG", onclick: function () {
                        this.exportChart()
                    }
                }, {
                    textKey: "downloadJPEG", onclick: function () {
                        this.exportChart({type: "image/jpeg"})
                    }
                }, {
                    textKey: "downloadPDF", onclick: function () {
                        this.exportChart({type: "application/pdf"})
                    }
                }, {
                    textKey: "downloadSVG",
                    onclick: function () {
                        this.exportChart({type: "image/svg+xml"})
                    }
                }]
            }
        }
    };
    t.post = function (l, q, v) {
        var p;
        l = N("form", y({method: "post", action: l, enctype: "multipart/form-data"}, v), {display: "none"}, V.body);
        for (p in q)N("input", {type: "hidden", name: p, value: q[p]}, null, l);
        l.submit();
        r(l)
    };
    B(x.prototype, {
        sanitizeSVG: function (l) {
            return l.replace(/zIndex="[^"]+"/g, "").replace(/isShadow="[^"]+"/g, "").replace(/symbolName="[^"]+"/g, "").replace(/jQuery[0-9]+="[^"]+"/g, "").replace(/url\([^#]+#/g, "url(#").replace(/<svg /, '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ').replace(/ (NS[0-9]+\:)?href=/g,
                " xlink:href=").replace(/\n/, " ").replace(/<\/svg>.*?$/, "</svg>").replace(/(fill|stroke)="rgba\(([ 0-9]+,[ 0-9]+,[ 0-9]+),([ 0-9\.]+)\)"/g, '$1="rgb($2)" $1-opacity="$3"').replace(/&nbsp;/g, "\u00a0").replace(/&shy;/g, "\u00ad").replace(/<IMG /g, "<image ").replace(/<(\/?)TITLE>/g, "<$1title>").replace(/height=([^" ]+)/g, 'height="$1"').replace(/width=([^" ]+)/g, 'width="$1"').replace(/hc-svg-href="([^"]+)">/g, 'xlink:href="$1"/>').replace(/ id=([^" >]+)/g, ' id="$1"').replace(/class=([^" >]+)/g, 'class="$1"').replace(/ transform /g,
                " ").replace(/:(path|rect)/g, "$1").replace(/style="([^"]+)"/g, function (l) {
                    return l.toLowerCase()
                })
        }, getChartHTML: function () {
            return this.container.innerHTML
        }, getSVG: function (l) {
            var q = this, v, p, Z, Y, x, F = y(q.options, l), I = F.exporting.allowHTML;
            V.createElementNS || (V.createElementNS = function (l, q) {
                return V.createElement(q)
            });
            p = N("div", null, {
                position: "absolute",
                top: "-9999em",
                width: q.chartWidth + "px",
                height: q.chartHeight + "px"
            }, V.body);
            Z = q.renderTo.style.width;
            x = q.renderTo.style.height;
            Z = F.exporting.sourceWidth ||
                F.chart.width || /px$/.test(Z) && parseInt(Z, 10) || 600;
            x = F.exporting.sourceHeight || F.chart.height || /px$/.test(x) && parseInt(x, 10) || 400;
            B(F.chart, {animation: !1, renderTo: p, forExport: !0, renderer: "SVGRenderer", width: Z, height: x});
            F.exporting.enabled = !1;
            delete F.data;
            F.series = [];
            K(q.series, function (l) {
                Y = y(l.userOptions, {animation: !1, enableMouseTracking: !1, showCheckbox: !1, visible: l.visible});
                Y.isInternal || F.series.push(Y)
            });
            l && K(["xAxis", "yAxis"], function (q) {
                K(D(l[q]), function (l, v) {
                    F[q][v] = y(F[q][v], l)
                })
            });
            v =
                new t.Chart(F, q.callback);
            K(["xAxis", "yAxis"], function (l) {
                K(q[l], function (q, p) {
                    var r = v[l][p], t = q.getExtremes(), y = t.userMin, t = t.userMax;
                    !r || void 0 === y && void 0 === t || r.setExtremes(y, t, !0, !1)
                })
            });
            Z = v.getChartHTML();
            F = null;
            v.destroy();
            r(p);
            I && (p = Z.match(/<\/svg>(.*?$)/)) && (p = '<foreignObject x="0" y="0" width="200" height="200"><body xmlns="http://www.w3.org/1999/xhtml">' + p[1] + "</body></foreignObject>", Z = Z.replace("</svg>", p + "</svg>"));
            Z = this.sanitizeSVG(Z);
            return Z = Z.replace(/(url\(#highcharts-[0-9]+)&quot;/g,
                "$1").replace(/&quot;/g, "'")
        }, getSVGForExport: function (l, q) {
            var v = this.options.exporting;
            return this.getSVG(y({chart: {borderRadius: 0}}, v.chartOptions, q, {
                exporting: {
                    sourceWidth: l && l.sourceWidth || v.sourceWidth,
                    sourceHeight: l && l.sourceHeight || v.sourceHeight
                }
            }))
        }, exportChart: function (l, q) {
            var v = this.getSVGForExport(l, q);
            l = y(this.options.exporting, l);
            t.post(l.url, {
                filename: l.filename || "chart",
                type: l.type,
                width: l.width || 0,
                scale: l.scale || 2,
                svg: v
            }, l.formAttributes)
        }, print: function () {
            var l = this, q = l.container,
                v = [], p = q.parentNode, r = V.body, t = r.childNodes;
            l.isPrinting || (l.isPrinting = !0, l.pointer.reset(null, 0), R(l, "beforePrint"), K(t, function (l, q) {
                1 === l.nodeType && (v[q] = l.style.display, l.style.display = "none")
            }), r.appendChild(q), T.focus(), T.print(), setTimeout(function () {
                p.appendChild(q);
                K(t, function (l, q) {
                    1 === l.nodeType && (l.style.display = v[q])
                });
                l.isPrinting = !1;
                R(l, "afterPrint")
            }, 1E3))
        }, contextMenu: function (l, q, v, r, t, y, D) {
            var x = this, I = x.options.navigation, R = I.menuItemStyle, ia = x.chartWidth, fa = x.chartHeight, T = "cache-" +
                l, ha = x[T], ja = F(t, y), ua, $a, eb, fb = function (q) {
                x.pointer.inClass(q.target, l) || $a()
            };
            ha || (x[T] = ha = N("div", {className: l}, {
                position: "absolute",
                zIndex: 1E3,
                padding: ja + "px"
            }, x.container), ua = N("div", null, B({
                MozBoxShadow: "3px 3px 10px #888",
                WebkitBoxShadow: "3px 3px 10px #888",
                boxShadow: "3px 3px 10px #888"
            }, I.menuStyle), ha), $a = function () {
                p(ha, {display: "none"});
                D && D.setState(0);
                x.openMenu = !1
            }, H(ha, "mouseleave", function () {
                eb = setTimeout($a, 500)
            }), H(ha, "mouseenter", function () {
                clearTimeout(eb)
            }), H(V, "mouseup", fb),
                H(x, "destroy", function () {
                    ea(V, "mouseup", fb)
                }), K(q, function (l) {
                if (l) {
                    var q = l.separator ? N("hr", null, null, ua) : N("div", {
                        onmouseover: function () {
                            p(this, I.menuItemHoverStyle)
                        }, onmouseout: function () {
                            p(this, R)
                        }, onclick: function (q) {
                            q && q.stopPropagation();
                            $a();
                            l.onclick && l.onclick.apply(x, arguments)
                        }, innerHTML: l.text || x.options.lang[l.textKey]
                    }, B({cursor: "pointer"}, R), ua);
                    x.exportDivElements.push(q)
                }
            }), x.exportDivElements.push(ua, ha), x.exportMenuWidth = ha.offsetWidth, x.exportMenuHeight = ha.offsetHeight);
            q = {display: "block"};
            v + x.exportMenuWidth > ia ? q.right = ia - v - t - ja + "px" : q.left = v - ja + "px";
            r + y + x.exportMenuHeight > fa && "top" !== D.alignOptions.verticalAlign ? q.bottom = fa - r - ja + "px" : q.top = r + y - ja + "px";
            p(ha, q);
            x.openMenu = !0
        }, addButton: function (l) {
            var q = this, p = q.renderer, r = y(q.options.navigation.buttonOptions, l), D = r.onclick, x = r.menuItems, F, K, I = {
                stroke: r.symbolStroke,
                fill: r.symbolFill
            }, R = r.symbolSize || 12;
            q.btnCount || (q.btnCount = 0);
            q.exportDivElements || (q.exportDivElements = [], q.exportSVGElements = []);
            if (!1 !== r.enabled) {
                var H = r.theme, N =
                    H.states, ia = N && N.hover, N = N && N.select, fa;
                delete H.states;
                D ? fa = function (l) {
                    l.stopPropagation();
                    D.call(q, l)
                } : x && (fa = function () {
                    q.contextMenu(K.menuClassName, x, K.translateX, K.translateY, K.width, K.height, K);
                    K.setState(2)
                });
                r.text && r.symbol ? H.paddingLeft = t.pick(H.paddingLeft, 25) : r.text || B(H, {
                    width: r.width,
                    height: r.height,
                    padding: 0
                });
                K = p.button(r.text, 0, 0, fa, H, ia, N).attr({
                    title: q.options.lang[r._titleKey],
                    "stroke-linecap": "round",
                    zIndex: 3
                });
                K.menuClassName = l.menuClassName || "highcharts-menu-" + q.btnCount++;
                r.symbol && (F = p.symbol(r.symbol, r.symbolX - R / 2, r.symbolY - R / 2, R, R).attr(B(I, {
                    "stroke-width": r.symbolStrokeWidth || 1,
                    zIndex: 1
                })).add(K));
                K.add().align(B(r, {width: K.width, x: t.pick(r.x, v)}), !0, "spacingBox");
                v += (K.width + r.buttonSpacing) * ("right" === r.align ? -1 : 1);
                q.exportSVGElements.push(K, F)
            }
        }, destroyExport: function (l) {
            l = l.target;
            var q, v;
            for (q = 0; q < l.exportSVGElements.length; q++)if (v = l.exportSVGElements[q])v.onclick = v.ontouchstart = null, l.exportSVGElements[q] = v.destroy();
            for (q = 0; q < l.exportDivElements.length; q++)v =
                l.exportDivElements[q], ea(v, "mouseleave"), l.exportDivElements[q] = v.onmouseout = v.onmouseover = v.ontouchstart = v.onclick = null, r(v)
        }
    });
    I.menu = function (l, q, v, p) {
        return ["M", l, q + 2.5, "L", l + v, q + 2.5, "M", l, q + p / 2 + .5, "L", l + v, q + p / 2 + .5, "M", l, q + p - 1.5, "L", l + v, q + p - 1.5]
    };
    x.prototype.callbacks.push(function (l) {
        var q, p = l.options.exporting, r = p.buttons;
        v = 0;
        if (!1 !== p.enabled) {
            for (q in r)l.addButton(r[q]);
            H(l, "destroy", l.destroyExport)
        }
    })
});
(function (t) {
    "object" === typeof module && module.exports ? module.exports = t : t(Highcharts)
})(function (t) {
    function T(t, x) {
        var N = H.getElementsByTagName("head")[0], r = H.createElement("script");
        r.type = "text/javascript";
        r.src = t;
        r.onload = x;
        N.appendChild(r)
    }

    var V = t.win, x = V.navigator, H = V.document;
    t.CanVGRenderer = {};
    t.Chart.prototype.exportChartLocal = function (ea, R) {
        var N = this, r = t.merge(N.options.exporting, ea), p = -1 < x.userAgent.indexOf("WebKit") && 0 > x.userAgent.indexOf("Chrome"), y = r.scale || 2, K, B = V.URL || V.webkitURL ||
            V, D, F = 0, ia, I, fa, v = function () {
            if (!1 === r.fallbackToExportServer)if (r.error)r.error(); else throw"Fallback to export server disabled"; else N.exportChart(r)
        }, l = function (l, q, v, p, r, E, t) {
            var B = new V.Image, P, D = function () {
                var p = H.createElement("canvas"), E = p.getContext && p.getContext("2d"), D;
                try {
                    if (E) {
                        p.height = B.height * y;
                        p.width = B.width * y;
                        E.drawImage(B, 0, 0, p.width, p.height);
                        try {
                            D = p.toDataURL(), v(D, q)
                        } catch (x) {
                            if ("SecurityError" === x.name || "SECURITY_ERR" === x.name || "SecurityError" === x.message)P(l, q); else throw x;
                        }
                    } else r(l, q)
                } finally {
                    t && t(l, q)
                }
            }, x = function () {
                E(l, q);
                t && t(l, q)
            };
            P = function () {
                B = new V.Image;
                P = p;
                B.crossOrigin = "Anonymous";
                B.onload = D;
                B.onerror = x;
                B.src = l
            };
            B.onload = D;
            B.onerror = x;
            B.src = l
        }, q = function (l) {
            try {
                if (!p && 0 > x.userAgent.toLowerCase().indexOf("firefox"))return B.createObjectURL(new V.Blob([l], {type: "image/svg+xml;charset-utf-16"}))
            } catch (q) {
            }
            return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(l)
        }, E = function (l, q) {
            var v = H.createElement("a"), p = (r.filename || "chart") + "." + q, E;
            if (x.msSaveOrOpenBlob)x.msSaveOrOpenBlob(l,
                p); else if (void 0 !== v.download)v.href = l, v.download = p, v.target = "_blank", H.body.appendChild(v), v.click(), H.body.removeChild(v); else try {
                if (E = V.open(l, "chart"), void 0 === E || null === E)throw"Failed to open window";
            } catch (t) {
                V.location.href = l
            }
        }, P = function () {
            var p, P, D = N.sanitizeSVG(K.innerHTML);
            if (r && "image/svg+xml" === r.type)try {
                x.msSaveOrOpenBlob ? (P = new MSBlobBuilder, P.append(D), p = P.getBlob("image/svg+xml")) : p = q(D), E(p, "svg")
            } catch (F) {
                v()
            } else p = q(D), l(p, {}, function (l) {
                try {
                    E(l, "png")
                } catch (q) {
                    v()
                }
            }, function () {
                var l =
                    H.createElement("canvas"), q = l.getContext("2d"), p = D.match(/^<svg[^>]*width\s*=\s*\"?(\d+)\"?[^>]*>/)[1] * y, r = D.match(/^<svg[^>]*height\s*=\s*\"?(\d+)\"?[^>]*>/)[1] * y, B = function () {
                    q.drawSvg(D, 0, 0, p, r);
                    try {
                        E(x.msSaveOrOpenBlob ? l.msToBlob() : l.toDataURL("image/png"), "png")
                    } catch (t) {
                        v()
                    }
                };
                l.width = p;
                l.height = r;
                V.canvg ? B() : (N.showLoading(), T(t.getOptions().global.canvasToolsURL, function () {
                    N.hideLoading();
                    B()
                }))
            }, v, v, function () {
                try {
                    B.revokeObjectURL(p)
                } catch (l) {
                }
            })
        }, Z = function (l, q) {
            ++F;
            q.imageElement.setAttributeNS("http://www.w3.org/1999/xlink",
                "href", l);
            F === D.length && P()
        };
        t.wrap(t.Chart.prototype, "getChartHTML", function (l) {
            K = this.container.cloneNode(!0);
            return l.apply(this, Array.prototype.slice.call(arguments, 1))
        });
        N.getSVGForExport(r, R);
        D = K.getElementsByTagName("image");
        try {
            for (D.length || P(), I = 0, fa = D.length; I < fa; ++I)ia = D[I], l(ia.getAttributeNS("http://www.w3.org/1999/xlink", "href"), {imageElement: ia}, Z, v, v, v)
        } catch (Y) {
            v()
        }
    };
    t.getOptions().exporting.buttons.contextButton.menuItems = [{
        textKey: "printChart", onclick: function () {
            this.print()
        }
    },
        {separator: !0}, {
            textKey: "downloadPNG", onclick: function () {
                this.exportChartLocal()
            }
        }, {
            textKey: "downloadSVG", onclick: function () {
                this.exportChartLocal({type: "image/svg+xml"})
            }
        }]
});
(function (t) {
    "object" === typeof module && module.exports ? module.exports = t : t(Highcharts)
})(function (t) {
    var T = t.win.document, V = t.each, x = t.pick, H = t.inArray, ea = t.splat, R, N = function (r, p) {
        this.init(r, p)
    };
    t.extend(N.prototype, {
        init: function (r, p) {
            this.options = r;
            this.chartOptions = p;
            this.columns = r.columns || this.rowsToColumns(r.rows) || [];
            this.firstRowAsNames = x(r.firstRowAsNames, !0);
            this.decimalRegex = r.decimalPoint && new RegExp("^(-?[0-9]+)" + r.decimalPoint + "([0-9]+)$");
            this.rawColumns = [];
            this.columns.length ? this.dataFound() :
                (this.parseCSV(), this.parseTable(), this.parseGoogleSpreadsheet())
        }, getColumnDistribution: function () {
            var r = this.chartOptions, p = this.options, y = [], x = function (p) {
                return (t.seriesTypes[p || "line"].prototype.pointArrayMap || [0]).length
            }, B = r && r.chart && r.chart.type, D = [], F = [], H = 0, I;
            V(r && r.series || [], function (p) {
                D.push(x(p.type || B))
            });
            V(p && p.seriesMapping || [], function (p) {
                y.push(p.x || 0)
            });
            0 === y.length && y.push(0);
            V(p && p.seriesMapping || [], function (p) {
                var v = new R, l, q = D[H] || x(B), E = t.seriesTypes[((r && r.series || [])[H] ||
                    {}).type || B || "line"].prototype.pointArrayMap || ["y"];
                v.addColumnReader(p.x, "x");
                for (l in p)p.hasOwnProperty(l) && "x" !== l && v.addColumnReader(p[l], l);
                for (I = 0; I < q; I++)v.hasReader(E[I]) || v.addColumnReader(void 0, E[I]);
                F.push(v);
                H++
            });
            p = t.seriesTypes[B || "line"].prototype.pointArrayMap;
            void 0 === p && (p = ["y"]);
            this.valueCount = {global: x(B), xColumns: y, individual: D, seriesBuilders: F, globalPointArrayMap: p}
        }, dataFound: function () {
            this.options.switchRowsAndColumns && (this.columns = this.rowsToColumns(this.columns));
            this.getColumnDistribution();
            this.parseTypes();
            !1 !== this.parsed() && this.complete()
        }, parseCSV: function () {
            var r = this, p = this.options, t = p.csv, x = this.columns, B = p.startRow || 0, D = p.endRow || Number.MAX_VALUE, F = p.startColumn || 0, H = p.endColumn || Number.MAX_VALUE, I, R, v = 0;
            t && (R = t.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split(p.lineDelimiter || "\n"), I = p.itemDelimiter || (-1 !== t.indexOf("\t") ? "\t" : ","), V(R, function (l, q) {
                var p = r.trim(l), t = 0 === p.indexOf("#");
                q >= B && q <= D && !t && "" !== p && (p = l.split(I), V(p, function (l, q) {
                    q >= F && q <= H && (x[q - F] || (x[q - F] = []),
                        x[q - F][v] = l)
                }), v += 1)
            }), this.dataFound())
        }, parseTable: function () {
            var r = this.options, p = r.table, t = this.columns, x = r.startRow || 0, B = r.endRow || Number.MAX_VALUE, D = r.startColumn || 0, F = r.endColumn || Number.MAX_VALUE;
            p && ("string" === typeof p && (p = T.getElementById(p)), V(p.getElementsByTagName("tr"), function (p, r) {
                r >= x && r <= B && V(p.children, function (p, v) {
                    ("TD" === p.tagName || "TH" === p.tagName) && v >= D && v <= F && (t[v - D] || (t[v - D] = []), t[v - D][r - x] = p.innerHTML)
                })
            }), this.dataFound())
        }, parseGoogleSpreadsheet: function () {
            var r = this,
                p = this.options, t = p.googleSpreadsheetKey, x = this.columns, B = p.startRow || 0, D = p.endRow || Number.MAX_VALUE, F = p.startColumn || 0, H = p.endColumn || Number.MAX_VALUE, I, R;
            t && jQuery.ajax({
                dataType: "json",
                url: "https://spreadsheets.google.com/feeds/cells/" + t + "/" + (p.googleSpreadsheetWorksheet || "od6") + "/public/values?alt=json-in-script&callback=?",
                error: p.error,
                success: function (v) {
                    v = v.feed.entry;
                    var l, q = v.length, p = 0, t = 0, y;
                    for (y = 0; y < q; y++)l = v[y], p = Math.max(p, l.gs$cell.col), t = Math.max(t, l.gs$cell.row);
                    for (y = 0; y < p; y++)y >=
                    F && y <= H && (x[y - F] = [], x[y - F].length = Math.min(t, D - B));
                    for (y = 0; y < q; y++)l = v[y], I = l.gs$cell.row - 1, R = l.gs$cell.col - 1, R >= F && R <= H && I >= B && I <= D && (x[R - F][I - B] = l.content.$t);
                    r.dataFound()
                }
            })
        }, trim: function (r, p) {
            "string" === typeof r && (r = r.replace(/^\s+|\s+$/g, ""), p && /^[0-9\s]+$/.test(r) && (r = r.replace(/\s/g, "")), this.decimalRegex && (r = r.replace(this.decimalRegex, "$1.$2")));
            return r
        }, parseTypes: function () {
            for (var r = this.columns, p = r.length; p--;)this.parseColumn(r[p], p)
        }, parseColumn: function (r, p) {
            var t = this.rawColumns,
                x = this.columns, B = r.length, D, F, R, I, N = this.firstRowAsNames, v = -1 !== H(p, this.valueCount.xColumns), l = [], q = this.chartOptions, E, P = (this.options.columnTypes || [])[p], q = v && (q && q.xAxis && "category" === ea(q.xAxis)[0].type || "string" === P);
            for (t[p] || (t[p] = []); B--;)D = l[B] || r[B], R = this.trim(D), I = this.trim(D, !0), F = parseFloat(I), void 0 === t[p][B] && (t[p][B] = R), q || 0 === B && N ? r[B] = R : +I === F ? (r[B] = F, 31536E6 < F && "float" !== P ? r.isDatetime = !0 : r.isNumeric = !0, void 0 !== r[B + 1] && (E = F > r[B + 1])) : (F = this.parseDate(D), v && "number" === typeof F && !isNaN(F) && "float" !== P ? (l[B] = D, r[B] = F, r.isDatetime = !0, void 0 !== r[B + 1] && (D = F > r[B + 1], D !== E && void 0 !== E && (this.alternativeFormat ? (this.dateFormat = this.alternativeFormat, B = r.length, this.alternativeFormat = this.dateFormats[this.dateFormat].alternative) : r.unsorted = !0), E = D)) : (r[B] = "" === R ? null : R, 0 !== B && (r.isDatetime || r.isNumeric) && (r.mixed = !0)));
            v && r.mixed && (x[p] = t[p]);
            if (v && E && this.options.sort)for (p = 0; p < x.length; p++)x[p].reverse(), N && x[p].unshift(x[p].pop())
        }, dateFormats: {
            "YYYY-mm-dd": {
                regex: /^([0-9]{4})[\-\/\.]([0-9]{2})[\-\/\.]([0-9]{2})$/,
                parser: function (r) {
                    return Date.UTC(+r[1], r[2] - 1, +r[3])
                }
            }, "dd/mm/YYYY": {
                regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/, parser: function (r) {
                    return Date.UTC(+r[3], r[2] - 1, +r[1])
                }, alternative: "mm/dd/YYYY"
            }, "mm/dd/YYYY": {
                regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/, parser: function (r) {
                    return Date.UTC(+r[3], r[1] - 1, +r[2])
                }
            }, "dd/mm/YY": {
                regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/, parser: function (r) {
                    return Date.UTC(+r[3] + 2E3, r[2] - 1, +r[1])
                }, alternative: "mm/dd/YY"
            },
            "mm/dd/YY": {
                regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/, parser: function (r) {
                    return Date.UTC(+r[3] + 2E3, r[1] - 1, +r[2])
                }
            }
        }, parseDate: function (r) {
            var p = this.options.parseDate, t, x, B = this.options.dateFormat || this.dateFormat, D;
            if (p)t = p(r); else if ("string" === typeof r) {
                if (B)p = this.dateFormats[B], (D = r.match(p.regex)) && (t = p.parser(D)); else for (x in this.dateFormats)if (p = this.dateFormats[x], D = r.match(p.regex)) {
                    this.dateFormat = x;
                    this.alternativeFormat = p.alternative;
                    t = p.parser(D);
                    break
                }
                D || (D = Date.parse(r),
                    "object" === typeof D && null !== D && D.getTime ? t = D.getTime() - 6E4 * D.getTimezoneOffset() : "number" !== typeof D || isNaN(D) || (t = D - 6E4 * (new Date(D)).getTimezoneOffset()))
            }
            return t
        }, rowsToColumns: function (r) {
            var p, t, x, B, D;
            if (r)for (D = [], t = r.length, p = 0; p < t; p++)for (B = r[p].length, x = 0; x < B; x++)D[x] || (D[x] = []), D[x][p] = r[p][x];
            return D
        }, parsed: function () {
            if (this.options.parsed)return this.options.parsed.call(this, this.columns)
        }, getFreeIndexes: function (r, p) {
            var t, x, B = [], D = [], F;
            for (x = 0; x < r; x += 1)B.push(!0);
            for (t = 0; t < p.length; t +=
                1)for (F = p[t].getReferencedColumnIndexes(), x = 0; x < F.length; x += 1)B[F[x]] = !1;
            for (x = 0; x < B.length; x += 1)B[x] && D.push(x);
            return D
        }, complete: function () {
            var r = this.columns, p, t = this.options, x, B, D, F, N = [], I;
            if (t.complete || t.afterComplete) {
                for (D = 0; D < r.length; D++)this.firstRowAsNames && (r[D].name = r[D].shift());
                x = [];
                B = this.getFreeIndexes(r.length, this.valueCount.seriesBuilders);
                for (D = 0; D < this.valueCount.seriesBuilders.length; D++)I = this.valueCount.seriesBuilders[D], I.populateColumns(B) && N.push(I);
                for (; 0 < B.length;) {
                    I =
                        new R;
                    I.addColumnReader(0, "x");
                    D = H(0, B);
                    -1 !== D && B.splice(D, 1);
                    for (D = 0; D < this.valueCount.global; D++)I.addColumnReader(void 0, this.valueCount.globalPointArrayMap[D]);
                    I.populateColumns(B) && N.push(I)
                }
                0 < N.length && 0 < N[0].readers.length && (I = r[N[0].readers[0].columnIndex], void 0 !== I && (I.isDatetime ? p = "datetime" : I.isNumeric || (p = "category")));
                if ("category" === p)for (D = 0; D < N.length; D++)for (I = N[D], B = 0; B < I.readers.length; B++)"x" === I.readers[B].configName && (I.readers[B].configName = "name");
                for (D = 0; D < N.length; D++) {
                    I =
                        N[D];
                    B = [];
                    for (F = 0; F < r[0].length; F++)B[F] = I.read(r, F);
                    x[D] = {data: B};
                    I.name && (x[D].name = I.name);
                    "category" === p && (x[D].turboThreshold = 0)
                }
                r = {series: x};
                p && (r.xAxis = {type: p});
                t.complete && t.complete(r);
                t.afterComplete && t.afterComplete(r)
            }
        }
    });
    t.Data = N;
    t.data = function (r, p) {
        return new N(r, p)
    };
    t.wrap(t.Chart.prototype, "init", function (r, p, y) {
        var x = this;
        p && p.data ? t.data(t.extend(p.data, {
            afterComplete: function (B) {
                var D, F;
                if (p.hasOwnProperty("series"))if ("object" === typeof p.series)for (D = Math.max(p.series.length,
                    B.series.length); D--;)F = p.series[D] || {}, p.series[D] = t.merge(F, B.series[D]); else delete p.series;
                p = t.merge(B, p);
                r.call(x, p, y)
            }
        }), p) : r.call(x, p, y)
    });
    R = function () {
        this.readers = [];
        this.pointIsArray = !0
    };
    R.prototype.populateColumns = function (r) {
        var p = !0;
        V(this.readers, function (p) {
            void 0 === p.columnIndex && (p.columnIndex = r.shift())
        });
        V(this.readers, function (r) {
            void 0 === r.columnIndex && (p = !1)
        });
        return p
    };
    R.prototype.read = function (r, p) {
        var t = this.pointIsArray, x = t ? [] : {}, B;
        V(this.readers, function (B) {
            var F = r[B.columnIndex][p];
            t ? x.push(F) : x[B.configName] = F
        });
        void 0 === this.name && 2 <= this.readers.length && (B = this.getReferencedColumnIndexes(), 2 <= B.length && (B.shift(), B.sort(), this.name = r[B.shift()].name));
        return x
    };
    R.prototype.addColumnReader = function (r, p) {
        this.readers.push({columnIndex: r, configName: p});
        "x" !== p && "y" !== p && void 0 !== p && (this.pointIsArray = !1)
    };
    R.prototype.getReferencedColumnIndexes = function () {
        var r, p = [], t;
        for (r = 0; r < this.readers.length; r += 1)t = this.readers[r], void 0 !== t.columnIndex && p.push(t.columnIndex);
        return p
    };
    R.prototype.hasReader = function (r) {
        var p, t;
        for (p = 0; p < this.readers.length; p += 1)if (t = this.readers[p], t.configName === r)return !0
    }
});
(function (t) {
    "object" === typeof module && module.exports ? module.exports = t : t(Highcharts)
})(function (t) {
    function T() {
        return !!this.points.length
    }

    function V() {
        this.hasData() ? this.hideNoData() : this.showNoData()
    }

    var x = t.seriesTypes, H = t.Chart.prototype, ea = t.getOptions(), R = t.extend, N = t.each;
    R(ea.lang, {noData: "No data to display"});
    ea.noData = {
        position: {x: 0, y: 0, align: "center", verticalAlign: "middle"},
        attr: {},
        style: {fontWeight: "bold", fontSize: "12px", color: "#60606a"}
    };
    N(["pie", "gauge", "waterfall", "bubble", "treemap"],
        function (r) {
            x[r] && (x[r].prototype.hasData = T)
        });
    t.Series.prototype.hasData = function () {
        return this.visible && void 0 !== this.dataMax && void 0 !== this.dataMin
    };
    H.showNoData = function (r) {
        var p = this.options;
        r = r || p.lang.noData;
        p = p.noData;
        this.noDataLabel || (this.noDataLabel = this.renderer.label(r, 0, 0, null, null, null, p.useHTML, null, "no-data").attr(p.attr).css(p.style).add(), this.noDataLabel.align(R(this.noDataLabel.getBBox(), p.position), !1, "plotBox"))
    };
    H.hideNoData = function () {
        this.noDataLabel && (this.noDataLabel =
            this.noDataLabel.destroy())
    };
    H.hasData = function () {
        for (var r = this.series, p = r.length; p--;)if (r[p].hasData() && !r[p].options.isInternal)return !0;
        return !1
    };
    H.callbacks.push(function (r) {
        t.addEvent(r, "load", V);
        t.addEvent(r, "redraw", V)
    })
});
(function (t) {
    "object" === typeof module && module.exports ? module.exports = t : t(Highcharts)
})(function (t) {
    function T(v, l, q) {
        var p;
        l.rgba.length && v.rgba.length ? (v = v.rgba, l = l.rgba, p = 1 !== l[3] || 1 !== v[3], v = (p ? "rgba(" : "rgb(") + Math.round(l[0] + (v[0] - l[0]) * (1 - q)) + "," + Math.round(l[1] + (v[1] - l[1]) * (1 - q)) + "," + Math.round(l[2] + (v[2] - l[2]) * (1 - q)) + (p ? "," + (l[3] + (v[3] - l[3]) * (1 - q)) : "") + ")") : v = l.input || "none";
        return v
    }

    var V = function () {
        }, x = t.getOptions(), H = t.each, ea = t.extend, R = t.format, N = t.pick, r = t.wrap, p = t.Chart, y = t.seriesTypes,
        K = y.pie, B = y.column, D = t.Tick, F = t.fireEvent, ia = t.inArray, I = 1;
    H(["fill", "stroke"], function (v) {
        t.Fx.prototype[v + "Setter"] = function () {
            this.elem.attr(v, T(t.Color(this.start), t.Color(this.end), this.pos))
        }
    });
    ea(x.lang, {drillUpText: "\u25c1 Back to {series.name}"});
    x.drilldown = {
        activeAxisLabelStyle: {cursor: "pointer", color: "#0d233a", fontWeight: "bold", textDecoration: "underline"},
        activeDataLabelStyle: {cursor: "pointer", color: "#0d233a", fontWeight: "bold", textDecoration: "underline"},
        animation: {duration: 500},
        drillUpButton: {
            position: {
                align: "right",
                x: -10, y: 10
            }
        }
    };
    t.SVGRenderer.prototype.Element.prototype.fadeIn = function (v) {
        this.attr({opacity: .1, visibility: "inherit"}).animate({opacity: N(this.newOpacity, 1)}, v || {duration: 250})
    };
    p.prototype.addSeriesAsDrilldown = function (v, l) {
        this.addSingleSeriesAsDrilldown(v, l);
        this.applyDrilldown()
    };
    p.prototype.addSingleSeriesAsDrilldown = function (v, l) {
        var q = v.series, p = q.xAxis, r = q.yAxis, t;
        t = v.color || q.color;
        var x, y = [], B = [], D, F;
        this.drilldownLevels || (this.drilldownLevels = []);
        D = q.options._levelNumber || 0;
        (F = this.drilldownLevels[this.drilldownLevels.length -
        1]) && F.levelNumber !== D && (F = void 0);
        l = ea({color: t, _ddSeriesId: I++}, l);
        x = ia(v, q.points);
        H(q.chart.series, function (l) {
            l.xAxis !== p || l.isDrilling || (l.options._ddSeriesId = l.options._ddSeriesId || I++, l.options._colorIndex = l.userOptions._colorIndex, l.options._levelNumber = l.options._levelNumber || D, F ? (y = F.levelSeries, B = F.levelSeriesOptions) : (y.push(l), B.push(l.options)))
        });
        t = {
            levelNumber: D,
            seriesOptions: q.options,
            levelSeriesOptions: B,
            levelSeries: y,
            shapeArgs: v.shapeArgs,
            bBox: v.graphic ? v.graphic.getBBox() : {},
            color: t,
            lowerSeriesOptions: l,
            pointOptions: q.options.data[x],
            pointIndex: x,
            oldExtremes: {xMin: p && p.userMin, xMax: p && p.userMax, yMin: r && r.userMin, yMax: r && r.userMax}
        };
        this.drilldownLevels.push(t);
        t = t.lowerSeries = this.addSeries(l, !1);
        t.options._levelNumber = D + 1;
        p && (p.oldPos = p.pos, p.userMin = p.userMax = null, r.userMin = r.userMax = null);
        q.type === t.type && (t.animate = t.animateDrilldown || V, t.options.animation = !0)
    };
    p.prototype.applyDrilldown = function () {
        var v = this.drilldownLevels, l;
        v && 0 < v.length && (l = v[v.length - 1].levelNumber,
            H(this.drilldownLevels, function (q) {
                q.levelNumber === l && H(q.levelSeries, function (q) {
                    q.options && q.options._levelNumber === l && q.remove(!1)
                })
            }));
        this.redraw();
        this.showDrillUpButton()
    };
    p.prototype.getDrilldownBackText = function () {
        var v = this.drilldownLevels;
        if (v && 0 < v.length)return v = v[v.length - 1], v.series = v.seriesOptions, R(this.options.lang.drillUpText, v)
    };
    p.prototype.showDrillUpButton = function () {
        var v = this, l = this.getDrilldownBackText(), q = v.options.drilldown.drillUpButton, p, r;
        this.drillUpButton ? this.drillUpButton.attr({text: l}).align() :
            (r = (p = q.theme) && p.states, this.drillUpButton = this.renderer.button(l, null, null, function () {
                v.drillUp()
            }, p, r && r.hover, r && r.select).attr({
                align: q.position.align,
                zIndex: 9
            }).add().align(q.position, !1, q.relativeTo || "plotBox"))
    };
    p.prototype.drillUp = function () {
        for (var v = this, l = v.drilldownLevels, q = l[l.length - 1].levelNumber, p = l.length, r = v.series, t, x, y, B, D = function (l) {
            var q;
            H(r, function (v) {
                v.options._ddSeriesId === l._ddSeriesId && (q = v)
            });
            q = q || v.addSeries(l, !1);
            q.type === y.type && q.animateDrillupTo && (q.animate = q.animateDrillupTo);
            l === x.seriesOptions && (B = q)
        }; p--;)if (x = l[p], x.levelNumber === q) {
            l.pop();
            y = x.lowerSeries;
            if (!y.chart)for (t = r.length; t--;)if (r[t].options.id === x.lowerSeriesOptions.id && r[t].options._levelNumber === q + 1) {
                y = r[t];
                break
            }
            y.xData = [];
            H(x.levelSeriesOptions, D);
            F(v, "drillup", {seriesOptions: x.seriesOptions});
            B.type === y.type && (B.drilldownLevel = x, B.options.animation = v.options.drilldown.animation, y.animateDrillupFrom && y.chart && y.animateDrillupFrom(x));
            B.options._levelNumber = q;
            y.remove(!1);
            B.xAxis && (t = x.oldExtremes,
                B.xAxis.setExtremes(t.xMin, t.xMax, !1), B.yAxis.setExtremes(t.yMin, t.yMax, !1))
        }
        F(v, "drillupall");
        this.redraw();
        0 === this.drilldownLevels.length ? this.drillUpButton = this.drillUpButton.destroy() : this.drillUpButton.attr({text: this.getDrilldownBackText()}).align();
        this.ddDupes.length = []
    };
    B.prototype.supportsDrilldown = !0;
    B.prototype.animateDrillupTo = function (v) {
        if (!v) {
            var l = this, q = l.drilldownLevel;
            H(this.points, function (l) {
                l.graphic && l.graphic.hide();
                l.dataLabel && l.dataLabel.hide();
                l.connector && l.connector.hide()
            });
            setTimeout(function () {
                l.points && H(l.points, function (l, v) {
                    var p = v === (q && q.pointIndex) ? "show" : "fadeIn", r = "show" === p ? !0 : void 0;
                    if (l.graphic)l.graphic[p](r);
                    if (l.dataLabel)l.dataLabel[p](r);
                    if (l.connector)l.connector[p](r)
                })
            }, Math.max(this.chart.options.drilldown.animation.duration - 50, 0));
            this.animate = V
        }
    };
    B.prototype.animateDrilldown = function (v) {
        var l = this, q = this.chart.drilldownLevels, p, r = this.chart.options.drilldown.animation, t = this.xAxis;
        v || (H(q, function (q) {
            l.options._ddSeriesId === q.lowerSeriesOptions._ddSeriesId &&
            (p = q.shapeArgs, p.fill = q.color)
        }), p.x += N(t.oldPos, t.pos) - t.pos, H(this.points, function (l) {
            l.graphic && l.graphic.attr(p).animate(ea(l.shapeArgs, {fill: l.color}), r);
            l.dataLabel && l.dataLabel.fadeIn(r)
        }), this.animate = null)
    };
    B.prototype.animateDrillupFrom = function (v) {
        var l = this.chart.options.drilldown.animation, q = this.group, p = this;
        H(p.trackerGroups, function (l) {
            if (p[l])p[l].on("mouseover")
        });
        delete this.group;
        H(this.points, function (p) {
            var r = p.graphic, E = function () {
                r.destroy();
                q && (q = q.destroy())
            };
            r && (delete p.graphic,
                l ? r.animate(ea(v.shapeArgs, {fill: v.color}), t.merge(l, {complete: E})) : (r.attr(v.shapeArgs), E()))
        })
    };
    K && ea(K.prototype, {
        supportsDrilldown: !0,
        animateDrillupTo: B.prototype.animateDrillupTo,
        animateDrillupFrom: B.prototype.animateDrillupFrom,
        animateDrilldown: function (p) {
            var l = this.chart.drilldownLevels[this.chart.drilldownLevels.length - 1], q = this.chart.options.drilldown.animation, r = l.shapeArgs, x = r.start, y = (r.end - x) / this.points.length;
            p || (H(this.points, function (p, v) {
                p.graphic.attr(t.merge(r, {
                    start: x + v * y, end: x +
                    (v + 1) * y, fill: l.color
                }))[q ? "animate" : "attr"](ea(p.shapeArgs, {fill: p.color}), q)
            }), this.animate = null)
        }
    });
    t.Point.prototype.doDrilldown = function (p, l, q) {
        var r = this.series.chart, t = r.options.drilldown, x = (t.series || []).length, y;
        r.ddDupes || (r.ddDupes = []);
        for (; x-- && !y;)t.series[x].id === this.drilldown && -1 === ia(this.drilldown, r.ddDupes) && (y = t.series[x], r.ddDupes.push(this.drilldown));
        F(r, "drilldown", {
                point: this,
                seriesOptions: y,
                category: l,
                originalEvent: q,
                points: void 0 !== l && this.series.xAxis.ddPoints[l].slice(0)
            },
            function (l) {
                var q = l.point.series && l.point.series.chart, r = l.seriesOptions;
                q && r && (p ? q.addSingleSeriesAsDrilldown(l.point, r) : q.addSeriesAsDrilldown(l.point, r))
            })
    };
    t.Axis.prototype.drilldownCategory = function (p, l) {
        var q, r, t = this.ddPoints[p];
        for (q in t)(r = t[q]) && r.series && r.series.visible && r.doDrilldown && r.doDrilldown(!0, p, l);
        this.chart.applyDrilldown()
    };
    t.Axis.prototype.getDDPoints = function (p, l) {
        var q = this.ddPoints;
        q || (this.ddPoints = q = {});
        q[p] || (q[p] = []);
        q[p].levelNumber !== l && (q[p].length = 0);
        return q[p]
    };
    D.prototype.drillable = function () {
        var p = this.pos, l = this.label, q = this.axis, r = q.ddPoints && q.ddPoints[p];
        l && r && r.length ? (l.basicStyles || (l.basicStyles = t.merge(l.styles)), l.addClass("highcharts-drilldown-axis-label").css(q.chart.options.drilldown.activeAxisLabelStyle).on("click", function (l) {
            q.drilldownCategory(p, l)
        })) : l && l.basicStyles && (l.styles = {}, l.css(l.basicStyles), l.on("click", null))
    };
    r(D.prototype, "addLabel", function (p) {
        p.call(this);
        this.drillable()
    });
    r(t.Point.prototype, "init", function (p, l, q, r) {
        var x =
            p.call(this, l, q, r);
        p = (q = l.xAxis) && q.ticks[r];
        q = q && q.getDDPoints(r, l.options._levelNumber);
        x.drilldown && (t.addEvent(x, "click", function (q) {
            l.xAxis && !1 === l.chart.options.drilldown.allowPointDrilldown ? l.xAxis.drilldownCategory(r, q) : x.doDrilldown(void 0, void 0, q)
        }), q && (q.push(x), q.levelNumber = l.options._levelNumber));
        p && p.drillable();
        return x
    });
    r(t.Series.prototype, "drawDataLabels", function (p) {
        var l = this.chart.options.drilldown.activeDataLabelStyle;
        p.call(this);
        H(this.points, function (q) {
            q.drilldown && q.dataLabel &&
            q.dataLabel.attr({"class": "highcharts-drilldown-data-label"}).css(l)
        })
    });
    var fa, x = function (p) {
        p.call(this);
        H(this.points, function (l) {
            l.drilldown && l.graphic && l.graphic.attr({"class": "highcharts-drilldown-point"}).css({cursor: "pointer"})
        })
    };
    for (fa in y)y[fa].prototype.supportsDrilldown && r(y[fa].prototype, "drawTracker", x)
});
(function (t) {
    "object" === typeof module && module.exports ? module.exports = t : t(Highcharts)
})(function (t) {
    var T = t.getOptions().plotOptions, V = t.pInt, x = t.pick, H = t.each, ea;
    T.solidgauge = t.merge(T.gauge, {colorByPoint: !0});
    ea = {
        initDataClasses: function (x) {
            var N = this, r = this.chart, p, y = 0, K = this.options;
            this.dataClasses = p = [];
            H(x.dataClasses, function (B, D) {
                var F;
                B = t.merge(B);
                p.push(B);
                B.color || ("category" === K.dataClassColor ? (F = r.options.colors, B.color = F[y++], y === F.length && (y = 0)) : B.color = N.tweenColors(t.Color(K.minColor),
                    t.Color(K.maxColor), D / (x.dataClasses.length - 1)))
            })
        }, initStops: function (x) {
            this.stops = x.stops || [[0, this.options.minColor], [1, this.options.maxColor]];
            H(this.stops, function (x) {
                x.color = t.Color(x[1])
            })
        }, toColor: function (t, x) {
            var r, p = this.stops, y, H = this.dataClasses, B, D;
            if (H)for (D = H.length; D--;) {
                if (B = H[D], y = B.from, p = B.to, (void 0 === y || t >= y) && (void 0 === p || t <= p)) {
                    r = B.color;
                    x && (x.dataClass = D);
                    break
                }
            } else {
                this.isLog && (t = this.val2lin(t));
                r = 1 - (this.max - t) / (this.max - this.min);
                for (D = p.length; D-- && !(r > p[D][0]););
                y = p[D] || p[D + 1];
                p = p[D + 1] || y;
                r = 1 - (p[0] - r) / (p[0] - y[0] || 1);
                r = this.tweenColors(y.color, p.color, r)
            }
            return r
        }, tweenColors: function (t, x, r) {
            var p;
            x.rgba.length && t.rgba.length ? (t = t.rgba, x = x.rgba, p = 1 !== x[3] || 1 !== t[3], t = (p ? "rgba(" : "rgb(") + Math.round(x[0] + (t[0] - x[0]) * (1 - r)) + "," + Math.round(x[1] + (t[1] - x[1]) * (1 - r)) + "," + Math.round(x[2] + (t[2] - x[2]) * (1 - r)) + (p ? "," + (x[3] + (t[3] - x[3]) * (1 - r)) : "") + ")") : t = x.input || "none";
            return t
        }
    };
    H(["fill", "stroke"], function (x) {
        t.Fx.prototype[x + "Setter"] = function () {
            this.elem.attr(x, ea.tweenColors(t.Color(this.start),
                t.Color(this.end), this.pos))
        }
    });
    t.seriesTypes.solidgauge = t.extendClass(t.seriesTypes.gauge, {
        type: "solidgauge", pointAttrToOptions: {}, bindAxes: function () {
            var x;
            t.seriesTypes.gauge.prototype.bindAxes.call(this);
            x = this.yAxis;
            t.extend(x, ea);
            x.options.dataClasses && x.initDataClasses(x.options);
            x.initStops(x.options)
        }, drawPoints: function () {
            var H = this, N = H.yAxis, r = N.center, p = H.options, y = H.chart.renderer, K = p.overshoot, B = K && "number" === typeof K ? K / 180 * Math.PI : 0;
            t.each(H.points, function (t) {
                var F = t.graphic, K = N.startAngleRad +
                    N.translate(t.y, null, null, null, !0), I = V(x(t.options.radius, p.radius, 100)) * r[2] / 200, T = V(x(t.options.innerRadius, p.innerRadius, 60)) * r[2] / 200, v = N.toColor(t.y, t), l = Math.min(N.startAngleRad, N.endAngleRad), q = Math.max(N.startAngleRad, N.endAngleRad);
                "none" === v && (v = t.color || H.color || "none");
                "none" !== v && (t.color = v);
                K = Math.max(l - B, Math.min(q + B, K));
                !1 === p.wrap && (K = Math.max(l, Math.min(q, K)));
                l = Math.min(K, N.startAngleRad);
                K = Math.max(K, N.startAngleRad);
                K - l > 2 * Math.PI && (K = l + 2 * Math.PI);
                t.shapeArgs = T = {
                    x: r[0], y: r[1],
                    r: I, innerR: T, start: l, end: K, fill: v
                };
                t.startR = I;
                F ? (t = T.d, F.animate(T), t && (T.d = t)) : (F = {
                    stroke: p.borderColor || "none",
                    "stroke-width": p.borderWidth || 0,
                    fill: v,
                    "sweep-flag": 0
                }, "square" !== p.linecap && (F["stroke-linecap"] = F["stroke-linejoin"] = "round"), t.graphic = y.arc(T).attr(F).add(H.group))
            })
        }, animate: function (x) {
            x || (this.startAngleRad = this.yAxis.startAngleRad, t.seriesTypes.pie.prototype.animate.call(this, x))
        }
    })
});
(function (t) {
    "object" === typeof module && module.exports ? module.exports = t : t(Highcharts)
})(function (t) {
    var T = t.Axis, V = t.Chart, x = t.Color, H = t.Legend, ea = t.LegendSymbolMixin, R = t.Series, N = t.Point, r = t.getOptions(), p = t.each, y = t.extend, K = t.extendClass, B = t.merge, D = t.pick, F = t.seriesTypes, ia = t.wrap, I = function () {
    }, fa = t.ColorAxis = function () {
        this.isColorAxis = !0;
        this.init.apply(this, arguments)
    };
    y(fa.prototype, T.prototype);
    y(fa.prototype, {
        defaultColorAxisOptions: {
            lineWidth: 0,
            minPadding: 0,
            maxPadding: 0,
            gridLineWidth: 1,
            tickPixelInterval: 72,
            startOnTick: !0,
            endOnTick: !0,
            offset: 0,
            marker: {animation: {duration: 50}, color: "gray", width: .01},
            labels: {overflow: "justify"},
            minColor: "#EFEFFF",
            maxColor: "#003875",
            tickLength: 5
        }, init: function (p, l) {
            var q = "vertical" !== p.options.legend.layout, r;
            r = B(this.defaultColorAxisOptions, {side: q ? 2 : 1, reversed: !q}, l, {
                opposite: !q,
                showEmpty: !1,
                title: null,
                isColor: !0
            });
            T.prototype.init.call(this, p, r);
            l.dataClasses && this.initDataClasses(l);
            this.initStops(l);
            this.horiz = q;
            this.zoomEnabled = !1
        }, tweenColors: function (p,
                                  l, q) {
            var r;
            l.rgba.length && p.rgba.length ? (p = p.rgba, l = l.rgba, r = 1 !== l[3] || 1 !== p[3], p = (r ? "rgba(" : "rgb(") + Math.round(l[0] + (p[0] - l[0]) * (1 - q)) + "," + Math.round(l[1] + (p[1] - l[1]) * (1 - q)) + "," + Math.round(l[2] + (p[2] - l[2]) * (1 - q)) + (r ? "," + (l[3] + (p[3] - l[3]) * (1 - q)) : "") + ")") : p = l.input || "none";
            return p
        }, initDataClasses: function (v) {
            var l = this, q = this.chart, r, t = 0, y = this.options, D = v.dataClasses.length;
            this.dataClasses = r = [];
            this.legendItems = [];
            p(v.dataClasses, function (p, v) {
                var F;
                p = B(p);
                r.push(p);
                p.color || ("category" === y.dataClassColor ?
                    (F = q.options.colors, p.color = F[t++], t === F.length && (t = 0)) : p.color = l.tweenColors(x(y.minColor), x(y.maxColor), 2 > D ? .5 : v / (D - 1)))
            })
        }, initStops: function (v) {
            this.stops = v.stops || [[0, this.options.minColor], [1, this.options.maxColor]];
            p(this.stops, function (l) {
                l.color = x(l[1])
            })
        }, setOptions: function (p) {
            T.prototype.setOptions.call(this, p);
            this.options.crosshair = this.options.marker;
            this.coll = "colorAxis"
        }, setAxisSize: function () {
            var p = this.legendSymbol, l = this.chart, q, r, t;
            p && (this.left = q = p.attr("x"), this.top = r = p.attr("y"),
                this.width = t = p.attr("width"), this.height = p = p.attr("height"), this.right = l.chartWidth - q - t, this.bottom = l.chartHeight - r - p, this.len = this.horiz ? t : p, this.pos = this.horiz ? q : r)
        }, toColor: function (p, l) {
            var q, r = this.stops, t, x = this.dataClasses, y, B;
            if (x)for (B = x.length; B--;) {
                if (y = x[B], t = y.from, r = y.to, (void 0 === t || p >= t) && (void 0 === r || p <= r)) {
                    q = y.color;
                    l && (l.dataClass = B);
                    break
                }
            } else {
                this.isLog && (p = this.val2lin(p));
                q = 1 - (this.max - p) / (this.max - this.min || 1);
                for (B = r.length; B-- && !(q > r[B][0]););
                t = r[B] || r[B + 1];
                r = r[B + 1] || t;
                q = 1 - (r[0] - q) / (r[0] - t[0] || 1);
                q = this.tweenColors(t.color, r.color, q)
            }
            return q
        }, getOffset: function () {
            var p = this.legendGroup, l = this.chart.axisOffset[this.side];
            p && (this.axisParent = p, T.prototype.getOffset.call(this), this.added || (this.added = !0, this.labelLeft = 0, this.labelRight = this.width), this.chart.axisOffset[this.side] = l)
        }, setLegendColor: function () {
            var p, l = this.options, q = this.reversed;
            p = q ? 1 : 0;
            q = q ? 0 : 1;
            p = this.horiz ? [p, 0, q, 0] : [0, q, 0, p];
            this.legendColor = {
                linearGradient: {x1: p[0], y1: p[1], x2: p[2], y2: p[3]}, stops: l.stops ||
                [[0, l.minColor], [1, l.maxColor]]
            }
        }, drawLegendSymbol: function (p, l) {
            var q = p.padding, r = p.options, t = this.horiz, x = D(r.symbolWidth, t ? 200 : 12), y = D(r.symbolHeight, t ? 12 : 200), B = D(r.labelPadding, t ? 16 : 30), r = D(r.itemDistance, 10);
            this.setLegendColor();
            l.legendSymbol = this.chart.renderer.rect(0, p.baseline - 11, x, y).attr({zIndex: 1}).add(l.legendGroup);
            this.legendItemWidth = x + q + (t ? r : B);
            this.legendItemHeight = y + q + (t ? B : 0)
        }, setState: I, visible: !0, setVisible: I, getSeriesExtremes: function () {
            var p;
            this.series.length && (p = this.series[0],
                this.dataMin = p.valueMin, this.dataMax = p.valueMax)
        }, drawCrosshair: function (p, l) {
            var q = l && l.plotX, r = l && l.plotY, t, x = this.pos, y = this.len;
            l && (t = this.toPixels(l[l.series.colorKey]), t < x ? t = x - 2 : t > x + y && (t = x + y + 2), l.plotX = t, l.plotY = this.len - t, T.prototype.drawCrosshair.call(this, p, l), l.plotX = q, l.plotY = r, this.cross && this.cross.attr({fill: this.crosshair.color}).add(this.legendGroup))
        }, getPlotLinePath: function (p, l, q, r, t) {
            return "number" === typeof t ? this.horiz ? ["M", t - 4, this.top - 6, "L", t + 4, this.top - 6, t, this.top, "Z"] : ["M",
                this.left, t, "L", this.left - 6, t + 6, this.left - 6, t - 6, "Z"] : T.prototype.getPlotLinePath.call(this, p, l, q, r)
        }, update: function (r, l) {
            var q = this.chart, t = q.legend;
            p(this.series, function (l) {
                l.isDirtyData = !0
            });
            r.dataClasses && t.allItems && (p(t.allItems, function (l) {
                l.isDataClass && l.legendGroup.destroy()
            }), q.isDirtyLegend = !0);
            q.options[this.coll] = B(this.userOptions, r);
            T.prototype.update.call(this, r, l);
            this.legendItem && (this.setLegendColor(), t.colorizeItem(this, !0))
        }, getDataClassLegendSymbols: function () {
            var r = this, l =
                this.chart, q = this.legendItems, x = l.options.legend, B = x.valueDecimals, D = x.valueSuffix || "", F;
            q.length || p(this.dataClasses, function (x, E) {
                var H = !0, K = x.from, N = x.to;
                F = "";
                void 0 === K ? F = "< " : void 0 === N && (F = "> ");
                void 0 !== K && (F += t.numberFormat(K, B) + D);
                void 0 !== K && void 0 !== N && (F += " - ");
                void 0 !== N && (F += t.numberFormat(N, B) + D);
                q.push(y({
                    chart: l,
                    name: F,
                    options: {},
                    drawLegendSymbol: ea.drawRectangle,
                    visible: !0,
                    setState: I,
                    isDataClass: !0,
                    setVisible: function () {
                        H = this.visible = !H;
                        p(r.series, function (l) {
                            p(l.points, function (l) {
                                l.dataClass ===
                                E && l.setVisible(H)
                            })
                        });
                        l.legend.colorizeItem(this, H)
                    }
                }, x))
            });
            return q
        }, name: ""
    });
    p(["fill", "stroke"], function (p) {
        t.Fx.prototype[p + "Setter"] = function () {
            this.elem.attr(p, fa.prototype.tweenColors(x(this.start), x(this.end), this.pos))
        }
    });
    ia(V.prototype, "getAxes", function (p) {
        var l = this.options.colorAxis;
        p.call(this);
        this.colorAxis = [];
        l && new fa(this, l)
    });
    ia(H.prototype, "getAllItems", function (r) {
        var l = [], q = this.chart.colorAxis[0];
        q && (q.options.dataClasses ? l = l.concat(q.getDataClassLegendSymbols()) : l.push(q),
            p(q.series, function (l) {
                l.options.showInLegend = !1
            }));
        return l.concat(r.call(this))
    });
    V = {
        pointAttrToOptions: {
            stroke: "borderColor",
            "stroke-width": "borderWidth",
            fill: "color",
            dashstyle: "dashStyle"
        },
        pointArrayMap: ["value"],
        axisTypes: ["xAxis", "yAxis", "colorAxis"],
        optionalAxis: "colorAxis",
        trackerGroups: ["group", "markerGroup", "dataLabelsGroup"],
        getSymbol: I,
        parallelArrays: ["x", "y", "value"],
        colorKey: "value",
        translateColors: function () {
            var r = this, l = this.options.nullColor, q = this.colorAxis, t = this.colorKey;
            p(this.data,
                function (p) {
                    var x = p[t];
                    if (x = p.options.color || (null === x ? l : q && void 0 !== x ? q.toColor(x, p) : p.color || r.color))p.color = x
                })
        }
    };
    r.plotOptions.heatmap = B(r.plotOptions.scatter, {
        animation: !1,
        borderWidth: 0,
        nullColor: "#F8F8F8",
        dataLabels: {
            formatter: function () {
                return this.point.value
            }, inside: !0, verticalAlign: "middle", crop: !1, overflow: !1, padding: 0
        },
        marker: null,
        pointRange: null,
        tooltip: {pointFormat: "{point.x}, {point.y}: {point.value}<br/>"},
        states: {normal: {animation: !0}, hover: {halo: !1, brightness: .2}}
    });
    F.heatmap = K(F.scatter,
        B(V, {
            type: "heatmap",
            pointArrayMap: ["y", "value"],
            hasPointSpecificOptions: !0,
            pointClass: K(N, {
                setVisible: function (r) {
                    var l = this, q = r ? "show" : "hide";
                    p(["graphic", "dataLabel"], function (p) {
                        if (l[p])l[p][q]()
                    })
                }
            }),
            supportsDrilldown: !0,
            getExtremesFromAll: !0,
            directTouch: !0,
            init: function () {
                var p;
                F.scatter.prototype.init.apply(this, arguments);
                p = this.options;
                p.pointRange = D(p.pointRange, p.colsize || 1);
                this.yAxis.axisPointRange = p.rowsize || 1
            },
            translate: function () {
                var r = this.options, l = this.xAxis, q = this.yAxis, t = function (l,
                                                                                    p, q) {
                    return Math.min(Math.max(p, l), q)
                };
                this.generatePoints();
                p(this.points, function (p) {
                    var x = (r.colsize || 1) / 2, y = (r.rowsize || 1) / 2, B = t(Math.round(l.len - l.translate(p.x - x, 0, 1, 0, 1)), 0, l.len), x = t(Math.round(l.len - l.translate(p.x + x, 0, 1, 0, 1)), 0, l.len), D = t(Math.round(q.translate(p.y - y, 0, 1, 0, 1)), 0, q.len), y = t(Math.round(q.translate(p.y + y, 0, 1, 0, 1)), 0, q.len);
                    p.plotX = p.clientX = (B + x) / 2;
                    p.plotY = (D + y) / 2;
                    p.shapeType = "rect";
                    p.shapeArgs = {
                        x: Math.min(B, x),
                        y: Math.min(D, y),
                        width: Math.abs(x - B),
                        height: Math.abs(y - D)
                    }
                });
                this.translateColors();
                this.chart.hasRendered && p(this.points, function (l) {
                    l.shapeArgs.fill = l.options.color || l.color
                })
            },
            drawPoints: F.column.prototype.drawPoints,
            animate: I,
            getBox: I,
            drawLegendSymbol: ea.drawRectangle,
            getExtremes: function () {
                R.prototype.getExtremes.call(this, this.valueData);
                this.valueMin = this.dataMin;
                this.valueMax = this.dataMax;
                R.prototype.getExtremes.call(this)
            }
        }))
});
