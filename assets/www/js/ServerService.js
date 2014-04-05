/**
 * Created with IntelliJ IDEA.
 * User: helena
 * Date: 10/14/13
 * Time: 8:18 em
 * To change this template use File | Settings | File Templates.
 */
function ServerService(server){
    this.cloudMine = server;
    this.data;
    this.categories;
}
ServerService.prototype.getDataForDate = function(date){
    var that = this;
    return function(dfd){
        //console.log('function dfd');
        that.cloudMine.search('[date = "' + date + '"]').on('success', function(data, response) {
            // console.log('Search is finished');
            //  console.log(data);
            that.data = data;
            dfd.resolve(data);
            // All Hondas made since Y2K
        }).on('error', function(response){
                console.log('Search with error');
                console.log(response);
                that.data = [];
                dfd.resolve([]);
            });
    }
}

ServerService.prototype.getDataForCategories = function(categories){
    var that = this;
    return function(dfd){
        //console.log('function dfd');
        var valle = 'categories[';
        for(var i = 0; i < categories.length;i++){
            if(i == categories.length - 1 )
             valle += 'name="' + categories[i] + '"]';
            else
                valle +=  'name="' + categories[i] + '" ,';
        }
        console.log('Valle: ' + valle);
        that.cloudMine.search(valle).on('success', function(data, response) {
            console.log('Search is finished-------> CATEGORIES');
            console.log(data);
            that.data = data;
            dfd.resolve(data);
            // All Hondas made since Y2K
        }).on('error', function(response){
                console.log('Search with error------> CATEGORIES');
                console.log(response);
                that.data = [];
                dfd.resolve([]);
            });
    }
}


 /* $scope.cloudMine.search('categories[name="Singapore"],categories[name="Kasper"] ').on('success', function(data, response) {
            console.log('Search is finished-------> CATEGORIES');
            console.log(data);
            that.data = data;
            dfd.resolve(data);
            // All Hondas made since Y2K
        }).on('error', function(response){
                console.log('Search with error------> CATEGORIES');
                console.log(response);
                that.data = [];
                dfd.resolve([]);
            });*/

ServerService.prototype.getCategoryList = function(){
    var that = this;
    return function(dfd){
        //console.log('function dfd');
        that.cloudMine.get('imageCategories').on('success', function(data, response) {
            // console.log('Search is finished');
            //  console.log(data);
            that.categories = data;
            dfd.resolve(data);
            // All Hondas made since Y2K
        }).on('error', function(response){
                console.log('Get categories with error:');
                console.log(response);
                that.categories = [];
                dfd.resolve([]);
            });
    }
}

ServerService.prototype.getCategoriesForImage = function(imageKey){
    var image = this.data[imageKey];
    if(image){
        return image.categories;
    }
    return null;
}

ServerService.prototype.getCaptionForImage = function(imageKey){
    var image = this.data[imageKey];
    if(image){
        return image.caption;
    }
    return null;
}

ServerService.prototype.setCategoryList = function(categories){
    var that = this;
    return function(dfd){
        //console.log('function dfd');
        that.cloudMine.set('imageCategories', categories).on('success', function(data, response) {
            console.log('Search is finished');
            //  console.log(data);
            that.categories = data;
            dfd.resolve(data);
            // All Hondas made since Y2K
        }).on('error', function(response){
                console.log('Get categories with error:');
                console.log(response);
                //that.categories = [];
                dfd.resolve(null);
            });
    }
}

ServerService.prototype.saveFactBox = function(factbox){
    var that = this;
    return function(dfd){
        //console.log('function dfd');
        that.cloudMine.set(factbox.id, factbox).on('success', function(data, response) {
            console.log('Search is finished');
            //  console.log(data);
            //that.categories = data;
            dfd.resolve(data);
            // All Hondas made since Y2K
        }).on('error', function(response){
                console.log('Save factbox with error:');
                console.log(response);
                //that.categories = [];
                dfd.resolve(null);
            });
    }
}

ServerService.prototype.getImagesForCategory = function(category){
    var that = this;
    return function(dfd){
        that.cloudMine.search('categories[name="' + category + '"]').on('success', function(data, response) {
            console.log('Search is finished');
            console.log(data);
            that.data = data;
            dfd.resolve(data);
            // All Hondas made since Y2K
        }).on('error', function(response){
                console.log('Search with error');
                console.log(response);
                that.data = [];
                dfd.resolve([]);
            });
    }
}

ServerService.prototype.deleteFactBox = function(factbox){
    var that = this;
    return function(dfd){
        //console.log('function dfd');
        that.cloudMine.destroy(factbox.id).on('success', function(data, response) {
            console.log('Deleted: ' + factbox.id );
            //  console.log(data);
            //that.categories = data;
            dfd.resolve(data);
            // All Hondas made since Y2K
        }).on('error', function(response){
                console.log('Save factbox with error:');
                console.log(response);
                //that.categories = [];
                dfd.resolve(null);
            });
    }
}

ServerService.prototype.getDatesHavingTextFromServer = function(){
    var that = this;
    return function(dfd){
        $.ajax({
            beforeSend: function (request)
            {
                request.setRequestHeader("X-CloudMine-SessionToken", that.cloudMine.options.session_token);
                request.setRequestHeader("X-CloudMine-ApiKey", that.cloudMine.options.apikey);
            },
            url: 'https://cloudmine.me/v1/app/' + that.cloudMine.options.appid + '/user/search?q=[clazz%20=%20%22factbox%22 or clazz%20=%20%22maintext%22]&result_only=true&f=getDatesWithTxt',
            //dataType: 'jsonp',

            success: function (data) {
                console.log('success with dates having text:');
                console.log(data.result.datesWithText);
                that.datesHavingText = data.result.datesWithText;
                dfd.resolve(data.result.datesWithText);

            }
        });
    }
}

ServerService.prototype.getDatesHavingText = function(){
    return this.datesHavingText;
}




