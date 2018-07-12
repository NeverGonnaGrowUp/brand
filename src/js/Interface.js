"use strict";
/**
 * Модуль для реализации методов формирующих пользовательский интерфейс. Включает в себя также процедуры
 * аутентификации и выхода.
 */
var Interface = (function ($) {
  function authenticateUser(login, password) {
    $.ajax({
      url: 'http://localhost:3000/users?' + 'login=' + login + '&password=' + password,
      type: "GET",
      success: function (user) {
        if (user.length === 0) {
          $('.checkout-box__shipping-adress__form__red').text('Неверное имя или пароль');
          return;
        }

        $('.checkout-box__shipping-adress').css({
          'display': 'none'
        });

        render.renderLoginBox('#shipping-details', user[0]);
        $('#logout-button').on('click', logOut);
        localStorage.setItem('registered', 'true');
        localStorage.setItem('userId', user[0].id);

        var cart = JSON.parse(localStorage.getItem('cart'));
        if (cart && cart.length) {
          Cart.patchUserCart(user[0].id, cart);
        } else {
          if (typeof user[0].cart === 'string') {
            cart = JSON.parse(user[0].cart);
          } else {
            cart = user[0].cart;
          }
          render.renderHeaderCart('.cart-box__items', cart);
        }
      },

      error: function (jqXHR) {
        if (jqXHR.status === 404) {
          $('.checkout-box__shipping-adress__form__red').text('Неверное имя или пароль');
        } else {
          $('.checkout-box__shipping-adress__form__red').text('Ошибка сервера. Попробуйте повторить попытку');
        }
      }
    })
  }
  function logOut() {
    $('.checkout-box__shipping-adress__login-box').remove();
    localStorage.removeItem('registered');
    localStorage.removeItem('userId');
    $('.checkout-box__shipping-adress').css({
      'display': 'grid'
    });
    render.renderHeaderCart('.cart-box__items', JSON.parse(localStorage.getItem('cart')));
  }
  function renderLoginUser() {
    if (localStorage.getItem('registered') === 'true' && localStorage.getItem('userId')) {
      $.get('http://localhost:3000/users/' + localStorage.getItem('userId'), {}, function (user) {
        $('.checkout-box__shipping-adress').css({
          'display': 'none'
        });
        render.renderLoginBox('#shipping-details', user);
        $('#logout-button').on('click', logOut);
      })
    }
  }

  function addListeners() {
    $('#browse-button').on('click', function (event) {
      event.preventDefault();
      $('.browse-drop-down').slideToggle(1000);
    });

    $(document).on('click', function (event) {
      if (
        $(event.target).closest('#browse-button').length ||
        $(event.target).closest('.browse-drop-down').length
      ) {
        return;
      }

      $('.browse-drop-down').hide();
    });

    $(document).on('click', function (event) {
      if (
        $(event.target).closest('.header__right__cart-link').length ||
        $(event.target).closest('.cart-box').length
      ) {
        return;
      }

      $('.cart-box').hide();
      $('.cart-box__bottom').css('visibility', 'hidden');
    });

    $('.header__right__cart-link').on('mouseover',function () {
      $('.cart-box').slideDown(500, function () {
        $('.cart-box__bottom').css('visibility', 'visible');
      });
    });

    $('.cart-box').on('mouseleave', function () {
      $('.cart-box').hide();
    });

    $('.browse-drop-down').on('mouseleave', function () {
      $('.browse-drop-down').hide();
    });

    var subscribeValidator = Validator.init('email-form');
    $('#subscr-btn').on('click', function (event) {
      subscribeValidator.validate(event);
    });

    if ($('#checkout-form').length) {
      var checkoutValidator = Validator.init('checkout-form');
      document.getElementById('checkout-form').addEventListener('submit', function (event) {
        if (checkoutValidator.validate(event)) {
          event.preventDefault();
          authenticateUser($('#login-email-input').val(), $('#login-password-input').val());
        }
      })
    }

    if ($('#price-range-widget').length) {
      $('#price-range-widget').slider({
        range: true,
        min: 0,
        max: 100,
        step: 1,
        values: [ 40, 85 ],
        slide: function (event, ui) {
          if (ui.handleIndex === 0) {
            $('#min-price').text('$' + ui.value);
            $('#min-price').attr('data-min-price', ui.value);
          } else if (ui.handleIndex === 1) {
            $('#max-price').text('$' + ui.value);
            $('#max-price').attr('data-max-price', ui.value);
          }
        },
        create: function () {
          $('#min-price').text('$40');
          $('#min-price').attr('data-min-price', '40');
          $('#max-price').text('$85');
          $('#max-price').attr('data-max-price', '85');
        }
      });
    }

  }

  return {
    init: function () {
      $('.browse-drop-down').hide();
      $('.cart-box').hide();
      $('.browse-drop-down').css('visibility', 'visible');
      $('.cart-box').css('visibility', 'visible');
      addListeners();
      renderLoginUser();
    }
  }
})(jQuery);