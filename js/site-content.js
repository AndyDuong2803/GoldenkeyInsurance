(function () {
    "use strict";

    var config = window.GK_SITE_CONFIG || {};
    config.currentYear = config.currentYear || String(new Date().getFullYear());

    function getValue(path) {
        return path.split(".").reduce(function (value, key) {
            return value && value[key] !== undefined ? value[key] : "";
        }, config);
    }

    function applySiteContent() {
        document.querySelectorAll("[data-site]").forEach(function (element) {
            element.textContent = getValue(element.getAttribute("data-site"));
        });

        document.querySelectorAll("[data-site-href]").forEach(function (element) {
            element.setAttribute("href", getValue(element.getAttribute("data-site-href")));
        });

        document.querySelectorAll("[data-site-src]").forEach(function (element) {
            element.setAttribute("src", getValue(element.getAttribute("data-site-src")));
        });

        document.querySelectorAll("[data-site-value]").forEach(function (element) {
            element.value = getValue(element.getAttribute("data-site-value"));
        });

        document.querySelectorAll("[data-site-attr]").forEach(function (element) {
            var binding = element.getAttribute("data-site-attr").split(":");

            if (binding.length === 2) {
                element.setAttribute(binding[0], getValue(binding[1]));
            }
        });
    }

    applySiteContent();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applySiteContent);
    }
})();
