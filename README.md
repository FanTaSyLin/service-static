# Static Serve 静态文件服务

## 文件配置

配置文件为 config.yml

* port: 发布端口号
* root: 静态文件根目录

``` yml
Service-Static:
  port: 4605
  root: /Volumes/External/DATA
  blocklist:
    - /workspace/estimate-table: rwx
    - workspace/head: rwx
    - workspace/task-attach: rwx
  allowlist:
    - workspace/estimate-table: rwx
    - workspace/head: rwx
    - /workspace/task-attach: rwx
    - /workspace/task-attach/近红外大气可降水_MTYxNTE5Mzc3MjY1MDMwMjY1.png: ---
```

> **blocklist/allowlist 说明:**
>
> 1. 黑名单，除了黑名单中指定的文件，其他全部是 rwx
> 2. 白名单，除了名单中指定的文件，其他全部是 ---
> 3. 黑名单与白名单不可共存，白名单优先级高于黑名单
> 4. `r`可读，对应到目录时表示可以进入并读取目录下的文件列表，可以下载该目录下的文件，对应到文件表示可以读取或下载该文件;
> 5. `w`可写，对应到目录时表示可以在该目录下创建文件或目录, 可以upload文件到该目录下，对应到文件表示可以修改编辑该文件;
> 6. `x`可操作，对应到目录时表示可以删除该目录下的文件，对应到文件表示可以删除该文件
> 7. `/workspace/estimate-table`指相对于根路径的文件路径, `workspace/head`指只要包涵此路径名一律匹配
> 8. 白名单 `/workspace rwx` + `/workspace/estimate-table/xxx.txt rw-` 表示 xxx.txt 文件不可删除， /workspace 下的其他文件可删除
> 9. 黑名单 `/workspace ---` + `/workspace/estimate-table/xxx.txt rw-` 表示 xxx.txt 文件可读写，/workspace 下的其他文件 不可读写删

## 文件上传功能

### 文件上传

url：<http://{ip}:{port}/service/upload/{filedir>}

* demo: <http://121.36.13.81:4605/service/upload/events/kel7fcyf>
* 类型：post
* 参数：数据文件相对于root的相对路径 filedir ，例如：/events/kel7fcyf
* 数据：文件信息 如：鄱阳湖_6月26日.png
* 返回：200 JSON 上传文件实际路径

``` json
`/shinetek/shinetekview-data/events/kel7fcyf/鄱阳湖_6月26日.png`
```

## 文件发布功能

### 静态文件获取

url：<http://{ip}:{port}/service/static/{filename>}

* demo: <http://121.36.13.81:4605/service/static/events/kel7fcyf/%E9%84%B1%E9%98%B3%E6%B9%96_6%E6%9C%8826%E6%97%A5.png>
* 类型：get
* 参数：数据文件相对于root的全路径filename，例如：events/kel7fcyf/鄱阳湖_6月26日.png
* 返回：200 文件信息

> 可通过参数 `attachment`强制浏览器下载资源文件
>
> 可通过参数`json`强制以json格式返回目录下的文件列表, 默认返回html

```text
http://{ip}:{port}/service/static/{filename}?attachment

http://{ip}:{port}/service/static/{filename}?attachment=targetFilename

http://{ip}:{port}/service/static/{dir}?json=json
```

### 静态文件删除

url：<http://{ip}:{port}/service/static/{filename>}

* demo：<http://121.36.13.81:4605/service/static/events/kel7fcyf/%E9%84%B1%E9%98%B3%E6%B9%96_6%E6%9C%8826%E6%97%A5.png>
* 类型：delete
* 参数：数据文件相对于root的全路径filename，例如：events/kel7fcyf/鄱阳湖_6月26日.png
* 返回：200 JSON 删除文件结果

## todo

* [X]   可交互网页
* [ ]   block list
* [ ]   allow list
* [ ]   block/allow list 支持通配 规则同 .gitignore
