import Joi from "joi";
import AppError from "../utils/AppError.js";

export const createTripValidation = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(10).max(50).required().messages({
      "string.base": "Title must be a string",
      "string.empty": "Title is required",
      "string.min": "Title must be at least 10 characters long",
      "string.max": "Title must not be more than 50 characters",
    }),

    description: Joi.string().max(150).allow("").optional().messages({
      "string.base": "Description must be a string",
      "string.max": "Description must not be more than 150 characters",
    }),

    startDate: Joi.date().required().messages({
      "date.base": "Start date must be a valid date",
      "any.required": "Start date is required",
    }),

    endDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
      "date.base": "End date must be a valid date",
      "any.required": "End date is required",
      "date.greater": "End date must be greater than start date",
    }),

    destination: Joi.array()
      .items(
        Joi.string().trim().min(3).required().messages({
          "string.base": "Each destination must be a string",
          "string.empty": "Destination cannot be empty",
          "string.min": "Each destination must be at least 3 characters long",
        }),
      )
      .min(1)
      .required()
      .messages({
        "array.base": "Destination must be an array of strings",
        "array.min": "At least one destination is required",
      }),
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  value.title = value.title.trim();
  value.title = value.title[0].toUpperCase() + value.title.slice(1);

  if (value.description) {
    value.description = value.description.trim();
    if (value.description.length > 0) {
      value.description =
        value.description[0].toUpperCase() + value.description.slice(1);
    }
  }

  value.destination = value.destination.map((dest) => {
    const d = dest.trim();
    if (!d) return d;
    return d[0].toUpperCase() + d.slice(1);
  });

  req.validatedData = value;

  next();
};

export const addItineraryActivitiesValidation = (req, res, next) => {
  const schema = Joi.object({
    time: Joi.string().required().messages({
      "string.base": "Time must be a string",
      "string.empty": "Time is required",
    }),

    title: Joi.string().required().min(3).max(20).messages({
      "string.base": "Title must be a string",
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must not be more than 20 characters",
      "string.empty": "Title is required",
    }),

    location: Joi.string().required().min(2).max(30).messages({
      "string.base": "Location must be a string",
      "string.min": "Location must be at least 2 characters long",
      "string.max": "Location must not be more than 30 characters",
      "string.empty": "Location is required",
    }),

    notes: Joi.string().required().messages({
      "string.base": "Notes must be a string",
      "string.empty": "Notes is required",
    }),
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  value.title = value.title.trim();
  value.title = value.title[0].toUpperCase() + value.title.slice(1);
  value.location = value.location.trim();
  value.location = value.location[0].toUpperCase() + value.location.slice(1);
  value.notes = value.notes.trim();
  console.log(value);
  req.validatedData = value;
  next();
};

export const addTaskValidation = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string().required().min(3).max(100).messages({
      "string.base": "Task text must be a string",
    }),
    assignedTo: Joi.string().required().messages({
      "string.base": "assignedTo must be a string",
      "string.empty": "assignedTo is required",
    }),
    completed: Joi.boolean().required().messages({
      "boolean.base": "completed must be a boolean",
      "any.required": "completed status is required",
    }),
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  value.text = value.text.trim();
  req.validatedData = value;
  next();
};

export const addExpenseValidation = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(3).max(100).required().messages({
      "string.base": "Title must be a string",
      "string.empty": "Title is required",
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must not exceed 100 characters",
      "any.required": "Title is required",
    }),

    totalAmount: Joi.number().positive().required().messages({
      "number.base": "Total amount must be a number",
      "number.positive": "Total amount must be positive",
      "any.required": "Total amount is required",
    }),

    category: Joi.string().trim().min(3).max(100).required().messages({
      "string.base": "Category must be a string",
      "string.empty": "Category is required",
      "string.min": "Category must be at least 3 characters long",
      "string.max": "Category must not exceed 100 characters",
      "any.required": "Category is required",
    }),

    payments: Joi.array()
      .items(
        Joi.object({
          user: Joi.string().required().messages({
            "string.base": "Payer user id must be a string",
            "string.empty": "Payer user id is required",
            "any.required": "Payer user id is required",
          }),

          paidAmount: Joi.number().positive().required().messages({
            "number.base": "Paid amount must be a number",
            "number.positive": "Paid amount must be positive",
            "any.required": "Paid amount is required",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.base": "Payments must be an array",
        "array.min": "At least one payment entry is required",
        "any.required": "Payments are required",
      }),

    participants: Joi.array()
      .items(
        Joi.object({
          user: Joi.string().required().messages({
            "string.base": "Participant user id must be a string",
            "string.empty": "Participant user id is required",
            "any.required": "Participant user id is required",
          }),

          shareAmount: Joi.number().positive().required().messages({
            "number.base": "Share amount must be a number",
            "number.positive": "Share amount must be positive",
            "any.required": "Share amount is required",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.base": "Participants must be an array",
        "array.min": "At least one participant is required",
        "any.required": "Participants are required",
      }),

    note: Joi.string().trim().min(3).max(500).allow("").optional().messages({
      "string.base": "Note must be a string",
      "string.min": "Note must be at least 3 characters long",
      "string.max": "Note must not exceed 500 characters",
    }),

    date: Joi.date().optional().messages({
      "date.base": "Date must be valid",
    }),
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.validatedData = value;

  const totalPaid = value.payments.reduce(
      (sum, payment) => sum + payment.paidAmount,
      0,
    );

    const totalShared = value.participants.reduce(
      (sum, participant) => sum + participant.shareAmount,
      0,
    );

    if (totalPaid !== value.totalAmount) {
      return next(
        new AppError("Sum of paid amounts must equal total amount", 400),
      );
    }

    if (totalShared !== value.totalAmount) {
      return next(
        new AppError("Sum of participant shares must equal total amount", 400),
      );
    }

  next();
};