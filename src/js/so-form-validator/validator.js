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