---
title: Spark学习（三）
date: 2019-2-18
update: 2019-2-19
tags: [sparkcore应用案例,Spark shell,SparkUI,]
categories: Spark
grammar_cjkRuby: true
mathjax: true
overdue: true
no_word_count: false
description: Spark学习第三篇章：Spark Core应用案例学习及spark shell提交和WebUI！
abbrlink: f99e52aa
---

# 案例一、统计网站 pv 和 uv统计

## 0、概念理解

`PV` 是网站分析的一个术语，用以衡量网站用户访问的网页的数量。

对于广告主，PV 值可预期它可以带来多少广告收入。一般来说，PV 与来访者的数量成正比，但是 PV 并不直接决定页面的真实来访者数量，如同一个来访者通过不断的刷新页面，也可以制造出非常高的 PV。

## 1、什么是 PV 值

PV （page view ）即页面浏览量或点击量，是衡量一个网站或网页用户访问量。

PV 值就是所有访问者在 24 小时（0 点到 24 点）内看了某个网站多少个页面或某个网页多少次。

PV 是指页面刷新的次数，每一次页面刷新，就算做一次 PV 流量。

## 2、什么是UV 值

UV （unique visitor ）即独立访客数，指访问某个站点或点击某个网页的不同 IP 地址的人数。

在同一天内，UV  只记录第一次进入网站的具有独立IP  的访问者，在同一天内再次访问该网站则不计数。

UV 提供了一定时间内不同观众数量的统计指标，而没有反应出网站的全面活动。

`PV`

```java
package com.bd.java.core;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.Function2;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.api.java.function.VoidFunction;
import org.apache.spark.deploy.master.Master;
import scala.Tuple2;

import java.util.Iterator;
import java.util.Map;

public class TestPV {
    public static void main(String[] args) {

        SparkConf sparkConf = new SparkConf();
        sparkConf.setMaster("local").setAppName("pv");
        JavaSparkContext context = new JavaSparkContext(sparkConf);

        JavaRDD<String> lineRDD = context.textFile("./data/pvuvdata");
        /**求每个页面 PV
         * 文件每一行的内容
115.77.12.186	安徽	2017-10-10	1512012307084	5641635304912151098	www.suning.com
         */
        //方法一：mapToPair().reduceByKey().foeach()
     lineRDD.mapToPair(new PairFunction<String, String, Integer>() {
      @Override
      public Tuple2<String, Integer> call(String line) throws Exception {
               String[] str = line.split("\t");
               return new Tuple2<>(str[5],1);
            }
       }).reduceByKey(new Function2<Integer, Integer, Integer>() {
            @Override
           public Integer call(Integer v1, Integer v2) throws Exception {
                   return v1 + v2;
           }
      }).foreach(new VoidFunction<Tuple2<String, Integer>>() {
           @Override
           public void call(Tuple2<String, Integer> tuple2) throws Exception {
               System.out.println(tuple2);
           }
       });
          //方法二:  mapToPair().groupByKey().foeach()
     JavaPairRDD<String, Iterable<Integer>> groupByKeyRDD =
         lineRDD.mapToPair(new PairFunction<String, String, Integer>() {
           @Override
          public Tuple2<String, Integer> call(String line) throws Exception {
               String[] str = line.split("\t");
                return new Tuple2<>(str[5], 1);
           }
      }).groupByKey();

    groupByKeyRDD.foreach(new VoidFunction<Tuple2<String, Iterable<Integer>>>() {
    @Override
     public void call(Tuple2<String, Iterable<Integer>> tuple2) throws Exception {
               int count = 0;
               Iterator<Integer> iterator = tuple2._2.iterator();
                while(iterator.hasNext()){
                   count++;
               }
               System.out.println("url : " + tuple2._1 + " value: " + count);
           }
       });  
           //方法三： mapToPair().countByKey()-->对map遍历
    Map<String, Object> map = 
        lineRDD.mapToPair(new PairFunction<String, String, Integer>() {
           @Override
           public Tuple2<String, Integer> call(String line) throws Exception {
               String[] str = line.split("\t");
               // url,1
               return new Tuple2<>(str[5], 1);
            }
       }).countByKey();
       for (String key :map.keySet()){
           System.out.println("key : " + key  + "   value :" + map.get(key) );
       }
    }
}
```

