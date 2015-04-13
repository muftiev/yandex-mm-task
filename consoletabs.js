var has = Object.prototype.hasOwnProperty,
    consoleTabs = {

        init: function(options) {
            for (var prop in options) {
                if (has.call(options, prop)) {
                    this[prop] = options[prop];
                }
            }
        },

        build: function(target) {
            var self = this,
                content = target.children(),
                tabsCount = content.length,
                container,            
                sections,
                nav,
                navItemTitle,
                navItemLink,
                navTitles = (has.call(self, "navTitles") && Array.isArray(self.navTitles)) ? self.navTitles : [],
                cons,
                divElem = $("<div/>"),
                liElem = $("<li/>"),
                aElem = $("<a/>"),
                inputElem = $("<input/>");

            if(tabsCount < 2) return false;

            target.addClass("consoletabs");
            
            container = divElem.clone()
                .addClass("ct-container");

            content.each(function(indx, element) {
                divElem.clone()
                    .addClass("ct-tab")
                    .attr("data-tabindex", indx + 1)
                    .append(element)
                    .appendTo(container)
            });

            container.appendTo(target);

            nav = $("<ul/>")
                .addClass("ct-nav");

            for(var i = tabsCount - 1; i >= 0; i--) {
                navItemTitle = (navTitles[i]) ? navTitles[i] : "Раздел " + (i + 1);

                navItemLink = aElem.clone()
                    .addClass("ct-nav-item-link")
                    .attr("href", "#tab" + (i + 1))
                    .html(navItemTitle);

                liElem.clone()
                    .addClass("ct-nav-item")
                    .attr("tabindex", i + 1)
                    .append(navItemLink)
                    .prependTo(nav);
            }

            nav.prependTo(target);

            cons = divElem.clone()
                .addClass("ct-console");

            consHeader = divElem.clone()
                .addClass("ct-console-header")
                .html("консоль");

            consNav = divElem.clone()
                .addClass("ct-console-header-nav");

            consNavButton = $("<button/>")
                .addClass("ct-console-nav-button")
                .attr("data-action", "hide")
                .attr("title", "свернуть/развернуть")
                .prependTo(consNav);

            consNavButton.clone()
                .attr("data-action", "close")
                .attr("title", "закрыть")
                .prependTo(consNav);
                
            consNav.prependTo(consHeader);
            consHeader.appendTo(cons);

            divElem.clone()
                .addClass("ct-console-output")
                .appendTo(cons);

            inputElem.clone()
                .addClass("ct-console-input")
                .attr("placeholder", "введите команду")
                .appendTo(cons);

            cons.appendTo(target);

            self.TABSCOUNT = tabsCount;
            self.container = container;
            self.content = container.children();
            self.nav = nav;     
            self.cons = cons;       
        },

        setInitState: function() {
            var self = this,
                index = self._getCurrentTabIndex();

            self._setTab(index);
        },

        setEventListeners: function() {
            var self = this;

            $(window).on("hashchange", function(event) {
                var index = self._getCurrentTabIndex();

                self._setTab(index);
            });
        },

        _getCurrentTabIndex: function() {
            var reg = new RegExp(/^#tab\d/),
                hash = (reg.test(window.location.hash)) ? window.location.hash.match(reg).shift() : null;

            return (hash) ? hash.replace("#tab", "") : NaN;
        },

        _setTab: function(index) {
            var self = this,
                content = $(self.content),
                nav = self.nav;

            if(index && isFinite(index)) {
                nav.find(".active").removeClass("active");
                nav.children().eq(index - 1).addClass("active");
                content.filter(".active").removeClass("active");
                content.eq(index - 1).addClass("active");
            }
        }
    };

jQuery.fn.consoleTabs = function(options) {
    var options = options || {},
        consoleTabsObj = inherit(consoleTabs);

    if(this.hasClass("consoletabs")) return false;

    consoleTabsObj.init(options);
    consoleTabsObj.build(this);
    consoleTabsObj.setInitState();
    consoleTabsObj.setEventListeners();


    function inherit(proto) {
        function F() {}
        F.prototype = proto;
        return new F();
    }
};