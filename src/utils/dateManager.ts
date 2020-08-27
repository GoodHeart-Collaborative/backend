
"use strict";

import * as _ from "lodash";
import * as moment from 'moment';


const getWeekendDates = function () {
    try {
        let curr;
        curr = new Date();
        var fridayDate;
        fridayDate = new Date();
        var friday;
        friday = 5 - curr.getDay();
        fridayDate.setDate(fridayDate.getDate() + friday);
        console.log('friday', fridayDate);

        const sundayEndDate = moment().endOf('week').toISOString();

        return { fridayDate, sundayEndDate }
    } catch (error) {
        return Promise.reject(error)
    }
}


export {
    getWeekendDates,
};