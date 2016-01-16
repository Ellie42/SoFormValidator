(function() {
    if (!HTMLElement.prototype.querySelectorAll) {
        throw new Error('rootedQuerySelectorAll: This polyfill can only be used with browsers that support querySelectorAll');
    }

    // A temporary element to query against for elements not currently in the DOM
    // We'll also use this element to test for :scope support
    var container = document.createElement('div');

    // Check if the browser supports :scope
    try {
        // Browser supports :scope, do nothing
        container.querySelectorAll(':scope *');
    }
    catch (e) {
        // Match usage of scope
        var scopeRE = /^\s*:scope/gi;

        // Overrides
        function overrideNodeMethod(prototype, methodName) {
            // Store the old method for use later
            var oldMethod = prototype[methodName];

            // Override the method
            prototype[methodName] = function(query) {
                var nodeList,
                    gaveId = false,
                    gaveContainer = false;

                if (query.match(scopeRE)) {
                    // Remove :scope
                    query = query.replace(scopeRE, '');

                    if (!this.parentNode) {
                        // Add to temporary container
                        container.appendChild(this);
                        gaveContainer = true;
                    }

                    var parentNode = this.parentNode;

                    if (!this.id) {
                        // Give temporary ID
                        this.id = 'rootedQuerySelector_id_'+(new Date()).getTime();
                        gaveId = true;
                    }

                    // Find elements against parent node
                    nodeList = oldMethod.call(parentNode, '#'+this.id+' '+query);

                    // Reset the ID
                    if (gaveId) {
                        this.id = '';
                    }

                    // Remove from temporary container
                    if (gaveContainer) {
                        container.removeChild(this);
                    }

                    return nodeList;
                }
                else {
                    // No immediate child selector used
                    return oldMethod.call(this, query);
                }
            };
        }

        // Browser doesn't support :scope, add polyfill
        overrideNodeMethod(HTMLElement.prototype, 'querySelector');
        overrideNodeMethod(HTMLElement.prototype, 'querySelectorAll');
    }
}());
(function (DOMParser) {
    "use strict";

    var
        proto = DOMParser.prototype
        , nativeParse = proto.parseFromString
        ;

    // Firefox/Opera/IE throw errors on unsupported types
    try {
        // WebKit returns null on unsupported types
        if ((new DOMParser()).parseFromString("", "text/html")) {
            // text/html parsing is natively supported
            return;
        }
    } catch (ex) {
    }

    proto.parseFromString = function (markup, type) {
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            var
                doc = document.implementation.createHTMLDocument("")
                ;
            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
                doc.documentElement.innerHTML = markup;
            }
            else {
                doc.body.innerHTML = markup;
            }
            return doc;
        } else {
            return nativeParse.apply(this, arguments);
        }
    };
}(DOMParser));
var sofova = {
    forms: []
};

