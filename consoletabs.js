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
                container,            
                sections,
                divElem = $("<div/>");

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