const axios = require("axios");
require("dotenv").config();

const MY_TOKEN = process.env.MY_BOT_TOKEN;

const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;

function getAxiosInstance() {
  return {
    get(method, params) {
      return axios.get(`${BASE_URL}/${method}`, { params });
    },
    post(method, data) {
      return axios.post(`${BASE_URL}/${method}`, data);
    },
  };
}

const axiosInstance = getAxiosInstance();
module.exports = axiosInstance;