`UV`

```java
package com.bd.java.core;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.api.java.function.VoidFunction;
import org.apache.spark.broadcast.Broadcast;
import org.apache.spark.deploy.master.Master;
import org.apache.spark.scheduler.DAGScheduler;
import scala.Tuple2;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;

public class TestUV {
    private  int sum = 10;
    public static void main(String[] args) {
        SparkConf sparkConf = new SparkConf();
        sparkConf.setMaster("local").setAppName("uv");
        JavaSparkContext context = new JavaSparkContext(sparkConf);
        
        JavaRDD<String> lineRDD = context.textFile("./data/pvuvdata");
         /**求每个网站 UV： 用IP唯一标识用户 ，注意去重
         * 文件每一行的内容
115.77.12.186	安徽	2017-10-10	1512012307084	5641635304912151098	www.suning.com
         */
        //方法一：mapToPair().groupByKey().foreach()
        JavaPairRDD<String, Iterable<String>> rdd1 = 
            lineRDD.mapToPair(new PairFunction<String, String, String>() {
            @Override
            public Tuple2<String, String> call(String s) throws Exception {
                String url = s.split("\t")[5];
                String ip = s.split("\t")[0];
                return new Tuple2<>(url, ip);
            }
        }).groupByKey();

        rdd1.foreach(new VoidFunction<Tuple2<String, Iterable<String>>>() {
            @Override
        public void call(Tuple2<String, Iterable<String>> tuple2) throws Exception {
            //set:无序，不可重复，所以它可以自动去重
                HashSet<Object> set = new HashSet<>();
                Iterator<String> iterator = tuple2._2.iterator();
                while(iterator.hasNext()){
                    set.add(iterator.next());
                }
                System.out.println(tuple2._1  + " : " + set.size());
            }
        });
        
        //方法二：mapToPair().ditinct().countByKey()-->遍历map
        Map<String, Object> map = 
            lineRDD.mapToPair(new PairFunction<String, String, String>() {
            @Override
            public Tuple2<String, String> call(String s) throws Exception {

                String url = s.split("\t")[5];
                String ip = s.split("\t")[0];
                return new Tuple2<>(url, ip);
            }
        }).distinct().countByKey();
        for (String key : map.keySet()) {
            System.out.println("key : " + key + "   value :" + map.get(key));
        }
    }
}
```

```
-------------------------------------------------------------------------------------
```



```scala
package com.sxt.scala.core

import org.apache.spark.rdd.RDD
import org.apache.spark.{SparkConf, SparkContext}

object PVUV {
    def main(args: Array[String]): Unit = {
        val conf = new SparkConf()
        conf.setMaster("local").setAppName("pvuv")
        val sc = new SparkContext(conf)
        val records = sc.textFile("data/pvuvdata")

        //pv
        records.map(x => {
            val fields = x.split("\t")
            (fields(5), 1)
        }).reduceByKey(_ + _).sortBy(_._2).foreach(println)

        //uv
        val result: RDD[(String, Iterable[String])] = records.map(x => {
            val fields = x.split("\t")
            (fields(5), fields(0))
        }).groupByKey()

        result.foreach(x => {
            val key = x._1
            val iteratable = x._2

            println("key : " + key + " size : " + iteratable.toSet.size)
        })
    }
}

```

