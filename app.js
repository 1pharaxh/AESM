const express = require('express');
const mongoose = require('mongoose');
import api from './pass.js';
// const lecture = require('./models/lecture');
// import the scraper function from scraper.js
const scraper = require('./scraper'); 
const app = express();
// connect to mongoDB
const dbURL = 'mongodb+srv://nodeJS:'+api.apiKey+'@cluster0.yyanr9g.mongodb.net/lecture?retryWrites=true&w=majority';
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(function(){
    console.log('connected to mongoDB');
    // listen for request AFTER connecting to mongoDB
    app.listen(3000,function(){
        console.log('Server is running on port 3000');
    })
    // Error handling
}).catch(function(err){
    console.log(err);
});
// Only scrape and update the Db is password parameter is correct. 
app.get('/api/update-db/:password',function(req,res){
    if (req.params.password === api.apiKey) {
        res.send('Updating DB');
        // Drop the database so we start fresh. Empty callback function as we don't need to do anything after dropping the database.
        mongoose.connection.db.dropCollection('lec-jsons', function(err, result) {null});
        // scrape the data from the website
        scraper.scrape('https://apps.ualberta.ca/catalogue/course/');
    } else {
        res.send('Wrong password');
    }
});

app.get('/api/get-courses/:subject1?/:subject2?/:subject3?/:subject4?/:subject5?',function(req,res){
    // Set the response headers so that the data is returned as STRING
    res.setHeader('Content-Type', 'application/json');
    // req.params is an object that contains all the our 5 optional subjects
    for (const key of Object.keys(req.params)) {
        // if the key is not empty list then we have a collection.
        if (req.params[key] !== undefined) {
            // Find all the JSON objects in the collection
            lecture.find({courseName: req.params[key]}).then(function(results){
                // For every JSON object in the collection convert to string and send back response
                results.forEach(function(result){
                    if (result !== []) {
                        res.write(JSON.stringify(result));
                    }
                    // For Debugging
                    // result !== [] ? console.log(result) : null;
                })
            // ERROR handling
            }).catch(function(error){
                console.log(error);
            });
        }
    }
    res.send();
});






// var result = [];
// var flag = false;
// app.get('/api/get-courses/:subject1?/:subject2?/:subject3?/:subject4?/:subject5?',function(req,res){
//     // req.params is an object that contains all the our 5 optional subjects
//     for (const key of Object.keys(req.params)) {
//         // if the key is not empty list then we have a collection.
//         if (req.params[key] !== undefined) {
//             // Find all the JSON objects in the collection
//             lecture.find({courseName: req.params[key]}).then(function(results){
//                 result.push(results)
//                 console.log(results);
//                 flag = true;
//             // ERROR handling
//             }).catch(function(error){
//                 flag = false;
//                 console.log(error);
//             });
//         };
//     };
//     if (flag === true){
//         res.write(JSON.stringify(result));
//     }
// });