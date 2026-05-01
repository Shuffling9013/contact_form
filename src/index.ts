type FieldName = Exclude<keyof typeof app, "form">;

function query<T extends typeof HTMLElement>(q: string, Cls: T) {
  const ele = document.querySelector(q);
  if (ele instanceof Cls) {
    return ele as InstanceType<T>;
  }
  throw Error(`Can't find element by: "${q}"`);
}

function validate(obj: Record<string, unknown>) {
  const errors: Partial<Record<FieldName, string>> = {};
  const requiredFields = {
    "first-name": "This field is required",
    "last-name": "This field is required",
    message: "This field is required",
    email: "This field is required",
    "query-type": "Please select a query type",
    "agree-contact": "To submit this form, please consent to being contacted",
  };
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const isString = (val: unknown): val is string =>
    "string" === typeof val && val.length > 0;
  const isTrue = (val: unknown): val is string =>
    "boolean" === typeof val && val;

  for (const key of Object.keys(requiredFields) as FieldName[]) {
    if (!isString(obj[key]) && !isTrue(obj[key])) {
      errors[key] = requiredFields[key];
    }
  }

  if (isString(obj["email"]) && !emailPattern.test(obj["email"])) {
    errors["email"] = "Please enter a valid email address";
  }

  return errors;
}

function renderError(key: FieldName, value: string) {
  for (const ele of app[key].ariaErrorMessageElements ?? []) {
    ele.ariaHidden = "" === value ? "true" : "false";
    ele.textContent = value;
  }
}

const app = {
  form: query("form", HTMLFormElement),
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

    renderError(key, errors[key] ?? "");
  });
}

app.form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(app.form);
  const errors = validate(Object.fromEntries(data));

  for (const key of Object.keys(errors) as FieldName[]) {
    renderError(key, errors[key] ?? "");
  }
});
