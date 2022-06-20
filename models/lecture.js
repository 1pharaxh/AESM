const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lectureSchema = new Schema({
    courseName : {
        type : String,
        required : false
    },
    courseTerm : {
        type : String,
        required : false
    },
    courseFullName : {
        type : String,
        required : true
    },
    lectures :{
        lectureName : {
            type : String,
            required : false
        },
        lectureDays : {
            type : String,
            required : false
        },
        lectureTime : {
            type : String,
            required : false
        }
    },
    labs : {
        labName : {
            type : String,
            required : false
        },
        labDays : {
            type : String,
            required : false
        },
        labTime : {
            type : String,
            required : false
        }
    },
    seminars: {
        seminarName: {
            type : String,
            required : false
        },
        seminarDays: {
            type : String,
            required : false
        },
        seminarTime: {
            type : String,
            required : false
        }
    }
}, { timestamps: true });
const lecture = mongoose.model('lec-json', lectureSchema);
module.exports = lecture;