import { getAuth } from '../utils.js';
import axios from 'axios';
export const getTemplates = () => {
  const waba = process.env.waba;
  if (!waba) return;
  var config = {
    method: 'get',
    url: `https://api.nexmo.com/v2/whatsapp-manager/wabas/${process.env.waba}/templates`,
    headers: {
      Authorization: `Basic ${getAuth()}`,
    },
  };
  return new Promise((res, rej) => {
    axios(config)
      .then(function (response) {
        res(response.data.templates.filter((e) => e.status === 'APPROVED'));
      })
      .catch(function (error) {
        console.log(error);
        rej(error);
      });
  });
};
