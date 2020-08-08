---
title: Spark学习（六）
date: 2019-2-22
update: 2019-2-22
tags:
  - Spark框架
  - SparkStreaming
  - 流式处理框架
categories: Spark
grammar_cjkRuby: true
mathjax: true
overdue: true
no_word_count: false
description: SparkStreaming 是流式处理框架，是 Spark API 的扩展，支持可扩展、高吞吐量、容错的实时数据流处理
abbrlink: 4423c551
---

# 一、 SparkStreaming简介

* SparkStreaming是流式处理框架，是Spark API的扩展，`支持`可扩展、高吞吐、容错的实时数据处理。

* 实时数据`来源`：kafka、Flume、Twitter、ZeroMQ、TCP Socket
* 可以使用高级功能的复杂算子来`处理`流数据：如 map、reduce、join、window
* 处理后的数据可以`存放`在文件系统、数据库等，方便实时展现

# 二、SparkStreaming 与 Storm 的区别

> * Storm 是纯实时的流式处理框架，SparkStreaming 是准实时的处理框架（微批处理）。因为微批处理，SparkStreaming 的吞吐量比 Storm 要高。
>
> * Storm 的事务机制要比 SparkStreaming 的要完善。 
>
> * Storm 支持动态资源调度。(spark1.2 开始和之后也支持)
>
> * SparkStreaming 擅长复杂的业务处理，Storm 不擅长复杂的业务处理，擅长简单的汇总型计算

|         SparkStreaming         |              Storm               |
| :----------------------------: | :------------------------------: |
| 微批处理，准实时的流式处理框架 | 实时计算框架，来一条数据马上处理 |
|        支持动态调整资源        |         支持动态调整资源         |
|            支持事务            |             支持事务             |
|       支持复杂的业务场景       |       处理场景相对简单一些       |

# 三、SparkStreaming的详情

## 1、运行流程

