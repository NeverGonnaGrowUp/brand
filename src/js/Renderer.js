"use strict";
/**
 * Класс для рендеринга всего на сайте. Релищует интерфейс для отрисовки элементов. Используется другими модуляим.
 */
function Renderer() {

  function createHoverBox() {
    var $divHover = $('<div/>', {
      class: 'featured-items__item_hover'
    });

    var $aHover = $('<a/>', {
      href: '#',
      class: 'add-to-cart'
    });

    $aHover.append($('<img/>',{
      src: '../img/cart.svg',
      alt: 'cart image',
      class: 'add-to-cart-img'
    }));

    $aHover.append($('<span/>',{
      text: 'Add to Cart'
    }));

    $divHover.append($aHover);
    return $divHover;
  }
  function createGoodArticle(item) {
    var $article = $('<article/>', {
      class: 'featured-items__item'
    });

    var $a = $('<a/>', {
      href: 'single_page.html?id=' + item.id,
      class: 'featured-items__item__link'
    });

    $a.append($('<img/>',{
      src: item.src,
      alt: item.title
    }));

    var $div = $('<div/>', {
      class: 'featured-items__item__text'
    });

    $div.append($('<p/>',{
      class: 'featured-item-name margin-padding-null',
      text: item.title
    }));

    $div.append($('<span/>',{
      class: 'featured-item-price',
      text: '$' + parseFloat(item.price).toFixed(2)
    }));

    $a.append($div);

    $article.append($a);
    $article.append(createHoverBox());

    return $article;
  }
  function createRatingStarsBox(rating) {
    var $div = $('<div/>', {
      class: 'cart-box__item__left__stars',
    });
    for (var i = 0; i < Math.floor(rating); i++) {
      $div.append($('<i/>', {
        class: 'fas fa-star'
      }));
    }

    var fraction = rating - Math.floor(rating);
    if (fraction > 0.25 && fraction < 0.75) {
      $div.append($('<i/>', {
        class: 'fas fa-star-half-alt'
      }));
    } else if (fraction >= 0.75) {
      $div.append($('<i/>', {
        class: 'fas fa-star'
      }));
    }

    return $div;
  }
  function createHeaderCartItem(good) {
    var $article = $('<article/>', {
      class: 'cart-box__item'
    });

    var $a = $('<a/>', {
      href: 'single_page.html?id=' + good.id,
      class: 'cart-box__item__left'
    });

    $a.append($('<img/>',{
      src: good.src,
      alt: good.title,
      class: 'cart-box__item__left__img'
    }));

    $a.append($('<h2/>',{
      class: 'margin-padding-null cart-box__item__left__h2',
      text: good.title
    }));

    $a.append(createRatingStarsBox(good.rating));

    $a.append($('<span/>',{
      class: 'cart-box__item__left__price',
      text: good.quantity + ' x $' + good.price
    }));

    $article.append($a);

    var $div = $('<div/>', {
      class: 'cart-box__item__right'
    });

    var $removeLink = $('<a/>', {
      href: '#',
      class: 'cart__items__action__link',
      'data-good-id': good.id
    });

    $removeLink.append($('<i/>', {
      class: 'fa fa-times-circle',
      'aria-hidden': 'true'
    }));

    $div.append($removeLink);
    $article.append($div);

    return $article;
  }
  function calculatePrice(cart) {
    var sum = 0;
    for (var good of cart) {
      sum+= +good.quantity * +good.price;
    }

    return sum;
  }
  function renderEmptyHeaderCart(containerSelector) {
    $(containerSelector).append($('<div/>', {
      text: 'Cart is empty',
      class: 'empty-cart-text'
    }));
    $('#total-price').text('$0.00');
  }

  this.renderHeaderCart = function (containerSelector, cart) {
    var $container = $(containerSelector);
    $container.empty();

    if (cart === null || cart.length === 0) {
      renderEmptyHeaderCart(containerSelector);
      return;
    }

    cart.forEach(function (good) {
      $container.prepend(createHeaderCartItem(good));
    });

    $('#total-price').text('$' + calculatePrice(cart).toFixed(2));
  };

  this.renderFeaturedItems = function (containerSelector, items, additionClasses) {
    var $container = $(containerSelector);
    // $container.empty();

    if (Array.isArray(items)) {
      items.forEach(function (item) {
        var $article = createGoodArticle(item);
        $article.find('.add-to-cart').attr('data-good-id', item.id);
        if (additionClasses) {
          $article.addClass(additionClasses);
        }
        $container.append($article);
      })
    } else {
      var $article = createGoodArticle(items);
      $article.find('.add-to-cart').attr('data-good-id', items.id);
      if (additionClasses) {
        $article.addClass(additionClasses);
      }
      $container.append($article);
    }
  };

  function createSelect(items, selectId) {
    var $select = $('<select/>', {
      id: selectId,
      class: 'spab__select'
    });

    items.forEach(function (item) {
      $select.append($('<option/>', {
        class: 'spab__select__option',
        text: item
      }))
    });

    return $select;
  }
  function getSizes(good) {
    var sizes = [];

    for (var size in good.quantity) {
      for (var color in good.quantity[size]) {
        if (good.quantity[size][color] > 0) {
          sizes.push(size);
          break;
        }
      }
    }

    return sizes;
  }
  function getColors(good) {
    var colors = [];

    for (var size in good.quantity) {
      for (var color in good.quantity[size]) {
        if (good.quantity[size][color] > 0) {
          colors.push(color);
        }
      }
      if (colors.length) break;
    }

    return colors;
  }
  function labelWrapper(item, text) {
    var $label = $('<label/>', {
      class: 'spab__form__label margin-padding-null'
    });

    $label.append($('<span/>', {
      class: 'spab__form__span',
      text: text
    }));

    $label.append($('<br>'));
    $label.append(item);

    return $label;
  }
  function createAddBoxTop(good) {
    var $div = $('<div>', {
      class: 'spab__content__top'
    });

    $div.append($('<h3/>', {
      class: 'spab__h3 margin-padding-null',
      text: good.brand
    }));

    $div.append($('<h2/>', {
      class: 'spab__h2 margin-padding-null',
      text: good.title
    }));

    $div.append($('<p/>', {
      class: 'spab__paragraph margin-padding-null',
      text: good.description
    }));

    var $materialBox = $('<div>', {
      class: 'spab__material-box'
    });

    $materialBox.append($('<span/>', {
      class: 'spab__material-box__material',
      html: "<span style='color: #b9b9b9;'>MATERIAL:</span>"
    }));
    $materialBox.children('.spab__material-box__material').append($('<span/>', {
      text: good.material
    }));

    $materialBox.append($('<span/>', {
      class: 'spab__material-box__designer',
      html: "<span style='color: #b9b9b9;'>DESIGNER:</span>"
    }));
    $materialBox.children('.spab__material-box__designer').append($('<span/>', {
      text: good.designer
    }));

    $div.append($materialBox);
    $div.append($('<span/>', {
      class: 'spab__price',
      text: '$' + good.price
    }))

    return $div;
  }
  function createAddBoxBottom(good) {
    var $div = $('<div/>', {
      class: 'spab__content__bottom'
    });

    var $form = $('<form/>', {
      action: ''
    });

    var $sizeLabel = labelWrapper(createSelect(getSizes(good), 'spab-size'), 'choose size');
    $form.append($sizeLabel);

    var $colorLabel = labelWrapper(createSelect(getColors(good), 'spab-color'), 'choose color');
    $colorLabel.append($('<div/>', {
      class: 'spab_square'
    }));
    $form.append($colorLabel);

    var $quantityLabel = labelWrapper($('<input/>', {
      type: 'text',
      class: 'spab__select',
      id: 'spab-quantity',
      value: 1,
      'data-validation-rule': 'quantity'
    }),'quantity');
    $quantityLabel.attr('id', 'quantityLabel');
    $form.append($quantityLabel);

    var $buttonBox = $('<div/>', {
      class: 'spab__form_flex'
    });

    var $a = $('<a/>', {
      href: '#',
      class: 'add-to-cart add-to-cart_spab',
      id: 'add-to-cart_spab',
      'data-good-id': good.id
    });

    $a.append($('<img/>', {
      src: '../img/cart-pink.png',
      alt: 'cart',
      class: 'add-to-cart-img'
    }));

    $a.append($('<span/>', {
      text: 'Add to Cart'
    }));

    $buttonBox.append($a);
    $form.append($buttonBox);
    $div.append($form);

    return $div;
  }

  this.renderColorIndicator = function(colorIndicatorSelector, color) {
    $(colorIndicatorSelector).css('background-color', color);
  };
  this.renderSinglePage = function (containerSelector, sliderImageBoxSelector, good) {
    $(sliderImageBoxSelector).empty();
    $(sliderImageBoxSelector).append($('<img/>', {
      src: good.src,
      alt: good.title,
      class: 'single-page-slider__item__img'
    }));

    $(containerSelector).empty();
    $(containerSelector).append(createAddBoxTop(good));
    $(containerSelector).append(createAddBoxBottom(good));
  };
  this.renderColorSelect = function (sizeSelector, colorSelector, colorIndicatorSelector, good) {
    var size = $(sizeSelector + ' :selected').text();
    var colors = good.quantity[size];
    $(colorSelector).empty();

    for (var key in colors) {
      if (+colors[key] !== 0) {
        $(colorSelector).append($('<option/>', {
          text: key
        }))
      }
    }

    this.renderColorIndicator(colorIndicatorSelector, $(colorSelector + ' :selected').text());

  };

  function createCartItemsHeader() {
    var $div = $('<div/>', {
      class: 'cart__items__header'
    });

    $div.html('' +
      '                <div class="cart__items__product-details">\n' +
      '                    <h5 class="cart__items__header__h cart__items__header__h_h5">Product Details</h5> </div>\n' +
      '                <div class="cart__items__unit-price">\n' +
      '                    <h5 class="cart__items__header__h cart__items__header__h_h5">Unit Price</h5> </div>\n' +
      '                <div class="cart__items__quantity">\n' +
      '                    <h5 class="cart__items__header__h cart__items__header__h_h5">Quantity</h5> </div>\n' +
      '                <div class="cart__items__shipping">\n' +
      '                    <h5 class="cart__items__header__h cart__items__header__h_h5">Shipping</h5> </div>\n' +
      '                <div class="cart__items__subtotal">\n' +
      '                    <h5 class="cart__items__header__h cart__items__header__h_h5">Subtotal</h5> </div>\n' +
      '                <div class="cart__items__action jcfe">\n' +
      '                    <h5 class="cart__items__header__h cart__items__header__h_h5">Action</h5> </div>' +
      '');

    return $div;
  }
  function renderEmptyBodyCart(containerSelector) {
    $(containerSelector).empty();
    $(containerSelector).append($('<div/>', {
      text: 'Cart is empty. Please use out catalog to fill it.',
      class: 'cart__empty'
    }))
  }
  function createBodyCartItem(good) {
    var $div = $('<div/>', {
      class: 'cart__items__item'
    });

    $div.html('' +
      '<div class="cart__items__product-details">\n' +
      '                    <a href="#"><img src=' + good.src + ' alt=' + good.title + ' class="cart__items__product-details__img"></a>\n' +
      '                    <div class="cart__items__product-details__title">\n' +
      '                        <h6 class="cart__items__header__h cart__items__header__h_h6">' + good.title + '</h6> <span class="cart__items__product-details__title__span">Color: </span>' + good.color + '\n' +
      '                        <br> <span class="cart__items__product-details__title__span">Size: </span>' + good.size + ' </div>\n' +
      '                </div>\n' +
      '                <div class="cart__items__unit-price"> <span>$' + good.price + '</span> </div>\n' +
      '                <div class="cart__items__quantity">\n' +
      '                    <input type="text" class="cart__items__quantity__input" value=' + good.quantity + ' readonly> </div>\n' +
      '                <div class="cart__items__shipping"> <span>free</span> </div>\n' +
      '                <div class="cart__items__subtotal"> <span>$' + good.quantity * good.price + '</span> </div>\n' +
      '                <div class="cart__items__action"> <a href="#" class="cart__items__action__link" data-good-id="' + good.id + '"><i class="fa fa-times-circle" aria-hidden="true"></i></a> </div>' +
      '');
    $div.find('.cart__items__header__h_h6').after(createRatingStarsBox(good.rating));

    $div.find('.cart__items__quantity').append($('<a>', {
      href: '#',
      class: 'cart__items__quantity__add',
      html: '<i class="fas fa-plus-circle"></i>',
      'data-good-id': good.id
    }));
    $div.find('.cart__items__quantity').prepend($('<a>', {
      href: '#',
      class: 'cart__items__quantity__remove',
      html: '<i class="fas fa-minus-circle"></i>',
      'data-good-id': good.id
    }));

    return $div;
  }

  this.renderBodyCart = function (containerSelector, cart) {
    var $container = $(containerSelector);
    $container.empty();

    $container.append(createCartItemsHeader());

    if (cart === null || cart.length === 0) {
      renderEmptyBodyCart('.cart');
      return;
    }

    cart.forEach(function (good) {
      $container.append(createBodyCartItem(good));
    });

    var price = calculatePrice(cart);
    $('#sub-total-price').text('$'+ price);
    $('#sub-total-price').attr('data-price', price);
    $('#grand-total-price').text('$' + price);
    $('#grand-total-price').attr('data-price', price);
  };

  this.renderCountries = function (containerSelector, countries) {
    var $container = $(containerSelector);
    $container.empty();

    countries.forEach(function (country) {
      $container.append($('<option/>', {
        value: country.id,
        text: country.name
      }))
    })
  };
  this.renderStates = function (datalistId, states) {
    var $datalist = $(datalistId);
    $datalist.empty();
    var index = 0;

    states.forEach(function (state) {
      $datalist.append($('<option/>', {
        value: state.name,
        text: state.name,
        'data-state-index': index
      }));

      index++;
    });
  };
  this.renderPostCodes = function (datalistId, postCodes) {
    var $datalist = $(datalistId);
    $datalist.empty();

    postCodes.forEach(function (postCode) {
      $datalist.append($('<option/>', {
        value: postCode,
        text: postCode
      }))
    })
  };

  function createCatalogPaginationItem(pageNumber) {
    var $li = $('<li/>', {
      class: 'cpb__nav__ul__li'
    });

    $li.append($('<a/>', {
      href: '#top',
      title: 'Перейти на страницу ' + pageNumber,
      'data-page': pageNumber,
      class: 'cpb__nav__ul__link',
      text: pageNumber
    }));

    return $li;
  }

  this.renderCatalogPaginationLiItems = function (containerSelector, pagesCount) {
    var $ul = $(containerSelector);
    $ul.empty();

    for (var i = 1; i <= pagesCount; i++) {
      $ul.append(createCatalogPaginationItem(i));
    }
  };
  
  function createDetailsUlItem(item) {
    var $li = $('<li/>', {
      class: 'cpb__li'
    });

    $li.html('<a href="#" class="cpb__link">' + item + '</a>');
    return $li;
  }

  this.renderProductDetails = function (containerSelector, summaryText, items) {
    var $details = $('<details/>', {
      class: 'choose-product-box__details'
    });

    $details.append($('<summary/>', {
      class: 'choose-product-box__summary',
      text: summaryText
    }));

    var $ul = $('<ul/>', {
      class: 'choose-product-box__ul'
    });

    items.forEach(function (item) {
      $ul.append(createDetailsUlItem(item));
    });

    $details.append($ul);
    $(containerSelector).append($details);

    return $details;
  };
  this.renderLoginBox = function (containerSelector, user) {
    var $container = $(containerSelector);

    var $div = $('<div/>', {
      class: 'checkout-box__shipping-adress__login-box',
      html: '                    <h4 class="margin-padding-null checkout-box__h checkout-box__h_h4"></h4>\n' +
      '                    <span class="margin-padding-null checkout-box__h checkout-box__h_h2">Thanks for visiting us!</span><br>\n' +
      '                    <button id="logout-button" class="btnlnk btnlnk_cart btnlnk_checkout">Log out</button>'
    });
    $div.children('h4').text('Hi, ' + user.name + '.');

    $container.append($div);
  }

}
