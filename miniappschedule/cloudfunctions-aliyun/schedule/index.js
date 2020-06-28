'use strict';
const db = uniCloud.database();
const uniAccount = require('uni-account'); 
const {
  appId,
  secret,
  pcUrl
} = require('config')
const uniAccountIns = uniAccount.initWeixin({
				appId: appId,
				secret: secret
			});
const pcLink = pcUrl;
console.log(pcLink);
exports.main = async (event, context) => {
	const collection = db.collection('schedule');
	const dbCmd = db.command
	switch (event.method) {
		//通过ID删除
		case 'delete':
			var res = await collection.doc(event.id).remove();
			return res;
			break;
			//通过ID查询
		case 'get':
			var res = await collection.doc(event.id).get();
			res.pcUrl = pcLink;
			console.log(res)
			return res;
			//添加
		case 'add':
			delete event['method']
			var res = await collection.add(event);
			return res;
			break;
			//过滤违禁字
		case 'filter':
			var msgFilterString = event.filterString;
			console.log(msgFilterString);
			var tokenJson = await uniAccountIns.getAccessToken();
			var token = tokenJson.accessToken;
			var url = 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token='+token;
			const result = await uniCloud.httpclient.request(url, {
			    method: 'POST',
			    data: {
				  content:msgFilterString
			    },
				contentType:'json',
			    dataType: 'json'
			  })
			var res = {};
			console.log(result);
			if(result.data.errcode==0){
				res.msg = '班次内容通过合法校验'
				res.errcode = 0;
			}else{
				res.msg='内容含有违法违规内容,请重新修改';
				res.errcode = result.data.errcode;
			}
			return res;
			break;
			//默认查询
		default:
			// 获取排班总数
			var total = await collection.where({userId: event.userId}).count()
			// 获取排班列表
			var start = (event.pageNumber - 1) * event.pageSize;
			var res = await collection.where({userId: event.userId}).orderBy('_id', 'desc').skip(start).limit(event.pageSize).get();
			return [total, res];
			break;
	}
};
