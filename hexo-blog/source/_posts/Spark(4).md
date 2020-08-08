---
title: Spark学习（四）
date: 2019-2-19
update: 2019-2-20
tags:
  - 广播
  - 累加器
  - github
categories: Spark
grammar_cjkRuby: true
mathjax: true
overdue: true
no_word_count: false
description: Spark学习第四篇章：广播变量、累加器、SparkShuffle、spark内存管理、shuffle调优
abbrlink: 4eb34bcf
---

# 一、广播变量

## 1、广播变量理解图

![](https://wx1.sinaimg.cn/large/005zftzDgy1g0cxiwpy6gj30fy0h2tax.jpg)

## 2、广播变量的使用

Java:

```java
package com.bd.java.core;

import java.util.Arrays;
import java.util.List;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.Function;
import org.apache.spark.api.java.function.VoidFunction;
import org.apache.spark.broadcast.Broadcast;
/**
 * 广播变量：
 * 1.不能将一个RDD使用广播变量广播出去，因为RDD是不存数据的，可以将RDD的结果广播出去。
 * 2.广播变量只能在Driver端定义，不能在Executor端定义。
 * 3.在Driver端可以修改广播变量的值，在Executor端不能修改广播变量的值。
 */
public class BroadCast {
	public static void main(String[] args) {
		SparkConf conf = new SparkConf();
		conf.setMaster("local").setAppName("broadcast");
		JavaSparkContext sc = new JavaSparkContext(conf);
        //List中已经实现了序列化，可以用于跨网络传输
		List<String> list = Arrays.asList("hello bjsxt");
		//广播变量将list广播出去
		final Broadcast<List<String>> broadCastList = sc.broadcast(list);

		JavaRDD<String> lines = sc.textFile("data/word.txt");
		JavaRDD<String> result = lines.filter(new Function<String, Boolean>() {		
		
			private static final long serialVersionUID = 1L;
			@Override
			public Boolean call(String s) throws Exception {                       
                //匿名内部类中使用的变量必须使用final修饰
				return broadCastList.value().contains(s);
			}
		});
		result.foreach(new VoidFunction<String>() {			
		
			private static final long serialVersionUID = 1L;
			@Override
			public void call(String t) throws Exception {
				System.out.println(t);
			}
		});	
		sc.close();		
	}
}
```

Scala:

```scala
val conf = new SparkConf()
conf.setMaster("local").setAppName("brocast")
val sc = new SparkContext(conf)
val list = List("hello xasxt")
val broadCast = sc.broadcast(list)
val lineRDD = sc.textFile("./words.txt")
lineRDD.filter { x => {
    println(broadCast.value)
    broadCast.value.contains(x) 
}.foreach { println}
sc.stop()
```

## 3、注意事项

> * 为什么使用广播变量
>
>    
>
> * 能不能将一个 RDD 使用广播变量广播出去？
>   不能，因为RDD是不存储数据的。可以将RDD的结果广播出去。
> * 广播变量只能在 Driver 端定义，在Executor端使用，不能在 Executor 端定义。
> * 在 Driver 端可以修改广播变量的值，在 Executor 端无法修改广播变量的值
> * 代码中，算子内部执行是在Executor端，其余的在Driver端
> * 系列化：用于机器之间跨网络传输时，要将文件序列化到磁盘才可完成传输
> * 内存大会频繁的gc（垃圾回收）就会卡顿，如果内存还不够，就会报oom（内存溢出）



# 二、累加器

## 1、累加器理解图

![](https://wx1.sinaimg.cn/large/005zftzDgy1g0da58qfv9j30m40c4q9q.jpg)



![](https://wx1.sinaimg.cn/large/005zftzDgy1g0da61a9htj30lx0ebn4i.jpg)

## 2、累加器的使用

Java：

```java
package com.bd.java.core;

import org.apache.spark.Accumulator;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.VoidFunction;
import org.apache.spark.rdd.RDD;

/**
 * 累加器在Driver端定义赋初始值和读取，在Executor端累加。
 */
public class AccumulatorOperator {
	public static void main(String[] args) {
		SparkConf conf = new SparkConf();
		conf.setMaster("local").setAppName("accumulator");
		JavaSparkContext sc = new JavaSparkContext(conf);
        //获取累加器：初始值为0
		final Accumulator<Integer> accumulator = sc.accumulator(0);
 
		sc.textFile("data/word.txt",2).foreach(new VoidFunction<String>() {
		
			private static final long serialVersionUID = 1L;
			@Override
			public void call(String t) throws Exception {
				accumulator.add(1);
                //不能再Executor端获取accumulator.value()来触发累加
//				System.out.println(accumulator.value());
				System.out.println(accumulator);
			}
		});
  // accumulator.value 写法只能在driver端，excutor端的task只能用accumulator的写法来查看数据
		System.out.println(accumulator.value());
		sc.stop();		
	}
}
```

Scala:

```scala
val conf = new SparkConf()
conf.setMaster("local").setAppName("accumulator")
val sc = new SparkContext(conf)
val accumulator = sc.accumulator(0)
/*
val count = 0
sc.textFile("./words.txt").foreach { x =>{
count+=1
println("count:"+count)
}} 
//結果count打印为0 ， 因为count未能序列化，无法实现跨网络传输
*/
sc.textFile("./words.txt").foreach { x =>{accumulator.add(1)}}
println(accumulator.value)
sc.stop()
```

`注意：`

* 累加器在Driver端定义赋初始值，累加器只能在Driver端读取，在 Excutor 端更新。



# 三、SparkShuffle

## 1、SparkShuffle 概念

reduceByKey 会将上一个 RDD 中的每一个 key 对应的所有 value 聚合成一个 value，然后生成一个新的 RDD，元素类型是<key,value>对的形式，这样每一个 key 对应一个聚合起来的 value。

**`问题`：**聚合之前，每一个 key 对应的 value 不一定都是在一个 partition中，也不太可能在同一个节点上，因为 RDD 是分布式的弹性的数据集，RDD 的 partition 极有可能分布在各个节点上。

**`如何聚合？`**

* – – **Shuffle Write** ：上一个 stage 的每个 map task 就必须保证将自己处理的当前分区的数据相同的 key 写入一个分区文件中，可能会写入多个不同的分区文件中。
* – – **Shuffle Read** ：reduce task 就会从上一个 stage 的所有 task 所在的机器上寻找属于自己的那些分区文件，这样就可以保证每一个 key 所对应的 value 都会汇聚到同一个节点上去处理和聚合。
* Spark 中有两种 Shuffle 类型，HashShuffle 和 SortShuffle，Spark1.2之`前`是 `HashShuffle` 默认的分区器是 HashPartitioner，Spark1.2 引入`SortShuffle` 默认的分区器是 RangePartitioner。

## 2、HashShuffle

### 1> **普通机制**

*  普通机制示意图

![](https://wx1.sinaimg.cn/large/005zftzDgy1g0dax2jtxwj30qv0enwqa.jpg)

* 执行流程
  a) 每一个 map task 将不同结果写到不同的 buffer 中，每个buffer 的大小为 **`32K`**。buffer 起到数据缓存的作用。

  b) 每个 buffer 文件最后对应一个磁盘小文件。

  c) reduce task 来拉取对应的磁盘小文件。

* 总结
  ① .map task 的计算结果会根据分区器（默认是hashPartitioner）来决定写入到哪一个磁盘小文件中去。
  ReduceTask 会去 Map 端拉取相应的磁盘小文件。
  ② .产生的磁盘小文件的个数：M（map task 的个数）*R（reduce task 的个数）
*  存在的问题
    产生的磁盘小文件过多，会导致以下问题：
    a) 在 Shuffle Write 过程中会产生很多写磁盘小文件的对象。
    b) 在 Shuffle Read 过程中会产生很多读取磁盘小文件的对象。
    c) 在JVM堆内存中对象过多会造成频繁的gc,gc还无法解决运行所需要的内存 的话，就会 OOM。
    d) 在数据传输过程中会有频繁的网络通信，频繁的网络通信出现通信故障的可能性大大增加，一旦网络通信出现了故障会导致 shuffle file cannot find 由于这个错误导致的 task 失败，TaskScheduler 不负责重试，由 DAGScheduler 负责重试 Stage。

