var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var url = require('url');
var http = require('http');
var https = require('https');

var $digOutput = $('#digOutput');
var $nsOutput = $('#nsOutput');
var $whoisOutput = $('#whoisOutput');

var digOutput = '';
var nsOutput = '';
var whoisOutput = '';

clearAllOutputs = function() {
	$digOutput.html('');
	$nsOutput.html('');
	$whoisOutput.html('');

	digOutput = '';
	nsOutput = '';
	whoisOutput = '';

};

var getURLParts = function() {
	var domainInput = $('#domainInput').val();
	if (!domainInput) {
		return;
	}
	if (!domainInput.match(/^http(s)?:\/\//i)) {
		domainInput = 'http://' + domainInput;
	}
	var urlParts = url.parse(domainInput);
	return urlParts;
}

var getDomainName = function() {
	var urlParts = getURLParts();
	return urlParts ? urlParts.hostname : null;
};

var runCommands = function() {

	var domainName = getDomainName();

	if (!domainName) {
		return;
	}

	NProgress.start();
	clearAllOutputs();

	// commands
	var dig = spawn('dig', ['+nocomments', domainName]),
		ns = spawn('dig', ['NS', '+short', domainName]);

	dig.stdout.on('data', function (data) {
		digOutput += data.toString();
		$digOutput.append(data.toString());
	});

	ns.stdout.on('data', function (data) {
		nsOutput += data.toString();
		$nsOutput.append(data.toString());
	});

	// whois info for the IP that the domain points to
	// whois <last line of dig +short>
	// run using exec (buffers output)
	exec('whois `dig +short ' + domainName + ' | tail -1`',
		function(error, stdout, stderr) {
			whoisOutput = stdout;
			$whoisOutput.append(whoisOutput);
			NProgress.done();
		}
	);

	// make http(s) request
	var domainInput = $('#domainInput').val();
	if (!domainInput.match(/^http(s)?:\/\//)) {
		domainInput = 'http://' + domainInput;
	}
	var protoClient = domainInput.match(/^https/i) ? https : http;
	protoClient.get(domainInput, function(response) {
		var combinedHeadersStr = '';
		for (var i = 0; i < response.rawHeaders.length; i = i+2) {
			combinedHeadersStr += response.rawHeaders[i] +
									': ' + response.rawHeaders[i+1] + '\n';
		}
		$('#httpHeaders').text(combinedHeadersStr);

		if (response.headers.server &&
			response.headers.server === 'cloudflare-nginx') {
				$('#cloud').removeClass('greyCloud').addClass('orangeCloud');
		} else {
			$('#cloud').removeClass('orangeCloud').addClass('greyCloud');
		}

	});

};

$('#surf').click(function(e) {
	e.preventDefault();
	runCommands();
});

$('#domainInput').keypress(function(e) {
	if (e.which == 13) {
		e.preventDefault();
		runCommands();
	}
});
