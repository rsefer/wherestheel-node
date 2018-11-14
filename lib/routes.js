const https = require('https');
// const request = require('request');
var common = require('../lib/common.js');
const CTA_TRAIN_API_KEY = process.env.CTA_TRAIN_API_KEY;

module.exports = function(app) {

	// Index
	app.get('/', function (req, res) {
		common.data.frontResponse(req, res, 'index', {
			title: 'Where\'s the EL?',
			color: 'grey',
			message: 'Home Page'
		});
	});

	// Station (initial load)
	app.get('/s/:stationID', function (req, res) {
		common.data.frontResponse(req, res, 'station', {
			title: '',
			color: '',
			station: {
				id: req.params.stationID,
				name: 'test name'
			}
		});
	});

	// Station (update)
	app.get('/s/:stationID/update', function (req, res) {

		// console.log(getStationData(req.params.stationID));

		https.get('https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=' + CTA_TRAIN_API_KEY + '&outputType=JSON&max=10&mapid=' + req.params.stationID, (resp) => {
			let data = '';
			resp.on('data', (chunk) => { data += chunk; });
			resp.on('end', () => {
				console.log(JSON.parse(data));
				common.data.dataResponse(req, res, null, 'Update failed.', JSON.parse(data));
			});
		}).on('error', (err) => {
			console.log('Error: ' + err.message);
		});

	});

	// function getStationData(stationID) {
	// 	return new Promise((resolve, reject) => {
	// 		request('https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=' + CTA_TRAIN_API_KEY + '&outputType=JSON&max=10&mapid=' + stationID, (error, response, body) => {
	// 			if (error) reject(error);
	// 			if (response.statusCode != 200) {
	// 				reject('Invalid status code <' + response.statusCode + '>');
	// 			}
	// 			resolve(body);
	// 		});
	// 	});
	// }

}
