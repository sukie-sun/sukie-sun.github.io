---
title: Zookeeper学习
tags: Zookeeper
categories: HDFS
grammar_cjkRuby: true
description: 用于协同服务的框架
abbrlink: 7a59669d
date: 2019-01-04 15:30:00
---

动物园管理员

`推荐图书：`《从Paxo到Zookeeper》

# Zookeeper

## 1、简介

> 开源的、分布式应用程序，提供**`一致性`**服务，是Haoop （实现HA）和Hbase（和zookeeper是强依赖关系）的重要组件

提供的功能：

* 配置维护
* 域名维护
* 分布式的同步
* 组服务

Zookeeper→提供通用分布式锁服务，用以协调分布式应用

Keepalived→实现节点健康检查，采用优先级监控，没有协同工作，功能单一，可扩展性差。

## 2、Zookeep的角色

 ![](https://wx1.sinaimg.cn/large/005zftzDgy1fzd81ntj7tj30fd06pgn1.jpg)



![](https://wx1.sinaimg.cn/large/005zftzDgy1fzd828tp44j30fo07lwgl.jpg)



（一般很少配置Observer，因为用的少，而且配置的节点一般为奇数）

> Zookeeper需保证高可用和强一致性；
>
> ​    为了支持更多的客户端，需要增加更多Server；
>
> ​    Server增多，投票阶段延迟增大，影响性能；
>
> ​    权衡伸缩性和高吞吐率，引入Observer
>
> ​    Observer不参与投票；
>
> ​    Observers接受客户端的连接，并将写请求转发给leader节点；
>
> ​    加入更多Observer节点，提高伸缩性，同时不影响吞吐率。
>
>  



## 3、Zookeeper特点

|     **特点**     | **说明**                                                     |
| :--------------: | ------------------------------------------------------------ |
| ***最终*一致性** | 为客户端展示同一个视图，这是zookeeper里面一个非常重要的功能（与强一致性相对） |
|    **可靠性**    | 如果消息被到一台服务器接受，那么它将被所有的服务器接受.      |
|    **实时性**    | Zookeeper不能保证两个客户端能同时得到刚更新的数据，如果需要最新数据，应该在读数据之前调用sync()接口。 |
|    **独立性**    | 各个Client之间互不干预                                       |
|    **原子性**    | 更新只能成功或者失败，没有中间状态。                         |
|    **顺序性**    | 所有Server，同一消息发布顺序一致。                           |

### 4、安装部署：

[官网：](https://zookeeper.apache.org/)

[下载：](https://archive.apache.org/dist/zookeeper/)

（1）`修改`配置文件：

在Zokeeper的安装目录中的conf目录下，将zoo_sample.cfg文件改名为zoo.cfg

> ```shell
> mv zoo_sample.cfg zoo.cfg
> ```

`编辑：`

> ```shell
> vim /usr/soft/zookeeper-3.4.13/conf/zoo.cfg
> ```

```properties
#发送心跳的间隔时间，单位：毫秒 ; 2秒
tickTime=2000  
dataDir=/usr/soft/zookeeper-3.4.13/data
dataLogDir=/usr/soft/zookeeper-3.4.13/logs
#客户端连接 Zookeeper 服务器的端口，
clientPort=2181    
#Zookeeper 会监听这个端口，接受客户端的访问请求。
initLimit=5
syncLimit=2
server.1=node1:2888:3888
server.2=node2:2888:3888
server.3=node3:2888:3888

```

注意：千万不要有多余的空格：

> 由于在配置server.3=node3:2888:3888 这个参数时后面由于打字习惯多敲了一个空格，于是启动报错：Address unresolved: node3:3888 

`配置解释:`

> `initLimit`： 这个配置项是用来配置 Zookeeper 接受客户端（这里所说的客户端是 Zookeeper 服务器集群中连接到 Leader 的 Follower 服务器）初始化连接时最长能忍受多少个心跳时间间隔数。当已经超过 5 个心跳的时间（也就是 tickTime）长度后 Zookeeper 服务器还没有收到客户端的返回信息，那么表明这个客户端连接失败。总的时间长度就是 5*2000=10 秒
>
> syncLimit：这个配置项标识 Leader 与 Follower 之间发送消息，请求和应答时间长度，最长不能超过多少个 tickTime 的心跳时间长度，总的时间长度就是 2*2000=4 秒
>
> server.A=B：C：D：其 中 A 是一个数字，表示这个是第几号服务器；B 是这个服务器的 ip 地址；C 表示的是这个服务器与集群中的 Leader 服务器交换信息的端口；D 表示的是万一集群中的 Leader 服务器挂了，需要一个端口来重新进行选举，选出一个新的 Leader，而这个端口就是用来执行选举时服务器相互通信的端口。如果是伪集群的配置方式，由于 B 都是一样，所以不同的 Zookeeper 实例通信端口号不能一样，所以要给它们分配不同的端口号

(2)**创建myid文件**（在上面配置文件中配置dataDir  的目录下）

```
server1机器的内容为：1，
server2机器的内容为：2，
server3机器的内容为：3
```

（3）将zookeeper包发到各个节点上

# Paxo算法

[官网](http://zh.wikipedia.org/zh-cn/Paxos)

## 1、简介

一种基于消息传递且具有高度容错特性的一致性算法，广泛应用于分布式计算中，是到目前为止唯一的分布式一致性算法。

`前提：`

Paxos 有一个前提：没有拜占庭将军问题。就是说 Paxos只有在一个可信的计算环境中才能成立，这个环境是不会被入侵所破坏的。

## 2、结合故事的对应理解

> 小岛(Island)——ZK Server Cluster
> 议员(Senator)——ZK Server
> 提议(Proposal)——ZNode Change(Create/Delete/SetData…)
> 提议编号(PID)——Zxid(ZooKeeper Transaction Id)
> 正式法令——所有 ZNode 及其数据
>
> 总统——ZK Server Leader

# zookeeper的节点及工作原理

## 1、**工作原理**

> 1.每个Server在内存中存储了一份数据；
>
> 2.Zookeeper启动时，将从实例中选举一个leader（Paxos协议）
>
> 3.Leader负责处理数据更新等操作
>
> 4.一个更新操作成功，当且仅当大多数Server在内存中成功修改数据。

Zookeeper的核心是**原子广播**，这个机制保证了各个server之间的同步。实现这个机制的协议叫做**Zab协议**。

Zab协议有两种模式，它们分别是**恢复模式**和**广播模式**。

> 当服务启动或者在领导者崩溃后，Zab就进入了**恢复模式**，当领导者被选举出来，且大多数server的完成了和leader的状态同步以后，恢复模式就结束了。状态同步保证了leader和server具有相同的系统状态。一旦leader已经和多数的follower进行了状态同步后，他就可以开始广播消息了，即进入**广播状态**。这时候当一个server加入zookeeper服务中，它会在恢复模式下启动，发现leader，并和leader进行状态同步。待到同步结束，它也参与消息广播。Zookeeper服务一直维持在Broadcast状态，直到leader崩溃了或者leader失去了大部分的followers支持.
>
> 广播模式需要保证proposal被按顺序处理，因此zk采用了**递增的事务id号(zxid)**来保证。所有的提议(proposal)都在被提出的时候加上了zxid。实现中zxid是一个64位的数字，它高32位是epoch用来标识leader关系是否改变，每次一个leader被选出来，它都会有一个新的epoch。低32位是个递增计数。
>
> 当leader崩溃或者leader失去大多数的follower，这时候zk进入恢复模式，恢复模式需要重新选举出一个新的leader，让所有的server都恢复到一个正确的状态。

## 2、Znode节点

（1）Znode有两种类型，**短暂的（ephemeral）和持久的（persistent）**

 Znode的类型在创建时确定并且之后不能再修改。

* 短暂znode的客户端会话结束时，zookeeper会将该短暂znode删除，**短暂znode不可以有子节点**

* 持久znode不依赖于客户端会话，只有当客户端明确要删除该持久znode时才会被删除

（2）Znode有四种形式的目录节点

* PERSISTENT、持久的

*  EPHEMERAL、短暂的

*  PERSISTENT_SEQUENTIAL、持久且有序的

*  EPHEMERAL_SEQUENTIAL   短暂且有序的

## 3、shell操作

启动服务端：

```shell
./zkServer.sh start
```

停止服务：

```shell
./zkServer.sh stop
```

启动客户端：

```shell
./zkCli.sh -server 127.0.0.1 : 2081
```

​                                             （localhost | node01）

​                                             （也可连接其他节点）

​                      (port默认2081,可省；ip也可省)

退出客户端：

```shell
quit
```

操作指南：

```shell
help
```

查看根目录：

```shell
ll /
```

​     （ll  +路径） 

获取具体服务内容：

```shell
get /
(get +路径+服务)可查看注册zookeeper服务的节点信息
```

（如果作为leader的namenode挂了，最新文件会相应的更换数据信息，如果没有nn，那么就没有相应的最新文件，只会有记录上一个阶段数据的文件）

创建服务：

```
create /sun aabbcc
```

​               (create +路径 + 数据内容) 

在其他节点也可启动客户端，创建服务

删除服务：

```shell
rmr /sun
```

![](https://wx1.sinaimg.cn/large/005zftzDgy1g18fy424pbj30fd091wg3.jpg)

## 4、API操作

![](https://wx1.sinaimg.cn/large/005zftzDgy1fzdcgvx18uj30fe0akwie.jpg)

`见代码testzookeeper`

# 总结

> Zookeeper 作为 Hadoop 项目中的一个子项目，是Hadoop 集群管理的一个必不可少的模块，它**主要用来控制集群中的数据**，如它管理 Hadoop 集群中的NameNode，还有 Hbase 中 Master、 Server 之间状态同步等。
>
> ​    Zoopkeeper 提供了一套很好的分布式集群管理的机制，就是它这种基于层次型的目录树的数据结构，并对树中的节点进行有效管理，从而可以设计出多种多样的分布式的数据管理模型。