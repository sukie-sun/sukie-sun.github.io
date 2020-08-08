---
title: 常用Linux命令的学习（二）
tags: Linux命令
categories: Linux
grammar_cjkRuby: true
description: Linux系统的磁盘、网络、权限、配置命令
abbrlink: 282233d1
date: 2018-12-28 00:00:00
---




## 一、磁盘指令

### 1、查看硬盘信息

<!---more-->

> 命令：df

`（默认大小以kb显示） df -k（以kb为单位） df -m（ 以mb为单位） df –h （易于阅读） `

### 2、查看文件/目录的大小

> 命令：du filename|foldername

`` 
（默认单位为kb）-k	kb单位 -m	mb单位 -a 所有文件和目录  -h 更易于阅读
​    --max-depth=0	目录深度
``

## 二、网络指令

### 1、查看网络配置信息

> ```shell
> 命令:ifconfig
> ```
>
>

![](https://wx1.sinaimg.cn/large/005zftzDgy1g15t5lxs9oj30fe07fmzk.jpg)

> 箭头1指向的是本机IP，箭头2为广播地址，箭头3位子网掩码。

### 2、测试与目标主机的连通性

> 命令：ping remote_ip     

` ctrl + c :结束ping进程 `

可以ping通Windows系统的IP

![](https://wx1.sinaimg.cn/large/005zftzDgy1g15t87brh1j30fe04675r.jpg)

输入ping 192.168.78.192代表测试本机和192主机的网络情况，

箭头1表示一共接收到了3个包，箭头2表示丢包率为0，表示两者之间的网络顺畅。

注意：linux系统的ping命令会一直发送数据包，进行测试，除非认为的按ctrl + c停止掉，

​           windows系统默认只会发4个包进行测试，以下为windows的dos命令。

![](https://wx1.sinaimg.cn/large/005zftzDgy1g15t9ie02zj30fe07vq5g.jpg)



### 3、显示各种网络相关信息

> 命令：
>
> ```shell
> netstat -anpt
> ```
>
>

```
-a (all)显示所有选项，默认不显示LISTEN相关
-t (tcp)仅显示tcp相关选项
-u (udp)仅显示udp相关选项
-n 拒绝显示别名，能显示数字的全部转化成数字。
-l 仅列出有在 Listen (监听) 的服務状态

-p 显示建立相关链接的程序名
-r 显示路由信息，路由表
-e 显示扩展信息，例如uid等
-s 按各个协议进行统计
-c 每隔一个固定时间，执行该netstat命令。

提示：LISTEN和LISTENING的状态只有用-a或者-l才能看到

```



`查看端口号（是否被占用）
(1)、lsof -i:端口号  （需要先安装lsof）
(2)、netstat -tunlp|grep 端口号`

### 4、测试远程主机的网络端口

安装telnet:

```shell
yum install telnet -y
```

查看本机能否连上远程主机的端口号:

```shell
 telnet ip  port   
```

![](https://wx1.sinaimg.cn/large/005zftzDgy1g15tfzb6xtj30dv02y74u.jpg)

`测试成功后，按ctrl + ] 键，然后弹出telnet>时，再按q退出`

![](https://wx1.sinaimg.cn/large/005zftzDgy1g15tgyzcthj30fa04m3zb.jpg)

### 5、http请求模拟

```shell
命令: curl  [option]  [url]
```

举例：

 模拟请求百度

```shell
curl -X get www.baidu.com  
```



> 用法解释：
>
> -X/--request [GET|POST|PUT|DELETE|…]  使用指定的http method发出 http request
>
> -H/--header               设定request里的header
>
> -i/--include              显示response的header
>
> -d/--data                  设定 http parameters 
>
> -v/--verbose               输出比较多的信息
>
> -u/--user                  使用者账号，密码
>
> -b/--cookie                cookie

参数-X跟--request兩个功能是一样的 

举例：

```shell
curl -X GET http://www.baidu.com/  
curl --request GET http://www.baidu.com/ 
curl -X GET "http://www.rest.com/api/users"
curl -X POST "http://www.rest.com/api/users"
curl -X PUT "http://www.rest.com/api/users"
curl -X DELETE "http://www.rest.com/api/users"

```



## 三、系统管理指令

### 1、用户操作

``` 
     操作	            命令
	创建用户	       useradd|adduser username
	修改密码	       passwd username
	删除用户	       userdel –r username
	修改用户（已下线）：	
	                 修改用户名: usermod –l new_name oldname
                     锁定账户: usermod –L username
                     解除账户： usermod –U username
	查看当前登录用户	仅root 用户：whoami   | cat /etc/shadow
	                 普通用户：cat /etc/pqsswd
```

### 2、用户组操作

``` 
      操作	            命令
      创建用户组	         groupadd groupname
	  删除用户组	         groupdel groupname
	  修改用户组	         groupmod –n new_name old_name
	  查看用户组	         groups  （查看的是当前用户所在的用户组）
```

### 3、用户+用户组	

```  
      操作	                命令
    修改用户的主组	         usermod –g groupname username
	给用户追加附加组	    usermod –G groupname username
	查看用户组中用户数	   cat /etc/group
	注意：创建用户时，系统默认会创建一个和用户名字一样的主组
```

### 4、系统权限

``` 
     操作	                     命令
  查看/usr下所有权限	   ll /usr
                        权限类别	r（读取：4） w（写入：2） x（执行：1） 
                        三个为一组，无权限用 —代替
	                    UGO模型	U（User） G(Group)  O(其他)
	权限修改	    
                      修改所有者：chown username file|folder
		              (递归)修改所有者和所属组： chown -r username：groupname file|folder 
		              修改所属组：chgrp groupname file|folder
		              修改权限：chmod ugo+rwx file|folder
```
## 四、系统配置指令

### 0.1环境变量

全局变量、局部变量

首先考虑一个问题，为什么我们先前敲的yum, service,date,useradd等等，可以直接使用，系统怎么知道这些命令对应的程序是放在哪里的呢？

这是由于无论是windows系统还是linux系统，都有一个叫做path的系统环境变量，当我们在敲命令时，系统会到path对应的目录下寻找，找到的话就会执行，找不到就会报没有这个命令。如下图：

![](https://wx1.sinaimg.cn/large/005zftzDgy1g15ufak65qj309u031wf0.jpg)

配置系统环境变量，使得某些命令在执行时，系统可以找到命令对应的执行程序，命令才能正常执行。

我们可以查看一下，系统一共在哪些目录里寻找命令对应的程序。

命令：

```shell
echo $PATH
```

![](https://wx1.sinaimg.cn/large/005zftzDgy1g15uidckb9j30fe01amxd.jpg)

 可以看到path里有很多路径，路径之间有冒号隔开。当用户敲命令时，系统会从左往右依次寻找对应的程序，有的话则运行该程序，没有的就报错，command not found.

配置全局环境变量：

> ```shell
> vim  /etc/profile  #全局环境变量所在的文件
> ```
>
> 在文件中：
>
> PATH=$PATH:(命令所在目录)
>
> 退出文件编辑后：
>
> source  /etc/profile  
>
>  (重新加载资源，有的可能需要重启机器，这不适用于实际状况)



配置局部环境变量：（推荐，限当前登录用户使用）

> 查看所有文件(root目录下)
>
> ls  -a    (发现隐藏文件    .bash.profile)
>
> ```shell
> vim  ~/ bash_profile   #局部变量所在的文件
> ```
>
> 在文件中：
>
> export  PATH =$PATH:(命令所在目录)



### 0.2脚本运行

编辑脚本：

```shell
vim test.sh 
```

脚本内容：

```shell
#！/bin/sh
echo " hello test sh"
```

给脚本添加权限：

```shell
chmod 700 test.sh
```

运行：

```shell
一种是到脚本的目录下执行：
运行命令 ： ./test.sh  ,代表执行当前目录里的脚本test.sh

一种是敲脚本的绝对路径：
运行命令 ：/usr/test/test.sh

第三种方式添加到环境变量中
```

以上两种运行方式都不是很简便，因为先前我们执行yum service命令等，都是直接敲对应的命令的。所以我们也可以参照这样子做，只要我们配一个环境变量就好。

编辑环境变量：

```shell
vim /etc/profile
```

将test.sh 所在路径放到path后面即可

编辑完之后，执行命令，

```shell
source /etc/profile
```

重新加载环境变量，此时会发现PATH路径多了一个/usr/test。

最后验证一下，直接执行test.sh



### 1.修改主机名

``` text
    编辑文件：      命令： vim /etc/sysconfig/network
    文件内容：      HOSTNAME=node00
  （重启生效)reboot
```
###  2.DNS配置:

 /etc/resolv.conf 为DNS服务器的地址文件

``` 
查看DNS服务器的地址：  cat /etc/resolv.conf
修改DNS服务器地址：  
法一：
编辑文件：   
vim  /etc/sysconfig/network.scripts/ifconfig-eth0
在配置网关时，配置DNS1=114.114.114.114（不推荐，江苏南京的IP）

法二：
编辑文件：     
vim /etc/resolv.conf
文件内容：（用本地网关解析）     
nameserver 192.168.198.0( 此为虚拟机中的网关地址)

```

###  3.sudo权限配置

``` 
   操作             命令
编辑权限配置文件：    vim /etc/sudoers
格式：
        授权用户 主机=[(切换到哪些用户或用户组)] [是否需要密码验证] 路径/命令
举例：
        test  ALL=(root)  /usr/bin/yum,/sbin/service
解释：
        test用户就可以用yum和servie命令，
	   但是，使用时需要在前面加上sudo再敲命令。
	   第一次使用需要输入用户密码,且每个十五分钟需要一次密码验证
修改：
       test ALL=(root) NOPASSWD: /usr/bin/yum,/sbin/service
这样就不需要密码了
将权限赋予某个组，%+组名
%group ALL=(root) NOPASSWD: /usr/bin/yum,/sbin/service

列出用户所有的sudo权限       sudo –l
```

###  4.系统时间

``` 
操作                 命令
查看系统时间          date           ---查看当前时间详情                                   
                    cal            ---查看当前月日历
                    cal 2018       ---查看2018年完整日历
                    cal 12 2018    ---查看指定年月的日历       

更新系统时间（推荐）   yum install ntpdate –y    ---安装ntp服务
                    ntpdate cn.ntp.org.cn   ---到域名为cn.ntp.org.cn的时间服务器上同步时间

```

 5.关于hosts配置

相当于给IP地址其别名，可以通过别名访问

|               | 路径：                                             |
| ------------- | -------------------------------------------------- |
| Windows系统   | **C:/Windows/System32/drivers/etc/hosts** **文件** |
| Linux系统     | **/etc/hosts**文件：**vim**  +路径                 |
| 统一 编辑格式 | **IP**地址  别名：192.168.198.128    node00        |

###  6.关于hostname配置

相当于给对应的虚拟机器起别名

| Linux系统： | **vi /etc/sysconfig/network** |
| ----------- | ----------------------------- |
| 编辑内容：  | **HOSTNAME=node01**           |

## 五、重定向与管道符

| 输出  重定向        | 输出重定向到一个文件或设备：  <br />>   覆盖原来的文件         >>   追加原来的文件                                                                                                              举例：<br /> ls > log                           --- 在log文件中列出所有项，并覆盖原文件                                                         echo   “hello”>>log     ---将hello追加到log文件中 |
| ------------------- | ------------------------------------------------------------ |
| 输入  重定向        | **<**         输入重定向到一个程序 <br /> 举例：cat **<** log             ---将log文件作为cat命令的输入，查看log文件的内容 |
| 标准   输出  重定向 | **1 >** 或   **>**                                                                                                                                                           含义：                                                                                                                                                                                 输出重定向时，只用正确的输出才会重定向到指的文件中                                                                                      错误的则会直接打印到屏幕上 |
| 错误   输出  重定向 | **2 >**                                                                                                                                                                                     含义：                                                                                                                                                                                    错误的输出会重定向到指定文件里，正确的日志则直接打印到屏幕上。 |
| 结合  使用          | **2>&1**                                                                                                                                                                                 含义：                                                                                                                                                                                   将无论是正确的输出还是错误的输出都重定向到指定文件 |
| 管道                | **\|**                                                                                                                                                                                        含义：                                                                                                                                                                                             把前一个输出当做后一个输入                                                                                                                                       grep 通过正则搜索文本，并将匹配的行打印出来                                                                                                   netstat -anp \| grep 22   把netstat –anp 命令的输出 当做是grep 命令的输入 |
| 命令  执行  控制    | **&&**   前一个命令执行成功才会执行后一个命令                                                                                                                   **\|\|**      前一个命令执行失败才会执行后一个命令 |