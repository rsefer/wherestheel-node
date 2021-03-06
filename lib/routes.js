var common = require('../lib/common.js');
const request = require('request');
const moment = require('moment-timezone');
const CTA_TRAIN_API_KEY = process.env.CTA_TRAIN_API_KEY;

module.exports = function(app) {

	// Redirect www traffic
	app.get('/*', function(req, res, next) {
		if (req.headers.host.match(/^www/) !== null ) {
			res.redirect('https://' + req.headers.host.replace(/^www\./, '') + req.url);
		} else {
			next();
		}
	});

	// Index
	app.get('/', function (req, res) {
		common.data.frontResponse(req, res, 'index', {
			title: 'Where\'s the EL?',
			color: 'grey'
		});
	});

	// Station (initial load)
	app.get('/s/:stationID', function (req, res) {
		res.redirect('https://www.transitchicago.com/traintracker/arrivaltimes/?sid=' + req.params.stationID);
		// getStationData(true, req, res, req.params.stationID);
	});

	// Station (update)
	app.get('/s/:stationID/update', function (req, res) {
		getStationData(false, req, res, req.params.stationID);
	});

	// Station (alerts)
	app.get('/s/:stationID/alerts', function (req, res) {
		getAlertData(req, res, req.params.stationID);
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

	function getAlertData(req, res, stationID) {
		request({
			url: 'http://www.transitchicago.com/api/1.0/alerts.aspx?outputType=JSON&stationid=' + stationID,
			method: 'GET'
		}, function(error, response, body) {
			var data = JSON.parse(body);
			var formedData = {
				markup: ''
			};
			if (data.CTAAlerts.Alert) {
				formedData.markup += '<div class="alerts">';
				var alertsRaw = data.CTAAlerts.Alert;
				var hasHighAlerts = false;
				for (var i = 0; i < alertsRaw.length; i++) {
					// Severity Scores:
          // 0-39 = Accessibility, informational, planned
          // 40-59 = "Minor delays and reroutes"
          // 60-79 = "Significant delays and reroutes"
          // 80-99 = "Major delays and service disruptions"
          if (parseInt(alertsRaw[i].SeverityScore) >= 40) {
						hasHighAlerts = true;
						formedData.markup += '<div class="alert">' + alertsRaw[i].ShortDescription + ' <a href="' + alertsRaw[i].AlertURL['#cdata-section'] + '">More Information</a></div>';
					}
				}
				formedData.markup += '</div>';
				if (!hasHighAlerts) {
					formedData = {};
				}
			}
			common.data.dataResponse(req, res, null, 'ERROR', formedData);
		});
	}

	function minutesToArrivalDisplay(arrivalTime) {
		var diff = moment().tz('America/Chicago').to(moment(arrivalTime), 'minutes');
		if (diff == 'a few seconds' || diff == 'a minute') {
			return 'Approaching';
		} else {
			return diff;
		}
	}

	function noTrainsMessage() {
		return '<p>No Trains Available</p>';
	}

}
