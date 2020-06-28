<template>
	<view class="content">
		<picker mode="date" class="schedule-start-time" :value="date" :disabled="disable" :start="startDate" @change="bindStartDateChange">
			<view class="uni-input">{{date?date:'点击选择排班开始时间'}}</view>
		</picker>
		<picker mode="date" class="schedule-start-time" :value="dateEnd" :disabled="disable" :start="startDate" @change="bindEndDateChange">
			<view class="uni-input">{{dateEnd?dateEnd:'点击选择排班结束时间'}}</view>
		</picker>
		<!-- <view class="btn-box" v-if="date&&dateEnd">
			<button type="primary" class="add-btn" @tap="showPrompt">添加人员</button>
		</view> -->
		<view v-if="date&&dateEnd" class="schedule-box">
			<view class="schedule-content" v-for="(index) in (days/7)+1" :key="index">
				<template v-if="dates[index*7].day">
					<view class="schedule-week-box">
						<view class="schedule-week-name">
							日期
						</view>
						<view class="schedule-week-day" v-for="(dayIndex) in 7" :key="dayIndex">
							{{dates[index*7+dayIndex].day?dates[index*7+dayIndex].day:''}}
						</view>
					</view>
					<view class="schedule-week-box">
						<view class="schedule-week-name">
							星期
						</view>
						<view class="schedule-week-day" v-for="(day) in 7" :key="day">
							{{dates[index*7+day].day?weekArray[day]:''}}
						</view>
					</view>
					<view class="schedule-worker-box" v-for="(item,key) in scheduleDates" :key="key">
						<view class="schedule-worker-name">
							{{key}}
						</view>
						<template v-for="(day) in 7">
							<view class="schedule-worker-day" :key="day" v-if="index*7+day<=scheduleDates[key].length-1" 
							 :style="{background:backgroundColorJson[scheduleDates[key][index*7+day].scheduleStatue]}">
								{{scheduleDates[key][index*7+day].text?scheduleDates[key][index*7+day].text:''}}
							</view>
							<view v-else class="schedule-worker-day" style="background: rgba(0,0,0,0);" :key="day"></view>
						</template>
					</view>
				</template>
			</view>
		</view>
		<uni-fab ref="fab" :pattern="pattern" :content="content" :horizontal="horizontal" :vertical="vertical" :direction="direction" @trigger="trigger" @fabClick="fabClick" />
		<view v-if="showPcLink" class="pc-link-cover">
			<view class="pc-link-box">
				<view class="pc-link-title">
					生成网页地址
				</view>
				<view class="pc-link-link">{{pcUrl+option.id}}</view>
				<view class="pc-link-tips">点击下方复制按钮复制链接，您可以在浏览器上打开链接以打印当前排班信息！</view>
				<view class="pc-link-btn" @tap="copyLink">复制</view>
			</view>
		</view>
	</view>
</template>

