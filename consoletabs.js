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
                navItem,
                navItemTitle,
                navTitles = (has.call(self, "navTitles") && Array.isArray(self.navTitles)) ? self.navTitles : [],
                cons,
                consInput,
                consOutput,
                divElem = $("<div/>");

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
                navItem = $("<li/>")
                    .addClass("ct-nav-item")
                    .attr("tabindex", i + 1)
                    .html(navItemTitle)
                    .prependTo(nav);
            }

            nav.prependTo(target);

            cons = divElem.clone()
                .addClass("ct-console");

            consInput = $("<input/>")
                .addClass("ct-console-input")
                .appendTo(cons);

            consInput = divElem.clone()
                .addClass("ct-console-output")
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