/**
 * Created by baygiomoidc on 21/07/2016.
 */

/**
 * Created by MrBlack on 2/25/2016.
 */

var acdPublish = require(path.join(_rootPath, 'queue', 'publish', 'acd-publish.js'));

module.exports = {
    /**
     * Chưa dùng
     * @param id
     */
    syncGroupProfile: function(id){
        _async.waterfall([
            function(next){
                _AgentGroups.find({idProfile: id}, next);
            },
            function(ags, next){
                _Users.find({$or: [
                    {agentGroupLeaders: {$elemMatch: {group : {$in : _.pluck(ags, '_id')}}}},
                    {agentGroupMembers: {$elemMatch: {group : {$in : _.pluck(ags, '_id')}}}}
                ]}, next);
            }
        ], function(err, result){

        });
    },

    /**
     * Cập nhật lại dữ liệu của service cho ACD
     */
    syncService: function(){
        acdPublish.serviceChange();
    },

    /**
     * Cập nhật lại dữ liệu agent cho ACD
     * @param id User ID
     */
    syncAgent: function(id){
        _Users.findById(id.toString(), function(err, result){
            if(!err && _socketUsers[id.toString()]) acdPublish.agentInfo(id.toString(), result);
        });
    }
};