function DatabaseService(){
    this.db = null;
    this.dbName = "photosDB12";
    this.tableName = "photosTable12";
    //this.init();
    this.initialized = false;
}
DatabaseService.prototype.init = function(app){
    var that = this;
    return function(dfd){
        var request = window.indexedDB.open(that.dbName, 1);
        request.onerror = function(event) {
            alert("Du måste tillåta sparande av data i din lokala databas för att sajten ska fungera.");
        };
        request.onsuccess = function(event) {
            that.db = request.result;
            console.log('databaseService.onsuccess');
            that.initialized = true;

            dfd.resolve();
        };
        request.onupgradeneeded = function(event) {
            // console.log('databaseService.onupgradeneeded');
            var db = event.target.result;
            var objectStore = db.createObjectStore(that.tableName, { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("date", "date", { unique: false });
            objectStore.createIndex("imageKey", "imageKey", { unique: false }); //TODO: Really, should be true, but what if user adds same image several times?
        };
    }
}
DatabaseService.prototype.saveArray = function(array){
    var that = this;
    alert(array);
    return function(dfd){
            var transaction = that.db.transaction([that.tableName], "readwrite");
            // Do something when all the data is added to the database.
            transaction.oncomplete = function(event) {
                //alert("All done!");
                //  console.log('SaveArray() finished');

               dfd.resolve();
            };
    
            transaction.onerror = function(event) {
                alert('error');
            };
    
            var objectStore = transaction.objectStore(that.tableName);
            for (var i in array) {
                var request = objectStore.add(array[i]);
                request.onsuccess = function(event) {
                    //event.target.result == array[i].id;
                    //  console.log(event.target.result);
                };
            }
            alert('after loop in saveArray()');
    }
  
}

DatabaseService.prototype.getImagesForDate = function(date){
    console.log('Date in getImagesForDate: ' + date);
    var that = this;
    return function(df){
        // console.log('dbService.getImagesForDate()');

        var trans =  that.db.transaction(that.tableName);
        var index = trans.objectStore(that.tableName).index('date');
        var imagesForDate = [];
        //var showImageFunc = app.getImagesForDateCallback(date, imagesForDate);
        trans.oncomplete = function(){
            console.log(imagesForDate);
            df.resolve(imagesForDate);
        }
        var jj = 0;
        var singleKeyRange = IDBKeyRange.only(date);
        //var boundKeyRange = IDBKeyRange.bound(date, seconddate, false, false);
        index.openCursor(singleKeyRange).onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                imagesForDate[jj] = cursor.value;
                jj++;
                cursor.continue();
            }
        };
    }

}

DatabaseService.prototype.isInitialized = function(){
  return this.initialized;
}

