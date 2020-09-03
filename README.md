# Static Serve 静态文件服务

## 文件配置
配置文件为 config.yml
* port: 发布端口号 
* root: 静态文件根目录
``` yml
Service-Static:
  port: 4605
  root: /Volumes/External/DATA
```


## 文件上传功能
### 文件上传
* url：http://121.36.13.81:4605/service/upload/`filedir`
* 类型：post
* 参数：数据文件路径filedir ，例如：/events/kel7fcyf
* 数据：文件信息
* 返回：200 JSON 上传文件实际路径

``` json
`/shinetek/shinetekview-data/events/kel7fcyf/鄱阳湖_6月26日.png`
```



## 文件发布功能
### 静态文件获取
* url：http://121.36.13.81:4605/service/static/`filename`
* 类型：get
* 参数：数据文件相对于root的全路径fileName，例如：/events/kel7fcyf
* 返回：200 文件信息
 

### 静态文件删除
* url：http://121.36.13.81:4605/service/static/`filename`
* 类型：delete
* 参数：数据文件相对于root的全路径fileName，例如：events/kel7fcyf/鄱阳湖_6月26日.png
* 返回：200 JSON 删除文件结果

## todo
* [ ]   支持多个根目录