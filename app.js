var db = require('./dbcon')
var garden = require('./garden')
var child_process = require('child_process')

console.time("processTime:")
/**
* @function placeAndPayUnit
* check if there is any unit pending for the process and process it if there is.
*/
async function placeAndPayUnit(){
    
    let doesUnitExists = await unitToProcessExists()
    if(doesUnitExists){
        let unitData = await getRecordToProcess()
        //console.log(unitData)
        let tdata = await placeUnit(unitData)
        let tx_id = tdata[0]
        let uid = tdata[1]
        var workerProcess = child_process.spawn('node', ['dopay.js', uid,tx_id, unitData.id]);  
        workerProcess.stdout.on('data', function (data) {  
            console.log('stdout: ' + data);  
         });  
       workerProcess.stderr.on('data', function (data) {  
            console.log('stderr: ' + data);  
         });  
       workerProcess.on('close', function (code) {  
            console.log('child process exited with code ' + code);  
         });
        //await placeAndPayUnit()
        return
    }
    else{
        console.timeEnd("processTime:")
        process.exit()
        await sleep(3000)
        await placeAndPayUnit()
        return
    }
}

/**
* @function unitToProcessExists
* check if there is any unit pending for the process.
*/
function unitToProcessExists(){
    return new Promise(function(resolve, reject){
        let sqldoesexists = " SELECT EXISTS(SELECT 1 FROM garden_command WHERE status = 0) as doesexist"
        let querydoesexists = db.query(sqldoesexists, (err, result) => {
            if(err) throw err
            let doesexistsunit = result[0].doesexist
            resolve(doesexistsunit)
        })
    })
}

/**
* @function getRecordToProcess
* get the unit detail which is to be processed next.
*/
function getRecordToProcess(){
    return new Promise(function(resolve, reject){
        let sqlgetrecord = "select * from garden_command where status = 0 limit 1"
        let querygetrecord = db.query(sqlgetrecord, (err, result) => {
            if(err) throw err
            resolve(result[0])
        })
    })
}

/**
* @function processUnit
* @param {Object} data    //unit detail to be processed.
* process the garden unit placement and payment.
*/
async function placeUnit(data){
    let unit_id = data.id
    let member_id = data.usercode
    let type_dt = data.type
    await updateProcessingCommandDb(unit_id)
    let placedId = await garden.get_new_position_2(2, 1, "Buy")
    await updateCommandDb(unit_id)
    return placedId
}

/**
* @function updateCommandDb
* @param {number} unitId    //id of the unit which has been processed.
* update the status of the unit in command dt after its been processed.
*/
function updateCommandDb(unitId){
    return new Promise(function(resolve, reject){
        let sqlupdatecdb = "update garden_command set status = 1 where id = ?"
        let queryupdatecdb = db.query(sqlupdatecdb, [unitId], (err,result) => {
            if(err) throw err
            resolve(result)
        })
    })
}

/**
* @function updateProcessingCommandDb
* @param {number} unitId    //id of the unit which has been processed.
* update the status of the unit in command dt after its been processed.
*/
function updateProcessingCommandDb(unitId){
    return new Promise(function(resolve, reject){
        let sqlupdatecdb = "update garden_command set status = 2 where id = ?"
        let queryupdatecdb = db.query(sqlupdatecdb, [unitId], (err,result) => {
            if(err) throw err
            resolve(result)
        })
    })
}

/**
* @function updateCommandDbProcessing
* @param {number} unitId    //id of the unit which has been processed.
* update the status of the unit in command dt after its been processed.
*/
function updateCommandDbProcessing(unitId){
    return new Promise(function(resolve, reject){
        let sqlupdatecdb = "update garden_command set status = 3 where id = ?"
        let queryupdatecdb = db.query(sqlupdatecdb, [unitId], (err,result) => {
            if(err) throw err
            resolve(result)
        })
    })
}

/**
* @function sleep
* @param {number} ms     //time in milisecond.
* helper function to put a delay in function calls.
*/
function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

// unitToProcessExists().then((result) => console.log(result))
// getRecordToProcess().then((result) => console.log(result))
placeAndPayUnit(1)