<script>
	import Prompt from '@/components/zz-prompt/index.vue';
	import uniFab from '@/components/uni-fab/uni-fab.vue';
	export default {
		data() {
			return {
				pcUrl:'',
				// 控制弹框输入框显示
				promptVisible: false,
				disable: false,
				date: '',
				dateEnd: '',
				startDate: '',
				showPcLink:false,
				weekArray: [
					'一',
					'二',
					'三',
					'四',
					'五',
					'六',
					'日'
				],
				dates: [],
				persons: {},
				days: 0,
				backgroundColorJson: {
					'-1': '#dddddd',
					'0': '',
					'1': '#F0AD4E'
				},
				schedule:'',
				option:'',
				scheduleDates:{},
				horizontal: 'right',
				vertical: 'bottom',
				direction: 'horizontal',
				pattern: {
					color: '#7A7E83',
					backgroundColor: '#fff',
					selectedColor: '#007AFF',
					buttonColor: '#007AFF'
				},
				content: [{
						iconPath: '/static/images/share-icon.png',
						selectedIconPath: '/static/images/share-icon.png',
						text: '分享',
						openType:'share',
						active: false
					},
					{
						iconPath: '/static/images/link-icon.png',
						selectedIconPath: '/static/images/link-icon.png',
						text: '网页',
						active: false
					}
				]
			}
		},
		components: {
			uniFab
		},
		onLoad(option) {
			this.option = option;
			this.getSchedule(this.option.id);
		},
		onShareAppMessage(res) {
		    if (res.from === 'button') {// 来自页面内分享按钮
		    }
		    return {
		      title: '雨时排班'+this.date+'至'+this.dateEnd,
		      url:'/pages/schedule/schedule?id='+this.option.id
		    }
		},
		methods: {
			copyLink(){
				uni.setClipboardData({
				    data: this.pcUrl+this.option.id,
				    success: ()=> {
						this.showPcLink = false;
				        uni.showToast({
				        	title: '复制成功，请在浏览器打开!',
				        	icon: 'none',
				        	mask: true,
				        	duration: 3000
				        })
				    }
				});
			},
			trigger(e) {
				if(e.index == 1){
					this.showPcLink = true;
				}
				if(this.$refs.fab.isShow){
					this.$refs.fab.isShow = false;
				}
			},
			fabClick() {
			},
			getSchedule(id) {
				uniCloud.callFunction({
					name:"schedule",
					data:{
						id:id,
						method:'get'
						}
				}).then((res)=>{
					this.schedule = res.result.data[0];
					this.date = this.schedule.startDate;
					this.dateEnd = this.schedule.endDate;
					this.initDates();
					this.scheduleDates = this.schedule.schedules;
					this.$forceUpdate();
					this.disable = true;
					console.log(res)
					this.pcUrl=res.result.pcUrl;
					
				});
			},
			initDates() {
				var date = new Date(this.date);
				let day = date.getDay();
				day = (day == 0) ? 7 : day
				for (var i = 0; i < (day - 1); i++) {

					this.dates.push({
						date: this.getDate(date.getTime() - 1000 * 3600 * 24 * (7 - i - 1)).substring(0, 10),
						scheduleStatue: -1,
						text: '不排',
						day: new Date(date.getTime() - 1000 * 3600 * 24 * (7 - i - 1)).getDate()
					})
				}
				this.days = 1 + (new Date(this.dateEnd).getTime() - new Date(this.date).getTime()) / (1000 * 3600 * 24);
				for (var i = 0; i < this.days; i++) {
					this.dates.push({
						date: this.getDate(date.getTime() + 1000 * 3600 * 24 * i).substring(0, 10),
						scheduleStatue: 0,
						text: '未排',
						day: new Date(date.getTime() + 1000 * 3600 * 24 * i).getDate()
					})
				}
			},
			getDate(str) {
				let dt = new Date(str)
				dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
				return dt.toISOString().slice(0, -5).replace(/[T]/g, ' ');
			}

		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding-bottom: 200rpx;
		padding-top: 60rpx;
	}

	.schedule-start-time {
		width: 680rpx;
		height: 60rpx;
		padding-left: 10rpx;
		line-height: 60rpx;
		border: 1px solid #DDDDDD;
		border-radius: 10rpx;
		color: #333333;
		font-size: 26rpx;
		margin-bottom: 30rpx;
	}

	.schedule-box {
		width: 690rpx;
		min-height: 100rpx;
		color: #666666;
		font-size: 26rpx;
	}

	.schedule-week-box {
		width: 690rpx;
		height: 50rpx;
		line-height: 50rpx;
		background-color: #0a93ee;
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-between;
		align-items: center;
	}

	.schedule-week-day {
		color: #FFFFFF;
		width: 70rpx;
		height: 50rpx;
		line-height: 50rpx;
		font-size: 26rpx;
		text-align: center;
	}

	.schedule-week-name {
		color: #FFFFFF;
		width: 120rpx;
		height: 50rpx;
		line-height: 50rpx;
		font-size: 26rpx;
		text-align: center;
	}

	.schedule-content {
		min-height: 50rpx;
		width: 690rpx;
		display: flex;
		flex-flow: column nowrap;
		align-items: flex-start;
		justify-content: flex-start;
		margin-bottom: 30rpx;
	}

	.btn-box {
		margin-top: 30rpx;
		margin-bottom: 30rpx;
		width: 690rpx;
		height: 100rpx;
		display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		align-items: center;
	}

	.add-btn {
		height: 60rpx;
		line-height: 60rpx;
		padding: 0 20rpx 0 20rpx;
		background-color: #0a93ee !important;
		font-size: 26rpx;
	}

	.schedule-worker-box {
		width: 690rpx;
		height: 50rpx;
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: space-between;
		margin-top: 4rpx;
	}

	.schedule-worker-name {
		font-size: 26rpx;
		color: #EEEEEE;
		width: 120rpx;
		background: #F0AD4E;
		height: 50rpx;
		line-height: 50rpx;
		text-align: center;
		border-radius: 6rpx;
	}

	.schedule-worker-day {
		border-radius: 6rpx;
		color: #FFFFFF;
		width: 70rpx;
		height: 50rpx;
		line-height: 50rpx;
		font-size: 26rpx;
		text-align: center;
		background: #DD524D;

	}

	.add-btn-fixed {
		position: fixed;
		bottom: 0rpx;
		width: 750rpx;
		height: 150rpx;
		background-color: #FFFFFF;
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: center;
		z-index: 100;
		margin-top: 30rpx;
		box-shadow: 0 0 16rpx 0 rgba(115, 114, 114, .16);
	}

	.add-btn {
		background-color: #0a93ee !important;
		width: 690rpx;
	}
	
	.pc-link-cover{
		position: fixed;
		z-index: 10000;
		bottom: 0;
		left: 0;
		top: 0;
		right: 0;
		background-color: rgba(0,0,0,0.8);
		display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		align-items: center;
	}
	.pc-link-box{
		height: auto;
		width: 690rpx;
		background-color: #FFFFFF;
		border-radius: 20rpx;
		display: flex;
		flex-flow: column nowrap;
		align-items: center;
		justify-content: flex-start;
		overflow: hidden;
	}
	.pc-link-title{
		height: 100rpx;
		font-size: 36rpx;
		color: #007AFF;
		line-height: 100rpx;
		width: 690rpx;
		border-bottom: 1px solid #DDDDDD;
		text-align: center;
		font-weight: bold;
	}
	.pc-link-link{
		width: 630rpx;
		height: auto;
		font-size: 28rpx;
		color: #333333;
		margin-top: 30rpx;
	}
	.pc-link-tips{
		width: 630rpx;
		height: auto;
		font-size: 24rpx;
		color: #999999;
		margin-top: 30rpx;
	}
	.pc-link-btn{
		height: 100rpx;
		width: 690rpx;
		color: #FFFFFF;
		background: #007AFF;
		font-size: 36rpx;
		line-height: 100rpx;
		text-align: center;
		margin-top: 30rpx;
	}
</style>
