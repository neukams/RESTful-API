const db = require('./db');
const utils = require('./utils');
const json2html = require('node-json2html');
const json2html_templates = require('./json2html_templates');

const APPJSON = 'application/json';
const CONTENTTYPE = 'Content-Type';
const ACCEPT = 'Accept';
const TXTHTML = 'text/html'
const NEW_BOAT_ATTRIBUTES = ['name', 'length', 'type'];
const ALL_BOAT_ATTRIBUTES = ['name', 'length', 'type', 'id'];

/**
 * Handles POST requests to create a new Boat resource
 * 
 * @param {request}     req     request object from the server route handler
 * @param {response}    res     response object from the server route handler
 * 
 * Responses
 *  201 Created
 *  400 Bad Request     Request headers are not formatted correctly, or request Body is missing required attributes for Boat resource
 * 
 */
 async function post_boat(req, res) {

    // valid Content-Type?
    if (req.get(CONTENTTYPE) !== APPJSON) {
        res.status(415).send({"Error": "The allowed values for request header " + CONTENTTYPE + " are " + [APPJSON]})
        return;
    }

    // valid Accept?
    if (req.get(ACCEPT) !== APPJSON) {
        res.status(406).send({"Error": "The allowed values for request header " + ACCEPT + " are " + [APPJSON]})
        return;
    }

    // required Boat attributes?
    if (!utils.contains_keys(req.body, NEW_BOAT_ATTRIBUTES)) {
        res.status(400).send({"Error": "The request object is missing at least one of the required attributes"});
        return;
    }

    // all boat attributes are good?
    if (!utils.validBoatData(req.body)) {
        res.status(400).send({"Error": "The provided attribute(s) do not conform to the boat data model, either data types or data length."})
        return;
    }

    // boat name unique?
    var results = await db.getBoatByAttribute('name', '=', req.body.name);
    console.log('Duplicate boat name on POST?');
    console.log(results);
    if (!utils.isEmpty(results)) {
        res.status(403).send({"Error": "This boat name is already taken"});
        return;
    }

    // create boat
    var boat = utils.newJsonObject(req.body, NEW_BOAT_ATTRIBUTES);
    boat = await db.createBoat(boat);
    boat.self = utils.url(req, ['/boats/', boat.id]);
    res.status(201).send(boat);
}

/**
 * Handles GET requests to get a Boat resource
 * 
 * @param {request}     req     request object from the server route handler
 * @param {response}    res     response object from the server route handler
 * 
 * Responses
 *  200 OK
 *  400 Bad Request     Request headers are invalid
 *  404 Not Found       Boat id not found
 * 
 */
 async function get_boat(req, res) {

    /*// valid Content-Type header value?
    if(!utils.value_in_array(req.get(CONTENTTYPE), [APPJSON, 'application/json; charset=utf-8'])) {
        console.log(req.get(CONTENTTYPE));
        res.status(415).send({"Error": "The allowed values for request header " + CONTENTTYPE + " are " + [APPJSON]})
        return;
    }*/

    // valid Accept header value?
    if (!utils.value_in_array(req.get(ACCEPT), [APPJSON, TXTHTML])) {
        res.status(406).send({"Error": "The allowed values for request header " + ACCEPT + " are " + [APPJSON, TXTHTML].join(', ')});
        return;
    }

    // query for boat id
    var boat = await db.getBoat(req.params.id);

    // boat not found?
    if (utils.isEmpty(boat)) {
        res.status(404).send({"Error": "No boat with this id exists"});
        return;
    }

    boat.self = utils.url(req, ['/boats/', boat.id]);

    // format response (JSON or HTML)
    if (req.get('Accept') === APPJSON) {
        console.log('Returing JSON');
    } else if (req.get('Accept') === TXTHTML) {
        console.log('Returning HTML');
        boat = json2html.render(boat, json2html_templates.boat);
        res.set("Content", "text/html");
        res.status(200).send(boat);
        return;
    }
    
    res.status(200).send(boat);
}

/**
 * Handles PATCH requests to update a Boat resource
 * 
 * @param {request}     req     request object from the server route handler
 * @param {response}    res     response object from the server route handler
 * 
 * Responses
 *  200 OK
 *  400 Bad Request     Request headers are invalid
 *  404 Not Found       Boat id not found
 * 
 */
 async function patch_boat(req, res) {

    // valid Content-Type header value?
    if(req.get(CONTENTTYPE) !== APPJSON) {
        res.status(415).send({"Error": "The allowed values for request header " + CONTENTTYPE + " are " + [APPJSON]})
        return;
    }

    // valid Accept header value?
    if (!utils.value_in_array(req.get(ACCEPT), [APPJSON, TXTHTML])) {
        res.status(406).send({"Error": "The allowed values for request header " + ACCEPT + " are " + [APPJSON, TXTHTML].join(', ')});
        return;
    }

    // boat name unique?
    if (req.body.name) {
        var results = await db.getBoatByAttribute('name', '=', req.body.name);
        if (!utils.isEmpty(results)) {
            res.status(403).send({"Error": "This boat name is already taken"});
            return
        }
    }

    // get Boat with id
    var boat = await db.getBoat(req.params.id);
    
    // boat not found?
    if (utils.isEmpty(boat)) {
        res.status(404).send({"Error": "No boat with this id exists"});
        return;
    }

    // get the attributes to PATCH
    var boat_updates = utils.newJsonObject(req.body, ALL_BOAT_ATTRIBUTES);
    for (let key in boat_updates) {
        boat[key] = boat_updates[key];
    }

    // boat has at least one attribute to update?
    if (utils.isEmpty(boat_updates)) {
        res.status(400).send({"Error": "At least one valid boat attribute must be provided"});
        return;
    }

    // provided boat attributes are good?
    if (!utils.validBoatDataProvided(boat_updates)) {
        res.status(400).send({"Error": "The provided attribute(s) do not conform to the boat data model, either data types or data length."})
        return;
    }

    // save to DB
    var saved = await db.updateBoat(boat);
    if (!saved) {
        res.status(500).send({"Error": "Internal server error"});
        return;
    }
    
    // return updated Boat
    boat = await db.getBoat(req.params.id);
    boat.self = utils.url(req, ['/boats/', boat.id]);
    res.status(200).send(boat);
}

