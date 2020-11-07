var Router = require('express').Router(),
    controller = require('../controllers/super-hero-controller');

Router.get('/harsh', async (req, res) => {
    let context = await controller.getSuperHero(req.body);
    context(req, res);
})

Router.post('/create-room', async (req, res) => {
    try {
        let context = await controller.createRoom(req.body);
        context(req, res);
    } catch (e) {
        res.status(500).send(e);
    }

})
/**
 * Can change Locations and weather information will change dynamically,
 *  but keeping the hero name and rank as hardcoded since First superhero search api was not serving concurrent request .
**/
Router.get('/get-locations', async (req, res) => {
    try {
        let context = await controller.getRestaurants([{
            name: 'spiderman',
            rank: 1,
            birthPlace: 'New York'
        },
            {
                name: 'Hulk',
                rank: 2,
                birthPlace: 'Dayton'
            }]);
        context(req, res);
    } catch (e) {
        res.status(500).send(e);
    }

})

module.exports = Router
