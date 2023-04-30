import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { verify } from "jsonwebtoken";
import { getConfig } from "../utils/config";
import { DbManager } from "../utils/dbUtils/db";
import { RefreshTokenModal, UserModal } from "../types/modals";

const sendUnauthorized = (res: any) => {
  res
    .status(StatusCodes.UNAUTHORIZED)
    .send({ message: getReasonPhrase(StatusCodes.UNAUTHORIZED) });
};

export const authValidator = async (req: any, res: any, next: any) => {
  const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = getConfig();
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    sendUnauthorized(res);
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    sendUnauthorized(res);
    return;
  }
  await verify(token, ACCESS_TOKEN_SECRET, async (err: any, user: any) => {
    if (err) {
      sendUnauthorized(res);
      return;
    }
    let hasRefreshToken = false;
    await DbManager.entityManagers["refreshTokens"].getAll(
      async (tokens: RefreshTokenModal[]) => {
        tokens.forEach((refreshToken: RefreshTokenModal) => {
          try {
            const decodedToken = verify(
              refreshToken.token,
              REFRESH_TOKEN_SECRET
            );
            hasRefreshToken = (decodedToken as any).email === user.email;
          } catch (err) {}
        });
        if (!hasRefreshToken) {
          sendUnauthorized(res);
          return;
        }
        await DbManager.entityManagers["users"].find(
          { email: user.email },
          (users: UserModal[]) => {
            if (users.length === 0 || users[0].email !== user.email) {
              sendUnauthorized(res);
              return;
            }
            req.user = users[0];
            next();
          }
        );
      }
    );
  });
};
