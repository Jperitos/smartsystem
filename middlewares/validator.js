const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .pattern(new RegExp("^[A-Za-z ]+$"))
    .messages({
      "string.pattern.base": "Name can only contain letters and spaces.",
    }),

  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ["com", "net"] } }),

  password: Joi.string()
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
    .messages({
      "string.pattern.base": "Password must be at least 8 characters long, include uppercase, lowercase, number, and a special character.",
    }),
});


const signinSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  password: Joi.string()
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")),
});

const acceptCodeSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  providedCode: Joi.number().required(),
});

const changePasswordSchema = Joi.object({
  newPassword: Joi.string()
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")),
  oldPassword: Joi.string()
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")),
});

const acceptFPCodeSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  providedCode: Joi.number().required(),
  newPassword: Joi.string()
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")),
});

const createPostSchema = Joi.object({
  title: Joi.string()
    .min(6)
    .max(60)
    .required(),
    description: Joi.string()
    .min(6)
    .max(600)
    .required(),
  userId: Joi.string().required(),

})
    
module.exports = { 
  signupSchema, 
  signinSchema, 
  acceptCodeSchema, 
  changePasswordSchema, 
  acceptFPCodeSchema, 
  createPostSchema 
};
