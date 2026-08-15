import api from "../api/axios";

export const loginUser = async (data) => {
  const response = await api.post("accounts/login/", data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post("accounts/register/", data);
  return response.data;
};