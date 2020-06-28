'use strict';
const uniAccount = require('uni-account')
const {
  appId,
  secret
} = require('config')
const uniAccountIns = uniAccount.initWeixin({
				appId: appId,
				secret: secret
			});
const db = uniCloud.database();
exports.main = async (event, context) => {
	//event为客户端上传的参数
	const wxuser = await uniAccountIns.code2Session(event.code);
	const collection = db.collection('user');
	const myuser = await collection.where({
		openid: wxuser.openid
	}).get();
	if (myuser.affectedDocs > 0) {
		return myuser.data[0];
	} else {
		var res = await collection.add({
			openid: wxuser.openid
		});
		return res;
	}

};