```scala
package com.bd.scala.core

import org.apache.spark.rdd.RDD
import org.apache.spark.{SparkConf, SparkContext}

object PVUV2 {

    def main(args: Array[String]): Unit = {

        val conf = new SparkConf()
       // "local[4]"  指定本地以及使用的核数     
        conf.setMaster("local[4]").setAppName("pvuv")
        val context = new SparkContext(conf)
        val linesRDD = context.textFile("data/pvuvdata")
        //pv
        //(www.jd.com,1000)
        linesRDD.map(x=>{
            val fields: Array[String] = x.split("\t")
            (fields(5),1)
        }).reduceByKey((x,y)=>{x + y}).sortBy(_._2,false).foreach(println)

        //uv
        //(www.taobao.com,10.20.30.18)

        val groupRDD: RDD[(String, Iterable[String])] = linesRDD.map(x=>{
            val fields = x.split("\t")
            (fields(5),fields(0))
        }).groupByKey()

        groupRDD.map(x=>{
            val key  = x._1
            val size = x._2.toSet.size
            (key,size)
        }).sortBy(_._2,false)foreach(println)
    }
}
```



# 案例二：二次排序

```java
package com.bd.java.core;

import java.io.Serializable;

public class SecondSortKey  implements Serializable , Comparable<SecondSortKey>{

    private static final long serialVersionUID = 1L;
    private int first;
    private int second;
    public int getFirst() {
        return first;
    }
    public void setFirst(int first) {
        this.first = first;
    }
    public int getSecond() {
        return second;
    }
    public void setSecond(int second) {
        this.second = second;
    }

    public SecondSortKey(int first, int second) {
        super();
        this.first = first;
        this.second = second;
    }


    @Override
    public int compareTo(SecondSortKey o1) {

        if (getFirst() - o1.getFirst() == 0) {
            // 5     6
            // this  < o1
            // 6   5
            // this > o1
            return o1.getSecond() - getSecond();

            /*if(getSecond() - o1.getSecond() == 0) {
                return getThree() - o1.getThree();
            }else {
                return getSecond() - o1.getSecond();
            }*/

        } else {
            return  o1.getFirst() - getFirst();
    }
    }
}
```

```java
package com.bd.java.core;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.api.java.function.VoidFunction;
import scala.Tuple2;

public class SecondKeyTest {

    public static void main(String[] args) {
        SparkConf sparkConf = new SparkConf();
        sparkConf.setMaster("local").setAppName("SecondarySortTest");
        final JavaSparkContext sc = new JavaSparkContext(sparkConf);

        JavaRDD<String> secondRDD = sc.textFile("./data/secondSort.txt");
        /*文件内容格式
         * 1 3
         * 1 4
         * 2 3
         */
        //maptoPair -->sortByKey -->foreach
        JavaPairRDD<SecondSortKey, String> secRDD = 
            secondRDD.mapToPair(new PairFunction<String, SecondSortKey, String>() {
            @Override
           public Tuple2<SecondSortKey, String> call(String line) throws Exception {
                String[] fields = line.split(" ");
                SecondSortKey secondSortKey =new SecondSortKey(
                    Integer.parseInt(fields[0]),
                    Integer.parseInt(fields[1])
                );  		  		 
                return new Tuple2<>(secondSortKey, line);
            }
        });

      secRDD.sortByKey().foreach(new VoidFunction<Tuple2<SecondSortKey, String>>() {
            @Override
           public void call(Tuple2<SecondSortKey, String> tuple2) throws Exception {
                System.out.println(tuple2._2);
            }
        });
    }
}
```

```java
-------------------------------------------------------------------------------------
```

```scala

```

# 案例三：分组取topN

