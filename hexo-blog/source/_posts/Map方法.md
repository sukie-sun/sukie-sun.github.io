---
title: Map方法
date: 2019-2-16
update: 2019-2-16
tags:
  - Map
categories: Scala
grammar_cjkRuby: true
mathjax: true
overdue: true
description: Scala中Map的方法
abbrlink: 253e9d6d
---



```scala
Scala Map 方法
下表列出了 Scala Map 常用的方法：
序号	方法及描述

def ++(xs: Map[(A, B)]): Map[A, B]
返回一个新的 Map，新的 Map xs 组成

def -(elem1: A, elem2: A, elems: A*): Map[A, B]
返回一个新的 Map, 移除 key 为 elem1, elem2 或其他 elems。
	
def --(xs: GTO[A]): Map[A, B]
返回一个新的 Map, 移除 xs 对象中对应的 key

def get(key: A): Option[B]
返回指定 key 的值

def iterator: Iterator[(A, B)]
创建新的迭代器，并输出 key/value 对

def addString(b: StringBuilder): StringBuilder
将 Map 中的所有元素附加到StringBuilder，可加入分隔符

def addString(b: StringBuilder, sep: String): StringBuilder
将 Map 中的所有元素附加到StringBuilder，可加入分隔符
	
def apply(key: A): B
返回指定键的值，如果不存在返回 Map 的默认方法

def clone(): Map[A, B]
从一个 Map 复制到另一个 Map

def contains(key: A): Boolean
如果 Map 中存在指定 key，返回 true，否则返回 false。

def copyToArray(xs: Array[(A, B)]): Unit
复制集合到数组

def count(p: ((A, B)) => Boolean): Int
计算满足指定条件的集合元素数量

def default(key: A): B
定义 Map 的默认值，在 key 不存在时返回。

def drop(n: Int): Map[A, B]
返回丢弃前n个元素新集合

def dropRight(n: Int): Map[A, B]
返回丢弃最后n个元素新集合

def dropWhile(p: ((A, B)) => Boolean): Map[A, B]
从左向右丢弃元素，直到条件p不成立

def empty: Map[A, B]
返回相同类型的空 Map

def equals(that: Any): Boolean
如果两个 Map 相等(key/value 均相等)，返回true，否则返回false

def exists(p: ((A, B)) => Boolean): Boolean
判断集合中指定条件的元素是否存在

def filter(p: ((A, B))=> Boolean): Map[A, B]
返回满足指定条件的所有集合

def filterKeys(p: (A) => Boolean): Map[A, B]
返回符合指定条件的的不可变 Map

def find(p: ((A, B)) => Boolean): Option[(A, B)]
查找集合中满足指定条件的第一个元素

def foreach(f: ((A, B)) => Unit): Unit
将函数应用到集合的所有元素

def init: Map[A, B]
返回所有元素，除了最后一个

def isEmpty: Boolean
检测 Map 是否为空
	
def keys: Iterable[A]
返回所有的key/p>

def last: (A, B)
返回最后一个元素

def max: (A, B)
查找最大元素

def min: (A, B)
查找最小元素

def mkString: String
集合所有元素作为字符串显示

def product: (A, B)
返回集合中数字元素的积。

def remove(key: A): Option[B]
移除指定 key

def retain(p: (A, B) => Boolean): Map.this.type
如果符合满足条件的返回 true

def size: Int
返回 Map 元素的个数

def sum: (A, B)
返回集合中所有数字元素之和

def tail: Map[A, B]
返回一个集合中除了第一元素之外的其他元素

def take(n: Int): Map[A, B]
返回前 n 个元素

def takeRight(n: Int): Map[A, B]
返回后 n 个元素

def takeWhile(p: ((A, B)) => Boolean): Map[A, B]
返回满足指定条件的元素

def toArray: Array[(A, B)]
集合转数组

def toBuffer[B >: A]: Buffer[B]
返回缓冲区，包含了 Map 的所有元素

def toList: List[A]
返回 List，包含了 Map 的所有元素

def toSeq: Seq[A]
返回 Seq，包含了 Map 的所有元素

def toSet: Set[A]
返回 Set，包含了 Map 的所有元素

def toString(): String
返回字符串对象
```



















































