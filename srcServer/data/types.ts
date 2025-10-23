interface MessageResponse {
  message: string;
}

interface LoginResponse {
  success?: boolean;
  token?: string;
  user?: { id: string; name: string; };
  errors?: { path: string; message: string }[];
  message?: string;
}

interface LoginBody {
  name: string;
  password: string;
}


interface User {
  pk: string;           
  sk: string;
  userId: string;           
  name: string;
  password: string;
  GSIType: string;
}

interface JwtPayload {
  userId: string;
  exp: number;
}

export type { User, LoginBody, LoginResponse, JwtPayload, MessageResponse };