```java
package com.sxt.java.core;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.api.java.function.VoidFunction;

import scala.Tuple2;
import java.util.*;

public class TopN {
    public static void main(String[] args) {
        SparkConf conf;
        conf = new SparkConf().setMaster("local[5]").setAppName("TopOps");
        JavaSparkContext sc = new JavaSparkContext(conf);
        
        //hdfs://shsxt/wc.txt
        JavaRDD<String> linesRDD = sc.textFile("data/scores.txt",5);

        final List n = new ArrayList();
//      linesRDD.count();
/*a 86
 a 58
  b 78
*/
        JavaPairRDD<String, Integer> pairRDD = 
        linesRDD.mapToPair( new PairFunction<String, String, Integer>() {
                    /**
                     *
                     */
                 private static final long serialVersionUID = 1L;
                 @Override
                 public Tuple2<String, Integer> call(String str) throws Exception {
                        String[] splited = str.split(" ");
                        String clazzName = splited[0];
                        Integer score = Integer.valueOf(splited[1]);
                        return new Tuple2<String, Integer>(clazzName, score);
                    }
                });

     JavaPairRDD<String, Iterable<Integer>> groupByKeyRDD =pairRDD.groupByKey();
     groupByKeyRDD.foreach( new VoidFunction<Tuple2<String, Iterable<Integer>>>() {
                    /**
                     *
                     */
                    private static final long serialVersionUID = 1L;
                    @Override
       public void call(Tuple2<String, Iterable<Integer>> tuple) throws Exception {
                        String clazzName = tuple._1;
                        Iterator<Integer> iterator = tuple._2.iterator();
                        System.out.println(tuple);
                        //取前三：大的放前，小的后移
                        Integer[] top3 = new Integer[3];
                        while (iterator.hasNext()) {
                            Integer score = iterator.next();
                            for (int i = 0; i < top3.length; i++) {
                                if (top3[i] == null) {
                                    top3[i] = score;
                                    break;
                                } else if (score > top3[i]) {
                                    for (int j = 2; j > i; j--) {
                                        top3[j] = top3[j - 1];
                                    }
                                    top3[i] = score;
                                    break;
                                }
                            }
                        }
                        System.out.println("class Name:" + clazzName);
                        for (Integer sscore : top3) {
                            System.out.println(sscore);
                        }
                    }
                });

//     groupByKeyRDD.foreach(new VoidFunction<Tuple2<String, Iterable<Integer>>>() {
//            @Override
//     public void call(Tuple2<String, Iterable<Integer>> tuple2) throws Exception {
//                String key  = tuple2._1;
//                Iterator<Integer> iterator = tuple2._2.iterator();
//                List list = IteratorUtils.toList(iterator);
//                Collections.sort(list);
//                for(int i=0;i<Math.min(3,list.size());i++){
//                    // list.size = 3  list.get(2)
//                    System.out.println(key + " " +  list.get(list.size()-i-1));
//                }
//            }
//        });
    }
}
```

```
-----------------------------------------------------------------------------------
```

```scala
package com.sxt.scala.core

/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import org.apache.spark.{SparkConf, SparkContext}

/**
 * Computes the PageRank of URLs from an input file. Input file should
 * be in format of:
 * URL         neighbor URL
 * URL         neighbor URL
 * URL         neighbor URL
 * ...
 * where URL and their neighbors are separated by space(s).
 */
object SparkPageRank {
  def main(args: Array[String]) {
    //    if (args.length < 1) {
    //      System.err.println("Usage: SparkPageRank <file> <iter>")
    //      System.exit(1)
    //    }
    val sparkConf = new SparkConf().setAppName("PageRank").setMaster("local[1]")
    val iters = 20;
    //    val iters = if (args.length > 0) args(1).toInt else 10
    val ctx = new SparkContext(sparkConf)
    val lines = ctx.textFile("page.txt")

    //根据边关系数据生成 邻接表 如：(1,(2,3,4,5)) (2,(1,5))..
    val links = lines.map{ s =>
      val parts = s.split("\\s+")
      (parts(0), parts(1))
    }.distinct().groupByKey().cache()

    links.foreach(println)

    // (1,1.0) (2,1.0)..
    var ranks = links.mapValues(v => 1.0)

    ranks.foreach(println)

    for (i <- 1 to iters) {
      // (1,((2,3,4,5), 1.0))
      val contribs = links.join(ranks).values.flatMap{ case (urls, rank) =>
        val size = urls.size
        urls.map(url => (url, rank / size))
      }
      ranks = contribs.reduceByKey(_ + _).mapValues(0.15 + 0.85 * _)
    }

    val output = ranks.collect()
//    output.foreach(tup => println(tup._1 + " has rank: " + tup._2 + "."))

    ctx.stop()
  }
}
```



