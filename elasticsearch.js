'use strict';

//var env = require('node-env-file');
var fs = require('fs');
var elasticsearch = require('elasticsearch');

//env('.env');

const es = elasticsearch.Client({
    //host: process.env.BONSAI_URL,
    host: '35.204.75.52:9200', 
    log: 'info'
});

const INDEX_NAME = 'players';
const INDEX_TYPE = 'details';

/*
 * Since our dummy data is not a valid json file, we can't simply require() it.
 * This function tricks require() to read and export the content of the file, instead of parsing it
 */

function readDataFile(){
    require.extensions['.json'] = function (module, filename) {
        module.exports = fs.readFileSync(filename, 'utf8');
    };

    //return require("./data/players.json")
    return require("./data/productstest2.json")
}

function indexExists() {
    return es.indices.exists({
        index: INDEX_NAME
    });
}

function createIndex(){
    return es.indices.create({
        index: INDEX_NAME
    });
}

function deleteIndex(){
    return es.indices.delete({
        index: INDEX_NAME
    });
}

function indexMapping(){
    return es.indices.putMapping({
        index: INDEX_NAME,
        type: INDEX_TYPE,
        body: {
            properties: {
                product_sku: {
                    type: "long"
                    },		    
                product_name: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple"
                }
		    /*
		    */
             }
        }
    });
}

function addDocument(document){
    return es.index({
        index: INDEX_NAME,
        type: INDEX_TYPE,
        body: {
            product_sku: document.product_sku,
            product_name: document.product_name
//            prtype: document.prtype,
//            price: document.price,
//            upc: document.upc,
//            shipping: document.shipping,
//            description: document.description,
//            manufacturer: document.manufacturer,
//            model: document.model,
//	    url: document.url,
//            image: document.image
        },
        refresh: "true"
    });
}

function bulkAddDocument(){
    return  es.bulk({
        index: INDEX_NAME,
        type: INDEX_TYPE,
        body: [
            readDataFile()
        ],
        refresh: "true"
    });
}

function getSuggestions(text, size){
    return es.search({
        index: INDEX_NAME,
        type: INDEX_TYPE,
        body: {
            suggest: {
                productNameSuggester: {
                    prefix: text,
                    completion: {
                        field: "product_name",
                        size: size,
                        fuzzy: {
                            fuzziness: "auto"
                        }
                    }
                }
            }

        }
    });
}

function getStat(id){
    return es.search({
        index: INDEX_NAME,
        type: INDEX_TYPE,
        body: {
            query: {
                term: {
                    "_id": id
                }
            }
        }
    });
}

exports.deleteIndex = deleteIndex;
exports.createIndex = createIndex;
exports.indexExists = indexExists;
exports.indexMapping = indexMapping;
exports.addDocument = addDocument;
exports.bulkAddDocument = bulkAddDocument;
exports.getSuggestions = getSuggestions;
exports.getStat = getStat;
