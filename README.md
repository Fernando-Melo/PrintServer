#PrintServer
 A PhantomJS Web Server that takes a screenshot of a given URL and returns a JSON with the base64 of the screenshot that was taken.   
 This Web Server can be called when a user asks to print a Web page, followed by printing the screenshot image.  
 
 <b>Note:</b> you need to install PhantomJS version 1.98 or below

#Running PrintServer Web server
 <b>Usage:</b> phantomjs PrintServer.js < portnumber > 

 <b>Example:</b> phantomjs PrintServer.js 8181

#Requiring the JSON with the image in base64

 <b>Example:</b> http://localhost:8181/?url=http://google.pt 
 
 <b>Usage:</b> http://localhost:<portnumber>/?url= < urlEncoded > 

<b> < urlEncoded > </b> - The url to take a screenshot should be escaped using the [javascript function encodeURIComponent](http://www.w3schools.com/jsref/jsref_encodeuricomponent.asp)
