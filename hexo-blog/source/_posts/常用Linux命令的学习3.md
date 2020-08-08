---
title: 常用Linux命令的学习（三）
tags: Linux命令
categories: Linux
grammar_cjkRuby: true
description: 关于Linux系统的重要操作命令
abbrlink: 653c9083
date: 2018-12-29 00:00:00
---



## 一、服务操作

| 列出  所有  服务          | chkconfig   <br />查询操作系统在每一个执行等级中会执行哪些系统服务，其中包括各类常驻服务。 |
| ------------------------- | ------------------------------------------------------------ |
| 服务  操作                | 仅适用于当前    ：service 服务名 start\|stop\|status\|restart   <br />防火墙的服务名为：iptables   <br />service iptables  status\|start\|stop\|restart   查看状态\|开启\|关闭\|重启                                                                                                                                   永久关闭\|打开  ：（重启后生效） chkconfig iptables on\|off<br />注意：学习期间直接把防火墙关掉就是，工作期间也是运维人员来负责防火墙的。 |
| 添加  服务                | 1)    编辑脚本：vim myservice.sh                                                                                                                  编辑内容：                                                                                                                                                              （在最前面加一下两句）                                                                                                                              #chkconfig:   2345 80 90                                                                                                      #description:auto_run                                                                                                                                           (自己的服务脚本：开机时同步时间）                                                                                                           result=’ntpdate cn.ntp.org.cn’                                                                                                                                 退出编辑并保存：按esc键 按 ：wq                                                                                                                                                在ntpdate.log文件中输出打印：echo $result > /usr/ntpdate.log                                                                                   2)    修改权限，使其拥有可执行权限:   chmod 700 myservice.sh                                                                3)    将脚本拷贝到/etc/init.d目录：                                                                                                                        4)    加入服务：chkconfig --add myservice.sh                                                                                                      5)    重启服务器，验证服务是否添加成功：date                                                                                          6）/usr目录下产生ntpdate.log |
| 删除  服务                | chkconfig --del name                                         |
| 更改  服务初   执行  等级 | chkconfig --level 2345 服务名 off\|on   <br /><br />若不加级别，默认是2345级别                                                                                                   chkconfig 服务名 on\|of f |



> 各数字代表的系统初始化级别含义：
>
> ​	0：停机状态
>
> 　　1：单用户模式，root账户进行操作
>
> 　　2：多用户，不能使用net file system，一般很少用
>
> 　　3：完全多用户，一部分启动，一部分不启动，命令行界面
>
> 　　4：未使用、未定义的保留模式
>
> 　　5：图形化，3级别中启动的进程都启动，并且会启动一部分图形界面进程。
>
> 　　6：停止所有进程，卸载文件系统，重新启动(reboot)
>
> 　　这些级别中1、2、4很少用，相对而言0、3、5、6用的会较多。3级别和5级别除了桌面相关的进程外没有什么区别。为了减少资源占用，推荐都用3级别.
>
> 注意 ：linux默认级别为3，不要把/etc/inittab 中initdefault 设置为0 和 6 

## 二、定时调度

| 编辑定时任务                                   | crontab –e                                                                                                                                                           格式：minute hour day month dayofweek command |
| ---------------------------------------------- | ------------------------------------------------------------ |
| 举例                                           | * * * * *  echo  “hello”                                                                                                                                       每分钟打印“hello” |
| 时间  一到，                执行  操作  命令后 | 会出现：You have new mail in /var/spool/mail/root            |
| 查看任务执行情况                               | vim /var/spool/mail/root                                     |
| 查看所有用户的定时任务                         | ll /var/spool/cron                                           |
| 查看当前用户的定时任务                         | contab –l                                                    |
| *注意*                                         | “*”代表任意的数字, “/”代表”每隔多久”,                                                                                                           “-”代表从某个数字到某个数字, “,”分开几个离散的数字                                                                                                                    如：                                                                                                                                                                           30-40 12 * * * echo “hello”                                                                                                                                         --------每天12点30分至40分期间，每分钟执行一次命令                                                                                      30,40                                                                                                                                                                                     --------每天12点30分和12点40分                                                                                                                            0/5                                                                                                                                                                                 --------每天的12点整至12点55分期间，每隔5分钟执行一次命令 |

