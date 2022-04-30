/*

Utility functions

*/

// builds a url
function url(req, urlAdditions) {
    var base_url = req.protocol + "://" + req.get('host');
    var ext_url = urlAdditions.join('');
    return base_url + ext_url;
}

// builds a 'self' boat url from an array of boat objects
function selfUrlResourceId(req, urlAdditions, boats) {
    var base_url = req.protocol + "://" + req.get('host');
    var ext_url = urlAdditions.join('');
    for (i=0; i<boats.length; i++) {
        boats[i].self = base_url + ext_url + boats[i].id;
    }
}

function newJsonObject(someJSON, keys) {
    var newJSON = {}
    for (let key of keys) {
        if (someJSON.hasOwnProperty(key)) {
            newJSON[key] = someJSON[key];
        }
    }
    return newJSON;
}

function logErr(err) {
    console.log('Error in function: ' + logErr.caller);
    console.log(err);
}

function isEmpty(obj) {

    var arrayConstructor = [].constructor;
    var objectConstructor = ({}).constructor;

    if (obj == undefined ||
        obj == null      ||
        obj === {}       ||
        obj === []          ) {
        return true;
    }

    if (obj.constructor === arrayConstructor) {
        return obj.length == 0;
    }

    if (obj.constructor === objectConstructor) {
        return Object.keys(obj).length === 0;
    }

    logErr("I don't know what type of object this is");
    return true;
}

function printMany(print, numberOfTimes) {
    for (i=0; i<numberOfTimes; i++) {
        console.log(print);
    }
}

// return true if the JSON object contains all keys, false otherwise
function contains_keys(someJson, keys) {
    for (let key of keys) {
        if (!someJson.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

function value_in_array(value, someArray) {
    for (i=0; i<someArray.length; i++) {
        if (value === someArray[i]) {
            return true;
        }
    }
    return false;
}

module.exports = {
    url,
    logErr,
    isEmpty,
    selfUrlResourceId,
    printMany,
    contains_keys,
    newJsonObject,
    value_in_array
};
