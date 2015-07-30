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
                .attr("tabindex", tabsCount + 1)
                .attr("placeholder", "введите команду")
                .appendTo(cons);

            cons.appendTo(target);

            self.TABSCOUNT = tabsCount;
            self.container = container;
            self.content = container.children();
            self.nav = nav;     
            self.cons = cons;    
        },

        consoleInit: function() {
            var self = this,
                consoleHist = [],
                consoleCmds = {};

            consoleCmds.selectTab = function(index) {
                var tabIndex = parseInt(index, 10),
                    tabTitle;

                if(!isFinite(tabIndex) || tabIndex < 0 || tabIndex > this.TABSCOUNT - 1) {
                    return 'Не удалось выбрать таб №' + tabIndex + '. Доступны табы с 0 по ' + (this.TABSCOUNT - 1) + '.';
                } else {
                    tabTitle = self.nav.children().eq(tabIndex).find(".ct-nav-item-link").html();
                    window.location.hash = "#tab" + (tabIndex + 1);
                    return 'Выбран таб №' + tabIndex + ' "' + tabTitle + '".';
                }
            };

            consoleCmds.swapTabs = function(index1, index2) {
                var navTabs = self.nav.children,
                    tabIndex1 = parseInt(index1, 10),
                    tabIndex2 = parseInt(index2, 10),
                    nav = self.nav,
                    tabEl1 = nav.children().eq(tabIndex1),
                    tabEl2 = nav.children().eq(tabIndex2),
                    prevTabEl1 = (tabIndex1 > 0) ? $(nav.children().eq[tabIndex2 - 1]) : null,
                    tabTitle1, tabTitle2;

                if((!isFinite(tabIndex1) || tabIndex1 < 0 || tabIndex1 > self.TABSCOUNT) ||
                    (!isFinite(tabIndex2) || tabIndex2 < 0 || tabIndex2 > self.TABSCOUNT)) {
                    return 'Не правильный номер таба. Доступны табы с 0 по ' + (self.TABSCOUNT - 1) + '.';
                } else {
                    tabTitle1 = tabEl1.find(".ct-nav-item-link").html();
                    tabTitle2 = tabEl2.find(".ct-nav-item-link").html();
                    tabEl1.detach().insertAfter(tabEl2);
                    tabEl2.detach();
                    if(prevTabEl1) {
                        tabEl2.insertAfter(prevTabEl1);
                    } else {
                        tabEl2.prependTo(nav);
                    }
                    return 'Поменяли табы №' + tabIndex1 + ' "' + tabTitle1 + '" и №' + tabIndex2 + ' "' + tabTitle2 + '" местами.';
                }
            }

            self.consoleHist = consoleHist;
            self.consoleCmds = consoleCmds;
        },

        setInitState: function() {
            var self = this,
                index = self._getCurrentTabIndex();

            self._setTab(index);
        },

        setEventListeners: function() {
            var self = this,
                nav = self.nav,
                cons = self.cons,
                consInput = cons.find(".ct-console-input"),
                consOutput = cons.find(".ct-console-output");

            $(window).on("hashchange", function(event) {
                var index = self._getCurrentTabIndex();

                self._setTab(index);
            });

            $(nav).on("focusin", function(event) {
                var target = event.target,
                    index = target.getAttribute("tabindex");

                if(target.nodeName === "LI" && index && isFinite(index)) {
                    window.location.hash = "#tab" + index;
                }
            });

            consInput.on("keypress", function(event) {
                if(event.charCode === 13) {
                    var target = event.target,
                        cmdStr = target.value,
                        result;

                    target.value = "";
                    result = self._cmdExecute(cmdStr);
                    consOutput.html(result);
                    console.log(cmdStr);
                }                
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
        },

        _cmdExecute: function(cmdStr) {
            var self = this,
                cmdFuncRegExp = /^([_A-Z]\w*)\((\w+|(\w+,\s*)+\w+)*\)$/i,
                matchRes = cmdStr.match(cmdFuncRegExp),
                cmdName = (Array.isArray(matchRes) && matchRes[1]) ? matchRes[1] : null,
                cmdArgs = (Array.isArray(matchRes) && matchRes[2]) ? matchRes[2] : "",
                cmd;

            if(!matchRes || !has.call(self.consoleCmds, cmdName)) {
                return "Нет такой команды";
            } else {
                cmd = self.consoleCmds[cmdName];
                cmdArgs = cmdArgs.match(/(\w+)/g) || [];
                return cmd.apply(self, cmdArgs);
            }
        }
        
    };

jQuery.fn.consoleTabs = function(options) {
    var options = options || {},
        consoleTabsObj = inherit(consoleTabs);

    if(this.hasClass("consoletabs")) return false;

    consoleTabsObj.init(options);
    consoleTabsObj.build(this);
    consoleTabsObj.consoleInit();
    consoleTabsObj.setInitState();
    consoleTabsObj.setEventListeners();


    function inherit(proto) {
        function F() {}
        F.prototype = proto;
        return new F();
    }
};