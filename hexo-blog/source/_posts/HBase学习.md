---
title: HBase学习
date: 2019-1-15
update: 2019-3-15
tags:
  - HBase
categories: HDFS
grammar_cjkRuby: true
description: 基于HDFS的数据仓库---三驾马车之一
abbrlink: c60ea7a7
---

非关系型数据库

[官网](https://cwiki.apache.org/confluence/display/Hive/HBaseIntegration)

## 一、对HBase数据库的 基本了解

<!-- more -->

### 1、简介

> 基于Hadoop 的分布式数据库
>
> 特点：
>
> 1、高可靠性
>
> 2、高性能
>
> （以上两点：基于分布式的特点）
>
> 3、面向列
>
> （以（K,V）存储，有唯一标记的rowkey，value包含的是数据库中的列值）
>
> 4、可伸缩
>
> （搭建在集群上）
>
> 5、实时读写
>
> （用时间戳唯一标记每一版本的数据记录）

### 2、工作结构

> 1,利用Hadoop的HDFS作为其文件存储系统
>
> 2,利用Hadoop的MapReduce来计算处理HBase中的海量数据
>
> 3,利用Zookeeper作为其分布式协同服务
>
> 4,主要用来存储非结构化和半结构化的松散数据（NoSQL非关系型数据库有redis、MongoDB等

### 3、关系型数据库

> 1、定义
>
> 关系模型指的就是二维表格模型；
>
> 而一个关系型数据库就是由二维表及其之间的联系所组成的一个数据组织
>
> 2、三大优点
>
> *  容易理解
> *  使用方便
> *  易于维护
>
> 3、三大瓶颈
>
> *  高并发读写需求
>
> 硬盘I/O是一个很大的瓶颈，并且很难能做到数据的强一致性。
>
> * 海量数据的读写性能低
>
> 在一张包含海量数据的表中查询，效率是非常低的。
>
> * ​    扩展性和可用性差
>
> 丰富的完整性使得横向扩展把难度加大了
>
>

`ACID特性`

> ACID，指数据库事务正确执行的四个基本要素的缩写;
>
> `原子性`（Atomicity）:**事务不可再分割**
>
> 整个事务中的所有操作，要么全部完成，要么全部不完成，不可能停滞在中间某个环节。事务在执行过程中发生错误，会被回滚（Rollback）到事务开始前的状态，就像这个事务从来没有执行过一样。
>
> `一致性`（Consistency）:**事务前后数据保持一致**
>
> 事务必须始终保持系统处于一致的状态，不管在任何给定的时间并发事务有多少。如果事务是并发多个，系统也必须如同串行事务一样操作。
>
> `隔离性`（Isolation）：**串行化**，使得同一时间仅有一个请求用于同一数据。
>
> 事务的隔离性是多个用户并发访问数据库时，数据库为每一个用户开启的事务，不能被其他事务的操作数据所干扰，多个并发事务之间要相互隔离。
>
> `持久性`（Durability）：
>
> 在事务完成以后，该事务对数据库所作的更改便持久的保存在数据库之中，并不会被回滚。

### 4、非关系型数据库

> 1、存储格式：key value键值对，文档，图片等等，结构不固定 
>
> 2、可以减少一些时间和空间的开销，仅需要根据id取出相应的value就可以完成查询。
>
> 3、一般不支持ACID特性，无需经过SQL解析，读写性能高
>
> 4、不提供where字段条件过滤
>
> 5、难以体现设计的完整性，只适合存储一些较为简单的数据

## 二、对HBase的基本里了解

### 1、数据结构组成

（ 1）Row key  :

> 唯一标记决定一行数据
> 按照字典排序
> 最大只能存储64KB的字节数据
> 设计非常关键

（2）Column Family列族 & qualifier列

> `列族`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            必须作为表模式(schema)定义的一部分预先给出，
>
> 表中的每个列都归属于某个列族；
>
> 权限控制、存储以及调优都是在列族层面进行的；
>
> `列名`
>
> 以列族作为前缀，每个“列族”都可以有多个列成员(column)； 
>
> 新的列可以随后按需、动态加入；

（3）Cell单元格

>  由行和列的坐标交叉决定； 单元格是有版本的（有时间戳决定）；
>
>  单元格的内容是未解析的字节数组；cell中的数据是没有类型的，全部是字节码形式存贮。
>
>  ```tex
>  由{rowkey， column( =<family> +<qualifier>)， version} 唯一确定的单元。
>  ```
>
>
>

（4）Timestamp时间戳

> 在HBase每个cell存储单元对同一份数据有多个版本，
>
> 根据唯一的时间戳来区分每个版本之间的差异，
>
> 不同版本的数据按照时间倒序排序，最新的数据版本排在最前面
>
> 时间戳的类型是64位整型。
>
> 时间戳可以由HBase(在数据写入时自动)赋值，精确到毫秒
>
> 时间戳也可以由客户显式赋值，但必须唯一性
>

（5）HLog(WAL log)

> *  HLog文件就是一个普通的Hadoop SequenceFile
> *  HLog Sequence File的Key是HLogKey对象
>     * HLogKey中记录了写入数据的归属信息，包括table和region名字，sequence number（起始值为0或是最近一次存入文件系统中sequence  number）和timestamp（写入时间）
> *  HLog SequeceFile的Value是HBase的KeyValue对象，即对应HFile中的KeyValue
>     *   存储hbase表的操作记录，(K，V)数据信息   
>

2、体系架构

![](https://wx1.sinaimg.cn/large/005zftzDly1g1gla9rm43j30lo0c3wjo.jpg)

（1）Client

> 包含访问HBase的接口并在缓存中维护着已经访问过的Region位置信息来加快对HBase的访问。

（2）Zookeeper

> * 保证任何时候，集群中只有一个master；
>
> * 存贮所有Region的寻址入口。
>
> * 实时监控Region server的上线和下线信息，并实时通知Master
>
> * 存储HBase的schema和table元数据

Zookeeper是一个很好的集群管理工具，被大量用于分布式计算，提供配置维护、域名服务、分布式同步、组服务等

（3）Master

> 为Region server分配region；
>
> * 负责Region server的负载均衡；
> * 发现失效的Region server并将其上的region重新分配；
> * 在Region分裂或合并后，负责重新调整Region的分布
> * 管理用户对table的增删改操作；

（4）RegionServer    

> * 维护region，处理对这些region的IO请求
>
> * 负责切分在运行过程中变得过大的region

（5）Region

> * 保存一个表里面某段连续的数据，每个表一开始只有一个region；
>
> * 随着数据不断插入表，region不断增大，当增大到一个阀值的时候，region就会等分会两个新的region（裂变）
>
>   （HBase自动把表水平划分成多个区域(region)）
>
> * 当table中的行不断增多，就会有越来越多的region。这样一张完整的表被保存在多个Regionserver上

（6）Memstore与storefile

> * 一个region由2-3store组成，一个store对应一个CF（列族）
> * store包括位于内存中的memstore和位于磁盘的storefile。
> * 写操作先写入memstore，当memstore中的数据达到某个阈值（默认64M），hregionserver会启动flashcache进程写入storefile，每次写入形成单独的一个storefile；
> * 当storefile文件的数量增长到一定阈值后，系统会进行合并（minor、major，compaction），在合并过程中会进行版本合并和删除工作（majar），形成更大的storefile
> * 当一个region所有storefile的大小和数量超过一定阈值后，会把当前的region分割为两个，并由hmaster分配到相应的regionserver服务器，实现负载均衡
> * 客户端检索数据，先在memstore找，找不到再找storefile
> * HRegion是HBase中分布式存储和负载均衡的最小单元。最小单元就表示不同的HRegion可以分布在不同的HRegion server上。
> * 每个Strore又由一个memStore和0至多个StoreFile组成,StoreFile以HFile格式保存在HDFS上(HFile)。



## 三、Hbase 安装部署

完全分布式搭建

1、安装包准备

[Hbase](http://hbase.apache.org/downloads.html)（本文使用0.98版本）

将tar上传至Linux系统，进行解压安装

2、修改配置文件hbase-env.sh（在Hbase的解压目录的conf目录中）

修添加JAVA_HOME环境变量

```
# The java implementation to use.  Java 1.7+ required.
# export JAVA_HOME=/usr/java/jdk1.6.0/
export JAVA_HOME=/usr/soft/jdk1.8.0_191
```

不使用HBase的默认zookeeper配置，（使用自己的）：

```
# Tell HBase whether it should manage it's own instance of Zookeeper or not.
 export HBASE_MANAGES_ZK=false

```

3、修改配置hbase-site.xml（在Hbase的解压目录的conf目录中）

```xml
<configuration>
<property>
<name>hbase.rootdir</name>
          <!--Hdfs配置时的集群名-->
<value>hdfs://Sukie:8020/hbase</value>
</property>
<property>
<name>hbase.cluster.distributed</name>
<value>true</value>
</property>
<property>
    <!--zookeeper的三台节点-->
<name>hbase.zookeeper.quorum</name>
<value>node1,node2,node3</value>
</property>
<property>
    <!--配置http访问的port--->
<name>hbase.master.info.port</name>
<value>60010</value>
</property>
</configuration>

```



`注意：（会出bug的地方）`：

1、问题描述：

> HBase启动时，警告： 
> Java HotSpot(TM) 64-Bit Server VM warning: ignoring option PermSize=128m; support was removed in 8.0 



解决方案：

`原因：`由于使用了JDK8 ，需要在HBase的配置文件中hbase-env.sh，注释掉两行。

```sh
# Configure PermSize. Only needed in JDK7. You can safely remove it for JDK8+
#export HBASE_MASTER_OPTS="$HBASE_MASTER_OPTS -XX:PermSize=128m -XX:MaxPermSize=128m -XX:ReservedCodeCacheSize=256m"
#export HBASE_REGIONSERVER_OPTS="$HBASE_REGIONSERVER_OPTS -XX:PermSize=128m -XX:MaxPermSize=128m -XX:ReservedCodeCacheSize=256m"
```

重新启动HBase。

2、问题描述：

> 配置好HBase后，各项服务正常，但想从浏览器通过端口60010看下节点情况，但是提示拒绝访问

`检测：`在服务器上netstat -natl|grep 60010 发现并没有60010端口

`原因：`HBase 1.0 之后的版本都需要在hbase-site.xml中配置端口，如下

```xml
<property>
    <name>hbase.master.info.port</name>
    <value>60010</value>
</property>
```

重新启动HBase,在浏览器再次访问，就ok了



4、添加配置regionservers 文件（在Hbase的解压目录的conf目录中）

添加配置的regionservers 的主机名

regionservers

```
node00
node01
node02  
```

5、添加配置backup-masters

添加配置的master备份的主机名（在Hbase的解压目录的conf目录中）

backup-masters

```
node02 
```

6、将Hadoop安装解压目录/etc/hadoop目录下的hdfs-site.xml文件 拷贝到Hbase的解压目录的conf目录中

7、配置环境变量 ~/.bash_profile

```sh
JAVA_HOME=/usr/soft/jdk1.8.0_191
export PATH=$PATH:$JAVA_HOME/bin
HADOOP_HOME=/usr/soft/hadoop-2.6.5
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
ZOOKEEPER_HOME=/usr/soft/zookeeper-3.4.13
export PATH=$PATH:$ZOOKEEPER_HOME/bin
HIVE_HOME=/usr/soft/apache-hive-1.2.1-bin
export PATH=$PATH:$HIVE_HOME/bin
SQOOP_HOME=/usr/soft/sqoop-1.4.6
export PATH=$PATH:$SQOOP_HOME/bin
HBASE_HOME=/usr/soft/hbase-1.2.9
export PATH=$PATH:$HBASE_HOME/bin

```

> source ~/.bash_profile
>

8、将如上配置远程发送至其他节点（Hbase 、 ./bash_profile）

9、各个节点注意要做时间同步

```shell
ntpdate cn.ntp.org.cn
```

10、启动HDFS集群：

```shell
zkServer.sh start
start-hdfs.sh
```

11、启动：

```shell
start-hbase.sh
```

显示：

```shell
starting master, logging to /usr/soft/hbase-1.2.9/bin/../logs/hbase-root-master-node00.out
node02: starting regionserver, logging to /usr/soft/hbase-1.2.9/bin/../logs/hbase-root-regionserver-node02.out
node01: starting regionserver, logging to /usr/soft/hbase-1.2.9/bin/../logs/hbase-root-regionserver-node01.out
node00: starting regionserver, logging to /usr/soft/hbase-1.2.9/bin/../logs/hbase-root-regionserver-node00.out
node02: starting master, logging to /usr/soft/hbase-1.2.9/bin/../logs/hbase-root-master-node02.out
```

12、查看进程：

```shell
jps
```

13、浏览器访问：node00:60010

14、关闭：

```shell
stop-hbase.sh
```



## 四、通过hbase shell命令进入HBase 命令行接口      

```shell
hbase shell
```

进入hbase交互式界面。

通过`help`可查看所有命令的支持以及帮助手册

> 帮助创建
>
> hbase(main):007:0>  help create

|             名称             | Shell命令                                                    | 举例                                                         |
| :--------------------------: | ------------------------------------------------------------ | ------------------------------------------------------------ |
|            创建表            | create '表名', '列族名1'[,…]                                 | create ‘t1’，‘cf1’                                           |
|          列出所有表          | list                                                         | list                                                         |
|           添加记录           | put '表名', 'RowKey', '列族名称:列名', '值'                  | put        ‘t1’,‘rk_00101’,‘cf1:name’,‘zs’                   |
|           查看记录           | get '表名', 'RowKey', '列族名称:列名'                        | get ‘t1’,‘rk_00101’                         get ‘t1’,‘rk_00101’,‘cf1:name’ |
|         查看所有记录         | count  '表名'                                                | count ‘t1’                                                   |
|           删除记录           | delete  '表名'   , 'RowKey',   '列族名称:列名'               | delete ‘t1’,‘rk_00101’,‘cf1:name’                            |
|          删除一张表          | 先要屏蔽该表，才能对该表进行删除。 <br />第一步 disable   '表名称' <br />第二步 drop   '表名称' | disable ‘t1’                                                      drop ‘t1’ |
|         查看所有记录         | scan   '表名 '                                               | scan ‘t1’                                                    |
|                              | create 't2', {NAME => 'cf1', VERSIONS => 2}, METADATA => { 'mykey' => 'myvalue' } |                                                              |
| 查看未加工数据中指定版本记录 | scan 't1', {RAW => true, VERSIONS => 3}                           raw  未加工的 | 3                                                            |
|       查看保存版本记录       | scan 't1', {VERSIONS => 2}                                   | 2                                                            |
|                              | ctrl + enter                                                 |                                                              |

## 五、HBase优化

`详见HBase性能优化文档`



## 六、Hive和Hbase的整合

hive和hbase同步
https://cwiki.apache.org/confluence/display/Hive/HBaseIntegration

### 1、拷贝jar包

把hive-hbase-handler-1.2.1.jar  cp到hbase/lib 下
​	同时把hbase中的所有的jar，cp到hive/lib

`注意`：

> hive-hbase-handler-1.2.1.jar在Hive的lib目录下

### 2、在hive的配置文件增加属性：

```xml
  <property>
    <name>hbase.zookeeper.quorum</name>
    <value>node01,node02,node03</value>
  </property>
```



### 3、在hive中创建临时表

```sql
(注意：需要先在Hbase中创建t_order表，列族为order：create 't_order' 'order')
CREATE EXTERNAL TABLE tmp_tbl(
    key string, 
    id string, 
    user_id string)  
STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler'  
WITH SERDEPROPERTIES ("hbase.columns.mapping" = ":key,order:order_id,order:user_id")  
TBLPROPERTIES ("hbase.table.name" = "t_tbl"，"hbase.mapred.output.outputtable" = "t_tbl");

（确保xyz没有在Hbase中存在）
CREATE TABLE hbasetbl(
    key int, 
    name string, 
    age string
) 
STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler'
WITH SERDEPROPERTIES ("hbase.columns.mapping" = ":key,cf1:name,cf1:age")
TBLPROPERTIES ("hbase.table.name" = "xyz", "hbase.mapred.output.outputtable" = "xyz");
```

```sql
案例：
hbase-hive
CREATE EXTERNAL TABLE `srv_mid_analysis_order`(
  `rowkey` string, 
  `user_id` string, 
  `order_id` string, 
  `order_price` bigint, 
  `order_status` string, 
  `pay_type` string, 
  `promoter_id` string, 
  `channel` string, 
  `completed` string, 
  `created` string,
  `accounting_day` string)
ROW FORMAT SERDE 
  'org.apache.hadoop.hive.hbase.HBaseSerDe' 
STORED BY 
  'org.apache.hadoop.hive.hbase.HBaseStorageHandler' 
WITH SERDEPROPERTIES ( 
  'hbase.columns.mapping'=':key,attr:user_id#b,attr:order_id#b,attr:order_price,attr:order_status#b,attr:pay_type#b,attr:promoter_id#b,attr:channel#b,attr:completed#b,attr:created#b,attr:accounting_day#b', 
  'serialization.format'='1')
TBLPROPERTIES (
  'hbase.table.name'='aries:srv_mid_analysis_order',
  'hbase.mapred.output.outputtable' = 'aries:srv_mid_analysis_order')

hbase:
创建命名空间：
create_namespace 'aries'

:创建表
create 'aries:srv_mid_analysis_order','attr'


:删除表
disable 'srv_mid_analysis_order'
drop  'srv_mid_analysis_order'

:上传数据
put 'ns1:t1', 'r1', 'c1', 'value'
5e4d5c9938796a0f00ed01b2,5e007fda8430d96242a8578d,299641451,500,completed,alipay,200000069,Samsung,2020/2/20 0:04,2020/2/20 0:04,20200220 

put 'aries:srv_mid_analysis_order','5e4d5c9938796a0f00ed01b2','attr:user_id','5e007fda8430d96242a8578d'
put 'aries:srv_mid_analysis_order','5e4d5c9938796a0f00ed01b2','attr:order_id','299641451'
put 'aries:srv_mid_analysis_order','5e4d5c9938796a0f00ed01b2','attr:order_price','100'
put 'aries:srv_mid_analysis_order','5e4d5c9938796a0f00ed01b2','attr:order_status','completed'
put 'aries:srv_mid_analysis_order','5e4d5c9938796a0f00ed01b2','attr:pay_type','alipay'
put 'aries:srv_mid_analysis_order','5e4d5c9938796a0f00ed01b2','attr:promoter_id','200000069'
put 'aries:srv_mid_analysis_order','5e4d5c9938796a0f00ed01b2','attr:channel','Samsung'
put 'aries:srv_mid_analysis_order','5e4d5c9938796a0f00ed01b2','attr:completed','2020/2/20 0:04'
put 'aries:srv_mid_analysis_order','5e4d5c9938796a0f00ed01b2','attr:created','2020/2/20 0:04'
put 'aries:srv_mid_analysis_order','5e4d5c9938796a0f00ed01b2','attr:accounting_day','20200220'

:获取数据
get 't1', 'r1'                      
get 'aries:srv_mid_analysis_order','5e4d5c9938796a0f00ed01b2'
```



# DDL

## Here is some help for this command:

```shell
Creates a table.
 Pass a table name, and a set of column family specifications (at least one), and, optionally, table configuration.Column specification can be a simple string (name), or a dictionary(dictionaries are described below in main help output), necessarily including NAME attribute. 
Examples:

Create a table with namespace=ns1 and table qualifier=t1
  hbase> create 'ns1:t1', {NAME => 'f1', VERSIONS => 5}

Create a table with namespace=default and table qualifier=t1
  hbase> create 't1', {NAME => 'f1'}, {NAME => 'f2'}, {NAME => 'f3'}
  hbase> # The above in shorthand would be the following:
  hbase> create 't1', 'f1', 'f2', 'f3'
  hbase> create 't1', {NAME => 'f1', VERSIONS => 1, TTL => 2592000, BLOCKCACHE => true}
  hbase> create 't1', {NAME => 'f1', CONFIGURATION => {'hbase.hstore.blockingStoreFiles' => '10'}}
  
Table configuration options can be put at the end.
Examples:

  hbase> create 'ns1:t1', 'f1', SPLITS => ['10', '20', '30', '40']
  hbase> create 't1', 'f1', SPLITS => ['10', '20', '30', '40']
  hbase> create 't1', 'f1', SPLITS_FILE => 'splits.txt', OWNER => 'johndoe'
  hbase> create 't1', {NAME => 'f1', VERSIONS => 5}, METADATA => { 'mykey' => 'myvalue' }
  hbase> # Optionally pre-split the table into NUMREGIONS, using
  hbase> # SPLITALGO ("HexStringSplit", "UniformSplit" or classname)
  hbase> create 't1', 'f1', {NUMREGIONS => 15, SPLITALGO => 'HexStringSplit'}
  hbase> create 't1', 'f1', {NUMREGIONS => 15, SPLITALGO => 'HexStringSplit', CONFIGURATION => {'hbase.hregion.scan.loadColumnFamiliesOnDemand' => 'true'}}

You can also keep around a reference to the created table:

  hbase> t1 = create 't1', 'f1'

Which gives you a reference to the table named 't1', on which you can then call methods.

```

> HBase Shell, version 0.98.12.1-hadoop2, rb00ec5da604d64a0bdc7d92452b1e0559f0f5d73, Sun May 17 12:55:03 PDT 2015
>
> Type 'help "COMMAND"', 
>
> (e.g. 'help "get"' -- the quotes are necessary) for help on a specific command.
> Commands are grouped. 
>
> Type 'help "COMMAND_GROUP"', 
>
> (e.g. 'help "general"') for help on a command group.

```shell

COMMAND GROUPS:
  Group name: general
  Commands: status, table_help, version, whoami

  Group name: ddl
  Commands: alter, alter_async, alter_status, create, describe, disable, disable_all, drop, drop_all, enable, enable_all, exists, get_table, is_disabled, is_enabled, list, show_filters

  Group name: namespace
  Commands: alter_namespace, create_namespace, describe_namespace, drop_namespace, list_namespace, list_namespace_tables

  Group name: dml
  Commands: append, count, delete, deleteall, get, get_counter, get_splits, incr, put, scan, truncate, truncate_preserve

  Group name: tools
  Commands: assign, balance_switch, balancer, catalogjanitor_enabled, catalogjanitor_run, catalogjanitor_switch, close_region, compact, compact_rs, flush, hlog_roll, major_compact, merge_region, move, split, trace, unassign, zk_dump

  Group name: replication
  Commands: add_peer, disable_peer, disable_table_replication, enable_peer, enable_table_replication, list_peers, list_replicated_tables, remove_peer, set_peer_tableCFs, show_peer_tableCFs

  Group name: snapshots
  Commands: clone_snapshot, delete_all_snapshot, delete_snapshot, list_snapshots, restore_snapshot, snapshot

  Group name: security
  Commands: grant, revoke, user_permission

  Group name: visibility labels
  Commands: add_labels, clear_auths, get_auths, list_labels, set_auths, set_visibility

```





```
SHELL USAGE:
Quote all names in HBase Shell such as table and column names.  Commas delimit command parameters.  Type <RETURN> after entering a command to run it.
Dictionaries of configuration used in the creation and alteration of tables are Ruby Hashes. They look like this:

  {'key1' => 'value1', 'key2' => 'value2', ...}

and are opened and closed with curley-braces.  Key/values are delimited by the '=>' character combination.  Usually keys are predefined constants such as NAME, VERSIONS, COMPRESSION, etc.  Constants do not need to be quoted.  Type 'Object.constants' to see a (messy) list of all constants in the environment.

If you are using binary keys or values and need to enter them in the shell, use double-quote'd hexadecimal representation. For example:

  hbase> get 't1', "key\x03\x3f\xcd"
  hbase> get 't1', "key\003\023\011"
  hbase> put 't1', "test\xef\xff", 'f1:', "\x01\x33\x40"

The HBase shell is the (J)Ruby IRB with the above HBase-specific commands added. For more on the HBase Shell, see http://hbase.apache.org/book.html


```



```
Here is some help for this command:
Put a delete cell value at specified table/row/column and optionally
timestamp coordinates.  Deletes must match the deleted cell's
coordinates exactly.  When scanning, a delete cell suppresses older
versions. To delete a cell from  't1' at row 'r1' under column 'c1'
marked with the time 'ts1', do:

  hbase> delete 'ns1:t1', 'r1', 'c1', ts1
  hbase> delete 't1', 'r1', 'c1', ts1
  hbase> delete 't1', 'r1', 'c1', ts1, {VISIBILITY=>'PRIVATE|SECRET'}

The same command can also be run on a table reference. Suppose you had a reference
t to table 't1', the corresponding command would be:

  hbase> t.delete 'r1', 'c1',  ts1
  hbase> t.delete 'r1', 'c1',  ts1, {VISIBILITY=>'PRIVATE|SECRET'}

```

