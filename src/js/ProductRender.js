"use strict";
/**
 * Рендеринг страницы выбора товаров. Релизованы методы сортировки, выбора по категориям и диапазону цен.
 */
var ProductRender = (function ($) {
  var currentPage = 1;
  var currentSortRule = 'title';
  var currentOrder = 'asc';
  var currentRenderCount;
  var material = '.';
  var sizeURL = '';
  var pagesCount;
  var url;
  var details = {
    category: '.',
    brand: '.',
    designer: '.'
  };

  function getSliderFilteredGoods(goods) {
    var filteredGoods = [];
    goods.forEach(function (good) {
      if (+good.price >= +$('#min-price').attr('data-min-price') && +good.price <= +$('#max-price').attr('data-max-price')) {
        filteredGoods.push(good);
      }
    });

    return filteredGoods;
  }
  function findSliderFilteredGoodsCount(goods) {
    var count = 0;
    goods.forEach(function (good) {
      if (+good.price > +$('#min-price').attr('data-min-price') && +good.price < +$('#max-price').attr('data-max-price')) {
        count++;
      }
    });

    return count;
  }
  function renderPagination(containerSelector, renderCount = currentRenderCount) {
    updateURL();
    $.get(url.replace(/&_page=\d+&_limit=\d+/,''), {}, function (goods) {
      pagesCount = Math.ceil(findSliderFilteredGoodsCount(goods) / +renderCount);
      render.renderCatalogPaginationLiItems(containerSelector, pagesCount);
      $('.cpb__nav__ul__li:first-child').children('.cpb__nav__ul__link').addClass('cpb__nav__ul__link_active');
      currentPage = 1;
    })
  }

  function renderDetails(containerSelector) {
    $(containerSelector).empty();

    $.get('http://localhost:3000/categories', {}, function (categories) {
      var $category = render.renderProductDetails(containerSelector, 'Category', categories);
      $category.attr('open', 'open');
      $category.attr('id', 'category-details');
      $category.attr('data-filter', 'category');
    });

    $.get('http://localhost:3000/brands', {}, function (brands) {
      var $brands = render.renderProductDetails(containerSelector, 'Brands', brands);
      $brands.attr('id', 'brands-details');
      $brands.attr('data-filter', 'brand');
    });

    $.get('http://localhost:3000/designers', {}, function (designers) {
      var $designers = render.renderProductDetails(containerSelector, 'Designers', designers);
      $designers.attr('id', 'designers-details');
      $designers.attr('data-filter', 'designer');
    });
  }

  function onDocumentReady() {
    currentRenderCount = $('#show-select').val();
    renderDetails('.choose-product-box__left');
    renderItems();
    renderPagination('.cpb__nav__ul');
  }

  function updateURL() {
    // url = 'http://localhost:3000/goods?_sort=' + currentSortRule + '&_order=' + currentOrder + '&_page=' + currentPage
    //   + '&_limit=' + currentRenderCount + '&material_like=' + material + '&category_like=' + details.category
    //   + '&brand_like=' + details.brand + '&designer_like=' + details.designer + sizeURL;
    url = 'http://localhost:3000/goods?_sort=' + currentSortRule + '&_order=' + currentOrder + '&material_like=' + material + '&category_like=' + details.category
      + '&brand_like=' + details.brand + '&designer_like=' + details.designer + sizeURL;
  }

  // function renderItems() {
  //   updateURL();
  //
  //   $.get(url, {}, function (goods) {
  //     $('.cpb__product-box').empty();
  //     if (goods.length === 0) {
  //       $('.cpb__product-box').append($('<div/>', {
  //         text: 'По вашим критериям ничего не найдено',
  //         class: 'cpb__product-box__empty-box'
  //       }))
  //     }
  //     goods.forEach(function (good) {
  //       // if (+good.price > +$('#min-price').attr('data-min-price') && +good.price < +$('#max-price').attr('data-max-price')) {
  //       //   render.renderFeaturedItems('.cpb__product-box', good, 'cpb__product-box__item');
  //       // }
  //       render.renderFeaturedItems('.cpb__product-box', good, 'cpb__product-box__item');
  //     })
  //   });
  // }

  function renderItems() {
    updateURL();

    $.get(url, {}, function (goods) {
      $('.cpb__product-box').empty();
      var filteredGoods = getSliderFilteredGoods(goods);
      if (filteredGoods.length === 0) {
        $('.cpb__product-box').append($('<div/>', {
          text: 'По вашим критериям ничего не найдено',
          class: 'cpb__product-box__empty-box'
        }));
        return;
      }
      var startIndex = (currentPage - 1) * +currentRenderCount;
      if (startIndex >= filteredGoods.length) {
        return;
      }

      for (var i = startIndex; i < startIndex + +currentRenderCount && i < filteredGoods.length; i++) {
        render.renderFeaturedItems('.cpb__product-box', filteredGoods[i], 'cpb__product-box__item');
      }
    });
  }

  function addListeners() {
    $('.cpb__nav').on('click', '.cpb__nav__btn, .cpb__nav__ul__link', function () {
      var oldPage = currentPage;

      var $this = $(this);
      if ($this.hasClass('cpb__nav__btn_prev')) {
        if (currentPage === 1) {
          return;
        }
        currentPage--;
      } else if ($this.hasClass('cpb__nav__btn_next')) {
        if (currentPage === pagesCount) {
          return;
        }
        currentPage++;
      } else if ($this.hasClass('cpb__nav__ul__link')){
        if ($this.hasClass('cpb__nav__ul__link_active')) {
          return;
        }
        currentPage = +$this.attr('data-page');
      }

      $('.cpb__nav').find('a[data-page = "'+ oldPage +'"]').removeClass('cpb__nav__ul__link_active');
      $('.cpb__nav').find('a[data-page = "'+ currentPage +'"]').addClass('cpb__nav__ul__link_active');
      renderItems();
    });

    $('#sort-by-select').on('change', function () {
      currentSortRule = $(this).val();
      renderItems();
    });

    $('#show-select').on('change', function () {
      currentRenderCount = $(this).val();
      renderPagination('.cpb__nav__ul');
      renderItems();
    });

    $('#order-div').on('click', '.cpbsb__sort-order-icon', function (event) {
      event.preventDefault();
      var $this = $(this);
      currentOrder = $this.attr('data-order');
      $this.parent().children('.cpbsb__sort-order-icon').removeClass('cpbsb__sort-order-icon_active');
      $this.addClass('cpbsb__sort-order-icon_active');
      renderItems();
    });

    $('.cpbsb__brand__ul').on('click', '.cpbsb__brand__link', function (event) {
      event.preventDefault();
      var $this = $(this);
      $this.parent().parent().find('.cpbsb__brand__link').removeClass('cpbsb__brand__link_active');

      if ($this.attr('data-material') === material) {
        material = '.';
      } else {
        material = $this.attr('data-material');
        $this.addClass('cpbsb__brand__link_active');
      }

      renderPagination('.cpb__nav__ul');
      renderItems();
    });

    $('.choose-product-box__left').on('click', '.cpb__link', function (event) {
      event.preventDefault();
      var $this = $(this);
      var $details = $this.closest('details');
      var filter = $details.attr('data-filter');

      $details.find('.cpb__link_active').removeClass('cpb__link_active');

      if ($this.text() === details[filter]) {
        details[filter] = '.';
      } else {
        details[filter] = $this.text();
        $this.addClass('cpb__link_active');
      }

      renderPagination('.cpb__nav__ul');
      renderItems();
    });

    $('.cpbsb__size__ul').on('change', 'input', function () {
      var $this = $(this);
      var size = $this.val();
      var str = '&quantity.' + size + '_like=.';

      if ($this.is(':checked')) {
        sizeURL += str;
      } else {
        sizeURL = sizeURL.replace(str,'');
      }

      renderPagination('.cpb__nav__ul');
      renderItems();
    });

    $('#price-range-widget').on('slidestop', function () {
      renderPagination('.cpb__nav__ul');
      renderItems();
    });

  }

  return {    init: function () {
      $(onDocumentReady);
      $(addListeners);
    }
  }
})(jQuery);

ProductRender.init();