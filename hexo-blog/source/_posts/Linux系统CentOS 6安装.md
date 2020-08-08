---
title: Linux学习之CentOS 6系统安装
tags:
  - CentOS 6
categories: Linux
grammar_cjkRuby: true
description: Linux常见系统之一-----CentOS
abbrlink: a6be4c85
date: 2018-12-25 00:00:00
---



# 一、安装

 资源准备：

CentOS-6.6-x86_64-minimal.iso（简易迷你版） ：

CentOS-6.7-x86_64-bin-DVD1.iso（完整版）：

[^关于版本]: 可以先用迷你版安装，等虚拟机基本配置完成后，再更换成完整版



## 1、点击新建虚拟机

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rdoec2rj30fe050t9e.jpg) 

## 2、选择典型。（专业人士使用的话建议选择高级）

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rf3k4e2j30g20ar40h.jpg) 

## 3. 选择稍后安装操作系统

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rfsol81j30fe0e4403.jpg) 

## 4. 选择操作系统类型，选择linux,centos 64位

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rgu0v2lj30fe0ehdh3.jpg) 

## 5. 选择虚拟机安装位置和名称。

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rhkj8yfj30fe0ef75d.jpg) 

## 6. 指定磁盘容量，默认20GB。

[^关于磁盘容量]: 根据用户电脑的实际情况选择

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15ri7ptbaj30fe0evjtf.jpg) 

## 7. 选择自定义硬件

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rk4qtotj30fe0e8gna.jpg) 

## 8. 点击CD/DVD,然后选择操作系统的ISO映像文件，选择完后，点击关闭。

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rmsa9sjj30i40g5myh.jpg)  

## 9.点击完成。

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rojtrexj30g30f6aab.jpg) 

# 二、**配置虚拟机**

## 1. 启动虚拟机。

指定虚拟机：点击 “开启此虚拟机”

注意：如果启动虚拟机时，发生以下问题，说明是你的电脑默认未开启虚拟化技术。

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rqc0xk7j30je0ekapy.jpg) 

此时你应该把机器重启并进入bios界面（不同的机器进入bios界面的快捷键不同，一般为F1~F10键中的某个键，如果都不行，就得自己百度一下你的机器型号进入bios界面的快捷方式）。

​	当进入bios界面后，把虚拟机化选项（virtualization technology）打开,通过回车键，把disabled改成enabled,然后保存并重启机器。我这边是按F10，不同机器可能不一样，看右下角的提示信息。

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rqzwza8j30fe0ayak5.jpg) 

## 2.Test Media, 如果不需要的话，点Skip

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rrr9unej30fe06u0tt.jpg) 

## 3、单击Next按钮继续

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rsck2rkj30ce08cmy0.jpg) 

## 4. 选择安装期间显示的语言

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rt1k6j2j30fe0afmyp.jpg) 

## 5、选择键盘语言

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rtsr0fdj30fe09igm6.jpg) 

## 6、选择存储介质的类别。

如果是将CentOS 6安装到本地硬盘上，选择 Basic Storage Devices，如果安装到网络存储介质如SANs上，选择 Specialized Storage Devices

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15run6jt7j30fe0an3zh.jpg) 

## 7.选择 yes,discard any data

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rvca0zlj30fe0admyi.jpg) 

## 8. 设定主机名称（hostname）

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rw3bi44j30fe0agq36.jpg) 

## 9. 设定时区，

选择 Asia/Shanghai

## 10. 设定root帐户的密码

尽量使用较复杂的密码安装（根据实际情况，密码简单时，会有提示，点击user anyway 就行）

## 11. 选择安装类型，这里我选择 “Use All Space”

 ![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rxcagghj30f509gabh.jpg)

## 12. 选择 “Write changes to disk”，将分区数据写入硬盘

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15ry9hsb2j30gt09x3z9.jpg) 

## 13. 开始安装，此时只需等待即可

![img](https://wx1.sinaimg.cn/large/005zftzDgy1g15rywwpq3j30fe0ae3zx.jpg) 

## 14. 安装完结后，点击Reboot按钮

[^reboot]: 重启

# 三、网络配置

## 1、查看网关

![](https://wx1.sinaimg.cn/large/005zftzDgy1g15wt10f42j307903smxt.jpg)



![](https://wx1.sinaimg.cn/large/005zftzDgy1g15wu8o6t5j30fe09475w.jpg)

## 2、配置静态IP(NAT模式)

1、编辑配置文件,添加修改以下内容

```shell
vim  /etc/sysconfig/network-scripts/ifcfg-eth0
```

2、按i 进入文本编辑模式，出现游标，左下角会出现INSERT,即可以编辑

```sh
DEVICE=eth0       #网卡设备名,请勿修改名字
TYPE=Ethernet   	#网络类型，以太网
BOOTPROTO=static   #启用静态IP地址
ONBOOT=yes        #开启自动启用网络连接	
IPADDR=192.168.198.128  #设置IP地址
NETMASK=255.255.255.0  #设置子网掩码
GATEWAY=192.168.198.2   #设置网关
DNS1=114.114.114.114  #设置备DNS

```

按ESC退出编辑模式

```shell
:wq  #保存退出
```

3、重启网络连接

```shell
service network restart
ifconfig  #查看IP地址
```

4、单独配置DNS解析器

```shell
vi /etc/resolv.conf
```

编辑内容：i

```shell
nameserver 网关
```

:wq  #保存并退出

5、验证

```shell
ping 虚拟网关 | 物理机（笔记本）IP | 外网
ping www.baidu.com
```

6、注意

a.保证VMware的虚拟网卡没有被禁用

![](https://wx1.sinaimg.cn/large/005zftzDgy1g15zvoprnfj30fe03fwet.jpg)

b.网关IP不能被占用

## 3、桥接和NAT模式的区别

### 桥接：

​      结构：网络与物理机同一个网段（会占用外部IP）

​      特点：

​           1.外网能够访问

​           2.能够访问外网   

注意：桥接模式下的虚拟机网关必须改为与物理机网关一致

### NAT模式：

​      结构：构成一个以物理机为网关的子网

​      特点：

​           1.子网的所有的服务器对外不可见     

​           2.子网能够正常访问外网

​      安全！！！ 

​      节省IP资源

# 四、拍快照

（保存当时计算机所出状态的各种配置和资源，适度使用）

> 选中指定虚拟计算机------鼠标右击-----选中“快照” ------“拍摄快照‘----在页面中找到”拍摄快照“，并添加名称和描述
>
> 也可以删除，找到页面中的删除按钮