# 参数解释：spark-submit

spark-submit -h

--master  （优先使用代码中的配置）

--name    （指定APPname）

--deploy mode  （默认为client，指定运行模式）

--jars （可以用来为代码添加所需要的jar包依赖）

IDEA代码打包：BUILD（注意避免jar包过大，可）

--files （添加代码所需的文件）

--conf （PROP=value）

--driver-memory

--executor-memory

--total-executor-core    （若不指明，就把所有的核均用完）

--queue

资源分配：

yarn  ： 分配到队列中 

```shell
[root@node00 bin]# ./spark-submit -h
Usage: spark-submit [options] <app jar | python file> [app arguments]
Usage: spark-submit --kill [submission ID] --master [spark://...]
Usage: spark-submit --status [submission ID] --master [spark://...]

Options:
  --master MASTER_URL         spark://host:port, mesos://host:port, yarn, or local.
  --deploy-mode DEPLOY_MODE   Whether to launch the driver program locally("client")                               or on one of the worker machines inside the  cluster                                 ("cluster") (Default: client).
  --class CLASS_NAME          Your application's main class (for Java / Scala apps).
  --name NAME                 A name of your application.
  --jars JARS                 Comma-separated (逗号分隔) list of local jars to include                               on the driver and executor classpaths.(Driver 和                                     executor 依赖的第三方 jar 包)
  --packages                  Comma-separated list of maven coordinates of jars to                                 include on the driver and executor classpaths. Will                                 search the local maven repo, then maven central and                                 any additional remote repositories given by --                                       repositories. The format for the coordinates should be                               groupId:artifactId:version.
  --exclude-packages          Comma-separated list of groupId:artifactId, to exclude                               while resolving the dependencies provided in --                                     packages to avoid dependency conflicts.
  --repositories              Comma-separated list of additional remote repositories                               to search for the maven coordinates given with --                                   packages.
  --py-files PY_FILES         Comma-separated list of .zip, .egg, or .py files to                                 place on the PYTHONPATH for Python apps.
  --files FILES               Comma-separated list of files to be placed in the                                   working directory of each executor.

  --conf PROP=VALUE           Arbitrary Spark configuration property.
  --properties-file FILE      Path to a file from which to load extra properties. If                               not specified, this will look for conf/spark-                                       defaults.conf.

  --driver-memory MEM         Memory for driver (e.g. 1000M, 2G) (Default: 1024M).
  --driver-java-options       Extra Java options to pass to the driver.
  --driver-library-path       Extra library path entries to pass to the driver.
  --driver-class-path         Extra class path entries to pass to the driver. Note                                 that jars added with --jars are automatically included                               in the  classpath.

  --executor-memory MEM       Memory per executor (e.g. 1000M, 2G) (Default: 1G).

  --proxy-user NAME           User to impersonate when submitting the application.

  --help, -h                  Show this help message and exit
  --verbose, -v               Print additional debug output
  --version,                  Print the version of current Spark

 Spark standalone with cluster deploy mode only:
  --driver-cores NUM          Cores for driver (Default: 1).

 Spark standalone or Mesos with cluster deploy mode only:
  --supervise                 If given, restarts the driver on failure.
  --kill SUBMISSION_ID        If given, kills the driver specified.
  --status SUBMISSION_ID      If given, requests the status of the driver specified.

 Spark standalone and Mesos only:
  --total-executor-cores NUM  Total cores for all executors.

 Spark standalone and YARN only:
  --executor-cores NUM        Number of cores per executor. (Default: 1 in YARN                                   mode, or all available cores on the worker in                                       standalone mode)

 YARN-only:
  --driver-cores NUM          Number of cores used by the driver, only in cluster                                 mode (Default: 1).
  --queue QUEUE_NAME          The YARN queue to submit to (Default: "default").
  --num-executors NUM         Number of executors to launch (Default: 2).
  --archives ARCHIVES         Comma separated list of archives to be extracted into                               the working directory of each executor.
  --principal PRINCIPAL       Principal to be used to login to KDC, while running on
                              secure HDFS.
  --keytab KEYTAB             The full path to the file that contains the keytab for                               the principal specified above. This keytab will be                                   copied to the node running the Application Master via                               the Secure Distributed Cache, for renewing the login                                 tickets and the delegation tokens periodically.


sc.textFile("hdfs://node00:8020/test.txt").flatMap(_.split(" ")).map((_,1)).reduceByKey(_+_).foreach(println)
```

