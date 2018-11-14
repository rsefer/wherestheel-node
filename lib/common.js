const CTA_TRAIN_API_KEY = process.env.CTA_TRAIN_API_KEY;

exports.data = {

	frontResponse: function(req, res, template, data) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.render(template, data);
	},
	dataResponse: function(req, res, err, errMessage, data) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		if (err) {
			console.log(err);
			res.status(400).json({ error: errMessage });
		} else {
			console.log(data);
			res.json(data);
		}
	}

};