sofova.validators = (function (configurator) {
    /**
     * Retrieve a message from the default config
     * @param splitCode
     * @param array
     * @returns {*}
     */
    function getMessageFromConfig(splitCode, messages, customMessages) {
        var valueToCheck = messages[splitCode[0]];
        if (typeof customMessages !== 'undefined') {
            var customValueToCheck = customMessages[splitCode[0]];
        }

        if (splitCode.length === 1) {
            return customValueToCheck || valueToCheck;
        }

        if (typeof valueToCheck !== 'string') {
            return getMessageFromConfig(splitCode.slice(1), valueToCheck, customValueToCheck);
        }

        return valueToCheck;
    }

    /**
     * Return an error message from error code
     */
    function message(code, config) {
        if (typeof code === 'undefined') {
            return;
        }

        var splitCode = code.split(".");
        var messages = sofova.validators.$$messages;
        var customMessages = configurator.$$customMessages;

        var message = getMessageFromConfig(splitCode, messages, customMessages);

        //Replace any placeholders in the text with values in the config
        var populatedMessage = message.replace(/\$(.*?)\$/g, function (a) {
            return config[a.slice(1, a.length - 1)];
        });

        return [populatedMessage, code];
    }

    /**
     * Checks if a value is in a certain range and returns -1 if too low 1 if too high and 0 if in range
     * @param {number} val
     * @param {object} config
     * @returns {int}
     */
    function inRange(val, config) {
        if (isNaN(val)) {
            return NaN;
        }

        var minCheck = (typeof config.min === "undefined" || val >= config.min);
        var maxCheck = (typeof config.max === "undefined" || val <= config.max);

        if (!minCheck) {
            return -1;
        }
        if (!maxCheck) {
            return 1;
        }

        return 0;
    }

    /**
     * Collection of all validator functions
     * @type {{required: validators.required, length: validators.length}}
     */
    var validators = {
        required: function (config, val) {
            if (config === true && val.length <= 0) {
                return message('required', config);
            }
        },
        length: function (config, val) {
            var code, result = inRange(val.length, config);

            if (result === -1) {
                code = "length.low";
            }
            if (result === 1) {
                code = "length.high";
            }

            return message(code, config);
        },
        value: function (config, val) {
            val = parseFloat(val);
            var code, result = inRange(val, config);

            if (result === -1) {
                code = "value.low";
            }
            if (result === 1) {
                code = "value.high";
            }
            if (isNaN(result)) {
                code = "value.nan"
            }

            return message(code, config);
        }
    };

    /**
     * Run validation function on a value
     * @param {object} config
     * @param {string} name
     * @param value
     * @return {boolean | Error | object}
     */
    function runValidator(config, name, value) {
        if (typeof validators[name] !== "undefined") {
            var err = validators[name](config, value);
            if (typeof err === "undefined") {
                return true;
            }
            return {text: err[0], code: err[1]};
        }

        return new Error("Validator does not exist");
    }

    return {
        run: runValidator
    };
});
sofova.validators.$$messages = {
    length: {
        low: "Minimum length is $min$",
        high: "Maximum length is $max$"
    },
    value: {
        low: "Minimum value is $min$",
        high: "Maximum value is $max$",
        nan: "Value must be a number between $min$ and $max$"
    },
    required: "Value is required"
};
sofova.domHelper = (function () {
    /**
     * @param {DomElement | string | Array <DomElement> | Array <string>} element
     * @returns {DomElement | Array <DomElement>}
     */
    function getElementFromVarious(element) {
        if (typeof element === "object" || Array.isArray(element)) {
            return element;
        }

        if (typeof element === "string") {
            return document.querySelectorAll(element);
        }

        return null;
    }

    return {
        getElementFromVarious: getElementFromVarious
    };
}());
sofova.formConfigurator = function () {
    /**
     * Set the template options
     * @param config
     */
    function template(config) {
        for (var attrName in config) {
            this.$$templateConfig[attrName] = config[attrName];
        }
    }

    /**
     * Setup custom error messages
     * @param config
     */
    function errorMessages(config) {
        this.$$customMessages = config;
    }

    /**
     * Add a validation rule to a form element
     * @param {string} selector
     * @param {object} config
     */
    function addRule(selector, config) {
        if (typeof this.$$rules[selector] === "undefined") {
            this.$$rules[selector] = {};
        }

        this.$$rules[selector].config = config;

        return this;
    }

    /**
     * Loop through all rules and callback on each
     * @param {function} func
     */
    function iterateRules(func) {
        var keys = Object.keys(this.$$rules);

        for (var i = 0; i < keys.length; i++) {
            if (keys[i].slice(0, 2) === "$$") {
                continue;
            }
            var curRule = this.$$rules[keys[i]];

            func(curRule, keys[i]);
        }
    }

    var templateDefaults = {
        type: "default",
        template: '<div class="so-form-errors">$element$ $errors$</div>',
        errorTemplate: '<div class="so-form-error">$message$</div>'
    };

    return {
        $$rules: {},
        $$templateConfig: templateDefaults,
        $$iterateRules: iterateRules,
        template: template,
        errorMessages: errorMessages,
        rule: addRule
    };
};
sofova.validator = (function (formElements, configurator) {
    var validators = {};

    /**
     * Validate a value against a validation config
     * @param config
     * @param value
     */
    function runValidation(config, value) {
        var errors = [];

        var keys = Object.keys(config);
        for (var i = 0; i < keys.length; i++) {
            var result = validators.run(config[keys[i]], keys[i], value);
            if (result !== true) {
                errors.push({
                    name: keys[i],
                    message: result
                });
            }
        }

        return errors;
    }

    /**
     * Run validator function on all elements
     * @param {object} rule
     * @param {NodeList} elements
     */
    function validateElements(rule, elements) {
        var results = [];

        for (var i = 0; i < elements.length; i++) {
            var errors = runValidation(rule.config, elements[i].value);
            if (errors.length > 0) {
                results[i] = errors;
                sofova.errorRenderer.displayErrors(elements[i], rule, errors, configurator.$$templateConfig)
            } else {
                sofova.errorRenderer.clearErrors(configurator.$$templateConfig, elements[i]);
            }
        }

        return results;
    }

    function validateForm(formName) {
    }

    /**
     * Validate all fields in form
     */
    function validateAll() {
        validators = sofova.validators(configurator);

        for (var j = 0; j < formElements.length; j++) {
            var formElement = formElements[j];
            var results = validateElementsInForm(formElement);
        }

        return results;
    }

    function validateElementsInForm(formElement) {
        var results = {};

        configurator.$$iterateRules(function (rule, selector) {
            //noinspection JSReferencingMutableVariableFromClosure
            var elements = formElement.querySelectorAll(":scope " + selector);

            var errors = validateElements(rule, elements);

            if (errors.length > 0) {
                results[selector] = errors;
            }
        });

        return results;
    }

    return {
        all: validateAll,
        form: validateForm
    };
});
sofova.errorRenderer = (function () {
    /**
     * Create a string representation of the DOM element that display error messages
     * @param templateConfig
     * @param {Array} errors
     * @return {string}
     */
    function getErrorsString(templateConfig, errors) {
        var string;

        string = errors.reduce(function (old, newVal) {
            var newText = templateConfig.errorTemplate
                .replace("$message$", newVal.message.text)
                .replace("$code$", newVal.message.code);

            return old + newText;
        }, "");

        return string;
    }

    /**
     * Remove old error message elements
     * @param elements
     */
    function removeOldElements(elements) {
        if (typeof elements === 'undefined') {
            return;
        }

        for (var i = 0; i < elements.length; i++) {
            elements[i].remove();
        }
    }

    function replaceDomElement(templateConfig, element) {
        var element = templateConfig.details.parent
            .insertBefore(
                element,
                templateConfig.details.parent.children[templateConfig.details.index]
            );

        var oldDisplay = element.style.display;

        element.style.display = 'none';
        element.style.display = oldDisplay;

        return element;
    }

    /**
     * Add all the template elements to the DOM using the templateConfig.details
     * as a reference
     * @param templateElements
     * @param templateConfig
     */
    function addElementsToDom(templateElements, templateConfig) {
        var newElements = [];

        while (typeof templateElements[templateElements.length - 1] !== 'undefined') {
            var newElement =
                replaceDomElement(
                    templateConfig,
                    templateElements[templateElements.length - 1]
                );

            newElements.push(newElement);
        }

        templateConfig.elements = newElements;
    }

    /**
     * Populate the template with error messages using the placeholders
     * @param templateConfig
     * @param element
     * @param errors
     */
    function populateErrorElement(templateConfig, element, errors) {
        removeOldElements(templateConfig.elements);

        var templateString = templateConfig.template;

        templateString = templateString
            .replace("$element$", "<element-placeholder></element-placeholder>")
            .replace("$errors$", getErrorsString(templateConfig, errors));

        var domParser = new DOMParser();
        var templateParent = domParser.parseFromString(templateString, "text/html")
            .firstChild.childNodes[1];

        var templateElements = templateParent.children;

        var elementPlaceholder = templateParent.querySelector("element-placeholder");

        elementPlaceholder.parentElement.insertBefore(element, elementPlaceholder);

        addElementsToDom(templateElements, templateConfig);

        elementPlaceholder.remove();
    }

    /**
     * Remove Error elements
     */
    function clearErrors(templateConfig, element) {
        if (typeof templateConfig.details === 'undefined') {
            return;
        }

        removeOldElements(templateConfig.elements);
        element.remove();
        replaceDomElement(templateConfig, element);
    }

    /**
     * Create error element and populate
     * @param element
     * @param rule
     * @param errors
     * @param templateConfig
     */
    function displayErrors(element, rule, errors, templateConfig) {
        //If it's the first time then save the position details so we can put the input back
        if (typeof templateConfig.details === 'undefined') {
            templateConfig.details = {
                parent: element.parentElement,
                index: Array.prototype.indexOf.call(element.parentElement, element)
            };
        }

        populateErrorElement(templateConfig, element, errors);
    }

    return {
        displayErrors: displayErrors,
        clearErrors: clearErrors
    };
}());
/**
 * Adds form validation to children of given dom element
 *
 * Requires a dom element object or a string class or id selector.
 * @param {Node | string | NodeList | Array <string>} formElement
 * @returns {{}}
 */
function soFormValidator(formElement) {
    var formElements = sofova.domHelper.getElementFromVarious(formElement);
    var configurator = new sofova.formConfigurator();

    var newForm = {};

    newForm.validate = sofova.validator(formElements, configurator);

    newForm.$$parent = formElements;
    newForm.config = configurator;

    sofova.forms.push(newForm);

    return newForm;
}
var form = soFormValidator(".test-form");

form.config.rule("input[name=test-input]", {
    value: {
        max: 10,
        min: 5
    },
    length: {
        min: 1
    },
    required: true
});

form.config.errorMessages({
    value: {
        low: "Low low low",
        high: "High high high"
    },
    required: "Ooooooops"
});

form.config.template({
    template: "<div class='so-form-errors'>$element$ $errors$</div>",
    errorTemplate: "<div class='so-form-error' data-code='$code$'>$message$</div>"
});

var formB = soFormValidator(".test-form-b");

formB.config.rule("input[name=test-input]", {
    value: {
        max: 10
    },
    length: {
        min: 1
    },
    required: true
});

document.querySelector("input[type=submit]").addEventListener("mouseup", function () {
    form.validate.all();
});

console.log(form);
console.log();