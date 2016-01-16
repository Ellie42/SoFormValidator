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