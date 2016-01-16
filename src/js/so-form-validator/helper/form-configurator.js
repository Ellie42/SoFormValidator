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