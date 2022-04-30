const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const utils = require('./utils');
const db = require('./db');
const { Datastore } = require('@google-cloud/datastore');
const router = express.Router();
const req_handler = require('./request_handler');

app.enable('trust proxy');
app.use(bodyParser.json());

/*******************************
    BOATS
*******************************/

router.post('/boats', async function(req, res) {
    console.log('POST /boats');
    return await req_handler.post_boat(req, res);
});

router.get('/boats/:id', async function(req, res) {
    console.log('GET /boats/:id');
    return await req_handler.get_boat(req, res);
});

router.patch('/boats/:id', async function(req, res) {
    console.log('PATCH /boats/:id');
    return await req_handler.patch_boat(req, res);
});

router.put('/boats/:id', async function(req, res) {
    console.log('PUT /boats/:id');
    return await req_handler.put_boat(req, res);
});

router.delete('/boats/:id', async function(req, res) {
    console.log('DELETE /boats/:id');
    return await req_handler.delete_boat(req, res);
});

/*

router.get('/boats/:id', async function(req, res) {
    console.log('\n\nGET /boats/:id');
    var boat = await db.getBoat(req.params.id);
    if (utils.isEmpty(boat)) {
        res.status(404).send({"Error": "No boat with this boat_id exists"});
    } else {
        boat.self = utils.url(req, ['/boats/', boat.id]);
        res.status(200).send(boat);
    }
});

router.get('/boats', async function(req, res) {
    console.log('\n\nGET /boats');
    var cursor = undefined;
    var boats = {};

    if (Object.keys(req.query).includes("cursor")) {
        cursor = req.query.cursor;
    }

    try {
        var results = await db.getBoats(cursor);
    } catch (err) {
        utils.logErr(err);
        res.status(500).send();
        return;
    }

    utils.selfUrlResourceId(req, ['/boats/'], results[0]);
    boats.boats = results[0];

    if (results[1].moreResults !== Datastore.NO_MORE_RESULTS) {
        console.log('no more results');
        boats.next = utils.url(req, ['/boats/?cursor=', results[1].endCursor]);
    }

    res.status(200).send(boats);
});

router.get('/boats/:boat_id/loads', async function(req, res) {
    console.log('\n\nGET /boats/:boat_id/loads');
    
    var boat = await db.getBoat(req.params.boat_id);
    if (utils.isEmpty(boat)) {
        res.status(404).send({"Error": "No boat with this boat_id exists"});
        return;
    }

    var loads = await db.getLoadsFromBoat(boat, req);
    res.status(200).send({"loads": loads});
});

router.delete('/boats/:id', async function(req, res) {
    console.log('\n\nDELETE /boats/:id');
    
    // does boat resource exist?
    var boat = await db.getBoat(req.params.id);
    console.log('Boat to be deleted is');
    console.log(boat);
    if (utils.isEmpty(boat)) {
        res.status(404).send({"Error": "No boat with this boat_id exists"});
        return;
    }

    // update all loads on boat
    var loads = await db.getLoadsFromBoat(boat, req);
    for (i=0; i<loads.length; i++) {
        loads[i].carrier = null;
        let success = await db.updateLoad(JSON.parse(JSON.stringify(loads[i])));
        console.log('load updated: ' + success);
    }

    // delete boat resource
    var deleted = await db.deleteResource(db.BOAT, boat);
    if (!deleted) {
        console.log('ERROR: Boat was not deleted');
        res.status(500).send({"Error": "Internal database error"});
        return;
    }

    res.status(204).send();
});
*/

app.use(router);

// Listening on port ...
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = app;
