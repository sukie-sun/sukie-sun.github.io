---
title: Kafka学习
date: 2019-1-28
tags:
  - 分布式
  - 消息队列系统
categories: Kafka
grammar_cjkRuby: true
description: 'Kafka的详细学习第一篇章:Kafka是一个高吞吐量、低延迟分布式的消息队列系统。'
abbrlink: c4f61a31
---

# 一、Kafka简介

Kafka是一个高吞吐量、低延迟分布式的消息队列系统。

特点：每秒钟可以处理几十万条消息，他的低延迟最低只有几毫秒。

官网：https://kafka.apache.org/

底层使用Scala语言实现。

注意：

1、A streaming platform has three key capabilities:

* Publish and subscribe to streams of records, similar to a message queue or enterprise messaging system.
* Store streams of records in a fault-tolerant durable way.
* Process streams of records as they occur.

2、Kafka is generally used for two broad classes of applications:

* Building real-time streaming data pipelines that reliably get data between systems or applications
* Building real-time streaming applications that transform or react to the streams of data

![](https://wx1.sinaimg.cn/large/005zftzDgy1g1qq5c9zntj30hf0e7gnl.jpg)

3、First a few concepts:

* Kafka is run as a cluster on one or more servers that can span multiple datacenters.
* The Kafka cluster stores streams of *records* in categories called *topics*.
* Each record consists of a key, a value, and a timestamp.

4、Kafka has four core APIs:

* The [Producer API](https://kafka.apache.org/documentation.html#producerapi) allows an application to publish a stream of records to one or more Kafka topics.
* The [Consumer API](https://kafka.apache.org/documentation.html#consumerapi) allows an application to subscribe to one or more topics and process the stream of records produced to them.
* The [Streams API](https://kafka.apache.org/documentation/streams) allows an application to act as a *stream processor*, consuming an input stream from one or more topics and producing an output stream to one or more output topics, effectively transforming the input streams to output streams.
* The [Connector API](https://kafka.apache.org/documentation.html#connect) allows building and running reusable producers or consumers that connect Kafka topics to existing applications or data systems. For example, a connector to a relational database might capture every change to a table.

5、其他

* Kafka Cluster 中有多个Broker服务器，每个类型的消息被定义为`topic`
* 同一个topic内部的消息按照一定的key 和算法被分区（partition）存储到不同的Broker上
* Producer 和consumer 可以在不同的Broker上生产或消费topic

6、概念理解

* Topics and Logs：

  * Topic 即为每条发布到 Kafka 集群的消息都有一个类别，topic在 Kafka 中可以由多个消费者订阅、消费。
  * 每个 topic 包含一个或多个 partition（分区），partition 数量可以在创建 topic 时指定，每个分区日志中记录了该分区的数据以及索引信息。
  * Kafka 只保证一个分区内的消息有序，不能保证一个主题的不同分区之间的消息有序。为一个主题分配一个分区，才能保证所有消息绝对有序。
  * 分区会给每个消息记录分配一个顺序 ID 号（偏移量）， 能够唯一地标识该分区中的每个记录。Kafka 集群保留所有发布的记录，不管这个记录有没有被消费过，Kafka 提供相应策略通过配置从而对旧数据处理。

  ![](https://wx1.sinaimg.cn/large/005zftzDgy1g1qr0t4gc1j30e108edgs.jpg)

  * 每个消费者唯一保存的元数据信息就是消费者当前消费日志的位移位置。位移位置是由消费者控制，消费者可以通过修改偏移量读取任何位置的数据。

  ![](https://wx1.sinaimg.cn/large/005zftzDgy1g1qr8l7bkrj30dn07xaan.jpg)

* Producers -- 生产者
  指定 topic 来发送消息到 Kafka Broker

* Consumers -- 消费者
  根据 topic 消费相应的消息

*  Topic – 消息主题（类型）
    一个 topic 可以有多个 partition，分布在不同的 broker server 上

![](https://wx1.sinaimg.cn/large/005zftzDgy1g1qrbi5tyuj30h008aabe.jpg)

7、注意：

* consumer自己维护消费消息的offset
* 每一个consumer都有对应的group
* group内是queue消费模型
  * 每个consumer消费不同的partition
  * 一个消息被一个group消费一次
* group间是publish—subscribe消费模型
  * 每个group独立消费，互补影响
  * 一个消息被各个group消费一次

8、Kafka使用场景（允许数据丢失）

* 日志收集：收集各log ， 开放给各个consumer ， 如hbase， hadoop ， solr
* 消息系统： 群发消息

* 用户活动跟踪： 记录用户行为发布到topic中，提供给consumer做实时监控分析，或装载到hadoop，数仓中做离线分析
* 运营指标 ： 记录运营监控数据
* 流式处理 ： SparkStreaming ， storm

# 二、Kafka集群的部署和安装

## 1、集群规划：

zookeeper ： 三台（Kafka是分布式消息队列 ， 依赖zookeeper）

kafka  :  三台  node1、node2、node3

## 2、安装

安装zookeeper （详见zookeeper学习.md）

安装Kafka 

下载压缩包（官网地址：http://kafka.apache.org/downloads.html）

### 解压：

```shell
tar -zxvf kafka_2.10-0.9.0.1.tgz
```

### 修改配置文件：

config/server.properties

```properties
## broker.id broker集群中唯一标识id，0、1、2、3 依次增长（broker即 Kafka 集群中的一台服务器）
## 注：当前Kafka 集群共三台节点，分别为：node1、node2、node3。对应的 broker.id 分别为 0、1、2。
 broker.id=0
 ## zookeeper.connect: zk 集群地址列表
 zookeeper.connect=node1:2181、node2:2181、node3:2181
```

将当前 node1 服务器上的 Kafka 目录同步到其他 node2、node3 服务器上。



## 3、启动kafka集群

A、启动 Zookeeper 集群。

```shell
zkServer.sh start
```

B、启动 Kafka 集群。
分别在三台服务器上执行以下命令启动：

```shell
bin/kafka-server-start.sh config/server.properties
```

## 4、测试

创建话题（kafka-topics.sh --help 查看帮助手册）

1、创建 topic：

```shell
bin/kafka-topics.sh --zookeeper node1:2181,node2:2181,node3:2181 --create --replication-factor 2 --partitions 3 --topic test
#参数说明
#--replication-factor ：指定每个分区的复制因子个数，默认 1 个
## 副本有主从之分 ， 且副本分别放在不同的broker节点上
#--partitions ：指定当前创建的 kafka 分区数量，默认为 1 个
#--topic ：指定新建 topic 的名称
```

2、查看 topic 列表：

```shell
bin/kafka-topics.sh --zookeeper node1:2181,node2:2181,node3:2181 --list
```

3、查看“test”topic 描述：

```shell
bin/kafka-topics.sh --zookeeper node1:2181,node2:2181,node3:2181 --describe --topic test
```

--Isr （ in_synchronized_replication ）: 代表数据同步的节点

4、创建消费者：

```shell
bin/kafka-console-producer.sh --broker-list node1:9092,node2:9092,node3:9092 --topic test
```

然后，在当前节点的控制台输入任何内容，表作为生产的topic

5、创建消费者：（另选一台节点）

```shell
bin/kafka-console-consumer.sh --zookeeper node1:2181,node2:2181,node3:2181 --from-beginning --topic test
```

此时，在控制台会打印出消费的topic

消费的消息的offset存放在zookeeper中，使用`get + 路径` 命令 获取对应分区的offset

注：
查看帮助手册：

```shell
bin/kafka-console-consumer.sh help
```

# 三、 Flume & & Kafka的结合

## 1、Flume  安装

（详见Flume学习.md）

## 2、Flume + Kafka

A、启动 Kafka 集群。

```shell
bin/kafka-server-start.sh config/server.properties
```

B、配置 Flume 集群，并启动 Flume 集群。

```shell
bin/flume-ng agent -n a1 -c conf -f conf/fk.conf -Dflume.root.logger=DEBUG,console
```

Flume 配置文件 fk.conf 内容如下：

```
a1.sources = r1
a1.sinks = k1
a1.channels = c1

# Describe/configure the source
a1.sources.r1.type = avro
a1.sources.r1.bind = node3
a1.sources.r1.port = 41414

# Describe the sink
a1.sinks.k1.type = org.apache.flume.sink.kafka.KafkaSink
a1.sinks.k1.topic = testflume
a1.sinks.k1.brokerList = node1:9092,node2:9092,node3:9092
a1.sinks.k1.requiredAcks = 1
a1.sinks.k1.batchSize = 20

a1.sinks.k1.channel = c1

# Use a channel which buffers events in memory
a1.channels.c1.type = memory
a1.channels.c1.capacity = 1000000
a1.channels.c1.transactionCapacity = 10000

# Bind the source and sink to the channel
a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1
```

## 3 、测试

* 分别启动 Zookeeper、Kafka、Flume 集群。

* 创建 topic：

```shell
bin/kafka-topics.sh --zookeeper node1:2181,node2:2181,node3:2181 --create --replication-factor 2 --partitions 3 --topic testflume
```

* 启动消费者：

```shell
bin/kafka-console-consumer.sh --zookeeper node1:2181,node2:2181,node3:2181 --from-beginning --topic testflume
```

* 运行“RpcClientDemo”代码，通过 rpc 请求发送数据到 Flume 集群。Flume 中 source 类型为 AVRO 类型，此时通过 Java 发送 rpc 请求，测试数据是否传入 Kafka
* 其中，Java 发送 Rpc 请求 Flume 代码示例如下：
  （参考 Flume 官方文档：http://flume.apache.org/FlumeDeveloperGuide.html）

```java
import org.apache.flume.Event;
import org.apache.flume.EventDeliveryException;
import org.apache.flume.api.RpcClient;
import org.apache.flume.api.RpcClientFactory;
import org.apache.flume.event.EventBuilder;
import java.nio.charset.Charset;
/**
* Flume官网案例
* http://flume.apache.org/FlumeDeveloperGuide.html
* @author root
*/
public class RpcClientDemo {
public static void main(String[] args) {
MyRpcClientFacade client = new MyRpcClientFacade();
// Initialize client with the remote Flume agent's host and port
client.init("node1", 41414);
// Send 10 events to the remote Flume agent. That agent should be
// configured to listen with an AvroSource.
String sampleData = "Hello Flume!";
for (int i = 0; i < 10; i++) {
client.sendDataToFlume(sampleData);
System.out.println("发送数据：" + sampleData);
}
client.cleanUp();
}
}
class MyRpcClientFacade {
private RpcClient client;
private String hostname;
private int port;
public void init(String hostname, int port) {
// Setup the RPC connection
this.hostname = hostname;
this.port = port;
this.client = RpcClientFactory.getDefaultInstance(hostname,port);
// Use the following method to create a thrift client (instead of the
// above line):
// this.client = RpcClientFactory.getThriftInstance(hostname,port);
}
public void sendDataToFlume(String data) {
// Create a Flume Event object that encapsulates the sample data
Event event = EventBuilder.withBody(data,Charset.forName("UTF-8"));
// Send the event
try {
client.append(event);
} catch (EventDeliveryException e) {
// clean up and recreate the client
client.close();
client = null;
client = RpcClientFactory.getDefaultInstance(hostname,port);
// Use the following method to create a thrift client (instead of
// the above line):
// this.client =RpcClientFactory.getThriftInstance(hostname, port);
}
}
public void cleanUp() {
// Close the RPC connection
client.close();
}
}
```



# 四、Kafka数据丢失问题和重复消费问题

## 1、为什么会丢失？

Kafka ， 高吞吐 ， 一次能处理几十万条数据，

（1）生产数据时：

因为服务器（生产者）发送数据给Kafka后，kafka 将数据写入内存后，就直接返回操作成功的消息（ack机制 : 1（默认值）而ack机制 : 0 时，不用管是否操作成功，就发第二条），然后再发第二条，避免的磁盘I/O带来的延迟，可是，这样不安全，万一此时该节点宕机，数据就丢失了。

而为了解决数据丢失，可以在数据写入内存时，备份到其他节点,再返回操作成功的消息（ack机制 : -1）。

（2）消费数据时：

Client消费数据过程中，（频率很短）先更新了消费offset， 再处理数据（如100），结果宕机，那么重启后就会从下一个offset（如101）开始消费消息，那么100这条数据就丢失了。

解决方案：关闭自动提交  ， 改为 ， 手动提交，保证数据处理完毕后再提交消费offset。但是，解决了数据丢失，提高了性能消耗

## 2、数据重复消费问题

因为Client（消费者）设置定时（频率很长）向zookeeper更新消费消息的offset，（如100 ， 120） 如果在没达到定的时间（如120），client就宕机了，重启后会重新去zookeeper上查询offset， 那么在定的时间之前的消息offset（100到120之间）就不存在，Client就会重新（从100）开始消费，就造成了重复消费问题。

解决方案：关闭自动定时提交  ， 改为 ， 手动提交，保证数据处理完毕后再提交消费offset。但是，解决重复消费，提高了性能消耗。

## 3、注意

使用解决方案时，要注意业务的要求，是否能允许数据丢失和重复消费问题

## 4、API

​    high level api
​	简单，不灵活
​     simple api
​	复杂，但灵活