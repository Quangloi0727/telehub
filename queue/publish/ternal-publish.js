/**
 * Created by luongvanlam on 2/25/16.
 */
module.exports = {
    queueError: function(error){
        var obj = {
            message: error.message,
            stack : error.stack
        };
        _ActiveMQ.publish('/queue/' + _config.activemq.queueName + '-Error', JSON.stringify(obj));
    },
    queueCreate: function (modalName, entities) {
        this.queuePublish(modalName, 1, entities);
    },
    queueUpdate: function (modalName, entities) {
        this.queuePublish(modalName, 2, entities);
    },
    queueOverride: function (modalName, entities) {
        var self = this;
        entities = Array.isArray(entities) ? entities : [entities];
        _.each(entities, function (item) {
            self.queuePublish(modalName, 99, item);
        });
    },
    queueRemove: function (modalName, entities) {
        this.queuePublish(modalName, 3, entities);
    },
    queuePublish: function (modalName, action, entities) {
        var publishObject = {};
        publishObject['action'] = action;
        entities = Array.isArray(entities) ? entities : [entities];

        if (_.isEqual(modalName, 'Users') && _.isString(entities[0])){
            if (mongodb.ObjectID.isValid(entities[0])){
                entities = _.map(entities, function(item){
                    return _.isString(item) ? new mongodb.ObjectID(item) : item
                });
                _Users.find({_id: {$in: entities}}, function(err, result){
                    publishObject['object'] = result;
                    _ActiveMQ.publish('/queue/' + _config.activemq.queueName + '-' + modalName, JSON.stringify(publishObject));
                })
            }else{
                log.error('Not valid Id: ' + entities);
            }
        }else{
            publishObject['object'] = entities;
            _ActiveMQ.publish('/queue/' + _config.activemq.queueName + '-' + modalName, JSON.stringify(publishObject));
        }
    },
    parseObjectWithObjectId: function (jsonString) {
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
                } else if (item instanceof Object) {
                    temp = parseFromObject(item);
                }
                memo.push(temp);
                return memo;
            }, []);
        }

        function parseFromObject(obj) {
            return _.reduce(_.allKeys(obj), function (memo, key) {
                memo[key] = obj[key];

                if (_.isString(obj[key])) {
                    memo[key] = parseFromString(obj[key]);
                } else if (obj[key] instanceof Array) {
                    memo[key] = parseFromArray(obj[key]);
                } else if (obj[key] instanceof Object) {
                    memo[key] = parseFromObject(obj[key]);
                }
                return memo;
            }, {});
        }

        function parseWithObjectId(item) {
            if (item instanceof Array) return parseFromArray(item);
            if (_.isString(item)) return parseFromString(item);
            if (item instanceof Object) return parseFromObject(item);
            return item;
        };

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
    },
}