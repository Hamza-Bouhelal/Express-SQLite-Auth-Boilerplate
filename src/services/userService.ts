import { sign, verify } from "jsonwebtoken";
import { getConfig } from "../utils/config";
import { EntityManager } from "../utils/dbUtils/entity";
import { RefreshTokenModal, UserModal } from "../types/modals";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { hash, compare } from "bcrypt";
import { DbManager } from "../utils/dbUtils/db";

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = getConfig();
function generateAccessToken(user: { email: string }) {
  return sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
}

function generateRefreshToken(user: { email: string }) {
  return sign(user, REFRESH_TOKEN_SECRET);
}
export class UserService {
  private userManager: EntityManager<UserModal>;
  private refreshTokenManager: EntityManager<RefreshTokenModal>;
  constructor(private dbManager: DbManager) {
    this.dbManager = dbManager;
    this.userManager = this.dbManager.getEntityManager<UserModal>("users");
    this.refreshTokenManager =
      this.dbManager.getEntityManager<RefreshTokenModal>("refreshTokens");
  }

  async auth(user: { email: string }, refreshTokenExisting?: string) {
    const accessToken = generateAccessToken(user);
    const refreshToken = refreshTokenExisting || generateRefreshToken(user);
    if (!refreshTokenExisting)
      await this.refreshTokenManager.save({ token: refreshToken });
    return { accessToken, refreshToken };
  }

  async refreshToken(req: any, res: any) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(StatusCodes.UNAUTHORIZED).send({
        error: "Refresh token missing",
      });
      return;
    }
    await this.refreshTokenManager.find(
      { token: refreshToken },
      async (tokens: RefreshTokenModal[]) => {
        if (tokens.length === 0) {
          res.status(StatusCodes.UNAUTHORIZED).send({
            error: getReasonPhrase(StatusCodes.UNAUTHORIZED),
          });
          return;
        }
        try {
          const decodedToken = verify(refreshToken, REFRESH_TOKEN_SECRET);
          const { email } = decodedToken as any;
          await this.userManager.find({ email }, async (users: UserModal[]) => {
            if (users.length === 0) {
              res
                .status(StatusCodes.NOT_FOUND)
                .send({ error: "User not found" });
            } else {
              res.status(StatusCodes.OK).send({
                ...(await this.auth({ email }, refreshToken)),
              });
            }
          });
        } catch (err) {
          res.status(StatusCodes.UNAUTHORIZED).send({
            error: "Invalid refresh token",
          });
        }
      }
    );
  }

  public async signup(req: any, res: any) {
    const { name, email, password } = req.body;
    await this.userManager.find({ email }, async (users: UserModal[]) => {
      if (users.length > 0) {
        res.status(StatusCodes.CONFLICT).send({ error: "User already exists" });
      } else {
        await this.userManager.save({
          name,
          email,
          password: await hash(password, 10),
        });
        res.status(StatusCodes.OK).send({
          message: "User created successfully",
          ...(await this.auth({ email })),
        });
      }
    });
  }

  public async login(req: any, res: any) {
    const { email, password } = req.body;
    await this.userManager.find({ email }, async (users: UserModal[]) => {
      if (users.length === 0) {
        res.status(StatusCodes.NOT_FOUND).send({ error: "User not found" });
      } else {
        const user = users[0];
        if (await compare(password, user.password)) {
          res.status(StatusCodes.OK).send({
            ...(await this.auth({ email })),
          });
        } else {
          res.status(StatusCodes.UNAUTHORIZED).send({
            error: "Invalid password",
          });
        }
      }
    });
  }

  public async logout(req: any, res: any) {
    await this.refreshTokenManager.getAll(
      async (tokens: RefreshTokenModal[]) => {
        tokens.forEach(async (refreshToken: RefreshTokenModal) => {
          try {
            const decodedToken = verify(
              refreshToken.token,
              REFRESH_TOKEN_SECRET
            );
            if ((decodedToken as any).email === req.user.email) {
              await this.refreshTokenManager.delete({
                token: refreshToken.token,
              });
            }
          } catch (err) {}
        });
      }
    );
    res
      .status(StatusCodes.OK)
      .send({ message: "User logged out successfully" });
  }
}
