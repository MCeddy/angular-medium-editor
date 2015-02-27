'use strict';

angular.module('angular-medium-editor', [])

  .directive('mediumEditor', function() {

    return {
      require: 'ngModel',
      restrict: 'AE',
      scope: {
        bindOptions: '=',
        ngDisabled: '='
      },
      link: function(scope, iElement, iAttrs, ctrl) {
        angular.element(iElement).addClass('angular-medium-editor');

        scope.$watch('ngDisabled', function(newValue, oldValue) {
          if (angular.equals(newValue, oldValue)) {
            return;
          }

          if (newValue === true) {
            ctrl.editor.deactivate();
          }
          else {
            ctrl.editor.activate();
          }
        });

        // Parse options
        var opts = {},
            placeholder = '';
        var prepOpts = function() {
          if (iAttrs.options) {
            opts = scope.$eval(iAttrs.options);
          }
          var bindOpts = {};
          if (scope.bindOptions !== undefined) {
            bindOpts = scope.bindOptions;
          }
          opts = angular.extend(opts, bindOpts);
        };
        prepOpts();
        placeholder = opts.placeholder;
        scope.$watch('bindOptions', function(newValue, oldValue) {
          if (angular.equals(newValue, oldValue)) {
            return;
          }

          // in case options are provided after mediumEditor directive has been compiled and linked (and after $render function executed)
          // we need to re-initialize
          if (ctrl.editor) {
            ctrl.editor.deactivate();
          }
          prepOpts();
          // Hide placeholder when the model is not empty
          if (!ctrl.$isEmpty(ctrl.$viewValue)) {
            opts.placeholder = '';
          }
          ctrl.editor = new MediumEditor(iElement, opts);

          if (scope.ngDisabled === true) {
            ctrl.editor.deactivate();
          }
        });

        var onChange = function() {
          var htmlValue = iElement.html();

          if (angular.equals(ctrl.$viewValue, htmlValue)) { // no changes
            return;
          }

          scope.$apply(function() {

            // If user cleared the whole text, we have to reset the editor because MediumEditor
            // lacks an API method to alter placeholder after initialization
            if (htmlValue === '<p><br></p>' || htmlValue === '') {
              opts.placeholder = placeholder;
              ctrl.editor = new MediumEditor(iElement, opts);

              if (scope.ngDisabled === true) {
                ctrl.editor.deactivate();
              }
            }

            // change model
            ctrl.$setViewValue(htmlValue);
          });
        };

        // view -> model
        iElement.on('blur', onChange);
        iElement.on('input', onChange);

        // model -> view
        ctrl.$render = function() {

          if (!this.editor) {
            // Hide placeholder when the model is not empty
            if (!ctrl.$isEmpty(ctrl.$viewValue)) {
              opts.placeholder = '';
            }

            this.editor = new MediumEditor(iElement, opts);

            if (scope.ngDisabled === true) {
              ctrl.editor.deactivate();
            }
          }

          iElement.html(ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue);

          // hide placeholder when view is not empty
          if(!ctrl.$isEmpty(ctrl.$viewValue)) angular.element(iElement).removeClass('medium-editor-placeholder');
        };

      }
    };

  });
