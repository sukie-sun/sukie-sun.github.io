---
title: MapReduce案例实践
date: 2019-1-7
tags:
  - MapReduce
  - 分布式离线计算框架
categories: 计算框架
grammar_cjkRuby: true
description: MapReduce案例实现项目
abbrlink: 2da2159f
---

端口统计：

| Port  |      使用框架      |
| :---: | :----------------: |
| 50070 |   hdfs的http端口   |
| 9000  | hadoop1.X的rpc端口 |
| 8020  | hadoop2.X的rpc端口 |
| 8088  |   YARN的http端口   |
|       |                    |



# 一、单词字数统计

Job类

> 新建Configuration ：
>
> ​     设置hdfs和yarn的配置
>
> 获取Job ：
>
> ​     设置Job类和JobName
>
> ​     设置Map端和Reduce端的类
>
> ​    设置Map端输出的key和value的类
>
> 调用FileInputFormat类添加输入的文件
>
> 调用FileOutputFormat类添加计算结果存放的路径

Map类

> 将输入的（K，V）转换成新的（K,V）：每个单词计数为1
>
> 通过Context写出

Reduce类

> 遍历获取的value-list ， 实现累加
>
> 通过Context写出

# 二、二度人脉推荐

Job类

> 新建Configuration ：
>
> ​     设置hdfs和yarn的配置
>
> 获取Job ：
>
> ​     设置Job类和JobName
>
> ​     设置Map端和Reduce端的类
>
> ​    设置Map端输出的key和value的类
>
> 调用FileInputFormat类添加输入的文件（在hdfs上）
>
> 调用FileOutputFormat类添加计算结果存放的路径（在hdfs上）
>
> *如上配置两个Job任务。*

Map01类

> 根据一度好友，建立排序后的某一用户与好友对应关系，作为key ，用0作为value
>
> 同样  ，建立排序后某一用户好友的好友之间的对应关系，作为key ， 用 1 作为value
>
> 用context写出

Reduce01类

> 排除好友对应关系中value为 0 的 key ， 统计好友关系中value 为非0 的key的个数 ， 并将该好友关系拼接个数，作为key，用context写出，null为value

Map02类

> 切分输入的key ， 分别获取好友关系以及个数，写出时，根据个数排序，

Reduce02类

> 再次合并，输出二度好友关系，按热度排序

# 三、天气统计每月Top

存在二次排序：需要定义两个比较器

分组---排序

排序--再按温度

Map类

> 将输入的数据的格式，转换成所需的文件格式对象，并以（K,V）格式写出
>
> 在写出之前，已经按月分组，并按温度排序



Reduce类

> 将对象转换成字符串，再以新的（K,V）格式写出
>
> 写出之前只取前两个温度最高的

# 四、tf-idf ：微博热词重要性搜索

分成三个Job

Job1

> 基本配置以及指定输入输出文件路径

Map1

> 计算词频 ， 分词器ik  ， 得到的单词拼接微博Id ，作为key ， 以1 为value
>
> 以count为key ， 以 1 为value ， 用来对微博计数

Reduce1

> 对分词累加 ， 对微博数累加 ， 按分区以新的（K,V） 写出

Job 2 

> 以Job1 的输出作为输入文件，再指定输出文件路径

Map2

> 获取所有输入的split ， 对所有单词 ， 以单词为key ， 以  1 为value

Reduce2 

> 对所有单词进行统计，

Job3

> 以Job1 的输出文件作为输入文件

Map3 

>





























