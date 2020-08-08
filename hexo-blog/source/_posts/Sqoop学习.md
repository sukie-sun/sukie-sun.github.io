---
title: Sqoop学习
date: 2019-1-13
update: 2019-2-19
tags: Sqoop
categories: HDFS
grammar_cjkRuby: true
description: Sqoop是将关系数据库数据与hadoop数据进行转换的工具
abbrlink: 1e2d918c
---

# 一、Sqoop简介

[官网](http://sqoop.apache.org/)

> * 是将关系数据库（oracle、mysql、postgresql等）数据与hadoop数据进行`转换的工具`。
>
> * 可以将一个关系型数据库(例如MySQL、Oracle)中的数据导入到Hadoop(例如HDFS、Hive、Hbase)中，也可以将Hadoop(例如HDFS、Hive、Hbase)中的数据导入到关系型数据库(例如Mysql、Oracle)中。

版本：(两个版本完全不兼容)

* sqoop1：1.4.x    （推荐）

* sqoop2：1.99.x

![](https://wx1.sinaimg.cn/large/005zftzDly1g1gjqrd7n8j30se0c9glv.jpg)

# 二、sqoop 架构

hadoop生态系统的架构最简单的框架。

> sqoop1由client端直接接入hadoop，任务通过解析生成对应的mapreduce执行

![](https://wx1.sinaimg.cn/large/005zftzDly1g1gjqvsixcj30pk0fsmxf.jpg)



# 三、Sqoop安装

## 1、安装包解压：

Sqoop1  : [1.4.7](http://mirrors.shu.edu.cn/apache/sqoop/1.99.7) (推荐) 

Sqoop2 :  [1.99.7](http://mirrors.shu.edu.cn/apache/sqoop/1.99.7)

## 2、配置环境变量（追加）

> vim  ~/.bash_profile

```properties
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
```

(编辑结束后，保存并退出，然后在控制台输入下面的命令，从而是环境变量生效)

链接资源：

> source /etc/profile

## 3、添加数据库驱动包

> 在Sqoop的安装解压目录下的lib目录下添加jar包
>
> mysql-connector-java-5.1.10.jar
>
> 用以连接Mysql

## 4、重命名配置文件

在Sqoop的解压安装目录下的conf目录下

```shell
mv sqoop-env-template.sh sqoop-env.sh
```

编辑sqoop-env.sh

```sh
#Set path to where bin/hadoop is available
export HADOOP_COMMON_HOME=/usr/soft/hadoop-2.6.5

#Set path to where hadoop-*-core.jar is available
export HADOOP_MAPRED_HOME=/usr/soft/hadoop-2.6.5

#set the path to where bin/hbase is available
export HBASE_HOME=/usr/soft/hbase-1.2.9

#Set the path to where bin/hive is available
export HIVE_HOME=/usr/soft/apache-hive-1.2.1-bin

#Set the path for where zookeper config dir is
#export ZOOCFGDIR=/usr/soft/zookeeper-3.4.13
export ZOOKEEPER_HOME=/usr/soft/zookeeper-3.4.13

```

## 5、修改配置configure-sqoop

在Sqoop的解压安装目录的bin目录下

> 注释掉未安装服务相关内容
>
> 例如（HBase、HCatalog、Accumulo）：

```properties
#if [ -z "${HCAT_HOME}" ]; then
#  if [ -d "/usr/lib/hive-hcatalog" ]; then
#    HCAT_HOME=/usr/lib/hive-hcatalog
#  elif [ -d "/usr/lib/hcatalog" ]; then
#    HCAT_HOME=/usr/lib/hcatalog
#  else
#    HCAT_HOME=${SQOOP_HOME}/../hive-hcatalog
#    if [ ! -d ${HCAT_HOME} ]; then
#       HCAT_HOME=${SQOOP_HOME}/../hcatalog
#    fi
#  fi
#fi
#if [ -z "${ACCUMULO_HOME}" ]; then
#  if [ -d "/usr/lib/accumulo" ]; then
#    ACCUMULO_HOME=/usr/lib/accumulo
#  else
#    ACCUMULO_HOME=${SQOOP_HOME}/../accumulo
#  fi
#fi

```

##    6、运行sqoop

```shell
sqoop version
```

前提:

MySQL运行正常，且服务启动

```shell
service mysqld start
```

启动sqoop连接mysql

```shell
sqoop list–databases --connect jdbc:mysql://node00:3306/ -username root -password 123456

或

sqoop list-tables --connect jdbc:mysql://192.168.198.128:3306/mysql --username root --password 123456
```



`警告：`

关于zookeeper环境变量配置的问题：

```shell
[root@node00 conf]# sqoop version
Warning: /usr/soft/sqoop-1.4.6/bin/../../zookeeper does not exist! Accumulo imports will fail.
Please set $ZOOKEEPER_HOME to the root of your Zookeeper installation.
19/01/18 17:02:14 INFO sqoop.Sqoop: Running Sqoop version: 1.4.6
Sqoop 1.4.6
git commit id c0c5a81723759fa575844a0a1eae8f510fa32c25
Compiled by root on Mon Apr 27 14:38:36 CST 2015

```

`解决方案：`

在sqoop解压安装目录的conf目录下，在sqoop-env.sh文件中

```shell

```

添加本地ZOOKEEPER_HOME的配置

```properties
export ZOOKEEPER_HOME=/usr/soft/zookeeper-3.4.13

```

# 四、Sqoop导入导出选项

## 1、导入工具import：

```
   选项                                 含义说明
   
--append							将数据追加到HDFS上一个已存在的数据集上

--as-avrodatafile					将数据导入到Avro数据文件

--as-sequencefile					将数据导入到SequenceFile

--as-textfile						将数据导入到普通文本文件（默认）

--boundary-query <statement>		边界查询，用于创建分片（InputSplit）

--columns <col,col,col…>			从表中导出指定的一组列的数据

--delete-target-dir				    如果指定目录存在，则先删除掉

--direct						    使用直接导入模式（优化导入速度）

--direct-split-size <n>			    分割输入stream的字节大小（在直接导入模式下）

--fetch-size <n>			        从数据库中批量读取记录数

--inline-lob-limit <n>		        设置内联的LOB对象的大小

-m,--num-mappers <n>			    使用n个map任务并行导入数据

-e,--query <statement>	 		    导入的查询语句

--split-by <column-name>			指定按照哪个列去分割数据

--table <table-name>			    导入的源表表名

--target-dir <dir>			        导入HDFS的目标路径

--warehouse-dir <dir>			    HDFS存放表的根路径

--where <where clause>			    指定导出时所使用的查询条件

-z,--compress			    		启用压缩

--compression-codec <c>			    指定Hadoop的codec方式（默认gzip）

--null-string <null-string>	        如果指定列为字符串类型，使用指定字符串替换值为null的该类                                     列的值

--null-non-string <null-string>     如果指定列为非字符串类型，使用指定字符串替换值为null的该                                     类列的值
```

## 2、导出工具export：

```
   选项                                         含义说明

--validate <class-name>	         启用数据副本验证功能，仅支持单表拷贝，可以指定验证使用的实现类

--validation-threshold <class-name>	  指定验证门限所使用的类

--direct	                          使用直接导出模式（优化速度）

--export-dir <dir>	                  导出过程中HDFS源路径

--m,--num-mappers <n>	              使用n个map任务并行导出

--table <table-name>	              导出的目的表名称

--call <stored-proc-name>	          导出数据调用的指定存储过程名

--update-key <col-name>	              更新参考的列名称，多个列名使用逗号分隔

--update-mode <mode>                指定更新策略，包括：updateonly（默认）、allowinsert

--input-null-string <null-string>	  使用指定字符串，替换字符串类型值为null的列

--input-null-non-string <null-string>	使用指定字符串，替换非字符串类型值为null的列

--staging-table <staging-table-name>	在数据导出到数据库之前，数据临时存放的表名称

--clear-staging-table	              清除工作区中临时存放的数据

--batch	                              使用批量模式导出
```

# 四、Sqoop导入导出操作

## 1、导入

![](https://wx1.sinaimg.cn/large/005zftzDly1g1gje9uswwj30rp0gxmzv.jpg)

```shell
sqoop     ##sqoop命令
import    ##表示导入
--connect jdbc:mysql://ip:3306/sqoop    ##告诉jdbc，连接mysql的url
--username root              ##连接mysql的用户名
--password 123456            ##连接mysql的密码
--table myuser               ##从mysql到出的表名
-m 1                         ##使用1个map任务进行导出
--hive-import                ##把mysql表数据导入到hive中，如果不适用该选项意味着导入到hdfs中
--target-dir <dir>           ##HDFS destination dir 
```

### 1、将MySQL中的数据导入到HDFS/Hive/Hbase

```shell
MySQL--> HDFS：
sqoop import --connect jdbc:mysql://node00:3306/test --username root --password 123456 --table myuser -m 1 -target-dir hdfs://Sunrise/my02
```



```shell
MySQL--> Hive：
sqoop import --connect jdbc:mysql://node00:3306/test --username root --password root --table myuser --hive-import -m 1
##由于使用Sqoop从MySQL导入数据到Hive需要指定target-dir，因此导入的是普通表而不能为外部表。
```



```shell
MySQL--> HBase:
sqoop import --connect jdbc:mysql://node00:3306/test --username root --password 1234 --table mysqoop --hbase-create-table --hbase-table sukie  --hbase-row-key name --column-family cf1 -m 1

##选项解释
--column-family        ##指定列族名
--hbase-row-key        ##指定rowkey对应的mysql中的键
--hbase-create-table   ##自动在Hbase中创建表
```

## 2、导出

![](https://wx1.sinaimg.cn/large/005zftzDly1g1gjeoi0pej30tu0hqq5y.jpg)

```shell
sqoop
export                                 ##表示如hive数据导出到mysql
--connect jdbc:mysql://ip:3306/test 
--username root 
--password 123 
--table mysqoop                       ##mysql中的表（必须已存在）
--export-dir /root/hive               ## hive中导出的文件目录
--fields-terminated-by '\t'           ##表示如hive导出文件中的行的字段分隔符
```

### 2、使用Sqoop将HDFS/Hive/HBase中的数据导出到MySQL

```shell
HDFS-->MySQL:
sqoop export --connect jdbc:mysql://192.168.198.128:3306/test --username root --password 123 --table my --export-dir /root/my
```

> 将HDFS/Hive/HBase中的数据导出到MySQL操作都基本大同小异
>

```shell
Hive-->MySQL:
sqoop export --connect jdbc:mysql://192.168.198.128:3306/test --username root --password 123 --table testa --export-dir /user/hive/warehouse/testa --input-fields-terminated-by '\001’
```

HBase-->mysql:

>  目前没有直接的命令将HBase的数据导出到mysql，但可以先将数据导出到hdfs，再导出到mysql 

```shell

sqoop export --connect jdbc:mysql://192.168.198.128:3306/mysql --username root --password 123456 --table bb --export-dir  '/mysql_data/part-m-00000'
```



> 也可以通过Hive建立2个表，一个外部表是基于这个Hbase表的，另一个是单纯的基于hdfs的hive原生表，然后把外部表的数据导入到原生表（临时），然后通过hive将临时表里面的数据导出到mysql
>

1、mysql建立空表

```sql
CREATE
TABLE  `employee` (
  `rowkey` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,   
  PRIMARY KEY  (`id`)   
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;
```

2、Hbase建立employee表,并加载数据

```sql
create 'employee','info'

put 'employee',1,'info:id',1

put 'employee',1,'info:name','peter'

put 'employee',2,'info:id',2

put 'employee',2,'info:name','paul'
```

3、建立Hive外部表

hive 有分为原生表和外部表，原生表是以简单文件方式存储在hdfs里面，外部表依赖别的框架，比如Hbase，我们现在建立一个依赖于我们刚刚建立的employee hbase表的hive 外部表 

```sql
CREATE EXTERNAL TABLE h_employee(key int, id int, name string) 
STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler'
WITH SERDEPROPERTIES ("hbase.columns.mapping" = ":key, info:id,info:name")
TBLPROPERTIES ("hbase.table.name" = "employee");
```

```
hive> select * from h_employee;
OK
1   1   peter
2   2   paul
```

4、建立Hive原生表

这个hive原生表只是用于导出的时候临时使用的，所以取名叫 h_employee_export，字段之间的分隔符用逗号

```sql
CREATE TABLE h_employee_export(
    key INT, 
    id INT,
    name STRING
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\054';
```



5、源Hive表导入数据到临时表

将数据从 h_employee(基于Hbase的外部表)导入到 h_employee_export(原生Hive表) 

```sql
hive> insert overwrite table h_employee_export select * from h_employee;
```

```sql
hive> select * from h_employee_export;
OK
1   1   peter
2   2   paul
```

> 我们去看下实际存储的文本文件是什么样子的 
>
> ```shell
> $ hdfs dfs -cat /user/hive/warehouse/h_employee_export/000000_0
> 1,1,peter
> 2,2,paul
> ```
>
>

6、从Hive导出数据到mysql

```shell
$ sqoop export --connect jdbc:mysql://localhost:3306/sqoop_test --username root --password root --table employee -m 1 --export-dir /user/hive/warehouse/h_employee_export/
```

7、注意

在这段日志中有这样一句话

```
`14/12/05 08:49:46 INFO mapreduce.Job: The url ``to` `track the job: https://hadoop01:8088/proxy/application_1406097234796_0037/`
```

意思是你可以用  浏览器 访问这个地址去看下任务的执行情况，如果你的任务长时间卡主没结束就是出错了，可以去这个地址查看详细的错误日志 

8、查询结果

```
mysql> select * from employee;
+--------+----+-------+
| rowkey | id | name  |
+--------+----+-------+
|      1 |  1 | peter |
|      2 |  2 | paul  |
+--------+----+-------+
2 rows in set (0.00 sec) 
mysql>
```





```shell
1、Sqoop增量导入
sqoop import 
-D sqoop.hbase.add.row.key=true 
--connect jdbc:mysql://node00:3306/spider 
--username root --password root 
--table TEST_GOODS 
--columns ID,GOODS_NAME,GOODS_PRICE 
--hbase-create-table 
--hbase-table t_goods 
--column-family cf 
--hbase-row-key ID 
--incremental lastmodified 
--check-column U_DATE 
--last-value '2017-06-27' 
--split-by U_DATE

--incremental lastmodified 增量导入支持两种模式 append 递增的列；lastmodified时间戳。
--check-column 增量导入时参考的列
--last-value 最小值，这个例子中表示导入2017-06-27到今天的值

```



```shell
2、Sqoop job：
   sqoop job 
   --create testjob01 
   --import 
   --connect jdbc:mysql://node00:3306/spider 
   --username root --password root 
   --table TEST_GOODS 
   --columns ID,GOODS_NAME,GOODS_PRICE 
   --hbase-create-table 
   --hbase-table t_goods 
   --column-family cf 
   --hbase-row-key ID 
   -m 1
   
   设置定时执行以上sqoop job
   使用linux定时器：crontab -e
   例如每天执行
   0 0 * * * /opt/local/sqoop-1.4.6/bin/sqoop job ….
   --exec testjob01

```

