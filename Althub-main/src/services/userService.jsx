import axios from "axios";
import { WEB_URL } from "../baseURL";

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${WEB_URL}/api/searchUserById/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};