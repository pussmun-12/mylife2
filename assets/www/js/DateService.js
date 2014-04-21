/**
 * Created by IntelliJ IDEA.
 * User: hakangleissman
 * Date: 2014-02-04
 * Time: 07:44
 * To change this template use File | Settings | File Templates.
 */
function DateService(){
    this.date = new Date();
    this.dateString = this.getISODateStringFromJSDate(this.date);
    this.dateStringDMYY = this.getShortDateStringFromISODate(this.date);
}

DateService.prototype.setCurrentDate = function(date){
    this.dateString = date;
}

DateService.prototype.setCurrentDateDMYY = function(date){
    this.dateStringDMYY = date;
}

DateService.prototype.getCurrentDate = function(){
    return this.dateString;
}

DateService.prototype.getCurrentDateDMYY = function(){
    return this.dateStringDMYY;
}

DateService.prototype.getISODateStringFromMilliSeconds = function(millis){
    return this.getISODateStringFromJSDate(new Date(millis));
}

DateService.prototype.getISODateStringFromJSDate = function(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return year + '-' + month + '-' + day;
}

DateService.prototype.getShortDateStringFromISODate = function(date){
    var year = '' + date.getFullYear();
    var month = (1 + date.getMonth()).toString();

    var day = date.getDate().toString();

    return day + '/' + month + '-' + year.substring(2,4);
}
