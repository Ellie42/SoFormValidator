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