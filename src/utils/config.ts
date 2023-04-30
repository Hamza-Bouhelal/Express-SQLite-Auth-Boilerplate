import path from "path";
export const getConfig = () => ({
  PORT: process.env.PORT || 3000,
  DB_PATH: path.resolve(process.env.DB_PATH || "./db"),
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET || "2192f2f9-87cc-47cb-8567-3a9ffc044484",
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET || "184cdc6f-aca8-499a-8625-c2c6d528825c",
});
