(function () {
    "use strict";

    var config = window.GK_SITE_CONFIG || {};
    var emailConfig = config.emailjs || {};
    var placeholderPattern = /^YOUR_EMAILJS_/;
    var isFileProtocol = window.location && window.location.protocol === "file:";

    function isConfigured() {
        return emailConfig.publicKey &&
            emailConfig.serviceId &&
            emailConfig.templateId &&
            !placeholderPattern.test(emailConfig.publicKey) &&
            !placeholderPattern.test(emailConfig.serviceId) &&
            !placeholderPattern.test(emailConfig.templateId);
    }

    function setStatus(statusElement, message, type) {
        if (!statusElement) {
            return;
        }

        statusElement.textContent = message;
        statusElement.className = "contact-form-status " + (type || "");
    }

    function fillHiddenFields(form) {
        var now = new Date();
        var timeField = form.querySelector("[name='time']");
        var yearField = form.querySelector("[name='year']");
        var toEmailField = form.querySelector("[name='to_email']");
        var agencyField = form.querySelector("[name='agency_name']");

        if (toEmailField) {
            toEmailField.value = emailConfig.toEmail || "";
        }

        if (agencyField) {
            agencyField.value = config.agencyName || "";
        }

        if (timeField) {
            timeField.value = now.toLocaleString();
        }

        if (yearField) {
            yearField.value = String(now.getFullYear());
        }
    }

    function bindContactForm() {
        var form = document.getElementById("contactForm");
        var statusElement = document.getElementById("contactFormStatus");
        var submitButton = document.getElementById("contactSubmit");

        if (!form) {
            return;
        }

        if (isFileProtocol) {
            setStatus(statusElement, "Contact form requires running this site via http://localhost (not file://). Start a local server, then try again.", "error");
        }

        if (window.emailjs && isConfigured()) {
            window.emailjs.init({
                publicKey: emailConfig.publicKey
            });
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!window.emailjs || !isConfigured()) {
                setStatus(statusElement, "EmailJS is not configured yet. Add the Public Key, Service ID, and Template ID in js/site-config.js.", "error");
                return;
            }

            if (isFileProtocol) {
                setStatus(statusElement, "EmailJS blocked this request because the page is opened via file://. Please open the site from http://localhost.", "error");
                return;
            }

            if (window.grecaptcha && !window.grecaptcha.getResponse()) {
                setStatus(statusElement, "Please complete the reCAPTCHA before sending your message.", "error");
                return;
            }

            fillHiddenFields(form);

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Sending...";
            }

            setStatus(statusElement, "Sending your message...", "pending");

            window.emailjs.sendForm(emailConfig.serviceId, emailConfig.templateId, form, { publicKey: emailConfig.publicKey })
                .then(function () {
                    form.reset();
                    if (window.grecaptcha) {
                        window.grecaptcha.reset();
                    }
                    fillHiddenFields(form);
                    setStatus(statusElement, "Thanks. Your message has been sent.", "success");
                })
                .catch(function (error) {
                    var details = "";

                    if (error && typeof error === "object") {
                        details = error.text || error.message || "";
                    }

                    console.error("EmailJS sendForm failed:", error);
                    setStatus(statusElement, "Sorry, the message could not be sent. " + (details ? ("(" + details + ") ") : "") + "Please call or email us directly.", "error");
                })
                .finally(function () {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = "Send Message";
                    }
                });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindContactForm);
    } else {
        bindContactForm();
    }
})();
