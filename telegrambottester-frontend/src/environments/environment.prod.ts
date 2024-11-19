export const environment = {
  name: 'prod',
  production: true,
  apiUrl: `http://telegrambottester.sco-techlab.es:3100/api/v1`,
  socketUrl: `ws://telegrambottester.sco-techlab.es:3100`,
  httpsEnabled: true,
};

environment.apiUrl = !environment.httpsEnabled
  ? environment.apiUrl
  : environment.apiUrl.replace('http', 'https');

  environment.socketUrl = !environment.httpsEnabled
  ? environment.socketUrl
  : environment.socketUrl.replace('ws', 'wss');