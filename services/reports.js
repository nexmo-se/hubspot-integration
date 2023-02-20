import { getAuth, OneWeekAgo } from '../utils.js';
import axios from 'axios';
export const getRecords = (direction, phone) => {
  let url;

  const baseUrl = `https://api.nexmo.com/v2/reports/records?account_id=${process.env.apiKey}&limit=${
    process.env.limit
  }&product=MESSAGES&include_message=true&date_start=${OneWeekAgo()}&direction=${direction}`;
  if (direction === 'outbound') {
    url = `${baseUrl}&to=${phone}`;
  } else {
    url = `${baseUrl}&from=${phone}`;
  }
  var config = {
    method: 'get',
    url: url,
    headers: {
      Authorization: `Basic ${getAuth()}`,
    },
  };
  return new Promise((res, rej) => {
    axios(config)
      .then(function (response) {
        res(response.data);
      })
      .catch(function (error) {
        console.log(error);
        rej(error);
      });
  });
};

export const getMessagesReport = (results) => {
  const responseObj = {};
  responseObj.results = [];
  results.forEach((r) => {
    responseObj.results.push({
      objectId: Math.floor(Math.random() * 10),
      title: r.direction,
      created: r.date_received,
      from: r.from,
      to: r.to,
      message_body: r.message_body ? r.message_body : 'template',
    });
  });
  return responseObj.results.sort(function (a, b) {
    return new Date(b.created) - new Date(a.created);
  });
};
