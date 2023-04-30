import { EntityInterface } from "../utils/dbUtils/types";

export interface UserModal extends EntityInterface {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenModal extends EntityInterface {
  token: string;
}
