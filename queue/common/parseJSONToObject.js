/**
 * Created by luongvanlam on 3/4/16.
 */
module.exports = function (jsonString) {
    if (_.isNull(jsonString)) {
        return log.error('WrongFormat Input JSON') ? null : null;
    }

    function parseFromString(str) {
        if (mongodb.ObjectID.isValid(str) && _.isEqual(24, str.length)) return new mongodb.ObjectID(str);
        if (_moment(str, _moment.ISO_8601, true).isValid()) return new Date(str);
        return str;
    }

    function parseFromArray(arr) {
        return _.reduce(arr, function (memo, item) {
            var temp = item;
            if (_.isString(item)) {
                temp = parseFromString(item);
            } else if (item instanceof Array) {
                temp = parseFromArray(item);
            } else if (item instanceof Date) {
                temp = item;
            } else if (item instanceof Object) {
                temp = parseFromObject(item);
            }
            memo.push(temp);
            return memo;
        }, []);
    }

    function parseFromObject(obj) {
        if (obj instanceof RegExp) return obj;
        return _.reduce(_.allKeys(obj), function (memo, key) {
            memo[key] = obj[key];

            if (_.isString(obj[key])) {
                memo[key] = parseFromString(obj[key]);
            } else if (obj[key] instanceof Array) {
                memo[key] = parseFromArray(obj[key]);
            } else if (obj[key] instanceof Date) {
                memo[key] = obj[key];
            } else if (obj[key] instanceof Object) {
                memo[key] = parseFromObject(obj[key]);
            }
            return memo;
        }, {});
    }

    function parseWithObjectId(item) {
        if (item instanceof Date) return item;
        if (item instanceof Array) return parseFromArray(item);
        if (_.isString(item)) return parseFromString(item);
        if (item instanceof Object) return parseFromObject(item);
        return item;
    }

    var obj = jsonString;
    if (_.isString(obj)) {
        try {
            obj = JSON.parse(obj);
            if (!obj) return null;
        } catch (err) {
            return jsonString;
        }
    }

    return parseWithObjectId(obj);
};