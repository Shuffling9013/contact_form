// src/index.ts
function query(q, Cls) {
  const ele = document.querySelector(q);
  if (ele instanceof Cls) {
    return ele;
  }
  throw Error(`Can't find element by: "${q}"`);
}
function validate(obj) {
  const errors = {
    "first-name": "",
    "last-name": "",
    message: "",
    email: "",
    "query-type": "",
    "agree-contact": ""
  };
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValidText = (val) => typeof val === "string" && val.length > 0;
  for (const key of Object.keys(errors)) {
    switch (key) {
      case "query-type":
        if (!isValidText(obj[key])) {
          errors[key] = "Please select a query type";
        }
        break;
      case "agree-contact":
        if (obj[key] !== "on") {
          errors[key] = "To submit this form, please consent to being contacted";
        }
        break;
      case "email":
        if (isValidText(obj[key])) {
          if (!emailPattern.test(obj[key])) {
            errors["email"] = "Please enter a valid email address";
          }
        } else {
          errors[key] = "This field is required";
        }
        break;
      default:
        if (!isValidText(obj[key])) {
          errors[key] = "This field is required";
        }
        break;
    }
  }
  return errors;
}
function renderErrorMessages(errors) {
  for (const key of Object.keys(errors)) {
    for (const ele of app[key].ariaErrorMessageElements ?? []) {
      ele.ariaHidden = errors[key] ? "false" : "true";
      ele.textContent = errors[key] ?? "";
    }
  }
}
function renderToast(on) {
  app.toast.hidden = !on;
  app.toast.ariaHidden = String(!on);
}
var app = {
  form: query("form", HTMLFormElement),
  "first-name": query(`[name="first-name"]`, HTMLInputElement),
  "last-name": query(`[name="last-name"]`, HTMLInputElement),
  message: query(`[name="message"]`, HTMLTextAreaElement),
  email: query(`[name="email"]`, HTMLInputElement),
  "query-type": query(`fieldset:has([name="query-type"])`, HTMLFieldSetElement),
  "agree-contact": query(`[name="agree-contact"]`, HTMLInputElement),
  toast: query(`[aria-labelledby="toast-heading"]`, HTMLElement)
};
app.form.noValidate = true;
for (const key of ["first-name", "last-name", "email", "message"]) {
  app[key].addEventListener("change", () => {
    const data = new FormData(app.form);
    const errors = validate(Object.fromEntries(data));
    renderErrorMessages({ [key]: errors[key] });
  });
}
app.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(app.form);
  const errors = validate(Object.fromEntries(data));
  const isValidForm = Object.values(errors).every((val) => val === "");
  renderErrorMessages(errors);
  if (isValidForm) {
    app.form.reset();
    document.startViewTransition(() => renderToast(true));
    setTimeout(() => document.startViewTransition(() => renderToast(false)), 3000);
  }
});
