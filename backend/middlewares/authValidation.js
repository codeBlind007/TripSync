import joi from "joi";

export const createAccountValidation = (req, res, next) => {
  const { name, email, password } = req.body;
  const schema = joi.object({
    name: joi.string().required().min(3).max(30).messages({
      "string.base": "Name must be a string.",
      "string.empty": "Name is required.",
      "string.min": "Name must be at least 3 characters long.",
      "string.max": "Name must be at most 30 characters long.",
    }),
    email: joi.string().email().required().messages({
      "string.base": "Email must be a string.",
      "string.empty": "Email is required.",
      "string.email": "Email must be a valid email address.",
    }),
    password: joi
      .string()
      .required()
      .min(8)
      .max(20)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        ),
      )
      .messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password is required.",
        "string.min": "Password must be at least 8 characters long.",
        "string.max": "Password must be at most 20 characters long.",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      }),
  });

  const { error, value } = schema.validate({ name, email, password });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  value.name = value.name.trim();
  value.name = value.name[0].toUpperCase() + value.name.slice(1).toLowerCase();
  value.email = value.email.toLowerCase();

  req.validatedData = value;
  next();
};

export const loginValidation = (req, res, next) => {
  const { email, password } = req.body;
  const schema = joi.object({
    email: joi.string().required().email().messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is required",
      "string.email": "Invalid Email format",
    }),
    password: joi.string().required().messages({
      "string.base": "Password must be a string",
      "string.empty": "password is required",
    }),
  });

  const { error, value } = schema.validate({ email, password });
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  console.log(value);

  value.email = value.email.toLowerCase();
  req.validatedData = value;

  console.log("transformed: ", value);
  next();
};
