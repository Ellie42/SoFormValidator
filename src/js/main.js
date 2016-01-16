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