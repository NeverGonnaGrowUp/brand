"use strict";
/**
 * Рендеринг блока выбора способа доставки. Вся информация берется с сервера.
 */
var ShippingRender = (function ($) {
  var countries;
  var selectedCountry;
  var selectedState;

  function onDocumentReady() {
    $.get('http://localhost:3000/delivery', {}, function (_countries) {
      countries = _countries;
      render.renderCountries('#country-select', countries);
      selectedCountry = 0;
      render.renderStates('#state-input-list', countries[selectedCountry].states);
      selectedState = 0;
      render.renderPostCodes('#postcode-input-list', countries[selectedCountry].states[selectedState].postCodes);
    })
  }
  function applyCoupon(coupons, userCoupon) {
    for (var key in coupons) {
      if (coupons[key].coupon === userCoupon) {
        changePrice(coupons[key]);
        return key;
      }
    }
  }
  function changePrice(userCoupon) {
    var $grandPrice = $('#grand-total-price');
    var $subPrice = $('#sub-total-price');

    var subPrice = +$subPrice.attr('data-price');
    var grandPrice = +$grandPrice.attr('data-price');

    var newSubPrice = Math.round(subPrice - (subPrice / 100) * userCoupon.discount);
    var newGrandPrice = Math.round(grandPrice - (subPrice / 100) * userCoupon.discount);

    $subPrice.text('$' + newSubPrice);
    $subPrice.attr('data-price', newSubPrice);
    $grandPrice.text('$' + newGrandPrice);
    $grandPrice.attr('data-price', newGrandPrice);

    $('#coupon-input').prop('readonly', true);
  }

  function addListeners() {
    $('#country-select').on('change', function () {
      selectedCountry = +$(this).val() - 1;
      $('#state-input').val('');
      $('#postcode-input').val('');
      render.renderStates('#state-input-list', countries[selectedCountry].states);
      render.renderPostCodes('#postcode-input-list', countries[selectedCountry].states[0].postCodes);
    });

    $('#state-input').on('change', function () {
      $('#postcode-input').val('');
      var stateIndex = $('#state-input-list').children('[value = "' + $(this).val() + '"]').attr('data-state-index');

      if (stateIndex) {
        selectedState = stateIndex;
        render.renderPostCodes('#postcode-input-list', countries[selectedCountry].states[selectedState].postCodes);
      } else {
        $('#postcode-input-list').empty();
      }
    });

    document.getElementById('shipping-form').addEventListener('submit', function (event) {
      event.preventDefault();

      if (selectedState) {
        var price = +countries[selectedCountry].states[selectedState].price + +$('#sub-total-price').attr('data-price');
        $('#grand-total-price').text('$' + price);
        $('#grand-total-price').attr('data-price', price);
      }

      return false;
    });

    document.getElementById('coupon-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var userCoupon = $('#coupon-input').val();

      if (localStorage.getItem('registered') && localStorage.getItem('userId')) {
        var userId = localStorage.getItem('userId');

        $.get('http://localhost:3000/users/' + userId, {}, function (_user) {
          var coupons;
          if (typeof _user.coupons === 'string') {
            coupons = JSON.parse(_user.coupons);
          } else {
            coupons = _user.coupons;
          }

          var couponIndex = applyCoupon(coupons, userCoupon);
          if (couponIndex) {
            coupons.splice(couponIndex, 1);
            $.ajax({
              url: 'http://localhost:3000/users/' + userId,
              type: 'PATCH',
              data: {coupons: JSON.stringify(coupons)},
            })
          }
        });
      } else {
        $.get('http://localhost:3000/coupons', {}, function (coupons) {
          applyCoupon(coupons, userCoupon);
        });
      }

      return false;
    });

  }

  return {
    init: function () {
      $(onDocumentReady);
      $(addListeners);
    }
  }
})(jQuery);

ShippingRender.init();