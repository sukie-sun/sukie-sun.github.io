---
title: 常用Linux命令的学习（一）
tags: Linux命令
categories: Linux
description: 关于Linux操作的常用命令
abbrlink: 1834df09
date: 2018-12-27 20:16:47
---

## 一、命令指南（manual）：man 

<!--more-->

安装 man：

```shell
yum install man –y
```

> （-y 表示获得允许，无需确认）
>

查看ls命令指南：

```shell
 man ls
```



## 二、目录操作命令

**切换**目录：

```shell
cd + 目录的路径
```

**查看**当前目录所在的完整路径：

```shell
pwd
```

**新建**目录：

```shell
mkdir +目录名字
```

**查看** —当前目录所用有的子目录和文件：

```shell
ls   ，ll等价于  ls –l
```

​        查看—目录下的所有东西（包括隐藏文件）：

```shell
  ls –al   等价于 ll -a
```

**拷贝**目录或文件：

```shell
cp –r install.log  install2.log
```

> 复制文件，-r 表示递归复制，此时，可用于复制整个目录



**删除**目录或文件：

```shell
rm  -r install.log
```

> 此时需要手动输入y ，代表确认删除。可加 –f参数，直接删除，无需确认。
>
> 当需要一个目录下所有东西时，加-r参数，代表遍历删除。
>
> (rmdir只能删除空目录)



**移动**目录或文件：

```shell
mv + 目录/文件名字 + 其他路径
```

​         将test目录移动到  根目录/ 下 : 

```shell
  mv test / 
```

> （如果移动到当前目录，用另外一个名称，则可以实现重命名的效果）

   

**更改**文件或目录的名字：

```shell
mv + 旧目录名字 + 新目录名
```



> (     -r 用于递归的拷贝，删除，移动目录)



## 三、文件操作命令

### 1、一般文件操作

`在Linux中：一切皆文件`

**新建**文件：touch  install.log
​        (vim install.log   编辑文件，如果文件不存在，就会新建一个对应的文件，并进入文件的编辑模式，如果按 :wq 会保存文件并退出，如果按 :q 则不保存退出)
​        
**查看**文件内容：cat +（文件名）
（一次性显示整个文件的内容，文件内容过多时文本在屏幕上迅速闪过（滚屏），用,户体验不好）

一次命令显示一屏文本：

满屏后停下来，并且在屏幕的底部出现一个提示信息，给出至今己显示的该文件的百分比。

```
             more +（文件名）
             
             按键         效果  
           Space         显示下一屏文本内容
           B             显示上一屏文本内容
           Enter         显示下一行文本内容
           Q             退出查看   
```

                less+（文件名）
              按键                  效果
               Q                 退出less 命令 
               h                 显示帮助界面
               u                 向后滚动半页 
               d                 向前翻半页 
               e | Enter（回车）  向后翻一行文本
               space(空格键)      滚动一页 
               b                 向后翻一页 
               [pagedown]：      向下翻动一页 
               [pageup]：        向上翻动一页
                上下键，          向上一行，向下一行

从**头部**打印文件内容：

```shell
		head  -10 +（文件名）  打印文件1到10行
```

从**尾部**打印文件内容​  

```shell
      tail -10 +（文件名）打印文件最后10行
```



> tail还可用来查看文件内容的更新变化
>
> tail -f (文件名)  



**查找**文件或目录​	

```shell
	find +（路径名） –name +（文件名）
```

​		举例：

```shell
find / -name profile   
```


​	在/(根目录)目录下查找 名字为profile的文件或目录

 也可利用正则：
​             举例：

```shell
 find /etc -name pro*
```


​         在/etc目录下查找以pro开头的文件或目录

> 注意：
>
> * 路径越精确，查找的范围越小，速度越快 
>
> * 查找的目录必须是文件所在目录的父级目录



### 2、文件编辑

#### vi

（1） vi    进入编辑模式 ----->按i   进入插入模式 ------->  按Esc 退出编辑模式

```
vi  filename   :打开或新建文件，并将光标置于第一行首 
vi +n filename ：打开文件，并将光标置于第n行首 
vi + filename  ：打开文件，并将光标置于最后一行首 
vi +/pattern filename：打开文件，并将光标置于第一个与 pattern匹配的字符串所在的行首 
```

>  filename  为文件名

（2）在文件vi（文件编辑）模式下

- **命令行模式** 

