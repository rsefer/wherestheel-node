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
			res.json(data);
		}
	}

};
