/**
 * Created by sonth on 5/20/2016.
 */


var DFT = function ($) {

    var bindClick = function () {
        $(document).on('click', '.notifi-a', function () {
            var url = $(this).attr('data-url');
            if (url.length){
                window.location.hash = url;
            }
            else{
                _.LoadPage(window.location.hash);
            }
        });

        $(document).on('click', '.pagination li a', function (e) {
            e.preventDefault();
            window.location.hash = window.location.hash.split('?page=')[0] + '?' + $(this).attr('href').split('?')[1];
        });
    };

    return {
        init: function () {
            bindClick();
        },
        uncut: function () {
            $(document).off('click', '.notifi-a');
        }
    };
}(jQuery);