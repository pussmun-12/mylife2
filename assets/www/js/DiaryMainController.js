function DiaryMainController($scope, $log, $timeout, $rootScope, $location, $navigate, dateService,cordovaProxy,dbService){

    $scope.windowWidth = window.outerWidth;
    $scope.factBoxes = [];
    $scope.showDiaryVar = false;
    $scope.showLoadingSpinner = true;
    $scope.counter = new Date().getMilliseconds();
    $scope.obj = {activeIndex: -1,activeFactBoxIndex: -1};
    $scope.currentImageStyle = 'none';
    $scope.options = [{id:1, value: "Lägg till text med rubrik"},{id:2, value: "Lägg till text utan rubrik"},{id:3, value:"Ta bort dagens text"},
        {id:4, value:"Lägg till faktabox"},{id:5, value:"Visa faktaboxar"} ,{id:6, value:"Göm faktaboxar"}];

    $scope.successHandler = function(images){
        alert('success');
         var keys = Object.keys(images);
         var array = [];
         for(var key in keys){
            var val = keys[key];
            var image = images[val];
            image.path = val;
            array.push(image);
         }
         
         dbService.saveArray(array);
    }
    cordovaProxy.getImagesFromPhone($scope.successHandler);
    
    $scope.toggleCategoryPanel = function(){

        if( $scope.showCategoryPanel){
            $('.categoryPanel').removeClass('categoryPanelActive');

            $timeout(function(){
                $scope.showCategoryPanel = false;
            },300);
        }
        else{
            $scope.showCategoryPanel = true;
            $timeout(function(){
                $('.categoryPanel').addClass('categoryPanelActive');
            },300);
        }
    }



    $scope.goToPath = function(path){
        $location.path(path);
    }

    $scope.go = function(path){
        console.log('go');
        $('#myCarousel').carousel('stop');
        if($scope.diaryStyle === "1")
            $scope.diaryStyle ="2";
        else
            $scope.diaryStyle="1";
    }

    $scope.collapseCarousel = function(){
        $('.imgContainer').addClass('moveupCarousel');
        $('.txtContainer').addClass('moveupTextCon');
    }

    $scope.bringBackCarousel = function(){
        $('.imgContainer').removeClass('moveupCarousel');
        $('.txtContainer').removeClass('moveupTextCon');
    }

    $scope.prevCarouselImage = function(){
        console.log('prev');
        $('#myCarousel').carousel('prev');
    }

    $scope.nextCarouselImage = function(){
        console.log('next');
        $('#myCarousel').carousel('next');
    }

    $scope.factboxOnHover = function(factbox){
        console.log('factboxOnHover');
        if(factbox.lat && factbox.long){
            //$scope.markersProperty[0].latitude = factbox.lat;
            //$scope.markersProperty[0].longitude = factbox.long;
            $scope.position.coords.latitude =  factbox.lat;
            $scope.position.coords.longitude = factbox.long;
        }
        $timeout(function(){
            google.maps.event.trigger($scope.myMap,'resize');
            //mapInitFlag=true;
            console.log('adjusted map');
        });
    }

    $scope.showFactBoxSave = function(factbox, $event){
        $scope.factbox = factbox;
        $scope.factBoxEditMode = true;
        factbox.showimageurlText = true;
        factbox.showTitle = true;
        factbox.showSubtitle = true;
        factbox.showimageurl = false;
        $scope.showFactBoxSaveButton = true;
        $scope.addFactBoxCategories(factbox);
        console.log('Show factbox save');
        console.log($scope.obj.activeFactBoxIndex);
        //$event.stopPropagation();
    }

    $scope.saveFactBox = function(factbox,$event){
        console.log($scope.factbox.lat);
        console.log('Save factbox:');
        console.log(factbox);
        $("html, body").animate({ scrollTop: "0px" });
        factbox.showimageurlText = false;

        if($scope.factboxImage){
            factbox.imageurl = 'http://bjermo.se/images/diary/sep11/terjad_bild.jpg';
            factbox.showimageurl = true;
        }

        else if(factbox.imageurl != 'Bildadress på internet' && factbox.imageurl != ''){
            factbox.showimageurl = true;
            factbox.imageurl = 'http://bjermo.se/images/diary/sep11/terjad_bild.jpg';
        }

        if(factbox.title === 'Titel'){
            factbox.showTitle = false;
        }
        if(!factbox.subtitle || factbox.subtitle === 'Underrubrik'){
            factbox.showSubtitle = false;
        }

        factbox.showCategories = false;
        var promise = $.Deferred($scope.serverService.saveFactBox(factbox)).promise();
        $.when(promise).then(function(data){
            console.log('saved factbox');
            var todayHavingText = {};
            var imageHavingText =  $scope.datesHavingImages.indexOf($scope.currentDate) >= 0 ? true: false;
            if($scope.datesHavingText[$scope.currentDate]){
                todayHavingText =  $scope.datesHavingText[$scope.currentDate];
            }
            todayHavingText.factbox = true;
            $scope.datesHavingText[$scope.currentDate] = todayHavingText;
            var dateNode = $('.fc-today').children()[0];
            var jqueryDateNode = $(dateNode);
            var classy = '';
            if(todayHavingText.maintext && imageHavingText ){
                classy = 'allTextImgBorder';
            }
            else if(imageHavingText){
                classy = 'factboxImgBorder';
            }
            else if(todayHavingText.maintext){
                classy = 'factboxMaintextBorder';
            }

            else{
                classy = 'factboxBorder';
            }
            //TODO: När factbox är tillsammans med image i en dag, factboxramen ritas ej ut! se jquery.calendario.js
            //jqueryDateNode.css('box-shadow', 'none');
            jqueryDateNode.addClass(classy);
            $scope.$digest();

        });
        $scope.showFactBoxSaveButton = false;
        $scope.factBoxEditMode = false;
        $scope.factboxImage = null;
        $scope.obj.activeFactBoxIndex = -1;
        // $scope.saveFactBoxCategories(factbox);
        $event.stopPropagation();
    }

    $scope.deleteFactBox = function(factbox,$event, index){
        $("html, body").animate({ scrollTop: "0px" });
        $scope.factBoxEditMode = false;
        $scope.factboxImage = null;
        var promise = $.Deferred($scope.serverService.deleteFactBox(factbox)).promise();
        $.when(promise).then(function(data){
            console.log('deleted factbox');
            var index2 =  $scope.factBoxes.indexOf(factbox);
            $scope.factBoxes.splice(index2,1);
            var todayHavingText = {};
            var imageHavingText =  $scope.datesHavingImages.indexOf($scope.currentDate) >= 0 ? true: false;
            if($scope.datesHavingText[$scope.currentDate]){
                todayHavingText =  $scope.datesHavingText[$scope.currentDate];
            }
            todayHavingText.factbox = false;
            $scope.datesHavingText[$scope.currentDate] = todayHavingText;
            var dateNode = $('.fc-today').children()[0];
            var jqueryDateNode = $(dateNode);
            var classy = '';
            if(todayHavingText.maintext && imageHavingText ){
                classy = 'maintextImgBorder';
            }
            else if(imageHavingText){
                classy = 'imgBorder';
            }
            else if(todayHavingText.maintext){
                classy = 'maintextBorder';
            }
            jqueryDateNode.removeClass();
            jqueryDateNode.addClass('fc-date');
            jqueryDateNode.addClass(classy);
            $scope.$digest();

        });
        $scope.showFactBoxSaveButton = false;
        $scope.obj.activeFactBoxIndex = -1;
        $event.stopPropagation();
    }

    $scope.addFactBoxCategories = function(factbox){
        console.log('add factbox categories');
        console.log(factbox);
        factbox.showCategories = true;
    }

    $scope.saveFactBoxCategories = function(factbox){
        console.log('save factbox categories');
        console.log(factbox);
        factbox.showCategories = false;
    }

    $scope.clickFactBoxCategory = function($index, event){
        console.log('click fact box category');
        $scope.obj.activeFactBoxIndex = $index;
        event.stopPropagation();
    }

    $scope.newCategoryWithFactBox = function(index,category,$event,factbox){
        console.log('New Category');
        //console.log($scope.imageCategories);
        console.log(category);
        if($scope.imageCategories.indexOf(category) === -1){
            //$scope.currentImage.categories[index].name = category;
            factbox.categories[index].name = category;
            $scope.imageCategories.push(category);
            var promise = $.Deferred($scope.serverService.setCategoryList($scope.imageCategories)).promise();
            $.when(promise).then(function(datesHavingImages){
                console.log('saved new category list');
            });
            $scope.obj.activeFactBoxIndex = -1;
        }
        else{
            alert('Denna kategori finns redan - välj den i listan nedan.');
        }


        //alert($scope.currentImage.categories[index]);
        //console.log($scope.currentImage.categories);
        $event.stopPropagation();
    }

    $scope.isShowFactBoxes = function(){
        if($scope.showFactBoxes && $scope.factBoxes.length > 0){
            return true;
        }
        return false;
    }
    /**   $scope.showFactBoxCategories = function($index,factbox){
     if($scope.activeFactBoxIndex === $index){
     $scope.factbox = $scope.factBoxes[scope.]
     }
     } **/

    $scope.showExistingCategoriesForFactBox = function($index, factbox){
        if($scope.obj.activeFactBoxIndex === $index){
            console.log('true');
            console.log(factbox);
            return true;
        }
        return false;
    }

    $scope.pickFactBoxCategory = function(category, $index, $event, factbox){
        console.log('pickFactBoxCategory');
        if(!$scope.factboxHasCategory(category,factbox)){
            //console.log('pickCategory: ' + category + ', ' + $scope.obj.activeIndex);
            factbox.categories[$scope.obj.activeFactBoxIndex].name = category;
            //console.log($scope.obj.activeIndex);
            $scope.obj.activeFactBoxIndex = -1;
        }
        else{
            alert('Vald kategori är redan associerad med denna faktabox');
        }
        $event.stopPropagation();
    }

    $scope.setFactboxImage = function(image){
        if($scope.factBoxEditMode){
            $scope.factboxImage = image;
            alert('Du valde: ' + image);
        }
    }

    $scope.factboxHasCategory = function(category, factbox){
        for(var i = 0; i < factbox.categories.length; i++){
            if(factbox.categories[i].name === category){
                return true;
            }
        }
        return false;
    }

    $scope.cacheCount = function(){
        return $scope.counter++;
    }
    $scope.addImageCaption = function(currentImage){
        $('#myCarousel').carousel('pause');
        console.log('addImageCaption new');
        console.log(currentImage);
        $scope.currentImage = currentImage;
        if(currentImage.captionExists === false){
            //$scope.currentImage.caption = '';
            currentImage.captionExists = true;
        }
        var imageKey =  currentImage.name + '_' + currentImage.modified.toString();
        //var categories = $scope.serverService.getCategoriesForImage(imageKey);
        $scope.showCategories = true;
    }

    $scope.checkCategories = function(categories){
        var cats = [];
        for(var i = 0; i < categories.length; i++){
            if(categories[i].name === ''){
                cats.push({name : '-'});
            }
            else{
                cats.push(categories[i]);
            }
        }
        return cats;
    }

    $scope.clickCategory = function(index){
        $scope.obj.activeIndex = index;
        console.log('Index: ' + index);
        // $scope.currentImage = $scope.currentImages[index];
        console.log($scope.currentImage);
        console.log($scope.imageCategories);
    }
    //TODO: Ibland slutar vyn att uppdateras. Listan med cateogries i currentImage uppdateras rätt
    //TODO: Om kategorifältet är tomt går det inte att välja en befintlig kategori. Verkar dock som att det slår igenom i javascriptet. Senare?
    // och den sparas oxå rätt. Men uppdateringen av vyn funkar inte omedelbart. Ev. tetsta att sätta tillbaka lasse directorien till el.html()
    // istället för .text()?
    //TODO: listan med befintliga kategorier och ny-knappen ska försvinna vid val, det gör de inte nu.
    $scope.pickCategory = function(category,index,$event){
        console.log('pickCategory: ');
        console.log($scope.currentImage.categories);
        if(!$scope.currentImageHasCategory(category)){
            console.log('pickCategory: ' + category + ', ' + $scope.obj.activeIndex);
            $scope.currentImage.categories[$scope.obj.activeIndex].name = category;
            //console.log($scope.obj.activeIndex);
            $scope.obj.activeIndex = -1;
        }
        else{
            alert('Vald kategori är redan associerad med denna bild');
        }
        console.log('Active index: ' +
            $scope.obj.activeIndex);
        $event.stopPropagation();
    }

    $scope.collapseCategories = function(currentImage, event){
        /*currentImage.active = false;
         $scope.slideInCategories = false;
         $timeout(function(){
         $scope.showCategories = false;
         },500);  */
        //$scope.showCategories = false;
        $scope.obj.activeIndex = -1;
        // $('#myCarousel').carousel();
        event.stopPropagation();

    }

    $scope.currentImageHasCategory = function(category){
        for(var i = 0; i < $scope.currentImage.categories.length; i++){
            if($scope.currentImage.categories[i].name === category){
                return true;
            }
        }
        return false;
    }

    $scope.showCategoriesFunc = function(index){
        //console.log('ShowCat: ' + index + ', ' + $scope.obj.activeIndex);
        if(index ===  $scope.obj.activeIndex){
            return true;
        }

        return false;
    }
    $scope.newCategory = function(index,category,$event){
        console.log('New Category');
        console.log($scope.imageCategories);
        console.log(category);
        if($scope.imageCategories.indexOf(category) === -1){
            $scope.currentImage.categories[index].name = category;
            $scope.imageCategories.push(category);
            var promise = $.Deferred($scope.serverService.setCategoryList($scope.imageCategories)).promise();
            $.when(promise).then(function(datesHavingImages){
                console.log('saved new category list');
            });
            $scope.obj.activeIndex = -1;
        }
        else{
            alert('Denna kategori finns redan - välj den i listan nedan.');
        }


        //alert($scope.currentImage.categories[index]);
        console.log($scope.currentImage.categories);
        $event.stopPropagation();
    }

    $scope.showCategoryList = function(category){
        console.log('showCategoryList');
        console.log(category);
        //console.log(category);
        category = 'lasse';
        $scope.showCategoryList = true;
    }

    $scope.saveImageCaption = function(currentImage, event){
        //alert(currentImage.categories);
        if(currentImage.caption === ''){
            currentImage.captionExists =  false;
        }
        //remove empty categories, I cannot use them, since they may make text be displayed twice.
        currentImage.categories = $scope.checkCategories(currentImage.categories);
        var toSave = {caption: currentImage.caption, captionExists: currentImage.captionExists, date: $scope.currentDate, categories: currentImage.categories};
        var imageKey =  currentImage.name + '_' + currentImage.modified.toString();
        $scope.cloudMine.set(imageKey, toSave).on('success', function(data, response) {
            console.log(toSave);
        });
        $scope.showCategories = false;
        $scope.obj.activeIndex = -1;
        $('#myCarousel').carousel();
        event.stopPropagation();

    }


    $scope.addDayMainText = function(selection){
        console.log(selection + $scope.currentDate);
        var currentDate;
        if(!$scope.currentDate){
            $scope.currentDate = $scope.datesHavingImages[($scope.datesHavingImages.length -1)] ;
        }

        var mainTextForToday =  'maintext_' + $scope.currentDate;
        if(selection === 'Lägg till text med rubrik'){
            // $scope.createMainTextNodeWithHeader();
            console.log($scope.mainText);
            if(!$scope.mainText){
                console.log('Skapar mainText');
                $scope.mainText = {body: 'Din text', header: 'Din rubrik', clazz: 'maintext'};
                $scope.mainTextExists = true;
                $scope.mainTextHeaderExists = true;
                $scope.showMainTextButton = true;
            }


        }
        else if(selection === 'Lägg till text utan rubrik'){
            console.log($scope.mainText);
            if(!$scope.mainText){
                console.log('Skapar mainText utan rubrik');
                $scope.mainText = {body: 'Din text', clazz: 'maintext'};
                $scope.mainTextExists = true;

                $scope.showMainTextButton = true;
            }
            // $scope.createMainTextNode();
        }
        else if(selection === 'Ta bort dagens text'){
            $scope.cloudMine.destroy(mainTextForToday).on('success', function(response){
                // console.log(mainTextForToday + '-key destroyed');
                console.log('destroyed!');
                var todayHavingText = {};
                var imageHavingText =  $scope.datesHavingImages.indexOf($scope.currentDate) >= 0 ? true: false;
                if($scope.datesHavingText[$scope.currentDate]){
                    todayHavingText =  $scope.datesHavingText[$scope.currentDate];
                }
                todayHavingText.maintext = false;
                $scope.datesHavingText[$scope.currentDate] = todayHavingText;
                var dateNode = $('.fc-today').children()[0];
                var jqueryDateNode = $(dateNode);
                var classy = '';
                if(todayHavingText.factbox && imageHavingText ){
                    classy = 'factboxImgBorder';
                }
                else if(imageHavingText){
                    classy = 'imgBorder';
                }
                else if(todayHavingText.factbox){
                    classy = 'factboxBorder';
                }
                jqueryDateNode.removeClass();
                jqueryDateNode.addClass('fc-date');
                jqueryDateNode.addClass(classy);
            });
            $scope.mainText = null;
            $scope.mainTextExists = false;
            $scope.mainTextHeaderExists = false;
            $scope.showMainTextButton = false;
        }
        else if(selection === 'Lägg till faktabox'){
            $scope.showFactBoxes = true;
            $scope.factBoxEditMode = true;
            var cats = [{name:'-'},{name:'-'},{name:'-'},{name:'-'},{name:'-'}];
            $scope.factBoxes.push({title:'Titel', id:'factbox_' + ($scope.factBoxes.length + 1) + '_' + $scope.currentDate, subtitle: 'Underrubrik',
                text:'Text', imageurl: 'Klicka på bild i bildspelet', showimageurlText: true, showTitle:true, showSubtitle:true, showLat:true,showLong:true,lat:'',long:'',
                date: $scope.currentDate, clazz:'factbox', categories:cats});
        }
        else if(selection === 'Visa faktaboxar'){
            $scope.showFactBoxes = true;
            //$scope.factBoxes.push({title:'Titel', subtitle: 'Underrubrik', text:'Text', imageurlText: 'bildadress', showimageurlText: true});
        }
        else if(selection === 'Göm faktaboxar'){
            $scope.showFactBoxes = false;
            $scope.factboxImage = null;
            //$scope.factBoxes.push({title:'Titel', subtitle: 'Underrubrik', text:'Text', imageurlText: 'bildadress', showimageurlText: true});
        }
        $scope.toggleMenu();
    }

    $scope.diaryStyle = "1";
    $scope.$watch("assignments", function (value) {//I change here
        $scope.initDiaryJS();
    });
    $scope.variable = 2;

    $scope.goTo = function(path, mode){


        $navigate.go(path, mode);
        //$scope.variable = 2;


    }

    $scope.toggleMenu = function(){
        console.log($scope.showMenu);
        if($scope.showMenu){
            $scope.showMenu = false;
        }
        else{
            $scope.showMenu = true;
        }
    }

    $scope.initDiaryJS = function(){
        $('#welcomePage').remove();
        $('#myCarousel').carousel();
        document.getElementById('noscroll').addEventListener('touchmove', function(e){;e.preventDefault(); });
        $scope.showMenu = false;
        $scope.showFactBoxes = true;
        $scope.factBoxEditMode = false;
        $scope.factboxImage = null;
        $scope.factBoxes = [];
        $scope.factBoxesExist = true;
        $scope.documentHeight = $(document).height();
        $scope.showDiaryVar = false;
        $scope.showLoadingSpinner = true;
        $scope.showMainTextButton = false;
        $scope.mainText = null;
        $scope.obj.activeIndex = -1;
        $scope.obj.activeFactBoxIndex = -1;
        $scope.mainTextExists = false;
        $scope.mainTextHeaderExists = false;
        $scope.currentDate = dateService.getCurrentDate();
        $scope.currentDateDMYY = dateService.getCurrentDateDMYY();
        if(true){
            $scope.doInitJs = false;
            $scope.imagesOnLoad = false; //TODO: Fel ställe?
            $scope.showCategories = false; //TODO: Fel ställe?

            var promise = (function(){
                if(false){
                    return $.Deferred($scope.dbService.getDatesHavingImagesFromServer()).promise();
                }
                else{
                    console.log('get empty image date array..');
                    return [];
                }
            })();
            var promise2 = $.when(promise).then(function(datesHavingImages){
                $scope.datesHavingImages = datesHavingImages;
                console.log('datesHavingImages:');
                console.log(datesHavingImages);

                //fetch data for this day from server
                return $.Deferred($scope.serverService.getDataForDate($scope.currentDate)).promise();
            });

            var promise3 = $.when(promise2).then(function(data){
                $scope.dateData = data;

                //return $.Deferred($scope.dbService.getImagesForDate2($scope.currentDate)).promise();
                var css = 'background-image:url(\'http://images.nationalgeographic.com/wpf/media-live/photos/000/003/cache/mt-des-voeux_300_600x450.jpg\');' +
                    'background-repeat:no-repeat;' +
                    'background-position:center;' +
                    'background-size:cover;' +
                    'width:100%;' +
                    'height:100%;';
                var categories = [{name:'-'},{name:'-'},{name:'-'},{name:'-'},{name:'-'}];
                var images =[{captionExists:false, name:'DSC120',modified:'2010-02-13:0500',css:css,categories:categories} ,{captionExists:false, name:'DSC120',modified:'2010-02-13:0500',css:css, categories:categories}];
                return images;
            });

            var promise4 = $.when(promise3).then(function(images){
                $scope.currentImages = images;
                console.log('images nedan');
                console.log(images);
                //$scope.doInitJs = true;
                /*if(!$scope.serverService.getDatesHavingText()){
                 return $.Deferred($scope.serverService.getDatesHavingTextFromServer()).promise();
                 }
                 else{
                 return $scope.serverService.getDatesHavingText();
                 }*/
                return [];
            });
            var promise5 = $.when(promise4).then(function(datesHavingText){
                console.log('dates having text and images resolved');
                console.log(datesHavingText);
                $scope.datesHavingText = datesHavingText;
                if(!dbService.initialized()){
                    return $.Deferred(dbService.init()).promise();
                }
                else{
                    return true;
                }
                /*if(!$scope.serverService.getDatesHavingText()){
                 return $.Deferred($scope.serverService.getDatesHavingTextFromServer()).promise();
                 }
                 else{
                 return $scope.serverService.getDatesHavingText();
                 }*/
              
            });
            //TODO: Chrome kraschade när jag bytte dag mitt i transition mellan biler i karusellen. Ev. pausa karusellen vid klick i kalandern. Eller vänta på pågående transition. Hmm?
            //TODO: Fixa en onload event på första imagen i karusellen istället för den timeout på 3(?) sek. som jag nu har
            //TODO: Ta bort prickar i kalenderna (content? som han har lagt dit?) se feb 2012
            //TODO: Fixa bugg i kalenderna som ritar ut tisdag först i veckan när man markerar en dag(?)
            //TODO: Bugg: maintext för 2011 31 finns men i objektet för den dagen hittas ingen maintext, bara factbox
            var evenNextPromise = $.when(promise4).then(function(initDummy){
                
                //TODO: borde inte göras här, behöver man bara göra en gång per inloggning väl?
                return $.Deferred($scope.serverService.getCategoryList()).promise();
            }).then(function(categoryList){
                    console.log('Datahämtning färdig');
                    //console.log(data);

                    console.log($scope.datesHavingText);

                    console.log(categoryList);
                    $scope.imageCategories = categoryList['imageCategories'];
                    if(!$scope.imageCategories){
                        $scope.imageCategories = [];
                    }

                    var keys = Object.keys($scope.dateData);
                    var factBoxIndex = 0;
                    for (var i = 0; i < keys.length; i++) {
                        console.log(keys[i]);
                        var val = $scope.dateData[keys[i]];
                        if(val.clazz && val.clazz === 'factbox'){
                            $scope.factBoxes[factBoxIndex] = val;
                            factBoxIndex++;
                        }
                        // use val
                    }


                    var url = 'http://content.guardianapis.com/search?section=news&from-date=' + $scope.currentDate + '&to-date=' + $scope.currentDate + '&order-by=relevance&format=json&api-key=t7dche4w86sjb3c6g6xh8dms';
                    $.ajax({
                        url: url,
                        dataType: 'jsonp',
                        success: function (data) {
                            // $('body').html(data);
                            // console.log(data);
                            var results = data.response.results;
                            for(var i = 0; i < results.length;i++){
                                //console.log(results[i].webTitle);
                                if(i < 5){
                                    var item = $('<p style="text-indent:-13px;margin-bottom:20px;"><i class="icon-chevron-sign-right" style="margin-right: -5px;color:#FF9999";"></i><span style="font-size:14px;line-height: 20px;">' + results[i].webTitle + '</span></a>');
                                    $('#newsContainer').append(item);

                                }
                            }
                        }


                    });
                    var mainTextForToday =  'maintext_' + $scope.currentDate;
                    if($scope.dateData[mainTextForToday]){
                        console.log('mainTextForToday finns!');
                        $scope.mainText = {};
                        $scope.mainText.body = $scope.dateData[mainTextForToday].text;
                        $scope.mainText.clazz = $scope.dateData[mainTextForToday].clazz;
                        $scope.mainTextExists = true;
                        if($scope.dateData[mainTextForToday].header){
                            $scope.mainText.header = $scope.dateData[mainTextForToday].header;
                            $scope.mainTextHeaderExists = true;
                        }
                        console.log('HÄR: ' + $scope.mainText.body);

                    }
                    $scope.$digest();



                });
        }

    }
    $scope.saveMainText = function(event){
        console.log('saveMainText');
        $scope.showMainTextButton = false;

        // console.log(textNode.text());
        $scope.cloudMine.set('maintext_' + $scope.currentDate, {
            text: $scope.mainText.body,
            header: $scope.mainText.header,
            date: $scope.currentDate,
            clazz:  $scope.mainText.clazz

        }).on('success', function(data, response) {
                console.log('Yes saved!!! ' + 'maintext_' + $scope.currentDate);
                var todayHavingText = {};
                var imageHavingText =  $scope.datesHavingImages.indexOf($scope.currentDate) >= 0 ? true: false;
                if($scope.datesHavingText[$scope.currentDate]){
                    todayHavingText =  $scope.datesHavingText[$scope.currentDate];
                }
                todayHavingText.maintext = true;
                $scope.datesHavingText[$scope.currentDate] = todayHavingText;
                var dateNode = $('.fc-today').children()[0];
                var jqueryDateNode = $(dateNode);
                var classy = '';
                if(todayHavingText.factbox && imageHavingText ){
                    classy = 'allTextImgBorder';
                }
                else if(imageHavingText){
                    classy = 'maintextImgBorder';
                }
                else if(todayHavingText.factbox){
                    classy = 'factboxMaintextBorder';
                }
                else{
                    classy = 'maintextBorder';
                }
                //jqueryDateNode.css('box-shadow', 'none');
                jqueryDateNode.addClass(classy);

            });


        event.stopPropagation();
    }

    $scope.showMainTextButtonFunc = function(){
        $scope.showMainTextButton = true;
        console.log('showmaintext');
    }
    //TODO: Vid update på maintext sparas inte clazzvariabeln
    $scope.createMainTextNode = function(savedData){
        var mainTextForToday =  'maintext_' + $scope.currentDate;
        var text = 'Skriv text här';
        if(savedData){
            text = savedData[mainTextForToday].text;
        }
        var div =  $('<div class="textNode bgHuman" style="width:100%"></div>') ;
        var div2 =  $('<div class="bgOrange" style="width:100%;margin: 0px auto" contenteditable="true" spellcheck="false"></div>') ;
        var textNode = $('<div id="mainText" style="font-size:15px;padding:20px;padding-left: 250px;padding-right: 250px;line-height: 22px;color:black" class="textNode">' + text + '</div>');
        var textContainer = $('#textContainer');
        div2.append(textNode);
        div.append(div2);
        textContainer.append(div);
        div2.blur(function(){
            // console.log(textNode.text());
            $scope.cloudMine.set(mainTextForToday, {
                text: textNode.text(),
                date: $scope.currentDate
            }).on('success', function(data, response) {
                    // console.log('Yes saved!!!' + mainTextForToday);
                });
        });
        textContainer.addClass('textContainerVisible');
        textContainer.css('display', 'block');
        // console.log(textContainer);
    }
    $scope.createMainTextNodeWithHeader = function(savedData){
        var mainTextForToday =  'maintext_' + $scope.currentDate;
        var text = 'Skriv text här';
        var header = 'Skriv rubrik här';
        if(savedData){
            text = savedData[mainTextForToday].text;
            header = savedData[mainTextForToday].header;
        }
        var div =  $('<div class="textNode bgHuman" style="width:100%"></div>') ;
        var div2 =  $('<div class="bgOrange" style="width:100%;margin: 0px auto" contenteditable="true" spellcheck="false"></div>') ;
        var textNode = $('<div id="mainText" style="font-size:15px;padding-bottom:20px;padding-left: 250px;padding-right: 250px;line-height: 22px;color:black" class="textNode"><div style="width:100%;height:100%;background-color: yellow" class="mittballe">' + text + '</div></div>');
        var textContainer = $('#textContainer');
        var header = $('<p class="textNode" style="text-align: center;font-size:15px;line-height: 55px;padding: 0px;color:black;font-weight: 600">' + header + '</p>');
        div2.append(header);
        div2.append(textNode);
        div.append(div2);
        textContainer.append(div);

        header.blur(function(){
            //console.log(header.text());
            $scope.cloudMine.set(mainTextForToday, {
                header: header.text(),
                text: textNode.text(),
                date: $scope.currentDate
            }).on('success', function(data, response) {
                    //  console.log('Yes saved!!!' + mainTextForToday);
                });
        });
        textContainer.addClass('textContainerVisible');
        textContainer.css('display', 'block');
    }




}
