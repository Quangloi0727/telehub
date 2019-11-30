! function() {
    "use strict";

    function e() {}

    function t(e) {
        return e
    }

    function n(e) {
        return !!e
    }

    function i(e) {
        return !e
    }

    function o(e) {
        return function() {
            if (null === e) throw new Error("Callback was already called.");
            e.apply(this, arguments), e = null
        }
    }

    function a(e) {
        return function() {
            null !== e && (e.apply(this, arguments), e = null)
        }
    }

    function r(e) {
        return L(e) || "number" == typeof e.length && e.length >= 0 && e.length % 1 === 0
    }

    function c(e, t) {
        for (var n = -1, i = e.length; ++n < i;) t(e[n], n, e)
    }

    function l(e, t) {
        for (var n = -1, i = e.length, o = Array(i); ++n < i;) o[n] = t(e[n], n, e);
        return o
    }

    function u(e) {
        return l(Array(e), function(e, t) {
            return t
        })
    }

    function s(e, t, n) {
        return c(e, function(e, i, o) {
            n = t(n, e, i, o)
        }), n
    }

    function f(e, t) {
        c(q(e), function(n) {
            t(e[n], n)
        })
    }

    function d(e, t) {
        for (var n = 0; n < e.length; n++)
            if (e[n] === t) return n;
        return -1
    }

    function p(e) {
        var t, n, i = -1;
        return r(e) ? (t = e.length, function() {
            return i++, t > i ? i : null
        }) : (n = q(e), t = n.length, function() {
            return i++, t > i ? n[i] : null
        })
    }

    function h(e, t) {
        return t = null == t ? e.length - 1 : +t,
            function() {
                for (var n = Math.max(arguments.length - t, 0), i = Array(n), o = 0; n > o; o++) i[o] = arguments[o + t];
                switch (t) {
                    case 0:
                        return e.call(this, i);
                    case 1:
                        return e.call(this, arguments[0], i)
                }
            }
    }

    function m(e) {
        return function(t, n, i) {
            return e(t, i)
        }
    }

    function g(t) {
        return function(n, i, r) {
            r = a(r || e), n = n || [];
            var c = p(n);
            if (0 >= t) return r(null);
            var l = !1,
                u = 0,
                s = !1;
            ! function f() {
                if (l && 0 >= u) return r(null);
                for (; t > u && !s;) {
                    var e = c();
                    if (null === e) return l = !0, void(0 >= u && r(null));
                    u += 1, i(n[e], e, o(function(e) {
                        u -= 1, e ? (r(e), s = !0) : f()
                    }))
                }
            }()
        }
    }

    function v(e) {
        return function(t, n, i) {
            return e(D.eachOf, t, n, i)
        }
    }

    function y(e) {
        return function(t, n, i, o) {
            return e(g(n), t, i, o)
        }
    }

    function b(e) {
        return function(t, n, i) {
            return e(D.eachOfSeries, t, n, i)
        }
    }

    function k(t, n, i, o) {
        o = a(o || e), n = n || [];
        var c = r(n) ? [] : {};
        t(n, function(e, t, n) {
            i(e, function(e, i) {
                c[t] = i, n(e)
            })
        }, function(e) {
            o(e, c)
        })
    }

    function w(e, t, n, i) {
        var o = [];
        e(t, function(e, t, i) {
            n(e, function(n) {
                n && o.push({
                    index: t,
                    value: e
                }), i()
            })
        }, function() {
            i(l(o.sort(function(e, t) {
                return e.index - t.index
            }), function(e) {
                return e.value
            }))
        })
    }

    function $(e, t, n, i) {
        w(e, t, function(e, t) {
            n(e, function(e) {
                t(!e)
            })
        }, i)
    }

    function x(e, t, n) {
        return function(i, o, a, r) {
            function c() {
                r && r(n(!1, void 0))
            }

            function l(e, i, o) {
                return r ? void a(e, function(i) {
                    r && t(i) && (r(n(!0, e)), r = a = !1), o()
                }) : o()
            }
            arguments.length > 3 ? e(i, o, l, c) : (r = a, a = o, e(i, l, c))
        }
    }

    function O(e, t) {
        return t
    }

    function T(t, n, i) {
        i = i || e;
        var o = r(n) ? [] : {};
        t(n, function(e, t, n) {
            e(h(function(e, i) {
                i.length <= 1 && (i = i[0]), o[t] = i, n(e)
            }))
        }, function(e) {
            i(e, o)
        })
    }

    function _(e, t, n, i) {
        var o = [];
        e(t, function(e, t, i) {
            n(e, function(e, t) {
                o = o.concat(t || []), i(e)
            })
        }, function(e) {
            i(e, o)
        })
    }

    function A(t, n, i) {
        function a(t, n, i, o) {
            if (null != o && "function" != typeof o) throw new Error("task callback must be a function");
            return t.started = !0, L(n) || (n = [n]), 0 === n.length && t.idle() ? D.setImmediate(function() {
                t.drain()
            }) : (c(n, function(n) {
                var a = {
                    data: n,
                    callback: o || e
                };
                i ? t.tasks.unshift(a) : t.tasks.push(a), t.tasks.length === t.concurrency && t.saturated()
            }), void D.setImmediate(t.process))
        }

        function r(e, t) {
            return function() {
                u -= 1;
                var n = !1,
                    i = arguments;
                c(t, function(e) {
                    c(s, function(t, i) {
                        t !== e || n || (s.splice(i, 1), n = !0)
                    }), e.callback.apply(e, i)
                }), e.tasks.length + u === 0 && e.drain(), e.process()
            }
        }
        if (null == n) n = 1;
        else if (0 === n) throw new Error("Concurrency must not be zero");
        var u = 0,
            s = [],
            f = {
                tasks: [],
                concurrency: n,
                payload: i,
                saturated: e,
                empty: e,
                drain: e,
                started: !1,
                paused: !1,
                push: function(e, t) {
                    a(f, e, !1, t)
                },
                kill: function() {
                    f.drain = e, f.tasks = []
                },
                unshift: function(e, t) {
                    a(f, e, !0, t)
                },
                process: function() {
                    for (; !f.paused && u < f.concurrency && f.tasks.length;) {
                        var e = f.payload ? f.tasks.splice(0, f.payload) : f.tasks.splice(0, f.tasks.length),
                            n = l(e, function(e) {
                                return e.data
                            });
                        0 === f.tasks.length && f.empty(), u += 1, s.push(e[0]);
                        var i = o(r(f, e));
                        t(n, i)
                    }
                },
                length: function() {
                    return f.tasks.length
                },
                running: function() {
                    return u
                },
                workersList: function() {
                    return s
                },
                idle: function() {
                    return f.tasks.length + u === 0
                },
                pause: function() {
                    f.paused = !0
                },
                resume: function() {
                    if (f.paused !== !1) {
                        f.paused = !1;
                        for (var e = Math.min(f.concurrency, f.tasks.length), t = 1; e >= t; t++) D.setImmediate(f.process)
                    }
                }
            };
        return f
    }

    function C(e) {
        return h(function(t, n) {
            t.apply(null, n.concat([h(function(t, n) {
                "object" == typeof console && (t ? console.error && console.error(t) : console[e] && c(n, function(t) {
                    console[e](t)
                }))
            })]))
        })
    }

    function N(e) {
        return function(t, n, i) {
            e(u(t), n, i)
        }
    }

    function S(e) {
        return h(function(t, n) {
            var i = h(function(n) {
                var i = this,
                    o = n.pop();
                return e(t, function(e, t, o) {
                    e.apply(i, n.concat([o]))
                }, o)
            });
            return n.length ? i.apply(this, n) : i
        })
    }

    function j(e) {
        return h(function(t) {
            var n = t.pop();
            t.push(function() {
                var e = arguments;
                i ? D.setImmediate(function() {
                    n.apply(null, e)
                }) : n.apply(null, e)
            });
            var i = !0;
            e.apply(this, t), i = !1
        })
    }
    var I, D = {},
        E = "object" == typeof self && self.self === self && self || "object" == typeof global && global.global === global && global || this;
    null != E && (I = E.async), D.noConflict = function() {
        return E.async = I, D
    };
    var F = Object.prototype.toString,
        L = Array.isArray || function(e) {
            return "[object Array]" === F.call(e)
        },
        M = function(e) {
            var t = typeof e;
            return "function" === t || "object" === t && !!e
        },
        q = Object.keys || function(e) {
            var t = [];
            for (var n in e) e.hasOwnProperty(n) && t.push(n);
            return t
        },
        z = "function" == typeof setImmediate && setImmediate,
        V = z ? function(e) {
            z(e)
        } : function(e) {
            setTimeout(e, 0)
        };
    "object" == typeof process && "function" == typeof process.nextTick ? D.nextTick = process.nextTick : D.nextTick = V, D.setImmediate = z ? V : D.nextTick, D.forEach = D.each = function(e, t, n) {
        return D.eachOf(e, m(t), n)
    }, D.forEachSeries = D.eachSeries = function(e, t, n) {
        return D.eachOfSeries(e, m(t), n)
    }, D.forEachLimit = D.eachLimit = function(e, t, n, i) {
        return g(t)(e, m(n), i)
    }, D.forEachOf = D.eachOf = function(t, n, i) {
        function r(e) {
            u--, e ? i(e) : null === c && 0 >= u && i(null)
        }
        i = a(i || e), t = t || [];
        for (var c, l = p(t), u = 0; null != (c = l());) u += 1, n(t[c], c, o(r));
        0 === u && i(null)
    }, D.forEachOfSeries = D.eachOfSeries = function(t, n, i) {
        function r() {
            var e = !0;
            return null === l ? i(null) : (n(t[l], l, o(function(t) {
                if (t) i(t);
                else {
                    if (l = c(), null === l) return i(null);
                    e ? D.setImmediate(r) : r()
                }
            })), void(e = !1))
        }
        i = a(i || e), t = t || [];
        var c = p(t),
            l = c();
        r()
    }, D.forEachOfLimit = D.eachOfLimit = function(e, t, n, i) {
        g(t)(e, n, i)
    }, D.map = v(k), D.mapSeries = b(k), D.mapLimit = y(k), D.inject = D.foldl = D.reduce = function(e, t, n, i) {
        D.eachOfSeries(e, function(e, i, o) {
            n(t, e, function(e, n) {
                t = n, o(e)
            })
        }, function(e) {
            i(e, t)
        })
    }, D.foldr = D.reduceRight = function(e, n, i, o) {
        var a = l(e, t).reverse();
        D.reduce(a, n, i, o)
    }, D.transform = function(e, t, n, i) {
        3 === arguments.length && (i = n, n = t, t = L(e) ? [] : {}), D.eachOf(e, function(e, i, o) {
            n(t, e, i, o)
        }, function(e) {
            i(e, t)
        })
    }, D.select = D.filter = v(w), D.selectLimit = D.filterLimit = y(w), D.selectSeries = D.filterSeries = b(w), D.reject = v($), D.rejectLimit = y($), D.rejectSeries = b($), D.any = D.some = x(D.eachOf, n, t), D.someLimit = x(D.eachOfLimit, n, t), D.all = D.every = x(D.eachOf, i, i), D.everyLimit = x(D.eachOfLimit, i, i), D.detect = x(D.eachOf, t, O), D.detectSeries = x(D.eachOfSeries, t, O), D.detectLimit = x(D.eachOfLimit, t, O), D.sortBy = function(e, t, n) {
        function i(e, t) {
            var n = e.criteria,
                i = t.criteria;
            return i > n ? -1 : n > i ? 1 : 0
        }
        D.map(e, function(e, n) {
            t(e, function(t, i) {
                t ? n(t) : n(null, {
                    value: e,
                    criteria: i
                })
            })
        }, function(e, t) {
            return e ? n(e) : void n(null, l(t.sort(i), function(e) {
                return e.value
            }))
        })
    }, D.auto = function(t, n, i) {
        function o(e) {
            v.unshift(e)
        }

        function r(e) {
            var t = d(v, e);
            t >= 0 && v.splice(t, 1)
        }

        function l() {
            p--, c(v.slice(0), function(e) {
                e()
            })
        }
        i || (i = n, n = null), i = a(i || e);
        var u = q(t),
            p = u.length;
        if (!p) return i(null);
        n || (n = p);
        var m = {},
            g = 0,
            v = [];
        o(function() {
            p || i(null, m)
        }), c(u, function(e) {
            function a() {
                return n > g && s(y, function(e, t) {
                    return e && m.hasOwnProperty(t)
                }, !0) && !m.hasOwnProperty(e)
            }

            function c() {
                a() && (g++, r(c), p[p.length - 1](v, m))
            }
            for (var u, p = L(t[e]) ? t[e] : [t[e]], v = h(function(t, n) {
                    if (g--, n.length <= 1 && (n = n[0]), t) {
                        var o = {};
                        f(m, function(e, t) {
                            o[t] = e
                        }), o[e] = n, i(t, o)
                    } else m[e] = n, D.setImmediate(l)
                }), y = p.slice(0, p.length - 1), b = y.length; b--;) {
                if (!(u = t[y[b]])) throw new Error("Has inexistant dependency");
                if (L(u) && d(u, e) >= 0) throw new Error("Has cyclic dependencies")
            }
            a() ? (g++, p[p.length - 1](v, m)) : o(c)
        })
    }, D.retry = function(e, t, n) {
        function i(e, t) {
            if ("number" == typeof t) e.times = parseInt(t, 10) || a;
            else {
                if ("object" != typeof t) throw new Error("Unsupported argument type for 'times': " + typeof t);
                e.times = parseInt(t.times, 10) || a, e.interval = parseInt(t.interval, 10) || r
            }
        }

        function o(e, t) {
            function n(e, n) {
                return function(i) {
                    e(function(e, t) {
                        i(!e || n, {
                            err: e,
                            result: t
                        })
                    }, t)
                }
            }

            function i(e) {
                return function(t) {
                    setTimeout(function() {
                        t(null)
                    }, e)
                }
            }
            for (; l.times;) {
                var o = !(l.times -= 1);
                c.push(n(l.task, o)), !o && l.interval > 0 && c.push(i(l.interval))
            }
            D.series(c, function(t, n) {
                n = n[n.length - 1], (e || l.callback)(n.err, n.result)
            })
        }
        var a = 5,
            r = 0,
            c = [],
            l = {
                times: a,
                interval: r
            },
            u = arguments.length;
        if (1 > u || u > 3) throw new Error("Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)");
        return 2 >= u && "function" == typeof e && (n = t, t = e), "function" != typeof e && i(l, e), l.callback = n, l.task = t, l.callback ? o() : o
    }, D.waterfall = function(t, n) {
        function i(e) {
            return h(function(t, o) {
                if (t) n.apply(null, [t].concat(o));
                else {
                    var a = e.next();
                    a ? o.push(i(a)) : o.push(n), j(e).apply(null, o)
                }
            })
        }
        if (n = a(n || e), !L(t)) {
            var o = new Error("First argument to waterfall must be an array of functions");
            return n(o)
        }
        return t.length ? void i(D.iterator(t))() : n()
    }, D.parallel = function(e, t) {
        T(D.eachOf, e, t)
    }, D.parallelLimit = function(e, t, n) {
        T(g(t), e, n)
    }, D.series = function(e, t) {
        T(D.eachOfSeries, e, t)
    }, D.iterator = function(e) {
        function t(n) {
            function i() {
                return e.length && e[n].apply(null, arguments), i.next()
            }
            return i.next = function() {
                return n < e.length - 1 ? t(n + 1) : null
            }, i
        }
        return t(0)
    }, D.apply = h(function(e, t) {
        return h(function(n) {
            return e.apply(null, t.concat(n))
        })
    }), D.concat = v(_), D.concatSeries = b(_), D.whilst = function(t, n, i) {
        if (i = i || e, t()) {
            var o = h(function(e, a) {
                e ? i(e) : t.apply(this, a) ? n(o) : i(null)
            });
            n(o)
        } else i(null)
    }, D.doWhilst = function(e, t, n) {
        var i = 0;
        return D.whilst(function() {
            return ++i <= 1 || t.apply(this, arguments)
        }, e, n)
    }, D.until = function(e, t, n) {
        return D.whilst(function() {
            return !e.apply(this, arguments)
        }, t, n)
    }, D.doUntil = function(e, t, n) {
        return D.doWhilst(e, function() {
            return !t.apply(this, arguments)
        }, n)
    }, D.during = function(t, n, i) {
        i = i || e;
        var o = h(function(e, n) {
                e ? i(e) : (n.push(a), t.apply(this, n))
            }),
            a = function(e, t) {
                e ? i(e) : t ? n(o) : i(null)
            };
        t(a)
    }, D.doDuring = function(e, t, n) {
        var i = 0;
        D.during(function(e) {
            i++ < 1 ? e(null, !0) : t.apply(this, arguments)
        }, e, n)
    }, D.queue = function(e, t) {
        var n = A(function(t, n) {
            e(t[0], n)
        }, t, 1);
        return n
    }, D.priorityQueue = function(t, n) {
        function i(e, t) {
            return e.priority - t.priority
        }

        function o(e, t, n) {
            for (var i = -1, o = e.length - 1; o > i;) {
                var a = i + (o - i + 1 >>> 1);
                n(t, e[a]) >= 0 ? i = a : o = a - 1
            }
            return i
        }

        function a(t, n, a, r) {
            if (null != r && "function" != typeof r) throw new Error("task callback must be a function");
            return t.started = !0, L(n) || (n = [n]), 0 === n.length ? D.setImmediate(function() {
                t.drain()
            }) : void c(n, function(n) {
                var c = {
                    data: n,
                    priority: a,
                    callback: "function" == typeof r ? r : e
                };
                t.tasks.splice(o(t.tasks, c, i) + 1, 0, c), t.tasks.length === t.concurrency && t.saturated(), D.setImmediate(t.process)
            })
        }
        var r = D.queue(t, n);
        return r.push = function(e, t, n) {
            a(r, e, t, n)
        }, delete r.unshift, r
    }, D.cargo = function(e, t) {
        return A(e, 1, t)
    }, D.log = C("log"), D.dir = C("dir"), D.memoize = function(e, n) {
        var i = {},
            o = {};
        n = n || t;
        var a = h(function(t) {
            var a = t.pop(),
                r = n.apply(null, t);
            r in i ? D.setImmediate(function() {
                a.apply(null, i[r])
            }) : r in o ? o[r].push(a) : (o[r] = [a], e.apply(null, t.concat([h(function(e) {
                i[r] = e;
                var t = o[r];
                delete o[r];
                for (var n = 0, a = t.length; a > n; n++) t[n].apply(null, e)
            })])))
        });
        return a.memo = i, a.unmemoized = e, a
    }, D.unmemoize = function(e) {
        return function() {
            return (e.unmemoized || e).apply(null, arguments)
        }
    }, D.times = N(D.map), D.timesSeries = N(D.mapSeries), D.timesLimit = function(e, t, n, i) {
        return D.mapLimit(u(e), t, n, i)
    }, D.seq = function() {
        var t = arguments;
        return h(function(n) {
            var i = this,
                o = n[n.length - 1];
            "function" == typeof o ? n.pop() : o = e, D.reduce(t, n, function(e, t, n) {
                t.apply(i, e.concat([h(function(e, t) {
                    n(e, t)
                })]))
            }, function(e, t) {
                o.apply(i, [e].concat(t))
            })
        })
    }, D.compose = function() {
        return D.seq.apply(null, Array.prototype.reverse.call(arguments))
    }, D.applyEach = S(D.eachOf), D.applyEachSeries = S(D.eachOfSeries), D.forever = function(t, n) {
        function i(e) {
            return e ? a(e) : void r(i)
        }
        var a = o(n || e),
            r = j(t);
        i()
    }, D.ensureAsync = j, D.constant = h(function(e) {
        var t = [null].concat(e);
        return function(e) {
            return e.apply(this, t)
        }
    }), D.wrapSync = D.asyncify = function(e) {
        return h(function(t) {
            var n, i = t.pop();
            try {
                n = e.apply(this, t)
            } catch (o) {
                return i(o)
            }
            M(n) && "function" == typeof n.then ? n.then(function(e) {
                i(null, e)
            })["catch"](function(e) {
                i(e.message ? e : new Error(e))
            }) : i(null, n)
        })
    }, "object" == typeof module && module.exports ? module.exports = D : "function" == typeof define && define.amd ? define([], function() {
        return D
    }) : E.async = D
}(),
function(e) {
    "function" == typeof define && define.amd ? define(["jquery"], e) : "object" == typeof exports ? module.exports = e(require("jquery")) : e(jQuery)
}(function(e) {
    function t(e) {
        return c.raw ? e : encodeURIComponent(e)
    }

    function n(e) {
        return c.raw ? e : decodeURIComponent(e)
    }

    function i(e) {
        return t(c.json ? JSON.stringify(e) : String(e))
    }

    function o(e) {
        0 === e.indexOf('"') && (e = e.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
        try {
            return e = decodeURIComponent(e.replace(r, " ")), c.json ? JSON.parse(e) : e
        } catch (t) {}
    }

    function a(t, n) {
        var i = c.raw ? t : o(t);
        return e.isFunction(n) ? n(i) : i
    }
    var r = /\+/g,
        c = e.cookie = function(o, r, l) {
            if (arguments.length > 1 && !e.isFunction(r)) {
                if (l = e.extend({}, c.defaults, l), "number" == typeof l.expires) {
                    var u = l.expires,
                        s = l.expires = new Date;
                    s.setMilliseconds(s.getMilliseconds() + 864e5 * u)
                }
                return document.cookie = [t(o), "=", i(r), l.expires ? "; expires=" + l.expires.toUTCString() : "", l.path ? "; path=" + l.path : "", l.domain ? "; domain=" + l.domain : "", l.secure ? "; secure" : ""].join("")
            }
            for (var f = o ? void 0 : {}, d = document.cookie ? document.cookie.split("; ") : [], p = 0, h = d.length; h > p; p++) {
                var m = d[p].split("="),
                    g = n(m.shift()),
                    v = m.join("=");
                if (o === g) {
                    f = a(v, r);
                    break
                }
                o || void 0 === (v = a(v)) || (f[g] = v)
            }
            return f
        };
    c.defaults = {}, e.removeCookie = function(t, n) {
        return e.cookie(t, "", e.extend({}, n, {
            expires: -1
        })), !e.cookie(t)
    }
}), (window.onpopstate = function() {
    var e, t = /\+/g,
        n = /([^&=]+)=?([^&]*)/g,
        i = function(e) {
            return decodeURIComponent(e.replace(t, " "))
        },
        o = window.location.search.substring(1);
    for (window.location.obj = {}; e = n.exec(o);) window.location.obj[i(e[1])] = i(e[2])
})(),
function() {
    var e = localStorage.getItem("ma-layout-status");
    1 == e && ($("body").addClass("sw-toggled"), $("#tw-switch").prop("checked", !0)), $("body").on("change", "#toggle-width input:checkbox", function() {
        $(this).is(":checked") ? setTimeout(function() {
            $("body").addClass("toggled sw-toggled"), localStorage.setItem("ma-layout-status", 1)
        }, 250) : setTimeout(function() {
            $("body").removeClass("toggled sw-toggled"), localStorage.setItem("ma-layout-status", 0), $(".main-menu > li").removeClass("animated")
        }, 250)
    })
}(), /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && $("html").addClass("ismobile"), $(document).ready(function() {
		
        function e(e, t, n) {
            $(e).niceScroll({
                cursorcolor: t,
                cursorborder: 0,
                cursorborderradius: 0,
                cursorwidth: n,
                bouncescroll: !0,
                mousescrollstep: 100
            })
        }

        function t() {
            setTimeout(function() {
                $("input:checkbox.check-list:checked").length > 0 ? $(".btn-delete-all").show() : $(".btn-delete-all").hide()
            }, 100)
        }

        function n(e, t) {
            $.growl({
                message: e
            }, {
                type: t,
                allow_dismiss: !1,
                label: "Bỏ qua",
                className: "btn-xs btn-inverse",
                placement: {
                    from: "top",
                    align: "right"
                },
                delay: 2500,
                animate: {
                    enter: "animated bounceIn",
                    exit: "animated bounceOut"
                },
                offset: {
                    x: 20,
                    y: 85
                }
            })
        }
        if (function() {
                $("body").on("click", "#top-search > a", function(e) {
                    e.preventDefault(), $("#header").addClass("search-toggled"), $("#top-search-wrap input").focus()
                }), $("body").on("click", "#top-search-close", function(e) {
                    e.preventDefault(), $("#header").removeClass("search-toggled")
                })
            }(), function() {
                $("body").on("click", "#menu-trigger", function(e) {
                    e.preventDefault();
                    var t = $(this).data("trigger");
                    $(t).toggleClass("toggled"), $(this).toggleClass("open"), $("body").toggleClass("modal-open"), $("#tab-crm > #main > .container.stoggled").removeClass("stoggled"), $(".sub-menu.toggled").not(".active").each(function() {
                        $(this).removeClass("toggled"), $(this).find("ul").hide()
                    }), $(".profile-menu .main-menu").hide(), "#sidebar" == t && ($elem = "#sidebar", $elem2 = "#menu-trigger", $("#chat-trigger").removeClass("open"), $("#chat").hasClass("toggled") ? $("#chat").removeClass("toggled") : $("#header").toggleClass("sidebar-toggled")), $("aside#sidebar").getNiceScroll().resize(), $("#header").hasClass("sidebar-toggled") && $(document).on("click", function(e) {
                        0 === $(e.target).closest($elem).length && 0 === $(e.target).closest($elem2).length && setTimeout(function() {
                            $("body").removeClass("modal-open"), $($elem).removeClass("toggled"), $("#header").removeClass("sidebar-toggled"), $($elem2).removeClass("open")
                        })
                    })
                }), $("body").on("click", ".sub-menu > a", function(e) {
                    e.preventDefault(), $(this).next().slideToggle(200), $(this).parent().toggleClass("toggled")
                })
            }(), $("body").on("click", '[data-clear="notification"]', function(e) {
                e.preventDefault();
                var t = $(this).closest(".listview"),
                    n = t.find(".lv-item"),
                    i = n.size();
                $(this).parent().fadeOut(), t.find(".list-group").prepend('<i class="grid-loading hide-it"></i>'), t.find(".grid-loading").fadeIn(1500);
                var o = 0;
                n.each(function() {
                    var e = $(this);
                    setTimeout(function() {
                        e.addClass("animated fadeOutRightBig").delay(1e3).queue(function() {
                            e.remove()
                        })
                    }, o += 150)
                }), setTimeout(function() {
                    $("#notifications").addClass("empty")
                }, 150 * i + 200)
            }), $(".dropdown")[0] && ($("body").on("click", ".dropdown.open .dropdown-menu", function(e) {
                e.stopPropagation()
            }), $(".dropdown").on("shown.bs.dropdown", function(e) {
                $(this).attr("data-animation") && ($animArray = [], $animation = $(this).data("animation"), $animArray = $animation.split(","), $animationIn = "animated " + $animArray[0], $animationOut = "animated " + $animArray[1], $animationDuration = "", $animArray[2] ? $animationDuration = $animArray[2] : $animationDuration = 500, $(this).find(".dropdown-menu").removeClass($animationOut), $(this).find(".dropdown-menu").addClass($animationIn))
            }), $(".dropdown").on("hide.bs.dropdown", function(e) {
                $(this).attr("data-animation") && (e.preventDefault(), $this = $(this), $dropdownMenu = $this.find(".dropdown-menu"), $dropdownMenu.addClass($animationOut), setTimeout(function() {
                    $this.removeClass("open")
                }, $animationDuration))
            })), $(".form-selectpicker")[0] && $(".form-selectpicker").selectpicker(), $(".selectpicker")[0] && $(".selectpicker").on("loaded.bs.select,refreshed.bs.select", function(e) {
                var t = $("#" + e.currentTarget.id).next("div").find("li:first-child");
                if (t) {
                    var n = t.find("span:first-child");
                    n && "---- Tất cả ----" == n.text() && (t.find(".glyphicon").remove(), t.find("a").addClass("text-center"))
                }
            }), $("#calendar-widget")[0] && ! function() {
                $("#calendar-widget").fullCalendar({
                    contentHeight: "auto",
                    theme: !0,
                    header: {
                        right: "",
                        center: "prev, title, next",
                        left: ""
                    },
                    defaultDate: "2014-06-12",
                    editable: !0,
                    events: [{
                        title: "All Day",
                        start: "2014-06-01",
                        className: "bgm-cyan"
                    }, {
                        title: "Long Event",
                        start: "2014-06-07",
                        end: "2014-06-10",
                        className: "bgm-orange"
                    }, {
                        id: 999,
                        title: "Repeat",
                        start: "2014-06-09",
                        className: "bgm-lightgreen"
                    }, {
                        id: 999,
                        title: "Repeat",
                        start: "2014-06-16",
                        className: "bgm-lightblue"
                    }, {
                        title: "Meet",
                        start: "2014-06-12",
                        end: "2014-06-12",
                        className: "bgm-green"
                    }, {
                        title: "Lunch",
                        start: "2014-06-12",
                        className: "bgm-cyan"
                    }, {
                        title: "Birthday",
                        start: "2014-06-13",
                        className: "bgm-amber"
                    }, {
                        title: "Google",
                        url: "http://google.com/",
                        start: "2014-06-28",
                        className: "bgm-amber"
                    }]
                })
            }(), $("#todo-lists")[0] && ($("body").on("click", "#add-tl-item .add-new-item", function() {
                $(this).parent().addClass("toggled")
            }), $("body").on("click", ".add-tl-actions > a", function(e) {
                e.preventDefault();
                var t = $(this).closest("#add-tl-item"),
                    n = $(this).data("tl-action");
                "dismiss" == n && (t.find("textarea").val(""), t.removeClass("toggled")), "save" == n && (t.find("textarea").val(""), t.removeClass("toggled"))
            })), $(".auto-size")[0] && autosize($(".auto-size")), $("html").hasClass("ismobile") || (!$(".login-content")[0], $(".table-responsive")[0] && e(".table-responsive", "rgba(0,0,0,0.5)", "5px"), $(".chosen-results")[0] && e(".chosen-results", "rgba(0,0,0,0.5)", "5px"), $(".tab-nav")[0] && e(".tab-nav", "rgba(0,0,0,0)", "1px"), $(".dropdown-menu .c-overflow")[0] && e(".dropdown-menu .c-overflow", "rgba(0,0,0,0.5)", "0px"), $(".c-overflow")[0] && e(".c-overflow", "rgba(0,0,0,0.5)", "5px")), $("body").on("click", ".profile-menu > a", function(e) {
                e.preventDefault(), $(this).parent().toggleClass("toggled"), $(this).next().slideToggle(200)
            }), $(".fg-line")[0] && ($("body").on("focus", ".form-control", function() {
                $(this).closest(".fg-line").addClass("fg-toggled")
            }), $("body").on("blur", ".form-control", function() {
                var e = $(this).closest(".form-group"),
                    t = e.find(".form-control").val();
                e.hasClass("fg-float") ? 0 == t.length && $(this).closest(".fg-line").removeClass("fg-toggled") : $(this).closest(".fg-line").removeClass("fg-toggled")
            })), $(".fg-float")[0] && $(".fg-float .form-control").each(function() {
                var e = $(this).val();
                0 == !e.length && $(this).closest(".fg-line").addClass("fg-toggled")
            }), $("audio, video")[0] && $("video,audio").mediaelementplayer(), $(".tag-select")[0] && $(".tag-select").chosen({
                width: "100%",
                allow_single_deselect: !0
            }), $("input-mask")[0] && $(".input-mask").mask(), $(".color-picker")[0] && $(".color-picker").each(function() {
                $(".color-picker").each(function() {
                    var e = $(this).closest(".cp-container").find(".cp-value");
                    $(this).farbtastic(e)
                })
            }), $(".html-editor")[0] && $(".html-editor").summernote({
                height: 150
            }), $(".html-editor-click")[0] && ($("body").on("click", ".hec-button", function() {
                $(".html-editor-click").summernote({
                    focus: !0
                }), $(".hec-save").show()
            }), $("body").on("click", ".hec-save", function() {
                $(".html-editor-click").code(), $(".html-editor-click").destroy(), $(".hec-save").hide(), n("Content Saved Successfully!", "success")
            })), $(".html-editor-airmod")[0] && $(".html-editor-airmod").summernote({
                airMode: !0
            }), $(".date-time-picker")[0] && $(".date-time-picker").datetimepicker(), $(".time-picker")[0] && $(".time-picker").datetimepicker({
                format: "LT"
            }), $(".date-picker")[0] && $(".date-picker").datetimepicker({
                format: "DD/MM/YYYY",
                locale: "vi",
                icons: {
                    time: "fa fa-clock-o",
                    date: "fa fa-calendar",
                    up: "fa fa-arrow-up",
                    down: "fa fa-arrow-down"
                }
            }), $(".form-wizard-basic")[0] && $(".form-wizard-basic").bootstrapWizard({
                tabClass: "fw-nav",
                nextSelector: ".next",
                previousSelector: ".previous"
            }), $("input:checkbox")[0] && $("input:checkbox").each(function(e, t) {
                var n = $(t).next().next("span");
                n[0] && n.attr("data-text-on") && n.attr("data-text-off") && (n.text($(t).is(":checked") ? n.attr("data-text-off") : n.attr("data-text-on")), $(t).bind("change", function() {
                    n.text(_["switch"](n.text(), [n.attr("data-text-on"), n.attr("data-text-off")], [n.attr("data-text-off"), n.attr("data-text-on")]))
                }))
            }), $(".btn-delete-all")[0] && $(".btn-delete-all").hide(), $("input:checkbox#check-all")[0] && $("input:checkbox#check-all").on("change", function() {
                var e = $(this).is(":checked");
                $(this).closest("table").find("input:checkbox.check-list").prop("checked", e), setTimeout(function() {
                    t()
                }, 100)
            }), $("input:checkbox.check-list")[0] && $("input:checkbox.check-list").on("change", function() {
                return 0 == $("input:checkbox.check-list:checked").length ? ($("input:checkbox#check-all").prop("checked", !1), $(".btn-delete-all").hide(), !1) : ($("input:checkbox.check-list").length == $("input:checkbox.check-list:checked").length && $("input:checkbox#check-all").prop("checked", !0), void t())
            }), function() {
                Waves.attach(".btn:not(.btn-icon):not(.btn-float)"), Waves.attach(".btn-icon, .btn-float", ["waves-circle", "waves-float"]), Waves.init()
            }(), $(".lightbox")[0] && $(".lightbox").lightGallery({
                enableTouch: !0
            }), $("body").on("click", ".a-prevent", function(e) {
                e.preventDefault()
            }), $(".collapse")[0] && ($(".collapse").on("show.bs.collapse", function(e) {
                $(this).closest(".panel").find(".panel-heading").addClass("active")
            }), $(".collapse").on("hide.bs.collapse", function(e) {
                $(this).closest(".panel").find(".panel-heading").removeClass("active")
            }), $(".collapse.in").each(function() {
                $(this).closest(".panel").find(".panel-heading").addClass("active")
            })), $('[data-toggle="tooltip"]')[0] && $('[data-toggle="tooltip"]').tooltip({container:'body'}), $('[data-toggle="popover"]')[0] && $('[data-toggle="popover"]').popover(), $(".on-select")[0]) {
            var i = ".lv-avatar-content input:checkbox",
                o = $(".on-select").closest(".lv-actions");
            $("body").on("click", i, function() {
                $(i + ":checked")[0] ? o.addClass("toggled") : o.removeClass("toggled")
            })
        }
        if ($("#ms-menu-trigger")[0] && $("body").on("click", "#ms-menu-trigger", function(e) {
                e.preventDefault(), $(this).toggleClass("open"), $(".ms-menu").toggleClass("toggled")
            }), $(".login-content")[0] && ($("html").addClass("login-content"), $("body").on("click", ".login-navigation > li", function() {
                var e = $(this).data("block"),
                    t = $(this).closest(".lc-block");
                t.removeClass("toggled"), setTimeout(function() {
                    $(e).addClass("toggled")
                })
            })), $('[data-action="fullscreen"]')[0]) {
            var a = $("[data-action='fullscreen']");
            a.on("click", function(e) {
                function t(e) {
                    e.requestFullscreen ? e.requestFullscreen() : e.mozRequestFullScreen ? e.mozRequestFullScreen() : e.webkitRequestFullscreen ? e.webkitRequestFullscreen() : e.msRequestFullscreen && e.msRequestFullscreen()
                }
                e.preventDefault(), t(document.documentElement), a.closest(".dropdown").removeClass("open")
            })
        }
        if ($('[data-action="clear-localstorage"]')[0]) {
            var r = $('[data-action="clear-localstorage"]');
            r.on("click", function(e) {
                e.preventDefault(), swal({
                    title: "Are you sure?",
                    text: "All your saved localStorage values will be removed",
                    type: "warning",
                    showCancelButton: !0,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: !1
                }, function() {
                    localStorage.clear(), swal("Done!", "localStorage is cleared", "success")
                })
            })
        }
        $("[data-pmb-action]")[0] && $("body").on("click", "[data-pmb-action]", function(e) {
            e.preventDefault();
            var t = $(this).data("pmb-action");
            "edit" === t && $(this).closest(".pmb-block").toggleClass("toggled"), "reset" === t && $(this).closest(".pmb-block").removeClass("toggled")
        }), $("html").hasClass("ie9") && $("input, textarea").placeholder({
            customClass: "ie9-placeholder"
        }), $(".lvh-search-trigger")[0] && ($("body").on("click", ".lvh-search-trigger", function(e) {
            e.preventDefault(), x = $(this).closest(".lv-header-alt").find(".lvh-search"), x.fadeIn(300), x.find(".lvhs-input").focus()
        }), $("body").on("click", ".lvh-search-close", function() {
            x.fadeOut(300), setTimeout(function() {
                x.find(".lvhs-input").val("")
            }, 350)
        })), $('[data-action="print"]')[0] && $("body").on("click", '[data-action="print"]', function(e) {
            e.preventDefault(), window.print()
        })
    }), window._config = {}, window._user || {}, window._windowList = {}, window._socket = (_.isEqual(window.page, "customer-info") ? null : io.connect(window.location.origin)) || null, window.newUrl = function(e, t) {
        return (e.indexOf("#") >= 0 ? "" : "#") + e.split("?")[0] + "?" + $.param(t)
    }, window.DFT = {},
    function(e, t, n) {
        var i = e._currentTicket || {},
            o = function(e, t, n) {
                i.hasOwnProperty(e) || (i[e] = {}), i[e].hasOwnProperty(t) || (i[e][t] = ""), i[e][t] = n
            };
        e.getTicketId = function(e, t) {
            return e ? i.hasOwnProperty(e) && i[e].hasOwnProperty(t) ? (console.log(i), i[e][t]) : null : i
        }, e.setTicketId = o, e.getTicketId = getTicketId
    }(window, document), String.prototype.str || (String.prototype.str = function() {
        if (arguments && !(arguments.length < 0)) {
            for (var e = this.toString(), t = 0; t < arguments.length; t++) {
                var n = new RegExp("\\{" + t + "\\}", "gm");
                e = e.replace(n, arguments[t])
            }
            return e
        }
    }),
    function(e) {
        var t = (window.page || null, window.user || null),
            n = !1,
            i = function(t) {
                function n() {
                    setTimeout(function() {
                        e(t + "input:checkbox.check-list:checked").length > 0 ? e(t + ".btn-delete-all").show() : e(t + ".btn-delete-all").hide()
                    }, 100)
                }
                t = t ? t + " " : "", e(t + ".date-time-picker")[0] && e(t + ".date-time-picker").datetimepicker(), e(t + ".time-picker")[0] && e(".time-picker").datetimepicker({
                    format: "LT"
                }), e(t + ".date-picker")[0] && e(t + ".date-picker").datetimepicker({
                    format: "DD/MM/YYYY",
                    locale: "vi",
                    icons: {
                        time: "fa fa-clock-o",
                        date: "fa fa-calendar",
                        up: "fa fa-arrow-up",
                        down: "fa fa-arrow-down"
                    }
                }), e(t + "input:checkbox")[0] && e(t + "input:checkbox").each(function(t, n) {
                    var i = e(n).next().next("span");
                    i[0] && i.attr("data-text-on") && i.attr("data-text-off") && (i.text(e(n).is(":checked") ? i.attr("data-text-off") : i.attr("data-text-on")), e(n).bind("change", function() {
                        i.text(_["switch"](i.text(), [i.attr("data-text-on"), i.attr("data-text-off")], [i.attr("data-text-off"), i.attr("data-text-on")]))
                    }))
                }), e(t + ".btn-delete-all")[0] && e(t + ".btn-delete-all").hide(), e(t + "input:checkbox#check-all")[0] && e(t + "input:checkbox#check-all").on("change", function() {
                    var t = e(this).is(":checked");
                    e(this).closest("table").find("input:checkbox.check-list").prop("checked", t), setTimeout(function() {
                        n()
                    }, 100)
                }), e(t + "input:checkbox.check-list")[0] && e(t + "input:checkbox.check-list").on("change", function() {
                    return 0 == e(t + "input:checkbox.check-list:checked").length ? (e(t + "input:checkbox#check-all").prop("checked", !1), e(t + ".btn-delete-all").hide(), !1) : (e(t + "input:checkbox.check-list").length == e("input:checkbox.check-list:checked").length && e(t + "input:checkbox#check-all").prop("checked", !0), void n())
                }), e(t + ".tag-select")[0] && e(t + ".tag-select").chosen({
                    width: "100%",
                    allow_single_deselect: !0
                }), e(t + ".selectpicker")[0] && (e(t + ".selectpicker").selectpicker(), e(t + ".selectpicker").on("loaded.bs.select,refreshed.bs.select", function(n) {
                    var i = e(n.currentTarget.id ? t + "#" + n.currentTarget.id : n.currentTarget).next("div").find("li:first-child");
                    if (i) {
                        var o = i.find("span:first-child");
                        o && "---- Tất cả ----" == o.text() && (i.find(".glyphicon").remove(), i.find("a").addClass("text-center"))
                    }
                }))
            },
            o = function(t) {
                t = t ? t + " " : "#tab-crm ", e(t + "a").each(function() {
                    var t = e(this),
                        n = t.attr("href");
                    t.attr("data-toggle") || !n || 0 != n.indexOf("/") || _.isEqual(n, "/") || _.isEqual(n, "/logout") || e(this).attr("href", "/#" + n.replace("#", "").substring(1, n.lenght))
                })
            },
            a = function(e) {};
        window.MainContent = Object.create({
            main: e(_.isEqual(window.page, "customer-info") ? "body > #main" : "body > .tab-content > #tab-crm > #main"),
            content: e(_.isEqual(window.page, "customer-info") ? "body > #main" : "body > .tab-content > #tab-crm > #main  > .container"),
			loadTooltip:function ()
			{
				$("#tab-crm .card table.table tbody tr:not(.filter) td:not(:last):not(.inlineEditButton)").each(		function(item, element){
							$(this).attr("title",_.chain($(this).text()).trim().value().replace(/( )+/g, " ").replace(/(\s)+\n(\s)+/g, "\n"));
				});
			},
            setClass: function(e) {
                return this.main.prop("class", e), this
            },
            setHTML: function(t, n) {
                e("link.dynamic").remove(), e("#menu-accordion .in").collapse("hide");
                var a = this;
                a.setClass(_.createID()), a.content.trigger("click"), a.content.fadeOut("fast").html(t).fadeIn("slow"), a.content.children().off().unbind(), o("body > .tab-content > #tab-crm > #main > .container"), i("body > .tab-content > #tab-crm > #main > .container"), e(".page-loader").hide(), e('[data-toggle="tooltip"]').tooltip({container:'body'}), e.getScript("/assets/pages/" + window.page + "/script.js").done(function(e, t) {
                    t && _.isEqual(t, "success") && DFT.init();	
					window.MainContent.loadTooltip();
                })
            },
            prefix: function(e) {
                var t = this;
                return e ? e : _.trimValueNotLower("#main." + t.main.attr("class") + (e ? " " + e : ""))
            },
            reset: function() {
                var n = this;
                if (n.setClass(_.createID()), _.isEqual(window.page, "customer-info")) e(".page-loader").fadeOut(), n.main.fadeIn(), e.getScript("/assets/pages/customer-info/script.js").done(function(e, t) {
                    t && _.isEqual(t, "success") && DFT.init()
                });
                else {
                    try {
                        _socket.on("connect", function() {
							_.isUndefined(t) || _.isNull(t) || console.log({
                                message: 'socket client connected',
                                userId: t,
                                socketId: this.socket.sessionid
                            });
                            _.isUndefined(t) || _.isNull(t) || _socket.emit("client-connect", {
                                _id: t,
                                sid: this.socket.sessionid
                            }), e.getScript("/assets/js/client-socket.js").done(function(e, t) {
                                t && DFTSOCKET.init(_socket)
                            })
                        })
                    } catch (i) {
                        console.log(i)
                    }
                    e.getJSON("/assets/const.json", function(t) {
                        window._config = t, e(".page-loader").fadeOut(o), n.main.fadeIn(), window.location.hash.replace("#", "") ? _.LoadPage(window.location.hash) : _.isUndefined(window.page) || _.isNull(window.page) || e.getScript("/assets/pages/" + window.page + "/script.js").done(function(e, t) {
                            t && _.isEqual(t, "success") && DFT.init()
                        })
                    })
                }
            }
        }), window.mrblack = {
            createID: function() {
                function e() {
                    return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
                }
                return e() + e() + e() + "-" + e() + e() + e() + "-" + e() + e() + e()
            },
            getObj: function(e, t, n) {
                return _.find(e, function(e) {
                    return _.isEqual(e[t], n)
                })
            },
            cObject: function(e) {
                return _.each(e, function(t, n) {
                    t || delete e[n]
                }), e
            },
            cleanString: function(e) {
                return e.toLowerCase().replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a").replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e").replace(/ì|í|ị|ỉ|ĩ/g, "i").replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o").replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u").replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y").replace(/đ/g, "d").replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\'|\&|\#|\[|\]|~/g, "-").replace(/-+-/g, "-")
            },
            Tags: function(e) {
                var t = "";
                return _.each(e, function(e) {
                    if (!_.has(e, "tag") || _.isEmpty(e) || _.isUndefined(e) || _.isNull(e)) return t;
                    var n = _.has(e, "data") ? _.map(e.data, function(e, t) {
                            return "data-" + t + '="' + e + '"'
                        }) : null,
                        i = _.has(e, "attr") ? _.map(e.attr, function(e, t) {
                            return t + "=" + _.quote(e)
                        }) : null,
                        o = _.has(e, "sattr") ? e.sattr.join(" ") : "",
                        a = _.has(e, "tooltip") ? 'data-container="' + (e.tooltip.container || "body") + '" data-placement="' + (e.tooltip.placement || "top") + '" data-original-title="' + (e.tooltip.text || "") + '"' : "";
                    t += "<" + e.tag + " " + a + " " + (_.isNull(i) ? "" : i.join(" ")) + " " + (_.isNull(n) ? "" : n) + o + ">", _.has(e, "childs") && !_.isEmpty(_.compact(e.childs)) && (t += _.Tags(e.childs)), t += (e.content || "") + (_.has(e, "notend") ? "" : "</" + e.tag + ">")
                }), _.clean(t)
            },
            "switch": function(e, t, n) {
                return n[t.indexOf(e)]
            },
            switchCustomer: function(e, t, n) {
                return n[t.indexOf(e)]
            },
            stringRegex: function(e) {
                for (var t = e.toLowerCase().replace(/^(\s*)|(\s*)$/g, "").replace(/\s+/g, " "), n = "àáảãạâầấẩẫậăằắẳẵặa", i = "đd", o = "ùúủũụưừứửữựu", a = "ìíỉĩịi", r = "èéẻẽẹêềếểễệe", c = "òóỏõọôồốổỗộơờớởỡợo", l = "ỳýỷỹỵy", u = "", s = 0; s < t.length; s++) n.indexOf(t[s]) >= 0 ? u = u + "[" + n + "]" : i.indexOf(t[s]) >= 0 ? u = u + "[" + i + "]" : o.indexOf(t[s]) >= 0 ? u = u + "[" + o + "]" : a.indexOf(t[s]) >= 0 ? u = u + "[" + a + "]" : r.indexOf(t[s]) >= 0 ? u = u + "[" + r + "]" : c.indexOf(t[s]) >= 0 ? u = u + "[" + c + "]" : l.indexOf(t[s]) >= 0 ? u = u + "[" + l + "]" : u += t[s];
                return u
            },
            fieldValue: function(e, t, n) {
                if (!_.has(e, t)) return "";
                if (!e[t].length) return "";
                switch (Number(n)) {
                    case 4:
                    case 5:
                        return _.without(e[t][0].value, "0", "", null).join(", ");
                    case 6:
                        return moment(e[t][0].value).format("DD/MM/YYYY");
                    default:
                        return e[t][0].value
                }
            },
            parseOptions: function(e, t) {
                var n = "";
                return _.each(e, function(e, i) {
                    n += '<option value="' + e.val + '" ' + (e.val === t ? "selected" : "") + ">" + e.key + "</option>"
                }), n
            },
            parseOptionArray: function(e, t) {
                var n = "";
                return _.each(e, function(e) {
                    n += '<option value="' + e + '" ' + (e === t ? "selected" : "") + ">" + e + "</option>"
                }), n
            },
            paging: function(e, t) {
                for (var n = "", i = 0; i < t.range.length; i++) n += t.range[i] == t.current ? _.Tags([{
                    tag: "li",
                    attr: {
                        "class": "active"
                    },
                    childs: [{
                        tag: "span",
                        content: t.range[i]
                    }]
                }]) : _.Tags([{
                    tag: "li",
                    attr: {
                        "class": ""
                    },
                    childs: [{
                        tag: "a",
                        attr: {
                            href: e + "?page=" + t.range[i]
                        },
                        content: t.range[i]
                    }]
                }]);
                return _.Tags([{
                    tag: "ul",
                    attr: {
                        "class": "pagination"
                    },
                    content: n
                }])
            },
            LoadPage: function(t) {
                if (!n) {
                    e(".page-loader").show(), window.location.obj = {};
                    for (var i, o = /\+/g, a = /([^&=]+)=?([^&]*)/g, r = function(e) {
                            return decodeURIComponent(e.replace(o, " "))
                        }, c = t.split("?")[1]; i = a.exec(c);) window.location.obj[r(i[1])] = r(i[2]);
                    delete window.location.obj.undefined;

                    //trungdt - issue 884
                    if(_.isUndefined(window.lastUrl)){
                        window.lastUrl = [];
                    };
                    window.lastUrl.push(window.location.hash.replace('#', ''));
                    if(window.lastUrl.length > 3) window.lastUrl.shift();
                    //trungdt - issue 884

                    var l = t.split("?")[0].replace("#", "");
                    if (!l) return e(".page-loader").hide(), n = !1, !1;
                    window.page = t, n = !0, DFT && _.has(DFT, "init") && _.has(DFT, "uncut") && DFT.uncut(), e.ajax({
                        mimeType: "text/html; charset=utf-8",
                        url: t.replace("#", ""),
                        type: "GET",
                        dataType: "html",
                        async: !0,
                        success: function(e) {
                            n = !1, MainContent.setHTML(e);
							//anhnt3 - issue 852
							$("[role='tooltip']").remove();
							//anhnt3 - issue 852
							
							//anhnt3 - load tooltip for ajax
							setTimeout(function(){
								window.MainContent.loadTooltip();
							},1000);
							
							//anhnt3 - load tooltip for ajax
                        },
                        error: function(t, n, i) {
                            console.log(t), e(".page-loader").hide()
                        },
                        done: function(t, i) {
                            n = !1, e(".page-loader").hide()
                        }
                    })
                }
            }
        };
        window._Ajax = function(t, n, i, o) {
            e(".page-loader").show();
            var a = {};
            i && (a = new FormData, e.each(i, function(e, t) {
                var n = _.keys(t)[0];
                a.append(n, t[n])
            })), e.ajax({
                url: t,
                method: n,
                data: a,
                cache: !1,
                contentType: !1,
                processData: !1
            }).done(function(t) {
                e(".page-loader").fadeOut("slow", function() {
                    o && o(t)
                })
            })
        }, window._AjaxData = function(t, n, i, o) {
            e(".page-loader").show(), e.ajax({
                url: t,
                method: n,
                data: i,
                cache: !1,
                contentType: !1,
                processData: !1
            }).done(function(t) {
                e(".page-loader").fadeOut("slow", function() {
                    o && o(t)
                })
            })
        }, window._AjaxObject = function(t, n, i, o) {
            e.ajax({
                url: t,
                method: n,
                data: i,
                cache: !1,
                contentType: !1,
                processData: !1
            }).done(o)
        };
        e.fn.extend({
            toggleAttr: function(t, n, i) {
                return this.each(function() {
                    var o = e(this);
                    o.attr(t) == n ? o.attr(t, i) : o.attr(t, n)
                })
            }
        }), e.fn.toObject = function() {
            var t = {},
                n = function(n, i) {
                    var o = t[i.name];
                    "undefined" != typeof o && null !== o ? e.isArray(o) ? o.push(i.value) : t[i.name] = [o, i.value] : t[i.name] = i.value
                };
            return e.each(this.serializeArray(), n), mrblack.cObject(t)
        }, e.fn.getData = function() {
            var t = e(this),
                n = new FormData;
            return _.each(t.serializeJSON(), function(e, t) {
                if (_.isArray(e))
                    for (var i = 0; i < e.length; i++) n.append(t + "[]", e[i]);
                else _.isObject(e) ? _.each(e, function(e, i) {
                    n.append(t + "[" + i + "]", e)
                }) : n.append(t, e)
            }), e.each(e(t).find('input[type="file"]').not(".no-upload"), function(t, i) {
                e.each(e(i)[0].files, function(e, t) {
                    n.append(i.name, t)
                })
            }), n
        }, e.fn.fastLiveFilter = function(t, n) {
            n = n || {}, t = jQuery(t);
            var i, o = this,
                a = "",
                r = n.timeout || 0,
                c = n.callback || function() {},
                l = t.children("li"),
                u = l.length,
                s = u > 0 ? l[0].style.display : "block";
            return c(u), o.change(function() {
                for (var t, i, a = o.val().toLowerCase(), r = 0, f = 0; u > f; f++) t = l[f], i = n.selector ? e(t).find(n.selector).text() : t.textContent || t.innerText || "", i.toLowerCase().indexOf(a) >= 0 ? ("none" == t.style.display && (t.style.display = s), r++) : "none" != t.style.display && (t.style.display = "none");
                return c(r), !1
            }).keydown(function() {
                clearTimeout(i), i = setTimeout(function() {
                    o.val() !== a && (a = o.val(), o.change())
                }, r)
            }), this
        }, e.fn.doAnimate = function(e) {
            var t = this;
            t.stop(!0, !0).removeClass(e).addClass(e + " animated").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
                t.removeClass(e + " animated"), "zoomOut" == e && t.hide()
            })
        }, window.onbeforeunload = function(e) {
            return e = e || window.event, "login" !== window.page && "customer-info" !== window.page ? (e && (e.returnValue = "Khi đóng hoặc tải lại toàn bộ dữ liệu của chat và mail sẽ được tải lại\n\b	Bạn có chắc không ?"), "Khi đóng hoặc tải lại toàn bộ dữ liệu của chat và mail sẽ được tải lại, bạn có chắc không ?") : void 0
        }, e(document).ready(function() {
            e(document).on("keydown", a), _.mixin(_.extend(mrblack, s.exports())), MainContent.reset() /*_socket.on("AccountIsUse", function() {
                console.log("this is multi tab")
            })*/
        }), e(window).on("hashchange", function() {
            !window.location.hash || _.isEqual(window.location.hash, "#") || window.location.hash.indexOf("collapse") > 0 || _.LoadPage(window.location.hash)
        })
    }(jQuery),
    function(e) {
        e.titleAlert = function(t, n) {
            if (e.titleAlert._running && e.titleAlert.stop(), e.titleAlert._settings = n = e.extend({}, e.titleAlert.defaults, n), !n.requireBlur || !e.titleAlert.hasFocus) {
                n.originalTitleInterval = n.originalTitleInterval || n.interval, e.titleAlert._running = !0, e.titleAlert._initialText = document.title, document.title = t;
                var i = !0,
                    o = function() {
                        e.titleAlert._running && (i = !i, document.title = i ? t : e.titleAlert._initialText, e.titleAlert._intervalToken = setTimeout(o, i ? n.interval : n.originalTitleInterval))
                    };
                e.titleAlert._intervalToken = setTimeout(o, n.interval), n.stopOnMouseMove && e(document).mousemove(function(t) {
                    e(this).unbind(t), e.titleAlert.stop()
                }), n.duration > 0 && (e.titleAlert._timeoutToken = setTimeout(function() {
                    e.titleAlert.stop()
                }, n.duration))
            }
        }, e.titleAlert.defaults = {
            interval: 500,
            originalTitleInterval: null,
            duration: 0,
            stopOnFocus: !0,
            requireBlur: !1,
            stopOnMouseMove: !1
        }, e.titleAlert.stop = function() {
            e.titleAlert._running && (clearTimeout(e.titleAlert._intervalToken), clearTimeout(e.titleAlert._timeoutToken), document.title = e.titleAlert._initialText, e.titleAlert._timeoutToken = null, e.titleAlert._intervalToken = null, e.titleAlert._initialText = null, e.titleAlert._running = !1, e.titleAlert._settings = null)
        }, e.titleAlert.hasFocus = !0, e.titleAlert._running = !1, e.titleAlert._intervalToken = null, e.titleAlert._timeoutToken = null, e.titleAlert._initialText = null, e.titleAlert._settings = null, e.titleAlert._focus = function() {
            if (e.titleAlert.hasFocus = !0, e.titleAlert._running && e.titleAlert._settings.stopOnFocus) {
                var t = e.titleAlert._initialText;
                e.titleAlert.stop(), setTimeout(function() {
                    e.titleAlert._running || (document.title = ".", document.title = t)
                }, 1e3)
            }
        }, e.titleAlert._blur = function() {
            e.titleAlert.hasFocus = !1
        }, e(window).bind("focus", e.titleAlert._focus), e(window).bind("blur", e.titleAlert._blur)
    }(jQuery),
    function(e) {
        e.fn.extend({
            donetyping: function(t, n) {
                n = n || 1e3;
                var i, o = function(e) {
                    i && (i = null, t.call(e))
                };
                return this.each(function(t, a) {
                    var r = e(a);
                    r.is(":input") && r.on("keyup keypress", function(e) {
                        "keyup" == e.type && 8 != e.keyCode || (i && clearTimeout(i), i = setTimeout(function() {
                            o(a)
                        }, n))
                    }).on("blur", function() {
                        o(a)
                    })
                })
            }
        })
    }(jQuery),
    function(e) {
        function t() {
            var e = document.createElement("p"),
                t = !1;
            if (e.addEventListener) e.addEventListener("DOMAttrModified", function() {
                t = !0
            }, !1);
            else {
                if (!e.attachEvent) return !1;
                e.attachEvent("onDOMAttrModified", function() {
                    t = !0
                })
            }
            return e.setAttribute("id", "target"), t
        }

        function n(t, n) {
            if (t) {
                var i = this.data("attr-old-value");
                if (n.attributeName.indexOf("style") >= 0) {
                    i.style || (i.style = {});
                    var o = n.attributeName.split(".");
                    n.attributeName = o[0], n.oldValue = i.style[o[1]], n.newValue = o[1] + ":" + this.prop("style")[e.camelCase(o[1])], i.style[o[1]] = n.newValue
                } else n.oldValue = i[n.attributeName], n.newValue = this.attr(n.attributeName), i[n.attributeName] = n.newValue;
                this.data("attr-old-value", i)
            }
        }
        var i = window.MutationObserver || window.WebKitMutationObserver;
        e.fn.attrchange = function(o) {
            var a = {
                trackValues: !1,
                callback: e.noop
            };
            if ("function" == typeof o ? a.callback = o : e.extend(a, o), a.trackValues && e(this).each(function(t, n) {
                    for (var i, o = {}, t = 0, a = n.attributes, r = a.length; r > t; t++) i = a.item(t), o[i.nodeName] = i.value;
                    e(this).data("attr-old-value", o)
                }), i) {
                var r = {
                        subtree: !1,
                        attributes: !0,
                        attributeOldValue: a.trackValues
                    },
                    c = new i(function(t) {
                        t.forEach(function(t) {
                            var n = t.target;
                            a.trackValues && (t.newValue = e(n).attr(t.attributeName)), a.callback.call(n, t)
                        })
                    });
                return this.each(function() {
                    c.observe(this, r)
                })
            }
            return t() ? this.on("DOMAttrModified", function(e) {
                e.originalEvent && (e = e.originalEvent), e.attributeName = e.attrName, e.oldValue = e.prevValue, a.callback.call(this, e)
            }) : "onpropertychange" in document.body ? this.on("propertychange", function(t) {
                t.attributeName = window.event.propertyName, n.call(e(this), a.trackValues, t), a.callback.call(this, t)
            }) : this
        }
    }(jQuery),
    function(e) {
        if ("function" == typeof define && define.amd) define(["jquery"], e);
        else if ("object" == typeof exports) {
            var t = require("jquery");
            module.exports = e(t)
        } else e(window.jQuery || window.Zepto || window.$)
    }(function(e) {
        "use strict";
        e.fn.serializeJSON = function(t) {
            var n, i, o, a, r, c, l, u, s, f, d;
            return n = e.serializeJSON, i = this, o = n.setupOpts(t), a = i.serializeArray(), n.readCheckboxUncheckedValues(a, o, i), r = {}, e.each(a, function(e, t) {
                c = t.name, l = t.value, u = n.extractTypeAndNameWithNoType(c), s = u.nameWithNoType, f = u.type, f || (f = n.tryToFindTypeFromDataAttr(c, i)), n.validateType(c, f, o), "skip" !== f && (d = n.splitInputNameIntoKeysArray(s), l = n.parseValue(l, c, f, o), n.deepSet(r, d, l, o))
            }), r
        }, e.serializeJSON = {
            defaultOptions: {
                checkboxUncheckedValue: 0,
                parseNumbers: !1,
                parseBooleans: !1,
                parseNulls: !1,
                parseAll: !0,
                parseWithFunction: null,
                customTypes: {},
                defaultTypes: {
                    string: function(e) {
                        return String(e)
                    },
                    number: function(e) {
                        return Number(e)
                    },
                    "boolean": function(e) {
                        var t = ["false", "null", "undefined", "", "0"];
                        return -1 === t.indexOf(e)
                    },
                    "null": function(e) {
                        var t = ["false", "null", "undefined", "", "0"];
                        return -1 === t.indexOf(e) ? e : null
                    },
                    array: function(e) {
                        return JSON.parse(e)
                    },
                    object: function(e) {
                        return JSON.parse(e)
                    },
                    auto: function(t) {
                        return e.serializeJSON.parseValue(t, null, null, {
                            parseNumbers: !0,
                            parseBooleans: !0,
                            parseNulls: !0
                        })
                    },
                    skip: null
                },
                useIntKeysAsArrayIndex: !1
            },
            setupOpts: function(t) {
                var n, i, o, a, r, c;
                c = e.serializeJSON, null == t && (t = {}), o = c.defaultOptions || {}, i = ["checkboxUncheckedValue", "parseNumbers", "parseBooleans", "parseNulls", "parseAll", "parseWithFunction", "customTypes", "defaultTypes", "useIntKeysAsArrayIndex"];
                for (n in t)
                    if (-1 === i.indexOf(n)) throw new Error("serializeJSON ERROR: invalid option '" + n + "'. Please use one of " + i.join(", "));
                return a = function(e) {
                    return t[e] !== !1 && "" !== t[e] && (t[e] || o[e])
                }, r = a("parseAll"), {
                    checkboxUncheckedValue: a("checkboxUncheckedValue"),
                    parseNumbers: r || a("parseNumbers"),
                    parseBooleans: r || a("parseBooleans"),
                    parseNulls: r || a("parseNulls"),
                    parseWithFunction: a("parseWithFunction"),
                    typeFunctions: e.extend({}, a("defaultTypes"), a("customTypes")),
                    useIntKeysAsArrayIndex: a("useIntKeysAsArrayIndex")
                }
            },
            parseValue: function(t, n, i, o) {
                var a, r;
                return a = e.serializeJSON, r = t, o.typeFunctions && i && o.typeFunctions[i] ? r = o.typeFunctions[i](t) : o.parseNumbers && a.isNumeric(t) ? r = Number(t) : !o.parseBooleans || "true" !== t && "false" !== t ? o.parseNulls && "null" == t && (r = null) : r = "true" === t, o.parseWithFunction && !i && (r = o.parseWithFunction(r, n)), r
            },
            isObject: function(e) {
                return e === Object(e)
            },
            isUndefined: function(e) {
                return void 0 === e
            },
            isValidArrayIndex: function(e) {
                return /^[0-9]+$/.test(String(e))
            },
            isNumeric: function(e) {
                return e - parseFloat(e) >= 0
            },
            optionKeys: function(e) {
                if (Object.keys) return Object.keys(e);
                var t, n = [];
                for (t in e) n.push(t);
                return n
            },
            readCheckboxUncheckedValues: function(t, n, i) {
                var o, a, r, c, l;
                null == n && (n = {}), l = e.serializeJSON, o = "input[type=checkbox][name]:not(:checked):not([disabled])", a = i.find(o).add(i.filter(o)), a.each(function(i, o) {
                    r = e(o), c = r.attr("data-unchecked-value"), c ? t.push({
                        name: o.name,
                        value: c
                    }) : l.isUndefined(n.checkboxUncheckedValue) ? t.push({
                        name: o.name,
                        value: o.value
                    }) : t.push({
                        name: o.name,
                        value: n.checkboxUncheckedValue
                    })
                })
            },
            extractTypeAndNameWithNoType: function(e) {
                var t;
                return (t = e.match(/(.*):([^:]+)$/)) ? {
                    nameWithNoType: t[1],
                    type: t[2]
                } : {
                    nameWithNoType: e,
                    type: null
                }
            },
            tryToFindTypeFromDataAttr: function(e, t) {
                var n, i, o, a;
                return n = e.replace(/(:|\.|\[|\]|\s)/g, "\\$1"), i = '[name="' + n + '"]', o = t.find(i).add(t.filter(i)), a = o.attr("data-value-type"), a || null
            },
            validateType: function(t, n, i) {
                var o, a;
                if (a = e.serializeJSON, o = a.optionKeys(i ? i.typeFunctions : a.defaultOptions.defaultTypes), n && -1 === o.indexOf(n)) throw new Error("serializeJSON ERROR: Invalid type " + n + " found in input name '" + t + "', please use one of " + o.join(", "));
                return !0
            },
            splitInputNameIntoKeysArray: function(t) {
                var n, i;
                return i = e.serializeJSON, n = t.split("["), n = e.map(n, function(e) {
                    return e.replace(/\]/g, "")
                }), "" === n[0] && n.shift(), n
            },
            deepSet: function(t, n, i, o) {
                var a, r, c, l, u, s;
                if (null == o && (o = {}), s = e.serializeJSON, s.isUndefined(t)) throw new Error("ArgumentError: param 'o' expected to be an object or array, found undefined");
                if (!n || 0 === n.length) throw new Error("ArgumentError: param 'keys' expected to be an array with least one element");
                a = n[0], 1 === n.length ? "" === a ? t.push(i) : t[a] = i : (r = n[1], "" === a && (l = t.length - 1, u = t[l], a = s.isObject(u) && (s.isUndefined(u[r]) || n.length > 2) ? l : l + 1), "" === r ? !s.isUndefined(t[a]) && e.isArray(t[a]) || (t[a] = []) : o.useIntKeysAsArrayIndex && s.isValidArrayIndex(r) ? !s.isUndefined(t[a]) && e.isArray(t[a]) || (t[a] = []) : !s.isUndefined(t[a]) && s.isObject(t[a]) || (t[a] = {}), c = n.slice(1), s.deepSet(t[a], c, i, o))
            }
        }
    });