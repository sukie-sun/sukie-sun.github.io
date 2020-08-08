---
title: Elasticsearch学习
date: 2019-1-25
tags:
  - Linux系统环境
  - 分布式搜索和分析引擎
categories: Elasticsearch
grammar_cjkRuby: true
description: 'Elasticsearch:分布式搜索、分析引擎'
abbrlink: d2d9ea24
---

# 一、Elasticsearch是什么

https://ideas.spkcn.com/software/os/windows/687.html

## 1、简介

* 一个基于Lucene的、实时的、分布式搜索和分析引擎

* 应用于云计算中。
* 实时搜索、稳定、可靠、快速
* 安装方便
* 基于Restful接口

## 2、和Lucene的关系

* Lucene 是一个库。必须使用Java开发。工作原理复杂
* Elasticsearch使用Java开发，以Lucene为核心实现索引和搜索功能。通过简单的Restful API隐藏Lucene的复杂性，简化了全文搜索。

## 3、和SOLR对比

* 热度逐渐远高于solr

* 平均查询速度快于solr倍

* ES的优势：

  a）Elasticsearch是分布式的。不需要其他组件，分发是实时的，被叫做”Push replication”。

  b）Elasticsearch 完全支持 Apache Lucene 的接近实时的搜索。

  处理多租户（multitenancy）不需要特殊配置，而Solr则需要更多的高级设置。

  c）Elasticsearch 采用 Gateway 的概念，使得备份更加简单。

  d）各节点组成对等的网络结构，某些节点出现故障时会自动分配其他节点代替其进行工作。

## 4、与关系型数据库对比

* 结构相似

| database（数据库） | index（索引库）  |
| :----------------: | :--------------: |
|    table（表）     |   type（类型）   |
|     row（行）      | document（文档） |
|    column（列）    |  field（字段）   |

* 一个ES集群可以有多个索引库。每个索引库包含很多种类型，类型中又包含了很多文档，每个文档又包含很多字段

* 传统数据库为特定列增加一个索引。Elasticsearch和Lucene使用一种叫做倒排索引(inverted index)的数据结构来达到相同目的

* 倒排索引：
  * 源于实际应用中需要根据属性的值来查找记录。
  * 种索引表中的每一项都包括一个属性值和具有该属性值的各记录的地址。
  * 不是由记录来确定属性值，而是由属性值来确定记录的位置

​      

# 二、安装与部署

环境要求：JDK版本为1.7及以上

