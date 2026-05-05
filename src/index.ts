type FieldName = Exclude<keyof typeof app, "form" | "notifications" | "toast">;

function query<T extends typeof HTMLElement>(q: string, Cls: T) {
  const ele = document.querySelector(q);
  if (ele instanceof Cls) {
    return ele as InstanceType<T>;
  }
  throw Error(`Can't find element by: "${q}"`);
}

function validate(obj: Record<string, unknown>) {
  const errors = {
    "first-name": "",
    "last-name": "",
    message: "",
    email: "",
    "query-type": "",
    "agree-contact": "",
  };
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValidText = (val: unknown): val is string =>
    "string" === typeof val && val.length > 0;

  for (const key of Object.keys(errors) as FieldName[]) {
    switch (key) {
      case "query-type":
        if (!isValidText(obj[key])) {
          errors[key] = "Please select a query type";
        }
        break;

      case "agree-contact":
        if ("on" !== obj[key]) {
          errors[key] =
            "To submit this form, please consent to being contacted";
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

function renderErrorMessages(errors: Partial<Record<FieldName, string>>) {
  for (const key of Object.keys(errors) as FieldName[]) {
    app[key].ariaInvalid = errors[key] ? "true" : "false";
    for (const ele of app[key].ariaErrorMessageElements ?? []) {
      ele.textContent = errors[key] ?? "";
    }
  }
}

function renderToast(ms = 3000) {
  const toast = document.importNode(app.toast.content, true);

  document.startViewTransition(() => {
    app.notifications.append(toast);
  });

  setTimeout(() => {
    document.startViewTransition(() => app.notifications.replaceChildren());
  }, ms);
}

const app = {
  form: query("form", HTMLFormElement),
  toast: query(`#success-toast`, HTMLTemplateElement),
  notifications: query(`[aria-label="notifications"]`, HTMLElement),
  "first-name": query(`[name="first-name"]`, HTMLInputElement),
  "last-name": query(`[name="last-name"]`, HTMLInputElement),
  message: query(`[name="message"]`, HTMLTextAreaElement),
  email: query(`[name="email"]`, HTMLInputElement),
  "query-type": query(`fieldset:has([name="query-type"])`, HTMLFieldSetElement),
  "agree-contact": query(`[name="agree-contact"]`, HTMLInputElement),
};

app.form.noValidate = true;

for (const key of ["first-name", "last-name", "email", "message"] as const) {
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
    renderToast();
  }
});
