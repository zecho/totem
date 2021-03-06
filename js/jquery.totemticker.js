/*
 Totem Ticker Plugin
 Copyright (c) 2011 Zach Dunn / www.buildinternet.com
 Released under MIT License
 --------------------------
 Structure based on Doug Neiner's jQuery plugin blueprint: http://starter.pixelgraphics.us/
 */
(function ($) {

    if (!$.omr) {
        $.omr = {};
    }

    $.omr.totemticker = function (el, options) {

        var base = this;

        //Define the DOM elements
        base.el = el;
        base.$el = $(el);

        // Add a reverse reference to the DOM object
        base.$el.data("omr.totemticker", base);

        base.init = function () {
            base.options = $.extend({}, $.omr.totemticker.defaultOptions, options);

            //Define the ticker object
            base.ticker;

            //Adjust the height of ticker if specified
            base.format_ticker();

            //Setup navigation links (if specified)
            base.setup_nav();

            //Start the ticker
            base.start_interval();

            //Debugging info in console
            //base.debug_info();
        };

        base.start_interval = function () {

            //Clear out any existing interval
            clearInterval(base.ticker);

            if (base.options.direction == 'up') {
                //If the direction has been set to up
                base.ticker = setInterval(function () {
                    base.prepareContainer();
                    base.$el.find(base.options.el + ':last').detach().prependTo(base.$el).css('marginTop', '-' + base.options.row_height);
                    base.$el.find(base.options.el + ':first').animate({
                        marginTop: '0px'
                    }, base.options.speed, function () {
                        base.resetContainer();
                        base.updateNavIndex('prev');
                    });
                }, base.options.interval);
            } else {
                //Otherwise, run the default of down
                base.ticker = setInterval(function () {
                    base.prepareContainer();
                    base.$el.find(base.options.el + ':first').animate({
                        marginTop: '-' + base.options.row_height
                    }, base.options.speed, function () {
                        $(this).detach().css('marginTop', '0').appendTo(base.$el);
                        base.resetContainer();
                        base.updateNavIndex('next');
                    });

                }, base.options.interval);
            }

        };

        base.reset_interval = function () {
            clearInterval(base.ticker);
            base.start_interval();
        };

        base.stop_interval = function () {
            clearInterval(base.ticker);
        };

        base.prepareContainer = function () {
            if (base.options.containerOverflow == 'anim') {
                base.$el.css({
                    overflow: 'hidden',
                    height: base.options.row_height
                });
                base.$el.find(base.options.el).css({
                    display: 'block',
                    clear: 'left'
                });
            }
        };

        base.resetContainer = function () {
            if (base.options.containerOverflow == 'anim') {
                base.$el.css({
                    overflow: '',
                    height: '',
                });
                base.$el.find(base.options.el)
                    .removeClass(base.options.activeClass)
                    .css({
                        display: '',
                        clear: '',
                    });
                base.$el.find(base.options.el + ':first').addClass(base.options.activeClass)
            }
        };

        base.updateNavIndex = function (direction) {
            base.$el.find(base.options.el + ':first').addClass(base.options.activeClass);

            var totalRows = base.$el.find('.cg-nav-category').length;
            var currentIndex = base.$el.data('current') || 0;
            currentIndex = (direction == 'next' ? ++currentIndex : --currentIndex ) % totalRows;
            if (currentIndex < 0) {
                currentIndex = totalRows - 1;
            }

            $('#cgj-nav-controls').find('.cg-counter').text(currentIndex + 1);
            base.$el.data('current', currentIndex);
        };

        base.next = function (e) {
            e.preventDefault();
            base.prepareContainer();
            base.$el.find(base.options.el + ':first')
                .animate({
                    marginTop: '-' + base.options.row_height
                }, base.options.speed, function () {
                    $(this).detach().css('marginTop', '0px').appendTo(base.$el);
                    base.reset_interval();
                    base.resetContainer();
                    base.updateNavIndex('next');
                });
        };

        base.previous = function (e) {
            e.preventDefault();
            base.prepareContainer();
            base.$el.find(base.options.el + ':last').detach().prependTo(base.$el).css('marginTop', '-' + base.options.row_height);
            base.$el.find(base.options.el + ':first').animate({
                marginTop: '0px'
            }, base.options.speed, function () {
                base.reset_interval();
                base.resetContainer();
                base.updateNavIndex('prev');
            });
        };

        base.format_ticker = function () {

            if (typeof(base.options.max_items) != "undefined" && base.options.max_items != null) {

                //Remove units of measurement (Should expand to cover EM and % later)
                var stripped_height = base.options.row_height.replace(/px/i, '');
                var ticker_height = stripped_height * base.options.max_items;

                base.$el.css({
                    height: ticker_height + 'px',
                });
            }

            if (base.options.containerOverflow == 'always') {
                base.$el.css('overflow', 'hidden');
                console.log('always');
            }

        };

        base.setup_nav = function () {

            //Stop Button
            if (typeof(base.options.stop) != "undefined" && base.options.stop != null) {
                $(base.options.stop).click(function () {
                    base.stop_interval();
                    return false;
                });
            }

            //Start Button
            if (typeof(base.options.start) != "undefined" && base.options.start != null) {
                $(base.options.start).click(function () {
                    base.start_interval();
                    return false;
                });
            }

            //Previous Button
            if (typeof(base.options.previous) != "undefined" && base.options.previous != null) {
                $(base.options.previous).on('click', base.previous);
            }

            //Next Button
            if (typeof(base.options.next) != "undefined" && base.options.next != null) {
                $(base.options.next).on('click', base.next);
            }

            //Stop on mouse hover
            if (typeof(base.options.mousestop) != "undefined" && base.options.mousestop === true) {
                base.$el.mouseenter(function () {
                    base.stop_interval();
                }).mouseleave(function () {
                        base.start_interval();
                    });
            }

            /*
             TO DO List
             ----------------
             Add a continuous scrolling mode
             */

        };

        base.debug_info = function () {
            //Dump options into console
            console.log(base.options);
        };

        //Make it go!
        base.init();
    };

    $.omr.totemticker.defaultOptions = {
        message: 'Ticker Loaded', /* Disregard */
        next: null, /* ID of next button or link */
        previous: null, /* ID of previous button or link */
        stop: null, /* ID of stop button or link */
        start: null, /* ID of start button or link */
        row_height: '100px', /* Height of each ticker row in PX. Should be uniform. */
        speed: 800, /* Speed of transition animation in milliseconds */
        interval: 4000, /* Time between change in milliseconds */
        max_items: null, /* Integer for how many items to display at once. Resizes height accordingly (OPTIONAL) */
        mousestop: false, /* If set to true, the ticker will stop on mouseover */
        direction: 'down', /* Direction that list will scroll */
        el: 'li', /* Elements to rotate */
        containerOverflow: 'always', /* When to put overflow:hidden to container */
        activeClass: 'active' /* Class for active row element */
    };

    $.fn.totemticker = function (options) {
        return this.each(function () {
            (new $.omr.totemticker(this, options));
        });
    };

})(jQuery);
