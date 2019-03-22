

/**
 * Transform a string into an xml document, the Safari way, as long as
 * the nightlies are broken. Even more evil version.
 * @param {Object} str
 * @param {Object} contentType
 */
function _evenMoreEvilHack(str, contentType) {
  /*
	 * This even more evil hack was taken from
	 * http://web-graphics.com/mtarchive/001606.php#chatty004999
	 */

  if (window.ActiveXObject) {
    var d = new ActiveXObject("MSXML.DomDocument");
    d.loadXML(str);
    return d;
  } else if (window.XMLHttpRequest) {
    var req = new XMLHttpRequest;
    req.open("GET", "data:" + (contentType || "application/xml") +
      ";charset=utf-8," + encodeURIComponent(str), false);
    if (req.overrideMimeType) {
      req.overrideMimeType(contentType);
    }
    req.send(null);
    return req.responseXML;
  }
}

/**
 * Transform a string into an xml document, the Safari way, as long as
 * the nightlies are broken.
 * @param {Object} result the xml document object.
 */
function _evilSafariHack(serializedXML) {
  /*
	 *  The Dave way. Taken from:
	 *  http://web-graphics.com/mtarchive/001606.php
	 *
	 *  There is another possibility to parse XML in Safari, by implementing
	 *  the DOMParser in javascript. However, in the latest nightlies of
	 *  WebKit, DOMParser is already available, but still buggy. So, this is
	 *  the best compromise for the time being.
	 */

  var xml = serializedXML;
  var url = "data:text/xml;charset=utf-8," + encodeURIComponent(xml);
  var dom = null;

  // your standard AJAX stuff
  var req = new XMLHttpRequest();
  req.open("GET", url);
  req.onload = function () {
    dom = req.responseXML;
  }
  req.send(null);

  return dom;
}



