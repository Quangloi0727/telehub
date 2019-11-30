/**
 * Created by baygiomoidc on 02/03/2016.
 */

var publish = require(path.join(_rootPath, 'queue', 'publish', 'voice-publish.js'));

/**
 * Lấy dữ liệu về skill, group của user trong tenant
 * @param user Đối tượng user cần lấy thông tin
 * @param cb Hàm call back trả về khi có kết quả
 */
var getAgentInfo = function(user, cb){
    var _groups = [];
    var _skills = [];
    _async.waterfall([
        function(next){
            // TODO: lấy danh sách nhóm agent đã disable user khỏi nhóm để không được route call
            _AgentGroupDisable.distinct('idGroup', {idAgent: user._id}, next);
        },
        function (disableGroup, next) {
            // TODO: lấy danh sách nhóm agent user phục vụ
            var _checkGroup = _.map(disableGroup, function(item){
                return item.toString();
            });

            _groups = _.union(
                _.chain(user.agentGroupLeaders)
                    .map(function(group){
                        return group.group ? {groupID: group.group.toString(), agentType: 1} : null;
                    })
                    .filter(function(group){
                        return _checkGroup.indexOf(group.groupID) < 0;
                    })
                    .compact()
                    .value(),
                _.chain(user.agentGroupMembers)
                    .map(function(group){
                        return group.group ? {groupID: group.group.toString(), agentType: 0} : null;
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
            // TODO: lấy danh sách kỹ năng của nhóm agent
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
        },
        function(skills, next){
            // TODO: chuẩn hóa dữ liệu skill
            _skills = _.chain(skills)
                .reduce(function (memo, skill){
                    if(skill.idSkill && skill.idSkill._id && skill.idSkill.status){
                        var skillBefore = memo[''+skill.idSkill._id];
                        var order = skillBefore ? ((skillBefore.priority > skill.order) ? skillBefore.priority : skill.order) : skill.order;
                        memo[''+skill.idSkill._id] = {skillID: skill.idSkill._id.toString(), priority: order, state: skill.idSkill.status, recordState: skill.idSkill.recordingState};

                    }
                    return memo;
                },{})
                .value();

            _skills = _.chain(_.keys(_skills))
                .map(function(key){
                    return _skills[key];
                })
                .compact()
                .value();

            _AgentStatus.findOne({isDefault: 1}, next);
        }
    ], function(err, agentStatus){
        if(!err && agentStatus){
            cb({
                agentName : user.name,
                accountCode: user.accountCode,
                agentGroups: _groups,
                agentStatusDefault: agentStatus.statusCode,
                skills: _skills
            });
        } else {
            log.error(err);
            log.error('Agent status not found!');
        }
    });
}

module.exports = {
    getAgentInfo: getAgentInfo
};