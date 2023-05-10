const mongoClient = require('mongodb').MongoClient;

const state = {
    db:null
};

module.exports.connect = function(done){

    const url = 'mongodb://127.0.0.1:27017/';
    const dbName = 'shopping';

    mongoClient.connect(url,(err,data) => {

        if(err){
            console.log(err);
            return done(err);
        }
        state.db = data.db(dbName);
        console.log(state.db);
        done()
    })
}

module.exports.get = function(){
    return state.db;
}