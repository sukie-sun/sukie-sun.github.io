---
title: Spark学习（五）
date: 2019-2-21
update: 2019-2-21
tags:
  - Spark框架 - SparkSql - SQL语句
categories: Spark
grammar_cjkRuby: true
mathjax: true
overdue: true
top: true
no_word_count: false
description: SparkSql是基于 Spark 计算框架之上且兼容 Hive 语法的 SQL 执行引擎
abbrlink: 212d8e88
---

# 一、Spark

## 1、概念

基于 Spark 计算框架之上且兼容 Hive 语法的 SQL 执行引擎，

## 2、特点

* 基于 Spark 的特性

由于底层的计算采用了 Spark，性能比 MapReduce 的 Hive 普遍快 2 倍以上，当数据全部 load 在内存的话，将快 10 倍以上，因此 Shark 可以作为交互式查询应用服务来使用。

* 基于 Hive的特性

Shark 是完全兼容 Hive的语法，表结构以及UDF函数等，已有的HiveSql可以直接进行迁移至Shark上。 Shark 底层依赖于 Hive 的解析器，查询优化器。

* 缺点

由于 Shark 的整体设计架构对 Hive 的依赖性太强，难以支持其长远发展，比如不能和 Spark的其他组件进行很好的集成，无法满足 Spark 的一栈式解决大数据处理的需求。

# 二、SparkSql

## 1、SparkSQL介绍

Hive 是 Shark 的前身，Shark 是 SparkSQL 的前身

SparkSQL 特点

* 其完全脱离了 Hive 的限制。

*  SparkSQL支持查询原生的RDD。

 RDD是Spark平台的核心概念，是 Spark 能够高效的处理大数据的各种场景的基础。

* 能够在 Scala 中写 SQL 语句。

支持简单的 SQL 语法检查，能够在Scala中写Hive语句访问Hive数据，并将结果取回作为RDD使用。

## 2、Spark on Hive 和 Hive on Spark

**`Spark on Hive`**：

 Hive 只作为储存角色，Spark 负责 sql 解析优化，执行。

数据源在hive上，解析引擎是sparksql，执行任务是spark

**`Hive on Spark`**：

Hive 即作为存储又负责 sql 的解析优化，Spark 负责执行。

数据源在hive上，解析引擎是hive，执行任务是spark

## 3、DataFrame

