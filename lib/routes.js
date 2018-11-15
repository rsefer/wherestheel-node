var common = require('../lib/common.js');
const request = require('request');
const moment = require('moment-timezone');
const CTA_TRAIN_API_KEY = process.env.CTA_TRAIN_API_KEY;

module.exports = function(app) {

	// Index
	app.get('/', function (req, res) {
		common.data.frontResponse(req, res, 'index', {
			title: 'Where\'s the EL?',
			color: 'grey'
		});
	});

	// Station (initial load)
	app.get('/s/:stationID', function (req, res) {
		getStationData(true, req, res, req.params.stationID);
	});

	// Station (update)
	app.get('/s/:stationID/update', function (req, res) {
		getStationData(false, req, res, req.params.stationID);
	});

	function getStationData(initial, req, res, stationID) {
		request({
			url: 'https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=' + CTA_TRAIN_API_KEY + '&outputType=JSON&max=10&mapid=' + stationID,
			method: 'GET'
		}, function(error, response, body) {
			var data = JSON.parse(body);

			var originalColor = data.ctatt.eta[0].rt;
			var multipleColors = false;
			var dir1Markup = '';
			var dir5Markup = '';

			for (var i = 0; i < data.ctatt.eta.length; i++) {
				var markup = '<div class="arrival';
				if (minutesToArrivalDisplay(data.ctatt.eta[i].arrT) == 'Approaching') {
					markup += ' approaching';
				}
				markup += '" data-route-code="' + data.ctatt.eta[i].rt + '" data-destination="' + data.ctatt.eta[i].destNm + '">';
					markup += '<div class="arrival-time-diff">' + minutesToArrivalDisplay(data.ctatt.eta[i].arrT) + '</div>';
					markup += '<div class="arrival-time">' + moment(data.ctatt.eta[i].arrT).format('h:mma') + '</div>';

				markup += '</div>';
				if (data.ctatt.eta[i].trDr == '1') {
					dir1Markup += markup;
				} else if (data.ctatt.eta[i].trDr == '5') {
					dir5Markup += markup;
				}
				if (data.ctatt.eta[i].rt != originalColor) {
					multipleColors = true;
				}
			}

			if (dir1Markup.length == 0) {
				dir1Markup = noTrainsMessage();
			}
			if (dir5Markup.length == 0) {
				dir5Markup = noTrainsMessage();
			}

			var formedData = {
				stationName: data.ctatt.eta[0].staNm,
				markup: {
					dir1: dir1Markup,
					dir5: dir5Markup,
					timeUpdate: '<p class="as-of">As of ' +  moment().tz('America/Chicago').format('h:mma') + '<br>Times auto-refresh every 30 seconds</p>'
				}
			};

			if (initial) {
				var activeColor = originalColor;
				if (multipleColors) {
					activeColor = 'grey';
				}
				switch(activeColor) {
					case 'Red':
						activeColor = 'red';
						break;
					case 'Blue':
						activeColor = 'blue';
						break;
					case 'G':
						activeColor = 'green';
						break;
					case 'Brn':
						activeColor = 'brown';
						break;
					case 'P':
						activeColor = 'purple';
						break;
					case 'Y':
						activeColor = 'yellow';
						break;
					case 'Pnk':
						activeColor = 'pink';
						break;
					case 'O':
						activeColor = 'orange';
						break;
					default:
						activeColor = 'grey';
						break;
				}
				common.data.frontResponse(req, res, 'station', {
					title: formedData.stationName,
					color: activeColor,
					station: {
						id: req.params.stationID,
						name: formedData.stationName
					},
					markup: formedData.markup
				});
			} else {
				common.data.dataResponse(req, res, error, 'ERROR', formedData);
			}
		});
	}

	function minutesToArrivalDisplay(arrivalTime) {
		var minutes = moment(arrivalTime).tz('America/Chicago').diff(moment().tz('America/Chicago'), 'minutes');
		if (minutes < 2) {
			return 'Approaching';
		} else {
			return minutes + ' minutes';
		}
	}

	function noTrainsMessage() {
		return '<p>No Trains Available</p>';
	}

}
