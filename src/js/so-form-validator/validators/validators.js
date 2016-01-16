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