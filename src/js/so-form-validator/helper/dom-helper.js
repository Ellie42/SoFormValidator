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