"use strict";

var Validator = (function ($) {
  /**
   * Правила валидации полей форм
   * @property {object.regExp} Регулярное выражение для проверки поля ввода
   * @property {object.errorMsg} Сообщение об ошибке выводимое в случае некорректно введенных данных
   */
  var validation = {
    name: {
      regExp: /^[A-Za-zА-Яа-яёЁ\s]+$/,
      errorMsg: 'Имя должно содеражть только буквы!',
    },

    phone: {
      regExp: /^\+\d\(\d{3}\)\d{3}-\d{4}$/,
      errorMsg: 'Телефон должен быть в формате +7(000)000-0000',
    },

    email: {
      regExp: /^[-.a-z0-9]+@([a-z0-9]+\.)+[a-z]{2,6}$/,
      errorMsg: '- Введенный Вами e-mail должен выглядеть как mymail@mail.ru, или my.mail@mail.ru, или my-mail@mail.ru',
    },

    quantity: {
      regExp: /^[1-9]$/,
      errorMsg: '- Вы ввели некорректное значение.',
    },

    password: {
      regExp: /.{6,16}/,
      errorMsg: '- Убедитесь что правильно ввели пароль.',
    },
  };

  /**
   * Конструктор класса валидации форм. Поля с атрибутом data-validation-rule будут провалидированы.
   * @param formId {string} - Идентификатор формы
   */
  function FormValidator(formId) {
    this.formId = formId;
    this.validatedFields = getValidatedFields.call(this);
    this.dialog = $('<div />', {
      'title': 'Ошибка ввода данных в форму'
    });

    /**
     * Метод возвращает все поля формы которые необходимо валидировать
     * @returns {NodeListOf<Element>}
     */
    function getValidatedFields() {
      return document.getElementById(this.formId).querySelectorAll('[data-validation-rule]');
    }


    /**
     * Метод содает блок с сообщением об ошибке
     * @param errorMsg - Текст сообщения об ошибке
     * @returns {HTMLDivElement} - Блок с сообщением об ошибке
     */
    function createErrorBlock(errorMsg) {
      var errorBlock = document.createElement('div');
      errorBlock.classList.add('error-block');
      errorBlock.innerText = errorMsg;

      return errorBlock;
    }

    /**
     * Метод проверяет соответствие введенных пользователем данных правилам объекта validation
     * @param event - Событие нажатия на кнопку отправки формы
     */
    this.validate = function(event) {
      this.dialog.empty();

      var validateSuccess = true;

      Object.keys(validation).forEach(function (validationRule) {
        this.validatedFields.forEach(function (field) {
          if (field.dataset.validationRule === validationRule) {
            if (validation[validationRule].regExp.test(field.value)) {
              //Add code here if you need
            } else {
              validateSuccess = false;
              event.preventDefault();
              event.stopImmediatePropagation();
              $(field).effect('highlight', {color: '#D01111'}, 1000);
              this.dialog.append(createErrorBlock(validation[validationRule].errorMsg));
            }
          }
        }.bind(this))
      }.bind(this));

      if (validateSuccess) {
        return true;
      }

      if (this.dialog.length) {
        this.dialog.dialog({
          width: 450,
          minHeight: 200,
          autoOpen: true,
          resizable: false,
          buttons: {
            OK: function() {
              $(this).dialog('close');
            },
            CANCEL: function() {
              $(this).dialog('close');
            }
          }
        })
      }
    }
  }

  return {
    init: function (formId) {
      return new FormValidator(formId);
    }
  }
})(jQuery);