# Spark Shell

## 1、 概念：

SparkShell 是 Spark 自带的一个快速原型开发工具，也可以说是Spark 的 scala REPL(Read-Eval-Print-Loop),即交互式 shell。支持使用 scala 语言来进行 Spark 的交互式编程。

## 2、使用:

（配置从HDFS上获取文件）

(1)启动HDFS，上传文件

```shell
zkServer.sh start   (3台)
start-all.sh        (任一台)
hadoop dfs -put test.txt /   (任一台：将test.txt文件上传至hdfs的根目录)
```

(2)启动standalone集群：在/sbin路径下

```shell
./start-all.sh
```

(3)在客户端上启动 spark-shell:

```shell
./spark-shell    (local模式：在控制台打印)
```

或

```shell
./spark-shell --master spark://node00:7077   （client模式：控制台无打印，可通过web页面查看）
```

（4）运行 wordcount：

```scala
sc.textFile("hdfs://Sunrise/test.txt").flatMap(_.split(" ")).map((_,1)).reduceByKey(_+_).foreach(println)
```

## 三、参数解释：spark-shell

```shell
[root@node00 bin]# ./spark-shell -h
Usage: ./bin/spark-shell [options]

Options:
  --master MASTER_URL         spark://host:port, mesos://host:port, yarn, or local.
  --deploy-mode DEPLOY_MODE   Whether to launch the driver program locally                                         ("client") or on one of the worker machines inside the                               cluster ("cluster")(Default: client).
  --class CLASS_NAME          Your application's main class (for Java / Scala apps).
  --name NAME                 A name of your application.
  --jars JARS                 Comma-separated list of local jars to include on the                                 driver and executor classpaths.
  --packages                  Comma-separated list of maven coordinates of jars to                                 include on the driver and executor classpaths. Will                                 search the local maven repo, then maven central and                                 any additional remote repositories given by --                                       repositories. The format for thecoordinates should be                               groupId:artifactId:version.
  --exclude-packages          Comma-separated list of groupId:artifactId, to exclude                               while  resolving the dependencies provided in --                                     packages to avoid dependency conflicts.
  --repositories              Comma-separated list of additional remote repositories                               to search for the maven coordinates given with --                                   packages.
  --py-files PY_FILES         Comma-separated list of .zip, .egg, or .py files to                                 place on the PYTHONPATH for Python apps.
  --files FILES               Comma-separated list of files to be placed in the                                   working directory of each executor.

  --conf PROP=VALUE           Arbitrary Spark configuration property.
  --properties-file FILE      Path to a file from which to load extra properties. If                               not specified, this will look for conf/spark-                                       defaults.conf.

  --driver-memory MEM         Memory for driver (e.g. 1000M, 2G) (Default: 1024M).
  --driver-java-options       Extra Java options to pass to the driver.
  --driver-library-path       Extra library path entries to pass to the driver.
  --driver-class-path         Extra class path entries to pass to the driver. Note                                 that jars added with --jars are automatically included                               in the classpath.

  --executor-memory MEM       Memory per executor (e.g. 1000M, 2G) (Default: 1G).

  --proxy-user NAME           User to impersonate when submitting the application.

  --help, -h                  Show this help message and exit
  --verbose, -v               Print additional debug output
  --version,                  Print the version of current Spark

 Spark standalone with cluster deploy mode only:
  --driver-cores NUM          Cores for driver (Default: 1).

 Spark standalone or Mesos with cluster deploy mode only:
  --supervise                 If given, restarts the driver on failure.
  --kill SUBMISSION_ID        If given, kills the driver specified.
  --status SUBMISSION_ID      If given, requests the status of the driver specified.

 Spark standalone and Mesos only:
  --total-executor-cores NUM  Total cores for all executors.

 Spark standalone and YARN only:
  --executor-cores NUM        Number of cores per executor. (Default: 1 in YARN                                   mode, or all available cores on the worker in                                       standalone mode)

 YARN-only:
  --driver-cores NUM          Number of cores used by the driver, only in cluster                                 mode (Default: 1).
  --queue QUEUE_NAME          The YARN queue to submit to (Default: "default").
  --num-executors NUM         Number of executors to launch (Default: 2).
  --archives ARCHIVES         Comma separated list of archives to be extracted into                               the working directory of each executor.
  --principal PRINCIPAL       Principal to be used to login to KDC, while running on
                              secure HDFS.
  --keytab KEYTAB             The full path to the file that contains the keytab for                               the principal specified above. This keytab will be                                   copied to the node running the Application Master via                               the Secure Distributed Cache, for renewing the login                                 tickets and the delegation tokens periodically.

```



