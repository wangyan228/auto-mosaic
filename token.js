// const client_id = 'gZK1TTRaY6RgU2AIKRykk9Xh'
// const client_secret = 'nb7RIqpM8RM9IrzyLfn22wMtG7IYyIZ9'

const appid = '1252255513'
const bucket = 'ocr'
const secret_id = 'AKID4wZw3vl9ON7crqw6NPDmAJDtKacT2SZP'
const secret_key = 'iAMHCvQhjW3KK3WjfNq42lIZcPyJOCtP'

function getToken(callback = () => {}) {
  $.post('https://aip.baidubce.com/oauth/2.0/token', {
    appid,
    client_secret,
    grant_type: 'client_credentials',
  }, callback)
}