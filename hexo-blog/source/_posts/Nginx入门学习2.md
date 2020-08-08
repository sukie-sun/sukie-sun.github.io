---
title: Nginx入门学习（二）
date: '2019-1-02 14:30'
update: 2019-3-18
tags:
  - Nginx
categories: 负载均衡
grammar_cjkRuby: true
description: 负载均衡很重要的问题：session一致性问题
abbrlink: 8fee7fb5
---

## 一、虚拟主机

### 1、什么是虚拟主机？

（1）是指在网络服务器上分出一定的磁盘空间，租给用户以放置站点以及应用空间，并提供必要的存储和传输功能。

（2）是被虚拟化的逻辑主机，也可理解为就是把一台物理服务器划分成多个“虚拟“的服务器，各个虚拟主机之间完全独立，对外界呈现的状态也同单独物理主机表现完全相同。

### 2、虚拟主有啥特点？

（1）多台虚拟主机共享一台真实主机资源，大幅度降低了硬件、网络维护、通信线路等的费用

（2）也大大简化了服务器管理的复杂性；

### 3、虚拟主机有哪些类别？

（1）基于域名

```properties
http { 
    upstream shsxt{ 
        server node01; 
        server node02; 
     } 
	upstream bjsxt{ 
        server node03; 
     } 
     
     server {    
            listen 80; 
            //访问sxt2.com的时候，会把请求导到bjsxt的服务器组里
            server_name  sxt2.com;
            location / {
                proxy_pass http://bjsxt;
            }
      } 
      server { 
            listen 80; 
           //访问sxt1.com的时候，会把请求导到shsxt的服务器组里
            server_name  sxt1.com; 
            location / {
                proxy_pass http://shsxt;
            }
      } 
}
```

> 注意：



> （1）基于域名的虚拟机主机 在模拟应用场景时，需要在windows系统的hosts文件里配置域名映射。
>
> （C:\Windows\System32\drivers\etc\hosts     给IP取别名）
>
> 如：192.168.198.130   sxt1.com



> （2）每台服务器的Tomcat的端口不与配置的listen一致，那么windows系统浏览器访问时，需要加上TOmcat的端口，（192.168.198.128：8080）
>
> ​         如果一致，那么就可以不加Tomcat的端口因为Nginx服务器默认端口为80

（2）基于端口

```
http { 
    upstream shsxt{ 
        server node01; 
        server node02; 
     } 
	upstream bjsxt{ 
        server node03
    } 
 server { 
       //当访问nginx的80端口时，将请求导给bjsxt组
        listen 8080; 
        server_name 192.168.198.128;
        location / {
            proxy_pass http://bjsxt;
        }
} 
  server { 
           //当访问nginx的81端口时，将请求导给shsxt组
            listen 81; 
            server_name 192.168.198.128;  //nginx服务器的IP
            location / {
                proxy_pass http://shsxt;
            }
    } 
}
```

（3）基于IP  ：（不常用）

## 二、正向代理和反向代理

### 1、正向代理

理解：

> 代理客户端，如通过VPN ，隐藏客户端，访问目标服务器（服务端可见）

举例：

> 国内不能直接访问谷歌，但是可以访问代理服务器，通过代理服务器可以访问谷歌。（就是翻墙）
>
> 但是，需要客户端必须设置正向代理服务器，并且要知道正向代理服务器的IP地址和端口

### 2、反向代理

理解：

> 代理服务端，通过负载均衡服务器（如Nginx），隐藏服务端，分发客户端的不同请求（客户端可见）到内部网络上的服务器

举例：

> 如我们访问www.baidu.com的时候，它背后有很多台服务器，客户端并不知道具体是哪一台服务器给你提供的服务，只要知道反向代理服务器是谁就好了，反向代理服务器就会把我们的请求转发到真实服务器上。

Nginx就是性能很好的反向代理服务器，用来作负载均衡。

## 三、Nginx的session一致性问题

### 1、背景：

http协议是无状态的，多次访问如果是不同服务器响应请求，就会出现上次访问留下的session或cookie失效。这就引发了session共享的问题。

### 2、Session一致性解决方案

（1）–session复制
   tomcat 本身带有复制session的功能。

（2）-共享session

  需要专门管理session的软件，
   memcached 缓存服务，可以和tomcat整合，帮助tomcat共享管理session。

![](https://wx1.sinaimg.cn/large/005zftzDgy1fz0gr7u5zoj31740hb42u.jpg)

### 3、搭建memcached 

memcached （同redis一样）是基于`内存`的数据库

#### 1、安装memcached 

>   ```shell
>   yum –y install memcache
>   ```

验证本机11211端口是否可用:

>    ```shell
>    telnet localhost 11211
>    ```

#### 2、启动memcached 

(IP地址为memcached安装的节点的IP地址)

>    ```shell
>    memcached -d -m 128m -p 11211 -l 192.168.198.128 -u root -P /tmp/
>    ```

3、拷贝memcached所需jar包

将web服务器连接memcached的jar包拷贝到tomcat的lib目录下

`访问Tomcat服务器期间产生的session通过相关jar包，才能写入到memcached数据库中 `

> asm-3.2.jar
>
> kryo-1.04.jar
>
> kryo-serializers-0.11.jar
>
> memcached-session-manager-1.7.0.jar
>
> memcached-session-manager-tc7-1.8.1.jar
>
> minlog-1.2.jar
>
> msm-kryo-serializer-1.7.0.jar
>
> reflectasm-1.01.jar
>
> spymemcached-2.7.3.jar

4、配置tomcat的conf目录下的context.xml

```xml
<Manager className="de.javakaffee.web.msm.MemcachedBackupSessionManager"
    memcachedNodes="n1:192.168.198.128:11211"
    sticky="true"
    lockingMode="auto"
    sessionBackupAsync="false"
   requestUriIgnorePattern=".*\.(ico|png|gif|jpg|css|js)$"
sessionBackupTimeout="1000" transcoderFactoryClass="de.javakaffee.web.msm.serializer.kryo.KryoTranscoderFactory" />
```

配置memcachedNodes属性，

> 配置memcached数据库的ip和端口，默认11211，多个的话用逗号隔开.
>
> 目的是为了让tomcat服务器从memcached缓存里面拿session或者是放session

5、将配置完成的context.xml发送到其他虚拟机器上

> scp -r context.xml root@node01:`pwd`
>
> 或
>
> scp -r context.xml node01:`pwd`
>
> 或
>
> scp -r context.xml root@192.168.198.130:`pwd`

6、修改tomcat安装目录中的webapps/ROOT下的 index.jsp，取sessionid看一看

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<html lang="en">
SessionID:<%=session.getId()%>
</br>
SessionIP:<%=request.getServerName()%>
</br>
<h1>tomcat1</h1>
</html>
```

7、在浏览器段访问服务器，默认端口 ： 80 ，对此测验，就会发现sessionID不会改变