## 三、进程操作

| 查看  进程          | ps  -aux                                                                                                                                                                           -a 列出所有           -u 列出用户   -x 详细列出，如cpu、内存等                                                                                       -e 显示所有进程    -f 全格式                                                                                                                                     ps  - ef  \| grep ssh   查看所有进程里CMD是ssh 的进程信息  ，进程号（PID）                                                                                  ps -aux --sort –pcpu   根据 CPU 使用来升序排序 |
| ------------------- | ------------------------------------------------------------ |
| 使程序   后台  运行 | 只需要在命令后添加  & 符号                                                                                                                            echo “hello” &   jobs –l      --列出当前连接的所有后台进程（jobs仅适用于当前端）                                                   ps  -ef \| grep 进程名          ----（推荐）列出后台进程 |
| 杀死    进程        | （强制）kill -9 pid   <br />ps 命令先查出对应程序的PID或PPID ，然后杀死掉进程 |

## 四、其他命令

| wget | 1）   安装：yum install wget  –y                                                                                                        2）   用法：wget [option] 网址  -O  指定下载保存的路径                                                                                          3）   More Actions一个从网络上自动下载文件的自由工具；<br />支持通过 HTTP、HTTPS、FTP 三个最常见的 TCP/IP协议，可以使用 HTTP 代理；<br />也可用于做爬虫<br />4）举例：wget  www.baidu.com  -O baidu.html |
| ---- | ------------------------------------------------------------ |
| yum  | 1）   备份原镜像：                                                                                                                                                   cp /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOSBase.repo.backup                                                                                 2）   下载新镜像：                                                                                                                                         **wget** -O /etc/yum.repos.d/CentOS-Base.repo      <http://mirrors.aliyun.com/repo/Centos-6.repo>                                                                                                                                                                             3）  查看文件内容：vim /etc/yum.repos.d/CentOS-Base.repo                                                                      4）  生成缓存：yum makecache<br />5）查看当前源:yum list \|head -50 |
| rpm  | yum list \| head -501）   安装 rpm –ivh rpm包                                                                                                                                       2）   查找已安装的rpm包：rpm –q ntp                                                                                                                  3）   卸载：rpm –e ntp-4.2.6p5-10.el6.centos.2.x86_64（全名） |
| tar  | 1）   解压：tar  -zvxf  xxxx.tar.gz                                                                                                                             2）   压缩：tar -zcf 压缩包命名 压缩目标                                                                                             3）   例子：tar -zcf tomcat.tar.gz apache-tomcat-7.0.61                                                                                4）   -z   gzip进行解压或压缩，带.gz需要加，压缩出来.gz也需要加                                                                                  *       -x  解压  -c  压缩   -f   目标文件，压缩文件新命名或解压文件名                                                                                       *       -v  解压缩过程信息打印 |
| zip  | 1）  安装zip：yum install zip –y                                                                                                                          2）  压缩命令：zip   -r 包名 目标目录                                                                                                              3）  安装 ：unzip,yum   install unzip –y                                                                                                              4）  解压  ：unzip   filename |

## 五、安装部署

### JDK 部署

```shell
 1)     解压: tar -zxf jdk-7u80-linux-x64.tar.gz                                        2)     配置环境变量                                                                            编辑配置文件：vim /etc/profile                                                          编辑内容 ：                                                                            JAVA_HOME= /usr/soft/jdk1.7.0_75                                                      PATH=$PATH:$JAVA_HOME/bin                                                     3)     重新加载环境变量：source  /etc/profile                                           4)     验证: java  -version
```

