/**
 * Created with IntelliJ IDEA.
 * User: helena
 * Date: 10/3/13
 * Time: 10:11 fm
 * To change this template use File | Settings | File Templates.
 */
function CalendarUtil(){

}
CalendarUtil.prototype.initCalendar = function(dateService, scope, navigate){
   // console.log(startDate);
    var customDate = DateUtil.splitDateStringToCustomDate(dateService.getCurrentDate());
   // console.log(customDate);
    var jsDate = DateUtil.getJSDateFromCustomDate(customDate);
  //  console.log(jsDate);
    //var that = this;
    //TODO: This is not good. Learn about Angular services and providers and refactor
    var transEndEventNames = {
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition' : 'transitionend',
            'OTransition' : 'oTransitionEnd',
            'msTransition' : 'MSTransitionEnd',
            'transition' : 'transitionend'
        },
        transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
        $wrapper = $( '#custom-inner' ),
        $calendar = $( '#calendar' ),
        cal = $calendar.calendario( {
            onDayClick : function( $el, $contentEl, dateProperties ) {
                //$scope.$digest();
                var currentDateString = dateProperties.year + '-' + scope.dateUtil.ISOformatDayOrMonth(dateProperties.month) +
                    '-' + scope.dateUtil.ISOformatDayOrMonth(dateProperties.day);
                dateService.setCurrentDate(currentDateString);
                dateService.setCurrentDateDMYY(dateProperties.day + '/' + dateProperties.month + '-' + ('' +dateProperties.year).substr(2, (dateProperties.year).length));
                console.log('DateString: ' + currentDateString);
                scope.$apply(function(){
                    navigate.back();
                });

            },
            caldata : codropsEvents,
            displayWeekAbbr : true ,
            today : jsDate,
            angularScope: scope
        } ),
        $month = $( '#custom-month' ).html( cal.getMonthName() ),
        $year = $( '#custom-year' ).html( cal.getYear() );

    $( '#custom-next' ).on( 'click', function() {
        cal.gotoNextMonth( updateMonthYear );
    } );
    $( '#custom-prev' ).on( 'click', function() {
        cal.gotoPreviousMonth( updateMonthYear );
    } );

    function updateMonthYear() {
        $month.html( cal.getMonthName() );
        $year.html( cal.getYear() );
    }

    // just an example..
    function showEvents( $contentEl, dateProperties ) {

        hideEvents();

        var $events = $( '<div id="custom-content-reveal" class="custom-content-reveal"><h4>Events for ' + dateProperties.monthname + ' ' + dateProperties.day + ', ' + dateProperties.year + '</h4></div>' ),
            $close = $( '<span class="custom-content-close"></span>' ).on( 'click', hideEvents );

        $events.append( $contentEl.html() , $close ).insertAfter( $wrapper );

        setTimeout( function() {
            $events.css( 'top', '0%' );
        }, 25 );

    }
    function hideEvents() {

        var $events = $( '#custom-content-reveal' );
        if( $events.length > 0 ) {

            $events.css( 'top', '100%' );
            Modernizr.csstransitions ? $events.on( transEndEventName, function() { $( this ).remove(); } ) : $events.remove();

        }

    }
  //  $( '#calendar' ).calendario({displayWeekAbbr : true ,weeks:['mån', 'tis','ons','tor','fre','lör', 'sön'],today : jsDate,angularScope: $scope});

}