# SparkUI

## 1、SparkUI 界面介绍

提交spark：在/bin路径下

```shell
 ./spark-submit --master spark://node00:7077 --name sp --class org.apache.spark.example.SparkPi ../lib/spark-examples-1.6.0-hadoop2.6.0.jar --100
```

`注意`：--name指代的参数在代码中也有配置，所以对同一参数均有配置时，以代码中的配置为主

浏览器页面访问：node00:8080  

`页面显示`

> 点击：Application ID列中的值  →  Application  Detail UI  会显示查看不了事件日志
>
> ### Event logging is not enabled
>
> No event logs were found for this application! To [enable event logging](http://spark.apache.org/docs/latest/monitoring.html), set spark.eventLog.enabled to true and spark.eventLog.dir to the directory to which your event logs are written.

## 2、配置 historyServer

* 临时配置，对本次提交的应用程序起作用

```shell
./spark-shell --master spark://node00:7077
--name myapp1
--conf spark.eventLog.enabled=true
--conf spark.eventLog.dir=hdfs://Sunrise/spark/test
```

停止程序，在 Web Ui 中 Completed Applications 对应的ApplicationID 中能查看 history。

* spark-default.conf 配置文件中配置 HistoryServer，对所有提交的Application 都起作用

在 客 户 端 节 点 ， 进 入 ../spark-1.6.0/conf/spark-defaults.conf 最后加入:

```
#  开启记录事件日志的功能
spark.eventLog.enabled true
#  设置事件日志存储的目录
spark.eventLog.dir hdfs://Sunrise/spark/test
#  设置 HistoryServer  加载事件日志的位置
spark.history.fs.logDirectory hdfs://Sunrise/spark/test
# 日志优化选项, 压缩日志
spark.eventLog.compress true
```

* 发送到其他节点（如果节点上没有以上配置，就不会有对应的作用）

在HDFS上一定要先存在路径/spark/test

```
#hdfs集群一定要启动
hadoop dfs -mkdir -p /spark/test
```

`页面显示`

> 点击：Application ID列中的值  →  Application  Detail UI  就会有显示内容

![](https://wx1.sinaimg.cn/large/005zftzDgy1g0d8nkvqzrj310k06zmxl.jpg)



![](https://wx1.sinaimg.cn/large/005zftzDgy1g0d8r7qsrzj30q50apwgd.jpg)

* 启动 HistoryServer：(在/sbin路径下)

```shell
./start-history-server.sh
```

（Sunrise在这里是HDFS集群的名字）

访问 HistoryServer：

node00:18080,之后所有提交的应用程序运行状况都会被记录。

![](https://wx1.sinaimg.cn/large/005zftzDgy1g0d8t4eeftj30xj079go4.jpg)

# Master HA

## 1、Master 的高可用原理

Standalone 集群只有一个 Master，如果 Master 挂了就无法提交应用程序，但不影响正在执行的worker。

给 Master 进行高可用配置可以使用**fileSystem**(文件系统)和 **zookeeper**（分布式协调服务）。

* fileSystem 只有存储功能，可以存储 Master 的元数据信息，用fileSystem 搭建的 Master 高可用，在 Master 失败时，需要我们手动启动另外的备用 Master，这种方式不推荐使用。

* zookeeper 有选举和存储功能，可以存储 Master 的元素据信息，使用zookeeper 搭建的 Master 高可用，当 Master 挂掉时，备用的 Master会自动切换，推荐使用这种方式搭建 Master 的 HA。

![](https://wx1.sinaimg.cn/large/005zftzDgy1g0d8unf1yfj30gn0beac3.jpg)

## 2、Master 高可用搭建

1) 在 Spark Master 节点上配置主 Master，配置.spark1.6.0/conf/ spark-env.sh

```sh
export SPARK_DAEMON_JAVA_OPTS="
-Dspark.deploy.recoveryMode=ZOOKEEPER
-Dspark.deploy.zookeeper.url=node00:2181,node01:2181,node02:2181
-Dspark.deploy.zookeeper.dir=/sparkmaster"
```

2) 发送到其他 worker 节点上

```shell
scp spark-env.sh node01:`pwd`
.......
```

3) 找一台节点（非主 Master 节点:node01）配置备用 Master,修改spark-env.sh 配置节点上的 MasterIP

```sh
SPARK_MASTER_IP=192.168.198.130
```

4) 启动集群之前启动 zookeeper 集群：

```
zkServer.sh start
```

5) 启动 spark Standalone 集群，启动备用 Master

