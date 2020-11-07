const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const superHeroSchema = new Schema({
    name: String,
    rank: Number,
    birthPlace: String,
    currentWeatherCelsius: Number,
    restaurant: {type: {name: String, rating: Number}}
})
module.exports = mongoose.model("superHero", superHeroSchema);
