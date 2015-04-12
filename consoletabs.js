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

            consNavButton = inputElem.clone()
                .addClass("ct-console-nav-button")
                .attr("type", "button")
                .attr("data-action", "close")
                .attr("title", "закрыть")
                .prependTo(consNav);

            consNavButton.clone()
                .attr("data-action", "hide")
                .attr("title", "свернуть/развернуть")
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
        }
    };

jQuery.fn.consoleTabs = function(options) {
    var options = options || {},
        consoleTabsObj = inherit(consoleTabs);

    if(this.hasClass("consoletabs")) return false;

    consoleTabsObj.init(options);
    consoleTabsObj.build(this);

    function inherit(proto) {
        function F() {}
        F.prototype = proto;
        return new F();
    }
};