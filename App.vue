<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			uni.login({
				success:(res)=>{
					uniCloud.callFunction({
						name:"user",
						data:{code:res.code}
					}).then((res2)=>{
						console.log(res2);
						uni.setStorageSync('userId',res2.result._id)
					});
				}
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
