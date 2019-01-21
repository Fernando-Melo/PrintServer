"use strict";

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

// To address those who want the "root domain," use this function:
function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}

function closeResponse(response, message) {
   console.log("Closing with message " + message);

   response.statusCode = 403; 
   response.headers = {"Cache": "no-cache", "Content-Type": "text/html"};  
   response.write("<html><head><title>" + message + "</title></head>"); 
   response.write("<body><p>" + message + "</p></body></html>"); 
   response.close(); 

   return;
}

var port, server, service,
    system = require('system');
var url = '';

if (system.args.length < 2 || system.args.length > 4) {
    console.log('Usage: ScreenShotServer.js <portnumber>');
    console.log('Usage: ScreenShotServer.js <portnumber> <rootDomain> <replaceRequestTo>');
    phantom.exit(1);
}  else {
    var port = system.args[1];
    var rootDomain = (system.args.length) >= 3 ? system.args[2] : null;
    var replaceRequestTo = (system.args.length) >= 4 ? system.args[3] : null;

    server = require('webserver').create();

    service = server.listen(port, function (request, response) {

        console.log('Request at ' + new Date());
        console.log(JSON.stringify(request, null, 4));

        console.log('The url is: ' + getParameterByName('url', request.url));
        var url = getParameterByName('url', request.url);
        if (!url) {
            closeResponse(response, "Empty url.");
            return;
        }

        if (rootDomain !== null) {       
            var extractedRootDomain = extractRootDomain(url);
            console.log("extractedRootDomain: " + extractedRootDomain + " rootDomain: " + rootDomain);
            if (rootDomain !== null && extractedRootDomain !== rootDomain) {
                closeResponse(response, "Wrong root domain to execute the screenshot. It's only supported " + rootDomain);
                return;
            }
        }

        if (replaceRequestTo !== null) {
            var urlHostname = extractHostname(url);
            url = replaceRequestTo + url.substring(url.indexOf(urlHostname) + urlHostname.length);
            console.log("Replace request to: " + url);
        }
                
		var page = require('webpage').create();
		var base64;

		page.viewportSize = {width: 670, height: 502};
        page.settings.resourceTimeout = 60000; // 60 seconds timeout
        page.onResourceTimeout = function(e) {
          console.log('Error code: ' + e.errorCode);   // it'll probably be 408 
          console.log('Error: ' + e.errorString); // it'll probably be 'Network timeout on resource'
          console.log('Error URL: ' +e.url);         // the url whose request timed out
          //closeResponse(response, "Resource timeout when loading the page. Probabilly the wayback is slow.");
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