### 2> 合并机制

 合并机制示意图

![](https://wx1.sinaimg.cn/large/005zftzDgy1g0db1l3k43j30sd0euwov.jpg)



* 总结
  产生磁盘小文件的个数：C(core 的个数)*R（reduce 的个数）

## 3、SortShuffle

### 1> 普通机制

 普通机制示意图

![](../images/sortShuffle普通机制.jpg)

* 执行流程

a) map task 的计算结果会写入到一个内存数据结构里面，内存数据结构默认是 5M
b) 在 shuffle 的时候会有一个定时器，不定期的去估算这个内存结构的大小，当内存结构中的数据超过 5M 时，比如现在内存结构中的数据为 5.01M，那么他会申请 5.01*2-5=5.02M 内存给内存数据结构。
c) 如果申请成功不会进行溢写，如果申请不成功，这时候会发生溢写磁盘。
d) 在溢写之前内存结构中的数据会进行排序分区
e) 然后开始溢写磁盘，写磁盘是以batch的形式去写，一个batch是 1 万条数据，
f) map task 执行完成后，会将这些磁盘小文件合并成一个大的磁盘文件，同时生成一个索引文件。
g) reduce task 去 map 端拉取数据的时候，首先解析索引文件，根据索引文件再去拉取对应的数据。

* 总结
  产生磁盘小文件的个数： 2*M（map task 的个数）

### 2>bypass 机制

 bypass机制示意图

![](../images/sortShuffle byPass机制.jpg)

 总结
① .bypass 运行机制的触发条件如下：
shuffle  reduce  task 的 数 量 小 于  spark.shuffle.sort.bypassMergeThreshold 的参数值。这个 值默认是 200。
② .产生的磁盘小文件为：2*M（map task 的个数）



## 4、Shuffle 文件寻址

### 1)MapOutputTracker

### 2) BlockManager

# 四、Spark 内存管理

## 1、静态内存管理分布图

## 2、统一内存管理分布图

## 3、reduce 中 OOM 如何处理？

# 五、Shuffle  调优

## 1、SparkShuffle 调优配置项如何使用？