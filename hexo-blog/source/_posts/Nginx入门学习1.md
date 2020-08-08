---
title: Nginx入门学习（一）
date: '2019-1-02 08:30'
update: 2019-3-18
tags:
  - Nginx
categories: 负载均衡
grammar_cjkRuby: true
description: 高并发的负载均衡。
abbrlink: bff8936d
---



# 大型网站高并发运行处理

## 一、Nginx使用背景

[^ 开发者]: 由俄罗斯的程序设计师Igor Sysoev所开发

### 1、背景

1）高并发（海量数据，复杂业务，大量线程）集中访问服务器

2)单台服务器资源和能力有限

引发服务器宕机，无法提供服务

### 2、概念理解

1)高并发

> 海量数据请求访问（高），多个线程或者多个进程同时处理（并发）不同操作

2）负载均衡（Load Balance）

> 均匀分配请求|数据到不同操作单元上
>
> 其中，【均匀】是分布式系统架构设计中必须考虑的关键因素之一

3）常见互联网分布式架构

> 客户端层→反向代理层→站点层→服务层→数据层
>
> 只需要实现“将请求/数据均匀分摊到多个操作单元上执行”，就能实现负载均衡

![](https://wx1.sinaimg.cn/large/005zftzDgy1fz0gr7u5zoj31740hb42u.jpg)

## 二、Nginx入门

### 1、了解nginx是什么

> nginx是一款轻量级（开发方便，配置简捷）的Web 服务器/**反向代理**服务器及电子邮件（IMAP/POP3）代理服务器

### 2、Nginx特点

> * 占有内存少，CPU、内存等资源消耗也少；
> * 运行稳定，并发能力强，nginx的并发能力确实在同类型的网页服务器中表现非常好。
>
> （底层使用C语言编写）
>
> Tomcat的最高并发量为250个

### 3、Nginx   ==VS==  Apache

#### （1）nginx相对于apache的优点：

> * 轻量级，同样起web 服务，比apache 占用更少的内存及资源
> * nginx 处理请求是异步非阻塞（如前端ajax）的，而apache 则是阻塞型的
> * 在高并发下nginx能保持低资源低消耗高性能高度模块化的设计，编写模块相对简单
> * Nginx 配置简洁, Apache 复杂

#### （2）apache 相对于nginx 的优点：

> * Rewrite重写 ，比nginx 的rewrite 强大模块超多，基本想到的都可以找到
> * 少bug ，nginx 的bug 相对较多。（出身好起步高）



### 4、配置搭建Nginx

（Linux系统环境下）

`资源`：

Tengine（推荐）：[Tengine-2.2.3.tar.gz](http://tengine.taobao.org/download/tengine-2.2.3.tar.gz) 

​                                 [其他版本](http://tengine.taobao.org/download.html)

nginx：[nginx/Windows-1.8.1](http://nginx.org/download/nginx-1.8.1.zip)

#### 1）安装依赖

> 命令：
>
> ```shell
> yum -y install gcc openssl-devel pcre-devel zlib-devel
> ```
>
>

#### 2）解压tar包

> 命令：
>
> ```shell
> tar -zxvf Tengine-2.2.3.tar.gz
> ```
>
>

#### 3）configure配置：

在解压后的源码目录中

两种方案：

> * 命令：
>
>   ```shell
>    ./configure
>   ```
>
> 默认配置/usr/soft/nginx

> * 命令 :
>
>   ```shell
>    ./configure –profix==/usr/soft/nginx
>   ```
>
> 配置在指定路径

#### 4）编译并安装

(默认会在/usr/local下生成nginx目录)

> ```shell
> make && make install
> ```
>
>

#### 5）配置nginx服务

在/etc/rc.d/init.d/目录中建立文本文件nginx

在文件中粘贴下面的内容：

```txt
#!/bin/sh
#
# nginx - this script starts and stops the nginx daemon
#
# chkconfig:   - 85 15 
# description:  Nginx is an HTTP(S) server, HTTP(S) reverse \
#               proxy and IMAP/POP3 proxy server
# processname: nginx
# config:      /etc/nginx/nginx.conf
# config:      /etc/sysconfig/nginx
# pidfile:     /var/run/nginx.pid
 
# Source function library.
. /etc/rc.d/init.d/functions
 
# Source networking configuration.
. /etc/sysconfig/network
 
# Check that networking is up.
[ "$NETWORKING" = "no" ] && exit 0
 
nginx="/usr/local/nginx/sbin/nginx"
prog=$(basename $nginx)
 
NGINX_CONF_FILE="/usr/local/nginx/conf/nginx.conf"
 
[ -f /etc/sysconfig/nginx ] && . /etc/sysconfig/nginx
 
lockfile=/var/lock/subsys/nginx
 
make_dirs() {
   # make required directories
   user=`nginx -V 2>&1 | grep "configure arguments:" | sed 's/[^*]*--user=\([^ ]*\).*/\1/g' -`
   options=`$nginx -V 2>&1 | grep 'configure arguments:'`
   for opt in $options; do
       if [ `echo $opt | grep '.*-temp-path'` ]; then
           value=`echo $opt | cut -d "=" -f 2`
           if [ ! -d "$value" ]; then
               # echo "creating" $value
               mkdir -p $value && chown -R $user $value
           fi
       fi
   done
}
 
start() {
    [ -x $nginx ] || exit 5
    [ -f $NGINX_CONF_FILE ] || exit 6
    make_dirs
    echo -n $"Starting $prog: "
    daemon $nginx -c $NGINX_CONF_FILE
    retval=$?
    echo
    [ $retval -eq 0 ] && touch $lockfile
    return $retval
}
 
