var express = require('express');
var path = require('path');
//var logger = require('./logdna');
var elasticsearch = require('./elasticsearch');

const APP_PORT = 3000;

var index = require('./routes/index');
var suggest = require('./routes/suggest');
var search = require('./routes/stat');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// static folder setup
app.use(express.static(path.join(__dirname, 'public')));

elasticsearch.indexExists().then(

    //delete index if it exist
    function(status){
        if(status){
            return elasticsearch.deleteIndex();
        }
    }
).then(
    function(){

//        logger.logger.log('Index deleted');

        //create our index
        return elasticsearch.createIndex().then(
            function(){

  //              logger.logger.log('Index created');

                //Update our index with mappings
                elasticsearch.indexMapping().then(
                    function(){
    //                    logger.logger.log('Index mapping has been updated');

                        //bulk add our dummy data in ./data/players.json
                        elasticsearch.bulkAddDocument().then(
                            function () {
      //                          logger.logger.log('Dummy documents have been bulk imported');
                            },
                            function (err) {
        //                        logger.logger.error('Could not import dummy documents', err);
                            }
                        )
                    },
                    function(err){
          //              logger.logger.error('Could not create index', err);
                    }

                )
            },
            function (err){

            //    logger.logger.error('Could not create index', err);
            }
        );
    }
);

// create our app endpoints
app.get('/', index);
app.get('/suggest/:text/:size', suggest);
app.get('/stat/:id/', search);

app.listen(APP_PORT, function(){
    //logger.logger.log('App is running');
});
