---
title: Hive学习
date: 2019-1-11
tags:
  - Hive
categories: HDFS
grammar_cjkRuby: true
description: 用于数据分析、统计的数据仓库
top: true
abbrlink: c692ba22
---

## 一、Hive是什么？

### 1、基于 Hadoop 的一个`数据仓库工具`

* 可以将`结构化`的数据文件映射为一张`hive数据库表`；
* 这张Hive数据库表保存不了metadata元数据信息，而是将metadata存储在本地磁盘上的MySQL（关系型数据库）中
* 并提供简单的 sql 查询功能；
* 可以将 sql 语句转换为 MapReduce 任务进行运行。

### 2、快速实现简单的MapReduce 统计的工具

* 方便非Java编程者对HDFS的数据做mapreduce操作；
* 学习成本低，十分适合数据仓库的统计分析。

### 3、什么是数据仓库？

*  Data Warehouse(DW 或DWH）是为企业所有级别的决策制定过程，提供所有类型数据支持的战略集合。
* 单个数据存储，出于分析性报告和决策支持目的而创建。
* 为需要业务智能的企业，提供指导业务流程改进、监视时间、成本、质量以及控制.
* **数据仓库**是用来做**查询分析的数据库**，**基本不用来做插入，修改，删除操作**。



### 4、数据处理的两大分类

![oltp+olap](https://wx1.sinaimg.cn/large/005zftzDgy1fz2wawi0ujj30h106c0tg.jpg)

* #### 联机事务处理OLTP（on-line transaction processing）

> OLTP是传统的关系型[数据库](http://lib.csdn.net/base/mysql)的主要应用，主要是基本的、日常的事务处理，例如银行交易。
>
> OLTP系统强调数据库内存效率，强调内存各种指标的命令率，强调绑定变量，强调并发操作；

* #### 联机分析处理OLAP（On-Line Analytical Processing）

> OLAP是数据仓库系统的主要应用，支持复杂的分析操作，侧重决策支持，并且提供直观易懂的查询结果。
>
> OLAP系统则强调数据分析，强调SQL执行市场，强调磁盘I/O，强调分区等。

* 数据文件按结构的分类

> 结构化数据：关系型
>
> 半结构化数据：K-V
>
> 松散型：

原理：

Hive包括：解释器、编译器、优化器

其中，编译器将一个HiveSQL 转换为操作符，操作符是Hive的最小的处理单位，每一个操作符代表HDFS的一个操作或一个MapReduce作业。



## 二、Hive架构原理

![Hive架构图](https://img-blog.csdnimg.cn/20181113225516701.?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d3d3p5ZGNvbQ==,size_16,color_FFFFFF,t_70)

1、架构图解释：

> Hive通过用户提供的一系列交互接口，接收到用户的指令(SQL)，使用自己的Driver，结合元数据(MetaStore)，将这些指令翻译成MapReduce，提交到Hadoop中执行，最后，将执行返回的结果输出到用户交互接口

2、用户接口

>  主要有三个：Client CLI(hive shell 命令行)，JDBC/ODBC(java访问hive)，WEBUI(浏览器访问hive)
>
> ​         其中最常用的是**CLI命令行**，Cli启动的时候，会同时启动一个Hive副本；**Client**是Hive的客户端，用户连接至Hive Server。在启动 Client模式的时候，需要指出Hive Server所在节点，并且在该节点启动Hive Server。

3、元数据:Metastore 

> 元数据包括:
>
> 表名,表所属数据库(默认是default) ,表的拥有者,列/分区字段,表的类型(是否是外部表),表的数据所在目录等；
>
> 默认存储在自带的derby数据库中,推荐使用MySQL存储Metastore

4、任务运行

> Hive 使用HDFS进行存储,使用MapReduce进行计算
>
> (0)驱动器:Driver
>
> (1)解析器(SQL Parser):将SQL字符转换成抽象语法树AST,这一步一般使用都是第三方工具库完成,比如antlr,对AST进行语法分析,比如表是否存在,字段是否存在,SQL语句是否有误
>
> (2)编译器(Physical Plan):将AST编译生成逻辑执行计划 
>
> (3)优化器(Query Optimizer):对逻辑执行计划进行优化
>
> (4)执行器(Execution):把逻辑执行计划转换成可以运行的物理计划,对于Hive来说,就是MR/Spark
>
>   其中(select *  不会产生MR任务)



## 三、Hive搭建及三种模式

### 1、Hive的安装配置：

#### （1）基本环境：Hadoop集群环境（至少3个节点）

> **Hive**是依赖于hadoop系统的，因此在运行Hive之前需要保证已经搭建好hadoop集群环境。

#### （2）安装一个关系型数据mysql

> 因为Hive数据仓库的元数据信息是存放在本地磁盘的关系数据库上的

`安装步骤`：详见  “Linux系统数据库MySQL安装.md”

#### （3）解压安装（按需在指定节点上）

> 解压apache-hive-1.2.1-bin.tar.gz

#### （4）追加配置环境变量

```shell
vim ~/.bash_profile
```



```properties
HIVE_HOME=Hive的解压路径

HIVE_HOME=/usr/soft/apache-hive-1.2.1-bin
export PATH=$PATH:$HIVE_HOME/bin 
```



#### （5）替换和添加相关jar包

> * 修改HADOOP_HOME/share/hadoop/yarn/lib目录下的jline-*.jar 
>
>   将其替换成HIVE_HOME/lib下的`jline-2.12.jar`。 

> * --将如下(`hive连接mysql)`的jar包拷贝到hive解压目录的lib目录下
>
>   `mysql-connector-java-5.1.32-bin.jar`

#### （6）修改配置文件（选择3种模式里哪一种）

`见三种安装模式`

`注意：`

如果 对应安装的hadoop的/root/usr/hadoop-2.6.5/etc/hadoop路径下存在hive-site.xml文件， 优先级会高于Hive安装路径下的配置文件。

#### （7）启动

> ```shell
> hive 
> ```
>
> 启动hive交互式界面

### 2、三种模式  

| 三种模式                                                     |
| ------------------------------------------------------------ |
| A、内嵌模式（元数据保存在内嵌的derby中，允许一个会话链接，尝试多个会话链接时会报错）【了解】                                                                                                        B、本地模式（本地安装mysql 替代derby存储元数据）【重要】                                                                                  C、远程模式（远程安装mysql 替代derby存储元数据）【重要】 |

#### （1）内嵌Derby单用户模式（了解）

* 元数据是内嵌在Derby数据库中的，只能允许一个会话连接，数据会存放到HDFS上。
* 存储方式简单，只需要hive-site.xml 
* 注：使用 derby
  存储方式时，运行 hive 会在当前目录生成一个 derby 文件和一个metastore_db

hive-site.xml ：

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
<property> 
<name>javax.jdo.option.ConnectionURL</name>
<value>jdbc:derby:;databaseName=metastore_db;create=true</value> </property>
<property>
<name>javax.jdo.option.ConnectionDriverName</name>
<value>org.apache.derby.jdbc.EmbeddedDriver</value>
</property>
<property>
<name>hive.metastore.local</name>
<value>true</value>
</property>
<property>
<name>hive.metastore.warehouse.dir</name>
<value>/user/hive/warehouse</value>
</property>
</configuration>
```

#### （2）本地用户模式（`重要`，多用于本地开发测试）

| 与嵌入式的区别                                               |
| ------------------------------------------------------------ |
| * 不再使用内嵌的Derby作为元数据的存储介质，而是使用其他数据库比如MySQL来存储元数据且是一个多用户的模式，运行多个用户client连接到一个数据库中。这种方式一般作为公司内部同时使用Hive。                                                                                                                                                                               * 这里有一个前提，每一个用户必须要有对MySQL的访问权利，即每一个客户端使用者需要知道MySQL的用户名和密码才行。 |

* 需要在本地运行一个 mysql 服务器
* 在node00上（与MySQL在同一个节点上）解压安装Hive

> MySQL， Hive      :  node00

* 需要将 连接mysql 的 jar 包（mysql-connector-java-5.1.32-bin.jar）拷贝到$HIVE_HOME/lib 目录下

hive-site.xml

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
	<property>
		<name>hive.metastore.warehouse.dir</name>
		<value>/user/hive_local/warehouse</value>
	</property>
	<property>
		<name>hive.metastore.local</name>
		<value>true</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionURL</name> 
<value>jdbc:mysql://node00:3306/hive_local?createDatabaseIfNotExist=true</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionDriverName</name>
		<value>com.mysql.jdbc.Driver</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionUserName</name>
		<value>root</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionPassword</name>
		<value>123456</value>
	</property>
</configuration>
```

`注意`：需要实现在mysql中创建数据库：hive_local

#### （3）远程模式（重要）

* ##### remote 一体

> 将Hive解压安装与MySQL不同的节点上
>
> MySQL  ：node00
>
> Hive  ： node02
>
> 需要在 Hive服务器启动 meta服务
>
>Hive的服务端和客户端在同一台节点

配置hive-site.xml（在 node02节点上）

(hadoop 2.6.5)

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
	<property>
		<name>hive.metastore.warehouse.dir</name>
		<value>/user/hive_remote/warehouse</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionURL</name>
<value>jdbc:mysql://node1:3306/hive_remote?createDatabaseIfNotExist=true</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionDriverName</name>
		<value>com.mysql.jdbc.Driver</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionUserName</name>
		<value>root</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionPassword</name>
		<value>111111</value>
	</property>
	<property>
		<name>hive.metastore.local</name>
		<value>false</value>
	</property>
</configuration>
```

如果在hadoop2.5.X环境下还需要添加

```xml
<property>
  <name>hive.metastore.uris</name>
  <value>thrift://node02:9083</value>
</property>

```

`注`**：**这里把hive的服务端和客户端都放在同一台服务器上了。服务端和客户端可以拆开

* ##### Remote 分开(公司企业经常用)

将 hive-site.xml 配置文件拆为如下两部分（此时不与MySQL在同一台节点上）

> MySql  ：   node00
>
> 服务端 ：   node02
>
> 客户端 ：   node01

**1**）、服务端配置文件（node02）

配置hive-site.xml

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
	<property>
		<name>hive.metastore.warehouse.dir</name>
		<value>/user/hive2/warehouse</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionURL</name>
<value>jdbc:mysql://node00:3306/hive2?createDatabaseIfNotExist=true&useSSL=false</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionDriverName</name>
		<value>com.mysql.jdbc.Driver</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionUserName</name>
		<value>root</value>
	</property>
	<property>
		<name>javax.jdo.option.ConnectionPassword</name>
		<value>111111</value>
	</property>
</configuration>

```

**2**）、客户端配置文件（node01）

 配置hive-site.xml

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
   <configuration>
      <property>
       <name>hive.metastore.warehouse.dir</name>
        <value>/user/hive2/warehouse</value>
        <!--注意这里的路径要和服务端一致-->
      </property>
      <property>
        <name>hive.metastore.local</name>
        <value>false</value>
      </property>
      <property>
        <name>hive.metastore.uris</name>
        <value>thrift://node3:9083</value>
      </property>
</configuration>
```

**启动 hive 服务端程序**

```shell
 hive --service metastore & 
```

**客户端启动**

```shell
hive
```

Hive常见问题总汇：

<http://blog.csdn.net/freedomboy319/article/details/44828337>

https://gengqi88.iteye.com/blog/1983492

> 如果报错：
>
> org.apache.thrift.transport.TTransportException: Could not create ServerSocket on address 0.0.0.0/0.0.0.0:9083.

查看进程：

```
jps
```

将启动命令的节点上所以Runjar  进程执行如下kill 命令

```
kill -9 pid
```



## 四、HQL详解

`Hql 就是HiveSQl语句`

### 1、DDL语句（数据库定义语言）

#### （1）具体参见：<https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DDL>

`Hive的数据定义语言` （[LanguageManual DDL](javascript:changelink('https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DDL','EN2ZH_CN');)）

**`重点` hive 的建表语句和分区。**

#### （2）创建/删除/修改/使用数据库

* ##### 创建数据库  

（Hive搭建完毕后，会创建一个默认的数据库）

> 查看    show databases；

> 创建    
>
> ```shell
> CREATE (DATABASE|SCHEMA) [IF NOT EXISTS] database_name [COMMENT database_comment];
> ```
>
> 举例：
>
> create database attribute;
>
> create database attr;

`注意：`创建数据时，数据库名不要和系统关键字冲突，否则会报错；

如下：

```xml
命令：
hive> create database out;

报错：
FAILED: ParseException line 1:16 Failed to recognize predicate 'out'. Failed rule: 'identifier' in create database statement

原因：
在Hive1.2.0版本开始增加了如下配置选项，默认值为true：

hive.support.sql11.reserved.keywords

该选项的目的是：是否启用对SQL2011保留关键字的支持。 启用后，将支持部分SQL2011保留关键字。

解决：
法一：弃用这个关键字，换个名字
法二：弃用对保留关键字的支持
在conf下的hive-site.xml配置文件中修改配置选项：
<property>
    <name>hive.support.sql11.reserved.keywords</name>
    <value>false</value>
</property>
```



* ##### 删除数据库

  > ```shell
  > DROP (DATABASE|SCHEMA) [IF EXISTS] database_name;
  > ```
  >
  > 举例：
  >
  > drop database attribute;


* 修改数据库(了解)

> ALTER (DATABASE|SCHEMA) database_name SET DBPROPERTIES (property_name=property_value, ...);
>
> ALTER (DATABASE|SCHEMA) database_name SET OWNER [USER|ROLE] user_or_role; 

* ##### 使用数据库 （进入某一数据库。如果没有这步操作，会进入默认default数据库）

> ```shell
> USE database_name;
> ```
>
> 举例：
>
> use attr；

#### （3）创建/删除/表（重点）

* ##### ==创建表（重要！）==

数据类型：

> data_type
>   : `primitive_type  原始数据类型`
>   | `array_type		数组`
>   | `map_type		map`
>   | struct_type
>   | union_type  -- (Note: Available in Hive 0.7.0 and later)
>
> *primitive_type*  
>   : TINYINT
>   | SMALLINT
>   | `INT`
>   | `BIGINT`
>   | BOOLEAN
>   | FLOAT
>   | `DOUBLE`
>   | DOUBLE PRECISION 
>   | **STRING  基本可以搞定一切**
>   | BINARY  
>   | TIMESTAMP  
>   | DECIMAL  
>   | DECIMAL(precision, scale) 
>   | `DATE` 
>   | VARCHAR 
>   | CHAR  
>
> *array_type*
>   : `ARRAY < data_type >`
>
> *map_type*
>   : `MAP < primitive_type, data_type >`
>
> *struct_type*
>   : STRUCT < col_name : data_type [COMMENT col_comment], ...>
>
> *union_type*
>   : UNIONTYPE < data_type, data_type, ... >  

* ##### 1、准备数据

```
1,zshang,18,game-girl-book,stu_addr:beijing-work_addr:shanghai
2,lishi,16,shop-boy-book,stu_addr:hunan-work_addr:shanghai
3,wang2mazi,20,fangniu-eat,stu_addr:shanghai-work_addr:tianjing
```

* ##### 2、创建表

(如果没有指定进入某一数据库，就会在默认数据库中创建)

``` sql
create table log(
 id int,
 name string,
 age int,
 likes array<string>,
 address map<string,string>
 )
 row format delimited fields terminated by ','
 COLLECTION ITEMS TERMINATED by '-'
 map keys terminated by ':'
 lines terminated by '\n';
```

* **导入数据**（属于DML但是为了演示需要在此应用）

```
LOAD DATA [LOCAL] INPATH 'filepath' [OVERWRITE] INTO TABLE tablename [PARTITION (partcol1=val1, partcol2=val2 ...)]

 [LOCAL]:从本地  |  若无，则为从HDFS
 [OVERWRITE]  ： 会覆盖Hive表中的数据   | 若无则会追加
 
 [PARTITION....] ： 创建分区
```



> 将log1文件中的数据加载到log表中
>
> （log1中数据的格式要和log表格式保持一致，否则会乱；若文件已存在，则会自动重命名）
>
> * 本地加载（相当于复制）数据到Hive的制定表中
>
> ```shell
> LOAD DATA LOCAL INPATH '/root/su/log1' INTO TABLE log;
> ```
>
> * HDFS加载（相当于剪切）数据到Hive的制定表中
>
> ```shell
> LOAD DATA INPATH '/root/su/log1' INTO TABLE log ;
> ```
>
>

* 查看表中数据

> ```shell
> 对本表查询不会产生MapReduce任务
> hive> select * from log;
> 使用函数查询会产生MapReduce任务
> hive> select count(*) from log;
> 查询表的字段信息：描述字段类型
> hive> desc log;
> ```

第一个查询结果：

```
1	zshang	18	["game","girl","book"]	{"stu_addr":"beijing","work_addr":"shanghai"}
1	zhaoliu	18	["game","girl","book"]	{"stu_addr":"beijing","work_addr":"shanghai"}
2	lishi	16	["shop","boy","book"]	{"stu_addr":"hunan","work_addr":"shanghai"}
3	wang2mazi	20	["fangniu","eat"]	{"stu_addr":"shanghai","work_addr":"tianjing"}

```

第二个查询结果：

```
4
```

`附加题`

> 查询表中likes字段中有girl的人

```
hive> select name from log2 where likes[1]="girl";

```

> 查询表中address字段有stu_addr为beijing的人

```
hive>  select name from log2 where address["stu_addr"]="beijing";

```



* ##### 3、删除表

> ```
> DROP TABLE [IF EXISTS] table_name [PURGE];
> ```
>
> 举例：
>
> （用drop命令删除表，会将表中数据一并删除，其对应在MySQl中的表的元数据信息也会随之删除；
>
> ​    用hdfs命令删除表对应的文件目录，表中数据也一并删除，但其元数据信息依然保存在My  SQL上，
>
> ​     再load数据，可恢复该表）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        

> ```
> drop table log1；
> ```

> ```
> hdfs dfs -rmr /user/hive_local/warehouse/attr.db/log1
> 
> hive> use attr;
> hive> LOAD DATA LOCAL INPATH '/root/su/log1' INTO TABLE log1;
> 
> ```
>
>

* ##### 创建外部表（重要）

> 外部关键字EXTERNAL允许您创建一个表,并提供一个位置,以便hive不使用这个表的默认位置。**这方便如果你已经生成了数据，当删除一个外部表**,**表中的数据不会从文件系统中删除**。外部表指向任何HDFS的存储位置,而不是存储在配置属性指定的文件夹[ hive.metastore.warehouse.dir](javascript:changelink('https://cwiki.apache.org/confluence/display/Hive/Configuration+Properties#ConfigurationProperties-hive.metastore.warehouse.dir','EN2ZH_CN');)中

创建表：

```
create EXTERNAL table log1(
 id int,
 name string,
 age int,
 likes array<string>,
 address map<string,string>
 )
 row format delimited fields terminated by ','
 COLLECTION ITEMS TERMINATED by '-'
 map keys terminated by ':'
 lines terminated by '\n';
```

加载数据：

```
LOAD DATA LOCAL INPATH '/root/su/log1' INTO TABLE log1;
```

删除外部表（`相当于删除的是表的元数据信息，而表中的数据还保存`）

```
drop table log1；
```

结果：

> hive> show tables;
>
> 无log1
>
> MySQl中也无此表元数据信息
>
> 但是，
>
> 在HDFS文件系统中，此表数据依然存在
>
> 也就是说，此表还可以恢复

恢复表：

```
重新创建log1表，该表即可恢复
```



#### （4）修改表,更新，删除数据(这些很少用)

重命名表

> ```
> ALTER TABLE table_name RENAME TO new_table_name;
> 
> Eg: alter table meninem rename to jacke;
> ```
>
>

更新数据

```
UPDATE tablename SET column = value [, column = value ...][WHERE expression]
```

删除数据

```
DELETE FROM tablename [WHERE expression]
```



### 2、DML语句（数据库管理语言）

#### （1）具体参见：

<https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DML>

   **重点是数据加载和查询插入语法**

Hive数据操作语言（[LanguageManual DML](javascript:changelink('https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DML','EN2ZH_CN');)）

#### （2）四种插入/导入数据(重要)

> Hive不能很好的支持用`insert`语句一条一条的进行插入操作，不支持`update`操作。数据是以`load`的方式加载到建立好的表中。数据一旦导入就不可以修改。

```
create table log3(
 id int,
 name string,
 age int
 )
 row format delimited fields terminated by ','
 lines terminated by '\n';
```



##### 1.直接加载数据

```shell
LOAD DATA [LOCAL] INPATH 'filepath' [OVERWRITE] INTO TABLE tablename [PARTITION (partcol1=val1, partcol2=val2 ...)]
load data local inpath '/root/su/log1' into table log1;
```



##### 2.将表1查询结果插入表2

`注意：查询结果的字段个数、类型 要与插入的表的字段一 一匹配对应`

```
创建person2表，然后从表person1查询数据导入：
覆盖：
INSERT OVERWRITE TABLE person2 [PARTITION(dt='2008-06-08', country)]
       SELECT id,name, age From ppt;
追加：
INSERT INTO TABLE log3 
       SELECT id,name, age From log;
```



##### 3.将表1、表2查询结果插入表3、表4

`注意：查询结果的字段个数、类型 要与插入的表的字段一 一匹配对应`

```
FROM person t1
INSERT OVERWRITE | INTO TABLE person1 [PARTITION(dt='2008-06-08', country)]
       SELECT t1.id, t1.name, t1.age ;
       
FROM log t1,log1 t2 
INSERT OVERWRITE TABLE log4  
 SELECT t1.id,t1.name,t2.age ;
 
 是否存在笛卡尔积：？？？？存在。
 
 为了防止笛卡尔积：
 FROM log t1,log1 t2 
INSERT OVERWRITE TABLE log4  
 SELECT t1.id,t1.name,t2.age where t1.id =t2.id;
```

```
【from放前面好处就是后面可以插入多条语句 】
FROM abc t1,sun t2 
INSERT OVERWRITE TABLE qiniu  
 SELECT t1.id,t1.name,t1.age,t2.likes,t2.address ;

```

```
FROM abc t1,sun t2 
INSERT OVERWRITE TABLE qiniu  
 SELECT t1.id,t1.name,t1.age,t1.likes,t1.address where…
INSERT OVERWRITE TABLE wbb
 SELECT t2.id,t2.name,t2.age,t2.likes,t2.address where…;

```



##### 4.直接列出数据插入表中（大量数据时不推荐）

`注意：查询结果的字段个数、类型 要与插入的表的字段一 一匹配对应`

```
INSERT INTO TABLE students
   VALUES (1,'zs',18,'boy','beijng'),(2,'wh','girl','stu_addr':shanghai');
```



> 本地load数据和从HDFS上load加载数据的过程有什么`区别`？
>
> - 本地： local 会自动复制到HDFS上的hive的**目录下
>
> - Hdfs导入 后移动到hive的**目录下



#### （3）查询数据并保存

1. * ##### 保存数据到本地：

   ```shell
   insert overwrite local directory '/opt/datas/hive_exp_emp2'
        ROW FORMAT DELIMITED FIELDS TERMINATED BY ','
            select * from db_1128.emp ;
   留意两种的区别：保存的数据格式
   
   insert overwrite local directory '/sun/temp/hive_save1'
        row format delimited fields terminated by ','
         COLLECTION ITEMS TERMINATED by '-'
         map keys terminated by ':'      
             select * from log2 ;
             
   这里如果将 overwrite  改为into 会报错。        
   ```

```
//查看数据
!cat /sun/temp/hive_save1/000000_0;
```



2. * ##### 保存数据到HDFS上：

   ```
   insert overwrite directory '/user/beifeng/hive/hive_exp_emp'
        select * from db_1128.emp ;
   
   insert overwrite directory '/sun/hive/temp/hive_save1'
         row format delimited fields terminated by ','
         COLLECTION ITEMS TERMINATED by '-'
         map keys terminated by ':'
         select * from log2 ;
        
   这里如果将 overwrite  改为into 会报错。  
   ```


3. * ##### 在外部shell中将数据重定向到文件中：

```
(注意：需要指明是哪个数据库的表)
# hive -e "select * from attr.log;" > /sun/hive/temp/hive_save2
# cat /sun/hive/temp/hive_save2
```



#### （4）备份数据或还原数据（在HDFS上）

1. * 备份数据（包括表的元数据和表中的数据）：

```
EXPORT TABLE log to '/sun/hive/datas/export/cp1'
```



2. * 删除再还原数据：

```
先删除表。
drop table log;
show tables ;
再还原数据：
IMPORT FROM '/sun/hive/datas/export/cp1' ; 

```



#### （5）其他Hql操作

##### Hive的group by\join(left join right join等)\having\sort by \order by等操作和MySQL没有什么大的区别：

<http://www.2cto.com/kf/201609/545560.html>

### 3、Hive SerDe（序列化、反序列化）

#### (1)定义

**`Hive SerDe`** - Serializer and Deserializer  SerDe 用于做序列化和反序列化。

构建在数据存储和执行引擎之间，对两者实现解耦。

对数据实现序列化，清洗数据，使之成为有效数据并加载。

Hive通过ROW FORMAT DELIMITED以及SERDE进行内容的读写。

#### （2）实现

```
row_format
: DELIMITED 
          [FIELDS TERMINATED BY char [ESCAPED BY char]] 
          [COLLECTION ITEMS TERMINATED BY char] 
          [MAP KEYS TERMINATED BY char] 
          [LINES TERMINATED BY char] 
: SERDE serde_name [WITH SERDEPROPERTIES (property_name=property_value, property_name=property_value, ...)]

```

```
Hive正则匹配（实现数据清洗）
创建表 logtbl：

 CREATE TABLE logtbl (
    host STRING,
    identity STRING,
    t_user STRING,
    time STRING,
    request STRING,
    referer STRING,
    agent STRING)
  ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.RegexSerDe'
  WITH SERDEPROPERTIES (
 "input.regex"="([^ ]*) ([^ ]*) ([^ ]*) \\[(.*)\\] \"(.*)\" (-|[0-9]*) (-|[0-9]*)") 
  STORED AS TEXTFILE;
  
加载数据:

load data local inpath '/root/su/localhost_access_log.2016-02-29' into table logtbl;

查看数据：

select * from logtbl;

显示：
//192.168.57.4 - - [29/Feb/2016:18:14:35 +0800] "GET /bg-upper.png HTTP/1.1" 304 -

192.168.57.4	-	-	29/Feb/2016:18:14:35 +0800	GET /bg-upper.png HTTP/1.1	304    -
192.168.57.4	-	-	29/Feb/2016:18:14:35 +0800	GET /bg-nav.png HTTP/1.1	304    -
192.168.57.4	-	-	29/Feb/2016:18:14:35 +0800	GET /asf-logo.png HTTP/1.1	304    -
.
.
.
(省略。。。)
```



`表数据--见数据文件：localhost_access_log.2016-02-29.txt`

```tx 
192.168.57.4 - - [29/Feb/2016:18:14:35 +0800] "GET /bg-upper.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:35 +0800] "GET /bg-nav.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:35 +0800] "GET /asf-logo.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:35 +0800] "GET /bg-button.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:35 +0800] "GET /bg-middle.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET / HTTP/1.1" 200 11217
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET / HTTP/1.1" 200 11217
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /tomcat.css HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /tomcat.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /asf-logo.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /bg-middle.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /bg-button.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /bg-nav.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /bg-upper.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET / HTTP/1.1" 200 11217
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /tomcat.css HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /tomcat.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET / HTTP/1.1" 200 11217
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /tomcat.css HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /tomcat.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /bg-button.png HTTP/1.1" 304 -
192.168.57.4 - - [29/Feb/2016:18:14:36 +0800] "GET /bg-upper.png HTTP/1.1" 304 -  
```



## 五、Beeline和Hiveserver2（Hive的升级）

#### 1、Hiveserver2直接启动（只能在服务端启动，相当于服务端）

```
 # ./hiveserver2
```

若已经配置环境变量则启动方式为：

```
# hivesever2
```



#### 2、启动 beeline（可在服务端|客户端启动，相当于客户端）

> 因为beeline是在Hive安装目录的/bin下，所以只要有hive包都可以启动

```
# ./beeline
beeline> !connect jdbc:hive2://node00:10000 root 123456
显示：
Connecting to jdbc:hive2://node00:10000
Connected to: Apache Hive (version 1.2.1)
Driver: Hive JDBC (version 1.2.1)
Transaction isolation: TRANSACTION_REPEATABLE_READ
0: jdbc:hive2://node00:10000>
使用：列出数据库
0: jdbc:hive2://node00:10000> show databases;
+----------------+--+
| database_name  |
+----------------+--+
| attr           |
| attribute      |
| default        |
+----------------+--+
3 rows selected (7.493 seconds)
0: jdbc:hive2://node00:10000>



而在服务端：
显示：

[root@node00 ~]# hiveserver2
19/01/07 08:52:09 WARN conf.HiveConf: HiveConf of name hive.metastore.local does not exist
OK
OK
OK
OK

退出：
服务端：ctrl + c
客户端：！quit；  或 ctrl + c

作用：
对操作结果添加了美化。不过不太常用，耗内存，数据大的时候，还影响页面。

```



## 六、Hive的JDBC 

> 一般是平台使用展示或接口，服务端启动hiveserver2后，在java代码中通过调用hive的jdbc访问默认端口10000进行连接、访问

```java
public class HivejdbcClient {    
    private static String driverName = "org.apache.hive.jdbc.HiveDriver";   
    public static void main(String[] args){        
        try{
            Class.forName(driverName);
        }catch (ClassNotFoundException){
            e.printStackTrace();
            System.exit(1);
        }
// repalace "hive" here with the name of user the queries should run as
        Connection con = DriverManager.getConnection("jdbc:hive2://node00:10000/default","root","123456");
        Statement stmt = con.createStatement();
        String sql = "select * from log limit 0";
        ResultSet rs = stmt.executeQuery(sql);
        while(rs.next()){
            System.out.println(rs.getInt(1)+"-"+rs.getString("name"));
        }
    }
}
```





## 七、==Hive分区与自定义函数UDF  UDAF UDTF==

### 1、==Hive的分区partition（重要）==

> `功能：`
>
> 为了方便海量数据的管理和查询，可以对数据建立分区（可按日期、部门、类型等具体业务）。进行分门别类的管理。

> `注意：`
>
> * 必须在定义表的时候创建partition分区
>
> * 存储数据时，添加分区字段的数据，直接将数据按分区进行存储。
>      添加分区时：
>
>      ​             时间的格式：/   ： 存储时会乱码，用   -  不会。
>      ​             需要指定分区
>      ​             多个分区时，存在父子目录关系，按顺序对应，对应父子
>      ​             创建表时，已经指定分区个数，就只能填加指定个数的字段数据
>
>         删除分区时：
>      ​            若该分区是父分区的最后一个子区，则父分区也会被删除
>      ​            若删除父分区，其所有子分区也都会被删除
>      ​            若删除的分区，分别在多个不同父分区中存在，则都会被删除
>         重命名分区时：
>      ​            修改之后的名字不能是已经存在的
> * **注意：在创建 删除多分区等操作时一定要注意分区的先后顺序，他们是父子节点的关系。分区字段不要和表字段相同**
>
>

> `类别：`
>
> * 单分区和多分区
> * 静态分区和动态分区

#### （1）创建分区

* ##### 单分区建表

```sql
create table day_table(
id int, 
content string
) 
partitioned by (dt string) 
row format delimited fields terminated by ',';
```

`注意：`【单分区表，按天分区，在表结构中存在id，content，dt三列；以dt为文件夹区分】

* ##### 双分区建表

```sql
create table day_hour_table (
id int,
content string
) 
partitioned by (dt string, hour string) 
row format delimited fields terminated by ',';
```

`注意：`

【双分区表，按天和小时分区，在表结构中新增加了dt和hour两列；先以dt为文件夹，再以hour子文件夹区分】

#### （2）添加分区表的分区

（表已创建，在此基础上添加分区：按什么分区）：

`注意：报错`：此时添加，要注意分区的个数相对应，否则会报错：

```
FAILED: ValidationFailureSemanticException Partition spec {dt=2008-08-08, hour=08} contains non-partition columns
```

`注意：报错`此时添加，要注意分区的字段名要对应添加，否则会报如下错误：

```
FAILED: ValidationFailureSemanticException Partition spec {d=2008-08-08} contains non-partition columns
```

`注意：`一定是存在分区，才可添加

 添加分区：

```sql
ALTER TABLE table_name
ADD partition_spec [ LOCATION 'location1' ] partition_spec [ LOCATION 'location2' ] ...
```

```sql
例： 
ALTER TABLE day_table ADD PARTITION (dt='2028-08-08', hour='08');
ALTER TABLE day_table ADD PARTITION (dt='2028-08-08');
```



#### （3）删除分区

语法：（– 用户可以用 ALTER TABLE DROP PARTITION 来删除分区。分区的元数据和数据将被一并删除。）

删除如双分区中的子级分区时，如果仅剩一个子分区，那么父级分区也会被删除。（连坐）

```
ALTER TABLE table_name DROP partition_spec, partition_spec,...
```

```
例：
ALTER TABLE day_hour_table DROP PARTITION (dt='2008-08-08', hour='08');

ALTER TABLE day_hour_table DROP PARTITION (dt='2008-08-08');
```



#### （4）数据加载进分区表中

语法：

```sql
LOAD DATA [LOCAL] INPATH 'filepath' [OVERWRITE] INTO TABLE tablename [PARTITION (partcol1=val1,partcol2=val2 ...)]
```

```sql
HDFS：
LOAD DATA INPATH '/user/pv.txt' INTO TABLE day_hour_table PARTITION(dt='2008-08-08', hour='08');

本地：
LOAD DATA local INPATH '/user/hua/*' INTO TABLE day_hour partition(dt='2010-07-07');

```



#### （5）查看表的所有分区

```sql
hive> show partitions day_hour_table;

show partitions day_table;
```

#### （6）重命名分区

语法：

```sql
ALTER TABLE table_name PARTITION partition_spec RENAME TO PARTITION partition_spec1;
```

```sql
例：
ALTER TABLE day_table 
              PARTITION (tian='2018-05-01') RENAME TO PARTITION (tain='2018-06-01');
```



#### （7）==动态分区(重要)--注意外部表==

1. 在本地文件/home/grid/a  中写入以下4行数据

   >  aaa,US,CA
   >  aaa,US,CB
   >  bbb,CA,BB
   >  bbb,CA,BC

2. 建立非分区表并加载数据 

**创建表**   info1

```sql
CREATE TABLE  (
      name STRING, 
      cty STRING, 
      st STRING
) 
ROW FORMAT DELIMITED FIELDS TERMINATED BY ',';  

```

**加载数据**

```sql
LOAD DATA LOCAL INPATH '/root/su/a' INTO TABLE info1;    
```

**查看**

```sql
   SELECT * FROM info1; 
```

3. 建立外部分区表  info2   , 并动态加载数据  （注意删除外部表的相关事项）

```sql
CREATE EXTERNAL TABLE info2 (
name STRING
) 
PARTITIONED BY (country STRING, state STRING);   
```

**实现动态分区**

```sql
set hive.exec.dynamic.partition=true;  

set hive.exec.dynamic.partition.mode=nonstrict;  

set hive.exec.max.dynamic.partitions.pernode=1000;  

INSERT INTO TABLE info2 PARTITION (country, state) SELECT name, cty, st FROM info1; 

INSERT INTO TABLE info2 PARTITION (country, state) SELECT name, cty, st FROM info1; 
--两次插入数据，会有两份相同的数据
SELECT * FROM info2;    

```



4.  使用动态分区需要注意设定以下参数：

>  **hive.exec.dynamic.partition**
>
> 默认值：false
>
> 是否开启动态分区功能，默认false关闭。
>
> 使用动态分区时候，该参数必须设置成true;



> **hive.exec.dynamic.partition.mode**
>
> 默认值：strict
>
> 动态分区的模式，默认strict，表示必须指定至少一个分区为静态分区，nonstrict模式表示允许所有的分区字段都可以使用动态分区。
>
> 一般需要设置为nonstrict



>  **hive.exec.max.dynamic.partitions.pernode**
>
> 默认值：100
>
> 在每个执行MR的节点上，最大可以创建多少个动态分区。
>
> 该参数需要根据实际的数据来设定。
>
> 比如：源数据中包含了一年的数据，即day字段有365个值，那么该参数就需要设置成大于365，如果使用默认值100，则会报错。



> **hive.exec.max.dynamic.partitions**
>
> 默认值：1000
>
> 在所有执行MR的节点上，最大一共可以创建多少个动态分区。
>
> 同上参数解释。



>  **hive.exec.max.created.files**
>
> 默认值：100000
>
> 整个MR Job中，最大可以创建多少个HDFS文件。
>
> 一般默认值足够了，除非你的数据量非常大，需要创建的文件数大于100000，可根据实际情况加以调整。



>  **hive.error.on.empty.partition**
>
> 默认值：false
>
> 当有空分区生成时，是否抛出异常。
>
> 一般不需要设置。



### 2、自定义函数UDF  UDAF UDTF

> 自定义函数包括三种 UDF、UDAF、UDTF
>
> UDF：一进一出
>
> UDAF：聚集函数，多进一出。如：Count/max/min
>
> UDTF：一进多出，如 lateralview  explore()，（类似于mysql中的视图）
>
> **使用方式** ：在HIVE会话中add自定义函数的jar 文件，然后创建 function 继而使用函数

#### （1）UDF 开发（用的多一点）

Hive的函数课参考官网，用时查阅即可： <https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF>

**1、**UDF函数可以直接应用于 select 语句，对查询结构做格式化处理后，再输出内容。

**2、**编写 UDF 函数的时候需要注意一下几点：

  a）自定义 UDF 需要`继承` org.apache.hadoop.hive.ql.`UDF`。

  b）需要`实现` `evaluate` 函数，evaluate 函数支持重载。

**3、**步骤

  a）把程序打包放到目标机器上去；

（需要hive和hadoop，jdk 的相关jar包）

函数一：脱敏处理

```java
package com.bigdata.hive.udf;

import org.apache.hadoop.hive.ql.exec.UDF;
import org.apache.hadoop.io.Text;

public class TuoMing extends UDF {
	private Text res = new Text();

	public Text evaluate(String string) {
		// 校验参数是否为空
		if(string==null){
			return null;
		}
        // 若为单个字符        
		if(string.length()==1){
			res.set("*");
		}
		
	  String str1 = string.substring(0,1);
	  String str2 = string.substring(string.length()-1,string.length());
	  res.set(str1+"***"+str2);
	  return res;
	  } 
}

```

函数二：add函数

```java
package com.bigdata.hive.udf;

import org.apache.hadoop.hive.ql.exec.UDF;
import org.apache.hadoop.io.Text;

public class Add extends UDF {
	private Text res = new Text();

	public Text evaluate(String num1,String num2) {
		// 校验参数是否为空
		if(num1==null){
			return null;
		}else if(num2==null){
			res.set(num1);
			return res;
		}
		int n = Integer.parseInt(num1)+Integer.parseInt(num2);
	    String str =n+"";
	    res.set(str);
	    return res;
	  } 
}
```



  b）进入 hive 客户端，添加 jar 包

```sql
  hive>add jar /root/su/TuoMing.jar;
  (相当于添加到环境变量中)
  (清除缓存时记得删除jar包： delete jar /*)
  delete jar /jar/udf_test.jar;
```

  c）创建临时函数：

```sql
hive>CREATE TEMPORARY FUNCTION add_example AS 'hive.udf.add';
CREATE TEMPORARY FUNCTION tm_example AS 'com.bigdata.hive.udf.TuoMing';
（as 后面添加的是：包名+类名）
```

  d）查询 HQL 语句：

```sql
SELECT  add_example(8,9)  FROM  scores;

SELECT  add_example(scores.math,scores.art)  FROM  scores;

SELECT  tm_example(id)  FROM  log;

```

  e）销毁临时函数：

```sql
hive>  DROP  TEMPORARY  FUNCTION  tm_example;
```



#### （2）UDAF自定义聚集函数(用的少)

> 多行进一行出，如 sum()、min()，用在 group  by 时



**1.**必须`继承`org.apache.hadoop.hive.ql.exec.`UDAF`(函数类继承)

org.apache.hadoop.hive.ql.exec.`UDAFEvaluator`(内部类 Evaluator 实现 UDAFEvaluator 接口)

**2.**Evaluator 需要实现 `init、iterate、terminatePartial、merge、terminate` 这几个函数

> + init():类似于构造函数，用于 UDAF 的初始化
>
> + iterate():接收传入的参数，并进行内部的轮转，返回 boolean
>
> + terminatePartial():无参数，其为 iterate 函数轮转结束后，返回轮转数据，
>
> 类似于 hadoop 的Combinermerge()：接收 terminatePartial 的返回结果，进行数据 merge 操作，
>
> ​                                                                  其返回类型为 boolean 
>
> + terminate():返回最终的聚集函数结果



开发一个功能同：

> Oracle 的 wm_concat()函数
>
> Mysql 的 group_concat()



> Hive  UDF 的数据类型：

![Hive  UDF 的数据类型：](https://wx1.sinaimg.cn/large/005zftzDgy1fz53mse6n1j30fe0c3jxm.jpg)



#### （3）UDTF（用的少一点）

UDTF：一进多出，如 lateral  view  explode( )  返回一个数组表

> **Hive Lateral View**   视图
>
> Lateral View用于和UDTF函数（explode、split）结合来使用。
>
> 首先通过UDTF函数拆分成多行，再将多行结果组合成一个支持别名的虚拟表。
>
> `主要解决`
>
> 在select使用UDTF做查询过程中，查询只能包含单个UDTF，不能包含其他字段、以及多个UDTF的问题

> `语法：`
>
> LATERAL VIEW udtf(expression) tableAlias AS columnAlias (',' columnAlias)

> `例：`
>
> 统计人员表中共有多少种爱好、多少个城市?
>
> ```
> select count(distinct(myCol1)), count(distinct(myCol2))，count(distinct(myCol3))from log2 
>       LATERAL VIEW explode(likes) myTable1 AS myCol1 
>       LATERAL VIEW explode(address) myTable2 AS myCol2, myCol3;
> ```



```
select myCol1, myCol2 from log2 
      LATERAL VIEW explode(likes) myTable1 AS myCol1 
      LATERAL VIEW explode(address) myTable2 AS myCol2, myCol3;
```



> distinct(myCol1) 表示去重

> LATERAL VIEW explode(likes) myTable1   AS myCol1   
>
> 将likes查询结果放到mytable1表中，作为字段myCol1     

>  LATERAL VIEW explode(address) myTable2 AS myCol2, myCol3;
>
> 将address查询结果放到myTable2 表中，作为字段myCol2，myCol3，因为address是包含K-V的（两个）

## 八、Hive索引(知道)

> 一个表上创建索引：
>
> 使用给定的列表的列作为键创建一个索引。
>
> 详见创建[索引](javascript:changelink('https://cwiki.apache.org/confluence/display/Hive/IndexDev#IndexDev-CREATEINDEX','EN2ZH_CN');)设计文档。



```sql
CREATE INDEX index_name
  ON TABLE base_table_name (col_name, ...)
  AS index_type
  [WITH DEFERRED REBUILD]
  [IDXPROPERTIES (property_name=property_value, ...)]
  [IN TABLE index_table_name]
  [
     [ ROW FORMAT ...] STORED AS ...
     | STORED BY ...
  ]
  [LOCATION hdfs_path]
  [TBLPROPERTIES (...)]
  [COMMENT "index comment"];

```



## 九、案例实践

### 案例一：(基站掉话率)

![基站掉话率](https://wx1.sinaimg.cn/large/005zftzDgy1fz53p74gyrj30fe07sab1.jpg)

#### 1、创建表

cell_monitor表

```
create table cell_monitor(
        record_time string,
        imei string,
        cell string,
        ph_num int,
        call_num int,
        drop_num int,
        duration int,
        drop_rate DOUBLE,
        net_type string,
        erl string
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY ','
STORED AS TEXTFILE;

```

 结果表cell_drop_monitor

```
create table cell_drop_monitor(
imei string,
total_call_num int,
total_drop_num int,
d_rate DOUBLE
) 
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE;
```

#### **2**、load**数据**

```
LOAD DATA LOCAL INPATH '/root/su/cdr_summ_imei_cell_info.csv' OVERWRITE INTO TABLE cell_monitor;
```

#### **3**、找出掉线率最高的基站

```
from cell_monitor cm 
insert overwrite table cell_drop_monitor  
select cm.imei ,sum(cm.drop_num),sum(cm.duration),sum(cm.drop_num)/sum(cm.duration) d_rate 
group by cm.imei 
sort by d_rate desc;

```

### 案例二：（单词统计）

#### **1**、建表

```
create table docs(line string);
create table wc(word string, totalword int);

```

#### 2、加载数据

```
load data local inpath '/tmp/wc' into table docs;
```

#### 3、统计

```
from (select explode(split(line, ' ')) as word from docs) w 
insert into table wc 
  select word, count(1) as totalword 
  group by word 
  order by word;

```

#### **4**、查询结果

```
select * from wc;
```

## 十、==分桶（重要）==

### 1、概念

> * 主要应用于`数据抽样`。
>
> * 通过对`列值取哈希`值的方式，将不同数据放到不同的文件中存储。
>
> * 对Hive中每个`表`、`分区`都可以进行分桶。
>
> * 列的哈希值 /桶的个数→`决定`每条数据划分到哪个桶中

### 2、开启支持分桶

```sql
hive> set hive.enforce.bucketing=true;
```

> 默认：false；
>
> 设置为true之后，mr运行时会根据bucket的个数自动分配reduce task个数。
>
> （用户也可以通过mapred.reduce.tasks自己设置reduce任务个数，但分桶时不推荐使用）
>
> **一次作业产生的桶数 = reducde task数**

### 3、往分桶表中加载数据

```sql
insert into table bucket_table select columns from tbl;
insert overwrite table bucket_table select columns from tbl;
```

### 4、桶表 

### 抽样查询

```sql
select * from bucket_table tablesample(bucket 1 out of 4 on columns);
```



> TABLESAMPLE语法：
>
> ```
> TABLESAMPLE(BUCKET x OUT OF y)
> ```
>
> x：表示从哪个bucket开始抽取数据，`x<=y`
>
> y：必须为该表总bucket数的`倍数`或`因子`
>
> 理解：
>
> 分桶表已经按age分为4桶，然后，有y个人去抽，从第(x 取模 桶数)桶中抽



### 5、实战

创建普通表

```sql
CREATE TABLE mm( 
id INT, 
name STRING, 
age INT
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY ',';

```

测试数据

```
1,tom,11
2,cat,22
3,dog,33
4,hive,44
5,hbase,55
6,mr,66
7,alice,77
8,scala,88

```

加载数据：

```shell
load data local inpath '/root/su/mm' into table mm;
```

**创建分桶表**

```sql
CREATE TABLE psnbucket( 
id INT, 
name STRING, 
age INT
)
CLUSTERED BY (age) INTO 4 BUCKETS 
ROW FORMAT DELIMITED FIELDS TERMINATED BY ',';

```

**加载数据：**

```sql
insert into table psnbucket select id, name, age from mm;
```

**抽样**

```sql
select id, name, age from psnbucket tablesample(bucket 2 out of 4 on age);
```

`注意：`

>  hive> select id, name, age from psnbucket tablesample(bucket 4 out of 2 on age);
> FAILED: SemanticException [Error 10061]: Numerator should not be bigger than denominator in sample clause for table psnbucket
>
> denominator  : 分母



## 十一、运行方式

### 1、Hive运行模式

> #### -- 命令行方式cli：控制台模式

```
--与hdfs交互
  * 执行dfs命令
  * 例 ：hive> dfs -ls /
  
--与Linux交互
   *  ！ 开头
   *  hive> !pwd
```

> #### --脚本运行方式：（生产中常用）

```
在外部shell中执行,指定数据库,分号可加可不加
# hive -e "select * from attr.log "
# hive -e "select * from attr.log；select * from default.log2"
--------------------------------------------------------------
将执行结果重定向到指定文件：
# hive -e "select * from attr.log " >>log1
--------------------------------------------------------------
静默模式执行，不打印log日志
# hive -S -e "select * from attr.log " >>log1
--------------------------------------------------------------
脚本执行
先编辑脚本问价
# vim file1
编辑内容
select * from attr.log where id = 1;
select * from attr.log where id < 3;
执行脚本
# hive -f file1
--------------------------------------------------------------
?? 使用命令文件执行hive-init.sql
?? # hive -i /home/hive-init.sql
--------------------------------------------------------------
在hive cli中执行脚本文件
hive> source file1
```

### ？未解决？

> ?? 使用命令文件执行hive-init.sql
> ?? # hive -i /home/hive-init.sql

## 十二、hive的GUI接口（web页面）

Hive Web GUI接口

### web界面安装：

**1、**下载源码包apache-hive-1.2.1-src.tar.gz,

**2、**在本地Windows系统中解压

并将\apache-hive-1.2.1-src\hwi\web路径中所有的文件打成war包

`制作方法：`

![war包](https://wx1.sinaimg.cn/large/005zftzDgy1fz5b7di85fj30rn0eodhm.jpg)

> 1、到\apache-hive-1.2.1-src\hwi\web路径下
>
> 2、在路径栏输入命令：jar -cvf hive-hwi.war *
>
> 3、即可生成文件：hive-hwi.war

**3、**将hwi-war包放在$HIVE_HOME/lib/中（Linux系统）

**4、**复制tools.jar(在jdk的lib目录下)到$HIVE_HOME/lib下

**5、**修改hive-site.xml

路径：/usr/soft/apache-hive-1.2.1-bin/conf/hive-site.xml

```xml
<property>
    <name>hive.hwi.listen.host</name>
    <value>0.0.0.0</value>
  </property>
  <property>
    <name>hive.hwi.listen.port</name>
    <value>9999</value>
  </property>
  <property>
    <name>hive.hwi.war.file</name>
    <value>lib/hive-hwi.war</value>
 </property>

```

**6、**启动hwi服务(端口号9999)

```
 hive --service hwi
```

**7、**浏览器通过以下链接来访问

http://node00:9999/hwi/

**8、**登录页面：

USER:

GROUPS:

自已定义

## 十三、权限管理

Hive - SQL Standards Based Authorization in  HiveServer2

### （1）三种授权模型

![](https://wx1.sinaimg.cn/large/005zftzDgy1fz5bus4ks8j30kb08o3zp.jpg)

### （2）常用：基于SQL标准的完全兼容SQL的授权模型

特点：

* 支持对于用户的授权认证

* 支持角色role的授权认证

*  role可理解为是一组权限的集合，通过role为用户授权

    一个用户可以具有一个或多个角色

  ​    默认包含俩种角色：public、admin

![限制](https://wx1.sinaimg.cn/large/005zftzDgy1fz5c0cf550j30k406tjtk.jpg)

### （3）操作

在`hive服务端`修改配置文件hive-site.xml添加以下配置内容：

```xml
<property>
  <name>hive.security.authorization.enabled</name>
  <value>true</value>
</property>
<property>
  <name>hive.server2.enable.doAs</name>
  <value>false</value>
</property>
<property>
  <name>hive.users.in.admin.role</name>
  <value>root</value>
</property>
<property>
  <name>hive.security.authorization.manager</name>
<value>org.apache.hadoop.hive.ql.security.authorization.plugin.sqlstd.SQLStdHiveAuthorizerFactory</value>
</property>
<property>
  <name>hive.security.authenticator.manager</name>
  <value>org.apache.hadoop.hive.ql.security.SessionStateUserAuthenticator</value>
</property>

```

**服务端启动hiveserver2；客户端通过beeline进行连接**

角色的添加、删除、查看、设置：

第一次操作无权限：

需要：CREATE ROLE  admin；

```
CREATE ROLE role_name;  			 -- 创建角色
DROP ROLE role_name;  				 -- 删除角色
SET ROLE (role_name|ALL|NONE); 		 -- 设置角色
SHOW CURRENT ROLES;    				 -- 查看当前具有的角色
SHOW ROLES;    				         -- 查看所有存在的角色
```



![](https://wx1.sinaimg.cn/large/005zftzDgy1fz5c6wynhnj30hs07kgmv.jpg)

![](https://wx1.sinaimg.cn/large/005zftzDgy1fz5c8bvsjkj30im077wft.jpg)



【官网：权限】

| Action                                            | Select       | Insert     | Update | Delete            | Owership        | Admin | URL Privilege(RWX   Permission + Ownership)     |
| ------------------------------------------------- | ------------ | ---------- | ------ | ----------------- | --------------- | ----- | ----------------------------------------------- |
| ALTER DATABASE                                    |              |            |        |                   |                 | Y     |                                                 |
| ALTER INDEX PROPERTIES                            |              |            |        |                   | Y               |       |                                                 |
| ALTER INDEX REBUILD                               |              |            |        |                   | Y               |       |                                                 |
| ALTER PARTITION LOCATION                          |              |            |        |                   | Y               |       | Y (for new partition   location)                |
| ALTER TABLE (all of them   except the ones above) |              |            |        |                   | Y               |       |                                                 |
| ALTER TABLE ADD PARTITION                         |              | Y          |        |                   |                 |       | Y (for partition location)                      |
| ALTER TABLE DROP PARTITION                        |              |            |        | Y                 |                 |       |                                                 |
| ALTER TABLE LOCATION                              |              |            |        |                   | Y               |       | Y (for new location)                            |
| ALTER VIEW PROPERTIES                             |              |            |        |                   | Y               |       |                                                 |
| ALTER VIEW RENAME                                 |              |            |        |                   | Y               |       |                                                 |
| ANALYZE TABLE                                     | Y            | Y          |        |                   |                 |       |                                                 |
| CREATE DATABASE                                   |              |            |        |                   |                 |       | Y (if custom location   specified)              |
| CREATE FUNCTION                                   |              |            |        |                   |                 | Y     |                                                 |
| CREATE INDEX                                      |              |            |        |                   | Y (of table)    |       |                                                 |
| CREATE MACRO                                      |              |            |        |                   |                 | Y     |                                                 |
| CREATE TABLE                                      |              |            |        |                   | Y (of database) |       | Y  (for create   external table – the location) |
| CREATE TABLE AS SELECT                            | Y (of input) |            |        |                   | Y (of database) |       |                                                 |
| CREATE VIEW                                       | Y + G        |            |        |                   |                 |       |                                                 |
| DELETE                                            |              |            |        | Y                 |                 |       |                                                 |
| DESCRIBE TABLE                                    | Y            |            |        |                   |                 |       |                                                 |
| DROP DATABASE                                     |              |            |        |                   | Y               |       |                                                 |
| DROP FUNCTION                                     |              |            |        |                   |                 | Y     |                                                 |
| DROP INDEX                                        |              |            |        |                   | Y               |       |                                                 |
| DROP MACRO                                        |              |            |        |                   |                 | Y     |                                                 |
| DROP TABLE                                        |              |            |        |                   | Y               |       |                                                 |
| DROP VIEW                                         |              |            |        |                   | Y               |       |                                                 |
| DROP VIEW PROPERTIES                              |              |            |        |                   | Y               |       |                                                 |
| EXPLAIN                                           | Y            |            |        |                   |                 |       |                                                 |
| INSERT                                            |              | Y          |        | Y (for OVERWRITE) |                 |       |                                                 |
| LOAD                                              |              | Y (output) |        | Y (output)        |                 |       | Y (input location)                              |
| MSCK (metastore check)                            |              |            |        |                   |                 | Y     |                                                 |
| SELECT                                            | Y            |            |        |                   |                 |       |                                                 |
| SHOW COLUMNS                                      | Y            |            |        |                   |                 |       |                                                 |
| SHOW CREATE TABLE                                 | Y+G          |            |        |                   |                 |       |                                                 |
| SHOW PARTITIONS                                   | Y            |            |        |                   |                 |       |                                                 |
| SHOW TABLE PROPERTIES                             | Y            |            |        |                   |                 |       |                                                 |
| SHOW TABLE STATUS                                 | Y            |            |        |                   |                 |       |                                                 |
| TRUNCATE TABLE                                    |              |            |        |                   | Y               |       |                                                 |
| UPDATE                                            |              |            | Y      |                   |                 |       |                                                 |



## 十四、==Hive优化（重点）==

`详见Hive优化文档`

# hive 参数与变量

## 1、hive当中的参数、变量

hive当中的参数、变量，都是以命名空间开头

| 命名空间 | 读写权限 |                             含义                             |
| :------: | :------: | :----------------------------------------------------------: |
| hiveconf |  可读写  | hive-site.xml当中的各配置变量<br />例：hive --hiveconf hive.cli.print.header=true |
|  system  |  可读写  |   系统变量，包含JVM运行参数<br />例：system:user.name=root   |
|   env    |   只读   |               环境变量<br />例：env:JAVA_HOME                |
| hivevar  |  可读写  |                     例：hive -d val=key                      |



通过${}方式进行引用，其中system、env下的变量必须以前缀开头

## 2、hive 参数设置方式

1、修改配置文件 ${HIVE_HOME}/conf/hive-site.xml

2、启动hive cli时，通过--hiveconf key=value的方式进行设置

例：

```shell
hive --hiveconf hive.cli.print.header=true
```

3、进入cli之后，通过使用set命令设置



## 3、hive set命令

\-    在hive CLI控制台可以通过set对hive中的参数进行查询、设置

\-    set设置：

```sql
set hive.cli.print.header=true;
```

\-     set查看

```sql
set hive.cli.print.header
```

\-     hive参数初始化配置

当前用户家目录下的.hiverc文件

如:  

```sql
 ~/.hiverc
```

如果没有，可直接创建该文件，将需要设置的参数写到该文件中，hive启动运行时，会加载改文件中的配置。

\-     hive历史操作命令集

```sql
~/.hivehistory
```



















































Hive常用函数：

https://www.cnblogs.com/kimbo/p/6288516.html

https://www.iteblog.com/archives/2258.html#3_avg

https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF#LanguageManualUDF-Built-inFunctions







MapReducde底层源码：

1. http://note.youdao.com/noteshare?id=212e4a69d7bf8fc30979f1e4fc39ff0f&sub=EA7C15DC72DF45248721CE2AD3F93CDD
2. http://note.youdao.com/noteshare?id=86ca5c96d13413f789164ff92f9ab4f9&sub=7F20006D1D714D77AEDE5242603786C1
3. http://note.youdao.com/noteshare?id=a518dfed10d824b0995380669ddd28c9&sub=3526F532CDAA49628FEA1FE3A61239F3
4. http://note.youdao.com/noteshare?id=95d458d779f8e9f391d6ea06b6c6d122&sub=0A13B59E10D94C96ABF5388CE4EB89D4



