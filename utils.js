// Utility functions

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

function makeBoatFromBody(reqBody) {
    return {"name": reqBody.name, "type": reqBody.type, "length": reqBody.length, "loads": []};
}

function logErr(err) {
    console.log('Error in function: ' + logErr.caller);
    console.log(err);
}

function isEmpty(obj) {

    var arrayConstructor = [].constructor;
    var objectConstructor = ({}).constructor;

    if (obj == undefined) {
        return true;
    }

    if (obj == null) {
        return true;
    }

    if (obj === {}) {
        return true;
    }

    if (obj === []) {
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

module.exports = {
    url, 
    makeBoatFromBody, 
    logErr,
    isEmpty,
    selfUrlResourceId,
    printMany
};