let token = "24.0134f23f83f85217d4c25c92f43c4e16.2592000.1523539611.282335-10922511";
// getToken((r)=>{
//   token = r.access_token;
// })

bindFileInput('file', (base64) => {
  compressImage(base64, (r) => {
    base64 = r.substring(r.indexOf(',') + 1);
    getImageLocation(base64, (info)=>{
      console.log(info);
      
      const location = info.words_result[0].location;
      drawMosaic({
        left: location.left,
        top: location.top,
        height: location.height,
        width: location.width,
        offsetLeft: 1,
        base64: r,
        callback: (result)=>{
          document.querySelector('#img').src = result
        }
      })
      
    });

  });
})
/**
 * 获取图片中需要打码的位置
 * @param {string} base64 
 * @param {function} callback 
 */
function getImageLocation(base64, callback) {
  const urlParams = '?access_token=' + token;
  $.post('https://aip.baidubce.com/rest/2.0/ocr/v1/general' + urlParams, {
    image: base64,
  }, (r) => {
    callback && callback(r);
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
    // 获取File引用:
    const file = fileInput.files[0];
    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
      alert('不是有效的图片文件!');
      return;
    }
    // 读取文件:
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      callback && callback(data);
    };
    // 以DataURL的形式读取文件:
    reader.readAsDataURL(file);
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
      callback && callback(base64);
      return;
    }
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    context.clearRect(0, 0, targetWidth, targetHeight);
    context.drawImage(img, 0, 0, targetWidth, targetHeight);
    console.log(context.getImageData(0, 0, targetWidth, targetHeight));
    console.log(`压缩成功, 宽度：${targetWidth}, 高度：${targetHeight}`);
    callback && callback(canvas.toDataURL('image/png'))
  }

  img.src = base64;
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

  options = offsetLocation(options);
  console.log(options);
  
  let imageWidth, imageHeight, data;
  img.onload = function () {
    canvas.width = imageWidth = this.width;
    canvas.height = imageHeight = this.height;
    context.clearRect(0, 0, imageWidth, imageHeight);
    context.drawImage(img, 0, 0);
    context.fillStyle = color;
    context.fillRect(options.left, options.top, options.width, options.height);
    options.callback && options.callback(canvas.toDataURL('image/png'))
  }
  img.src = options.base64;
}

/**
 * 调整位置
 * @param {object} options 
 */
function offsetLocation(options) {
  let offset;
  if (options.offsetTop) {
    offset = options.height / 2 * options.offsetTop;
    options.top += offset;
    options.height -= offset;
  }
  
  if (options.offsetBottom) {
    offset = options.height / 2 * options.offsetBottom;
    options.height -= offset;
  }

  if (options.offsetLeft) {
    offset = options.width / 2 * options.offsetLeft;
    options.left += offset;
    options.width -= offset;
  }

  if (options.offsetRight) {
    offset = options.width / 2 * options.offsetRight;
    options.width -= offset;
  }

  return options;
}