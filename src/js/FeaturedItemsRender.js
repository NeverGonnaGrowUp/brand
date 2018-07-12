"use strict";
/**
 * Рендеринг популярных товаров на главной странице. Индексы популярных товаров берутся с сервера.
 */
var FeaturedItemsRender = (function ($) {
  var hidedItems = [];

  function renderItems(renderCount) {
    var currentItem = 0;

    $.get('http://localhost:3000/featuredItemsId', {}, function (ids) {
      ids.forEach(function (id) {
        $.get('http://localhost:3000/goods/' + id, {}, function (good) {
          if (currentItem < renderCount) {
            render.renderFeaturedItems('.featured-items-box',good);
            currentItem++;
          } else {
            hidedItems.push(good);
          }
        })
      })
    });

    $('.browse-all-btnlnk').attr('data-render-count', renderCount);
    $('.browse-all-btnlnk').attr('data-current-page', 0);
  }

  function addListeners() {
    var button = $('.browse-all-btnlnk');

    button.on('click', function (event) {
      event.preventDefault();

      var count = button.attr('data-render-count');
      var page = button.attr('data-current-page');
      var index = count * page;

      if (index >= hidedItems.length) {
        return;
      }

      for (var i = index ; i < index + count; i++) {
        render.renderFeaturedItems('.featured-items-box', hidedItems[i]);
      }

      button.attr('data-current-page', +page + 1);
    });

  }

  return {
    init: function () {
      $(function () {
        renderItems(8);
        addListeners();
      });
    }
  }
})(jQuery);
FeaturedItemsRender.init();