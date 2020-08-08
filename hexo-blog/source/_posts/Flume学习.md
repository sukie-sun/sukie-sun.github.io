---
title: Flume学习
date: 2019-1-18
update: 2019-1-18
tags:
  - flume
categories: HDFS
grammar_cjkRuby: true
toc: false
description: 日志收集系统
abbrlink: 5df18fa6
---



## 一、理论理解

1、官网:：http://flume.apache.org/

2、概念：

​    Flume是一个分布式、可扩展、可靠、高可用的海量日志有效聚合及移动的框架。

​    它通常用于log数据，支持在系统中定制各类数据发送方，用于收集数据。它具有可靠性和容错可调机制和许多故障转移和恢复机制

![](https://wx1.sinaimg.cn/large/005zftzDly1g1jra7eyl9j30gi0e5jt8.jpg)

3、Flume1.0X         ----FlumeNG

flume1.0x版本中flume只有agent,由3个部分组成

![FlumeNG](https://wx1.sinaimg.cn/large/005zftzDly1g1jrc5v43yj30me071q39.jpg)

4、架构解释

Agent ：将数据源的数据发送给collector ，Agent由source、channel、sink三大组件组成。

* Source：

>   从Client收集数据，传递给Channel。可以接收外部源发送过来的数据。
>
>   不同的 source，可以接受不同的数据格式。
>
>   比如有目录池(spooling directory)数据源，可以监控指定文件夹中的新文件变化，如果目录中有文件产生，就会立刻读取其内容。

* Channel

>  是一个存储地，接收source的输出，直到有sink消费掉channel中的数据，Channel中的数据直到进入到下一个channel中或者进入终端才会被删除；
>
> 当sink写入失败后，可以自动重启，不会造成数据丢失，因此很可靠。

* Sink

> 用于数据输出

4、Flume使用原理图

![](https://wx1.sinaimg.cn/large/005zftzDly1g1jrhaxmslj30mx0dbju2.jpg)

Flume使用Agent内部原理图

![](https://wx1.sinaimg.cn/large/005zftzDly1g1jri44xz1j30l80d00uq.jpg)



## 二、特点

###  A、数据可靠性（内部实现）

​     当节点出现故障时，日志能够被传送到其他节点上而不会丢失。

 Flume提供了三种级别的可靠性保障,从强到弱依次分别为：

​    1、end-to-end：收到数据agent首先将event写到磁盘上，当数据传送成功后，再删除；如果数据发送失败，可以重新发送。

​    2、Store on failure：当数据接收方crash时

​    3、Best effort：数据发送到接收方后，不会进行确认。(udp)



###   B、自身可扩展性

*  Flume采用了三层架构，分别为agent，collector和storage，每一层均可以水平扩展。所有agent和 collector由master统一管理，使得系统容易监控和维护。master允许有多个（使用ZooKeeper进行管理和负载均衡），避免单点故障问题。

* 【1.0自身agent实现扩展】



###  C、功能可扩展性

  用户可以根据需要添加自己的agent。

   Flume自带了很多组件，包括各种agent（file，syslog，HDFS等）

## 三、Flume安装

​       1)将下载的flume包，解压

　　2)修改 flume-env.sh 配置文件,主要是JAVA_HOME设置[可选局部环境变量设置]

​        3)验证是否安装成功 flume-ng version

telnet 相关安装：

​     yum list telnet*   查看telnet相关的安装包

​     直接yum –y install telnet 就OK

​     yum -y install telnet-server 安装telnet服务

​     yum -y install telnet-client  安装telnet客户端(大部分系统默认安装)

## 四、分类

```
Flume 关于Event的笔记
　　在Flume中使用Event对象来作为传递数据的格式。
　　Sources端在flume-ng-core子项目中的org.apache.flume.serialization包下，有一个名为LineDeserializer的类，这个类负责把数据按行来读取，每一行封装成一个Event（实现方式：按字节读取，当遇到"\n"时封装成Event返回，下一次获取Event时继续获取下一字节并判断）。然后按用户设置的批量传输的值来封装List<Event>

备注：

capacity：默认该通道中最大的可以存储的event数量是1000

trasactionCapacity：每次最大可以source中拿到或者送到sink中的event数量也是100

```

`exec`：

>  Unix等操作系统执行命令行，如tail ，cat 。可监听文件

`netcat`

> 监听一个指定端口，并将接收到的数据的每一行转换为一个event事件
>

`avro`

> 序列化的一种，实现RPC（一种远程过程调用协议）。
>
> 监听AVRO端口来接收外部AVRO客户端事件流



### 1、 netcat（监听端口，在本地控制台打印）

#### （1） vim netcat_logger

```
# example.conf: A single-node Flume configuration

# Name the components on this agent
a1.sources = r1
a1.sinks = k1
a1.channels = c1

# Describe/configure the source
a1.sources.r1.type = netcat
a1.sources.r1.bind = localhost
a1.sources.r1.port = 44444

# Describe the sink
a1.sinks.k1.type = logger

# Use a channel which buffers events in memory
a1.channels.c1.type = memory
a1.channels.c1.capacity = 1000
a1.channels.c1.transactionCapacity = 100

# Bind the source and sink to the channel
a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1
```

#### （2）命令操作

* （在会话1端）

> 在node00节点的控制台输入`启动`命令：
>
> (`方式一`：指定配置文件的路径+文件名)
>
> ```shell
> flume-ng agent --conf-file /root/flume/netcat_logger --name a1 -Dflume.root.logger=INFO,console
> ```
>
> （`方式二`：配置文件所在当前目录）
>
> ```shell
> flume-ng agent --conf ./ --conf-file netcat_logger --name a1 -Dflume.root.logger=INFO,console
> ```
>
>

`特别注意`：

#####`官网方式`#########

> ```shell
> flume-ng agent --conf conf --conf-file netcat_logger --name a1 -Dflume.root.logger=INFO,console
> ```
>
> 解释：此命令适用于将配置文件放在flume解压安装目录的conf中（不常用）

`控制台显示`:

```
​````````
19/01/18 12:27:31 INFO instrumentation.MonitoredCounterGroup: Component type: CHANNEL, name: c1 started
19/01/18 12:27:31 INFO node.Application: Starting Sink k1
19/01/18 12:27:31 INFO node.Application: Starting Source r1
19/01/18 12:27:31 INFO source.NetcatSource: Source starting
19/01/18 12:27:31 INFO source.NetcatSource: Created serverSocket:sun.nio.ch.ServerSocketChannelImpl[/127.0.0.1:44444]
```

* (在会话2端)

> 在node00节点的控制台输入命令：
>
> 1、在节点上安装telnet
>
> ```shell
> yum install -y telnet
> yum -y install telnet-server
> ```
>
> 2、启动：
>
> ```shell
> telnet localhost 44444  
> ```
>
> `注意：`：
>
> ```
> a1.sources.r1.bind = localhost  # 监控本地端口44444的数据
> ```
>
> 前提是/etc/hosts中已经配置
>
> 如果此处配置localhost 那么启动时，localhost  或127.0.0.1都可以，node00就不行
>
> 如果此处配置node00那么启动时，node00或ip都可以，localhost就不行
>
> 3、在会话2控制台输入任何内容;
>
> 都会在会话1端显示，且会话1端（ctrl+c）退出服务，会话2端也自动结束

```shell
  yum list telnet*   查看telnet相关的安装包
   直接yum –y install telnet 就OK
     yum -y install telnet-server 安装telnet服务
     yum -y install telnet-client  安装telnet客户端(大部分系统默认安装)

```

### 2、avro（监听远程发送文件，在本地控制台打印）

#### （1）vim avro_logger

```
#test avro sources
##使用avro方式在某节点上将文件发送到本服务器上且通过logger方式显示
##当前flume节点执行：
#flume-ng agent --conf ./ --conf-file avro_loggers --name a1 -Dflume.root.logger=INFO,console
##其他flume节点执行：
#flume-ng avro-client --conf ./ -H 192.168.198.128 -p 55555 -F ./logs

a1.sources=r1
a1.channels=c1
a1.sinks=k1

a1.sources.r1.type = avro  
a1.sources.r1.bind=192.168.198.128
a1.sources.r1.port=55555

a1.sinks.k1.type=logger

a1.channels.c1.type = memory
a1.channels.c1.capacity=1000
a1.channels.c1.transactionCapacity = 100

a1.sources.r1.channels=c1
a1.sinks.k1.channel=c1
```

实现功能：

> 使用avro方式在某节点上将文件发送到本服务器上且通过logger方式显示

#### （2）命令操作

##### `启动` 

（在会话1端）

在node00上

*  当前flume节点执行（配置文件在当前目录）：

```shell
flume-ng agent --conf ./ --conf-file avro_logger --name a1 -Dflume.root.logger=INFO,console
```

`显示：`

```
19/01/18 13:53:16 INFO instrumentation.MonitoredCounterGroup: Component type: CHANNEL, name: c1 started
19/01/18 13:53:16 INFO node.Application: Starting Sink k1
19/01/18 13:53:16 INFO node.Application: Starting Source r1
19/01/18 13:53:16 INFO source.AvroSource: Starting Avro source r1: { bindAddress: 192.168.198.128, port: 55555 }...
19/01/18 13:53:17 INFO instrumentation.MonitoredCounterGroup: Monitored counter group for type: SOURCE, name: r1: Successfully registered new MBean.
19/01/18 13:53:17 INFO instrumentation.MonitoredCounterGroup: Component type: SOURCE, name: r1 started
19/01/18 13:53:17 INFO source.AvroSource: Avro source r1 started.

```

#####  发送

(在会话2端)

在node00上发送文件到node00

`启动`

可在本地和其他flume节点执行（配置文件在当前目录）：

```shell
flume-ng avro-client --conf ./ -H 192.168.198.128 -p 55555 -F ./flume.log
```

(在会话1端)

```
19/01/18 14:12:57 INFO sink.LoggerSink: 
Event: 
{ headers:{} body: 68 65 6C 6C 6F 20 62 69 67 64 61 74 61          hello bigdata }
```

时刻监听传输文件的内容

`注意`

> 该过程也可应用于不同节点之间

### 3、exec（监听某一命令，在本地控制台打印）

#### （1）vim exec_logger

```
#单节点flume配置
# example.conf: A single-node Flume configuration   

#给agent三大结构命名
# Name the components on this agent
a1.sources = r1
a1.sinks = k1
a1.channels = c1

#描述source的配置：类型、命令（监听/root/flume.log文件）
# Describe/configure the source
a1.sources.r1.type = exec
a1.sources.r1.command = tail -F /root/flume.log

#描述sink的配置：类型
# Describe the sink
a1.sinks.k1.type = logger

#在内存中使用一个channel缓存事件
# Use a channel which buffers events in memory
a1.channels.c1.type = memory
a1.channels.c1.capacity = 1000
a1.channels.c1.transactionCapacity = 100

#将source和sink绑定到channel上
# Bind the source and sink to the channel
a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1

```



（xshell会话1：）

> 在node00上：`启动`
>
> 在exec_logger文件所在的目录下
>
> 命令：
>
> ```shell
> flume-ng agent  --conf-file exec_logger --name a1 -Dflume.root.logger=INFO,console
> ```
>
> r1 启动

> （复制会话：会话2）
>
> 在node00上：
>
> 在root目录下
>
> 命令：
>
> ```shell
> echo hello bigdata >>flume.log
> ```
>
>

> 之后在会话1上
>
> `logger本地控制台打印：`
>
> ```
> 19/01/18 12:03:23 INFO sink.LoggerSink: 
> Event: 
> { headers:{} body: 68 65 6C 6C 6F 20 62 69 67 64 61 74 61  hello bigdata }
> ```



### 4、netcat–hdfs(监听数据，传到hdfs上)

#### （1）vim netcat_hdfs

```
# a1 which ones we want to activate.
a1.channels = c1
a1.sources = r1
a1.sinks = k1

a1.sources.r1.type = netcat
a1.sources.r1.bind = node00
a1.sources.r1.port = 41414

a1.sinks.k1.type = hdfs
a1.sinks.k1.hdfs.path = hdfs://Sunrise/myflume/%y-%m-%d
a1.sinks.k1.hdfs.useLocalTimeStamp=true

# Define a memory channel called c1 on a1
a1.channels.c1.type = memory
#默认值，可省
#a1.channels.c1.capacity = 1000
#a1.channels.c1.transactionCapacity = 100

# Define an Avro source called r1 on a1 and tell it
a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1
```

#### (2)操作

在node00的会话1上

启动

> 在node00上：
>
> 在netcat_hdfs文件所在的目录下
>
> 命令：
>
> ```shell
> flume-ng agent  --conf-file netcat_hdfs --name a1 -Dflume.root.logger=INFO,console
> ```
>
>



显示：

```
19/01/18 14:34:44 INFO instrumentation.MonitoredCounterGroup: Component type: CHANNEL, name: c1 started
19/01/18 14:34:44 INFO node.Application: Starting Sink k1
19/01/18 14:34:44 INFO node.Application: Starting Source r1
19/01/18 14:34:44 INFO source.NetcatSource: Source starting
19/01/18 14:34:44 INFO instrumentation.MonitoredCounterGroup: Monitored counter group for type: SINK, name: k1: Successfully registered new MBean.
19/01/18 14:34:44 INFO instrumentation.MonitoredCounterGroup: Component type: SINK, name: k1 started
19/01/18 14:34:44 INFO source.NetcatSource: Created serverSocket:sun.nio.ch.ServerSocketChannelImpl[/192.168.198.128:41414]

```



在node00的会话2上

启动

```shell
telnet node00 41414
```

显示

```
Trying 192.168.198.128...
Connected to node00.
Escape character is '^]'.

```

输入任意内容

在node00会话1端会显示

```
19/01/18 14:36:50 INFO hdfs.HDFSSequenceFile: writeFormat = Writable, UseRawLocalFileSystem = false
19/01/18 14:36:51 INFO hdfs.BucketWriter: Creating hdfs://Sunrise/myflume/19-01-18/FlumeData.1547822210259.tmp
19/01/18 14:37:29 INFO hdfs.BucketWriter: Closing hdfs://Sunrise/myflume/19-01-18/FlumeData.1547822210259.tmp
19/01/18 14:37:29 INFO hdfs.BucketWriter: Renaming hdfs://Sunrise/myflume/19-01-18/FlumeData.1547822210259.tmp to hdfs://Sunrise/myflume/19-01-18/FlumeData.1547822210259
19/01/18 14:37:29 INFO hdfs.HDFSEventSink: Writer callback called.

```



在HDF分布式系统上会显示，生成的文件

![](https://wx1.sinaimg.cn/large/005zftzDgy1fzb4acaz5fj30u10blmzc.jpg)

![](https://wx1.sinaimg.cn/large/005zftzDgy1fzb4bsv8d2j30wd08k74i.jpg)



`注意：`

这种情况会在hdfs上生成很多小文件，

[在官网](http://flume.apache.org/releases/content/1.8.0/FlumeUserGuide.html)

HDFS Sink：[*文档*](http://flume.apache.org/releases/content/1.8.0/FlumeUserGuide.html#hdfs-sink)

有很多关于文件生成过程中的配置

| Name                   | Default      | Description                                                  |
| ---------------------- | ------------ | ------------------------------------------------------------ |
| **channel**            | –            |                                                              |
| **type**               | –            | The component type name, needs to be `hdfs`                  |
| **hdfs.path**          | –            | HDFS directory path (eg hdfs://namenode/flume/webdata/)      |
| hdfs.filePrefix        | FlumeData    | Name prefixed to files created by Flume in hdfs directory    |
| hdfs.fileSuffix        | –            | Suffix to append to file (eg `.avro` - *NOTE: period is not automatically added*) |
| hdfs.inUsePrefix       | –            | Prefix that is used for temporal files that flume actively writes into |
| hdfs.inUseSuffix       | `.tmp`       | Suffix that is used for temporal files that flume actively writes into |
| hdfs.rollInterval      | 30           | Number of seconds to wait before rolling current file (0 = never roll based on time interval) |
| hdfs.rollSize          | 1024         | File size to trigger roll, in bytes (0: never roll based on file size) |
| hdfs.rollCount         | 10           | Number of events written to file before it rolled (0 = never roll based on number of events) |
| hdfs.idleTimeout       | 0            | Timeout after which inactive files get closed (0 = disable automatic closing of idle files) |
| hdfs.batchSize         | 100          | number of events written to file before it is flushed to HDFS |
| hdfs.codeC             | –            | Compression codec. one of following : gzip, bzip2, lzo, lzop, snappy |
| hdfs.fileType          | SequenceFile | File format: currently `SequenceFile`, `DataStream` or `CompressedStream` <br />(1)DataStream will not compress output file and please don’t set codeC<br /> (2)CompressedStream requires set hdfs.codeC with an available codeC |
| hdfs.maxOpenFiles      | 5000         | Allow only this number of open files. If this number is exceeded, the oldest file is closed. |
| hdfs.minBlockReplicas  | –            | Specify minimum number of replicas per HDFS block. If not specified, it comes from the default Hadoop config in the classpath. |
| hdfs.writeFormat       | Writable     | Format for sequence file records. One of `Text` or `Writable`. Set to `Text` before creating data files with Flume, otherwise those files cannot be read by either Apache Impala (incubating) or Apache Hive. |
| hdfs.callTimeout       | 10000        | Number of milliseconds allowed for HDFS operations, such as open, write, flush, close. This number should be increased if many HDFS timeout operations are occurring. |
| hdfs.threadsPoolSize   | 10           | Number of threads per HDFS sink for HDFS IO ops (open, write, etc.) |
| hdfs.rollTimerPoolSize | 1            | Number of threads per HDFS sink for scheduling timed file rolling |
| hdfs.kerberosPrincipal | –            | Kerberos user principal for accessing secure HDFS            |
| hdfs.kerberosKeytab    | –            | Kerberos keytab for accessing secure HDFS                    |
| hdfs.proxyUser         |              |                                                              |
| hdfs.round             | false        | Should the timestamp be rounded down (if true, affects all time based escape sequences except %t) |
| hdfs.roundValue        | 1            | Rounded down to the highest multiple of this (in the unit configured using `hdfs.roundUnit`), less than current time. |
| hdfs.roundUnit         | second       | The unit of the round down value - `second`, `minute` or `hour`. |
| hdfs.timeZone          | Local Time   | Name of the timezone that should be used for resolving the directory path, e.g. America/Los_Angeles. |
| hdfs.useLocalTimeStamp | false        | Use the local time (instead of the timestamp from the event header) while replacing the escape sequences. |
| hdfs.closeTries        | 0            | Number of times the sink must try renaming a file, after initiating a close attempt. <br />If set to 1, this sink will not re-try a failed rename (due to, for example, NameNode or DataNode failure), and may leave the file in an open state with a .tmp extension.<br /> If set to 0, the sink will try to rename the file until the file is eventually renamed (there is no limit on the number of times it would try). The file may still remain open if the close call fails but the data will be intact and in this case, the file will be closed only after a Flume restart. |
| hdfs.retryInterval     | 180          | Time in seconds between consecutive attempts to close a file. Each close call costs multiple RPC round-trips to the Namenode, so setting this too low can cause a lot of load on the name node. If set to 0 or less, the sink will not attempt to close the file if the first attempt fails, and may leave the file open or with a ”.tmp” extension. |
| serializer             | `TEXT`       | Other possible options include `avro_event` or the fully-qualified class name of an implementation of the `EventSerializer.Builder` interface. |

### avro-hdfs 

（配置方式二）

```
# a1 which ones we want to activate.
a1.channels = c1
a1.sources = r1
a1.sinks = k1

a1.sources.r1.type = avro
a1.sources.r1.bind=node01
a1.sources.r1.port=55555

a1.sinks.k1.type = hdfs
a1.sinks.k1.hdfs.path = hdfs://shsxt/hdfsflume

# Define a memory channel called c1 on a1
a1.channels.c1.type = memory
a1.channels.c1.capacity=1000
a1.channels.c1.transactionCapacity = 100

# Define an Avro source called r1 on a1 and tell it
a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1
```

##当前flume节点执行：
#flume-ng agent --conf ./ --conf-file avro_loggers --name a1 -Dflume.root.logger=INFO,console
##其他flume节点执行：
#flume-ng avro-client --conf ./ -H 192.168.198.128 -p 55555 -F ./logs

### 5、结合版（netcat-avro）

#### （1）编辑配置文件

（node00：vim netcat_avro1）

```
# example.conf: A single-node Flume configuration
#flume-ng agent --conf ./ --conf-file netcat_avro1 --name a1 -Dflume.root.logger=INFO,console
#flume-ng --conf conf --conf-file /root/flume_test/netcat_hdfs -n a1 -Dflume.root.logger=INFO,console
#telnet 192.168.235.15 44444
# Name the components on this agent
 a1.sources = r1
 a1.sinks = k1
 a1.channels = c1

 # Describe/configure the source
 a1.sources.r1.type = netcat
 a1.sources.r1.bind = node00
 a1.sources.r1.port = 44444

 # Describe the sink
 a1.sinks.k1.type = avro
 a1.sinks.k1.hostname = node01
 a1.sinks.k1.port = 60000


 # Use a channel which buffers events in memory
 a1.channels.c1.type = memory
 a1.channels.c1.capacity = 1000
 a1.channels.c1.transactionCapacity = 100

 # Bind the source and sink to the channel
 a1.sources.r1.channels = c1
 a1.sinks.k1.channel = c1

#---------------------------
#flume-ng agent --conf-file etect2_logger --name a1 -#Dflume.root.logger=INFO,console

#flume-ng agent --conf conf --conf-file netcat_logger --name a1 -#Dflume.root.logger=INFO,console
```

（node01：netcat_avro2）

```
#flume-ng agent --conf ./ --conf-file avro2 -n a1 
a1.sources = r1
a1.sinks = k1
a1.channels = c1

a1.sources.r1.type = avro
a1.sources.r1.bind = node01
a1.sources.r1.port = 60000

a1.sinks.k1.type = logger

# Use a channel which buffers events in memory
a1.channels.c1.type = memory
a1.channels.c1.capacity = 1000
a1.channels.c1.transactionCapacity = 100

# Bind the source and sink to the channel
a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1

```

(2)操作

> 先启动后面的flume节点node01  ，在启动node00，最后启动node02

在node01上

`启动`

```shell
flume-ng agent --conf conf --conf-file netcat_avro1 -n a1 -Dflume.root.logger=INFO,console
```

显示

```
19/01/18 23:22:27 INFO node.Application: Starting Channel c1
19/01/18 23:22:28 INFO instrumentation.MonitoredCounterGroup: Monitored counter group for type: CHANNEL, name: c1: Successfully registered new MBean.
19/01/18 23:22:28 INFO instrumentation.MonitoredCounterGroup: Component type: CHANNEL, name: c1 started
19/01/18 23:22:28 INFO node.Application: Starting Sink k1
19/01/18 23:22:28 INFO node.Application: Starting Source r1
19/01/18 23:22:28 INFO source.AvroSource: Starting Avro source r1: { bindAddress: node01, port: 60000 }...
19/01/18 23:22:30 INFO instrumentation.MonitoredCounterGroup: Monitored counter group for type: SOURCE, name: r1: Successfully registered new MBean.
19/01/18 23:22:30 INFO instrumentation.MonitoredCounterGroup: Component type: SOURCE, name: r1 started
19/01/18 23:22:30 INFO source.AvroSource: Avro source r1 started.
```

在node00上：

`启动`

```shell
flume-ng agent --conf ./ --conf-file netcat_avro2 --name a1 -Dflume.root.logger=INFO,console
```



在node02上

`启动`

> telnet node00 44444

然后输入数据文件



最后在

node01节点上

显示文件信息

```
19/01/18 23:33:01 INFO sink.LoggerSink: Event: { headers:{} body: 68 65 6C 6C 6F 20 77 6F 72 6C 64 0D             hello world. }

```