### mysql部署

```shell
yum安装 mysql                                                                         1)   yum install mysql-server -y                                                     2)   yum install mysql-devel -y                                                       3)   service mysqld start                                                             4)   mysql -uroot -p                                                                 5)   mysqladmin -u root  password 123456
```

### Tomcat部署

```shell
1)下载tomcat:
http://tomcat.apache.org/
2)启动tomcat
在tomcat的bin目录下有个startup.sh 脚本可以直接启动tomcat服务
3)关闭tomcat服务，可以用shutdown.sh命令
或者ps -ef | grep tomcat 查看出tomcat进程号后，用kill命令。
4)jps查看系统当前运行在jvm上的进程情况
jps是JDK1.5提供的一个显示当前所有java进程pid的命令，简单实用，非常适合在linux/unix平台上简单察看当前java进程的一些简单情况。
Bootstrap是tomcat的进程名字，后面跟的是它的PID
5）验证
先把防火墙关了（service iptables stop），然后浏览器端访问虚拟机IP的8080端口

```

### 克隆虚拟机

```shell
修改配置：
1)网卡ip     /etc/sysconfig/network-sr…/ifcfg-eth0 
2)hostname   /etc/sysconfig/network
3)删除网络规则 rm -rf /etc/udev/rules.d/70--….-net.rules
4)重启生效 reboot

```



## 六、免密登录

### 1、工作原理：

> 1.Server A向Server B发送一个连接请求。 
>  2.Server B得到Server A的信息后，在本地的authorized_keys文件中查找A存放在B上的公钥，如果有相应的公钥，则随机生成一个字符串，并用Server A的公钥加密，接着发送给Server A。 
>  3.Server A得到Server B发来的消息后，使用私钥进行解密，然后将解密后的字符串发送给Server B。Server B用原来随机生成的字符串和A发过来的字符串进行对比，如果一致，则允许免登录。 
>  总结：A要免密码登录到B，B首先要拥有A的公钥，然后B要做一次加密验证。对于非对称加密，公钥加密的密文不能公钥解开，只能私钥解开。
>
>  

### 2、方法一：                                              

 1）   生成公钥和密钥：

命令：

```shell
ssh-keygen -t rsa 
```

并且回车3次                                                                                                  

（在用户的root目录生成一个 “.ssh”的文件夹）                                                                                                                 2）   查看公钥和私钥：

```shell
ll ~/.ssh        
```

（目录中会有以下几个文件）                                                                                                                         `authorized_keys`:存放远程免密登录的公钥,主要通过这个文件记录多台机器的公钥                                                 `id_rsa` : 生成的私钥文件                                                                                                                              `id_rsa.pub` ： 生成的公钥文件                                                                                                                                        `know_hosts` : 已知的主机公钥清单                                                                                                                                                       *                        如果希望ssh公钥生效需满足至少下面两个条件：                                                                                                  *                        1> .ssh目录的权限必须是700                                                                                                                                *                        2> .ssh/authorized_keys文件权限必须是600     

3）   将A的.ssh目录下的公钥追加拷贝到B的authorized_keys文件里     

* 法一：

```shell
 scp -p ~/.ssh/id_rsa.pub root@<remote_ip>:/root/.ssh/authorized_keys        
```

举例：

```shell
[root@test .ssh]# scp -p ~/.ssh/id_rsa.pub root@192.168.91.135:/root/.ssh/authorized_keys
root@192.168.91.135's password: 
id_rsa.pub 100% 408 0.4KB/s 00:00 
[root@test .ssh]# 
[root@test .ssh]# 
[root@test .ssh]# 
[root@test .ssh]# ssh root@192.168.91.135
Last login: Mon Oct 10 01:27:02 2016 from 192.168.91.133
[root@localhost ~]#
```

* 法二：　分为两步操作：

