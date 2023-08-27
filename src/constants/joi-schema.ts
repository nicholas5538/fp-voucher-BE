import Joi from "joi";

export const tokenSchema = Joi.object({
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
    .email({ minDomainSegments: 2, tlds: { allow: ["com"] } })
    .required()
    .messages({
      "string.email": "Please provide a valid gmail",
      "string.empty": "Email is required",
      "string.pattern.base": "Email does not match a gmail format",
      "any.required": "Email is missing from the request",
    }),
  name: Joi.string().min(1).max(30).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name should be at least 1 character long",
    "string.max": "Name should be less than 30 characters long",
    "any.required": "Name is missing from the request",
  }),
}).with("email", "name");

const currentDate = new Date();
const fiveYearsFromNow = new Date();
fiveYearsFromNow.setFullYear(currentDate.getFullYear() + 5);

export const updateSchema = Joi.object({
  category: Joi.string()
    .valid("Pick-up", "Delivery", "Dine-in", "Pandamart", "Pandago")
    .trim()
    .messages({
      "string.empty": "Category should not be empty",
      "any.only": "Incorrect value",
    }),
  description: Joi.string()
    .min(4)
    .max(30)
    .pattern(/^[a-zA-Z0-9%$ -]+$/)
    .trim()
    .messages({
      "string.empty": "Description should not be empty",
      "string.min": "Description must contain at least 4 characters",
      "string.max": "Description must contain less than 30 characters",
      "string.pattern.base": "Only alphabets, numbers, $, - and  % are allowed",
    }),
  discount: Joi.number()
    .min(5)
    .max(51)
    .default(5)
    .integer()
    .positive()
    .messages({
      "number.min": "Discount must be 5% and above",
      "number.max": "Discount must not exceed 50%",
      "number.base": "No decimal is allowed",
      "number.positive": "Only positive integers are allowed",
    }),
  minSpending: Joi.number().min(0).max(100).precision(2).default(0).messages({
    "number.min": "Minimum spending must be $0 and above",
    "number.max": "Minimum spending must not exceed $100",
    "number.precision": "Only up to 2 decimal places are allowed",
    "number.base": "No decimal is allowed",
  }),
  promoCode: Joi.string()
    .min(4)
    .max(10)
    .pattern(/^[A-z0-9\b]+$/)
    .trim()
    .uppercase()
    .messages({
      "string.empty": "Promo code should not be empty",
      "string.min": "Enter at least 4 characters",
      "string.max": "Promo code should not exceed 10 characters",
      "string.pattern.base":
        "Promo code should not be empty or contain special characters",
    }),
  startDate: Joi.date().less(Joi.ref("expiryDate")).messages({
    "date.ref:expiryDate": "Start date must be before expiry date",
  }),
  expiryDate: Joi.date().greater("now").max(fiveYearsFromNow).messages({
    "date.greater": "Expiry date is not applicable today",
    "date.max": "Expiry date must not exceed 5 years from now",
  }),
});
