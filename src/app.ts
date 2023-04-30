import express from "express";
import dotenv from "dotenv";
import {
  joiBodyValidator,
  tokenSchema,
  userSignInSchema,
  userSignUpSchema,
} from "./middlewares/joiValidation";
import { DbManager } from "./utils/dbUtils/db";
import { RefreshTokenModal, UserModal } from "./types/modals";
import { UserService } from "./services/userService";
import { authValidator } from "./middlewares/authValidation";
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
export const dbManager = new DbManager({ logs: false });
dbManager.initDB();
const userManager = dbManager.getEntityManager<UserModal>("users");
userManager.createTableIfDoesntExist({ name: "", email: "", password: "" });
const refreshTokenManager =
  dbManager.getEntityManager<RefreshTokenModal>("refreshTokens");
refreshTokenManager.createTableIfDoesntExist({ token: "" });
const userService = new UserService(dbManager);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.send({ message: "Service is up" });
});

app.post(
  "/api/signup",
  joiBodyValidator(userSignUpSchema),
  userService.signup.bind(userService)
);

app.post(
  "/api/login",
  joiBodyValidator(userSignInSchema),
  userService.login.bind(userService)
);

app.post(
  "/api/token",
  joiBodyValidator(tokenSchema),
  userService.refreshToken.bind(userService)
);

app.get("/api/logout", authValidator, userService.logout.bind(userService));

app.get("/hidden", authValidator, (req, res) => {
  res.send({ message: "Hidden content", user: (req as any).user });
});

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