![](https://wx1.sinaimg.cn/large/005zftzDgy1g0e3717grfj30dq07amzi.jpg)

* 分布式数据容器

* DataFrame 的底层封装的是 RDD，只不过 RDD 的泛型是 Row 类型。

* 相当于RDD+schema  （数据+数据的结构信息）

* 与 Hive 类似，DataFrame 也支持嵌套数据类型（struct、array 和 map）

* 从 API 易用性的角度上 看， DataFrame API提供的是一套高层的关系操作，比函数式的 RDD API 要更加友好，门槛更低。



## 4、SparkSql 的数据源

 JSON 类型的字符串，JDBC、Parquent、Hive，HBASE、HDFS 



## 5、SparkSql底层架构

sql——>逻辑计划——>优化逻辑计划——>物理计划——>RDD（Spark任务）



## 6、谓词下推

`sql`:

```sql
select table1.name,table2.score 
from table1 
join table2 
on table1.id=table2.id 
where table1.age > 50 and table2.score > 90
```

`执行顺序` 

 join:t1,t2
过滤：where : t1.age>50,t2.score>90
列裁剪：from:  select:

**`谓词下推`**
先各自过滤：where
然后列裁剪：t1:name,id  ;  t2:score,id
join

![谓词下推](https://wx1.sinaimg.cn/large/005zftzDgy1g0e98ac1j9j30df09vt9h.jpg)



# 三、创建DataFrame的几种方式

## 1、读取Json格式文件创建DataFrame

`注意：`

> 1、json文件中不能嵌套json格式的内容
>
> 2、读取json文件格式的两种方式：
>
> 3、dataFrame.show( )默认显示前20行数据，使用dataFrame.show(行数）可显示指定行数的数据
>
> 4、将DataFrame转换成RDD：
>
> ​          Java: df.javaRDD( )  
>
> ​         Scala: df.rdd
>
> 5、显示DataFrame的Schema信息（树形的形式）：df.printSchema(  )
>
> 6、dataFrame自带API操作dataFrame ,不常用
>
> 7、使用sql查询：
>
> ​         a，将DataFrame注册临时表： df.registerTemptable(“mytable”)   
>
> ​         b，使用sql： sqlContext.sql(“sql语句”)
>
> 8、df中的数据加载过之后，显示时，会默认将列按ASCII码进行排序

`Java：`

```java
SparkConf conf = new SparkConf();
conf.setMaster("local").setAppName("jsonfile");
SparkContext context = new SparkContext(conf);

//创建SQLContext（实现了序列化）
SQLContext sqlContext = new SQLContext(context);

//文件格式：{"name":"zhangsan","age": 18}
//读取json文件的两种方式,得到DataFrame（底层是RDD）
DataFrame df = sqlContext.read().format("json").load("./data/jsonfile");
//DataFrame df = sqlContext.read().json("./data/jsonfile");

//显示df中的内容的两种情况（以二维表显示，空值用null代替，列自动按ASCII码排序）
df.show();
df.show(100);

//df转换成RDD
//RDD<ROW> rdd = df.rdd()
JavaRDD<Row> javaRDD = df.javaRDD();

//显示数据结构信息
df.printSchema();

//自带操作DataFrame的API
//select name from table
df.select("name").show();
//select name ,age+10 as addage from table
df.select(df.col("name"),df.col("age").plus(10).alias("addage")).show();
//select name ,age from table where age>19
df.select(df.col("name"),df.col("age")).where(df.col("age").gt(19)).show();
//select age,count(*) from table group by age
df.groupBy(df.col("age")).count().show();
    
//使用SQL查询
//将DataFrame注册成临时的一张表，这张表相当于临时注册到内存中，是逻辑上的表，不会雾化到磁盘
df.registerTempTable("table");
DataFrame sqlDF = sqlContext.sql("sekect * from table where name like 'zhang&'");
sqlDF.show();
context.stop()
```

`Scala:`

```scala
val conf = new SparkConf()
conf.setMaster("local").setAppName("json")
val context = new SparkContext(conf)
val sqlContext = new SQlContext(context)

//读取json文件
val df = sqlContext.read.json("./data/jsonfile")
//val df = sqlContext.read.format("json").load("./data/jsonfile)

//将df转化成RDD
//val rdd = df.rdd
df.show()
de.printSchema()

//select * from table
df.select(df.col("name")).show()
//select name from table where age>19
df.select(df.col("name"),df.col("age")).where(df.col("age").gt(19)).show()
//select count(*) from table group by age
df.groupBy(df.col("age")).count().show();

//使用sql 
//注册临时表
df.registerTempTable("table")
val result = sqlContext.sql("select * from table")
result.show()
context.stop()
```



## 2、通过Json格式的RDD创建DataFrame

**`Java`**

```java
SparkConf conf = new SparkConf();
conf.setMaster("local").setAppName("jsonRdd");
JavaSparkContext context = new JavaSparkContext(conf);
SQLContext sqlContext = new SQLContext(context);

//创建RDD
JavaRDD<String> nameRDD = context.parallelize(Array.asList(
"{'name','zs','age','18'}",
"{\"name\",\"ls\",\"age\",\"21\"}"
));

JavaRDD<String> scoreRDD = context.parallelize(Array.asList(
"{'name':'zs','score':'90'}",
"{\"name\":\"ls\",\"score\":\"88\"}"
));

//将jsonRDD转换成DataFrame
DataFrame namedf = sqlContext.read().json(nameRDD);
DataFrame scoredf = sqlContext.read().json(scoreRDD);

//为df注册临时表
namedf.registerTempTable("nameTable");
scoredf.registerTempTable("scoreTable");

//使用sql查询
DataFrame df = sqlContext.sql("select nameTable.name,nameTable.age,"+
                             "scoretable.score from nameTable join scoreTabel"+
                              "on nameTable.name = scoreTable.name ");
df.show();
context.stop();                           
```

**`Scala`**

```scala
val conf = new SparkConf()
conf.setMaster("local").setAppName("jsonRdd")
val context = new SparkContext(conf)
val sqlContext = new SQLContext(context)

//创建RDD
val nameRDD = context.makeRDD(
 "{'name','zs','age','18'}",
"{\"name\",\"ls\",\"age\",\"21\"}"
)
val scoreRDD = context.makeRDD(                                                     
"{'name':'zs','score':'90'}",
"{\"name\":\"ls\",\"score\":\"88\"}"
)
//获取dataFrame
val namedf = sqlContext.read.json(nameRDD)
val scoredf = sqlContext.read.json(scoreRDD)

//为DataFrame指定临时表
namedf.registerTempTable("nameTable")
scoredf.registerTempTable("scoreTable")

//使用sql
val df = sqlContext.sql("select nameTable.name,nameTable.age,"+
                         "scoretable.score from nameTable join scoreTabel"+
                         "on nameTable.name = scoreTable.name ")
df.show()
context.stop()
```

## 3、非Json格式的文件创建DataFrame

### 1）通过反射的方式将非json格式的RDD转换成DataFrame（不推荐）

* 自定义类要实现序列化
* 自定义类的访问级别是public
* RDD转换成DataFrame后会根据映射按ASCII码排序
* 将DataFrame转换成RDD时，获取字段的范式有两种：
  * 1）row.getInt(0）；df.getString(1) 通过下标获取，返回Row类型的数据，注意列顺序问题（不推荐）
  * 2）row.getAs(“列名”)  通过列名获取对应列值（推荐）

**`Java`**:

```java
package com.bd.java.sql.dataframe;
import java.io.Serializable;
public class Person implements Serializable{
    
	private static final long serialVersionUID = 1L;
	private String id ;
	private  String name;
	private Integer age;	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Integer getAge() {
		return age;
	}
	public void setAge(Integer age) {
		this.age = age;
	}
	@Override
	public String toString() {
		return "Person [id=" + id + ", name=" + name + ", age=" + age + "]";
	}	
}
```

```java
SparkConf conf = new SparkConf();
conf.setMaster("local").setAppName("RDD");
JavaSparkContext context = new JavaSparkContext(conf);
SQLContext sqlContext = new SQLContext(sc);
//获取RDD（文件格式：1,zhangsan,18）
JavaRDD<String> lineRDD = context.textFile("./data/person");
//反射
JavaRDD<Person> personRDD = 
    lineRDD.map(new Funcation<String,Person>(){
        private static final long serialVersionUID = 1L;
        @Override
        public Person call(String str) throws Exception {
            Person person = new Person();
            person.setId(str.split(",")[0]);
            person.setName(str.split(",")[1]);
            person.setAge(Integer.valueOf(str.split(",")[2]));
            return person;
        }
    });
/*
传入Person.class后，sqlContext就通过反射的方式创建DataFrame
因为在底层通过反射的方式可以获得Person类的所有field，再结合RDD，即可创建DataFrame
*/
//将RDD转换成DataFram
DataFrame df = sqlContext.(personRDD,Person.class);
df.show();
df.printSchema()
df.registerTempTable("table");
DataFrame sqldf = sqlContext.sql("select * from table");
sqldf.show()
  
//将DataFrame转换成RDD（两种方式）
//因为排序的原因：df中列的顺序变为：age ， id ， name
JavaRDD<Row> javaRDD = df.javaRDD();
JavaRDD<Person> map = 
    javaRDD.map(new Function(Row,Person){
        
    private static final long serialVersionUID = 1L;
	@Override
	public Person call(Row row) throws Exception {    
        Person p = new Person();
//        p.setId(row.getString(1));
//        p.setName(row.getString(2));
//        p.setAge(row.getInt(0));
        p.setId((String)row.getAs("id"));
		p.setName((String)row.getAs("name"));
		p.setAge((Integer)row.getAs("age"));
        
        return p;
    }    
});
map.foreach(new VoidFunction<Person>(){
  
    private static final long serialVersionUID = 1L;
	@Override
	public void call(Person person) throws Exception {
        System.out.println(person);       
    }     
});
context.stop();    
```

**`Scala`**

```scala
 val conf = new SparkConf()
 conf.setMaster("local").setAppName("rddreflect")
 val sc = new SparkContext(conf)
 val sqlContext = new SQLContext(sc)
 val lineRDD = sc.textFile("./data/person")
//文件格式：1,zhangsan,18
//将RDD转换成DataFrame
val personRDD = linRDD.map{x=>{
 val person = Person(x.split(",")(0),x.split(",")(1),Intger.valueOf(x.split(",")(2))
 person
}}
//将personRDD转化成DataFrame                     
val df = personRDD.toDF() 
df.show()  
                     
//将DataFrame转换成RDD
val rdd = df.rdd
val personRDD = rdd.map{x=>{
   Person(x.getAs("id"),x.getAs("name"),x.getAs("age")) 
}} 
personRDD.foreach(println)
context.stop()
```

### 2）动态创建Schema，将非json格式RDD转成DataFrame

**`Java`**

```java
SparkConf conf = new SparkConf();
conf.setMaster("local").setAppName("rddStruct");
JavaSparkContext sc = new JavaSparkContext(conf);
SQLContext sqlContext = new SQLContext(sc);
JavaRDD<String> lineRDD = sc.textFile("./data/person");
//文件格式：1,zhangsan,18
//将RDD转换成DataFrame
//将RDD转成Row类型的RDD
final JavaRDD<Row> rowRDD =
    lineRDD.map(new Function<String,Row>(){
        
        private static final long serialVersionUID = 1L;
		@Override
		public Row call(String s) throws Exception {
             val row = RowFactory.create(
             s.split(",")[0],
             s.split(",")[1],
            Integer.valueOf(s.split(",")[2]) 
             );
            return row;
       }
    });
//动态创建DataFrame的的元数据（Schema），字段的来源：字符串或外部数据库
List<StructField> asList = Arrays.asList(
    DataTypes.createStructField("id",DataTypes.StringType,true),
    DataTypes.createStructField("name",DataTypes.StringType,true)，
    DataTypes.createStructField（"age",DataTypes.IntegerType,true)
);
StructType schema = DataTypes.createStructType(asList);

//获取DataFrame
DataFrame df = sqlContext.createDataFrame(rowRDD,schema);
df.printSchema();
df.show();

//将dataframe转换成RDD
//JavaRDD<Row> javaRDD = df.javaRDD();
//	javaRDD.foreach(new VoidFunction<Row>() {

//			private static final long serialVersionUID = 1L;
//			@Override
//			public void call(Row row) throws Exception {
//				System.out.println(row.getString(0));
//
//                System.out.println(row);
//            }
//		});
context.stop();
```



**`Scala`**

```scala
val conf = new SparkConf()
conf.setMaster("local").setAppName("rddStruct")
val sc = new SparkContext(conf)
val sqlContext = new SQLContext(sc)
val lineRDD = sc.textFile("./data/person")
//文件格式：1,zhangsan,18
//将RDD转换成RowRDD
val rowRDD = lineRDD.map{x=>{
    val split = x.split(",")
    RowFactory.create(split(0),split(1),Integer.valueOf(split(2))
}}
//获取schema
val schema = StructType(List(
StructField("id",StringType，true),
StructField("name",StringType,true),
StructField("age",IntegerType,true)
))
val df = sqlContext.createDataFrame(rowRDD,shema)
df.show()
df.printSchema()                      
context.stop()                                                                 
```



## 4、读取parquet文件创建DataFrame

**`注意：`**

* 可以将 DataFrame 存储成 parquet 文件。保存成 parquet 文件的方式有两种

* ```
  df.write().mode(SaveMode.Overwrite)format("parquet").save("./sparksql/parquet");
  df.write().mode(SaveMode.Overwrite).parquet("./sparksql/parquet");
  ```

*   SaveMode 指定文件保存时的模式。

* > Overwrite：覆盖
  > Append：追加
  > ErrorIfExists：如果存在就报错
  > Ignore：如果存在就忽略

**`Java`**

```java
SparkConf conf = new SparkConf();
conf.setMaster("local").setAppName("parquet");
JavaSparkContext sc = new JavaSparkContext(conf);
SQLContext sqlContext = new SQLContext(sc);
JavaRDD<String> jsonRDD = sc.textFile("./data/json");
//读取json格式的文件
DataFrame df = sqlContext.read().json(jsonRDD);
//sqlContext.read().format("json").load("./spark/json");
df.show();
 /**
 * 将DataFrame保存成parquet文件，
 * SaveMode指定存储文件时的保存模式:
 *  Overwrite：覆盖
 * 	Append:追加
 *  ErrorIfExists:如果存在就报错
 * 	Ignore:如果存在就忽略
 */
// 保存成parquet文件有以下两种方式：
df.write().mode(SaveMode.Overwrite).parquet("./sparksql/parquet");
//df.write().mode(SaveMode.Overwrite).format("parquet").save("data/parquet");
 /**
  * 加载parquet文件成DataFrame	
  * 加载parquet文件有以下两种方式：	
  */  
load = sqlContext.read().parquet("data/parquet");
//	 DataFrame load = sqlContext.read().format("parquet").load("data/parquet");
load.show();
sc.stop();
```

**`Scala`**

```scala
    val conf = new SparkConf()
    conf.setMaster("local").setAppName("parquet")
    val sc = new SparkContext(conf)
    val sqlContext = new SQLContext(sc)
    val jsonRDD = sc.textFile("data/json")
    val df = sqlContext.read.json(jsonRDD)
    df.show()
    /**
      * 将DF保存为parquet文件
      */
    df.write.mode(SaveMode.Overwrite).format("parquet").save("data/parquet")
    df.write.mode(SaveMode.Overwrite).parquet("data/parquet")
    /**
     * 读取parquet文件
     */
    var result = sqlContext.read.parquet("data/parquet")
    result = sqlContext.read.format("parquet").load("data/parquet")
    result.show()
    sc.stop()
```



## 5、读取JDBC中的数据创建DataFrame（MySQL为例）

两种方式创建 DataFrame

**`Java`**

```java
        SparkConf conf = new SparkConf();
        conf.setMaster("local").setAppName("mysql");
        /**
         * 	配置join或者聚合操作shuffle数据时分区的数量
         */
        conf.set("spark.sql.shuffle.partitions", "1");

        JavaSparkContext sc = new JavaSparkContext(conf);
        SQLContext sqlContext = new SQLContext(sc);
        /**
         * 第一种方式读取MySql数据库表，加载为DataFrame
         */
        Map<String, String> options = new HashMap<String, String>();
        options.put("url", "jdbc:mysql://127.0.0.1:3306/spark");
        options.put("driver", "com.mysql.jdbc.Driver");
        options.put("user", "root");
        options.put("password", "root");
        options.put("dbtable", "person");

        DataFrame person = sqlContext.read().format("jdbc").options(options).load();
        person.show();

        person.registerTempTable("person");
        /**
         * 第二种方式读取MySql数据表加载为DataFrame
         */

        DataFrameReader reader = sqlContext.read().format("jdbc");
        reader.option("url", "jdbc:mysql://127.0.0.1:3306/spark");
        reader.option("driver", "com.mysql.jdbc.Driver");
        reader.option("user", "root");
        reader.option("password", "root");
        reader.option("dbtable", "score");
        DataFrame score = reader.load();
        score.show();
        score.registerTempTable("score");

        DataFrame result =
               sqlContext.sql("select person.id,person.name,person.age,score.score "
                        + "from person,score "
                        + "where person.name = score.name  and score.score> 90");
        result.show();

        result.registerTempTable("result");
DataFrame df = sqlContext.sql("select id,name,age,score from result where ag>18");
        df.show();

        /**
         * 将DataFrame结果保存到Mysql中
         */
        Properties properties = new Properties();
        properties.setProperty("user", "root");
        properties.setProperty("password", "root");
        /**
         * SaveMode:
         * Overwrite：覆盖
         * Append:追加
         * ErrorIfExists:如果存在就报错
         * Ignore:如果存在就忽略
         *
         */

        result.write().mode(SaveMode.Append).jdbc("jdbc:mysql://127.0.0.1:3306/spark", "result2", properties);
        System.out.println("----Finish----");
        sc.stop();
```

**`Scala`**

```scala
val conf = new SparkConf()
    conf.setMaster("local").setAppName("mysql")
    val sc = new SparkContext(conf)
		val sqlContext = new SQLContext(sc)
		/**
		 * 第一种方式读取Mysql数据库表创建DF
		 */
		val options = new HashMap[String,String]();
		options.put("url", "jdbc:mysql://192.168.100.111:3306/spark")
		options.put("driver","com.mysql.jdbc.Driver")
		options.put("user","root")
		options.put("password", "1234")
		options.put("dbtable","person")
		val person = sqlContext.read.format("jdbc").options(options).load()
		person.show()
		person.registerTempTable("person")
		/**
		 * 第二种方式读取Mysql数据库表创建DF
		 */
		val reader = sqlContext.read.format("jdbc")
		reader.option("url", "jdbc:mysql://192.168.100.111:3306/spark")
		reader.option("driver","com.mysql.jdbc.Driver")
		reader.option("user","root")
		reader.option("password","1234")
		reader.option("dbtable", "score")
		val score = reader.load()
		score.show()
		score.registerTempTable("score")
		val result = sqlContext.sql("select person.id,person.name,score.score from                                        person,score where person.name = score.name")
		result.show()
		/**
		 * 将数据写入到Mysql表中
		 */
		val properties = new Properties()
		properties.setProperty("user", "root")
		properties.setProperty("password", "1234")
		result.write.mode(SaveMode.Append).
               jdbc("jdbc:mysql://192.168.100.111:3306/spark", "result", properties)		
		sc.stop()
```



## 6、读取Hive中的数据加载成DataFrame

* >  HiveContext 是 SQLContext 的子类，连接 Hive 建议使用HiveContext

* > 由于本地没有 Hive 环境，要提交到集群运行，提交命令：
  >
  > ```shell
  > ./spark-submit
  > --master spark://node00:7077,node01:7077
  > --executor-cores 1
  > --executor-memory 1G
  > --total-executor-cores 1
  > --class com.bd.sparksql.dataframe.CreateDFFromHive
  > /usr/soft/spark-test.jar
  > ```

### 代码详情

#### `Java`

```java
SparkConf conf = new SparkConf();
conf.setMaster("local").setAppName("hive");
JavaSparkContext sc = new JavaSparkContext(conf);
//HiveContext是SQLContext的子类。（2.0之后就将两个类就合成一个类了）
HiveContext hiveContext = new HiveContext(sc);//用于操作Hive上的数据
//创建实例库
hiveContext.sql("CREATE database spark");
//切换实例库
hiveContext.sql("USE spark");
//删除已存在的表
hiveContext.sql("DROP TABLE IF EXISTS student_infos");
//在hive中创建student_infos表
hiveContext.sql("CREATE TABLE IF NOT EXISTS student_infos (name STRING,age INT) row format delimited fields terminated by '\t' ");
//从本地加载数据到表中
hiveContext.sql("load data local inpath '/root/student_infos' into table student_infos");
		
hiveContext.sql("DROP TABLE IF EXISTS student_scores"); 
hiveContext.sql("CREATE TABLE IF NOT EXISTS student_scores (name STRING, score INT) row format delimited fields terminated by '\t'");  
hiveContext.sql("LOAD DATA "
				+ "LOCAL INPATH '/root/student_scores'"
				+ "INTO TABLE student_scores");

		/**
		 * 查询表生成DataFrame
		 */

//		DataFrame df = hiveContext.table("student_infos");//第二种读取Hive表加载DF方式
DataFrame goodStudentsDF = hiveContext.sql("SELECT si.name, si.age, ss.score "
				+ "FROM student_infos si "
				+ "JOIN student_scores ss "
				+ "ON si.name=ss.name "
				+ "WHERE ss.score>=80");

//将df注册成临时表，才能使用sql
		goodStudentsDF.registerTempTable("goodstudent");
		DataFrame result = hiveContext.sql("select * from goodstudent");
		result.show();
		
		/**
		 * 将结果保存到hive表 good_student_infos
		 */
		hiveContext.sql("DROP TABLE IF EXISTS good_student_infos");
		goodStudentsDF.write().mode(SaveMode.Overwrite).saveAsTable("good_student_infos");

		DataFrame table = hiveContext.table("good_student_infos");
		Row[] goodStudentRows = table.collect();
		for(Row goodStudentRow : goodStudentRows) {
			System.out.println(go odStudentRow);
		}
		sc.stop();
```



#### `Scala`

```scala
 val conf = new SparkConf()
    conf.setAppName("HiveSource")
    val sc = new SparkContext(conf)
    /**
     * HiveContext是SQLContext的子类。
     */
    val hiveContext = new HiveContext(sc)
    hiveContext.sql("use spark")
    hiveContext.sql("drop table if exists student_infos")
    hiveContext.sql("create table if not exists student_infos (name string,age int) row format  delimited fields terminated by '\t'")
    hiveContext.sql("load data local inpath '/root/test/student_infos' into table student_infos")
    
    hiveContext.sql("drop table if exists student_scores")
    hiveContext.sql("create table if not exists student_scores (name string,score int) row format delimited fields terminated by '\t'")
    hiveContext.sql("load data local inpath '/root/test/student_scores' into table student_scores")
    
    val df = hiveContext.sql("select si.name,si.age,ss.score from student_infos si,student_scores ss where si.name = ss.name")

    hiveContext.sql("drop table if exists good_student_infos")
    /**
     * 将结果写入到hive表中
     */
    df.write.mode(SaveMode.Overwrite).saveAsTable("good_student_infos")
    
    sc.stop()
```

# 关于序列化你要知道的！！



# 四、Spark On Hive 的配置



## **`Hive配置：`**（在Linux端）

### （1）在Spark客户端配置Spark  On  Hive 

在Spark客户端安装包下spark-1.6.0/conf路径下创建hive-site.xml：

编辑内容：配置hive的metastore路径（即hive服务端的IP）

```xml
<configuration>   
<property>  
  <name>hive.metastore.uris</name>  
  <value>thrift://192.168.11.131:9083</value>  
</property>  
</configuration>  
```

### （2）启动 zookeeper 集群，启动 HDFS 集群。

```shell
zkServer.sh start  (3台)
start-all.sh       (任一台)
```

`注意：`

> 由于我们这里是使用Spark作为计算框架 所以不需要启动yarn
>
> 启动yarn是在使用MapReduce作为计算框架时

### （3）启动spark服务（在spark解压目录的/sbin路径下）

```shell
./start-all.sh
```

### （4）启动mysql服务

(mysql  :node00     hive  ：服务端：node02    ； 客户端 ： node01)

* 检查mysql服务是否启动：

> 命令：
>
> ```
> chkconfig
> ```
>
> 显示：
>
> > mysqld         	0:off	1:off	2:off	3:off	4:off	5:off	6:off
>
> 没有启动

* 启动mysql服务

> 命令：
>
> ```
> [root@node00 conf]# service mysqld start
> Starting mysqld:                                           [  OK  ]
> ```
>
>

* 登录mysql

> ```
> [root@node00 conf]# mysql -u root -p
> Enter password: 123456
> mysql> 
> ```

### （5）启动 Hive服务端

启动 Hive 的 metastore 服务

```shell
#后台启动hive服务端
hive --service metastore &
#启动打印服务日志
Start Hive MetaStore Server
```

### （6）打开hive交互式页面(在任一台)

```
hive
```

创建数据库spark

```sql
hive> create database spark;
```



### （7）启动 SparkShell 

读取 Hive 中的表总数，对比 hive 中查询同一表查询总数测试时间。

```shell
./spark-shell
--master spark://node3:7077  ,node01:7077
--executor-cores 1
--executor-memory 1g
--total-executor-cores 1
import org.apache.spark.sql.hive.HiveContext
val hc = new HiveContext(sc)
hc.sql("show databases").show
hc.sql("user spark").show
hc.sql("select count(*) from spark.ods_cps_data").show


./spark-shell
--master spark://node3:7077  
--executor-cores 1
--executor-memory 1g
--total-executor-cores 1
import org.apache.spark.sql.hive.HiveContext
val hc = new HiveContext(sc)
hc.sql("show databases").show
hc.sql("user spark").show
hc.sql("select count(*) from spark.ods_cps_data").show
```

**`注意`**

>
> 如果使用 Spark on Hive 查询数据时，出现错误：
>
> ```
> Cause by: java.net.UknownHostException： XXX
> ```
>
> 找不到 HDFS 集群路径，要在客户端机器 conf/spark-env.sh 中设置HDFS 的 路 径 ：
>
> ```
> HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
> ```
>
>

## **spark On hive**：（在windows端）

### 1、`配置文件：`

在项目中新建文件夹conf（标记为资源文件）：

添加一下三个配置文件:（其中hive-site.xml文件用于连接hive 服务端， 其余两个文件用于连接hdfs）

* #### hdfs-site.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<!--
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. See accompanying LICENSE file.
-->

<!-- Put site-specific property overrides in this file. -->

<configuration>
 <property>
   <name>dfs.nameservices</name>
   <value>Sukie</value>
  </property>
 <property>
  <name>dfs.ha.namenodes.Sukie</name>
  <value>nn1,nn2</value>
 </property>
 <property>
   <name>dfs.replication</name>
   <value>3</value>
 </property>
 <property>
  <name>dfs.namenode.rpc-address.Sukie.nn1</name>
  <value>node00:8020</value>
</property>
<property>
  <name>dfs.namenode.rpc-address.Sukie.nn2</name>
  <value>node00:8020</value>
</property>
<property>
  <name>dfs.namenode.http-address.Sukie.nn1</name>
  <value>node00:50070</value>
</property>
<property>
  <name>dfs.namenode.http-address.Sukie.nn2</name>
  <value>node00:50070</value>
</property>
<property>
  <name>dfs.data.dir</name>
  <value>/var/hadoop/dfs/data</value>
</property>
<property>
    <name>dfs.datanode.fsdataset.volume.choosing.policy</name>
    <value>org.apache.hadoop.hdfs.server.datanode.fsdataset.AvailableSpaceVolumeChoosingPolicy</value>
  </property>
<property>
  <name>dfs.namenode.shared.edits.dir</name>
  <value>qjournal://node1:8485;node2:8485;node3:8485/Sukie</value>
</property>
<property>
  <name>dfs.journalnode.edits.dir</name>
  <value>/var/jn</value>
</property>
<property>
  <name>dfs.client.failover.proxy.provider.shsxt</name>
  <value>org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider </value>
</property>
<property>
  <name>dfs.ha.fencing.methods</name>
  <value>sshfence</value>
</property>
<property>
  <name>dfs.ha.fencing.ssh.private-key-files</name>
  <value>/root/.ssh/id_rsa</value>
</property>
<property>
   <name>dfs.ha.automatic-failover.enabled</name>
   <value>true</value>
</property>
<property>
   <name>dfs.datanode.max.xcievers</name>
   <value>4096</value>
</property>
<property>
   <name>dfs.balance.bandwidthPerSec</name>
   <value>10485760</value>
</property>
<property>
<name>dfs.socket.timeout</name>
<value>900000</value>
</property>
<property>
<name>dfs.datanode.handler.count</name>
<value>20</value>
</property>
<property>
<name>dfs.namenode.handler.count</name>
<value>30</value>
</property>
<property>
<name>dfs.datanode.socket.write.timeout</name>
<value>1800000</value>
</property>
</configuration>9
```

* #### core-site.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<!--
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. See accompanying LICENSE file.
-->

<!-- Put site-specific property overrides in this file. -->
<configuration>
  <property>
   <name>fs.defaultFS</name>
   <value>hdfs://Sukie</value>
  </property>
 <property>
   <name>ha.zookeeper.quorum</name>
   <value>node1:2181,node2:2181,node3:2181</value>
 </property>
  <property>
   <name>hadoop.tmp.dir</name>
   <value>/var/hadoop</value>
 </property>
</configuration>
```

* #### hive-site.xml

```xml
<configuration>    
<property>  
  <name>hive.metastore.uris</name>  
  <value>thrift://192.168.11.131:9083</value>  
</property>   
</configuration>  
```

### 2、本地运行

`注意bug`

> 一、若需要将上面类打包到Linux系统上运行时，代码中conf.setMaster("local"）中setMaster(“local”)就不需要了
>
> 否则会报错：
>
> xxxxxx

> 二、OOM(内存溢出)
>
> Edit Configurations  —>添加VM options的配置

```
-Xms800m -Xmx800m  -XX:PermSize=64M -XX:MaxNewSize=256m -XX:MaxPermSize=128m
```

> 三、java.io.IOException: Failed to delete: C:\Users\SunRise\AppData\Local\Temp\spark-64f2b5a7-f8b8-4da4-b1af-137bb278e3a4
>
> 临时目录 删除失败，不影响程序的正常运行

> 四、org.apache.hadoop.hive.ql.metadata.HiveException: copyFiles: error while checking/creating destination directory!!
>
> 数据加载失败，远程连接拒绝：因为我把core-site.xml  、 hdfs-site.xml  这两个资源文件删除了。
>
> 配置这两个作为资源文件时，注意在使用textFile( )时要取消，因为要避免从hdfs上拿文件

### 3、打包在Linux上运行



* #### 项目打包

> 1、点击Project Structure—>Artifacts—> ‘+’—>JAR—>如图：所使用的的Spark包就不用打进去了，因为Linux中也有。
>
> ![](https://wx1.sinaimg.cn/large/005zftzDgy1g0hfk3nqwfj30qg0g20tt.jpg)
>
> 2、点击Build—>Build Project ,之后就会在指定路径下生成对应的jar包
>
> ![](https://wx1.sinaimg.cn/large/005zftzDgy1g0hfjxuoi5j30vo0bxjsy.jpg)
>
> ![](https://wx1.sinaimg.cn/large/005zftzDgy1g0hfkaf6rej30r40czq4l.jpg)
>
> 3、将生成的jar包放在Linux系统上对应的Spark客户端节点上

`注意bug`

* 如果打包项目的时候，没有将hive-site.xml文件打包进去，运行时，会报错，说数据库不存在

* > 解决方法：将它打包进去，或者将该文件放在spark解压目录的conf路径下

启动spark，

```
./start-all.sh
```

启动提交前提：

* zookeeper集群启动
* hdfs集群启动
* hive服务端启动
* spark集群启动

启动提交（在node00上，保证要有，两个文件，+  运行jar包）

```shell
./spark-submit --master spark://node00:7077 --class com.bd.spark.java.sparkstream.CreateDFFromHive /usr/soft/spark-test.jar
```



运行结果：

> ![](https://wx1.sinaimg.cn/large/005zftzDgy1g0hg723i9kj30qf0e50u8.jpg)
>
> ![](https://wx1.sinaimg.cn/large/005zftzDgy1g0hg5sximqj30qf0e5dhq.jpg)

# 五、悬而未决

## 1、关于序列化的问题你要知道的



```
测试java中以下几种情况下不被序列化的问题：

1.反序列化时serializable 版本号不一致时会导致不能反序列化。

2.子类中实现了serializable接口，父类中没有实现，
父类中的变量不能被序列化,序列化后父类中的变量会得到null。

注意：
父类实现serializable接口,子类没有实现serializable接口时，子类可以正常序列化

3.被关键字transient修饰的变量不能被序列化。

4.静态变量不能被序列化，属于类，不属于方法和对象，所以不能被序列化。
```

## 2、储存 DataFrame

* 将 DataFrame 存储为 parquet 文件。

* 将 DataFrame 存储到 JDBC 数据库。

* 将 DataFrame 存储到 Hive 表。

# 六、自定义函数UDF和UDAF

## 1、UDF:用户自定义函数

`Java`

```java
包：
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.Function;
import org.apache.spark.sql.DataFrame;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.RowFactory;
import org.apache.spark.sql.SQLContext;
import org.apache.spark.sql.api.java.UDF1;
import org.apache.spark.sql.api.java.UDF2;
import org.apache.spark.sql.types.DataTypes;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType; 

main:

SparkConf conf = new SparkConf();
        conf.setMaster("local").setAppName("udf");
        JavaSparkContext context = new JavaSparkContext(conf);
        SQLContext sqlContext = new SQLContext(context);

JavaRDD<String> paraRDD = context.parallelize(Arrays.asList("zs1","ls12","ww123"));

        //rowRDD
        JavaRDD<Row> rowRDD = paraRDD.map(new Function<String, Row>() {
            @Override
            public Row call(String v1) throws Exception {
                return RowFactory.create(v1);
            }
        });

        //schema
        List<StructField> list = new ArrayList<StructField>();
        list.add(DataTypes.createStructField("name",DataTypes.StringType,true));
        StructType schema = DataTypes.createStructType(list);

        //DataFrame
        DataFrame df = sqlContext.createDataFrame(rowRDD,schema);
        df.registerTempTable("names");

        //udf
      sqlContext.udf().register("StringLen",new UDF1<String,Integer>(){
          @Override
          public Integer call(String s) throws Exception {
              return s.length();
          }
      },DataTypes.IntegerType);

      //udf2
      sqlContext.udf().register("StringLens", new UDF2<String, Integer, Integer>() {
            @Override
            public Integer call(String s, Integer s2) throws Exception {
                System.out.println(s2.toString());
                return s.length()+s2;
            }
        },DataTypes.IntegerType);

      //使用sql
    sqlContext.sql("select name ,StringLens(name,100) as length from names").show();

        context.stop();

```

`Scala`

```scala
    val conf = new SparkConf()
    conf.setMaster("local").setAppName("udf")
    val context = new SparkContext(conf)
    val sqlContext = new SQLContext(context)

    val rdd = context.makeRDD(Array("zs1","ls12","ww123"))

   val rowRDD = rdd.map(x=>{
     RowFactory.create(x)
   })

    val field = Array(DataTypes.createStructField("name",DataTypes.StringType,true))
    val schema = DataTypes.createStructType(field)

    val df = sqlContext.createDataFrame(rowRDD,schema)
    df.registerTempTable("names")

    sqlContext.udf.register("StringLen",(x:String)=>{
      x.length
    })

    sqlContext.udf.register("StringLens",(x:String,y:Integer)=>{
      x.length+y
    })

   sqlContext.sql("select name , StringLen(name) from names").show()

    sqlContext.sql("select name,StringLens(name,100)from names").show()

    context.stop()

```



## 2、UDAF:用户自定义聚合函数

* >  实现 UDAF 函数如果要自定义类要实现UserDefinedAgg regateFunction 类

功能：实现统计相同值得个数

数据：

         *     zhangsan
         *     zhangsan
         *     lisi
         *     lisi
         *     wangwu
         *     wangwu
         *     zhangsan
         *
         *     select count(*)  from user group by name
`Java`

```java
        SparkConf conf = new SparkConf();
        conf.setMaster("local").setAppName("udaf");
        JavaSparkContext context = new JavaSparkContext(conf);
        SQLContext sqlContext = new SQLContext(context);
//指定了两个分区
 JavaRDD<String> rdd = context.parallelize(
       Arrays.asList("zhangsan", "lisi", "wangwu", "zhangsan", "zhangsan","lisi",                "zhangsan", "lisi", "wangwu", "zhangsan", "zhangsan", "lisi"), 2);

        JavaRDD<Row> rowRDD = rdd.map(new Function<String, Row>() {
            @Override
            public Row call(String v1) throws Exception {
                return RowFactory.create(v1);
            }
        });

        List<StructField> field = new ArrayList<>();
        field.add(DataTypes.createStructField("name",DataTypes.StringType,true));

        StructType schema = DataTypes.createStructType(field);
        DataFrame df  = sqlContext.createDataFrame(rowRDD, schema);
        df.registerTempTable("names");

      sqlContext.udf().register("CountString", new UserDefinedAggregateFunction() {

            //select name ,StringCount(name) as number from user group by name

            //初始化一个内部的自己定义的值,在Aggregate之前每组数据的初始化结果
            @Override
            public void initialize(MutableAggregationBuffer buffer) {
                //初始化buffer第0位置的元素为0

                buffer.update(0,0);
                System.out.println("buffer initialize ----"+buffer.get(0));
            }

            /**
             * 更新 可以认为一个一个地将组内的字段值传递进来 实现拼接的逻辑
             * buffer.getInt(0)获取的是上一次聚合后的值
             * 相当于map端的combiner，combiner就是对每一个map task的处理结果进行一次小聚合
             * 大聚和发生在reduce端.
             * 这里即是:在进行聚合的时候，每当有新的值进来，对分组后的聚合如何进行计算
             */
            //相当于分区内
            //buffer1:表示上一次的累加值   buffer2:本次传进来的值
            //将函数输入的参数理解为一行（Row）
            @Override
            public void update(MutableAggregationBuffer buffer, Row arg1) {
System.out.println("class buffer :"+buffer.getClass()+"-------"+buffer.hashCode());

System.out.println("class  arg1:"+arg1.getClass()+"-------"+arg1.hashCode());

                buffer.update(0,buffer.getInt(0)+1);
System.out.println("update----buffer:"+buffer.toString()+",arg1:"+arg1.toString());

            }

            /**
             * 合并 update操作，
             可能是针对一个分组内的部分数据，在某个节点上发生的 
             但是可能一个分组内的数据，会分布在多个节点上处理
             * 此时就要用merge操作，将各个节点上分布式拼接好的串，合并起来
             * buffer1.getInt(0) : 大聚合的时候 上一次聚合后的值
             * buffer2.getInt(0) : 本次计算传入进来的update的结果
             * 这里即是：最后在分布式节点完成后需要进行全局级别的Merge操作
             */

            //相当于分区之间
            @Override
            public void merge(MutableAggregationBuffer buffer1, Row buffer2) {
System.out.println("class buffer1 :"+buffer1.getClass()+"----"+buffer1.hashCode());

System.out.println("class buffer2 :"+buffer2.getClass()+"----"+buffer2.hashCode());


                buffer1.update(0,buffer1.getInt(0)+buffer2.getInt(0));
 System.out.println("merge：b1:"+buffer1.toString()+",buffer2:"+buffer2.toString());

            }

            //指定输入字段的字段及类型
            @Override
            public StructType inputSchema() {
                return DataTypes.createStructType(                        Arrays.asList(DataTypes.createStructField("name",DataTypes.StringType,true))
                );
            }

            // 在进行聚合操作的时候所要处理的数据的结果的类型
            @Override
            public StructType bufferSchema() {
               return DataTypes.createStructType(                       Arrays.asList(DataTypes.createStructField("buffer",DataTypes.IntegerType,true)));
            }

            //指定UDAF函数计算后返回的结果类型
            @Override
            public DataType dataType() {
                return DataTypes.IntegerType;
            }

            //最后返回一个和DataType的类型要一致的类型，返回UDAF最后的计算结果
            @Override
            public Object evaluate(Row buffer) {
                return buffer.getInt(0);
            }

            //确保一致性 一般用true,用以标记针对给定的一组输入，UDAF是否总是生成相同的结果。
            @Override
            public boolean deterministic() {
                return true;
            }
        });


        sqlContext.sql("select name , CountString(name) from names").show();
        context.stop();
```

`Scala`

```scala
import org.apache.spark.SparkConf
import org.apache.spark.SparkContext
import org.apache.spark.sql.Row
import org.apache.spark.sql.RowFactory
import org.apache.spark.sql.SQLContext
import org.apache.spark.sql.expressions.MutableAggregationBuffer
import org.apache.spark.sql.expressions.UserDefinedAggregateFunction
import org.apache.spark.sql.types.DataType
import org.apache.spark.sql.types.DataTypes
import org.apache.spark.sql.types.IntegerType
import org.apache.spark.sql.types.StringType
import org.apache.spark.sql.types.StructType

class MyUDAF extends UserDefinedAggregateFunction  {
  // 为每个分组的数据执行初始化值
  def initialize(buffer: MutableAggregationBuffer): Unit = {
     buffer(0) = 0
  }
  // 每个组，有新的值进来的时候，进行分组对应的聚合值的计算
  def update(buffer: MutableAggregationBuffer, input: Row): Unit = {
    buffer(0) = buffer.getAs[Int](0)+1
  }       
  // 最后merger的时候，在各个节点上的聚合值，要进行merge，也就是合并
  def merge(buffer1: MutableAggregationBuffer, buffer2: Row): Unit = {
    buffer1(0) = buffer1.getAs[Int](0)+buffer2.getAs[Int](0) 
  }    
  //输入数据的类型
  def inputSchema: StructType = {
    DataTypes.createStructType(
        Array(DataTypes.createStructField("input", StringType, true)))
  }    
    // 聚合操作时，所处理的数据的类型
  def bufferSchema: StructType = {
    DataTypes.createStructType(
        Array(DataTypes.createStructField("aaa", IntegerType, true)))
  }
  // 最终函数返回值的类型
  def dataType: DataType = {
    DataTypes.IntegerType
  }
  // 最后返回一个最终的聚合值   要和dataType的类型一一对应
  def evaluate(buffer: Row): Any = {
    buffer.getAs[Int](0)
  }    
//保证数据一致性
  def deterministic: Boolean = {
    true
  }
}

object UDAF {
  def main(args: Array[String]): Unit = {
    val conf = new SparkConf()
    conf.setMaster("local").setAppName("udaf")
    val sc = new SparkContext(conf)
    val sqlContext = new SQLContext(sc)
    val rdd = sc.makeRDD(Array("zhangsan","lisi","wangwu","zhangsan","lisi"))
    val rowRDD = rdd.map { x => {RowFactory.create(x)} }   
    val schema =DataTypes.createStructType(
        Array(DataTypes.createStructField("name", StringType, true)))
    val df = sqlContext.createDataFrame(rowRDD, schema)
    df.show()
    df.registerTempTable("user")
    /**
     * 注册一个udaf函数
     */
    sqlContext.udf.register("StringCount", new MyUDAF())
    sqlContext.sql("select name ,StringCount(name) from user group by name").show()
    sc.stop()
  }
}
```



# 七、开窗函数(基于Hive的开窗函数)

**`注意：`**

* row_number() 开窗函数是按照某个字段分组，然后取另一字段的前几个的值，相当于 分组取 topN

* 如果 SQL 语句里面使用到了开窗函数，那么这个 SQL 语句必须使用HiveContext 来执行，HiveContext 默认情况下在本地无法创建。

* 开窗函数格式：

  ```sql
  row_number() over (partitin by XXX order by XXX)
  ```


`Java`

```java
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.DataFrame;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.hive.HiveContext;

/**
 * row_number()开窗函数：
 * 主要是按照某个字段分组，然后取另一字段的前几个的值，相当于 分组取topN
 group by .... order by  .... limit 0, 5 ;
 * row_number() over (partition by xxx order by xxx desc) xxx
 * 注意：
 * 如果SQL语句里面使用到了开窗函数，那么这个SQL语句必须使用HiveContext来执行
 * @author root
 *
 */
public class RowNumberWindowFun {
    //-Xms800m -Xmx800m  -XX:PermSize=64M -XX:MaxNewSize=256m -XX:MaxPermSize=128m
	public static void main(String[] args) {
		SparkConf conf = new SparkConf();
		conf.setAppName("windowfun").setMaster("local");
		JavaSparkContext sc = new JavaSparkContext(conf);
        conf.set("spark.sql.shuffle.partitions", "1");
		HiveContext hiveContext = new HiveContext(sc);
		hiveContext.sql("use spark");
		hiveContext.sql("drop table if exists sales");
		hiveContext.sql(
            "create table if not exists sales (riqi string,leibie string,jine Int) "
		    + "row format delimited fields terminated by '\t'");
		hiveContext.sql(
            "load data local inpath './data/sales.txt' into table sales");
		/**
		 * 开窗函数格式：
		 * 【 row_number() over (partition by XXX order by XXX) as rank】
		 * 注意：rank 从1开始
		 */
		/**
		 * 以类别分组，按每种类别金额降序排序，显示 【日期，种类，金额】 结果，如：
		 * 
		 * 1 A 100
         * 2 B 200
         * 3 A 300
         * 4 B 400
         * 5 A 500
         * 6 B 600
		 * 排序后：
		 * 5 A 500  --rank 1
		 * 3 A 300  --rank 2 
		 * 1 A 100  --rank 3
		 * 6 B 600  --rank 1
		 * 4 B 400	--rank 2
         * 2 B 200  --rank 3
		 *
         * 2018 A 400     1
         * 2017 A 500     2
         * 2016 A 550     3
         *
         *
         * 2016 A 550     1
         * 2017 A 500     2
         * 2018 A 400     3
         *
		 */
//无法取前三
//hiveContext.sql("select riqi,leibie,jine,"
//             + "row_number() over (partition by leibie order by jine desc) rank "
//             + "from sales").show();


		DataFrame result = hiveContext.sql(
"select riqi,leibie,jine,rank from ( select riqi,leibie,jine,"	
+ "row_number() over (partition by leibie order by jine desc) rank from sales) t"
+ "where t.rank<=3");
		result.show(100);
		/**
		 * 将结果保存到hive表sales_result
		 */
		result.write().mode(SaveMode.Overwrite).saveAsTable("sales_result");
		sc.stop();
	}
}

```

`Scala`

```scala
import org.apache.spark.SparkConf
import org.apache.spark.SparkContext
import org.apache.spark.sql.hive.HiveContext

object RowNumberWindowFun {
  def main(args: Array[String]): Unit = {
    val conf = new SparkConf()
    conf.setAppName("windowfun")
    val sc = new SparkContext(conf)
    val hiveContext = new HiveContext(sc)
    hiveContext.sql("use spark");
    hiveContext.sql("drop table if exists sales");
    hiveContext.sql(
       "create table if not exists sales (riqi string,leibie string,jine Int) "
	   + "row format delimited fields terminated by '\t'");
		hiveContext.sql(
            "load data local inpath '/root/test/sales' into table sales");
		/**
		 * 开窗函数格式：
		 * 【 rou_number() over (partitin by XXX order by XXX) 】
		 */
	val result = hiveContext.sql(
        "select riqi,leibie,jine from (select riqi,leibie,jine,"		
		+"row_number() over (partition by leibie order by jine desc) rank"
	    + "from sales) t where t.rank<=3");
		result.show();
    sc.stop()
  }
}
```

