---
title: 手动安装maven坐标依赖
tags: maven
categories: maven
description: 学习quartz时遇到的问题
abbrlink: 1c419a90
date: 2018-12-24 02:16:47
---



## 一、事件原因：

学习quartz框架时，在maven项目的pom.xml文件中添加quartz所需要的坐标依赖时，显示jar包不存在。

```xml
提示："Dependency 'xxxx‘ not found"，	
并且添加的如下两个坐标依赖均报红。
        <dependency>
            <groupId>org.quartz-scheduler</groupId>
            <artifactId>quartz</artifactId>
            <version>2.3.0</version>
        </dependency>
         <!-- 工具 -->
        <dependency>
            <groupId>org.quartz-scheduler</groupId>
            <artifactId>quartz-jobs</artifactId>
            <version>2.3.0</version>
        </dependency>
```

分析：

| 1、maven项目所需要的jar包均存放在maven的F:\m2\repository(项目所需的jar包仓库)文件夹中 |
| ------------------------------------------------------------ |
| 2、在F:\apache-maven-3.5.4\conf的settings.xml文件中有如下设置：（由于使用远程仓库太慢，阿里云给我们提供了一个镜像仓库，便于我们使用，且只包含central仓库中的jar） |

```xml
<!--文件中原有的配置：远程仓库--->
<mirror>
      <id>mirrorId</id>
      <mirrorOf>repositoryId</mirrorOf>
      <name>Human Readable Name for this Mirror.</name>
      <url>http://my.repository.com/repo/path</url>
    </mirror>
```



```xml
<!--文件中自己手动配置：阿里镜像仓库--->
<mirror>  
	<id>nexus-aliyun</id>  
	<mirrorOf>central</mirrorOf>    
	<name>Nexus aliyun</name>  
	<url>http://maven.aliyun.com/nexus/content/groups/public</url>
    </mirror>
```

![](C:\Users\Administrator\Desktop\1.jpg)

| 3.可是我们在https://mvnrepository.com/（maven仓库）中发现有我们要的jar包，而且就在Central仓库里，这里我们就很奇怪了，后来就选择还是手动安装jar包吧 |
| ------------------------------------------------------------ |
| （如果有小伙伴有别的解决方案，还请指点一二。）               |

```
<!--more-->
```



## 二、解决方案

1、首先，我们需要从maven  Repository中下载我们需要的jar包（需要的两个jar包，下载原理相同）

![](C:\Users\Administrator\Desktop\2.jpg)

2、注意我们的maven安装，需要配置环境变量，才能在dos窗口，指令安装jar包

![](C:\Users\Administrator\Desktop\4.jpg)

因为我之前查资料时，有小伙伴说，java的环境变量配置也会影响，所以，我在这里也把java的环境变量配置也贴出来

![1](C:\Users\Administrator\Desktop\5.jpg)

![1544699916763](C:\Users\ADMINI~1\AppData\Local\Temp\1544699916763.png)

![1544699989775](C:\Users\ADMINI~1\AppData\Local\Temp\1544699989775.png)

| JAVA_HOME                                                    |
| ------------------------------------------------------------ |
| F:\Java\jdk1.8.0_131（  根据自己的jdk安装目录）              |
| **CLASSPATH**                                                |
| .;%JAVA_HOME%\lib;%JAVA_HOME%\lib\dt.jar;%JAVA_HOME%\lib\tools.jar |
| **MAVEN_HOME**                                               |
| F:\apache-maven-3.5.4（ 根据自己maven安装目录）              |
| **Path**（注意配置的时候，一定要和配置home时的变量名一致，如MAVEN_HOME,我配置成了%MVN_HOME%\bin;） |
| %JAVA_HOME%\bin;%JAVA_HOME%\jre\bin;%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem;%SYSTEMROOT%\System32\WindowsPowerShell\v1.0\;%MYSQL_HOME%\bin;%MAVEN_HOME%\bin; |

配置这些环境变量，在dos窗口才能使java  ，mvn  之类的指令可以用；

否则会出现如下显示。

| 'mvn' 不是内部或外部命令，也不是可运行的程序 |
| -------------------------------------------- |
| (这就是环境变量没有配成功的结果)             |

3.安装

| C:\Users\Administrator>mvn -v                                |
| ------------------------------------------------------------ |
| ![1544701045091](C:\Users\ADMINI~1\AppData\Local\Temp\1544701045091.png) |
| C:\Users\Administrator>mvn install:install-file -Dfile=F:/apache-maven-3.5.4/m2/quartz-2.3.0.jar（jar包所在路径） -DgroupId=org.quartz-scheduler -DartifactId=quartz -Dversion=2.3.0 -Dpackaging=jar |
| （根据下面所示的配置groupId、artifactId、version）           |

```xml
 <dependency>
            <groupId>org.quartz-scheduler</groupId>
            <artifactId>quartz</artifactId>
            <version>2.3.0</version>
        </dependency>
```

![1544702128551](C:\Users\ADMINI~1\AppData\Local\Temp\1544702128551.png)

如图所示，安装成功。

![1544702179172](C:\Users\ADMINI~1\AppData\Local\Temp\1544702179172.png)

