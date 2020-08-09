---
title: Hexo搭建个人博客
tags: [个人兴趣,博客]
categories: Hexo
grammar_cjkRuby: true
mathjax: true
overdue: true
description: '个人博客搭建之路。'
abbrlink: 84961d20
date: 2017-07-16 21:30:15
update: 2020-02-17 21:30:15
---



🃏`请注意`:

博客搭建过程中会碰到两个同名的`_config.yml` 配置文件：一个是站点的全局配置（在全局文件夹根目录../hexo-blog/），一个是博客主题的配置（在主题文件夹根目录../hexo-blog/themes/yelee/）

## 1、 Hexo博客插入【图片】

> 1️⃣首先确认全局../hexo-blog/_config.yml中有
>
> ```yaml
> post_asset_folder: true
> ```
>
> 

> 2️⃣ 在全局../hexo-blog/下执行
>
> ```shell
> npm install https://github.com/CodeFalling/hexo-asset-image --save
> ```
>
> 

> 3️⃣.确保在全局../hexo-blog/source/_posts下创建和md文件同名的目录，在里面放该md需要的图片，然后在md中插入
>
> ```
> ![](目录名/文件名.png)
> ```
>
> 

> :arrow_up_small:  即可在hexo generate时正确生成插入图片。比如：
>
> ```
>     |- post1.md
>     |_ post1
>         |- pic1.png
> ```
>
> 



> :arrow_up_small:  **map**
> 将一个 RDD 中的每个数据项，通过 map 中的函数映射变为一个新的元素。
> 特点：输入一条，输出一条数据。
>
> :black_joker:**mapToPair**   (Java)
>
> 将RDD（如lineRDD）转换成二元组
>
> 🃏 **mapValues**
>
> 操作（K,V）RDD中的value     返回Tuple2<>
>
> 🃏:yellow_heart:
> 