stop() {
    echo -n $"Stopping $prog: "
    killproc $prog -QUIT
    retval=$?
    echo
    [ $retval -eq 0 ] && rm -f $lockfile
    return $retval
}
 
restart() {
    configtest || return $?
    stop
    sleep 1
    start
}
 
reload() {
    configtest || return $?
    echo -n $"Reloading $prog: "
    killproc $nginx -HUP
    RETVAL=$?
    echo
}
 
force_reload() {
    restart
}
 
configtest() {
  $nginx -t -c $NGINX_CONF_FILE
}
 
rh_status() {
    status $prog
}
 
rh_status_q() {
    rh_status >/dev/null 2>&1
}
 
case "$1" in
    start)
        rh_status_q && exit 0
        $1
        ;;
    stop)
        rh_status_q || exit 0
        $1
        ;;
    restart|configtest)
        $1
        ;;
    reload)
        rh_status_q || exit 7
        $1
        ;;
    force-reload)
        force_reload
        ;;
    status)
        rh_status
        ;;
    condrestart|try-restart)
        rh_status_q || exit 0
            ;;
    *)
        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload|configtest}"
        exit 2
esac
```

#### 6）修改nginx文件的执行权限

> 命令 ：
>
> ```shell
>  chmod +x nginx
> ```
>
>

#### 7）添加该文件到系统服务中去

> ```shell
> chkconfig --add nginx
> ```
>
>

#### 8)查看是否添加成功

> ```shell
> chkconfig --list nginx
> ```
>
>

#### 9)启动，停止，重新装载

> ```shell
> service nginx start|stop
> ```
>
>

## 三、Nginx配置

### 1、查看配置

> ```shell
> cd   /usr/local/nginx/conf
> 
> vim   nginx.conf
> ```
>
>

### 2、配置解析

```properties
#进程数，建议设置和CPU个数一样或2倍
worker_processes  2;

#日志级别
error_log  logs/error.log  warning;(默认error级别)

# nginx 启动后的pid 存放位置
#pid        logs/nginx.pid;

events {
	#配置每个进程的连接数，总的连接数= worker_processes * worker_connections
    #默认1024
    worker_connections  10240;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
#连接超时时间，单位秒
keepalive_timeout  65;
    server {
        listen       80;
        server_name  localhost                 
        #默认请求
  		location / {
    				 root  html;   #定义服务器的默认网站根目录位置
   				  index  index.php index.html index.htm;  #定义首页索引文件的名称
        }
	    #定义错误提示页面
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
```

### 3、负载均衡配置

1）安装Tomcat，参考 `Tomcat配置`

#### 2）多负载均执行一下操作：

 多负载的情况下，打开指定虚拟机器

> open  node01    
>
> node01  为指定虚拟机器的别名，在hosts文件中配置的

启动Tomcat

> 在Tomcat解压的目录下       ./startup.sh  

注意： 记得关闭虚拟机器的防火墙

> service  iptables  stop

浏览器访问

> 虚拟机器IP地址：8080

**默认负载均衡配置**（轮询）

> ```
> http {
>     upstream shsxt{   
>     # 以下均为实际执行服务的服务器
>     #只有当hosts文件中给ip地址配置了别名，这里server后面才能用别名，
>     #否则跟IP地址
>         server node01; 
>         server node02; 
>     } 
> 
>     server { 
>     #指定访问端口为80 ，那么Tomcat服务器端的port也要改为80
>         listen 80;   
> 	    server_name  localhost;
>         location / {
>             proxy_pass http://shsxt;    
>             # shsxt  是指定的代理服务器
>         }
>     } 
> }
> ```



查看使用 80端口的程序

> ```shell
> netstat -anp |grep 80
> ```
>
>

配置文件编辑结束后，启动nginx服务

> ```shell
> service  nginx  start
> ```
>
>

#### （1）轮询负载均衡（默认）

```
 - 对应用程序服务器的请求以循环方式分发
```

#### （2）加权负载均衡

> 通过使用服务器权重，还可以进一步影响nginx负载均衡算法，
>
> 谁的权重越大，分发到的请求就越多。
>
> 权重总数：10

在nginx.conf文件中修改：

```
 upstream shsxt {
        server node01 weight=3;//域名为在/etc/hosts文件中取的别名
        server node02;
        server node03;
  }
```

配置修改之后，重启

> ```shell
> service  nginx  restart
> ```
>
>

#### （3）最少连接负载平衡

> 在连接负载最少的情况下，nginx会尽量避免将过多的请求分发给繁忙的应用程序服务器，
>
> 而是将新请求分发给不太繁忙的服务器，避免服务器过载。

在nginx.conf文件中修改：

```
upstream shsxt {
        least_conn;
        server node00;
        server node01;
        server node02;
    }
```

#### （4）保持会话持久性------ip-hash负载平衡机制

`特点`：保证相同的客户端总是定向到相同的服务;

(此方法可确保来自同一客户端的请求将始终定向到同一台服务器，除非此服务器不可用。)

在nginx.conf文件中修改：

```
upstream shsxt{
    ip_hash;
    server （IP地址|别名）;
    server （IP地址|别名）;
    server （IP地址|别名）;
}
```

#### （5）Nginx的访问控制

> Nginx还可以对IP的访问进行控制，allow代表允许，deny代表禁止.

```
location / {
deny 192.168.2.180;
allow 192.168.78.0/24;
allow 10.1.1.0/16;
allow 192.168.1.0/32;
deny all;
proxy_pass http://shsxt;
}
```

```
从上到下的顺序，匹配到了便跳出。
如上的例子先禁止了1个，
接下来允许了3个网段，
其中包含了一个ipv6，
最后未匹配的IP全部禁止访问
```

