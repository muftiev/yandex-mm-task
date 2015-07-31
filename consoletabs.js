var has = Object.prototype.hasOwnProperty,
    consoleTabs = {

        /**
         * Инициализация плагина - подмешивание свойст из объекта настроек
         * @param options - объект настроек
         */
        init: function(options) {
            for (var prop in options) {
                if (has.call(options, prop)) {
                    this[prop] = options[prop];
                }
            }
        },

        /**
         * Модификация DOM - создание всех элементов интерфейса
         * @param target - элемент, на который тнициализируется плагин
         */
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
                consHeader,
                consNav,
                consNavButton,
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
                    .attr("data-tabindex", indx)
                    .append(element)
                    .appendTo(container);
            });

            container.appendTo(target);

            nav = $("<ul/>")
                .addClass("ct-nav");

            for(var i = tabsCount - 1; i >= 0; i--) {
                navItemTitle = (navTitles[i]) ? navTitles[i] : "Раздел " + (i + 1);

                navItemLink = aElem.clone()
                    .addClass("ct-nav-item-link")
                    .attr("href", "#tab" + (i))
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
                .addClass("action-open-close")
                .attr("data-action", "close")
                .attr("title", "закрыть")
                .prependTo(consNav);

            consNavButton.addClass("action-show-hide");
                
            consNav.prependTo(consHeader);
            consHeader.appendTo(cons);

            divElem.clone()
                .addClass("ct-console-output")
                .html("Используйте команду help() для справки<br/>")
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

        /**
         * Инициализация консоли
         */
        consoleInit: function() {
            var self = this,
                consoleHist = [],
                consoleCmds = {};

            /**
             * Метод консоли - выбор таба по номеру
             * @param index - номер таба
             * @return string - результат операции для вывода в консоль
             */
            consoleCmds.selectTab = function(index) {
                var tabIndex = parseInt(index, 10),
                    tabTitle;

                if(!isFinite(tabIndex) || tabIndex < 0 || tabIndex > this.TABSCOUNT - 1) {
                    return 'Не удалось выбрать таб №' + tabIndex + '. Доступны табы с 0 по ' + (this.TABSCOUNT - 1) + '.';
                } else {
                    tabTitle = self.nav.find("[tabindex=" + (tabIndex + 1) + "] .ct-nav-item-link").html();
                    window.location.hash = "#tab" + (tabIndex);
                    return 'Выбран таб №' + tabIndex + ' "' + tabTitle + '".';
                }
            };

            /**
             * Метод консоли - меняет таб местами
             * @param index1 - номер первого таба
             * @param index2 - номер второго таба
             * @return string - результат операции для вывода в консоль
             */
            consoleCmds.swapTabs = function(index1, index2) {
                var tabIndex1 = parseInt(index1, 10),
                    tabIndex2 = parseInt(index2, 10),
                    navTabs = self.nav.children(),
                    tabEl1 = navTabs.filter("[tabindex=" + (tabIndex1 + 1) + "]"),
                    tabEl2 = navTabs.filter("[tabindex=" + (tabIndex2 + 1) + "]"),
                    tabTitle1, tabTitle2;

                if((!isFinite(tabIndex1) || tabIndex1 < 0 || tabIndex1 > self.TABSCOUNT) ||
                    (!isFinite(tabIndex2) || tabIndex2 < 0 || tabIndex2 > self.TABSCOUNT)) {
                    return 'Не правильный номер таба. Доступны табы с 0 по ' + (self.TABSCOUNT - 1) + '.';
                } else {
                    tabTitle1 = tabEl1.find(".ct-nav-item-link").html();
                    tabTitle2 = tabEl2.find(".ct-nav-item-link").html();
                    tabEl1.replaceWith(tabEl2.clone());
                    tabEl2.replaceWith(tabEl1);

                    return 'Поменяли табы №' + tabIndex1 + ' "' + tabTitle1 + '" и №' + tabIndex2 + ' "' + tabTitle2 + '" местами.';
                }
            };

            /**
             * Метод консоли - показывает статистику времени
             * @return string - результат операции для вывода в консоль
             */
            consoleCmds.showStat = function() {
                var stat = self.timeTracker.getStat(),
                    output = "Общее время работы со страницей: " + stat.sum + "<br/>";

                output += "Детализация времени просмотра табов:<br/>";
                output = stat.tabs.reduce(function(result, element, indx) {
                    var title = self.nav.find("[tabindex=" + (indx + 1) + "] .ct-nav-item-link").html();

                    result += indx + ' "' + title + '": ' + element + "<br/>";
                    return result;
                }, output);

                return output;
            };

            /**
             * Метод консоли - выводит справку по существующим командам
             * @return string - результат операции для вывода в консоль
             */
            consoleCmds.help = function() {
                return 'selectTab(tabIndex) - выбор таба с индексом tabIndex<br>' +
                    'swapTabs(tabIndex1, tabIndex2) - поменять местами в DOM табы tabIndex1 и tabIndex2<br>' +
                    'showStat() - показать статистику <br>';
            };

            self.consoleHist = consoleHist;
            self.consoleHistCurIndex = -1;
            self.consoleCmds = consoleCmds;
        },

        /**
         * Определение изначального состояния плагина
         */
        setInitState: function() {
            var self = this,
                index = self._getHashTabIndex();

            /**
             * Инициализация таймера для учета статистики
             * @return object - апи для работы с таймером
             */
            self.timeTracker = function() {
                var start = Date.now(),
                    point = start,
                    trackers = [],
                    current = index,
                    _formatTime = function(time) {
                        var start = new Date(0),
                            result = [],
                            years, monthes, days, hours, minutes, seconds;

                        start.setMilliseconds(time);
                        years = start.getYear() - 70;
                        monthes = start.getMonth();
                        days = start.getDate() - 1;
                        hours = start.getHours() - 3;
                        minutes = start.getMinutes();
                        seconds = start.getSeconds();
                        if(years) result.push(years + " лет");
                        if(monthes) result.push(monthes + " месяцев");
                        if(days) result.push(days + " дней");
                        if(hours) result.push(hours + " часов");
                        if(minutes) result.push(minutes + " минут");
                        if(seconds) result.push(seconds + " секунд");

                        return result.join(" ");
                    };

                return {
                    trackTime: function(indx) {
                        var now = Date.now(),
                            old = trackers[current] || 0,
                            time = now - point;

                        trackers[current] = old + time;
                        point = now;
                        current = indx;
                    },
                    getStat: function() {
                        var now = Date.now(),
                            old = trackers[current] || 0,
                            time = now - point,
                            sum = now - start;

                        trackers[current] = old + time;
                        point = now;

                        return {
                            tabs: trackers.map(function(element) {
                                return _formatTime(element);
                            }),
                            sum: _formatTime(sum)
                        };
                    }
                };
            }();

            self._setTab(index);
        },

        /**
         * Определение обработчиков событий
         */
        setEventListeners: function() {
            var self = this,
                nav = self.nav,
                cons = self.cons,
                consNav = cons.find(".ct-console-nav-button"),
                consInput = cons.find(".ct-console-input"),
                consOutput = cons.find(".ct-console-output");

            /**
             * Событие изменения хеша в адресной строке
             */
            $(window).on("hashchange", function() {
                var index = self._getHashTabIndex();

                self._setTab(index);
            });

            /**
             * Событие фокуса на табе при использовании клавиши tab
             */
            $(nav).on("focusin", function(event) {
                var target = event.target,
                    index = target.getAttribute("tabindex");

                if(target.nodeName === "LI" && isFinite(index)) {
                    window.location.hash = "#tab" + (index - 1);
                }
            });

            /**
             * Событие поднятия клавиши в командной строке консоли
             */
            consInput.on("keyup", function(event) {
                var target = event.target,
                    cmdStr = target.value,
                    newCmdStr,
                    result;

                switch(event.keyCode) {
                    case 13: // клавиша enter
                        target.value = "";
                        result = self._cmdExecute(cmdStr);
                        self.consoleHist.push(cmdStr);
                        self.consoleHistCurIndex = -1;
                        consOutput.append("/> " + cmdStr + "<br/>" + result + "<br/>");
                        consOutput.scrollTop(consOutput.prop('scrollHeight'));
                        break;
                    case 38: // клавиша arrowUp
                        newCmdStr = self._getPrevCmd();
                        if(newCmdStr) {
                            target.value = newCmdStr;
                        }
                        break;
                    case 40: // клавиша arrowDown
                        newCmdStr = self._getNextCmd();
                        if(newCmdStr) {
                            target.value = newCmdStr;
                        }
                        break;
                    default: // все остальные клавиши
                        self.consoleHistCurIndex = -1;
                        break;
                }
            });

            /**
             * Событие клика по кнопкам отображения консоли
             */
            consNav.on("click", function(event) {
                var target = event.target,
                    action = (target.dataset && has.call(target.dataset, "action")) ? target.dataset.action : null;

                if (!action) return false;
                switch(action) {
                    case "close":
                        consInput.hide();
                        consOutput.hide();
                        target.dataset.action = "open";
                        target.nextElementSibling.dataset.action = "show";
                        break;
                    case "hide":
                        consOutput.hide();
                        target.dataset.action = "show";
                        break;
                    case "open":
                        consInput.show();
                        consOutput.show();
                        target.dataset.action = "close";
                        target.nextElementSibling.dataset.action = "hide";
                        break;
                    case "show":
                        consOutput.show();
                        target.dataset.action = "hide";
                        break;
                }
            });
        },

        /**
         * Приватный метод получения номера таба из хеша
         * @return int - номера таба (по-умолчанию 0)
         */
        _getHashTabIndex: function() {
            var reg = new RegExp(/^#tab\d/),
                hash = (reg.test(window.location.hash)) ? window.location.hash.match(reg).shift() : null;

            return (hash) ? parseInt(hash.replace("#tab", ""), 10) : 0;
        },

        /**
         * Приватный метод переключения таба по номеру
         * @param index - номер таба
         */
        _setTab: function(index) {
            var self = this,
                content = $(self.content),
                nav = self.nav;

            if(isFinite(index)) {
                self.timeTracker.trackTime(index);
                nav.find(".active").removeClass("active");
                nav.find("[tabindex=" + (+index + 1) + "]").addClass("active");
                content.filter(".active").removeClass("active");
                content.filter("[data-tabindex=" + index + "]").addClass("active");
            }
        },

        /**
         * Приватный метод выполнения команды
         * @param cmdStr - введенная команда
         * @return function result - результат выполнения команды
         */
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
        },

        /**
         * Приватный метод получения предыдущей команды
         * @return string - предыдущая команда
         */
        _getPrevCmd: function() {
            var self = this,
                consoleHistCurIndex = self.consoleHistCurIndex,
                consoleHistLength = self.consoleHist.length,
                newConsoleHistCurIndex,
                newCmdStr;

            if(!consoleHistLength) {
                return false;
            }
            newConsoleHistCurIndex = (consoleHistCurIndex <= 0 || consoleHistCurIndex > (consoleHistLength - 1))
                ? consoleHistLength - 1
                : consoleHistCurIndex - 1;
            newCmdStr = self.consoleHist[newConsoleHistCurIndex];
            self.consoleHistCurIndex = newConsoleHistCurIndex;
            return newCmdStr;
        },

        /**
         * Приватный метод получения следующей команды
         * @return string - следующая команда
         */
        _getNextCmd: function() {
            var self = this,
                consoleHistCurIndex = self.consoleHistCurIndex,
                consoleHistLength = self.consoleHist.length,
                newConsoleHistCurIndex,
                newCmdStr;

            if(!consoleHistLength) {
                return false;
            }
            newConsoleHistCurIndex = (consoleHistCurIndex >= (consoleHistLength - 1)) ? 0 : consoleHistCurIndex + 1;
            newCmdStr = self.consoleHist[newConsoleHistCurIndex];
            self.consoleHistCurIndex = newConsoleHistCurIndex;
            return newCmdStr;
        }
        
    };

$.fn.consoleTabs = function(params) {
    var options = params || {},
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