---
title: Hive优化
date: 2019-1-12
update: 2019-1-13
tags:
  - Hive
categories: HDFS
grammar_cjkRuby: true
description: hive优化的基本掌握
abbrlink: 2cf3653f
---



## 一、核心思想：

> 把Hive SQL 当做MapReduce程序进行优化

`注意：`以下不能HQL转化为Mapreduce任务运行

---select 仅查询本表字段

---where 仅对本表字段做条件过滤

```sql
--比如
select * from table；
```

<!-- more -->

## 二、explain

> 用以显示任务执行计划
>
> 格式：
>
> EXPLAIN [EXTENDED|DEPENDENCY|AUTHORIZATION] query
>

`语法解释`

> 从语法组成可以看出来是一个“explain ”+三个可选参数+查询语句。大家可以积极尝试一下，后面两个显示内容很简单的，我介绍一下第一个 extended 这个可以显示hql语句的语法树
>
> 其次，执行计划一共有三个部分：
>
> * 这个语句的抽象语法树
> * 这个计划不同阶段之间的依赖关系
>
> * 对于每个阶段的详细描述

`例子：`

> ```sql
> hive> explain select * from log;
> ```

`拓展`课下查询MySQl的执行计划。



## 三、Hive运行方式

### 集群模式：

```sql
执行hql：
hive> select count(*) from log;
```

`结论：`

> 函数（如count）是在reduce阶段进行
> 默认提交到yarn所在的节点上运行，

------

### 优化一:

设置  本地模式（运行速度加快。但对加载文件有限制）

```sql
hive>set hive.exec.mode.local.auto=true;

查看：
hive>set hive.exec.mode.local.auto
```

`但是`如果加载文件的最大值大于配置（默认配置为100M），仍会使用集群模式运行（在yarn所在的节点）

```sql
查看最大加载文件
hive> set hive.exec.mode.local.auto.inputbytes.max;

显示：
hive.exec.mode.local.auto.inputbytes.max=134217728
```

------

### 优化二：

设置 严格模式:

```sql
通过设置以下参数开启严格模式[防止误操作]：
hive> set hive.mapred.mode=strict;
（默认为：nonstrict非严格模式）
```

`但是`存在查询限制:

​          可以防止用户执行那些可能产生不好的效果的查询。即某些查询在严格模式下无法执行。

> 1、对分区表查询时，必须添加where对于分区字段的条件过滤；
>
> 就是用户不允许扫描所有的分区。进行这个限制的原因是，通常分区表都拥有非常大的数据集，而且数据增加迅速。如果没有进行分区限制的查询可能会消耗令人不可接受的巨大资源来处理这个表
>
> ```sql
> hive> select * from day_table where dt='2019-01-13';
> ```
>
> 2、order by语句必须包含limit输出限制；
>
> 因为orderby为了执行排序过程会讲所有的结果分发到同一个reducer中进行处理，强烈要求用户增加这个limit语句可以防止reducer额外执行很长一段时间。
>
> ```sql
> hive> select * from log order by id limit 1;
> 这里的1， 表示显示前多少条记录，只能设一个数字
> 和Mysql（可以从0 开始）不同的是，它只能从1开始
> mysql可以有两个数字，表示从第几条开始，显示几条
> ```
>
> 3、限制执行笛卡尔积的查询；
>
> 因为在关系型数据库中，可以使用where充当on，但是在hive数据仓库中，必须使用on，否则，查询会出此案不可控的情况。