```
:w      保存
:q      退出
:wq     保存并退出
:q!     强制退出，不保存
:set nu |ctrl+g    显示文本行数
:set nonu          去除显示的行数
:s/p1/p2/g         将当前行中所有p1均用p2替代 
:n1,n2s/p1/p2/g    将第n1至n2行中所有p1均用p2替代 
:g/p1/s//p2/g      将文件中所有p1均用p2替换
```

- **一般模式** 

```
按键：
yy    复制光标所在行(常用) 
nyy   复制光标所在行的向下n行，例如， 20yy则是复制20行(常用) 
p|P   p为复制的数据粘贴在光标下一行， P则为粘贴在光标上一行(常用)
G     光标移至第最后一行
nG    光标移动至第N行行首
n+    光标下移n行 
n-    光标上移n行 
H     光标移至屏幕顶行 
M     光标移至屏幕中间行 
L     光标移至屏幕最后行 

dd    删除所在行 
x或X  删除一个字符，x删除光标后的，而X删除光标前的 
u     撤销(常用)

：N,Md    删除第N行到第M行
：,$-1d   删除当前光标到倒数第一行数据

按键：
    i: 在当前光标所在字符的前面，转为输入模式；
    a: 在当前光标所在字符的后面，转为输入模式；
    o: 在当前光标所在行的下方，新建一行，并转为输入模式；
    I：在当前光标所在行的行首，转换为输入模式
    A：在当前光标所在行的行尾，转换为输入模式
    O：在当前光标所在行的上方，新建一行，并转为输入模式；

---逐字符移动：
h: 左    l: 右

j: 下	k: 上

```

> （不同：在我的xshell中是 yyn实现复制所在行的向下n行）
>
> （nB|nb:光标向上移动n行）



#### vim

Vim是从 vi 发展出来的一个文本编辑器

安装vim 软件：

```shell
yum install vim -y
```



* *用vim 打开/etc/profile 文件，*
* *特点：编辑器对文本的内容进行了高亮，使整个文件的内容可读性大大加强* ，其他均与vi相同

### 3、文件上传下载

安装上传下载命令：

```shell
yum install lrzsz -y
```

#### 上传文件：（windows--->linux）

> 命令 ：rz  
>
> 弹出windows上传文件窗口

#### 下载文件：(linux--->windows)

`注意`：sz命令只能下载文件，不能下载目录，推荐将目录压缩成tar包或使用工具软件：Winscp【Xftp】

> 命令：sz  （文件名）
>
> 弹出windows下载窗口,下载文件到指定文件目录,下载完之后，按ctrl+c结束。

### 4、文件传输

#### (1）本地→远程   

> 文件  ：  scp local_file remote_username@remote_ip:remote_folder   
>
> 目录 ：  scp -r local_folder remote_username@remote_ip:remote_folder

举例：

```shell
方式一：
  scp -rf /etc/profile root@192.168.198.128:/etc/

方式二:
  scp  -r /etc/profile root@node01 /etc/ 
  
方式三：
  scp -r /etc/profile node01:/etc/
  
方式四：
  scp -r /ec/profile node01:'pwd'
```



> **scp** ：远程传输文件命令
>
> **-r**  ：- 指的是后面跟的是参数    r  指的是遍历指定文件    **f**  指的是不用询问
>
> **/etc/profile**  : 是指定传输的文件
>
> **root**： 远程机器的账户名      **@**    远程机器的IP地址   **：**   **/etc/**    远程机器上指定的目录
>
> **node01**：远程机器的别名
>
> **‘pwd’**： 本地要远程传输文件所在的目录

> 第一次远程拷贝时，需要在箭头1初输入yes确认一下，验证一下远程主机。然后在箭头2处输入一下远程主机的密码。

#### (2）远程→本地  

> 文件 ： scp remote_username@remote_ip:remote_file local_folder
>
> 目录 ： scp remote_username@remote_ip:remote_folder local_folder   

## 四、文件系统

```
 Linux目录结构：
 
  bin  存放二进制可执行文件(ls,cat,mkdir等)                                                          
  boot  存放用于系统引导时使用的各种文件

  dev 用于存放设备文件

  etc  存放系统配置文件

  home 存放所有用户文件的根目录

  lib  存放跟文件系统中的程序运行所需要的共享库及内核模块

  mnt  系统管理员安装临时文件系统的安装点

  opt  额外安装的可选应用程序包所放置的位置

  proc  虚拟文件系统，存放当前内存的映射

  root  超级用户目录

  sbin  存放二进制可执行文件，只有root才能访问

  tmp  用于存放各种临时文件

  usr  用于存放系统应用程序，比较重要的目录/usr/local 本地管理员软件安装目录
  
  var  用于存放运行时需要改变数据的文件

```

