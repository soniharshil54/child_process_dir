let garden_pay = require("./garden")

console.log("Child Process " + process.argv[2] + " executed." );
garden_pay.do_payment(process.argv[2],process.argv[3])
// function updatedbtopaid(){

// }
