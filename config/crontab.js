/**
 * Крон для для обработки заказов
 *
 * @author aosipov
 */

module.exports.crontab = {

    /*
     * The asterisks in the key are equivalent to the
     * schedule setting in crontab, i.e.
     * minute hour day month day-of-week year
     * so in the example below it will run every minute
     */

    '*/1 * * * *': function() {
        var task = require('../crontab/TaskOrderProcessing.js');

        try {
            if (!notify.isRunning) {
                sails.log.error('Crontab try to start TaskOrderProcessing');
                task.run();
            }
        } catch (e) {
            task.isRunning = false;
            sails.log.error('Crontab TaskOrderProcessing exception:', e);
        }
    }
};

