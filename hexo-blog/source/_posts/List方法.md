---
title: List方法
date: 2019-2-16
update: 2019-2-16
tags:
  - List
categories: Scala
grammar_cjkRuby: true
mathjax: true
overdue: true
description: Scala中List的方法
abbrlink: b1f7c771
---



```scala
def +(elem: A): List[A]
前置一个元素列表

def ::(x: A): List[A]
在这个列表的开头添加的元素。

def :::(prefix: List[A]): List[A]
增加了一个给定列表中该列表前面的元素。

def ::(x: A): List[A]
增加了一个元素x在列表的开头

def addString(b: StringBuilder): StringBuilder
追加列表的一个字符串生成器的所有元素。

def addString(b: StringBuilder, sep: String): StringBuilder
追加列表的使用分隔字符串一个字符串生成器的所有元素。

def apply(n: Int): A
选择通过其在列表中索引的元素

def contains(elem: Any): Boolean
测试该列表中是否包含一个给定值作为元素。

def copyToArray(xs: Array[A], start: Int, len: Int): Unit
列表的副本元件阵列。填充给定的数组xs与此列表中最多len个元素，在位置开始。

def distinct: List[A]
建立从列表中没有任何重复的元素的新列表。

def drop(n: Int): List[A]
返回除了第n个的所有元素。

def dropRight(n: Int): List[A]
返回除了最后的n个的元素

def dropWhile(p: (A) => Boolean): List[A]
丢弃满足谓词的元素最长前缀。

def endsWith[B](that: Seq[B]): Boolean
测试列表是否使用给定序列结束。

def equals(that: Any): Boolean
equals方法的任意序列。比较该序列到某些其他对象。

def exists(p: (A) => Boolean): Boolean
测试谓词是否持有一些列表的元素。

def filter(p: (A) => Boolean): List[A]
返回列表满足谓词的所有元素。

def forall(p: (A) => Boolean): Boolean
测试谓词是否持有该列表中的所有元素。

def foreach(f: (A) => Unit): Unit
应用一个函数f以列表的所有元素。

def head: A
选择列表的第一个元素

def indexOf(elem: A, from: Int): Int
经过或在某些起始索引查找列表中的一些值第一次出现的索引。

def init: List[A]
返回除了最后的所有元素

def intersect(that: Seq[A]): List[A]
计算列表和另一序列之间的多重集交集。

def isEmpty: Boolean
测试列表是否为空

def iterator: Iterator[A]
创建一个新的迭代器中包含的可迭代对象中的所有元素

def last: A
返回最后一个元素

def lastIndexOf(elem: A, end: Int): Int
之前或在一个给定的最终指数查找的列表中的一些值最后一次出现的索引

def length: Int
返回列表的长度

def map[B](f: (A) => B): List[B]
通过应用函数以g这个列表中的所有元素构建一个新的集合

def max: A
查找最大的元素

def min: A
查找最小元素

def mkString: String
显示列表的字符串中的所有元素

def mkString(sep: String): String
显示的列表中的字符串中使用分隔串的所有元素

def reverse: List[A]
返回新列表，在相反的顺序元素

def sorted[B >: A]: List[A]
根据排序对列表进行排序

def startsWith[B](that: Seq[B], offset: Int): Boolean
测试该列表中是否包含给定的索引处的给定的序列

def sum: A
概括这个集合的元素

def tail: List[A]
返回除了第一的所有元素

def take(n: Int): List[A]
返回前n个元素

def takeRight(n: Int): List[A]
返回最后n个元素

def toArray: Array[A]
列表以一个数组变换

def toBuffer[B >: A]: Buffer[B]
列表以一个可变缓冲器转换

def toMap[T, U]: Map[T, U]
此列表的映射转换

def toSeq: Seq[A]
列表的序列转换

def toSet[B >: A]: Set[B]
列表到集合变换

def toString(): String
列表转换为字符串
```





















































