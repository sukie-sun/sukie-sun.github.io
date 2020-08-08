---
title: Linux系统数据库MySQL安装
tags:
  - Linux系统环境
categories: MySQL
grammar_cjkRuby: true
description: 关系型数据库----MySQL
abbrlink: 8ce98c68
date: 2018-12-26 00:00:00
---

# Linux系统数据库MySQL安装

## 一、第一次安装MySQL

### 1、yum安装

> 命令 ： yum -y install mysql-server mysql-devel

### 2、登录

> 命令 ： mysql -u -p

`显示：`

```
mysql>
```



### 3、查看数据库(注意用‘ ; ’结束 )

> 命令 ： show databases;

### 4、退出：

> 命令： quit；

### 5、创建用户：

> 命令 ： mysqladmin -uroot password 123456

### 6、再登录：

> 命令 ：mysql -u root -p

`显示：`

```
mysql>
```

说明成功了！

### 7、数据库操作：

> 命令 ： use mysql;

`显示：`

```
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
```

### 8、查看用户数据表：

> 命令 ： show tables;

### 9、查询user表部分字段：

> 命令 ： select host,user,password from user;

### 10、通过修改user表的host字段，设置数据库访问权限，只要用户名和密码正确

#### （1）推荐

现将user表中其他无密码的记录删除

> 命令 ： delete from user where password = ' ';

#### (2)更新有密码的记录的host字段值

> 命令 ： update user set host = "%";

#### (3)刷新权限

>  命令 ：flush privileges;

#### (4)退出

> 命令 ：quit;



## 二、Linux系统登录数据库MySQL报错

### 报错一：

1、登录 

> mysqld -uroot -p123456

`报错：`

```
Can't connect to local MySQL server through socket '/var/lib/mysql/mysql.sock' (111)
```

`解决：`

1）、先删除mysql.sock

> cd /var/lib/mysql

> mv  mysql.sock  mysql.sock.bak

2）、再次登陆

> mysql -uroot -p123456

`报错：`

```
 Can't connect to local MySQL server through socket '/var/lib/mysql/mysql.sock' (2)
```

 3）、看看mysql的状态，

>  /etc/rc.d/init.d/mysqld status

 `显示：`

>  mysqld is stopped

4）、看看是不是mysql的权限问题
在/var/lib目录下：

> ls -lt|grep mysql

`显示：`

> drwxr-xr-x. 4 mysql   mysql 4096 Jan  6 11:09 mysql

5）、说明mysql服务没有启动

2、启动mysql服务

> /etc/init.d/mysqld start
>
> 或
>
> service mysqld start

`显示：`

```
Starting mysqld:                                           [  OK  ]
```

3、再次登录：

> mysql -uroot -p123456

`显示：`

```
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 2
Server version: 5.1.73 Source distribution

Copyright (c) 2000, 2013, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 
```

4、退出

> quit

5、解决出现mysql.sock的问题

>   （1）、vim /etc/mycnf

  编辑内容：

```
  [mysqld]
  skip_name_resolve=on innodb_file_per_table=on
```

  按esc :wq 保存并退出
  （2）使用命令：

> mysql_secure_installation

  （3）直接[ enter ] 键，输入密码，



(另推荐：Jakie_ZHF老师的博客)

###   报错二：

```
  ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
```





























































