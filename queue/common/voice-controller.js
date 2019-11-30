/**
 * Created by baygiomoidc on 02/03/2016.
 */

var publish = require(path.join(_rootPath, 'queue', 'publish', 'voice-publish.js'));

var createLoginRequest = function(user, cb){
    var mes = {
        messageType: 1,
        agentID : user._id,
        passWord : user.password,
        deviceID : user.deviceID,
        kickOption : true,
        transID : 'ABC',
        tenant: '',
        agentInfo: {}
    }

    var _groups = [];
    var _skills = [];
    _async.waterfall([
        function (next) {
            _groups = _.union(
                _.chain(user.agentGroupLeaders)
                    .map(function(group){
                        return {groupID: group.group.toString(), agentType: 1};
                    })
                    .compact()
                    .value(),
                _.chain(user.user_agentGroupMembers)
                    .map(function(group){
                        return {groupID: group.group.toString(), agentType: 0};
                    })
                    .compact()
                    .value()
            );

            var aggregate = [];
            var _query = {_id: {$in: _.arrayObjectId(_.pluck(_groups, 'groupID'))}};
            aggregate.push({$match: _query});
            aggregate.push({$lookup: {from: 'groupprofiles', localField: 'idProfile', foreignField: '_id', as: 'groupprofiles'}});
            _AgentGroups.aggregate(aggregate, next);
        },
        function(agentGroups,next){
            _skills = _.chain(agentGroups)
                .reduce(function(memo,group){
                    return _.union(memo, _.chain(group.groupprofiles)
                        .reduce(function(memo2, profile){
                            return _.union(memo2, profile.skills);
                        },[])
                        .compact()
                        .value());
                },[])
                .compact()
                .value();

            _Skills.populate(_skills, {path: 'idSkill', select: 'status recordingState'}, next);
        }
    ], function(err, skills){
        _skills = _.chain(skills)
            .reduce(function (memo, skill){
                var skillBefore = memo[''+skill.idSkill._id];
                var order = skillBefore ? ((skillBefore.priority > skill.order) ? skillBefore.priority : skill.order) : skill.order;
                memo[''+skill.idSkill._id] = {skillID: skill.idSkill._id.toString(), priority: order, state: skill.idSkill.status, recordState: skill.idSkill.recordingState};
                return memo;
            },{})
            .value();

        _skills = _.chain(_.keys(_skills))
            .map(function(key){
                return _skills[key];
            })
            .compact()
            .value();

        mes.agentInfo = {
            agentName : user.name,
            accountCode: user.accountCode,
            agentGroups: _groups,
            agentStatusDefault: 3,
            skills: _skills
        };

        cb(mes);
    });
}

module.exports = {
    createLoginRequest: createLoginRequest
};