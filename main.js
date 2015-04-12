$(window).load(function() {

    var options = {
        navTitles: ["Рейтинг", "Прогресс-бар", "Кнопка", "Список иконок"]
    }
    
    $(".main-content").consoleTabs(options);

    $(".consoletabs .ct-nav-item-link").first().addClass("active");
    $(".consoletabs .ct-tab").first().addClass("active");

});