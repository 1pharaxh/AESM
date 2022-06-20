const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const lecture = require('./models/lecture');
const dbURL = 'mongodb+srv://nodeJS:DParnHczIbFOdnRh@cluster0.yyanr9g.mongodb.net/lecture?retryWrites=true&w=majority';
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(function(){
    console.log('connected to mongoDB');
    // Error handling
}).catch(function(err){
    console.log(err);
});
var urlsList = [];
module.exports = {
    scrape:async function(url){
            // launch puppeteer
            const browser = await puppeteer.launch();
            // create a new page
            const page = await browser.newPage();
            // navigate to the url
            await page.goto(url);
            // MAIN CLASS LIST. This is the list of all the classes.
            const main_links = await page.$$eval('.subject-columns a', function(x){
                return x.map(y=>y.innerHTML);
            });
            // Looping through the main links list
            for (let i = 0; i < main_links.length; i++) {
                // setting the variable Url to a child element.
                var Url = main_links[i];
                // removing the the characters after '-' in each child of list.
                Url = 'https://apps.ualberta.ca/catalogue/course/'+Url.substring(0, Url.indexOf('-')-1);
                // Going to the sub-page for each class.
                await page.goto(Url);
                // making an array with all class links.
                const class_list = await page.$$eval('body > div > div > div > div > div > div.d-flex.gap-2 > h2 > a', function(x){
                    return x.map(y=>'https://apps.ualberta.ca/'+y.getAttribute('href'));
                });
                // append the array with links to the list. Not using .push because 
                // async function is not supported in .push
                urlsList[i] = class_list;
                // For debugging link paths.
                // console.log(class_list);
            };
            // iterating over the list of links
            for (let j = 0; j < urlsList.length; j++) {
                for (let k = 0; k < urlsList[j].length; k++) {
                    // going to the sub-page for each class.
                    await page.goto(urlsList[j][k]);
                    // making an object with all class details.
                    const getData = async () => {
                        return await page.evaluate(async () => {
                            // This is the first selector for the the DOM tree of entire page
                            const pageElements = document.querySelectorAll('body > div > div');
                            const elemList = [];
                            // Iterating over the DOM Elements
                            for(var i = 0; i < pageElements.length; i++){
                                // This selector is for the table section of each page.
                                var div = pageElements[i].querySelectorAll('div > table > tbody > tr');
                                // Iterating over table to find their row values and look at their respective
                                // parent 'h2' to get Fall/Winter etc and 'h3' for lecture/lab/seminar.  
                                for(var j = 0; j < div.length; j++){
                                    // Using regex to break the string into an array of words.
                                    var values = div[j].textContent.replace(/\s+/g,' ').trim().match(/([\w+]+)/g);
                                    // Checking if array is empty.
                                    if(values.length || Array.isArray(values)) {
                                        var courName = document.querySelector('h1').innerText.substring(0, document.querySelector('h1').innerText.indexOf('-')-1)
                                        // If we encounter a string LECTURE/LAB.
                                        if (values[1] !== 'LAB' && values[1] !== 'LECTURE' && values[1] !== 'SEMINAR') {
                                            elemList.push(
                                                {
                                                    courseName: courName.split(' ').join('-'),
                                                    // "courseNumber": document.querySelector('h1').innerText.split(' ')[1],
                                                    courseTerm: div[j].parentElement.parentElement.parentElement.parentElement.querySelector('h2').textContent,
                                                    courseFullName: document.querySelector('h1').innerText,
                                                    lectures: values[0] === 'LECTURE' ?
                                                        {
                                                            lectureName: values[0]+' '+values[1] + ' ' + values[2],
                                                            lectureDays: values[10],
                                                            lectureTime: values[11] + ':' + values[12] + ' - ' + values[13] + ':' + values[14]
                                                            // "lectureLocation": values[15] + ' ' + values[values.length-1]
                                                        } : null,
                                                    labs: values[0] === 'LAB' ? 
                                                        {
                                                            labName: values[0]+' '+values[1] + ' ' + values[2],
                                                            labDays: values[10],
                                                            labTime: values[11] + ':' + values[12] + ' - ' + values[13] + ':' + values[14]
                                                            // "labLocation": values[15] + ' ' + values[values.length-1]
                                                        } : null,
                                                    seminars: values[0] === 'SEMINAR' ?
                                                        {
                                                            seminarName: values[0]+' '+values[1] + ' ' + values[2],
                                                            seminarDays: values[10],
                                                            seminarTime: values[11] + ':' + values[12] + ' - ' + values[13] + ':' + values[14]
                                                            // "seminarLocation": values[15] + ' ' + values[values.length-1]
                                                        } : null
                                                }
                                            );
                                        } else {
                                            elemList.push(
                                                {
                                                    courseName: courName.split(' ').join('-'),
                                                    // "courseNumber": document.querySelector('h1').innerText.split(' ')[1],
                                                    courseTerm: div[j].parentElement.parentElement.parentElement.parentElement.querySelector('h2').textContent,
                                                    courseFullName: document.querySelector('h1').innerText,
                                                    lectures: values[0] === 'LECTURE' ?
                                                        {
                                                            lectureName: values[0]+' '+values[2] + ' ' + values[3],
                                                            lectureDays: values[11],
                                                            lectureTime: values[12] + ':' + values[13] + ' - ' + values[14] + ':' + values[15]
                                                            // "lectureLocation": values[15] + ' ' + values[values.length-1]
                                                        } : null,
                                                    labs: values [1] === 'LAB' ? 
                                                        {
                                                            labName: values[1]+' '+values[2] + ' ' + values[3],
                                                            labDays: values[11],
                                                            labTime: values[12] + ':' + values[13] + ' - ' + values[14] + ':' + values[15]
                                                            // "labLocation": values[15] + ' ' + values[values.length-1]
                                                        } : null,
                                                    seminars: {
                                                        seminarName: null,
                                                        seminarDays: null,
                                                        seminarTime: null
                                                    }
                                                }
                                            );
                                        };
                                    };
                                };
                                
                            };
                            return await new Promise( resolve => {
                                setTimeout(() => {
                                    resolve(elemList);
                                });
                            })          
                        });
                    };
                    const lec_json = await getData();
                    // closing the browser
                    for (let l = 0; l < lec_json.length; l++) {
                        if (lec_json[l] !== null) {
                            var json = new lecture(lec_json[l]);
                        };
                        json.save().then(function(results){
                            console.log(results);
                            console.log('Course added');
                        }).catch(function(err){
                            console.log(err);
                        });
                    };
                };
            };
        await browser.close();
    }
};
