/* global module, define */

(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.Pristine = factory();
  }
}(this, () => {
  const lang = {
    en: {
      required: 'This field is required',
      email: 'This field requires a valid e-mail address',
      number: 'This field requires a number',
      integer: 'This field requires an integer value',
      url: 'This field requires a valid website URL',
      tel: 'This field requires a valid telephone number',
      maxlength: ['This fields length must be < ', '$', '{1}'].join(''),
      minlength: ['This fields length must be > ', '$', '{1}'].join(''),
      min: ['Minimum value for this field is ', '$', '{1}'].join(''),
      max: ['Maximum value for this field is ', '$', '{1}'].join(''),
      pattern: 'Please match the requested format',
      equals: 'The two fields do not match',
      default: 'Please enter a correct value'
    }
  };

  function findAncestor(el, cls) {
    while (el.parentElement) {
      el = el.parentElement;
      if (el.classList.contains(cls)) {
        return el;
      }
    }
    return null;
  }

  function tmpl() {
    const _arguments = arguments;
    return this.replace(/\${([^{}]*)}/g, (a, b) => _arguments[b]);
  }

  function groupedElemCount(input) {
    return input.pristine.self.form.querySelectorAll(`input[name="${input.getAttribute('name')}"]:checked`).length;
  }

  function mergeConfig(obj1, obj2) {
    for (const attr in obj2) {
      if (!(attr in obj1)) {
        obj1[attr] = obj2[attr];
      }
    }
    return obj1;
  }

  let defaultConfig = {
    classTo: 'form-group',
    errorClass: 'has-danger',
    successClass: 'has-success',
    errorTextParent: 'form-group',
    errorTextTag: 'div',
    errorTextClass: 'text-help'
  };

  const PRISTINE_ERROR = 'pristine-error';
  const SELECTOR = 'input:not([type^=hidden]):not([type^=submit]), select, textarea';
  const ALLOWED_ATTRIBUTES = ['required', 'min', 'max', 'minlength', 'maxlength', 'pattern'];
  const EMAIL_REGEX = /^(([^<>()\x5B\x5D\\.,;:\s@"]+(\.[^<>()\x5B\x5D\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const MESSAGE_REGEX = /-message(?:-([a-z]{2}(?:_[A-Z]{2})?))?/;
  let currentLocale = 'en';
  const validators = {};

  const _ = function _(name, validator) {
    validator.name = name;
    if (validator.priority === undefined) {
      validator.priority = 1;
    }
    validators[name] = validator;
  };

  _('text', {
    fn: function fn() {
      return true;
    },
    priority: 0
  });

  _('required', {
    fn: function fn(val) {
      return this.type === 'radio' || this.type === 'checkbox' ? groupedElemCount(this) : val !== undefined && val.trim() !== '';
    },
    priority: 99,
    halt: true
  });

  _('email', {
    fn: function fn(val) {
      return !val || EMAIL_REGEX.test(val);
    }
  });

  _('number', {
    fn: function fn(val) {
      return !val || !isNaN(parseFloat(val));
    },
    priority: 2
  });

  _('integer', {
    fn: function fn(val) {
      return !val || /^\d+$/.test(val);
    }
  });

  _('minlength', {
    fn: function fn(val, length) {
      return !val || val.length >= parseInt(length, 10);
    }
  });

  _('maxlength', {
    fn: function fn(val, length) {
      return !val || val.length <= parseInt(length, 10);
    }
  });

  _('min', {
    fn: function fn(val, limit) {
      return !val || (this.type === 'checkbox' ? groupedElemCount(this) >= parseInt(limit, 10) : parseFloat(val) >= parseFloat(limit));
    }
  });

  _('max', {
    fn: function fn(val, limit) {
      return !val || (this.type === 'checkbox' ? groupedElemCount(this) <= parseInt(limit, 10) : parseFloat(val) <= parseFloat(limit));
    }
  });

  _('pattern', {
    fn: function fn(val, pattern) {
      const m = pattern.match(new RegExp('^/(.*?)/([gimy]*)$'));
      return !val || new RegExp(m[1], m[2]).test(val);
    }
  });

  _('equals', {
    fn: function fn(val, otherFieldSelector) {
      const other = document.querySelector(otherFieldSelector);
      return other && (!val && !other.value || other.value === val);
    }
  });

  function Pristine(form, config, live) {
    const self = this;

    init(form, config, live);

    function init(formElement, configOptions, liveValidation) {
      formElement.setAttribute('novalidate', 'true');

      self.form = formElement;
      self.config = mergeConfig(configOptions || {}, defaultConfig);
      self.live = !(liveValidation === false);
      self.fields = Array.from(formElement.querySelectorAll(SELECTOR)).map((input) => {
        const fns = [];
        const params = {};
        const messages = {};

        [].forEach.call(input.attributes, (attr) => {
          if (/^data-pristine-/.test(attr.name)) {
            let name = attr.name.substr(14);
            const messageMatch = name.match(MESSAGE_REGEX);

            if (messageMatch !== null) {
              const locale = messageMatch[1] === undefined ? 'en' : messageMatch[1];

              if (!Object.prototype.hasOwnProperty.call(messages, locale)) {
                messages[locale] = {};
              }

              messages[locale][name.slice(0, name.length - messageMatch[0].length)] = attr.value;
              return;
            }

            if (name === 'type') {
              name = attr.value;
            }

            _addValidatorToField(fns, params, name, attr.value);
          } else if (~ALLOWED_ATTRIBUTES.indexOf(attr.name)) {
            _addValidatorToField(fns, params, attr.name, attr.value);
          } else if (attr.name === 'type') {
            _addValidatorToField(fns, params, attr.value);
          }
        });

        fns.sort((a, b) => b.priority - a.priority);

        if (self.live) {
          input.addEventListener(!~['radio', 'checkbox'].indexOf(input.getAttribute('type')) ? 'input' : 'change', (e) => {
            self.validate(e.target);
          });
        }

        input.pristine = {
          input: input,
          validators: fns,
          params: params,
          messages: messages,
          self: self
        };

        return input.pristine;
      });
    }

    function _addValidatorToField(fns, params, name, value) {
      const validator = validators[name];

      if (validator) {
        fns.push(validator);

        if (value) {
          const valueParams = name === 'pattern' ? [value] : value.split(',');
          valueParams.unshift(null);
          params[name] = valueParams;
        }
      }
    }

    self.validate = function (input, silent) {
      silent = input && silent === true || input === true;
      let fields = self.fields;

      if (input !== true && input !== false) {
        if (input instanceof HTMLElement) {
          fields = [input.pristine];
        } else if (input instanceof NodeList || input instanceof (window.$ || Array) || input instanceof Array) {
          fields = Array.from(input).map((el) => el.pristine);
        }
      }

      let valid = true;

      for (let i = 0; fields[i]; i++) {
        const field = fields[i];

        if (_validateField(field)) {
          if (!silent) {
            _showSuccess(field);
          }
        } else {
          valid = false;

          if (!silent) {
            _showError(field);
          }
        }
      }

      return valid;
    };

    self.getErrors = function (input) {
      if (!input) {
        const erroneousFields = [];

        for (let i = 0; i < self.fields.length; i++) {
          const field = self.fields[i];

          if (field.errors.length) {
            erroneousFields.push({ input: field.input, errors: field.errors });
          }
        }

        return erroneousFields;
      }

      if (input.tagName && input.tagName.toLowerCase() === 'select') {
        return input.pristine.errors;
      }

      return input.length ? input[0].pristine.errors : input.pristine.errors;
    };

    function _validateField(field) {
      const errors = [];
      let valid = true;

      for (let i = 0; field.validators[i]; i++) {
        const validator = field.validators[i];
        const params = field.params[validator.name] ? field.params[validator.name] : [];

        params[0] = field.input.value;

        if (!validator.fn.apply(field.input, params)) {
          valid = false;

          if (typeof validator.msg === 'function') {
            errors.push(validator.msg(field.input.value, params));
          } else if (typeof validator.msg === 'string') {
            errors.push(tmpl.apply(validator.msg, params));
          } else if (validator.msg === Object(validator.msg) && validator.msg[currentLocale]) {
            errors.push(tmpl.apply(validator.msg[currentLocale], params));
          } else if (field.messages[currentLocale] && field.messages[currentLocale][validator.name]) {
            errors.push(tmpl.apply(field.messages[currentLocale][validator.name], params));
          } else if (lang[currentLocale] && lang[currentLocale][validator.name]) {
            errors.push(tmpl.apply(lang[currentLocale][validator.name], params));
          } else {
            errors.push(tmpl.apply(lang[currentLocale].default, params));
          }

          if (validator.halt === true) {
            break;
          }
        }
      }

      field.errors = errors;
      return valid;
    }

    self.addValidator = function (elem, fn, msg, priority, halt) {
      if (elem instanceof HTMLElement) {
        elem.pristine.validators.push({ fn: fn, msg: msg, priority: priority, halt: halt });
        elem.pristine.validators.sort((a, b) => b.priority - a.priority);
      }
    };

    function _getErrorElements(field) {
      if (field.errorElements) {
        return field.errorElements;
      }

      const errorClassElement = findAncestor(field.input, self.config.classTo);
      let errorTextParent = null;
      let errorTextElement = null;

      if (self.config.classTo === self.config.errorTextParent) {
        errorTextParent = errorClassElement;
      } else if (errorClassElement) {
        errorTextParent = errorClassElement.querySelector(`.${self.config.errorTextParent}`);
      }

      if (errorTextParent) {
        errorTextElement = errorTextParent.querySelector(`.${PRISTINE_ERROR}`);

        if (!errorTextElement) {
          errorTextElement = document.createElement(self.config.errorTextTag);
          errorTextElement.className = `${PRISTINE_ERROR} ${self.config.errorTextClass}`;
          errorTextParent.appendChild(errorTextElement);
          errorTextElement.pristineDisplay = errorTextElement.style.display;
        }
      }

      field.errorElements = [errorClassElement, errorTextElement];
      return field.errorElements;
    }

    function _showError(field) {
      const errorElements = _getErrorElements(field);
      const errorClassElement = errorElements[0];
      const errorTextElement = errorElements[1];
      const input = field.input;

      const inputId = input.id || Math.floor(new Date().valueOf() * Math.random());
      const errorId = `error-${inputId}`;

      if (errorClassElement) {
        errorClassElement.classList.remove(self.config.successClass);
        errorClassElement.classList.add(self.config.errorClass);
        input.setAttribute('aria-describedby', errorId);
        input.setAttribute('aria-invalid', 'true');
      }

      if (errorTextElement) {
        errorTextElement.setAttribute('id', errorId);
        errorTextElement.setAttribute('role', 'alert');
        errorTextElement.innerHTML = field.errors.join('<br/>');
        errorTextElement.style.display = errorTextElement.pristineDisplay || '';
      }
    }

    self.addError = function (input, error) {
      input = input.length ? input[0] : input;
      input.pristine.errors.push(error);
      _showError(input.pristine);
    };

    function _removeError(field) {
      const errorElements = _getErrorElements(field);
      const errorClassElement = errorElements[0];
      const errorTextElement = errorElements[1];
      const input = field.input;

      if (errorClassElement) {
        errorClassElement.classList.remove(self.config.errorClass);
        errorClassElement.classList.remove(self.config.successClass);
        input.removeAttribute('aria-describedby');
        input.removeAttribute('aria-invalid');
      }

      if (errorTextElement) {
        errorTextElement.removeAttribute('id');
        errorTextElement.removeAttribute('role');
        errorTextElement.innerHTML = '';
        errorTextElement.style.display = 'none';
      }

      return errorElements;
    }

    function _showSuccess(field) {
      const errorClassElement = _removeError(field)[0];

      if (errorClassElement) {
        errorClassElement.classList.add(self.config.successClass);
      }
    }

    self.reset = function () {
      for (let i = 0; self.fields[i]; i++) {
        self.fields[i].errorElements = null;
      }

      Array.from(self.form.querySelectorAll(`.${PRISTINE_ERROR}`)).forEach((elem) => {
        elem.parentNode.removeChild(elem);
      });

      Array.from(self.form.querySelectorAll(`.${self.config.classTo}`)).forEach((elem) => {
        elem.classList.remove(self.config.successClass);
        elem.classList.remove(self.config.errorClass);
      });
    };

    self.destroy = function () {
      self.reset();

      self.fields.forEach((field) => {
        delete field.input.pristine;
      });

      self.fields = [];
    };

    self.setGlobalConfig = function (configOptions) {
      defaultConfig = configOptions;
    };

    return self;
  }

  Pristine.addValidator = function (name, fn, msg, priority, halt) {
    _(name, { fn: fn, msg: msg, priority: priority, halt: halt });
  };

  Pristine.addMessages = function (locale, messages) {
    const langObj = Object.prototype.hasOwnProperty.call(lang, locale) ? lang[locale] : lang[locale] = {};

    Object.keys(messages).forEach((key) => {
      langObj[key] = messages[key];
    });
  };

  Pristine.setLocale = function (locale) {
    currentLocale = locale;
  };

  return Pristine;
}));
