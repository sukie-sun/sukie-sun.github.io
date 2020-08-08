---
title: MapReduce学习
date: 2019-1-5
tags:
  - MapReduce
categories: HDFS
grammar_cjkRuby: true
description: 基于HDFS的计算框架----大数据三驾马车之一
abbrlink: b5155984
---

## 一、MapReduce是什么

1、概念

MapReduce是一种`分布式离线计算框架`，是一种编程模型，用于在分布式系统上大规模数据集(大于1TB)的并行运算。

分布式编程：

> 借助一个集群，通过多台机器去并行处理大规模数据集，从而获得海量计算能力。

2、理解

`Map`(映射)

`Reduce`(归约)

> 指定一个Map(映射)函数，用来把一组键值对映射成一组新的键值对，指定并发的Reduce(归约)函数，用来保证所有映射的键值对中的每一个共享相同的键组。
>

## 二、MapReduce设计理念

1、分布式计算

> 分布式计算将该应用分解成许多小的部分，分配给多台计算机节点进行处理。这样可以节约整体计算时间，大大提高计算效率。

**分而治之**策略：

> 一个存储在分布式文件系统中的大规模数据集，
>
> 会被切分成许多独立的分片（split），
>
> 这些分片可以被
>
> 多个Map任务并行处理

2、移动计算，而非移动数据

> 将计算程序应用移动到具有数据的集群计算机节点之上进行计算操作；
>
> 将有用、准确、及时的信息提供给任何时间、任何地点的任何客户。

3、Master/Slave架构

> 包括一个Master和若干个Slave。
> Master上运行JobTracker，Slave上运行TaskTracker

## 三、MapReduce计算框架的组成

