---
title: Hadoop2.X
update: 2019-3-19
tags: hadoop
categories: HDFS
grammar_cjkRuby: true
description: hadoop升级版基础学习。
abbrlink: 205c61f9
date: 2019-01-03 19:05:47
---

## 一、Hadoop 2.x产生背景

### 1、Hadoop 1.0存在的问题

![](https://wx1.sinaimg.cn/large/005zftzDgy1g18dlu5j8uj30fe08mq6t.jpg)

#### （1）HDFS存在的问题

 - NameNode单点故障，难以应用于在线场景
 - NameNode（一个）压力过大，内存受限，影响系统扩展性

#### （2）MapReduce存在的问题

 - JobTracker访问压力大，影响系统扩展性
 - 难以支持MapReduce以外的计算框架，比如Spark、Storm

### 2、Hadoop 2.0分支

包括：

![](https://wx1.sinaimg.cn/large/005zftzDgy1g18dmrv448j30ft05i76r.jpg)

1、HDFS：分布式文件存储系统

2、MapReduce：计算框架

3、YARN：资源管理系统

### 3、特点

 1）. 解决单点故障：HDFS HA（高可用）

>   通过主备NameNode解决，如果主NameNode发生故障，就切换到备NameNode上   |

 2).解决内存受限问题：HDFS Federation（联邦制）、HA

>  HA：两个NameNode
>  (3.0就实现了一组多从：水平扩展，支持多个NameNode；每个NameNode分管一部分目录；所有NameNode共享所有DataNode资源)

 3).仅架构上发生变化使用方式不变

## 二、HDFS HA(联邦)结构及功能