node00:(在/sbin路径下)

```
./start-all.sh
```

node01:

```
./start-master.sh
```

6) 打开主 Master 和备用 Master WebUI 页面，观察状态

主master：

> ### [![img](http://node00:8080/static/spark-logo-77x50px-hd.png) 1.6.0 ](http://node00:8080/)Spark Master at spark://192.168.198.128:7077
>
> * **URL:** spark://192.168.198.128:7077
> * **REST URL:** spark://192.168.198.128:6066 (cluster mode)
> * **Alive Workers:** 2
> * **Cores in use:** 2 Total, 0 Used
> * **Memory in use:** 2.0 GB Total, 0.0 B Used
> * **Applications:** 0 Running, 6 Completed
> * **Drivers:** 0 Running, 0 Completed
> * **Status:** ALIVE

备用master：

> ### [![img](http://node01:8080/static/spark-logo-77x50px-hd.png) 1.6.0 ](http://node01:8080/)Spark Master at spark://192.168.198.130:7077
>
> * **URL:** spark://192.168.198.130:7077
> * **REST URL:** spark://192.168.198.130:6066 (cluster mode)
> * **Alive Workers:** 0
> * **Cores in use:** 0 Total, 0 Used
> * **Memory in use:** 0.0 B Total, 0.0 B Used
> * **Applications:** 0 Running, 0 Completed
> * **Drivers:** 0 Running, 0 Completed
> * **Status:** ALIVE

3. 注意点
     主备切换过程中不能提交 Application。
     主备切换过程中不影响已经在集群中运行的 Application。因为
    Spark 是粗粒度资源调度。

4. 测试验证
    提交 SparkPi 程序，kill 主 Master 观察现象。

```shell
./spark-submit --master spark://node00:7077,node01:7077 --class org.apache.spark.examples.SparkPi ../lib/spark-examples-1.6.0-hadoop2.6.0.jar 10000
```

`显示：`

> 主备切换有时差，因为也不急
>
> 程序不受影响

