export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  isDeleted: boolean;
  permissions?: {
    _id: string;
    name: string;
    apiPath: string;
    module: string;
  }[];
}
