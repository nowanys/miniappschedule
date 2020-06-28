<template>
	<view class="content">
		<view class="schedule-total">
			您一共有{{total}}条排班纪录,{{total==0?' 快点击下方+号开始排班吧!':''}}
		</view>
		<view class="schedule-item" v-for="(item,index) in schedules" :key="index" :data-id="item._id" @tap="scheduleDetailPage">
			<view class="schedule-title">
				开始排班时间:{{item.startDate}}
			</view>
			<view class="schedule-title">
				截止排班时间:{{item.endDate}}
			</view>
			<view class="schedule-time">
				<image class="schedule-del" src="/static/images/del-icon.png" @tap.stop="deleteschedule" :data-id="item._id"></image>
				<view>
					{{getDate(item.time)}}
				</view>
			</view>
		</view>
		<image class="add-icon" src="/static/images/add-icon.png" @tap="addSchedulePage"></image>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				schedules: [],
				userId:'',
				pageNumber:1,
				pageSize:5,
				total:0
			}
		},
		onLoad() {
			this.getUserId();
		},
		onShow() {
			if(uni.getStorageSync('refresh')){
				this.pageNumber = 1;
				this.loadSchedules(true);
				uni.setStorageSync('refresh',false);
			}
		},
		methods: {
			deleteschedule(e){
				uni.showModal({
					title: '删除'+(this.app?'笔记':'收支记录'),
					showCancel:true,
					content: '点击确定删除',
					success:  (res)=>{
						if (res.confirm) {
							uni.showLoading({
								mask:true
							})
							uniCloud.callFunction({
								name:"schedule",
								data:{
									id:e.currentTarget.dataset.id,
									method:'delete'
									}
							}).then((res)=>{
								this.loadSchedules(true);
								uni.hideLoading()
							});
						} else if (res.cancel) {
							
						}
					}
				});
			},
			scheduleDetailPage(e){
				uni.navigateTo({
					url:'/pages/schedule/schedule?id='+e.currentTarget.dataset.id
				})
			},
			getDate(str) {
				let dt = new Date(str)
				dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
				return dt.toISOString().slice(0, -5).replace(/[T]/g, ' ');
			},
			getUserId(){
				let userId = uni.getStorageSync('userId')
				if(userId){
					this.userId = userId;
					uni.hideLoading();
					this.loadSchedules()
				}else{
					setTimeout(()=>{
						this.getUserId();
					},1000)
				}
			},
			loadSchedules(refresh){
				if(refresh){
					this.pageNumber = 1;
				}else if(this.total != 0 && this.schedules.length >= this.total){
					return;
				}
				uniCloud.callFunction({
					name:"schedule",
					data:{
						pageNumber:this.pageNumber,
						pageSize:this.pageSize,
						userId:this.userId
						}
				}).then((res)=>{
					if(refresh||this.schedules.length==0){
						this.schedules = res.result[1].data;
					}else{
						this.schedules = this.schedules.concat(res.result[1].data);
					}
					this.total = res.result[0].total;
				});
			},
			addSchedulePage(){
				uni.navigateTo({
					url:'/pages/addSchedule/addSchedule'
				})
			},
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding-bottom: 30rpx;
		padding-top: 60rpx;
	}
	.schedule-item{
		width: 690rpx;
		height: 240rpx;
		display: flex;
		flex-flow: column nowrap;
		justify-content: flex-start;
		align-items: center;
		margin-top: 30rpx;
		border: 1px solid #DDDDDD;
		border-radius: 20rpx;
		box-shadow: 0 0 16rpx 0 rgba(115,114,114,.16);
	}
	.schedule-title{
		width: 650rpx;
		font-size: 32rpx;
		color: #333333;
		margin-top: 20rpx;
	}
	.schedule-content{
		width: 650rpx;
		font-size: 28rpx;
		color: #666666;
		height: 120rpx;
		text-align: justify;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
	}
	.schedule-time{
		font-size: 26rpx;
		width: 650rpx;
		color: #999999;
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-between;
		align-items: center;
		margin-top: 50rpx;
	}
	.add-icon{
		width: 100rpx;
		height: 100rpx;
		position: fixed;
		right:60rpx;
		bottom: 60rpx;
		background-color: #FFFFFF;
		border-radius: 50%;
		box-shadow: 0 0 16rpx 0 rgba(115,114,114,.16);
	}
	.schedule-total{
		position: fixed;
		top: 0;
		width: 720rpx;
		background: #FFFFFF;
		z-index: 100;
		height: 60rpx;
		line-height: 60rpx;
		padding-left: 30rpx;
		color: #0a93ee;
		box-shadow: 0 0 16rpx 0 rgba(115,114,114,.16);
		font-size: 28rpx;
	}
	.schedule-del{
		width: 40rpx;
		height: 40rpx;
	}
</style>
