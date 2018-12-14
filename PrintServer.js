"use strict";
var port, server, service,
    system = require('system');
var url = '';

if (system.args.length !== 2) {
    console.log('Usage: PrintServer.js <portnumber>');
    phantom.exit(1);
} else {
    port = system.args[1];
    server = require('webserver').create();

    service = server.listen(port, function (request, response) {

        console.log('Request at ' + new Date());
        console.log(JSON.stringify(request, null, 4));

        url = decodeURIComponent(request.url).substring(6); //Dirty hack assuming only one parameter named url 
		var page = require('webpage').create();
		var base64;

		page.viewportSize = {width: 670, height: 502};
        page.settings.resourceTimeout = 60000; // 60 seconds timeout
        page.onResourceTimeout = function(e) {
          console.log('Error code: ' + e.errorCode);   // it'll probably be 408 
          console.log('Error: ' + e.errorString); // it'll probably be 'Network timeout on resource'
          console.log('Error URL: ' +e.url);         // the url whose request timed out
          response.close(); /*Close http connection*/
        };
		page.open(url, function() {
			page.evaluate(function() {
			  var style = document.createElement('style'),
				  text = document.createTextNode('body { background: #ffffff }');
			  style.setAttribute('type', 'text/css');
			  style.appendChild(text);
			  document.head.insertBefore(style, document.head.firstChild);
			});
			base64 = page.renderBase64('png');


        response.statusCode = 200;
        response.headers = {
                'Content-Type': 'text/plain',

        };
        response.write('{ "imgBase64": "'+base64+ '" }');
        response.close();

		});

    });

    if (service) {
        console.log('Web server running on port ' + port);
    } else {
        console.log('Error: Could not create web server listening on port ' + port);
        phantom.exit();
    }
}
