var UI = require('ui');
var ajax = require('ajax');

// amadeus travel innovation sandbox api key
var amadeusAPIKey = '***REMOVED***';

var menuItems = [];
var results = [];
var menu = new UI.Menu({
  backgroundColor: 'black',
  textColor: 'white',
  highlightBackgroundColor: 'light grey',
  highlightTextColor: 'red',
  sections: [{
    title: 'Flight ideas',
    items: menuItems
  }]
});

/*
var currentDate = new Date();
currentDate.setDate(currentDate.getDate() + 1);
var nextDate = new Date();
nextDate.setDate(currentDate.getDate() + 7);
*/

function weatherToBody(cityName, card) {
  // openweathermap api key
  var weatherAPIKey = '***REMOVED***';

  var weatherURL = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=' + weatherAPIKey;
  ajax(
  {
    url: weatherURL,
    type: 'json'
  },
  function(data) {
    // Success!
    console.log("Successfully fetched weather data!");

    // Extract data
    //var location = data.name;
    //var temperature = Math.round(data.main.temp - 273.15) + "C";
    var temperature = Math.round((data.main.temp - 273.15) * 1.8 + 32) + "F"; // (K - 273.15)* 1.8 + 32
    // Always upper-case first letter of description
    var description = data.weather[0].description;
    description = description.charAt(0).toUpperCase() + description.substring(1);

    // Show to user
    card.subtitle(card.subtitle() + ", " + temperature);
    card.body(description);
    card.scrollable(true);
  },
  function(error) {
    // Failure!
    card.body('Failed fetching weather data: ' + JSON.stringify(error));
  });
}

var futureDates = '2016-01-25--2016-01-28';// currentDate.toJSON().slice(0, 10) + "--" + futureDates.toJSON().slice(0, 10); //

var origin = "TUS";
var amadeusUrl = 'http://api.sandbox.amadeus.com/v1.2/flights/inspiration-search?apikey=' + amadeusAPIKey + '&origin=' + origin + "&departure_date=" + futureDates;
function airportLookup(cityCode, price, airline) {
  var locationLookup = 'https://api.sandbox.amadeus.com/v1.2/location/' + cityCode + '?apikey=' + amadeusAPIKey;
  console.log('Calling ' + locationLookup);
  ajax({url:locationLookup, type:'json'}, function(payload) {
    console.log("Success " + cityCode);
    var currentCard = new UI.Card({
      title: payload.city.name + " $" + price,
      subtitle: airline,
      body: ""
    });
    currentCard.show();
    weatherToBody(payload.city.name, currentCard);
  }, function(error) { console.log("location lookup error: " + cityCode); console.log(error); });
  
}
menu.on('select', function(event) {
  var cityCode = results[event.itemIndex].cityCode;
  var price = results[event.itemIndex].price;
  var airline = results[event.itemIndex].airline;
  
  airportLookup(cityCode, price, airline);
  
});

// Find locations to travel to
console.log('Calling ' + amadeusUrl);
ajax(
  {url:amadeusUrl, type:'json'},
  function(response) {
    for(var index = 0; index < response.results.length; index++) {
      /* "destination": "LAX",
      "departure_date": "2016-03-30",
      "return_date": "2016-04-05", 
      "price": "138.20",
      "airline": "UA" */
      var city = response.results[index].destination;
      var price = parseFloat(response.results[index].price);
      // build cache
      results.push({cityCode:city,price:price,airline:response.results[index].airline});
      // add item to menu
      menuItems.push({
        title: city  + "  $" + price,
        subtitle: response.results[index].departure_date.substring(5) + " -> " + response.results[index].return_date.substring(5)
        //icon: 'images/item_icon.png'
      });      
    
    }
    menu.show();
  },
  function(error) {
    console.log("Error Amadeus!");
    console.log(JSON.stringify(error));
  }
);