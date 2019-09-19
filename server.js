'use strict';

// server setup
const express = require('express');
const app = express();
const cors = require('cors');
const pg = require('pg');
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const superagent = require('superagent');
app.use(cors());

// connecting to the database
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));


//global variables
let latitude;
let longitude;

app.get('/location', (request, response) =>{
  let searchQuery = request.query.data;
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GEOCODE_API_KEY}`;

  superagent.get(URL)
    .then(superagentResults => {
      let locationData = superagentResults.body.results[0];
      console.log(superagentResults.body.results[0].geometry);
      const location = new Location(searchQuery, locationData);
      latitude = location.latitude;
      longitude = location.longitude;
      response.status(200).send(location);
    })
    .catch(error => {
      handleError(error, response);
    })

})

app.get('/weather', (request, response) => {

  const URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`
  superagent.get(URL)
    .then(superagentResults => {
      let weatherData = superagentResults.body.daily.data;
      const weatherForecast = weatherData.map(obj => {
        return new Weather(obj);

      })
      response.status(200).send(weatherForecast);
    })
    .catch(error => {
      handleError(error, response);
    })

})

app.get('/events', (request, response) => {
  const URL = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${longitude}&location.latitude=${latitude}&expand=venue&token=${process.env.EVENTBRITE_API_KEY}`;


  superagent.get(URL)
    .then(superagentResults => {
      let eventData = superagentResults.body.events;
      const eventSchedule = eventData.map(obj => {
        return new Event(obj);
      })
      console.log(eventSchedule);
      response.status(200).send(eventSchedule);
    })
    .catch(error => {
      handleError(error, response);
    })
})


function Event(obj){
  this.link = obj.url;
  this.name = obj.name.text;
  this.event_date = obj.start.local;
  this.summary = obj.summary;
}


function Location(searchQuery, locationData){
  this.search_query = searchQuery;
  this.formatted_query = locationData.formatted_address;
  this.latitude = locationData.geometry.location.lat;
  this.longitude = locationData.geometry.location.lng;
}

function Weather(obj){
  this.forecast = obj.summary;
  this.time = this.formattedDate(obj.time);
}

Weather.prototype.formattedDate = function(time) {
  let date = new Date(time*1000);
  return date.toDateString();
}

function handleError(error, response){
  console.error(error);
  const errorObj = {
    status: 500,
    text: 'Sorry, something went wrong'
  }
  response.status(500).send(errorObj);
}

// connect client to database
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening on ${PORT}`));
  }) //only way server turns on, is if client's connected
  .catch(error => handleError(error));