![imit](https://wx1.sinaimg.cn/large/005zftzDgy1fzhry9ni0xj30m10cjdgp.jpg)

### 优化三：

设置并行计算:

```sql
--通过设置一下参数设置并行模式
set hive.exec.parallel=true
--通过以下设置一次SQL计算中允许并行执行的job个数的最大值
set hive.exec.parallel.thread.number
```



执行sql：

```sql
select t1.cf1,t2.cf2 from
(select count(id) as cf1 from table) t1,
(select count(id) as cf2 from table) t2;
```



## 四、Hive排序

### 1、Order By 

--- 对于查询结果做`全局`排序，只允许有`一个`reduce处理
（当数据量较大时，reduce数量有限，应慎用。

​     严格模式下，必须结合limit来使用）

```sql
select * from log order by id limit 9;    （结果有序）
```

显示：

> Time taken: 102.065 seconds, Fetched: 7 row(s)



### 2、Sort By 

-- 对于`单个`reduce的数据进行排序

--局部（单个reduce）有序，全局无序

```
可以通过设置mapred.reduce.tasks的值来控制reduce的数，然后对reduce输出的结果做二次排序
```

`案例`

```sql
select * from log sort by id;       (结果无序)
```

`显示`

> Time taken: 147.077 seconds, Fetched: 7 row(s)

### 3、Distribute By 

-- 分区排序，经常和 Sort By 结合使用 全局有序，局部无序

```sql
select * from log distribute by id;     （结果无序）
```

> Time taken: 144.708 seconds, Fetched: 7 row(s)



`注意：`hive要求DISTRIBUTE BY语句出现在SORT BY语句之前

> Distribute By可以将Map阶段输出的数据按指定的字段划分到不同的reduce文件中，然后，sort by 对reduce阶段的输出数据做排序。

情况一、(无序)

```sql
select * from table distrubute by class  sort by acore;
```

情况二、（？？）

```sql
select * from (select * from log distribute by id ) t2 sort by t2.id asc;   
```

### 4、Cluster By

-- 相当于 Sort By + Distribute By
（Cluster By不能通过asc、desc的方式指定排序规则；
可通过 distribute by column sort by column asc|desc 的方式）



```sql
select a.* from (select * from log cluster by id ) a order by a.id limit 9 ; (结果有序)

9 在这里是表中数据记录的总条数
```

显示：

>  Time taken: 234.593 seconds, Fetched: 7 row(s)

```sql
select * from (select * from log cluster by id) a； 
```



## 五、==Hive Join  （重难点）==

### 1、Join 连接时，将小表（驱动表）放在join的左边

### 2、Map Join ：

> 因为Map Join 是在Map端且在内存中进行的，所以不需要启动Reduce任务，也没有shuffle阶段，从而在一定程度上节省资源，提高Join效率。

###     方式：（两种）

####      1、SQL方式：

​     在HQl语句中添加MapJoin标记（mapjoin）(将小表加入到内存，注意小表的大小)

​     语法：

```sql
SELECT /*+ MAPJOIN(smallTable) */  smallTable.key,  bigTable.value 
              FROM  smallTable  JOIN  bigTable  ON  smallTable.key  = bigTable.key;
```

`案例：`

```sql
SELECT /*+ MAPJOIN(log1) */  log.id,log1.name 
             FROM  log  JOIN  log1  ON  log.id  = log1.id;
```



####     2、自动的MapJoin

​           通过修改以下配置启用自动的mapjoin：

```sql
hive> set hive.auto.convert.join = true;
```

​    （  该参数为true时，Hive自动对左边的表统计数据量，如果是小表就加入内存，即对小表使用Map join）

其他相关配置参数：

```sql
hive> set hive.mapjoin.smalltable.filesize;  
```

（默认：大表小表判断的阈值25MB左右，如果表的大小小于该值则会被加载到内存中运行，可自定义）

```sql
hive> set hive.ignore.mapjoin.hint;
```

（默认值：true；是否忽略mapjoin hint 即mapjoin标记；如果为false，这则需要添加-MapJoin标记，mapjoin（smalltable））

```sql
hive> set hive.auto.convert.join.noconditionaltask;
```

（默认值：true；将普通的join转化为普通的mapjoin时，是否将多个mapjoin转化为一个mapjoin）

```sql
hive> set hive.auto.convert.join.noconditionaltask.size;
```

（默认：10M；将多个mapjoin转化为一个mapjoin时，其表的最大值为10M，可自定义）



## 六、Map-Side聚合  

> 相当于聚合函数：count（）

设置参数，开启在Map端的聚合(相当于combiner)

```sql
set hive.map.aggr=true;
```

相关配置参数：

```sql
set hive.groupby.mapaggr.checkinterval；
```

（默认为：100000，表示 map端group by执行聚合时处理的多少行数据）

```sql
set hive.map.aggr.hash.min.reduction；
```

（默认为：0.5，进行聚合的最小比例，预先取100000条数据聚合,如果聚合后的条数/100000>0.5，则不再聚合）

```sql
set hive.map.aggr.hash.percentmemory;
```

（默认： 0.5 ，map端聚合使用的内存的最大值）

```sql
set hive.map.aggr.hash.force.flush.memory.threshold;
```
（默认为：0.9，map端做聚合操作是hash表的最大可用内容，大于该值则会触发flush

```sql
set hive.groupby.skewindata；
```


（默认为：false，是否对GroupBy产生的数据倾斜做优化）

`附加：`

> * 数据倾斜问题解决：多种方式（使用MapJoin、使用MapSide）

`参考`

http://www.sohu.com/a/224276626_543508



## 七、控制Hive中Map和Reduce的数量

### 1、Map数量相关的参数

```sql
set mapred.max.split.size;
```

（默认为：256M，一个split的最大值，即每个map处理文件的最大值）

```sql
set mapred.min.split.size.per.node;
```

(一个节点上最小split数：1个)

```sql
set mapred.min.split.size.per.rack;
```

(一个机架上最小split数：1个)



### 2、Reduce数量相关的参数

```sql
set mapred.reduce.tasks;
```

(默认为：-1，强制指定reduce任务的数量。-1，是未定义，不发挥作用。如果指定了，就会按指定的数量执行)

```sql
set hive.exec.reducers.bytes.per.reducer;
```

（默认为：256M ，每个reduce任务处理的数据量）

```sql
set hive.exec.reducers.max;
```

（默认为：1009个，每个任务最大的reduce数 [Map数量 >= Reduce数量 ]）



## 八、Hive - JVM重用

`适用场景：`
1、小文件个数过多
2、task个数过多

`原理：`

hadoop默认配置是使用派生JVM来执行map和reduce任务的，JVM重用可以使得JVM实例在同一个JOB中重新使用N次

```sql
set mapred.job.reuse.jvm.num.tasks; 
```

(默认是1，表示一个JVM上最多可以顺序执行的task数目（属于同一个Job）是1。也就是说一个task启一个JVM)


`缺点：`

设置开启之后，task插槽会一直占用资源，不论是否有task运行，
直到所有的task即整个job全部执行完成时，才会释放所有的task插槽资源！