![](https://wx1.sinaimg.cn/large/005zftzDgy1g18dn0946qj30hp09rdjp.jpg)

### HA

DN：DataNode（数据节点）

> 存放数据block块；遵循心跳机制向NN Active和NN Standby汇报block块信息，但只执行active的命令         

主备NN：NameNode Active 和 NameNode Standby （主备名称节点）

> 主NN对外提供读写服务，备NN同步主NN元数据，以待切换，所有的DN同时向两个NN汇报数据块信息
>
> 元数据信息加载到主NN，并写入JN（至少写两台：过半原则）；
>
> 备NN可以从JN中同步元数据信息；
>
> 解决单点故障；
>
> ———两种切换方式：
>
> 手动：通过命令实现主备切换
>
> ```shell
> hdfs haadmin -transitionToActive nn2
> ```
>
> ​           这时nn1如果还存活则变成不可写状态，需要重启，重启后自动成为standby nn
>
> 自动：基于Zookeeper实现（详情见搭建步骤）

JN：JournalNode（至少3台）

> 存储主NN元数据信息，实现主备NN间数据共享；
>
> （遵循过半原则：至少有过半的数量参与投票）

ZKFC：FailoverController（竞争锁）

> 谁拿到了这个所，谁就是active NN
>
> 心跳机制监控主备NN状态，一旦出现一台挂机，就会释放锁，另一个NN就会立即启动竞争锁，成为active NN

ZK：Zookeeper（至少3台）

> （实现主备NN切换）

### 联邦

> 通过多个namenode/namespace把元数据的存储和管理分散到多个节点中，使到namenode/namespace可以通过增加机器来进行水平扩展

> 通过多个namespace来隔离不同类型的应用，把不同类型应用的HDFS元数据的存储和管理分派到不同的namenode中。

## 三、==！！YARN(资源管理)！！==

`详见Yarn学习.md`

1、核心思想：ResourceManager（资源管理）+ApplicationMaster（任务调度）

2、yarn的引入使得多个计算框架可以应用到一个集群中

ResourceManager：  负责整个集群的资源管理和`调度。

ApplicationMaster：  负责应用程序相关的事务，比如任务调度、任务监控和容错等。

​                                      每个应用程序对应一个ApplicationMaster（应用程序控制-主人）

  目前多个计算框架可以运行在YARN上，比如MapReduce、Spark、Storm等。

## 四、==！！Zookeeper工作原理！！==

`详见Zookeeper学习.md`

## 五、Hadoop2.X 集群搭建

### 1、linux环境下搭建

|       |  NN  |  DN  |  JN  | ZKFC |  ZK  |  RM  |  NM  |
| ----- | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| node1 |  √   |  √   |  √   |  √   |  √   |      |  √   |
| node2 |  √   |  √   |  √   |  √   |  √   |  √   |  √   |
| node3 |      |  √   |  √   |      |  √   |  √   |  √   |

Zookeeper Failover Controller：

>  `Failover` ：失效备援（为系统备援能力的一种，当系统中其中一项设备失效而无法运作时，另一项设备即可自动接手原失效系统所执行的工作）

监控NameNode健康状态，并向Zookeeper注册NameNode，NameNode挂掉后，ZKFC为NameNode竞争锁，获得ZKFC锁的NameNode变为active。

#### 0>在搭建环境之前的准备

三台虚拟机：

```
关闭防火墙
安装jdk
编辑/etc/hosts/给各个节点服务器起别名
时间服务器：ntpdate
     安装：yum install ntpdate -y
     生成：ntpdate cn.ntp.org.cn
免密登录环境准备

```



在hadoop安装目录下hadoop-2.6.5/etc/hadoop/

#### 1>编辑hadoop-env.sh

```xml
export JAVA_HOME=/usr/soft/jdk1.8.0_191
```

#### 2>编辑core-site.xml

`注意：`

> fs.defaultFS 默认的服务端口是 NameNode URI
>
> hadoop.tmp.dir是hadoop文件系统依赖的基础配置，很多路径都依赖它。如果在hdfs-site.xml中没有配置namenode 和datanode的存放位置，默认及存放在这个路径中。

```xml
<configuration>
<property>
  <name>fs.defaultFS</name>
  <value>hdfs://Sukie</value><!--配置集群的名字-->
</property>
<property>
   <name>ha.zookeeper.quorum</name>
   <value>node1:2181,node2:2181,node3:2181</value>
    <!--配置zookeeper：三个节点-->
</property>
<property>
  <name>hadoop.tmp.dir</name>
  <value>/opt/hadoop</value><!--配置hadoop基础配置存放的路径-->
</property>
</configuration>

```

#### 3>编辑hdfs-site.xml

```xml
<configuration>
<property>
  <name>dfs.nameservices</name>
  <value>Sukie</value>
</property>
<property>
  <name>dfs.ha.namenodes.Sukie</name>
  <value>nn1,nn2</value>
</property>
<property>
  <name>dfs.namenode.rpc-address.Sukie.nn1</name>
  <value>node1:8020</value>
</property>
<property>
  <name>dfs.namenode.rpc-address.Sukie.nn2</name>
  <value>node2:8020</value>
</property>
<property>
  <name>dfs.namenode.http-address.Sukie.nn1</name>
  <value>node1:50070</value>
</property>
<property>
  <name>dfs.namenode.http-address.Sukie.nn2</name>
  <value>node2:50070</value>
</property>
<property>
  <!-- 指定namenode元数据存储在journalnode中的路径 -->
  <name>dfs.namenode.shared.edits.dir</name>
  <value>qjournal://node1:8485;node2:8485;node3:8485/Sukie</value>
</property>
<property>
<!-- 指定HDFS客户端连接active namenode的java类 -->
<name>dfs.client.failover.proxy.provider.Sukie</name>
<value>org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider</value>
</property>
<property>
 <!-- 配置隔离机制为ssh 防止脑裂：保证activeNN仅有一台-->
  <name>dfs.ha.fencing.methods</name>
  <value>sshfence</value>
</property>
<property>
<!-- 指定秘钥的位置 -->
  <name>dfs.ha.fencing.ssh.private-key-files</name>
  <value>/root/.ssh/id_dsa</value>
    <!--免密登录是生成的文件，有的是id_rsa，配置错误会影响NN的主从切换-->
</property>
<property>
 <!-- 指定journalnode日志文件存储的路径 -->
  <name>dfs.journalnode.edits.dir</name>
  <value>/opt/hadoop/data</value>
</property>
<property>
<!-- 开启自动故障转移 -->
   <name>dfs.ha.automatic-failover.enabled</name>
   <value>true</value>
</property>
</configuration>
```

#### 4>配置hadoop中的slaves

（主从架构：datanode）

```txt
node1
node2
node3
```

####   5>准备zookeeper

- 三台zookeeper：node1，node2，node3

- 编辑zookeeper-3.4.13/conf/zoo.cfg

  ```properties
  tickTime=2000
  initLimit=10
  syncLimit=5
  dataDir=/root/usr/zookeeper-3.5.7/data
  dataLogDir=/root/usr/zookeeper-3.5.7/logs
  clientPort=2181
  #用于投票选举
  server.1=node1:2888:3888
  server.2=node2:2888:3888
  server.3=node3:2888:3888 
  
  ```

- 在dataDir目录中创建文件myid，三台节点的文件内容分别为1，2，3

#### 6>配置环境变量   

```shell
vim ~/.bash_profile
```

编辑内容：

```properties
JAVA_HOME=/usr/soft/jdk1.8.0_191
export PATH=$PATH:$JAVA_HOME/bin
HADOOP_HOME=/usr/soft/hadoop-2.6.5
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
ZOOKEEPER_HOME=/usr/soft/zookeeper-3.4.13
export PATH=$PATH:$ZOOKEEPER_HOME/bin
```

> ```shell
> source ~/.bash_profile
> ```
>
> 使其成为资源文件，发送到其他节点后，也需要此操作

#### 7>将以上配置文件远程发送至其他节点服务器

> ```shell
> scp -r filename nodename:`pwd`
> ```
>
>

#### 8>命令操作：

```
1. 启动三个zookeeper：./zkServer.sh start
2. 启动三个JournalNode：./hadoop-daemon.sh start journalnode
3. （生成fsimage文件）在其中一个namenode上格式化：
    hdfs namenode -format
4. 把刚刚格式化之后的元数据拷贝到另外一个namenode上
   a)	启动刚刚格式化的namenode : 
        hadoop-daemon.sh start namenode
   b)	（同步fsimage文件）在另一个（没有格式化的）namenode上执行：
        hdfs namenode -bootstrapStandby
   c)	启动没格式化的namenode：   
        hadoop-daemon.sh start namenode
