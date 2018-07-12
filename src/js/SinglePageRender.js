"use strict";
/**
 * Рендеринг страницы товара.
 */
var SinglePageRender = (function ($) {

  var urlParams = window.location.search.replace('?','').split('&')
    .reduce(function(p,e){
        var a = e.split('=');
        p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
        return p;
      },
      {}
    );

  function onDocumentReady() {
    $.get('http://localhost:3000/featuredItemsId?_page=1&_limit=4', {}, function (ids) {
      var url = 'http://localhost:3000/goods?';
      for (var key in ids) {
        if (key === 0) {
          url += 'id=' + ids[key];
        } else {
          url += '&id=' + ids[key];
        }
      }
      $.get(url, {}, function (goods) {
        render.renderFeaturedItems('.you-may-like-items', goods);
      })
    });
    $('.single-page-slider').bxSlider();
  }

  function addListeners(good) {
    $(function () {
      render.renderColorIndicator('.spab_square', $('#spab-color :selected').text());
    });

    $('#spab-size').on('change', function () {
      render.renderColorSelect('#spab-size', '#spab-color', '.spab_square', good);
    });

    $('#spab-color').on('change', function () {
      render.renderColorIndicator('.spab_square', $('#spab-color :selected').text());
    });
  }

  return {
    init: function () {
      $(onDocumentReady);
      $.get('http://localhost:3000/goods/' + urlParams['id'], {}, function (good) {
        render.renderSinglePage('.single-product-add-box__content', '.single-page-slider__item', good);
        setTimeout(function () {
          addListeners(good);
          $('.bx-prev').html('<i class="fas fa-chevron-left"></i>');
          $('.bx-next').html('<i class="fas fa-chevron-right"></i>');
        }, 500);
      })
    }
  }
})(jQuery);

SinglePageRender.init();