/**
 * 身份证打码
 * @param {string} base64 
 * @param {string} compressBase64 
 */
function IDCardMosaic(base64, compressBase64) {
  getImageInfo(base64, 'idcard').then((info) => {
    const data = info.words_result;
    console.log(data);
    if (data.length === 0) return;
    let location = []
    const headImageLocation = getHeadImageLocation(data);
    console.log(headImageLocation);
    
    location.push(headImageLocation)
    for (const key in data) {
      if (key === '民族' || key === '性别') continue;
      if (data.hasOwnProperty(key)) {
        let element = data[key].location;
        if (key === '住址') {
          element.height /= 2;
          location.push({
            height: element.height,
            top: element.top,
            left: element.left + element.width / 2,
            width: element.width / 2
          });
          location.push({
            height: element.height,
            top: element.top + element.height,
            left: element.left,
            width: element.width
          });
        } else if (key === '公民身份号码'){
          location.push(offsetLocation(element, {left: 0.4, right: 0.4}))
        } else if (key === '姓名'){
          location.push(offsetLocation(element, {left: 0.4}))
        } else if (key === '出生'){
          location.push(offsetLocation(element, {left: 0.2}))
        } else {
          location.push(element)
        }
      }
    }
    drawMosaic({
      location,
      base64: compressBase64
    }).then((result) => {
      appendImage(result);
    })
  })
}
/**
 * 计算身份证人物头像位置
 * @param {object} data 位置信息 height,width,top,left
 */
function getHeadImageLocation(data) {
  const headImage = {};
  headImage.width = data["住址"].location.width / 1.24;
  headImage.top = data["姓名"].location.top;
  headImage.height = data["公民身份号码"].location.top - data["公民身份号码"].location.height - data["姓名"].location.top;
  headImage.left = data["住址"].location.left + data["住址"].location.width + data["公民身份号码"].location.height * 0.8;
  return headImage;
}

function carMosaic(base64, compressBase64) {
  getImageInfo(base64, 'accurate').then((info) => {
    const data = info.words_result;
    if (data.length === 0) {
      alert('未识别到车牌');
      console.log(info);
      return;
    }
    // console.log(data);
    const reg = /\w{4}/
    const location = data.map((value)=>{
      return reg.test(value.words) && offsetLocation(value.location, {left: 0.5, right: 0.5});
    });
    drawMosaic({
      location,
      base64: compressBase64
    }).then((result) => {
      appendImage(result);
    })
  }).catch((err)=>{
    console.log(err);
  })
}

function textMosaic(base64, compressBase64) {
  getImageInfo(base64, 'general').then((info) => {
    const data = info.words_result;
    console.log(data);
    
    if (data.length === 0) return;
    const location = data[0].location;
    drawMosaic({
      location,
      base64: compressBase64
    }).then((result) => {
      appendImage(result);
    })
  })
}