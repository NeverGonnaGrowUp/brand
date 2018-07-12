"use strict";

/**
 * Все действия связанные с корзиной пользователя. Релизована корзина для залогиненного пользователя
 * которая хранится на сервере и корзина для локального гостя которая хранится у него в localstorage.
 */
var Cart = (function ($) {
  /**
   * Обновление корзины пользователя на сервере
   */
  function patchUserCart(userId, cart, successCallback) {
    $.ajax({
      url: 'http://localhost:3000/users/' + userId,
      type: 'PATCH',
      data: {cart: JSON.stringify(cart)},
      success: function () {
        render.renderHeaderCart('.cart-box__items', cart);
        render.renderBodyCart('.cart__items', cart);
        if (successCallback !== undefined) {
          successCallback();
        }
      }
    })
  }
  /**
   * Поиск товара с заданным индексом
   */
  function findGoodIndex(cart, goodId) {
    var index = cart.findIndex(function (good) {
      return good.id.toString() === goodId;
    });

    return index;
  }
  /**
   * Обработка товара для корректного формирования json-запроса
   */
  function goodHandler(good, quantity) {
    for (var size in good.quantity) {
      for (var color in good.quantity[size]) {
        if (good.quantity[size][color] !== 0) {
          return {
            "size": size,
            "color": color,
            "quantity": quantity
          }
        }
      }
    }
  }
  /**
   * Добавление товара в локальное хранилище
   */
  function addGoodToLocalStorage(goodId, quantity = 1, size, color) {
    var cart = JSON.parse(localStorage.getItem('cart'));
    if (cart === null) {
      cart = [];
    }
    var good = cart[findGoodIndex(cart, goodId)];
    if (good !== undefined) {
      good.quantity = +good.quantity + +quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      render.renderHeaderCart('.cart-box__items', cart);
    } else {
      $.get('http://localhost:3000/goods/' + goodId, {}, function (good) {
        var add;
        if (size !== undefined && color !== undefined) {
          add = {
            "size": size,
            "color": color,
            "quantity": quantity
          }
        } else {
          add = goodHandler(good, quantity);
        }

        if (add) {
          cart.push(Object.assign(good, add));
          localStorage.setItem('cart', JSON.stringify(cart));
          render.renderHeaderCart('.cart-box__items', cart);
        } else {
          alert('К сожалению, этот товар временно закончился');
        }
      })
    }
  }
  /**
   * Удаление товара из локального хранилища
   */
  function removeGoodFromLocalStorage(goodId) {
    var cart = JSON.parse(localStorage.getItem('cart'));

    if (cart === null || cart.length === 0) {
      return;
    }

    var goodIndex = findGoodIndex(cart, goodId);
    if (goodIndex !== undefined) {
      cart.splice(goodIndex,1);
      localStorage.setItem('cart', JSON.stringify(cart));
      render.renderHeaderCart('.cart-box__items', cart);
      render.renderBodyCart('.cart__items', cart);
    }

  }
  /**
   * Удаление товара из корзины пользователя на сервере
   */
  function removeGoodFromRegisteredUserCart(goodId) {
    var userId = localStorage.getItem('userId');

    $.get('http://localhost:3000/users/' + userId, {}, function (user) {
      var cart;
      if (typeof user.cart === 'string') {
        cart = JSON.parse(user.cart);
      } else {
        cart = user.cart;
      }

      if (cart === null || cart.length === 0) {
        return;
      }

      var goodIndex = findGoodIndex(cart, goodId);
      if (goodIndex !== undefined) {
        cart.splice(goodIndex,1);
        patchUserCart(userId, cart);
      }
    })
  }
  /**
   * Изменение количества товаров в корзине пользователя на сервере
   */
  function changeGoodQuantityToRegisteredUserCart(goodId, add) {
    var userId = localStorage.getItem('userId');

    $.get('http://localhost:3000/users/' + userId, {}, function (user) {
      var cart;
      if (typeof user.cart === 'string') {
        cart = JSON.parse(user.cart);
      } else {
        cart = user.cart;
      }
      var good;

      if (cart.length) {
        good = cart[findGoodIndex(cart, goodId)];
      }

      if (good) {
        var newQuantity = +good.quantity + +add;

        if (newQuantity <= 0) return;

        good.quantity = newQuantity;
        patchUserCart(userId, cart);
      }
    });
  }
  /**
   * Изменение количества товаров в корзине пользователя в локальном хранилище
   */
  function changeGoodQuantityToLocalStorage(goodId, add) {
    var cart = JSON.parse(localStorage.getItem('cart'));

    if (cart === null) {
      cart = [];
    }
    var good = cart[findGoodIndex(cart, goodId)];

    if (good) {
      var newQuantity = +good.quantity + +add;

      if (newQuantity <= 0) return;

      good.quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      render.renderHeaderCart('.cart-box__items', cart);
      render.renderBodyCart('.cart__items', cart);
    }
  }
  /**
   * Добавление товара в корзину пользователя на сервере
   */
  function addGoodToRegisteredUserCart(goodId, quantity = 1, size, color) {
    var userId = localStorage.getItem('userId');

    $.get('http://localhost:3000/users/' + userId, {}, function (user) {
      var cart;
      if (typeof user.cart === 'string') {
        cart = JSON.parse(user.cart);
      } else {
        cart = user.cart;
      }
      var good;

      if (cart.length) {
        good = cart[findGoodIndex(cart, goodId)];
      }

      if (good) {
        good.quantity = +good.quantity + +quantity;
        patchUserCart(userId, cart);
      } else {
        $.get('http://localhost:3000/goods/' + goodId, {}, function (good) {
          var add;
          if (size !== undefined && color !== undefined) {
            add = {
              "size": size,
              "color": color,
              "quantity": quantity
            }
          } else {
            add = goodHandler(good, quantity);
          }

          if (add) {
            cart.push(Object.assign(good, add));
            patchUserCart(userId, cart);
          } else {
            alert('К сожалению, этот товар временно закончился');
          }
        })
      }
    })
  }
  /**
   * Действия при загрузке страницы
   */
  function onDocumentReady() {
    if (localStorage.getItem('registered') && localStorage.getItem('userId')) {
      $.get('http://localhost:3000/users/' + localStorage.getItem('userId'), {}, function (user) {
        var cart;
        if (typeof user.cart === 'string') {
          cart = JSON.parse(user.cart);
        } else {
          cart = user.cart;
        }
        if (cart) {
          render.renderHeaderCart('.cart-box__items', cart);
          render.renderBodyCart('.cart__items', cart);
        }
      })
    } else {
      var cart = JSON.parse(localStorage.getItem('cart'));
      render.renderHeaderCart('.cart-box__items', cart);
      render.renderBodyCart('.cart__items', cart);
    }
  }
  /**
   * Добавление обработчиков событий
   */
  function addListeners() {

    if ($('.featured-items').length || $('.cpb__product-box').length || $('.you-may-like-items').length) {
      $('.featured-items, .cpb__product-box, .you-may-like-items').on('click', '.featured-items__item_hover' ,function (event) {
        event.preventDefault();
        var id = $(this).children('a').attr('data-good-id');

        if (localStorage.getItem('registered') && localStorage.getItem('userId')) {
          addGoodToRegisteredUserCart.call(this, id);
        } else {
          addGoodToLocalStorage.call(this, id);
        }
      });
    }

    if ($('#clear-cart').length) {
      $('#clear-cart').on('click', function (event) {
        event.preventDefault();

        if (localStorage.getItem('registered') && localStorage.getItem('userId')) {
          var userId = localStorage.getItem('userId');
          patchUserCart(userId, []);
        } else {
          localStorage.setItem('cart', "[]");
          render.renderHeaderCart('.cart-box__items', []);
          render.renderBodyCart('.cart__items', []);
        }
      });
    }

    setTimeout(function () {
      if ($('#quantityLabel').length) {
        var validator = Validator.init('quantityLabel');

        $('.add-to-cart_spab').on('click', function (event) {
          event.preventDefault();
          if (validator.validate(event)) {
            var id = $(this).attr('data-good-id');
            var quantity = $('#spab-quantity').val();
            var color = $('#spab-color :selected').text();
            var size = $('#spab-size :selected').text();

            if (localStorage.getItem('registered') && localStorage.getItem('userId')) {
              addGoodToRegisteredUserCart.call(this, id, quantity, size, color);
            } else {
              addGoodToLocalStorage.call(this, id, quantity, size, color);
            }
          }
        });
      }
    }, 500);



    var $cartItems = $('.cart__items');
    if ($cartItems.length) {
      $cartItems.on('click', '.cart__items__quantity__add' ,function (event) {
        event.preventDefault();
        var id = $(this).attr('data-good-id');

        if (localStorage.getItem('registered') && localStorage.getItem('userId')) {
          changeGoodQuantityToRegisteredUserCart.call(this, id, 1);
        } else {
          changeGoodQuantityToLocalStorage.call(this, id, 1);
        }
      });

      $cartItems.on('click', '.cart__items__quantity__remove' ,function (event) {
        event.preventDefault();
        var id = $(this).attr('data-good-id');

        if (localStorage.getItem('registered') && localStorage.getItem('userId')) {
          changeGoodQuantityToRegisteredUserCart.call(this, id, -1);
        } else {
          changeGoodQuantityToLocalStorage.call(this, id, -1);
        }
      });
    }

    if ($cartItems.length || $('.cart-box__items').length) {
      $('.cart-box__items, .cart__items').on('click', '.cart__items__action__link' ,function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var id = $(this).attr('data-good-id');

        if (localStorage.getItem('registered') && localStorage.getItem('userId')) {
          removeGoodFromRegisteredUserCart(id);
        } else {
          removeGoodFromLocalStorage(id);
        }
      });
    }

  }

  return {
    init: function () {
      $(onDocumentReady);
      addListeners();
    },
    patchUserCart: function(userId, cart, successCallback) {
      patchUserCart(userId, cart, successCallback);
    }
  }
})(jQuery);
