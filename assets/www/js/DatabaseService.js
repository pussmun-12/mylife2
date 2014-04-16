function DatabaseService(){
    this.db = null;
    this.dbName = "photosDB11";
    this.tableName = "photosTable11";
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
            alert('On success!');
            dfd.resolve();
        };
        request.onupgradeneeded = function(event) {
            // console.log('databaseService.onupgradeneeded');
            var db = event.target.result;
            var objectStore = db.createObjectStore(that.tableName, { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("modifiedDate", "modifiedDate", { unique: false });
            objectStore.createIndex("imageKey", "imageKey", { unique: false }); //TODO: Really, should be true, but what if user adds same image several times?
        };
    }
}
DatabaseService.prototype.saveArray = function(array){
    var that = this;
 
        var transaction = that.db.transaction([that.tableName], "readwrite");
        // Do something when all the data is added to the database.
        transaction.oncomplete = function(event) {
            //alert("All done!");
            //  console.log('SaveArray() finished');
           alert('all done');
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
  
}

DatabaseService.prototype.isInitialized = function(){
  return this.initialized;
}

