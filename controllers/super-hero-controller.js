const response = require('../utilities/http-response-handlers'),
    axios = require('axios'),
    axiosParallel = require('axios-parallel'),
    superHeroModel = require('../models/super-hero-model');
const axiosInstance = axios.create({
    baseURL: process.env.SUPER_HERO_URL,
    timeout: 1000,
    headers: {
        'x-rapidapi-key': process.env["x-rapidapi-key"],
        'x-rapidapi-host': process.env["x-rapidapi-host"]
    }
})
const controller = {};
controller.getSuperHero = (body) => {
    console.log('came here!!')
    return response.Ok(body)
};
controller.createRoom = async (body) => {
    if (!validateHeroName(body.heroes[0])) {
        return response.BadRequest('Super hero name should be less than 10 character and greater than 3')
    }
    const requests = [];
    for (const name of body.heroes) {
        requests.push(getHeroDetails(name))
    }

    const promises = await axiosParallel(requests, 1)
    // then(results => {
    //     console.log(results);
    //     return response.Ok('success')
    // }).catch(x => {
    //     console.log(x)
    //     return response.ServerError(x);
    // })
    console.log(promises)
    return response.Ok(promises);

}


controller.getRestaurants = async (superHeroes) => {

    const requestsForTemperature = []
    const temperatures = {}

    const locations = superHeroes.map(x => x.birthPlace);
    locations.forEach(location => {
        requestsForTemperature.push(createParallelRequests('GET', 'https://weatherapi-com.p.rapidapi.com/forecast.json', {

            'x-rapidapi-key': 'c3e917053amsh2274286601130aap1dc0f0jsn5b32f2c30889',
            'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
        }, {q: location}));
    });
    const weatherResponses = await axiosParallel(requestsForTemperature, 10);
    weatherResponses.forEach(result => {
        temperatures[result.data.location.name] = result.data.current['temp_c'];
    })
    const requestsForRestaurantIds = [];
    weatherResponses.forEach(x => {
        requestsForRestaurantIds.push(createParallelRequests('GET', 'https://developers.zomato.com/api/v2.1/locations', {'user-key': '70613fb86c5909c6b5f12006c38e0374'}, {'query': x.data.location.name}))
    })
    const restaurantIdsResponse = await axiosParallel(requestsForRestaurantIds, 10);
    const restaurantEntities = {}
    restaurantIdsResponse.forEach(result => {
        restaurantEntities[result.request.params['query']] = {
            entityId: result.data.location_suggestions[0].entity_id,
            entityType: result.data.location_suggestions[0].entity_type
        }
    })
    const restaurantsRequests = []
    for (const item in restaurantEntities) {
        restaurantsRequests.push(createParallelRequests('GET', 'https://developers.zomato.com/api/v2.1/location_details', {'user-key': '70613fb86c5909c6b5f12006c38e0374'},
            {
                entity_id: restaurantEntities[item].entityId,
                entity_type: restaurantEntities[item].entityType,
                cityName: item
            }))
    }
    const restaurantResponses = await axiosParallel(restaurantsRequests, 10);
    const restaurants = {}
    restaurantResponses.map(x => {
        restaurants[x.request.params['cityName']] = {
            name: x.data.best_rated_restaurant[0].restaurant.name,
            rating: x.data.best_rated_restaurant[0].restaurant.user_rating['aggregate_rating'],
        }
    });
    for (const item of superHeroes) {
        item['currentWeatherCelsius'] = temperatures[item.birthPlace]
        item['restaurant'] = restaurants[item.birthPlace]
    }
    return response.Ok(await superHeroModel.insertMany(superHeroes))
}

const createParallelRequests = (type, url, header, query) => {
    return {
        url: url, method: type, headers: header, params: query
    }
}
const getSuperHeroDetails = (name) => {
    return axiosInstance.get(`?hero=${name}`)
}

const validateHeroName = (name) => {
    return name.length < 10 && name.length > 3;
}

async function getHeroDetails(heroName) {
    return await axios.get('https://superhero-search.p.rapidapi.com/', {
        headers: {
            'x-rapidapi-key': 'c3e917053amsh2274286601130aap1dc0f0jsn5b32f2c30889',
            'x-rapidapi-host': 'superhero-search.p.rapidapi.com'
        }, params: {hero: heroName}
    });
}

module.exports = controller;
