/* BW_FORM_ENDPOINT
   Single public config value for the briefing form. Do not put a secret here.
   To deliver submissions to info@blackwater-industry.com, create a Formspree
   form and set this to its URL, for example "https://formspree.io/f/xxxxxxxx".
   That is the account this page expects: a Formspree form (form id only).
   Web3Forms needs an access_key, which is intentionally not used.
   Cloudflare Turnstile is not wired up; it would need a Turnstile site key.
   Leave the string empty and the form opens the visitor's email app instead.
*/
var BW_FORM_ENDPOINT = "";

(function () {
  var drawer = document.querySelector(".nav-drawer");
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        drawer.open = false;
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") drawer.open = false;
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) drawer.open = false;
    });
  }

  var sel = document.getElementById("topic");
  if (sel) {
    var map = {
      nolan: "N.O.L.A.N.™",
      kannon: "Kannon™",
      life: "L.I.F.E.™",
      missions: "Missions",
      investor: "Investor inquiry"
    };
    var key = new URLSearchParams(location.search).get("topic");
    if (key) {
      if (map[key]) sel.value = map[key];
      else {
        var wanted = key.toLowerCase();
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value.toLowerCase() === wanted) sel.value = sel.options[i].value;
        }
      }
    }
  }

  var form = document.getElementById("briefing-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var fields = form.querySelector(".form-fields");
  var submit = form.querySelector("button[type=submit]");
  var MAIL = "info@blackwater-industry.com";

  function endpoint() {
    return (typeof BW_FORM_ENDPOINT === "string" ? BW_FORM_ENDPOINT : "").trim();
  }

  function field(name) {
    var el = form.elements[name];
    return el ? String(el.value || "").trim() : "";
  }

  function setFieldError(id, message) {
    var input = document.getElementById(id);
    var error = document.getElementById(id + "-error");
    if (!input || !error) return;
    if (message) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", id + "-error");
      error.hidden = false;
      error.textContent = message;
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      error.hidden = true;
      error.textContent = "";
    }
  }

  function showStatus(message, isError) {
    status.hidden = false;
    status.classList.toggle("is-error", !!isError);
    status.textContent = message;
    status.focus();
  }

  ["name", "email", "message"].forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("input", function () {
      setFieldError(id, "");
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = field("name");
    var email = field("email");
    var message = field("message");
    var organization = field("organization");
    var role = field("role");
    var topic = field("topic");
    var firstInvalid = "";

    setFieldError("name", "");
    setFieldError("email", "");
    setFieldError("message", "");

    if (!name) {
      setFieldError("name", "Enter your name.");
      firstInvalid = firstInvalid || "name";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("email", "Enter a valid email address.");
      firstInvalid = firstInvalid || "email";
    }
    if (!message) {
      setFieldError("message", "Enter a message.");
      firstInvalid = firstInvalid || "message";
    }
    if (firstInvalid) {
      document.getElementById(firstInvalid).focus();
      return;
    }

    if (field("bw_hp")) {
      form.classList.add("is-sent");
      if (fields) fields.hidden = true;
      showStatus("Thank you. Your briefing request was sent. We will reply to the email address you entered.", false);
      return;
    }

    var url = endpoint();
    if (!url) {
      var body = [
        "Name: " + name,
        "Organization: " + organization,
        "Role: " + role,
        "Email: " + email,
        "Topic: " + topic,
        "",
        message
      ].join("\n");
      showStatus("Your email app should open with this request addressed to " + MAIL + ". If it does not, use that address directly. This does not confirm the message was delivered.", false);
      window.location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent("Briefing request: " + topic) + "&body=" + encodeURIComponent(body);
      return;
    }

    var data = new FormData();
    data.append("name", name);
    data.append("email", email);
    data.append("organization", organization);
    data.append("role", role);
    data.append("topic", topic);
    data.append("message", message);
    data.append("_subject", "Briefing request: " + topic);
    data.append("_replyto", email);

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Sending...";
    }
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 20000);
    fetch(url, {
      method: "POST",
      body: data,
      headers: { "Accept": "application/json" },
      signal: ctrl.signal
    }).then(function (response) {
      if (!response.ok) throw new Error("status " + response.status);
      form.classList.add("is-sent");
      if (fields) fields.hidden = true;
      showStatus("Thank you. Your briefing request was sent. We will reply to the email address you entered.", false);
    }).catch(function () {
      showStatus("We could not send the form. Email " + MAIL + ", or try again.", true);
      if (submit) {
        submit.disabled = false;
        submit.textContent = "Request a briefing";
      }
    }).then(function () {
      clearTimeout(timer);
    });
  });
})();
