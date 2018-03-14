# 定义函数,将网址转化为html内容
# 使用requests模块，教程参见：http://www.python-requests.org/en/master/
import requests
import re

def url2html_requests(url,encoding='utf-8'):
    # 输入:网址
    # 输出:网页内容
    
    # 检查网址是否以http://开头,少数网站是以https://开头的
    if not url.startswith('https://'):
        url = 'https://' + url
    try:
        # 获取网页内容
        r = requests.get(url,timeout=120) 
    except requests.exceptions.ConnectTimeout:
        
        #120s没有反应就报错
        print('输入的网址有误,请检查')
    else:
        if r.status_code == 200:
            # 默认编码格式为utf-8
            # 查看网页编码格式方法：Chrome浏览器Ctrl+U,搜索关键字charset，如果有，那么后面接着的就是编码格式
            # 不是所有网页都有charset关键字，可以试一下utf-8或者gbk
            r.encoding = encoding
            content = r.text
        
        # 返回网页内容
        return content


# 关于python正则表达式，可以参考：http://www.cnblogs.com/huxi/archive/2010/07/04/1771073.html
def html2imgurl(html_content):
    # detect image url in html content
    # return img url list

    pattern = re.compile('(https?)?//([\w\/\-\.]+)(jpg|png)') # re.S for . representate any characters
    list_raw = re.findall(pattern,html_content) # raw list is made up of 2 parts
    
    list_img_url = ['http://'+''.join(i) for i in list_raw]

    return list_img_url

def html2pageurl(html_content):
  # /search/flip?tn=baiduimage&ie=utf-8&word=%E8%BD%A6%E7%89%8C&pn=160&gsm=c8&ct=&ic=0&lm=-1&width=0&height=0
  pattern = re.compile('\/search\/flip\?[\d\w\=\&\-\%]+')
  list_raw = re.findall(pattern, html_content)
  list_page_url = ['https://image.baidu.com' + ''.join(i) for i in list_raw]
  return list_page_url

def saveimg_requests(imgurl,filename=''):
#http://stackoverflow.com/questions/13137817/how-to-download-image-using-requests
    try:
        r = requests.get(imgurl)
    except requests.exception.ConnectTimeout:
        print('Img NOT found')
    else:
        r.encoding = 'UFT-8'
        if filename =='':
            filename = imgurl.split('/').pop()#imgurl.split("/").pop()
            print(filename)
        filename = './images/' + filename;
        if r.status_code == 200:
            with open(filename, 'wb') as f:
                for chunk in r:
                    f.write(chunk)


content = url2html_requests('https://image.baidu.com/search/flip?tn=baiduimage&ipn=r&ct=201326592&cl=2&lm=-1&st=-1&fm=result&fr=&sf=1&fmq=1521007558581_R&pv=&ic=0&nc=1&z=&se=1&showtab=0&fb=0&width=&height=&face=0&istype=2&ie=utf-8&ctd=1521007558582%5E00_844X826&word=%E8%BD%A6%E7%89%8C')

pages = html2pageurl(content)
print(pages)
for page in pages:
  content = url2html_requests(page)
  images = html2imgurl(content)
  for image in images:
    try:
      saveimg_requests(image)
    except:
      pass
    
print('finish!')






#print(images)