/**
 * Handles PUT requests to overwrite a Boat resource
 * 
 * @param {request}     req     request object from the server route handler
 * @param {response}    res     response object from the server route handler
 * 
 * Responses
 *  303 See Other       Success, make a GET request at the url in the Location header to see results
 *  400 Bad Request     Request headers are invalid
 *  404 Not Found       Boat id not found
 * 
 */
 async function put_boat(req, res) {

    // valid Content-Type header value?
    if(req.get(CONTENTTYPE) !== APPJSON) {
        //res.status(400).send({"Error": "The allowed values for request header " + CONTENTTYPE + " are " + [APPJSON]})
        res.status(415).send({"Error": "The allowed values for request header " + CONTENTTYPE + " are " + [APPJSON]})
        return;
    }

    // valid Accept header value?
    if (!utils.value_in_array(req.get(ACCEPT), [APPJSON, TXTHTML])) {
        res.status(406).send({"Error": "The allowed values for request header " + ACCEPT + " are " + APPJSON});
        return;
    }

    // boat resource contains all attributes?
    if (!utils.contains_keys(req.body, NEW_BOAT_ATTRIBUTES)) {
        res.status(400).send({"Error": "Missing required resource attributes"});
        return;
    }

    // all boat attributes are good?
    if (!utils.validBoatData(req.body)) {
        res.status(400).send({"Error": "The provided attribute(s) do not conform to the boat data model, either data types or data length."})
        return;
    }

    // boat name unique?
    var results = await db.getBoatByAttribute('name', '=', req.body.name);
    console.log('Duplicate boat names from PUT request');
    console.log(results);
    if (!utils.isEmpty(results)) {
        res.status(403).send({"Error": "This boat name is already taken"});
        return
    }

    // get Boat with id
    var boat = await db.getBoat(req.params.id);
    
    // boat not found?
    if (utils.isEmpty(boat)) {
        res.status(404).send({"Error": "No boat with this id exists"});
        return;
    }

    // get the attributes to PUT
    var boat_updates = utils.newJsonObject(req.body, NEW_BOAT_ATTRIBUTES);
    for (let key in boat_updates) {
        boat[key] = boat_updates[key];
    }

    // save to DB
    var id = boat.id;
    var saved = await db.updateBoat(boat);
    if (!saved) {
        res.status(500).send({"Error": "Internal server error"});
        return;
    }
    
    console.log(boat);
    res.location(utils.url(req, ['/boats/', String(id)]));
    res.contentType('application/json');
    res.status(303).send({"Success": "Make GET request at Location to see result"});
}

/**
 * Handles DELETE requests to delete a Boat resource
 * 
 * @param {request}     req     request object from the server route handler
 * @param {response}    res     response object from the server route handler
 * 
 * Responses
 *  204 No Content      Success, boat deleted
 *  400 Bad Request     Request headers are invalid
 *  404 Not Found       Boat id not found
 * 
 */
 async function delete_boat(req, res) {

    /*// valid Content-Type header value?
    if(req.get(CONTENTTYPE) !== APPJSON) {
        //res.status(400).send({"Error": "The allowed values for request header " + CONTENTTYPE + " are " + [APPJSON]})
        res.status(415).send({"Error": "The allowed values for request header " + CONTENTTYPE + " are " + [APPJSON]})
        return;
    }*/

    // valid Accept header value?
    if (!utils.value_in_array(req.get(ACCEPT), [APPJSON, TXTHTML])) {
        res.status(406).send({"Error": "The allowed values for request header " + ACCEPT + " are " + APPJSON});
        return;
    }

    // get Boat with id
    var boat = await db.getBoat(req.params.id);
    
    // boat not found?
    if (utils.isEmpty(boat)) {
        res.status(404).send({"Error": "No boat with this id exists"});
        return;
    }

    // delete
    var deleted = await db.deleteResource('Boats', boat);
    if (!deleted) {
        res.status(500).send({"Error": "Internal server error"});
        return;
    }
    
    res.status(204).send();
}

module.exports = {
    post_boat,
    get_boat,
    patch_boat,
    put_boat,
    delete_boat
}
