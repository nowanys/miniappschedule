个人博客：https://blog.coder666.cn  
1.本来这个小程序是写给自己家人用来排班的，看了下插件市场全是日历插件，好像排班的还没有，就还是做成通用的，能自定义上班的班次名称，方便大家使用。  
2.云函数中的config模块为设置小程序的appid和secret,插件中我全写成了XXX需要用户自行修改config设置才能使用。另外对应的云数据库需要新建两张表：user,schedule,不要忘了哟。。。  
3.点击新增后需要先设置排班的班次名称。设置完成后选择开始与结束时间，然后添加人员，然后点击未排的方格进行排班。  
4.列表页面不可分享，但是点到单个排班页面时，是可以分享的，便于排班的人员分享给自己的同事，大家看手机就知道排班的班次了。  
5.因为办公的特殊性， 这里不开放修改的功能，避免影响企业正常工作。。。  
6.添加小程序生成网页版的排班信息，方便用户直接在网页版上把内容直接复制进word进行打印，添加的项目为另外一个页面的项目，直接发行成h5以后。直接可以放在公网下。然后在config.js里面配置好路径就后了。访问不同的排班程序就打拼接不同的ID打开排班详情.  
7.添加的项目请一定要选择与小程序相同的云服务空间。但是不用上传任何云服务的JS代码!  
添加的项目请一定要选择与小程序相同的云服务空间。但是不用上传任何云服务的JS代码!  
添加的项目请一定要选择与小程序相同的云服务空间。但是不用上传任何云服务的JS代码!  
重要的事情说三遍!!!  
