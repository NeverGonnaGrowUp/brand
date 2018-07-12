"use strict";

/**
 * Автокомплит списка названий товаров в header сайта.
 */
var Autocomplete = (function ($) {

  var goods = [];
  var lastInput = '';
  var autocompleteBegin = false;
  var minLettersInput = 3;

  function renderGood(good, currentInput) {
    var regExp = new RegExp('^' + currentInput, 'i');

    var span = $('<span />', {
      text: good.title.replace(regExp, '')
    });

    $('<span />', {
      class: 'user-input',
      text: currentInput
    }).prependTo(span);

    var div = $('<div />', {
      class: 'autocomplete-box__item'
    });

    span.appendTo(div);
    div.appendTo('#autocomplete-box');
  }
  /**
   * Отображает на странице товары подходящие под запрос пользователя.
   */
  function renderGoodsTitles(currentInput, regExp) {
    $('#autocomplete-box').empty();
    if (currentInput) {
      if (regExp === undefined) {
        goods.forEach(function (good) {
          renderGood(good, currentInput);
        })
      } else {
        goods.forEach(function (good) {
          if (regExp.test(good.title)) {
            renderGood(good, currentInput);
          }
        })
      }
    }
  }

  /**
   * Добавляет слушатели событий. Обрабатывает пользовательский ввод, клик по найденному элементу и клик вне блока с результатами поиска.
   */
  function addListeners() {

    $(document).on('input', '#search-input', function () {
      var currentInput = $(this).val();
      if (!autocompleteBegin) {
        if (currentInput.length >= minLettersInput) {
          $.get('http://localhost:3000/goods?title_like=^' + currentInput, {}, function (filteredGoods) {
            if (filteredGoods.length) {
              goods = filteredGoods;
              renderGoodsTitles(currentInput);
              autocompleteBegin = true;
            }
          })
        }
      } else {
        if (currentInput.length > lastInput.length && lastInput.length) {
          var regExp = new RegExp('^' + currentInput, 'i');
          renderGoodsTitles(currentInput, regExp);
        } else {
          if (currentInput.length >= 1) {
            $.get('http://localhost:3000/goods?title_like=^' + currentInput, {}, function (filteredGoods) {
              if (filteredGoods.length) {
                goods = filteredGoods;
                renderGoodsTitles(currentInput);
              }
            })
          } else {
            $('#autocomplete-box').empty();
          }
        }
      }

      lastInput = $(this).val();
    });

    $('#autocomplete-box').on('click', '.autocomplete-box__item', function () {
      $('#search-input').val($(this).text());
      $('#autocomplete-box').empty();
    });

    $(document).on('mouseup', function (e) {
      var container = $('#autocomplete-box');
      if (container.has(e.target).length === 0) {
        container.empty();
      }
    });

    $('.search-button').on('click', function (event) {
      event.preventDefault();

      if (goods.length) {
        var userInput = $('#search-input').val();
        var regExp = new RegExp('^' + userInput + '$', 'i');

        goods.find(function (good) {
          if (regExp.test(good.title)) {
            window.open("single_page.html?id=" + good.id);
            return true;
          }

          return false;
        })
      }
    })
  }

  return {
    init: function () {
      addListeners();
    }
  }
})(jQuery);