```shell
$ scp ~/.ssh/id_rsa.pub root@<remote_ip>:pub_key //将文件拷贝至远程服务器
$ cat ~/pub_key >>~/.ssh/authorized_keys //将内容追加到authorized_keys文件中， 不过要登录远程服务器来执行这条命令
```

* 法三：手动复制：如果有多台节点时：A  →  B

   < 1、拷贝A的.ssh目录下的公钥：

```shell
vim id_rsa.pub
```

   <2、将A的公钥复制好后，在主机B上的~/.ssh目录下，创建并编辑authorized_keys文件，接着黏贴进去。

```shell
vim authorized_keys 
```



4)     验证：

用Scp远程拷贝命令，在A主机上随便拷贝一份文件到B主机上，如果不需要密码，则说明免密码登录配置成功。

### 3、方法二： **通过ssh-copy-id的方式**

前提：公钥和私钥已经生成

命令：

```shell
ssh-copy-id -i ~/.ssh/id_rsa.pub <romte_ip>
```

举例：

> ```shell
> [root@test .ssh]# ssh-copy-id -i ~/.ssh/id_rsa.pub 192.168.91.135 
> root@192.168.91.135's password: 
> Now try logging into the machine, with "ssh '192.168.91.135'", and check in:
> 
> .ssh/authorized_keys
> 
> to make sure we haven't added extra keys that you weren't expecting.
> 
> [root@test .ssh]# ssh root@192.168.91.135
> Last login: Mon Oct 10 01:25:49 2016 from 192.168.91.133
> [root@localhost ~]#
> ```



常见错误：

> 　[root@test ~]# ssh-copy-id -i ~/.ssh/id_rsa.pub 192.168.91.135
>
> 　-bash: ssh-copy-id: command not found //提示命令不存在
>
> 　解决办法：yum -y install openssh-clients

### 4、（**此方法有待考究）**法三：

通过Ansible实现   批量   免密                                                                                                                   

   1）、 **将需要做免密操作的机器hosts添加到/etc/ansible/hosts下：**                                                                                             

```
  [Avoid close]
   192.168.91.132
　　192.168.91.133
　　192.168.91.134   
```

​      2）、 **执行命令进行免密操作**  ：​                 

```
ansible <groupname> -m authorized_key -a "user=root key='{{ lookup('file','/root/.ssh/id_rsa.pub') }}'" -k 
```

​                                                                                                                                                                                                                                                                                                                                             示例：

```shell
[root@test sshpass-1.05]# ansible test -m authorized_key -a "user=root key='{{ lookup('file','/root/.ssh/id_rsa.pub') }}'" -k
　　SSH password: ----->输入密码
　　192.168.91.135 | success >> {
　　"changed": true, 
　　"key": "ssh-rsa 　　 AAAAB3NzaC1yc2EAAAABIwAAAQEArZI4kxlYuw7j1nt5ueIpTPWfGBJoZ8Mb02OJHR8yGW7A3izwT3/uhkK7RkaGavBbAlprp5bxp3i0TyNxa/apBQG5NiqhYO8YCuiGYGsQAGwZCBlNLF3gq1/18B6FV5moE/8yTbFA4dBQahdtVP PejLlSAbb5ZoGK8AtLlcRq49IENoXB99tnFVn3gMM0aX24ido1ZF9RfRWzfYF7bVsLsrIiMPmVNe5KaGL9kZ0svzoZ708yjWQQCEYWp0m+sODbtGPC34HMGAHjFlsC/SJffLuT/ug/hhCJUYeExHIkJF8OyvfC6DeF7ArI6zdKER7D8M0SM　　WQmpKUltj2nltuv3w== root@localhost.localdomain", 
　　"key_options": null, 
　　"keyfile": "/root/.ssh/authorized_keys", 
　　"manage_dir": true, 
　　"path": null, 
　　"state": "present", 
　　"unique": false, 
　　"user": "root"
　　}
　　[root@test sshpass-1.05]#
```