$digOutput = $('#digOutput');
$nsOutput = $('#nsOutput');

clearAllOutputs = function() {
	$digOutput.html('');
	$nsOutput.html('');
};

$('#surf').click(function(e) {

	e.preventDefault();

	NProgress.start();

	domainName = $('#domainName').val();

	clearAllOutputs();

	// run dig and write output
	var spawn = require('child_process').spawn,
		dig = spawn('dig', [domainName]),
		ns = spawn('dig', ['NS', '+short', domainName]);

	dig.stdout.on('data', function (data) {
		$digOutput.append(data.toString());
	});

	ns.stdout.on('data', function (data) {
		$nsOutput.append(data.toString());
	});

	dig.on('close', function() {
		NProgress.done();
	});

});
