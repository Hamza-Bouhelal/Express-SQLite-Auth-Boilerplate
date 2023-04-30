import * as joi from "joi";

export const userSignUpSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export const userSignInSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export const tokenSchema = joi.object({
  refreshToken: joi.string().required(),
});

export const joiBodyValidator = (schema: joi.Schema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i: any) => i.message).join(",");
      res.status(400).json({ error: message });
    }
  };
};

export const joiQueryValidator = (schema: joi.Schema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.query);
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i: any) => i.message).join(",");
      res.status(400).json({ error: message });
    }
  };
};

export const joiParamsValidator = (schema: joi.Schema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.params);
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i: any) => i.message).join(",");
      res.status(400).json({ error: message });
    }
  };
};
