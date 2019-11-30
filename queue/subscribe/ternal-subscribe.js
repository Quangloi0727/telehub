/**
 * Created by MrBlack on 2/1/2016.
 */
var fs = require('fs.extra');
var crmCoreSyncData = require(path.join(_rootPath, 'queue', 'common', 'crm-core-sync-data.js'));
var users = require(path.join(_rootPath, 'queue', 'common', 'request-users.js'));
var kpi = require(path.join(_rootPath, 'queue', 'common', 'request-kpi-collection.js'));
var trunk = require(path.join(_rootPath, 'queue', 'common', 'request-trunks.js'));

module.exports = function (client, sessionId) {
    var ternalPrefix = _config.activemq.queueName;

    if (ternalPrefix){
        fs.readdirSync(path.join(_rootPath, 'modals')).forEach(function (file) {
            var modalName = _.classify(file.replace('.js', ''));
            client.subscribe('/queue/' + ternalPrefix + '-' + modalName + '-fromCore', function (body, header) {
                crmCoreSyncData.subscribe(modalName, body, header);
            });
        });

        users.ResponseUser(client, sessionId);
        users.ResponseAddUser(client, sessionId);
        kpi.ResponseKPI(client, sessionId);
        kpi.ResponseAddKPI(client, sessionId);
        trunk.ResponseTrunk(client, sessionId);
    }
};