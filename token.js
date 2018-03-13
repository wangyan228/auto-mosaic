const client_id = 'gZK1TTRaY6RgU2AIKRykk9Xh'
const client_secret = 'nb7RIqpM8RM9IrzyLfn22wMtG7IYyIZ9'


function getToken(callback = () => {}) {
  $.post('https://aip.baidubce.com/oauth/2.0/token', {
    client_id,
    client_secret,
    grant_type: 'client_credentials',
  }, callback)
}