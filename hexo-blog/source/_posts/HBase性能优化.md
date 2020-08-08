---
title: HBase性能优化
date: 2019-1-17
tags:
  - HBase
categories: HDFS
grammar_cjkRuby: true
description: HBase性能优化的三种方案
abbrlink: 2220e2b4
---

## HBase性能优化方案

# （一）、表的设计

一、Pre-Creating Regions 预分区

详情参见：[Table Creation: Pre-Creating Regions](http://hbase.apache.org/book.html#precreate.regions)

<!-- more -->

> 解决海量导入数据时的热点问题

`背景：`

> 在创建HBase表的时候默认一张表只有一个region，
>
> 所有的put操作都会往这一个region中填充数据，
>
> 当这一个region过大时就会进行split。
>
> 如果在创建HBase的时候就进行预分区
>
> 则会减少当数据量猛增时由于region split带来的资源消耗。

`注意：`

> Hbase表的预分区需要紧密结合业务场景来选择分区的key值。
>
> 每个region都有一个startKey和一个endKey来表示该region存储的rowKey范围。

```
> create 't1', 'cf', SPLITS => ['20150501000000000', '20150515000000000', '20150601000000000'] 
```

或者

```
> create 't2', 'cf', SPLITS_FILE => '/home/hadoop/splitfile.txt' 

/home/hadoop/splitfile.txt中存储内容如下： 
20150501000000000
20150515000000000
20150601000000000

```

该语句会创建4个region：

Hbase的Web UI中可以查看到表的分区情况：

其中，**每个region的命名方式如下：[table],[region start key],[region id]**

![](https://wx1.sinaimg.cn/large/005zftzDly1g1hs6n9iroj30j404uwg2.jpg)

二、row key

1、特性

> * 在Hbase中 rowKey 可以是任意字符串，最大长度为64KB ， 一般为10—100bytes ,存储在bytes[ ]字节数组中，一般设计为定长。
>
> * rowKey是按字典排序
>
> * **Rowkey规则：**
>
>   1、 定长 越小越好
>
>   2、 Rowkey的设计是要根据实际业务来
>
>   3、 散列性
>
>   a)     反转   001  002  100 200
>
>   b)     Hash



2、HBase中row key用来检索表中的记录，支持以下三种方式：

> · 通过单个row key访问：即按照某个row key键值进行get操作；
>
> ·  通过row key的range进行scan：即通过设置startRowKey和endRowKey，在这个范围内进行扫描；过滤器
>
> ·  全表扫描：即直接扫描整张表中所有行记录。

三、column family

个数限定在2~3个

原因：

> 因为某个column family 在flush会，他临近的column family也会因关联效应被触发flush，最终导致系统会产生更多的I/O。

四、参数设置

> * In Memory
>
> 创建表时，HColumnDescriptor.setInMemory(true)将表放到RegionServer的缓存中，保证在读取的时候被cache命中。
>
> * Max Version
>
> 创建表时，HColumnDescriptor.setMaxVersions(int maxVersions)设置表中数据的最大版本，如果只需要保存最新版本的数据，那么可以设置setMaxVersions(1)。
>
> * Time To Live
>
> 创建表时，HColumnDescriptor.setTimeToLive(int timeToLive)设置表中数据的存储生命期，过期数据将自动被删除，例如如果只需要存储最近两天的数据，那么可以设置setTimeToLive(2 * 24 * 60 * 60)。

五、Compact & Split



六、高表和宽表的选择

资源链接：

<http://www.cnblogs.com/rocky24/p/3372ad2a037a73daf0ff4ed4a9f43625.html>

<https://yq.aliyun.com/articles/213705>

1、分类

Hbase表设计：

高表：行多列少；

宽表：行少列多。

2、根据KeyValue信息的筛选粒度，用户应尽量将需要查询的维度和信息存储在行键中，才能达到更好的数据筛选效率。

在Hbase中，数据操作具有行级原子性，按行分片。根据用户是否批量修改Value内容来决定高表和宽表的选择，宽表每一行存储的数据信息量多，易超过最大HFile的限制，若用户不存在全局value操作的需求，宽表比较适合。



# （二）、写表操作

一、多HTable客户端并发写

创建多个HTable客户端用于写操作，提高写数据的吞吐量。

```java
static final Configuration conf = HBaseConfiguration.create();
static final String table_log_name = “user_log”;
wTableLog = new HTable[tableN];
for (int i = 0; i < tableN; i++) {
    wTableLog[i] = new HTable(conf, table_log_name);
    wTableLog[i].setWriteBufferSize(5 * 1024 * 1024); //5MB
    wTableLog[i].setAutoFlush(false);

```

二、HTable参数设置

* Auto Flush

> 通过调用HTable.setAutoFlush(false)方法可以将HTable写客户端的自动flush关闭，这样可以批量写入数据到HBase，而不是有一条put就执行一次更新，只有当put填满客户端写缓存时，才实际向HBase服务端发起写请求。默认情况下auto flush是开启的

* Write Buffer

>

三、批量写

四、多线程并发写

# （三）、读表操作

一、多HTable客户端并发读

创建多个HTable客户端用于读操作，提高读数据的吞吐量。

```
static final Configuration conf = HBaseConfiguration.create();
static final String table_log_name = “user_log”;
rTableLog = new HTable[tableN];
for (int i = 0; i < tableN; i++) {
    rTableLog[i] = new HTable(conf, table_log_name);
    rTableLog[i].setScannerCaching(50);
}

```

二、HTable参数设置

三、批量读

四、多线程并发读

五、缓存查询结果

六、 Blockcache