5. （初始化竞争锁zookeeper）在其中一个namenode上初始化zkfc：
    hdfs zkfc -formatZK
6. 停止上面节点：
    stop-dfs.sh
7. 全面启动（三个节点）：
    start-dfs.sh
8. 启动yarn资源管理器
   yarn-daemon.sh start resourcemanager 
   (yarn resourcemanager  )

```

### 2、使用

（启动步骤）

```
(1)关闭防火墙：service iptables stop        （3台）
(2)启动zookeeper:zkServer.sh start          （3台）
(3)启动集群：start-dfs.sh |（start-all.sh   :  同时启动hdfs和yarn 的nodemanager)
(4)启动yarn：yarn-daemon.sh start resourcemanager （2台）
```

（关闭步骤）

```
(1)关闭yarn：yarn-daemon.sh stop resourcemanager  （开几台关几台）
(2)关闭集群：stop-dfs.sh   |（stop-all.sh    :同时关闭hdfs和yarn） （3台）
(3)关闭zookeeper：zkServer.sh stop                 （3台）
```

```
有可能会出错的地方
1，	确认每台机器防火墙均关掉
2，	确认每台机器的时间是一致的
3，	确认配置文件无误，并且确认每台机器上面的配置文件一样
4，	如果还有问题想重新格式化，那么先把所有节点的进程关掉
5，	删除之前格式化的数据目录hadoop.tmp.dir属性对应的目录，所有节点同步都删掉，别单删掉之前的一个，删掉三台JN节点中dfs.journalnode.edits.dir属性所对应的目录
6，	接上面的第6步又可以重新格式化已经启动了
7，	最终Active Namenode停掉的时候，StandBy可以自动接管！

```

### 3、关于脑裂

[脑裂（brain-split）](http://en.wikipedia.org/wiki/Split-brain_(computing))

1>定义：

是指在主备切换时，由于切换不彻底或其他原因，导致客户端和slave误以为出现两个active master，最终使得整个集群处于混乱状态。

2>解决脑裂问题：

通常采用[隔离(Fencing)](http://en.wikipedia.org/wiki/Fencing_(computing))机制

包括三个方面：

* 共享fencing ： 确保只有一个Master 往共享存储中写数据；

* 客户端fencing ：确保只有一个Master可以响应客户端的请求；
* Slave fencing ： 确保只有一个Master可以向Slave下发命令

> ​      Hadoop公共库中对外提供了两种fenching实现，分别是sshfence和shellfence（缺省实现），其中sshfence是指通过ssh登陆目标Master节点上，使用命令fuser将进程杀死（通过tcp端口号定位进程pid，该方法比jps命令更准确），shellfence是指执行一个用户事先定义的shell命令（脚本）完成隔离。