下载位置：[系列产品](https://www.elastic.co/downloads/ )

1、在安装目录下的config 目录下：编辑elasticsearch.yml文件

编辑内容： (注意要顶格写，冒号后面要加一个空格)

```
a)	Cluster.name:  shsxt 			 (同一集群要一样)
b)	Node.name：node-1 			    (同一集群要不一样)
c)	Network.Host: 192.168.1.194   	 (这里不能写127.0.0.1)
d)	防止脑裂的配置
discovery.zen.ping.multicast.enabled: false
discovery.zen.ping_timeout: 120s
client.transport.ping_timeout: 60s
discovery.zen.ping.unicast.hosts: ["192.168.1.191","192.168.1.192", "192.168.1.193"]

```

然后，将安装包发送到其他节点，再根据所在节点，进行相应的配置

2、启动 （开几台起几台）

ES_HOME/bin/elasticsearch     （ctrl + C 结束服务）

ES_HOME/bin/elasticsearch -d(后台运行)     （前提页面结束服务或者kill 杀死进程）

`启动权限问题`

1、启动后会报错，说不能在root用户下执行，所以我们需要添加新用户来执行启动

（分别在3台节点上）

```
useradd es
passwd
（设置密码）
chown —R es:es filename(路径/ES的解压文件)
（修改ES安装文件的权限为用户es）
su es
（切换用户为es）
再执行启动命令
```

显示：（在启动的所有节点上都会显示出所选举的master节点，此处为node0）

```
2019-01-26 03:22:40,594cluster.service           detected_master {node0}{GOmO6SISRHexhlbqcddx9w}{192.168.198.128}{192.168.198.128:9300}, added {{node0}{GOmO6SISRHexhlbqcddx9w}{192.168.198.128}{192.168.198.128:9300},{node2}{blKR0BxaQ92QjmPuMlPaRw}{192.168.198.131}{192.168.198.131:9300},}, reason: zen-disco-receive(from master [{node0}{GOmO6SISRHexhlbqcddx9w}{192.168.198.128}{192.168.198.128:9300}])
```

4.访问

```
浏览器访问 http://localhost:9200
```

`注意`

> 9200  : 是HTTP协议所访问的端口，即从浏览器端访问的port
>
> 9300  ：是Java API访问端口

# ES整合hive

创建Hive映射ES的外表

```sql
CREATE EXTERNAL TABLE `es_analysis_order`(
  `id` string COMMENT 'from deserializer', 
  `user_id` string COMMENT 'from deserializer', 
  `sum_2000` int COMMENT 'from deserializer', 
  `sum_3000` int COMMENT 'from deserializer', 
  `day` int COMMENT 'from deserializer')
ROW FORMAT SERDE 
  'org.elasticsearch.hadoop.hive.EsSerDe' 
STORED BY 
  'org.elasticsearch.hadoop.hive.EsStorageHandler' 
WITH SERDEPROPERTIES ( 
  'serialization.format'='1')
TBLPROPERTIES (
  'es.mapping.id'='id', 
  'es.mapping.names'='user_id:user_id,sum_2000:sum_2000,sum_3000:sum_3000,day:day', 
  'es.nodes'='10.10.65.198,10.10.151.212,10.10.114.206', 
  'es.port'='9200', 
  'es.resource'='behaviors/order_user', 
  'es.write.operation'='index')
```



# 三、REST风格

## 1、简介

**表现层状态转换**（[英语](https://zh.wikipedia.org/wiki/%E8%8B%B1%E8%AF%AD)：**Representational State Transfer**，[缩写](https://zh.wikipedia.org/wiki/%E7%B8%AE%E5%AF%AB)：**REST**）

```
一种万维网软件架构风格，
目的是便于不同软件/程序在网络（例如互联网）中互相传递信息。表现层状态转换是根基于超文本传输协议(HTTP)之上而确定的一组约束和属性，是一种设计提供万维网络服务的软件构建风格。
匹配或兼容于这种架构风格(简称为 REST 或 RESTful)的网络服务，允许客户端发出以统一资源标识符访问和操作网络资源的请求，而与预先定义好的无状态操作集一致化。
因此表现层状态转换提供了在互联网络的计算系统之间，彼此资源可交互使用的协作性质(interoperability)。
相对于其它种类的网络服务，例如 SOAP服务则是以本身所定义的操作集，来访问网络上的资源。
```

要点：

```
需要注意的是，
REST是设计风格而不是标准。REST通常基于使用HTTP，URI，和XML以及HTML这些现有的广泛流行的协议和标准。

* 资源是由URI来指定。
* 对资源的操作包括获取、创建、修改和删除资源，这些操作正好对应HTTP协议提供的GET、POST、PUT和DELETE方法。
* 通过操作资源的表现形式来操作资源。
* 资源的表现形式则是XML或者HTML，取决于读者是机器还是人，是消费web服务的客户软件还是web浏览器。当然也可以是任何其他的格式，例如JSON。
```



> URI  ： 统一资源标识符
>
> URL  ： 全球资源定位器



![](https://wx1.sinaimg.cn/large/005zftzDgy1fzj3dsu1n9j30ha09vn0p.jpg)

## 2、Rest操作

REST的操作分为以下几种：

– GET：获取对象的当前状态；

– PUT：改变对象的状态；

– POST：创建对象；

– DELETE：删除对象；

– HEAD：获取头信息。

## 3、ES内置的REST接口



![](https://wx1.sinaimg.cn/large/005zftzDgy1fzj3feth0wj30fe08taci.jpg)



# 四、CURL命令

-X  指定http请求的方法

-HEAD  GET POST  PUT DELETE

-d  指定要传输的数据

## 1、索引库的创建与删除

创建索引库：（PUT/POST都可以）

```
curl -XPUT http://192.168.198.128:9200/sukie/
```

显示：（成功了）

> [root@node00 ~]# curl -XPUT http://192.168.198.128:9200/sukie/
> {"acknowledged":true}[root@node00 ~]# 

删除索引库：

```
curl -XDELETE http://192.168.198.128:9200/sukie/
```

## 2、创建document

```
(注意格式：JSON  （英文状态下）)
                                               
curl -XPUT http://192.168.198.128:9200/sukie/employee/2?pretty -d '{ 
"first_name" : "john", 
"last_name" : "smith", 
"age" : 25, 
"love" : "I love to go rock climbing", 
"address": "shanghai"
}'

```

==employee==  ： 在此处为type（类型）

==1==  ： 在此处为id

==pretty==： 表示以良好格式显示结果



显示：

> ```
> [root@node00 ~]# curl -XPUT http://192.168.198.128:9200/sukie/employee/2?pretty -d '{ 
> 
> "first_name" : "john", 
> "last_name" : "smith", 
> "age" : 25, 
> "love" : "I love to go rock climbing", 
> "address": "shanghai"
> }'
> 
> {
>   "_index" : "sukie",
>   "_type" : "employee",
>    "_id" : "2",
>    "_version" : 1,
>   "_shards" : {
>     "total" : 2,
>     "successful" : 2,
>    "failed" : 0
>   },
>    "created" : true
> }
> [root@node00 ~]# 
> ```
>
>



```
curl -XPOST http://192.168.198.128:9200/sukie/employee -d '{ 
"first_name" : "john", 
"last_name" : "smith", 
"age" : 25, 
"about" : "I love to go rock climbing"
}'

```

==未指定id==

如：（必须使用POST）

```
命令：
curl -XPOST http://localhost:9200/sukie/employee -d '{"first_name" : "John"}'
```

若：（使用PUT会报错）

```
命令：
curl -XPUT http://localhost:9200/sukie/employee -d '{"first_name" : "John"}' 
会报错
```

`创建索引注意事项`

> * 索引库名称必须要全部**`小写`**，**`不`**能以下划线开头，也**`不`**能包含逗号
> * 如果没有明确指定索引数据的ID，那么es会自动生成一个随机的ID，这时需要使用POST方式，PUT方式会出错



## 3、更新document

```
curl -XPUT http://192.168.198.128:9200/sukie/employee/2 -d '
{
 "first_name" : "god bin",
 "last_name" : "pang",
 "age" : 38,
 "about" : "I love to go rock climbing",
 "address": "shanghai"
}'
```



```

curl -XPOST http://192.168.198.128:9200/sukie/employee?pretty -d '{ 
"first_name" : "john", 
"last_name" : "smith", 
"age" : 25, 
"about" : "I love to go rock climbing"
}'

```

显示：



```
[root@node00 ~]# curl -XPOST http://192.168.198.128:9200/sukie/employee?pretty -d '{ 
> "first_name" : "john", 
> "last_name" : "smith", 
> "age" : 25, 
> "about" : "I love to go rock climbing"
> }'
{
  "_index" : "sukie",
  "_type" : "employee",
   "_id" : "AWiFmf347KNgqTe_uJ4-",    ==自动生成的id==
   "_version" : 1,
  "_shards" : {
    "total" : 2,
     "successful" : 2,
    "failed" : 0
  },
   "created" : true
}
[root@node00 ~]# 

```



put  ： 必须指定id   ，若id存在，这更新数据（全局更新）；若id不存在，则新增数据

```
curl -XPUT http://localhost:9200/sukie/employee/1 -d '{"city":"beijing","car":"BMW"}'
```

`注意;`执行更新操作时：

– ES首先将旧的文档标记为删除状态 

– 然后添加新的文档 

– 旧的文档不会立即消失，但是你也无法访问 

– ES会在你继续添加更多数据的时候在后台清理已经标记为删除状态的文档

-----

post  ： id若不指定，会自动生成随机的id

​                id若指定，就实现局部更新操作（添加新字段或更新已有字段）

```
 curl -XPOST http://localhost:9200/sukie/employee/1/_update -d '
{
"doc":{
"city":"beijing",
  “sex”:”male”
}
}'

```

（同一个索引库，会默认创建5个分片，用以实现分布式搜索；

   每个分片均另外还有一个副本分布在不同的另一个节点上，用以提高可靠性和查询速率）

==注意==

------

同一个索引库中不同的文档之间若用相同的字段，则这个字段的数据类型必须是一致的；

字段的数据类型是由第一次推送数据是确定

------



## 4、普通查询索引

```
– 根据员工id查询 
curl -XGET http://localhost:9200/sukie/employee/1?pretty
– 在任意的查询字符串中添加pretty参数，es可以得到易于识别的json结果。 
– curl后添加-i 参数，这样你就能得到反馈头文件
curl -i XGET http://localhost:9200/sukie/employee/1?pretty
– 检索文档中的一部分，如果只需要显示指定字段
curl -XGET http://localhost:9200/sukie/employee/1?_source=name,age 
如果只需要source的数据 
curl -XGET http://localhost:9200/sukie/employee/1/_source?pretty
– 查询所有
curl -XGET http://localhost:9200/sukie/employee/_search?pretty 
– 根据条件进行查询 
curl -XGET http://localhost:9200/sukie/employee/_search?q=last_name:smith

```



## 5.DSL查询

DSL查询 •Domain Specific Language 

– 领域特定语言 

```
curl -XGET http://localhost:9200/shsxt/employee/_search?pretty -d '{
"query":
{"match":
{"last_name":"smith"}
}
}'
```

 

\#对多个field发起查询：multi_match

```
curl -XGET http://localhost:9200/shsxt/employee/_search?pretty -d '
{
 "query":
  {"multi_match":
   {
    "query":"bin",
    "fields":["last_name","first_name"]
   }
  }
}'
```



复合查询，must，must_not, should 

must： AND   

must_not：NOT

should：OR

```
curl -XGET http://192.168.78.101:9200/shsxt/employee/_search?pretty -d '
{
 "query":
  {"bool" :
   {
    "must" : 
     {"match":
      {"first_name":"bin"}
     },
    "must" : 
     {"match":
      {"age":37}
     }
   }
  }
}'
```

 

查询first_name=bin的，并且年龄不在20岁到30岁之间的

```
curl -XGET http://192.168.78.101:9200/shsxt/employee/_search -d '
{
 "query":
  {"bool" :
   {
   "must" :
    {"term" : 
     { "first_name" : "bin" }
    }
   ,
   "must" : 
    {"range":
     {"age" : { "from" : 30, "to" : 40 }
    }
   }
   }
  }
}'
```



## 6.删除索引

```
curl -XDELETE http://localhost:9200/shsxt/employee/1?pretty
```

• 如果文档存在，es会返回200 ok的状态码，found属性值为 true，_version属性的值+1 

• found属性值为false，但是_version属性的值依然会+1，这个就是内部管理的一部分，它保证了我们在多个节点间的不同操作的顺序都被正确标记了 

• 注意：删除一个文档也不会立即生效，它只是被标记成已删除。 Elasticsearch将会在你之后添加更多索引的时候才会在后台进行删除内容的清理



# 五、Elasticsearch插件安装

## 1、head

（至少一台）

方式一：

在bin目录下执行

```
./plugin install mobz/elasticsearch-head
```

来安装head插件

方式二：

使用elasticsearch-head-master.zip文件安装

在bin目录下执行

```
./plugin install file:/usr/soft/elasticsearch-head-master.zip
```

来安装head插件

方式三：

将elasticsearch-head-master.zip挤压解压安装后的包拷贝到elasticsearch安装目录的plugins目录下



安装后启动elasticsearch（至少2台）

访问<http://ip:9200/_plugin/head>

## 2.Kibana

（1台）

> 它是一个基于浏览器页面的ES前端展示工具，是为ES提供日志分析的web接口，可用它对日志进行高效的搜索、可视化、分析等操作。

解压安装,然后修改配置文件config/kibana.yml的elasticsearch.url属性即可

## 3、Marvel

> Marvel插件可以帮助使用者监控elasticsearch的运行状态，不过这个插件需要license。安装完license后可以安装marvel的agent，agent会收集elasticsearch的运行状态

**Step 1:** **Install Marvel into Elasticsearch:(3**台**es**都装)

Es_home/bin/plugin install license
 Es_home/bin/plugin install marvel-agent

（注意：Es_home/plugins 目录的权限问题，是否为当前用户的）

**Step 2:** **Install Marvel into Kibana(**在kibana机器上安)

Kibana_home/bin/kibana plugin --install elasticsearch/marvel/latest

**Step 3: Start Elasticsearch and Kibana**

bin/elasticsearch

bin/kibana

**Step 4: 浏览器访问**  http://node00:5601/app/marvel

==注意：多台节点的时间同步==

## 4、分词器安装

从地址<https://github.com/medcl/elasticsearch-analysis-ik>

下载elasticsearch中文分词器

（1）在安装好的elasticsearch中在plugins目录下新建ik目录

（2）将此zip包拷贝到ik目录下

（3）将权限修改为elasticsearch启动用户的权限

（4）过unzip命令解压缩：

```
unzip  elasticsearch-analysis-ik-1.8.0.zip
```

（5）每台机器都这样操作，重新启动elasticsearch集群

`例子：`

a. 创建索引库

```
curl -XPUT http://localhost:9200/ik
```

b. 设置mapping

```
curl -XPOST http://localhost:9200/ik/ikType/_mapping -d'{
        "properties": {
            "content": {
                "type": "string",
                "index":"analyzed",
                "analyzer": "ik_max_word",
                "search_analyzer": "ik_max_word"
            }
       }
}'
```

 

c.  插入数据

```
curl -XPOST http://localhost:9200/ik/ikType/1 -d'
{"content":"美国留给伊拉克的是个烂摊子吗"}'

curl -XPOST http://localhost:9200/ik/ikType/2 -d'
{"content":"公安部：各地校车将享最高路权"}'

curl -XPOST http://localhost:9200/ik/ikType/3 -d'
{"content":"中韩渔警冲突调查：韩警平均每天扣1艘中国渔船"}'

curl -XPOST http://localhost:9200/ik/ikType/4 -d'
{"content":"中国驻洛杉矶领事馆遭亚裔男子枪击 嫌犯已自首"}'
```

d. 查询

```
curl -XGET http://localhost:9200/ik/ikType/_search?pretty  -d'{
    "query" : { "term" : { "content" : "中国" }}
   }'
```

 



本地分片

只在主分片

优先主分片

只在某个节点分片

指定几个节点分片

优先指定分片



脑裂：

集群中出现两个master；1、负载过高时，master所在的节点负责管理和检索，忙不过来了，slaves节点就选出了另一个master；（功能解耦，用两台节点分别负责一个模块；一个放master，一个放data）；

2、网络波动，节点间的通信出现问题，超时连接，另一台master就又被选出来了;(解决：异地服务器）；



优化：

系统最大文件打开数量（默认1024个）

ES JVM内存大小（256m，1g，最好设为相同值）

【256m用满了，启动垃圾回收机制，然后扩容；弹性伸缩，因为GC会影响性能。】

设置mlockall来锁定物理进程true

【Linux：swap交换区（磁盘空间：存放不用的内存）】



分片数要合理

单个分片存储：20g~30g

个数=数据总量/20g

再建一个索引库，因为支持多个索引库检索



副本：数据迁移时，先设置为0，网络和磁盘IO可以降低。

segment分片存储时的片段设为1 



删除文档时，添加del标记，到客户端时再过滤。

hash取余再放到对应的分片