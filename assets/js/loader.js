;(function () {

// Localize jQuery variable
    var jQuery;
    /******** Load jQuery if not present *********/
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.4.2') {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src",
            "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
        if (script_tag.readyState) {
            script_tag.onreadystatechange = function () { // For old versions of IE
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    scriptLoadHandler();
                }
            };
        } else { // Other browsers
            script_tag.onload = scriptLoadHandler;
        }
        // Try to find the head, otherwise default to the documentElement
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        // The jQuery version on the window is the one we want to use
        jQuery = window.jQuery;
        main();
    }

    /******** Called once jQuery has loaded ******/
    function scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);
        // Call our main function
        main();
    }

    /******** Our main function ********/
    function main() {
        var _hostUrl = 'http://localhost:3002/chat-client';
        jQuery(document).ready(function ($) {
            $.ajax({
                url: _hostUrl,
                data: {id: document.getElementsByClassName('hs-widget')[0].id},
                methods: 'GET',
                dataType: "jsonp",
                success: function (resp) {
                    if (resp.code == 200) {
                        window.abc = 'xxxxxxxxxxxxxxxxxxxxx';
                        console.log(resp.data);
                        //var hsContainer = $("<div>", {id: 'hs-container', 'data-id': document.getElementsByClassName('hs-widget')[0].id});
                        //hsContainer.appendTo('body');
                        //var css_link = $("<iframe>", {
                        //    title: window.document.title,
                        //    id: 'hs-widget-frame-' + document.getElementsByClassName('hs-widget')[0].id,
                        //    style: "display:block;margin: 0;padding: 0;border: 0;z-index: 16000001;position: fixed;bottom: 0;overflow: hidden;right: 10;width: 250;height: 55;background-color: rgba(0; 0; 0; 0)",
                        //    src: "http://localhost:3003/chat-client/" + document.getElementsByClassName('hs-widget')[0].id
                        //});
                        //css_link.appendTo(hsContainer);
                        //console.log(css_link[0].contentWindow.document)
                    }
                }
            });
        });
    }

})();