import joi from "joi";
import AppError from "../utils/AppError.js";

export const createAccountValidation = (req, res, next) => {
  const schema = joi.object({
    name: joi.string().min(3).max(30).required().messages({
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

    password: joi.string()
      .min(8)
      .max(20)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
        )
      )
      .required()
      .messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password is required.",
        "string.min": "Password must be at least 8 characters long.",
        "string.max": "Password must be at most 20 characters long.",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      }),
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }


  value.name = value.name.trim();
  value.name = value.name[0].toUpperCase() + value.name.slice(1).toLowerCase();

  value.email = value.email.toLowerCase();


  req.validatedData = value;

  next();
};


export const loginValidation = (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().required().messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),
    password: joi.string().required().messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
    }),
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: true,     
    stripUnknown: true,  
  });

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  value.email = value.email.toLowerCase();

  req.validatedData = value;

  next();
};