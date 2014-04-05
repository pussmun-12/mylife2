/**
 * Created with IntelliJ IDEA.
 * User: helena
 * Date: 10/1/13
 * Time: 11:27 fm
 * To change this template use File | Settings | File Templates.
 */
function DateUtil(){

}
DateUtil.prototype.ISOformatDayOrMonth = function(dayOrMonth){
     if(dayOrMonth < 10){
         return '0' + dayOrMonth;
     }
    return dayOrMonth;
}

DateUtil.splitDateStringToCustomDate = function(isoDateString) {
    var arrayed = isoDateString.split('-');
    return {year: arrayed[0], month: arrayed[1], day: arrayed[2]};
}

DateUtil.getJSDateFromCustomDate = function(customDate){
    return new Date(customDate.year, customDate.month - 1, customDate.day);
}