![](https://wx1.sinaimg.cn/large/005zftzDgy1fz6guaswsqj30fd06pwgh.jpg)

![MR](https://wx1.sinaimg.cn/large/005zftzDgy1fz6hucmi5pj30v90exn7e.jpg)

1、 Mapper负责“**分**”，即把得到的复杂的任务分解为若干个“简单的任务”执行。

​        “简单的任务”：

* 数据或计算规模相对于原任务要大大缩小；

* 就近计算，即会被分配到存放了所需数据的节点进行计算；
* 每个map任务之间可以并行计算，不产生任何通信。

![split](https://wx1.sinaimg.cn/large/005zftzDgy1fz6hw158klj30f308eq7e.jpg)

2、Split规则：（取三者的中间值）

–  max.split(100M)

–  min.split(10M)

–  block(64M)

**max(min.split,min(max.split,block))**

**split实际大小=block大小**（2.X：128M）

Map的数目通常是由输入数据的大小决定的，一般就是所有输入文件的总块（block）数

![](https://wx1.sinaimg.cn/large/005zftzDgy1fz6hz81714j30ea07vmzd.jpg)

3、Reduce详解（总·重要）

–  Reduce的任务是对map阶段的结果进行“**汇总**”并输出。

Reducer的数目由mapred-site.xml配置文件里的项目mapred.reduce.tasks决定。缺省值为1，用户可自定义。

![](https://wx1.sinaimg.cn/large/005zftzDgy1fz6i3l3zo1j30fe09mq62.jpg)

4、Shuffle详解（总·核心）

– 在mapper和reducer中间的一个步骤

   可以把mapper的输出按照某种key值重新切分和组合成n份，把key值符合某种范围的输出送到特定的reducer那里去处理。

–  可以简化reducer过程

Partitoner ： hash(key) mod R



## 四、MapReduce架构

### 1、非共享式架构

每个节点都有自己的内存，容错性比较好。

### 2、一主多从架构

可扩展性好，硬件要求易达到。

–  主 JobTracker:（ResourceManager资源管理）

> 负责调度分配每一个子任务task运行于TaskTracker上，
>
> 如果发现有失败的task就重新分配其任务到其他节点。
>
> 每一个hadoop集群中只一个 JobTracker, 一般它运行在Master节点上。

–  从TaskTracker:（NodeManager）

> TaskTracker主动与JobTracker通信，接收作业，并负责直接执行每一个任务，
>
> 为了减少网络带宽TaskTracker最好运行在HDFS的DataNode上。

# MapReduce的体系结构

MapReduce主要有以下4个部分组成

```
1 ）Client
•用户编写的MapReduce程序通过Client提交到JobTracker端
•用户可通过Client提供的一些接口查看作业运行状态
2 ）JobTracker
•JobTracker负责资源监控和作业调度
•JobTracker 监控所有TaskTracker与Job的健康状况，一旦发现失败，就将相应的任务转移到其他节点
•JobTracker 会跟踪任务的执行进度、资源使用量等信息，并将这些信息告诉任务调度器
（TaskScheduler），而调度器会在资源出现空闲时，选择合适的任务去使用这些资源
3 ）TaskTracker
•TaskTracker 会周期性地通过“心跳”将本节点上资源的使用情况和任务的运行进度汇报
给JobTracker，同时接收JobTracker 发送过来的命令并执行相应的操作（如启动新任务、
杀死任务等）
•TaskTracker 使用“slot”等量划分本节点上的资源量（CPU、内存等）。一个Task 获取到
一个slot 后才有机会运行，而Hadoop调度器的作用就是将各个TaskTracker上的空闲slot分
配给Task使用。slot 分为Map slot 和Reduce slot 两种，分别供MapTask和Reduce Task使用
（所以最好放在DataNode上）
4 ）Task
Task 分为Map Task 和Reduce Task 两种，均由TaskTracker 启动


```



![](https://wx1.sinaimg.cn/large/005zftzDgy1fz6i591yd9j30tp0fqq4x.jpg)





![](https://wx1.sinaimg.cn/large/005zftzDgy1fz6ivspvrcj30y50dujum.jpg)



## 五、MapReduce搭建

### 1、节点分布情况

|        |  NN  |  DN  |  JN  |  ZK  | ZKFC |  RM  |  NM  |
| :----: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| node00 |  √   |  √   |  √   |  √   |  √   |      |  √   |
| node01 |  √   |  √   |  √   |  √   |  √   |  √   |  √   |
| node02 |      |  √   |  √   |  √   |      |  √   |  √   |

### 2、配置文件

![](https://wx1.sinaimg.cn/large/005zftzDgy1fz6j2l1t72j30fe0begoy.jpg)

修改配置文件

备用resourcemanager。

文件：masters

```
node2
```

(1)**mapred-site.xml:**（配置mapreudce需要的框架环境）

路径：F:\hadoop-2.6.5\etc\hadoop\mapred-site.xml



```xml
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
</configuration>

```

（2）**yarn-site.xml:**（配置yarn的任务调度的计算框架）

```xml
<configuration>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
</configuration>

```

因为**ResourceManager** **和NodeManager**主从结构，RM存在单点故障，要对它做HA（通过ZK）

修改yarn-site.xml配置文件,完整的内容如下：

```xml
 <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
<property>
   <name>yarn.resourcemanager.ha.enabled</name>
   <value>true</value>
 </property>
 <property>
   <name>yarn.resourcemanager.cluster-id</name>
   <value>Sukie</value>
 </property>
 <property>
   <name>yarn.resourcemanager.ha.rm-ids</name>
   <value>rm1,rm2</value>
 </property>
 <property>
   <name>yarn.resourcemanager.hostname.rm1</name>
   <value>node2</value>
 </property>
 <property>
   <name>yarn.resourcemanager.hostname.rm2</name>
   <value>node3</value>
 </property>
 <property>
   <name>yarn.resourcemanager.zk-address</name>
   <value>node1:2181,node2:2181,node3:2181</value>
 </property>

```

## 六、个人理解

> 基于源码，对mapreduce的工作流程的描述：

```
一个应用程序要进行大规模数据处理分析

数据文件保存在HDFS中，分块存储在分布式节点上

首先是将数据文件切分成许多split切片

每一个split切片单独启动一个map任务，所以会启动多个map任务

map阶段的输入是诸多(key,value),输出是新的（key,value）,然后被拉去到不同的reduce上并行处理操作

所以每个map的输出阶段都执行分区操作，并决定reduce任务的个数

然后对map输出结果进行分区、排序、归并、合并，这个过程叫map阶段的shuffle

shuffle结束后，将相应的结果分发给reduce，让reduce完成后续的工作 

结束后，将结果输出给HDFS。

不同的map之间并行计算，不会通信；不同的reduce也不会通信，整个过程对用户透明。
```



![shuffle](https://wx1.sinaimg.cn/large/005zftzDgy1fz6zgfpvqnj30tw0fxace.jpg)

> MapReduce执行的各个阶段：

```
1、从HDFS中加载文件，加载读取由InputFormat模块来完成，对输入负责格式验证，同时，对数据进行逻辑上切分成split

2、由record read具体根据分片的位置长度信息去找各个block，以（key，value）输出，作为map的输入，

3、map中有用户自定义的map函数就可以进行相应的数据处理，并输出一堆（key，value），作为中间结果

4、之后，是shuffle（洗牌）过程对这中间结果进行分区、排序、合并，并溢写到磁盘，

5、相应的reduce任务就会来fetch对应的分区（key，value-list）

6、reduce中有用户自定义的reduce函数就可以完成对数据的分析，结果以新的（key，value）输出

7、输出结果借助OutputFormat模块对输出格式进行检查，以及相关目录是否存在等，最后写入到HDFS中。
```

![split](https://wx1.sinaimg.cn/large/005zftzDgy1fz6zikp8mbj30vh0fldle.jpg)

> 关于split的切分的理解：

```
1、InputFormat将大的数据文件分成很多split
2、文件在HDFS中是以很多个物理块block分布式存储不同的节点上
3、切片是用户自定义的逻辑分片
4、split的数量决定map任务的数量
5、切片过多会导致map任务启动过多，map任务之间切换的时候就会耗费相关的管理资源，所以切片过多会影响执行效率
6、 切片过少又会影响任务执行的并行度，所以理想情况用block块的大小作为切片的大小。

```



![](https://wx1.sinaimg.cn/large/005zftzDgy1fz6ztmqg0oj30s00dg42p.jpg)



![](https://wx1.sinaimg.cn/large/005zftzDgy1fz85ufnyj9j30ud0b3mz0.jpg)



> 关于shuffle的理解

```
map端shuffle
1、从HDFS输入数据和执行map任务，在map任务执行之前，RecordReader阅读器还将数据变成满足Map函数所需的（K，V）形式，然后InputFormat会将其切分成若干切片（一堆（K，V））。
2、每个切片会分配一个map任务，每个map任务会分配一个默认的缓存，一般默认缓存为100M.map的输出键值对作为中间结果先写入到缓存（直接写入磁盘会增加寻址开销，所以集中写入磁盘一次寻址就可以完成批量写入，就可以将寻址开销分摊到大量数据中，这就是缓存的作用）。
3、当写入的内容达到缓存空间的一定比例后（溢写比，一般为0.8，就是80M的时候，为了不影响map任务的继续执行），会启动溢写进程，把缓存中相关数据写入磁盘。
4、在溢写过程中，会执行分区（partition）、排序（sort，按照key值）和可能的合并（combine，为了减少溢写到磁盘的数据量，慎用）操作，写入磁盘，生成磁盘的溢写文件。
5、在map任务运行结束前，系统会对溢写文件进行归并（merge），形成大文件（里面的键值对是分区，排序的）,文件格式为（key,value<list>），归并时如果溢写文件大于预定值（默认为3），会再次合并


reduce端shuffle
1、reduce任务会询问JobTracker，去拉取map机器上的属于自己的分区，对来自不同机器的数据进行归并、合并，然后输入到reduce函数中进行数据的处理分析，再写入磁盘
```



![](https://wx1.sinaimg.cn/large/005zftzDgy1fz87b2w9k0j30vg0fijvo.jpg)



![](https://wx1.sinaimg.cn/large/005zftzDgy1fz87chuik1j30y50g00wu.jpg)



我

# MapReduce应用程序执行过程

![](https://wx1.sinaimg.cn/large/005zftzDgy1fz87d53czuj30vp0fltap.jpg)