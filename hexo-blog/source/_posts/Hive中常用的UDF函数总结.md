---
title: Hive中常用的UDF函数总结
date: 2019-1-12
update: 2019-3-25
tags:
  - Hive
categories: HDFS
grammar_cjkRuby: true
mathjax: true
overdue: true
no_word_count: false
description: hive中常用的UDF函数总结
abbrlink: 84748c90
---

一、网络资源

```sql
1、类型转换

cast(expr as <type>)  

如： cast('1' as BIGINT) 字符串转换为数字

2、if语句

if(boolean testCondition, T valueTrue, T valueFalseOrNull)

如果 testCondition 为 true 返回 valueTrue， 否则返回 valueFalse 或 Null

如： if(1 == 1, 1, 2) 结果为1

3、case语句

CASE WHEN a THEN b [WHEN c THEN d]* [ELSE e] END

如：case when a == b then b when a == c then c else d end

4、字符串连接

concat(string1, string2, ...)

如：concat('hello', ' word') 结果为 hello word

5、计算字符串长度

length(string)

如：length('hello') 结果为5

6、查找子串的位置

locate(string substr, string str[, int pos])

如：locate('%', '100%') 返回3

7、聚合某一列数据

collect_set(col)    会去重

collect_list(col)    不会去重

这两个函数均会返回一个索引数组

将数组转换为分割符分割的字符串，如下

concat_ws(' ', collect_set(tblsecondtagmap.tag_name)) 
8、将数组或者map类型的数据分成多行

explode(ARRAY<T> a)

explode(MAP<Tkey,Tvalue> m)

如：

select explode(array('A','B','C'));   

对应abc三行



A
B
C

select explode(map('A',10,'B',20,'C',30));

对应键值对三行

A	10
B	20
C	30
9、解析json数据

get_json_object(string json_string, string path)

path在不同的hive版本中支持情况不同

$ : json对象的根

. : 子对象的操作符

[] : 数组类型的下标形式

* :  通配符，结合 [] 一起使用

如：get_json_object('{"name":"bob"}', '$.name')  返回bob

       get_json_object('{"name":["own","one"]}','$.name[]') 返回 ["own","one"]

       get_json_object('{"name":["own","one"]}','$.name[0]') 返回 own

10、支持的复杂数据类型

array  数组类型，类比索引数组

map   map类型， 类比关联数组

11、支持rlike语句

rlike支持正则表达式。如：

title rlike '^.*?医.*?(公司|院|网|中心|会|联盟|所|门诊|店|厂|门户|集团|美容|整型).*?$'

12、字母大小写转换

upper(string A)   ucase(string A)    将字符串转换为大写字母

lower(string A)    lcase(string A)     将字符串转换为小写字母

13、时间戳与时间的转换

from_unixtime(bigint unixtime[, string format])    将时间戳转换为时间，形如“2008-10-07 03:28:54”这种的形式

unix_timestamp(string date)                                   将时间转换为时间戳，将形如“2008-10-07 03:28:54”这种形式的时间转换为时间戳

14、获取时间或者日期

year(string date)         年    

month(string date)      月

day(string date)          日

hour(string date)         小时

minute(string date)      分钟

second(string date)     秒

--PS

--前三个函数支持‘2008-10-07 03:28:54’ ‘2008-10-07’ 这两种形式

--后三个函数支持‘2008-10-07 03:28:54’ ‘03:28:54’ 这两种形式
```























































