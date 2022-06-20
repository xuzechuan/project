账户相关：
post /account/register
{name,password,avatar,email}

{
  id: 'owijefoiwjefoijweoifowfejio',
  name: 'damiao',
  avatar: 'url',
  phone: 'xoiwjfe'
}

post /account/login
{name,password}

获取当前登陆用户
get /account/current-user

get /account/logout


GET /vote
返回当前登陆用户创建的所有投票





POST /vote
{
  title: string
  desc: string
  deadline: timestring
  anonymous: true/false
  multiple: true/false
  options: ['苹果', '樱桃',]
}
用当前登陆身份创建投票




GET /vote/:voteId
获取某个投票的信息
返回：
{
  code: 0,
  result: {
    vote 投票信息
    options 选项信息
    userVotes 已投票数信息
  }
}



DELETE /vote/:voteId
删除当前用户创建的投票
返回：
{
  code: -1,
  msg: 'xxx',
}


实名投票与匿名投票交互是不一样的：

实名投票点一下就投了
匿名投票是选好了一下投，并且投好不能改了

POST /vote/51
向该问题的选项投票
问题过期则不能投票
请求体：
{
  optionIds: [5, 8, 9] // 选项的id
}
单选：
匿名不可修改
实名可切换

多选：
实名实时切换
匿名不可修改





实时投票状态接口
ws /realtime-voteinfo/:id
连接此websocket接口，可以实时收到此投票的更新信息
只在投票还未截止时可用，截止后连接会断开






数据库：

用户表
  id
  用户名
  密码
  电子邮箱
  头像

投票表
  id
  标题
  描述
  截止时间
  是否匿名
  创建人
  选项：（无法放入投票表里，因为系统记录了每个用户对每个选项的投票）

选项表：
  id
  选项内容
  所属投票

用户跟选项之间是【多对多关系】：
  一个用户可以投多个选项
  一个选项也可以被多个用户投票

多对多关系一般需要额外创建一张表

UserOption
  关系id
  用户id
  选项id
  投票id（方便从数据库查询出一个投票的所选项投递信息）

CREATE TABLE users (
  userId integer primary key autoincrement,
  name text not null unique,
  password text not null,
  email text unique,
  avatar text default 'avatar.png'
);
CREATE TABLE votes (
  voteId integer primary key autoincrement,
  userId integer not null,
  title text not null,
  desc text,
  deadline text not null,
  anonymous number not null,
  multiple number not null
);
CREATE TABLE options (
  optionId integer primary key autoincrement,
  voteId integer not null,
  content text not null
);
CREATE TABLE voteOptions (
  voteOptionId integer primary key autoincrement,
  userId integer not null,
  voteId integer not null,
  optionId integer not null
);





没有 websocket的时候，就是使用长轮询来实现准实时通信
long polling 长轮询
原理是，客户端发一个请求，服务端如果没有数据要发送给客户端，则暂时不响应该请求
一旦有数据要发送，则立刻响应该请求
如果超时还未有数据要发送，则发送空响应，客户端收到空响应后立刻再发一个请求
