const token = "24.0134f23f83f85217d4c25c92f43c4e16.2592000.1523539611.282335-10922511";
const urlParams = '?access_token=' + token;
/**
 * 获取图片中需要打码的位置
 * @param {string} base64 
 * @param {string} type 
 * general ----------- 文本
 * 
 * idcard ------------ 身份证  
 * driving_license ---- 驾驶证
 * 
 * vehicle_license ---- 行驶证
 * 
 * bankcard ---------- 银行卡
 * 
 * license_plate ------ 车牌
 * 
 * business_license --- 营业执照
 * 
 * receipt ------------ 通用票据
 */
function getImageInfo(base64, type) {
  return new Promise(function (resolve, reject) {
    $.post(`https://aip.baidubce.com/rest/2.0/ocr/v1/${type}${urlParams}`, {
      image: base64,
      id_card_side: 'front'
    }, (r) => {
      resolve(JSON.parse(r));
    }, (err)=>{
      reject(err);
    })
  })
}

function getImageCarLocation(base64) {
  return new Promise(function (resolve, reject) {
    $.post('https://aip.baidubce.com/rest/2.0/ocr/v1/license_plate' + urlParams, {
      image: base64,
    }, (r) => {
      resolve(r)
    }, (err)=>{
      reject(err)
    })
  })
}
/**
 * 绑定file读取文件事件
 * 选择文件后自动调用callback
 * @param {string} id input id
 * @param {function} callback 
 */
function bindFileInput(id, callback) {
  const fileInput = document.getElementById(id);
  // 监听change事件:
  fileInput.addEventListener('change', function () {
    // 清除背景图片:
    // 检查文件是否选择:
    if (!fileInput.value) {
      info.innerHTML = '没有选择文件';
      return;
    }
    // 读取文件:
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      callback && callback(data);
    };

    // 获取File引用:
    for (let index = 0; index < fileInput.files.length; index++) {
      const file = fileInput.files[index];
      if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
        console.log(file.name + ' 不是有效的图片文件!');
        return;
      }
      // 以DataURL的形式读取文件:
      setTimeout(() => {
        reader.readAsDataURL(file);
      }, 500 * index);
    }
  });
}
/**
 * 压缩图片，返回base64
 * @param {string} base64 
 */
function compressImage(base64, callback) {
  const img = new Image();
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const maxWidth = 600;
  const maxHeight = 600;

  let originWidth, originHeight, targetWidth, targetHeight, scale;
  const promise = new Promise(function (resolve, reject) {
    img.onload = function () {
      originWidth = this.width;
      originHeight = this.height;
  
      if (originWidth > maxWidth) {
        scale = originWidth / maxWidth;
        targetWidth = maxWidth;
        targetHeight = parseInt(originHeight / scale);
      } else if (originHeight > maxHeight) {
        scale = originHeight / maxHeight;
        targetHeight = maxHeight;
        targetWidth = parseInt(originWidth / scale);
      } else {
        // 不需要压缩
        console.log(`不需要压缩, 宽度：${originWidth}, 高度：${originHeight}`);
        resolve(base64)
        return;
      }
      canvas.width = targetWidth;
      canvas.height = targetHeight;
  
      context.clearRect(0, 0, targetWidth, targetHeight);
      context.drawImage(img, 0, 0, targetWidth, targetHeight);
      console.log(`压缩成功, 宽度：${targetWidth}, 高度：${targetHeight}`);
      resolve(canvas.toDataURL('image/png'))
    }
  })

  img.src = base64;

  return promise;
}

/**
 * 给指定图片打马赛克
 * @param {object} options 配置项
 * @param {int} left 
 * @param {int} top 
 * @param {int} width 
 * @param {int} height
 * @param {float} offsetTop 0.5: 顶部向中点缩进50%
 * @param {float} offsetBottom 
 * @param {float} offsetLeft
 * @param {float} offsetRight
 * @param {string} base64
 * @param {function} callback
 */
function drawMosaic(options) {
  const img = new Image();
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const color = '#d1d1d1'

  let imageWidth, imageHeight, data;
  const promise = new Promise(function (resolve, reject) {
    img.onload = function () {
      canvas.width = imageWidth = this.width;
      canvas.height = imageHeight = this.height;
      context.clearRect(0, 0, imageWidth, imageHeight);
      context.drawImage(img, 0, 0);
      context.fillStyle = color;
      if (options.location.length && options.location.length > 0) {
        for (const key in options.location) {
          if (options.location.hasOwnProperty(key)) {
            const element = options.location[key];
            context.fillRect(element.left, element.top, element.width, element.height);
          }
        }
      } else {
        context.fillRect(options.location.left, options.location.top, options.location.width, options.location.height);
      }
      
      resolve(canvas.toDataURL('image/png'))
    }
  })
  img.src = options.base64;

  return promise;
}

/**
 * 调整位置
 * @param {object} options 
 */
function offsetLocation(location, offsetLocation) {
  let offset;
  if (arguments.length !== 2) return;
  console.log(location);
  
  if (offsetLocation.top) {
    offset = location.height / 2 * offsetLocation.top;
    location.top += offset;
    location.height -= offset;
  }
  
  if (offsetLocation.bottom) {
    offset = location.height / 2 * offsetLocation.bottom;
    location.height -= offset;
  }

  if (offsetLocation.left) {
    offset = location.width / 2 * offsetLocation.left;
    location.left += offset;
    location.width -= offset;
  }

  if (offsetLocation.right) {
    offset = location.width / 2 * offsetLocation.right;
    location.width -= offset;
  }

  return location;
}