![](https://wx1.sinaimg.cn/large/005zftzDgy1g0ff16n6p0j30rp08075q.jpg)

> SparkStreaming会启动receive task一直接受数据，每个batchInterval的时间周期，就会把数据变成一个batch，然后进一步封装成RDD，最后变成DStream ,用户操作DStream 时，可以使用一系列算子： map、flatmap、filter。。。。。



> `情况：`
>
> 1、batchInterval为5s ，计算这批数据的时间为3s ，则此时 0—5s，在结束数据；5—10s，一边接收数据，一边处理上一批数据；依次类推。
>
> 2、batchInterval为5s ，计算这批数据的时间为6s ，则此时0—5s，在接收数据；5—10s，一边接收第二批数据，一边处理第一批数据；10—11s,一边接收第三批数据，一边处理第一批数据，第二批数据等待计算，就会造成数据堆积，如果SparkStreaming的数据存储是仅在内存中，就会发生OOM；如果设置StorageLevel 包含 disk, 则内存存放不下的数据会溢写至 disk, 加大延迟



> `注意；`
>
> * receiver task 是 7*24 小时一直在执行



## 2、SparkStreaming 代码

### （1）关于SparkStreaming 框架我们必须要知道的几点

> `注意：`
>
> * receiver模式下接收数据，local的模拟线程必须大于等于2：
>   * 一个线程用receiver的数据接收
>   * 一个线程用于执行job
>
> * Duration时间设置就是我们能接受的延迟度，需要根据集群的资源情况以及监控每一个job的执行时间来调节出最佳时间。
>
> * 创建JavaStreamingContext有两种方式：SparkConf 、 SparkContext
>
>   ```java
>   //     JavaSparkContext  →   JavaStreamingContext  
>   JavaStreamingContext jsc = 
>               new JavaStreamingContext(sc,Durations.seconds(5));  
>   //    JavaStreamingContext    →    JavaSparkContext
>   final JavaSparkContext sparkContext = jsc.sparkContext();
>   ```
>
> * 所有的代码逻辑完成以后，必须要有一个ouput opertion类算子
>
> * JavaStreamingContext.start()   ，Streaming框架便启动，之后，就不能再次添加业务逻辑
>
> * JavaStreamingContext.stop()   ，无参的stop( )  会把SparkContext一同关闭；stop(false) , 只会关闭StreamContext ,SparkContext依然存在
>
> * JavaStreamingContext.stop()停止之后不能再调用 start

### （2）代码举例：WordCount

```java
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.apache.spark.Accumulator;
import org.apache.spark.SparkConf;
import org.apache.spark.SparkContext;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.FlatMapFunction;
import org.apache.spark.api.java.function.Function2;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.api.java.function.VoidFunction;
import org.apache.spark.broadcast.Broadcast;
import org.apache.spark.streaming.Durations;
import org.apache.spark.streaming.Time;
import org.apache.spark.streaming.api.java.JavaDStream;
import org.apache.spark.streaming.api.java.JavaPairDStream;
import org.apache.spark.streaming.api.java.JavaReceiverInputDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;

import scala.Tuple2;

public class WordCountOnline {
	@SuppressWarnings("deprecation")
	public static void main(String[] args) {
		
  /**
     The master URL to connect to, 
     such as "local" to run locally with one thread, 
     "local[4]" to run locally with 4 cores, 
      or "spark://master:7077" to run on a Spark standalone cluster.
   */
		 final SparkConf conf = 
               new SparkConf().setMaster("local[2]").setAppName("WordCountOnline");
		/**
		 * 在创建streamingContext的时候 设置batch Interval
		 * 创建streamingContext有两种方式：conf， context
		 */
//    final JavaStreamingContext jsc = 
//             new JavaStreamingContext(conf, Durations.seconds(5));

		JavaSparkContext sc = new JavaSparkContext(conf);
//创建StreamContext，及间隔时间：每个5秒处理数据        
		JavaStreamingContext jsc = 
            new JavaStreamingContext(sc,Durations.seconds(5));         
//		final JavaSparkContext sparkContext = jsc.sparkContext();

//设置监听节点及端口，接收从这个节点的这个port输入的数据，最后封装成DStream
//避免端口被占用        
        JavaReceiverInputDStream<String> lines = 
                                   jsc.socketTextStream("node00", 9999);
//切割每一行数据
        JavaDStream<String> words = 
            lines.flatMap(new FlatMapFunction<String, String>() {

			private static final long serialVersionUID = 1L;
			@Override
			public Iterable<String> call(String s) {
				return Arrays.asList(s.split(" "));
			}
		});

		JavaPairDStream<String, Integer> ones = 
            words.mapToPair(new PairFunction<String, String, Integer>() {
//给每个单词计为1
			private static final long serialVersionUID = 1L;
			@Override
			public Tuple2<String, Integer> call(String s) {
				return new Tuple2<String, Integer>(s, 1);
			}
		});

//累加，并指定分区数
		JavaPairDStream<String, Integer> counts = 
            ones.reduceByKey(new Function2<Integer, Integer, Integer>() {

			private static final long serialVersionUID = 1L;
			@Override
			public Integer call(Integer i1, Integer i2) {
				return i1 + i2;
			}
		},3);

		//outputoperator类的算子   
// 		counts.print();
counts.foreachRDD(new VoidFunction<JavaPairRDD<String,Integer>>() {

		private static final long serialVersionUID = 1L;
		@Override
		public void call(JavaPairRDD<String, Integer> pairRDD) throws Exception {
                System.out.println("==============");
           pairRDD.foreach(new VoidFunction<Tuple2<String,Integer>>() {
                    
				private static final long serialVersionUID = 1L;
				@Override
                public void call(Tuple2<String, Integer> tuple)throws Exception {
                     System.out.println("tuple ---- "+tuple );
					}
				});
			}
		});

//框架启动必须调用start
 		jsc.start();
//等待spark程序被终止
 		jsc.awaitTermination();
//这个期间可用于一些扫尾操作，如获取SparkContext，如果直接stop，就无法实现了        
                
//任务执行结束
        jsc.stop();
        System.out.println("stop=====================");
	}
}

```

### （3）代码运行

在Linux系统中：

* 启动socket server 服务：node00

```shell
yum install nc -y
nc -lk 9999
```

* 在该节点上输入输入数据 （避免端口被占用）

> 在Windows端运行代码，便能接收到数据，从而执行运算处理

### 广播黑名单：

```java
package com.sxt.java.sparkstreaming;

import java.util.ArrayList;
import java.util.List;

import org.apache.spark.SparkConf;
import org.apache.spark.SparkContext;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.Function;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.api.java.function.VoidFunction;
import org.apache.spark.broadcast.Broadcast;
import org.apache.spark.streaming.Durations;
import org.apache.spark.streaming.api.java.JavaDStream;
import org.apache.spark.streaming.api.java.JavaPairDStream;
import org.apache.spark.streaming.api.java.JavaReceiverInputDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;

import com.google.common.base.Optional;
import scala.Tuple2;


 // 过滤黑名单（使用广播变量）
public class TransformOperator {

	public static void main(String[] args) {
		SparkConf conf = new SparkConf();
		conf.setMaster("local[2]").setAppName("transform");
		JavaStreamingContext jsc = 
            new JavaStreamingContext(conf,Durations.seconds(5));
		
		//模拟黑名单
		List<String> blackList = new ArrayList<String>();
		blackList.add("zhangsan");
		//广播黑名单	
		final Broadcast<List<String>> broadcastList =
            jsc.sparkContext().broadcast(blackList);
		
		//接受socket数据源: 1 zhangsan     2  lisi       3   wangwu
		JavaReceiverInputDStream<String> nameList = 
            jsc.socketTextStream("node01", 7777);
        
		JavaPairDStream<String, String> pairNameList = 
            nameList.mapToPair(new PairFunction<String, String, String>() {

			private static final long serialVersionUID = 1L;
			@Override
			public Tuple2<String, String> call(String s) throws Exception {
				return new Tuple2<String, String>(s.split(" ")[1], s);
			}
		});
//对DStream使用transform算子，在算子内部实现RDD到RDD的转换
		JavaDStream<String> transFormResult = 
pairNameList.transform(new Function<JavaPairRDD<String,String>,JavaRDD<String>>() {

			private static final long serialVersionUID = 1L;
			@Override
public JavaRDD<String> call(JavaPairRDD<String, String> nameRDD)throws Exception {

			JavaPairRDD<String, String> filter =
					nameRDD.filter(new Function<Tuple2<String,String>, Boolean>() {

					private static final long serialVersionUID = 1L;
					@Override
			public Boolean call(Tuple2<String, String> v1) throws Exception {
						//得到广播变量
						List<String> blackList = broadcastList.value();				
						return !blackList.contains(v1._1);
					}
				});
				return filter.map(new Function<Tuple2<String,String>, String>() {

					private static final long serialVersionUID = 1L;
					@Override
					public String call(Tuple2<String, String> v1)
							throws Exception {
						return v1._2;
					}
				});
			}
		});
		
		transFormResult.print();
		
		jsc.start();
		jsc.awaitTermination();
		jsc.stop();
	}
}
```

### 统计累计值：

从程序启动，到当前 ， 所有批次数据的累加值

```java
import java.util.Arrays;
import java.util.List;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.FlatMapFunction;
import org.apache.spark.api.java.function.Function2;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.api.java.function.VoidFunction;
import org.apache.spark.streaming.Durations;
import org.apache.spark.streaming.api.java.JavaDStream;
import org.apache.spark.streaming.api.java.JavaPairDStream;
import org.apache.spark.streaming.api.java.JavaReceiverInputDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;
import com.google.common.base.Optional;
import scala.Tuple2;

public class UpdateStateByKeyOperator {
    public static void main(String[] args) {
        
        SparkConf conf = new  SparkConf()
        conf.setMaster("local[2]").setAppName("UpdateStateByKeyDemo");
        JavaStreamingContext jsc =
            new JavaStreamingContext(conf, Durations.seconds(5));
//设置checkpoint目录
// 		jsc.checkpoint("hdfs://shsxt/spark/checkpoint");
        jsc.checkpoint("./checkpoint");
        
/* 数据格式：
   hello shsxt  
   hello bjsxt
*/

        JavaReceiverInputDStream<String> lines = 
            jsc.socketTextStream("node00", 9999);

        JavaDStream<String> words = 
            lines.flatMap(new FlatMapFunction<String, String>() {

            private static final long serialVersionUID = 1L;
            @Override
            public Iterable<String> call(String s) {
                return Arrays.asList(s.split(","));
            }
        });

        JavaPairDStream<String, Integer> ones = 
            words.mapToPair(new PairFunction<String, String, Integer>() {

            private static final long serialVersionUID = 1L;
            @Override
            public Tuple2<String, Integer> call(String s) {
                return new Tuple2<String, Integer>(s, 1);
            }
        });
//updateStateByKey  更新key值状态
        JavaPairDStream<String, Integer> counts =ones.updateStateByKey(
            new Function2<List<Integer>, Optional<Integer>, Optional<Integer>>() {

                    private static final long serialVersionUID = 1L;

                    @Override
          public Optional<Integer> call(
              List<Integer> values, Optional<Integer> state) throws Exception {
                        /**
                         * values:经过分组最后 这个key所对应的value  [1,1,1,1,1]
                         * state:这个key在前一个批次的状态
                         */

                        Integer updateValue = 0;
                        if (state.isPresent()) {
                            //如果存在值，便获取
                            updateValue = state.get();
                        }

                        System.out.println(updateValue + " ========  ");

                        for (Integer value : values) {
                            updateValue += value;
                        }
                        return Optional.of(updateValue);
                    }
                });

        //output operator
        counts.print();
//        counts.foreachRDD(new VoidFunction<JavaPairRDD<String, Integer>>() {
//            @Override
// public void call(JavaPairRDD<String, Integer> pairRDD) throws Exception {
//                System.out.println(pairRDD.getNumPartitions());
//
//                pairRDD.collect();
//            }
//        });

        jsc.start();
        jsc.awaitTermination();
        jsc.close();
    }
}
```





`注意：`

> Optional 类
>
> * Java 8 引入的类
> * 主要用于解决空指针异常的问题
> * 从本质上说，这是一个包含有可选值的包装类，意味着Optional 类既可以包含有对象，也可以为空

## 3、SparkStreaming算子操作

### 1、ouput opertion类算子

* >
  >
  > **foreachRDD**
  >
  >参数：RDD    返回值：无
  >
  >* foreachRDD可以遍历得到DStream中的RDD
  >* 可以对RDD使用RDD的Transformation类算子进行转化
  >
  >* 但是在这个算子内 **必须对抽取出来的RDD执行Action类算子**，代码才能执行
  >* 在这个算子**内**，RDD算子**外**执行的代码是在Driver端执行，RDD算子**内**的代码是在Executor中执行。
  >
  >   **print**


### 2、transformation类算子

* >
  >
  > **transform**
  >
  >参数：RDD   返回：另一RDD
  >
  > transform算子可将DStream做RDD到RDD的任意操作
  >
  >* 在这个算子**内**，RDD算子**外**执行的代码是在Driver端执行，RDD算子**内**的代码是在Executor中执行。
  >* 
  >
  > **updateStateByKey**
  >
  > * 此算子为SparkStreaming中每一个key维护一个state，state可以是任意类型，也可以是自定义对象，更新函数也可以是自定义
  > * 与reduceByKey相似的地方就是会先按key进行分组
  > * 通过更新函数对该 key 的状态不断更新，对于每个新的 batch 而言，SparkStreaming 会在使用 updateStateByKey 的时候为已经存在的 key 进行 state 的状态更新。
  > * 如果要不断的更新每个key的state，就一定涉及到了状态的保存和容错，这个时候就需要开启checkpoint机制和功能
  >
  > * 有何用？全面的广告点击分析，统计广告点击流量，统计这一天的车流量，统计点击量

### 3、注意

* #### 使用到 updateStateByKey 要开启 checkpoint 机制和功能。

```
//设置checkpoint目录: 
// 落地到本地磁盘
  jsc.checkpoint("./checkpoint");
//保存在hdfs
  jsc.checkpoint("hdfs://shsxt/spark/checkpoint");
```

* #### 多久会将内存中的数据(每一个key所对应的状态)写入到磁盘一份？

  > 如果batchInterval设置的时间小于10秒，那么10秒写入磁盘一份。
  >
  > 如果 batchInterval 设置的时间大于 10 秒，那么就会 batchInterval时间间隔写入磁盘一份。
  >
  > 这样做是为了防止频繁的写HDFS



### 4、窗口操作

#### (1)窗口操作理解图：

![](http://spark.apache.org/docs/latest/img/streaming-dstream-window.png)

假设每隔 5s 1 个 batch,上图中窗口长度为 15s，窗口滑动间隔 10s。

* 窗口长度和滑动间隔必须是 batchInterval 的整数倍。如果不是整数倍会检测报错。

> 用于计算最近一段时间的数据

#### (2)优化后的 window 窗口操作示意图： 

![](https://wx1.sinaimg.cn/large/005zftzDgy1g0fh4r65nej30g507b0vo.jpg)

* 优化后的 window 操作要保存状态所以要设置 checkpoint 路径，没有优化的 window 操作可以不设置 checkpoint 路径

#### (3)代码实现

```java
import java.util.Arrays;
import java.util.Iterator;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.function.FlatMapFunction;
import org.apache.spark.api.java.function.Function2;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.streaming.Durations;
import org.apache.spark.streaming.api.java.JavaDStream;
import org.apache.spark.streaming.api.java.JavaPairDStream;
import org.apache.spark.streaming.api.java.JavaReceiverInputDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;
import scala.Tuple2;

//基于滑动窗口的热点搜索词实时统计
public class WindowOperator {
	
	public static void main(String[] args) {
		SparkConf conf = new SparkConf()
		conf.setMaster("local[2]").setAppName("WindowHotWord"); 
		
		JavaStreamingContext jssc = 
            new JavaStreamingContext(conf, Durations.seconds(5));
//设置日志级别为WARN
		jssc.sparkContext().setLogLevel("WARN");
		/**
		 * 注意：
		 *  没有优化的窗口函数可以不设置checkpoint目录
		 *  优化的窗口函数必须设置checkpoint目录		 
		 */
//      jssc.checkpoint("hdfs://node1:9000/spark/checkpoint");
   		jssc.checkpoint("./checkpoint");
		JavaReceiverInputDStream<String> searchLogsDStream =
                            jssc.socketTextStream("node00", 9999);
		//word	1
		JavaDStream<String> searchWordsDStream = 
            searchLogsDStream.flatMap(new FlatMapFunction<String, String>() {

			private static final long serialVersionUID = 1L;
			@Override
			public Iterable<String> call(String t) throws Exception {
                System.out.println(t + "*************");
                return Arrays.asList(t.split(" "));
			}
		});
	
		// 将搜索词映射为(searchWord, 1)的tuple格式
		JavaPairDStream<String, Integer> searchWordPairDStream = 
            searchWordsDStream.mapToPair(				
				new PairFunction<String, String, Integer>() {

					private static final long serialVersionUID = 1L;
					@Override
		public Tuple2<String, Integer> call(String searchWord)throws Exception {
						return new Tuple2<String, Integer>(searchWord, 1);
					}					
				});
		/**
		 * 每隔10秒，计算最近60秒内的数据，
		 * 那么这个窗口大小就是60秒，里面有12个rdd，在没有计算之前，这些rdd是不会进行计算的。
		 * 那么在计算的时候会将这12个rdd聚合起来，然后一起执行reduceByKeyAndWindow操作 ，
		 * reduceByKeyAndWindow是针对窗口操作的而不是针对DStream操作的。
		 */
// JavaPairDStream<String, Integer> searchWordCountsDStream =
//		searchWordPairDStream.reduceByKeyAndWindow(
//                 new Function2<Integer, Integer, Integer>() {
//
//					private static final long serialVersionUID = 1L;
//					@Override
//					public Integer call(Integer v1, Integer v2) throws Exception {
//						return v1 + v2;
//					}
//		}, Durations.minutes(30), Durations.seconds(60));
//
//        JavaPairDStream<String, Integer> searchWordCountsDStream =
//            searchWordPairDStream.reduceByKeyAndWindow(
//        new Function2<Integer, Integer, Integer>() {
//                @Override
//                public Integer call(Integer v1, Integer v2) throws Exception {
//                    System.out.println(v1 + " : " + v2);
//                    return v1 + v2;
//                }
//            },Durations.seconds(15),Durations.seconds(5));
               // 窗口时间               滑块时间     

        //window窗口操作优化：
        //将划出串窗口的数据排除，将新划入窗口的数据添加
        JavaPairDStream<String, Integer> searchWordCountsDStream =
          searchWordPairDStream.reduceByKeyAndWindow(
            new Function2<Integer, Integer, Integer>() {
                @Override
                public Integer call(Integer v1, Integer v2) throws Exception {
                    System.out.println("v1:" + v1 + " v2:" + v2 + "  ++++++++++");
                    return v1 + v2;
                }
            }, new Function2<Integer, Integer, Integer>() {
                @Override
                public Integer call(Integer v1, Integer v2) throws Exception {
                    System.out.println("v1:" + v1 + " v2:" + v2 + "------------");
                    return v1 - v2;
                }
            }, Durations.seconds(15), Durations.seconds(5));

	  	searchWordCountsDStream.print();
		
		jssc.start();
		jssc.awaitTermination();
		jssc.close();
	}
}
```



* reduceByKeyAndWindow

> reduceByKeyAndWindow是针对窗口操作的而不是针对DStream操作的。



## 5. Driver HA（Standalone 或者 Mesos）

代码举例：

### 产生文件：

```java
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.UUID;
/**
 * 此复制文件的程序是模拟在data目录下动态生成相同格式的txt文件，用于给sparkstreaming 中 textFileStream提供输入流。
 */
public class CopyFile_data {
public static void main(String[] args) throws IOException, InterruptedException {
		while(true){
			Thread.sleep(5000);
			String uuid = UUID.randomUUID().toString();
			System.out.println(uuid);
	copyFile(
       new File("./data/scores.txt"),new File("./dataTest/"+uuid+"----words.txt"));
		}
	}
    
	public static void copyFile(File fromFile, File toFile) throws IOException {
		FileInputStream ins = new FileInputStream(fromFile);
		FileOutputStream out = new FileOutputStream(toFile);
		byte[] b = new byte[1024*1024];
		@SuppressWarnings("unused")
		int n = 0;
		while ((n = ins.read(b)) != -1) {
			out.write(b, 0, b.length);
		}
		ins.close();
		out.close();
	}
}
```

### 处理数据：

```java
import java.util.Arrays;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.function.FlatMapFunction;
import org.apache.spark.api.java.function.Function;
import org.apache.spark.api.java.function.Function2;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.streaming.Durations;
import org.apache.spark.streaming.api.java.JavaDStream;
import org.apache.spark.streaming.api.java.JavaPairDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;
import org.apache.spark.streaming.api.java.JavaStreamingContextFactory;
import org.apache.spark.streaming.dstream.DStream;
import scala.Tuple2;

/**
 *  Spark standalone or Mesos with cluster deploy mode only:
 *  在提交application的时候  添加 --supervise 选项  如果Driver挂掉 会自动启动一个Driver
 */
public class SparkStreamingOnHDFS {
	public static void main(String[] args) {
		final SparkConf conf =  
     new  SparkConf().setMaster("local[2]").setAppName("SparkStreamingOnHDFS");   
		
//      final String checkpointDirectory =
        "hdfs://shsxt/spark/SparkStreaming/CheckPoint2017";
		final String checkpointDirectory = "./checkpoint";

        JavaStreamingContextFactory factory = new JavaStreamingContextFactory() {
            @Override
			public JavaStreamingContext create() {  
				return createContext(checkpointDirectory,conf);
			}
		};
        
//getOrCreate() 该方法会先到checkpointDirectory的文件中检查是否有checkpoint记录，如果没有就会让 factory 去调用 create() 来创建JavaStreamingContext ；如果存在就执行checkpoint的任务
		JavaStreamingContext jsc = JavaStreamingContext.getOrCreate(checkpointDirectory, factory);
        
		jsc.start();
		jsc.awaitTermination();
		jsc.close();
	}

    @SuppressWarnings("deprecation")
	private static JavaStreamingContext 
        createContext(String checkpointDirectory,SparkConf conf) {

 // If you do not see this printed, that means the StreamingContext has been loaded
// from the new checkpoint
		System.out.println("Creating new context");
		SparkConf sparkConf = conf;
		// Create the context with a 1 second batch size

		JavaStreamingContext ssc = 
            new JavaStreamingContext(sparkConf, Durations.seconds(5));
//		ssc.sparkContext().setLogLevel("WARN");
		/**
		 *  checkpoint 保存：
		 *		1.配置信息
		 *		2.DStream操作逻辑
		 *		3.job的执行进度
		 *      4.offset
		 */
		ssc.checkpoint(checkpointDirectory);		
		/**
		 * 监控的是HDFS上的一个目录，监控文件数量的变化     文件内容如果追加监控不到。
		 * 只监控文件夹下新增的文件，减少的文件时监控不到的，文件的内容有改动也监控不到。
		 */
//		JavaDStream<String> lines = 
//        ssc.textFileStream("hdfs://node1:9000/spark/sparkstreaming");
		JavaDStream<String> lines = ssc.textFileStream("./dataTest");

        JavaDStream<String> words = 
            lines.flatMap(new FlatMapFunction<String, String>() {

			private static final long serialVersionUID = 1L;
			@Override
			public Iterable<String> call(String s) {
				return Arrays.asList(s.split(" "));
			}
		});


		JavaPairDStream<String, Integer> ones = 
            words.mapToPair(new PairFunction<String, String, Integer>() {

			private static final long serialVersionUID = 1L;
			@Override
			public Tuple2<String, Integer> call(String s) {

				return new Tuple2<String, Integer>(s.trim(), 1);
			}
		});

		JavaPairDStream<String, Integer> counts = 
            ones.reduceByKey(new Function2<Integer, Integer, Integer>() {
                
			private static final long serialVersionUID = 1L;
			@Override
			public Integer call(Integer i1, Integer i2) {
				return i1 + i2;
			}
		});

//        counts.print();

        DStream<Tuple2<String, Integer>> dstream = counts.dstream();

        dstream.saveAsTextFiles("./data/write/xxxxx","yyyyyy");
		return ssc;
	}
}

```



**`注意`**

* 因为 SparkStreaming 是 7*24 小时运行，Driver 只是一个简单的进程，有可能挂掉，所以实现 Driver 的 HA 就有必要

* 如果使用的 Client 模式就无法实现 Driver HA ，这里针对的是 cluster 模式

* Yarn 平台 cluster 模式提交任务，AM(AplicationMaster)相当于 Driver，如果挂掉会自动启动 AM

* 这里所说的 DriverHA 针对的是 Spark standalone 和 Mesos 资源调度的情况下

实现 Driver 的高可用有两个**`步骤`**：

* 第一：提交任务层面，在提交任务的时候加上选项 --supervise,当 Driver挂掉的时候会自动重启 Driver。

* 第二：代码层面，使用 JavaStreamingContext.getOrCreate（checkpoint路径，JavaStreamingContextFactory）
* Driver 中元数据包括：
  1. 创建应用程序的配置信息。
  2. DStream 的操作逻辑
  3. job 中没有完成的批次数据，也就是 job 的执行进度。

## 6、SparkStreaming+Kafka

### （1）receiver 模式

#### receiver 模式原理图



![](https://wx1.sinaimg.cn/large/005zftzDgy1g0g5e9n7b7j315j0ywn1a.jpg)

#### receiver 模式理解：

> 1.在 SparkStreaming 程序运行起来后，Executor 中会有 receivertasks 接收 kafka 推送过来的数据。数据会被持久化，默认级别为MEMORY_AND_DISK_SER_2,这个级别也可以修改。
>
> 2.receiver task对接收过来的数据进行存储和备份，这个过程会有节点之间的数据传输。
>
> 3.备份完成后去 zookeeper 中更新消费偏移量，然后向 Driver 中的 receiver tracker 汇报数据的位置。最后 Driver 根据数据本地化将 task 分发到不同节点上执行

>  数据本地化原则：将task分配到data所在节点

#### receiver 模式中存在的问题：

***场景一：***

> 1、当 Driver 进程挂掉后，Driver 下的 Executor 都会被杀掉，当更新完 zookeeper 消费偏移量的时Driver 如果挂掉了，就会存在找不到数据的问题，相当于丢失数据。如何解决这个问题？
>
> 2、开启**`WAL`**(write ahead log)*预写日志机制*， 在接受过来数据备份到其他节点的时候，同时备份到 HDFS 上一份（我们需要将接收来的数据的持久化级别降级到 MEMORY_AND_DISK），这样就能保证数据的安全性。
>
> 3、不过，因为写 HDFS 比较消耗性能，要在备份完数据之后才能进行更新 zookeeper 以及汇报位置等，这样会增加 job 的执行时间，这样对于任务的执行提高了延迟度

***场景二：***

> 开启了WAL机制
>
> 若数据接收完后（50~100），也将数据备份到另一节点和HDFS上，正准备更新偏移量（100）的时候，driver挂掉了，重启后，就会到HDFS上去获取未计算的数据，然后，检查偏移量（50），再根据偏移量去消费topic。这就出现了重复消费的现象



**`*术语解释：*`**

> SparkStreaming的receive模式能保证 at least模型，只能保证至少消费一次，不能保证仅被消费一次
>
> exactly-once模型   能保证仅被消费一次，较理想的模型可以避免重复消费，direct模式可以实现，但是输出不能保证

#### receiver 的并行度设置：

> 1、receiver 的并行度是由 spark.streaming.blockInterval 来决定的，默认为200ms,
>
> 2、假设 batchInterval 为 5s,那么每隔 blockInterval 就会产生一个 block,这里就对应每批次产生 RDD 的 partition,这样 5 秒产生的这个 Dstream 中的这个 RDD 的 partition 为 25 个，并行度就是25。
>
> 3、如果想提高并行度，可以减少 blockInterval 的数值，但是最好不要低于 50ms。

#### receiver 模式代码：

##### 产生数据：

```java
import kafka.javaapi.producer.Producer;
import kafka.producer.KeyedMessage;
import kafka.producer.ProducerConfig;
import kafka.serializer.StringEncoder;
import org.apache.kafka.clients.producer.KafkaProducer;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Properties;
import java.util.Random;

//向kafka中生产数据
public class MyProducer extends Thread {
  // sparkstreaming  storm  flink 两三年后变成主流  流式处理，可能更复杂，数据处理性能要非常好
    private String topic; //发送给Kafka的数据,topic
    private Producer<Integer, String> producerForKafka;

    public MyProducer(String topic) {
        this.topic = topic;
        Properties conf = new Properties();
        conf.put("metadata.broker.list", "node01:9092,node02:9092,node03:9092");
        conf.put("serializer.class", StringEncoder.class.getName());
        conf.put("acks",1);
        producerForKafka = new Producer<Integer, String>(new ProducerConfig(conf));
    }

    @Override
    public void run() {
        int counter = 0;
        while (true) {
          counter++;
         // String value = "shsxt" + counter;
            String value = "shsxt"
          KeyedMessage<Integer, String> message = new KeyedMessage<>(topic, value);

            producerForKafka.send(message);
            System.out.println(value + " - -- -- --- -- - -- - -");
//hash partitioner 当有key时，则默认通过key 取hash后 ，对partition_number 取余数
//			producerForKafka.send(new KeyedMessage<Integer, String>(topic,22,userLog));
//            每2条数据暂停2秒
            if (0 == counter % 2) {
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }
    public static void main(String[] args) {
        new MyProducer("sk1").start();
        new MyProducer("sk2").start();
    }
}
```



##### 操作：

```java
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import kafka.serializer.StringDecoder;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.function.FlatMapFunction;
import org.apache.spark.api.java.function.Function2;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.storage.StorageLevel;
import org.apache.spark.streaming.Durations;
import org.apache.spark.streaming.api.java.JavaDStream;
import org.apache.spark.streaming.api.java.JavaPairDStream;
import org.apache.spark.streaming.api.java.JavaPairReceiverInputDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;
import org.apache.spark.streaming.kafka.KafkaUtils;
import scala.Tuple2;

//receiver 模式并行度是由blockInterval决定的
public class SparkStreamingOnKafkaReceiver {

    public static void main(String[] args) {
     SparkConf conf = new SparkConf()
         conf.setAppName("SparkStreamingOnKafkaReceiver").setMaster("local[2]");
        //开启预写日志 WAL机制
        conf.set("spark.streaming.receiver.writeAheadLog.enable", "true");

        JavaStreamingContext jsc = 
            new JavaStreamingContext(conf, Durations.seconds(10));
        jsc.checkpoint("./receivedata");

        Map<String, Integer> topicConsumerConcurrency = 
            new HashMap<String, Integer>();
       //设置读取的topic和接受数据的线程数
        topicConsumerConcurrency.put("sk1", 1);
        topicConsumerConcurrency.put("sk2", 1);

        /**
         * 第一个参数是StreamingContext
         * 第二个参数是ZooKeeper集群信息
         （接受Kafka数据的时候会从Zookeeper中获得Offset等元数据信息）
         * 第三个参数是Consumer Group 消费者组
         * 第四个参数是消费的Topic以及并发读取Topic中Partition的线程数
         *
         * 注意：
         * KafkaUtils.createStream 使用五个参数的方法，设置receiver的存储级别
         */
//		JavaPairReceiverInputDStream<String,String> lines = KafkaUtils.createStream(
//				jsc,
//				"node3:2181,node4:2181,node5:2181",
//				"MyFirstConsumerGroup", 
//				topicConsumerConcurrency,
//				StorageLevel.MEMORY_AND_DISK());

        JavaPairReceiverInputDStream<String, String> lines =
            KafkaUtils.createStream(
                jsc,
                "node01:2181,node02:2181,node03:2181",
                "MyFirstConsumerGroup",
                topicConsumerConcurrency);

        JavaDStream<String> words = 
              lines.flatMap(new FlatMapFunction<Tuple2<String, String>, String>() {

              private static final long serialVersionUID = 1L;
      public Iterable<String> call(Tuple2<String, String> tuple) throws Exception {
                return Arrays.asList(tuple._2.split("\t"));
            }
        });

        JavaPairDStream<String, Integer> pairs = 
            words.mapToPair(new PairFunction<String, String, Integer>() {

            private static final long serialVersionUID = 1L;
            public Tuple2<String, Integer> call(String word) throws Exception {
                return new Tuple2<String, Integer>(word, 1);
            }
        });

        JavaPairDStream<String, Integer> wordsCount = 
            pairs.reduceByKey(new Function2<Integer, Integer, Integer>() {
            //对相同的Key，进行Value的累计（包括Local和Reducer级别同时Reduce）

            private static final long serialVersionUID = 1L;
            public Integer call(Integer v1, Integer v2) throws Exception {
                return v1 + v2;
            }
        });
        wordsCount.print();

        jsc.start();
        jsc.awaitTermination();
        jsc.close();
    }
}
```

##### 运行代码：

Linux端

* 启动zookeeper：3台

```shell
zkServer.sh start
```

* 启动kafka：3台

在kafka的解压路径下的/bin目录下

```shell
 kafka-server-start.sh ../config/server.properties 
```

终止kafka：

```
 kafka-server-stop.sh
```



### （2）Driect 模式

#### Driect 模式原理图

![](https://wx1.sinaimg.cn/large/005zftzDgy1g0hviwdqgkj30my0ba3z2.jpg)

#### Direct 模式理解：

> SparkStreaming+kafka 的 Driect 模式就是将 kafka 看成存数据的一方，不是被动接收数据，而是主动去取数据。拉取数据后先进行计算，成功后再更新偏移量
>
> 消费者偏移量也不是用 zookeeper 来管理，而是 SparkStreaming 内部对消费者偏移量自动来维护，默认消费偏移量是在内存中，当然如果设置了checkpoint 目录，那么消费偏移量也会保存在 checkpoint 中。当然也可以实现用 zookeeper 来管理
>
>

#### Direct 模式并行度设置：

> Direct 模式的并行度是由读取的 kafka 中 topic 的 partition 数决定的。
>
>可以在sparksteaming中使用算子改变分区数，如reartition



#### Direct 模式代码：

```java
import java.util.Arrays;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.function.FlatMapFunction;
import org.apache.spark.api.java.function.Function;
import org.apache.spark.api.java.function.Function2;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.streaming.Durations;
import org.apache.spark.streaming.api.java.JavaDStream;
import org.apache.spark.streaming.api.java.JavaPairDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;
import org.apache.spark.streaming.api.java.JavaStreamingContextFactory;
import org.apache.spark.streaming.dstream.DStream;
import scala.Tuple2;

/**
 *
 *  Spark standalone or Mesos with cluster deploy mode only:
 *  在提交application的时候  添加 --supervise 选项  如果Driver挂掉 会自动启动一个Driver
 *
 */
public class SparkStreamingOnHDFS {
	public static void main(String[] args) {
		final SparkConf conf = new SparkConf()
        conf.setMaster("local[2]").setAppName("SparkStreamingOnHDFS");
		
//		final String checkpointDirectory = "hdfs://shsxt/spark/SparkStreaming/CheckPoint2017";
		final String checkpointDirectory = "./checkpoint";

        JavaStreamingContextFactory factory = new JavaStreamingContextFactory() {
            @Override
			public JavaStreamingContext create() {  
				return createContext(checkpointDirectory,conf);
			}
		};

		JavaStreamingContext jsc = 
            JavaStreamingContext.getOrCreate(checkpointDirectory, factory);

		jsc.start();
		jsc.awaitTermination();
		jsc.close();
	}

    @SuppressWarnings("deprecation")
	private static JavaStreamingContext 
        createContext(String checkpointDirectory,SparkConf conf) {

		// If you do not see this printed, that means the StreamingContext has
		// been loaded
		// from the new checkpoint
		System.out.println("Creating new context");
		SparkConf sparkConf = conf;
		// Create the context with a 1 second batch size

		JavaStreamingContext ssc = 
            new JavaStreamingContext(sparkConf, Durations.seconds(5));
//		ssc.sparkContext().setLogLevel("WARN");
		/**
		 *  checkpoint 保存：
		 *		1.配置信息
		 *		2.DStream操作逻辑
		 *		3.job的执行进度
		 *      4.offset
		 */
		ssc.checkpoint(checkpointDirectory);		
		/**
		 * 监控的是HDFS上的一个目录，监控文件数量的变化     文件内容如果追加监控不到。
		 * 只监控文件夹下新增的文件，减少的文件时监控不到的，文件的内容有改动也监控不到。
		 */
//		JavaDStream<String> lines = ssc.textFileStream("hdfs://node1:9000/spark/sparkstreaming");
		JavaDStream<String> lines = ssc.textFileStream("./dataTest");

        JavaDStream<String> words = 
            lines.flatMap(new FlatMapFunction<String, String>() {
                
			private static final long serialVersionUID = 1L;
			@Override
			public Iterable<String> call(String s) {
				return Arrays.asList(s.split(" "));
			}
		});

		JavaPairDStream<String, Integer> ones = 
            words.mapToPair(new PairFunction<String, String, Integer>() {

			private static final long serialVersionUID = 1L;
			@Override
			public Tuple2<String, Integer> call(String s) {
				return new Tuple2<String, Integer>(s.trim(), 1);
			}
		});

		JavaPairDStream<String, Integer> counts =
            ones.reduceByKey(new Function2<Integer, Integer, Integer>() {

			private static final long serialVersionUID = 1L;
			@Override
			public Integer call(Integer i1, Integer i2) {
				return i1 + i2;
			}
		});

//        counts.print();

        DStream<Tuple2<String, Integer>> dstream = counts.dstream();

        dstream.saveAsTextFiles("./data/write/xxxxx","yyyyyy");

		return ssc;
	}
}
```



## 7、相关配置

预写日志:（receive模式中）

```
spark.streaming.receiver.writeAheadLog.enable 默认 false 没有开启
```

blockInterval:（receive模式中）

```
spark.streaming.blockInterval 默认 200ms
```

反压机制: （设置自动调整每一批次的数据量的理想范围，但调整的比较慢）

```
spark.streaming.backpressure.enabled 默认 false
```

每一批次接收数据速率:（receive模式中）

```
spark.streaming.receiver.maxRate 默认没有设置
```

每一分区接收数据速率 :（  direct模式）

```
spark.streaming.kafka.maxRatePerpartition   默认没有设置
```



## 8、如何优雅的关闭Spark Streaming作业

```
spark.streaming.stopGracefullyOnShutdown  设置成true
```

执行命令：

```shell
kill -15/sigterm driverpid
```

