/*
    This file handles all db interactions
*/

const projectId = 'assignment-5-advanced-rest';
const {Datastore} = require('@google-cloud/datastore');
const { entity } = require('@google-cloud/datastore/build/src/entity');
const datastore = new Datastore({projectId:projectId});
const BOAT = 'Boats';
const utils = require('./utils');


/*******************************
    DATASTORE STUFF
*******************************/

function fromDatastore(item) {
    item.id = Number(item[Datastore.KEY].id);
    delete item[Datastore.KEY];
    return item;
}

function fromDatastoreArr(arr) {
    return arr.map((i) => fromDatastore(i));
}

/*******************************
    BOATS
*******************************/

async function createBoat(boat) {
    console.log('db.js -> createBoat()');

    const key = datastore.key(BOAT);

    try {
        await datastore.save({"key": key, "data": boat});
        boat.id = Number(key.id);
    } catch (err) {
        utils.logErr(err);
        return {};
    }

    console.log(key);
    console.log(boat);
    
    return boat;
}

async function getBoat(id) {
    console.log('getBoat(' + id + ')');
    var boat;
    const key = datastore.key([BOAT, Number(id)]);
    const query = datastore.createQuery(BOAT);
    query.filter('__key__', key);
    boat = await datastore.runQuery(query);
    boat = boat[0];

    if (utils.isEmpty(boat)) {
        return {};
    }
    
    return fromDatastore(boat[0]);
}

async function getBoats(cursor) {
    console.log('getBoats()');
    var boats;
    const query = datastore.createQuery(BOAT).limit(3);
    if (cursor) {
        console.log('cursor found');
        query.start(cursor);
    }
    boats = await datastore.runQuery(query);
    console.log('get boats with cursor');
    console.log(boats);
    fromDatastoreArr(boats[0])
    return boats;
}

// updates a Boat
// removes id or self properties if found
// assumes the resource is valid otherwise
async function updateBoat(boat) {
    console.log('updateBoat()');

    const transaction = datastore.transaction();
    const key = datastore.key([BOAT, Number(boat.id)]);

    try {
        delete boat.id;
        delete boat.self;
    } catch {
        // do nothing, boat.self attribute does not exist, which is what we want
    }
    
    try {
        await transaction.run();
        await transaction.save({"key": key, "data": boat}); // a save should ..
        await transaction.commit();
        console.log('saved');
    } catch (err) {
        await transaction.rollback();
        utils.logErr(err);
        console.log('not saved');
        return false;
    }

    return true;
}

/*******************************
    RESOURCE AGNOSTIC
*******************************/

async function deleteResource(collection, resource) {
    console.log('deleteResource(collection, resource)');
    console.log('collection=' + collection);
    console.log('resource');
    console.log(resource);
    
    const key = datastore.key([collection, Number(resource.id)]);
    const transaction = datastore.transaction();

    try {
        await transaction.run();
        await transaction.delete(key);
        await transaction.commit();
    } catch (err) {
        utils.logErr(err);
        return false;
    }
    return true;
}


module.exports = {
    createBoat,
    getBoat,
    getBoats,
    updateBoat,
    deleteResource
};
