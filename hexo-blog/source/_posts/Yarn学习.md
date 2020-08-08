---
title: YARN的入门学习
tags:
  - yarn
categories: HDFS
grammar_cjkRuby: true
description: 基于HDFS系统的资源管理框架
abbrlink: eaf5b793
date: 2019-01-04 08:30:00
---

# 一、简介

## yarn（资源管理器）

### （1）存在背景：

MR1.0存在缺陷：

![](https://wx1.sinaimg.cn/large/005zftzDgy1fzczt4wiysj30x90ftq5v.jpg)

* 单点故障：

仅有一个JobTracker负责整个作业的调度、管理、监控、资源调度

（一个作业拿到后会分解多个任务去执行mapduce，JobTracker把任务分配给TaskTracker来具体负责执行相关map或reduce任务）

* JobTracker‘大包大揽’，管理事项过多

（上限4000个节点）

* 容易出现内存溢出

* 资源划分不合理

  （强行划分slot，map资源和reduce资源不能互用，导致忙的忙死，闲的闲死）

```
既是一个计算框架，也是一个资源管理框架
```



![](https://wx1.sinaimg.cn/large/005zftzDgy1fzczujcfrmj30n50ee75d.jpg)

### （2）yarn产生

* 对JobTracker进行功能分解，将资源管理功能分给ResourceManager，将任务调度和任务监控分给ApplicationMaster，将TaskTracker的任务交给NodeManager



```
纯粹的资源管理框架
被剥离资源管理调度功能的MapReduce就变成了MR2.0，他就是一个运行在YARN上的一个纯粹的计算框架，由YARN为其提供资源管理调度服务
```

`什么叫纯粹的计算框架？？`

它提供一些计算基类，使用时，编写map类和reduce类的子类，去继承它。然后计算框架去做后台自动分片，shuffle过程。

`资源管理框架？？`

它专门管理CPU内存资源的分配



# 二、YARN设计思路

![](https://wx1.sinaimg.cn/large/005zftzDgy1fzczzrit8qj30wm0e6wie.jpg)

YARN资源管理，任务调度流程：

![](https://wx1.sinaimg.cn/large/005zftzDgy1g18ecu679nj30cj088jso.jpg)

流程大致如下：

·         client客户端向yarn集群(resourcemanager)提交任务

·         resourcemanager选择一个node创建appmaster

·         appmaster根据任务向rm申请资源

·         rm返回资源申请的结果

·         appmaster去对应的node上创建任务需要的资源（container形式，包括内存和CPU）

·         appmaster负责与nodemanager进行沟通，监控任务运行

·         最后任务运行成功，汇总结果。

其中Resourcemanager里面一个很重要的东西，就是调度器Scheduler，调度规则可以使用官方提供的，也可以自定义。



# 三、YARN体系结构

三大核心：

## 1、RecourceManager（RM）

> * ResourceManager（RM）是一个全局的资源管理器，负责整个系统的资源管理和分配，主
>   要包括两个组件，即调度器（Scheduler）和应用程序管理器（Applications Manager）
>
> * 调度器接收来自ApplicationMaster的应用程序资源请求，把集群中的资源以“容器”的形式
>   分配给提出申请的应用程序，容器的选择通常会考虑应用程序所要处理的数据的位置，进行
>   就近选择，从而实现“计算向数据靠拢”
>
> * 容器（Container）作为动态资源分配单位，每个容器中都封装了一定数量的CPU、内存、
>   磁盘等资源，从而限定每个应用程序可以使用的资源量
>
> * 调度器被设计成是一个可插拔的组件，YARN不仅自身提供了许多种直接可用的调度器，也
>   允许用户根据自己的需求重新设计调度器
>
> * 应用程序管理器（Applications Manager）负责系统中所有应用程序的管理工作，主要包括
>   应用程序提交、与调度器协商资源以启动ApplicationMaster、监控ApplicationMaster运行状
>   态并在失败时重新启动等



## 2、ApplicationMaster

> ResourceManager接收用户提交的作业，按照作业的上下文信息以及从NodeManager收集
> 来的容器状态信息，启动调度过程，为用户作业启动一个ApplicationMaster
> ApplicationMaster的主要功能是：
> （1）当用户作业提交时，ApplicationMaster与ResourceManager协商获取资源，
> ResourceManager会以容器的形式为ApplicationMaster分配资源；
>
> （2）把获得的资源进一步分配给内部的各个任务（Map任务或Reduce任务），实现资源
> 的“二次分配”；
>
> （3）与NodeManager保持交互通信进行应用程序的启动、运行、监控和停止，监控申请
> 到的资源的使用情况，对所有任务的执行进度和状态进行监控，并在任务发生失败时执行
> 失败恢复（即重新申请资源重启任务）；
>
> （4）定时向ResourceManager发送“心跳”消息，报告资源的使用情况和应用的进度信
> 息；
>
> （5）当作业完成时，ApplicationMaster向ResourceManager注销容器，执行周期完成。

## 3、NodeManager

> NodeManager是驻留在一个YARN集群中的每个节点上的代理，有所需数据的节点，主要负责：
>
> * 容器生命周期管理
>
> * 监控每个容器的资源（CPU、内存等）使用情况
>
> * 跟踪节点健康状况
>
> * 以“心跳”的方式与ResourceManager保持通信
>
> * 向ResourceManager汇报作业的资源使用情况和每个容器的运行状态
>
> * 接收来自ApplicationMaster的启动/停止容器的各种请求
>
> 需要说明的是，NodeManager主要负责管理抽象的容器，只处理与容器相关的事
> 情，而不具体负责每个任务（Map任务或Reduce任务）自身状态的管理，因为这
> 些管理工作是由ApplicationMaster完成的，ApplicationMaster会通过不断与
> NodeManager通信来掌握各个任务的执行状态



![](https://wx1.sinaimg.cn/large/005zftzDgy1fzd1ueqsbmj30xm0fjwgg.jpg)

# 四、YARN 工作流程

![](https://wx1.sinaimg.cn/large/005zftzDgy1fzd1x7ksg6j30yl0fqjxh.jpg)



# 五、YARN框架与MapReduce1.0框架

## 1、对比分析



> * 从MapReduce1.0框架发展到YARN框架，客户端并没有发生变化，其大部分调用API及
>   接口都保持兼容，因此，原来针对Hadoop1.0开发的代码不用做大的改动，就可以直接放
>   到Hadoop2.0平台上运行



> * 总体而言，YARN相对于MapReduce1.0来说具有以下优势：
>
>   大大减少了承担中心服务功能的ResourceManager的资源消耗
>
>   * ApplicationMaster来完成需要大量资源消耗的任务调度和监控
>   * 多个作业对应多个ApplicationMaster，实现了监控分布化



> * MapReduce1.0既是一个计算框架，又是一个资源管理调度框架，但是，只能支持
>   MapReduce编程模型。而YARN则是一个纯粹的资源调度管理框架，在它上面可以运行包
>   括MapReduce在内的不同类型的计算框架，只要编程实现相应的ApplicationMaster



> * YARN中的资源管理比MapReduce1.0更加高效
>   * 以容器为单位，而不是以slot为单位

## 2、 MapReduce On YARN：MRv2

* 将MapReduce作业直接运行在YARN上，而不是由JobTracker和TaskTracker构建的MRv1系统中

*  基本功能模块

​    YARN：负责资源管理和调度

​    MRAppMaster：负责任务切分、任务调度、任务监控和容错等

​    MapTask/ReduceTask：任务驱动引擎，与MRv1一致

*  每个MapRduce作业对应一个MRAppMaster任务调度

​    YARN将资源分配给MRAppMaster

​    MRAppMaster进一步将资源分配给内部的任务

*  MRAppMaster容错

​    失败后，由YARN重新启动

​    任务失败后，MRAppMaster重新申请资源



# 六、YARN 的发展目标

**YARN 的目标就是实现“一个集群多个框架”？ ，为什么？**

* 一个企业当中同时存在各种不同的业务应用场景，需要采用不同的计算框架

  * MapReduce实现离线批处理

  * 使用Impala实现实时交互式查询分析

  * 使用Storm实现流式数据实时分析

  * 使用Spark实现迭代计算



* 这些产品通常来自不同的开发团队，具有各自的资源调度管理机制

* 为了避免不同类型应用之间互相干扰，企业就需要把内部的服务器拆分成多个集群，分
  别安装运行不同的计算框架，即“一个框架一个集群”



* 导致问题

  * 集群资源利用率低

  * 数据无法共享

  * 维护代价高



* YARN的目标就是实现“一个集群多个框架”，即在一个集群上部署一个统一的资源
  调度管理框架YARN，在YARN之上可以部署其他各种计算框架

* 由YARN为这些计算框架提供统一的资源调度管理服务，并且能够根据各种计算框架
  的负载需求，调整各自占用的资源，实现集群资源共享和资源弹性收缩

* 可以实现一个集群上的不同应用负载混搭，有效提高了集群的利用率

* 不同计算框架可以共享底层存储，避免了数据集跨集群移动

![](https://wx1.sinaimg.cn/large/005zftzDgy1fzd5qv2p73j30r808tdgv.jpg)

