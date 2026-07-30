import client, { setAccessToken } from './client';

export const loginApi = async (email, password) => {
  const response = await client.post('/auth/login', { email, password });
  if (response.data.accessToken) {
    setAccessToken(response.data.accessToken);
  }
  return response.data;
};

export const signupApi = async (email, password) => {
  const response = await client.post('/auth/signup', { email, password });
  if (response.data.accessToken) {
    setAccessToken(response.data.accessToken);
  }
  return response.data;
};

export const refreshTokenApi = async () => {
  const response = await client.post('/auth/refresh');
  if (response.data.accessToken) {
    setAccessToken(response.data.accessToken);
  }
  return response.data;
};

export const logoutApi = async () => {
  try {
    await client.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
};
