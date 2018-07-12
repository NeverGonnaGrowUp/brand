"use strict";
/**
 * Главный метод. Заапускает все модули.
 */
var IndexApp = (function ($) {

  return {
    init: function () {
      Interface.init();
      Autocomplete.init();
      Cart.init();
    }
  }
})(jQuery);
/**
 * Объект для отрисовки всего
 */
var render = new Renderer();
$(IndexApp.init());