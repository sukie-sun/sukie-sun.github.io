---
title: CDH部署操作
date: 2019-1-18
update: 2019-1-19
tags:
  - HDFS
categories: CDH
grammar_cjkRuby: true
mathjax: true
overdue: true
no_word_count: false
description: 集群管理工具
abbrlink: d981c58f
---

# **报错：**

1、`Error:JAVA_HOME is not set and Java could not fund.Cloudera Manager requires Java 1.6 or later .NOTE：This script will find Oracle Java whether you install using the binary or the RPM based installer`

![](https://wx1.sinaimg.cn/large/005zftzDgy1fzc3r48t1wj30f004qq3s.jpg)



原因：它运行时会默认到（ /usr/java/default）这个路径下找jdk

> 在 /usr/java/default目录下创建jdk访问的软连接，
>
> ```shell
> ln -s /home/jdk1.8.0_191 /usr/java/default
> ```
>
>









































