const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const  chatSchema  =  new Schema(
    {
        idmessage: {type : String},
    message: {
    type: String
    },
    sender: {
    type: String
        },
    
    time : { type :String

    }
 } );

chatSchema.plugin(require('mongoose-beautiful-unique-validation'));
const message = mongoose.model("messages",chatSchema)
module.exports = message

