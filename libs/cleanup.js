function noOp() {
};

exports.Cleanup = function Cleanup(callback) {

    callback = callback || noOp;
    process.on('cleanup', callback);

    process.on('exit', function () {
		/**
         * 28.Feb.2017 hoangdv
         * kick all agent online to mark logout in agentstatuslog table
		 */
		if (_socketUsers) {
            Object.keys(_socketUsers).map(function(key) {
				if (_socketUsers[key].monitor) {
					_socketUsers[key].monitor.destroy();
                }
			});
        }
		process.emit('cleanup');
    });

    process.on('SIGINT', function () {
        _ActiveMQ.disconnect(function(e){
            process.exit(2);
        });
    });

    process.on('uncaughtException', function (e) {
        console.log('Uncaught Exception...');
        log.error(e);

        if (QUEUE_TernalPublish){
            QUEUE_TernalPublish.queueError(e);
        }

        process.exit(99);
    });
};