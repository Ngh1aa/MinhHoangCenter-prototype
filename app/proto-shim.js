/* Root files and sibling requests share the same canonical HTML source. */
(function(){
 var file=decodeURIComponent(location.pathname.split('/').pop());
 if(parent!==window)parent.postMessage({__dcproto:1,file:file},location.origin);
})();
