function CalendarController($scope, $navigate, dateService){
    $scope.$watch("assignments", function (value) {//I change here
        $scope.datesHavingImages = [];
        $scope.datesHavingText = {};
        //$scope.currentDate = dateService.getCurrentDate();
        $scope.calendarUtil.initCalendar(dateService,$scope,$navigate);
    });
    $scope.back = function(){
        $navigate.back();
    }
}
