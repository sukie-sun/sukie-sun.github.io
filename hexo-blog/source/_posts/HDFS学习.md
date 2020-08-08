---
title: HDFS学习
date: '2019-1-3 08:30'
update: 2019-3-19
tags: HDFS
categories: HDFS
grammar_cjkRuby: true
description: 分布式存储系统---大数据三驾马车之一
abbrlink: fb521cc3
---

== hadoop理解==

狭义：

hadoop1 = hdfs1 + MR1

hadoop2 = hdfs2 + MR2 + YARN

广义：

Hadoop生态

![](https://wx1.sinaimg.cn/large/005zftzDgy1g16vvlbzawj30ex09nq6e.jpg)

用于解决海量数据的处理和数据存储，数据级别为GB，TB，PB。

## 一、分布式文件存储系统HDFS

### 1、什么是分布式？

> 定义：将海量的数据，复杂的业务分发到不同的计算机节点和服务器上分开处理和计算。
>
> 特点：
>
> * 多副本，提高服务的容错率、安全性、高可靠性
> * 适合批处理，提高服务的效率和速度，
> * 减轻单台服务器的压力
> * 具有很好的可扩展性
> * 计算向数据靠拢，安全，高效

`大数据三驾马车：GFS、MapReduce、Bigtable`====HDFS、MR、HBASE

### 2、什么是HDFS？

#### （1）HDFS为什么会出现？

> 主要解决大量【pb级以上】的大数据的分布式存储问题

#### （2）==HDFS的特点==

> $$ 分布式特性：
>
> * 适合大数据处理：GB、TB、PB以上的数据
> * 百万规模以上的文件数量:10K+ 节点
> * 适合批处理：移动计算而非数据(MR),数据位置暴露给计算框架
>
> $$ 自身特性：
>
> * 可构建在廉价机器上
> * 高可靠性：通过多副本实现
> * 高容错性：数据自动保存多个副本；副本丢失后，自动恢复,提供了恢复机制
>
> $$ 缺点：
>
> -----低延迟高数据吞吐访问问题（不适合低延迟数据访问，Hbase适合）
>
> * 不支持毫秒级
> * 吞吐量大但有限制于其延迟（瓶颈：低延迟无法突破）
>
> —–小文件存取占用NameNode大量内存(寻道时间超过读取时间,约占99%)
>
> -------不支持多用户写入及任意修改文件
>
> * 不支持文件修改：一个文件只能有一个写者
> *  文件仅支持append不支持修改
> * （其实本身是支持的，主要为了用空间换时间，节约成本）
>
> $$ 实现目标：
>
> * 兼容廉价的硬件设施
> * 实现流数据读写
> * 支持大数据集
> * 支持简单的文件模型
> * 强大的跨平台兼容性

#### （3）==HDFS架构图==

![HDFS架构图](https://wx1.sinaimg.cn/large/005zftzDgy1fz0lg96gkqj30hz0dsgmf.jpg)

![HDFS架构图](https://wx1.sinaimg.cn/large/005zftzDgy1fz0lq2gmmtj30f009vwfj.jpg)

> `关系型数据库：`安全，存储在磁盘中；如MySql、Oracle、SQlServer
>
> `非关系型数据库：`不安全，存储在内存中；如Redis、MemcacheDB、mongoDB、Hbase

### 3、==HDFS的功能模块及原理详解==

#### <1> HDFS数据存储模型（block）

![block](https://wx1.sinaimg.cn/large/005zftzDgy1fz0n3j6xvnj30fe09vdh0.jpg)

##### （1）文件被`线性切分`固定大小的数据块：block

* 通过偏移量offset（单位：byte）标记

* 默认数据块大小为64MB (hadoop1.x，hadoop2.x默认为128M）)，可自定义配置

* 若文件大小不到64MB ，则单独存成一个block

##### （2）一个文件存储方式

* 按大小被切分成若干个block ，存储到`不同节点上`

* 默认情况下每个block共有3个副本

* 副本数不大于节点数

##### （3）Block大小和副本数通过Client端上传文件时设置，

>  文件上传成功后副本数可以变更，Block Size大小不可变更
>
> 块的大小远远大于普通文件系统，可以最小化寻址开销

#### <2>NameNode（简称NN）

> * 存储`元数据`；
> * 元数据保存在`内存中`；
> * 保存`文件`、`block块`、`datanode`之间的映射关系

#####    1> NN主要功能：

> 接收客户端的读写服务；接收DN汇报block位置关系

#####     2> NN保存metadate元信息

> 基于`内存`存储，`不会`和磁盘发生交换

​        `metadata`元数据信息包括以下

> * 文件的归属（ownership）和权限（permission）
>
> * 文件大小和写入时间
>
> * block列表【偏移量】：即一个完整文件有哪些block（b0+b1+b2+..=file）
>
> * 位置信息（`动态 `的）：Block每个副本保存在哪个DataNode中
>
>   `*注意*`：位置信息是由DN启动时上报给NN ，因为它会随时变化，所以不会保存在内存和磁盘中

#####         3> NameNode的metadate信息在启动后会加载到内存

> 同时：
>
> metadata信息也会保存fsimage文件中（fsimage文件是位于磁盘上的镜像文件）
>
> 对metadata的操作日志也会记录在edits 文件中（edits文件是位于磁盘上的日志文件）

#### <3>SecondaryNameNode（简称SNN）

#####       1>SNN主要功能

> 帮助NameNode合并edits和fsimage文件，减少NN启动时间；
>
> SecondaryNameNode一般是单独运行在一台机器上；
>
> 它不是NN的备份（但可以做备份)。

#####      2>合并流程

![SNN合并](https://wx1.sinaimg.cn/large/005zftzDgy1fz0p1lys2zj30f009vwf2.jpg)



```txt
SecondaryNameNode的工作情况：
（1）SecondaryNameNode会定期和NameNode通信，请求其停止使用EditLog文件，
     暂时将新的写操作写到一个新的文件edit.new上来，这个操作是瞬间完成，
     上层写日志的函数完全感觉不到差别；
（2）SecondaryNameNode通过HTTP GET方式从NameNode上获取到FsImage和EditLog文
    件，并下载到本地的相应目录下；
（3）SecondaryNameNode将下载下来的FsImage载入到内存，然后一条一条地执行EditLog文件中的各项更新操作，使得内存中的FsImage保持最新；
    这个过程就是EditLog和FsImage文件合并；
（4）SecondaryNameNode执行完（3）操作之后，
     会通过post方式将新的FsImage文件发送到NameNode节点上
（5）NameNode将从SecondaryNameNode接收到的新的FsImage替换旧的FsImage文件，
     同时将edit.new替换EditLog文件，通过这个过程EditLog就变小了
```

##### 3>合并机制

>  -------SNN执行合并时间和机制
>
>  * A、根据配置文件设置指定连续两次检查点的最大时间间隔 `fs.checkpoint.period` 默认3600秒（1小时）
>  * B、根据配置文件设置edits log文件大小 `fs.checkpoint.size` 默认最大值64M
>  * 配置文件：core-site.xml
>

#### <4>DataNode（简称DN）

#####    1>  DN主要功能

> * 存储`文件内容`（block）；
> * 文件内容保存在`磁盘`；
> * 维护了`block id` 到`datanode本地文件`的映射关系
> * 启动DN线程的时候会向NameNode汇报block位置信息

#####     2>   DN工作机制

```
•    数据节点是分布式文件系统HDFS的工作节点，负责数据的存储和读取，
•    会根据客户端或者是名称节点的调度来进行数据的存储和检索，
•    并且通过心跳机制向名称节点定期发送自己所存储的块的列表，保持与其联系（3秒一次）
    （如果NN 10分钟没有收到DN的心跳，则认为其已经lost，并copy其上的block到其它DN）
•    每个数据节点中的数据会被保存在各自节点的本地Linux文件系统中
```

##### 3> block的副本放置策略

> –  第一个副本：放置在上传文件的DN（集群内提交）；
>
> ​                           如果是集群外提交，则随机挑选一台磁盘不太满，CPU不太忙的节点。
>
> –  第二个副本：放置在于第一个副本不同的机架的节点上。
>
> –  第三个副本：与第二个副本相同机架的不同节点。
>
> –  更多副本：随机节点

![block块存放位置](https://wx1.sinaimg.cn/large/005zftzDgy1fz1ny1tfrjj30f00akaaf.jpg)

### 4、HDFS读写流程

#### <1> 读文件过程

![read](https://wx1.sinaimg.cn/large/005zftzDgy1fz1o4z4nmwj30gm09vgmg.jpg)

> 1、首先`client端`调用DistributedFileSystem对象（`DFS`）的`open方法`，（DFS：一个DistributedFileSystem的实例）。
> 2、DistributedFileSystem通过`rpc`协议从NameNode（`NN`）获得文件的第一批block的`locations`，（同一个block按副本数会返回多个locations，因为同一文件的block`分布式存储`在不同节点上），这些locations按照hadoop拓扑结构排序，距离客户端近的排在前面（`就近选择`）。
>
> 3、前两步会返回一个FSDataInputStream对象，该对象会被封装DFSInputStream对象，DFSInputStream可以方便的管理DN和NN的数据流。客户端调用`read方法`，DFSInputStream会连接离客户端最近的DN，数据从DN源源不断的流向客户端（对客户端是透明的，只能看到一个读入的Input流）。
>
> 4、如果第一批block都读完了， DFSInputStream就会去NN拿下一批block的locations，然后继续读，如果所有的块都读完，这时就会关闭掉所有的流





![读](https://wx1.sinaimg.cn/large/005zftzDgy1fz1ptkw9krj30q40gegpp.jpg)

`注意：`

```
   如果在读数据的时候,DFSInputStream和DN的通讯发生异常，就会尝试连接正在读的block的排序第二近的DN,并且会记录哪个DN发生错误，剩余的blocks读的时候就会直接跳过该DN。
   DFSInputStream也会检查block数据校验和，如果发现一个坏的block,就会先报告到NN，然后DFSInputStream在其他的DN上读该block的镜像。
   该设计就是客户端直接连接DN来检索数据，并且NN来负责为每一个block提供最优的DN，NN仅仅处理block location的请求，这些信息都加载在NN的内存中，hdfs通过DN集群可以承受大量客户端的并发访问。


   * RPC *（Remote Procedure Call Protocol）——远程过程调用协议，它是一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络技术的协议。RPC协议假定某些传输协议的存在，如TCP或UDP，为通信程序之间携带信息数据。在OSI网络通信模型中，RPC跨越了传输层和应用层。RPC使得开发包括网络分布式多程序在内的应用程序更加容易。
RPC采用客户机/服务器模式。请求程序就是一个客户机，而服务提供程序就是一个服务器。首先，客户机调用进程发送一个有进程参数的调用信息到服务进程，然后等待应答信息。在服务器端，进程保持睡眠状态直到调用信息到达为止。当一个调用信息到达，服务器获得进程参数，计算结果，发送答复信息，然后等待下一个调用信息，最后，客户端调用进程接收答复信息，获得进程结果，然后调用执行继续进行。

```

#### <2>写文件过程

![write](https://wx1.sinaimg.cn/large/005zftzDgy1fz1o6wamv3j30ga0aawfd.jpg)3

> **1.**客户端通过调用DistributedFileSystem的`create方法`创建新文件。
>
> **2.**DistributedFileSystem通过`RPC`调用NN去创建一个没有blocks关联的新文件，创建前，NN会做各种校验，比如文件是否存在，客户端有无权限去创建等。如果校验通过，NN就会记录下新文件，否则就会抛出IO异常。
>
> **3.**前两步结束后，会返回FSDataOutputStream的对象，封装在DFSOutputStream，客户端开始写数据到DFSOutputStream，DFSOutputStream会把数据切成一个个小的`packet`，然后排成队列dataQuene。
>
> **4.**NN会给这个新的block分配最适合存储的几个datanode，DFSOutputStream把packet包排成一个`管道pipeline`输出。先按队列输出到管道的第一个datanode中，并将该Packet从dataQueue队列中移到ackQueue队列中，第一个datanode又把packet输出到第二个datanode中，以此类推。
>
> **5.**DFSOutputStream中的`ackQuene`，也是由packet组成，等待DN的收到响应，当pipeline中的DN都表示已经收到数据的时候，这时ackQuene才会把对应的packet包移除掉。 如果在写的过程中某个DN发生错误，会采取以下几步：
>
> ​      1) pipeline被关闭掉；  
>
> ​      2)为了防止丢包，ackQuene里的packet会`同步`到dataQuene里;新建pipeline管道接到其他正常DN上
>
> ​     4)剩下的部分被写到剩下的正常的datanode中； 
>
> ​     5)NN找到另外的DN去创建这个块的复制。（对客户端透明）
>
> **6.**客户端完成写数据后调用`close方法`关闭写入流

`注意：`客户端执行write操作后，写完的block才是可见的，正在写的block对客户端是不可见的





![写](https://wx1.sinaimg.cn/large/005zftzDgy1fz1ptp2xlej30on0gf78r.jpg)



### 5.HDFS文件权限和安全模式

#### <1>？？HDFS文件权限？？

– 与Linux文件权限类似 

>    • r: read;    w:write;    x:execute，权限x对于文件忽略，对于文件夹表示是否允许访问其内容 

– 如果Linux系统用户zs使用hadoop命令创建一个文件，那么这个 文件在HDFS中owner就是zs。 

– HDFS的权限目的：阻止好人做错事，而不是阻止坏人做坏事。

#### <2>？？安全模式？？

> - NN启动的时候，首先将映像文件(fsimage)载入内存，并执行编辑日志(edits)中的各项操作。 

> * 一旦在内存中成功建立文件系统元数据的映射，则创建一个新的fsimage文件(这个操作不需要SecondaryNameNode)和一个空的编辑日志。 

> * 此刻namenode运行在安全模式。即namenode的文件系统对于客服端来说是只读的。(显示目录，显示文件内容等。写、删除、重命名都会失败)。 

> * 在此阶段Namenode收集各个datanode的报告，当数据块达到最小副本数以上时，会被认为是“安全”的， 在一定比例（可设置）的数据块被确定为“安全”后，再过若干时间，安全模式结束 

> * 当检测到副本数不足的数据块时，该块会被复制直到达到最小副本数，系统中数据块的位置并不是由namenode维护的，而是以块列表形式存储在datanode中。

![异常](https://wx1.sinaimg.cn/large/005zftzDgy1fz1s32tmr2j30hj04ggmr.jpg)

手动退出安全模式：

```shell
hdfs namenode -safemode leave
```



## 二、完全分布式搭建及eclipse插件

### 1、==完全分布式搭建（必备）==

#### （1）环境的准备

> *  Linux (前面已经安装好了)
>
> + JDK（前面已经安装好了）
>
> + 准备至少3台机器（通过克隆虚拟机；)
>
> + (网络配置、JDK搭建、hosts配置，保证节点间能互ping通）
>
> + 时间同步
>
>   （推荐）ntpdate cn.ntp.org.cn 
>
>    (ntpdate time.nist.gov)
>
> + ssh免秘钥登录   (两两互通免秘钥)

#### （2）完全分布式搭建步骤

##### **Hadoop 1.X**

###### 1、下载解压缩Hadoop

###### 2、配置hadoop/hadoop-env.sh 

```sh
export JAVA_HOME=/usr/java/latest 
```

######  3、配置core-site.xml:

> fs.defaultFS 默认的服务端口NameNode URI
>
> hadoop.tmp.dir 是hadoop文件系统依赖的基础配置，很多路径都依赖它。如果hdfs-site.xml中不配 置namenode和datanode的存放位置，默认就放在这个路径中

```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://node01:9000</value>
    </property>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/opt/hadoop-2.6.1</value>
    </property>
</configuration>
```

######  4、配置hdfs-site.xml:

dfs.datanode.https.address   https服务的端口，浏览器访问端口

```xml
<configuration>
  <property>
  <!--默认为3个副本，若指定，则以指定的为准-->
      <name>dfs.replication</name>
      <value>1</value>
 </property>
 <property>
     <!--http访问：SecondaryNameNode的服务器的ip地址别名,端口号50090-->
        <name>dfs.namenode.secondary.http-address</name>
        <value>node02:50090</value>
    </property>
<property>
    <!--https访问：SecondaryNameNode的服务器的ip地址别名,端口号50090-->
        <name>dfs.namenode.secondary.https-address</name>
        <value>node02:50091</value>
    </property>

</configuration>
```

######  5、Masters:**master** 可以做主备的SNN

在/home/hadoop-2.6.5/etc/hadoop/新建masters文件 写上**SNN**节点名： node02（IP地址别名） 

###### 6、Slaves: **slave** 奴隶 苦干；拼命工作

在/home/hadoop-2.5.1/etc/hadoop/slaves文件中填写**DN** 节点名：node02 node03 [注意：每行写一个 写成3行]

######  7、最后将配置好的Hadoop通过SCP命令发送都其他节点

   配置Hadoop的环境变量

8、vim ~/.bash_profile  (最好手敲输入 粘贴有时候会出错)

```properties
export HADOOP_HOME/home/hadoop-2.6.5
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
```

 9、记得一定要  source ~/.bash_profile
10、回到跟目录下对NN进行格式化  hdfs namenode -format

11、启动HDFS： start-dfs.sh

12、关闭防火墙：service iptables stop
在浏览器输入 node01:50070 



##### ==!!**Hadoop 2.X**!!==

`详情见Hadoop2.X.md文件`

### 2、HDFS命令

#### (0)  命令 ：hdfs dfs

#### (1)上传文件到HDFS：

>  **hdfs dfs -put 本地路径/fileName **PATH [hdfs的文件路径]

> 上传本地文件/root/install.log到/myhdfs目录下
>
> ```shell
> hdfs dfs -put /root/install.log /myhdfs
> ```
>
> ​                                      （文件路径)                (上传目录）    

#### (2)创建文件夹

> ```shell
> hdfs dfs -mkdir[-p] <paths>
> ```
>
>  **-p**   穿透，用于创建多级文件夹



#### (3)**删除文件或文件夹**

> ```shell
> hdfs dfs -rm -r /myhadoop1.0 
> ```
>
> 删除多个文件夹
>
> ```shell
> hdfs dfs -rm -r /input /logs
> ```
>
> **-r**   递归，用于删除文件夹以及下级文件和文件夹



```shell
hdfs dfs -du [-s] [-h] URI[URI ...] 显示文件(夹)大小. 

hdfs dfs -cp [-f] [-p] URI[URI...]<dest>    复制文件(夹)，可以覆盖，可以保留原有权限信息

hdfs dfs -count [-q] [-h] <paths>列出文件夹数量、文件数量、内容大小.

hdfs dfs -chown [-R] [OWNER] [:[GROUP]] URI[URI] 修改所有者.

hdfs dfs -chmod [-R]<MODE[,MODE]...|OCTALMODE> URI[URI ...] 修改权限.
```



#### （4）指定block大小

其中副本数是在在配置文件中配置

```shell
产生100000条数据：

for i in `seq 100000`;do  echo "hello sxt $i" >> test.txt;done

上传文件test.txt到指定的Java22目录下，并指定block块的大小1M：

hdfs dfs -D dfs.blocksize=1048576 -put test.txt /java22

-D   ----设置属性

```



### 3、eclipse插件安装配置

#### （1）、导入插件

> 将以下jar包放入eclipse的plugins文件夹中
>
> ​         hadoop-eclipse-plugin-2.6.0.jar

启动eclipse：出现界面如下：

![插件应用](https://wx1.sinaimg.cn/large/005zftzDgy1fz1uhqzg9oj30fe09nt9c.jpg)

#### （2）配置环境变量

**Eclipse**插件安装完后修改windows下的用户名，然后重启Eclipse：

**【注意：改成Windows下用户的用户名root（重启生效）或改Linux文件的用户】**

![环境变量](https://wx1.sinaimg.cn/large/005zftzDgy1fz1uk49nbrj30fe0770tj.jpg)

#### （3）新建Java项目

![](https://wx1.sinaimg.cn/large/005zftzDgy1fz1ut3z3r2j30et0ah0tw.jpg)



![](https://wx1.sinaimg.cn/large/005zftzDgy1g182idgjuuj30fe0a6my9.jpg)



![](https://wx1.sinaimg.cn/large/005zftzDgy1fz1utb5r5tj30fe0brgmt.jpg)



![](https://wx1.sinaimg.cn/large/005zftzDgy1fz1uw9a82yj30g508qmxh.jpg)

## 三、网盘

**1、代码编写**

**新建Java项目，导入所需要的jar包**

```
     hadoop中的share\hadoop\hdfs

     hadoop中的share\hadoop\hdfs\lib

     hadoop中的share\hadoop\common

     hadoop中的share\hadoop\common\lib下的jar包。

```

**block**底层—offset偏移量来读取字节数组

```java
private static void blk() throws Exception {
		Path ifile = new Path("");
		FileStatus file = fs.getFileStatus(ifile );
//      获取block的location信息HDFS分布式文件存储系统根据其偏移量的位置信息来读取其内容
		BlockLocation[] blk = fs.getFileBlockLocations(file,0, file.getLen());
		
		for (BlockLocation bb : blk) {
			System.out.println(bb);
		}
		FSDataInputStream input = fs.open(ifile);
		System.out.println((char)input.readByte());
		System.out.println((char)input.readByte());		
//		指定从哪个offset的位置偏移量来读
		input.seek(1048576);
		System.out.println((char)input.readByte());
		input.seek(1048576);
		System.out.println((char)input.readByte());
	}

```

**HDFS读取合并的小文件**