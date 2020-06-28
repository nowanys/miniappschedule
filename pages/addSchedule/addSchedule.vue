<template>
	<view class="content">
		<view class="set-list-cover" v-if="!setList">
			<view class="set-list-container">
				<biner-input-tags @change="change" :selectlist='scheduleTypeList' placeholder='请输入自定义班次名称按回车或空格添加'></biner-input-tags>
				<view class="red-tips">
					班次一旦设置完毕,在当前页面不可更改,如果班次想重新设置,请重新进入此页面来设置,受手机版面所限,班次请用两个汉字长度.
				</view>
				<button type="primary" class="confirm-btn" @tap="confirmType">设置完毕</button>
			</view>
		</view>
		<picker mode="date" class="schedule-start-time" :value="date" :disabled="disable" :start="startDate" @change="bindStartDateChange">
			<view class="uni-input">{{date?date:'点击选择排班开始时间'}}</view>
		</picker>
		<picker mode="date" class="schedule-start-time" :value="dateEnd" :disabled="disable" :start="startDate" @change="bindEndDateChange">
			<view class="uni-input">{{dateEnd?dateEnd:'点击选择排班结束时间'}}</view>
		</picker>
		<view class="btn-box" v-if="date&&dateEnd">
			<button type="primary" class="add-btn" @tap="showPrompt">添加人员</button>
		</view>
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
					<view class="schedule-worker-box" v-for="(item,key) in persons" :key="key">
						<view class="schedule-worker-name">
							{{item}}
						</view>
						<template v-for="(day) in 7">
							<view class="schedule-worker-day" :key="day" v-if="index*7+day<=scheduleDates[item].length-1" @tap="chooseSchedule(item,index*7+day)"
							 :style="{background:backgroundColorJson[scheduleDates[item][index*7+day].scheduleStatue]}">
								{{scheduleDates[item][index*7+day].text?scheduleDates[item][index*7+day].text:''}}
							</view>
							<view v-else class="schedule-worker-day" style="background: rgba(0,0,0,0);" :key="day"></view>
						</template>
					</view>
				</template>
			</view>
		</view>
		<prompt :visible.sync="promptVisible" placeholder="请输入人员姓名" @confirm="clickPromptConfirm" mainColor="#0a93ee">
			<view class="tips">
				姓名最好不要超过三个字
			</view>
		</prompt>
		<view class="add-btn-fixed">
			<button type="primary" class="add-btn" @tap="addSchedule">提交</button>
		</view>
	</view>
</template>

<script>
	import Prompt from '@/components/zz-prompt/index.vue';
	import binerInputTags from '@/components/biner-input-tags/biner-input-tags'
	export default {
		data() {
			return {
				// 控制弹框输入框显示
				promptVisible: false,
				setList:false,
				scheduleTypeList : [{title:'主班'},{title:'夜班'} , {title:'值休'}, {title:'放假'}],
				list:[],
				disable: false,
				date: '',
				dateEnd: '',
				startDate: '',
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
				scheduleDates:{},
				days: 0,
				backgroundColorJson: {
					'-1': '#dddddd',
					'0': '',
					'1': '#F0AD4E'
				}
			}
		},
		components: {
			Prompt,
			binerInputTags
		},
		onLoad() {
			this.startDate = this.getDate(new Date().getTime());
		},
		methods: {
			confirmType(){
				this.list = [];
				for (var i = 0; i < this.scheduleTypeList.length; i++) {
					this.list.push(this.scheduleTypeList[i].title)
				}
				uniCloud.callFunction({
					name: "schedule",
					data: {
						filterString:this.list.join(','),
						method: 'filter'
					}
				}).then((res)=>{
					if(res.result.errcode == 0){
						this.setList  = true;
					}else{
						uni.showToast({
							title:res.result.msg,
							icon:'none',
							mask:true,
							duration:3000
						})
					}
				});
				
			},
			change(arr){
				this.scheduleTypeList = JSON.parse(JSON.stringify(arr));
			},
			addSchedule() {
				uniCloud.callFunction({
					name: "schedule",
					data: {
						userId: uni.getStorageSync('userId'),
						time: new Date().getTime(),
						startDate:this.date,
						endDate:this.dateEnd,
						schedules:this.scheduleDates,
						method: 'add'
					}
				}).then((res) => {
					if(res.result.id){
						uni.showToast({
							title:'添加成功',
							icon:'none',
							mask:true,
							duration:3000
						})
						uni.setStorageSync('refresh',true);
						setTimeout(()=>{
							uni.navigateBack({
								delta:1
							})
						},1500)
					}
				});
			},
			chooseSchedule(item,index) {
				if(this.scheduleDates[item][index].scheduleStatue == -1){
					return;
				}
				this.scheduleDates[item][index].scheduleStatue = 0;
				this.scheduleDates[item][index].text = '未排';
				uni.showActionSheet({
					itemList: this.list,
					itemColor: '#333333',
					success: (res) => {
						this.scheduleDates[item][index].scheduleStatue = 1;
						this.scheduleDates[item][index].text = this.list[res.tapIndex];
						console.log(this.scheduleDates[item][index])
						this.$forceUpdate();
					}
				})
			},
			showPrompt() {
				this.promptVisible = true;
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
			bindStartDateChange(e) {
				this.date = e.target.value;
				//选定日期后直接从选定日期向后一个月
			},
			bindEndDateChange(e) {
				
				if((new Date(e.target.value).getTime() - new Date(this.date).getTime()) / (1000 * 3600 * 24)<1){
					uni.showToast({
						title: '结束日期必须大于开始日期',
						icon: 'none',
						mask: true,
						duration: 3000
					})
					return;
				}
				this.dateEnd = e.target.value;
				this.initDates();
				for (var i = 0; i < this.dates.length; i++) {
					if (new Date(this.dates[i].date).getTime() < new Date(this.date).getTime()) {
						this.dates[i].scheduleStatue = -1;
						this.dates[i].text = '不排';
					} else {
						break;
					}
				}
				this.disable = true;
				//选定日期后直接从选定日期向后一个月
			},
			getDate(str) {
				let dt = new Date(str)
				dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
				return dt.toISOString().slice(0, -5).replace(/[T]/g, ' ');
			},
			clickPromptConfirm(val) {
				if (this.persons[val]) {
					uni.showToast({
						title: '当前姓名已存在!',
						icon: 'none',
						mask: true,
						duration: 3000
					})
					return;
				}
				if (val || val.trim()) {
					uniCloud.callFunction({
						name: "schedule",
						data: {
							filterString:val,
							method: 'filter'
						}
					}).then((res)=>{
						if(res.result.errcode == 0){
							this.persons[val] = val;
							this.scheduleDates[val] = JSON.parse(JSON.stringify(this.dates));
							this.promptVisible = false;
						}else{
							uni.showToast({
								title:res.result.msg,
								icon:'none',
								mask:true,
								duration:3000
							})
						}
					});
				} else {
					uni.showToast({
						title: '姓名不能为空',
						icon: 'none',
						mask: true,
						duration: 3000
					})
				}

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
		height: 96rpx;
		line-height: 96rpx;
		padding: 0 20rpx 0 20rpx;
		background-color: #0a93ee !important;
		font-size: 26rpx;
		width: 690rpx;
		font-size: 34rpx;
	}
	
	.confirm-btn{
		height: 96rpx;
		line-height: 96rpx;
		padding: 0 20rpx 0 20rpx;
		background-color: #0a93ee !important;
		font-size: 34rpx;
		width: 590rpx;
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
	
	.tips{
		color: #DD524D;
		font-size: 24rpx;
		height: 80rpx;
		line-height: 80rpx;
		width: 520rpx;
	}
	.set-list-cover{
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background-color: rgba(0,0,0,0.7);
		z-index: 1000;
		display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		align-items: center;
	}
	.set-list-container{
		min-height: 500rpx;
		width: 690rpx;
		background-color: #FFFFFF;
		border-radius: 10rpx;
		display: flex;
		flex-flow: column nowrap;
		justify-content: flex-start;
		align-items: center;
		padding-top: 20rpx;
		padding-bottom: 50rpx;
	}
	.red-tips{
		width: 650rpx;
		margin-top: 30rpx;
		margin-bottom: 30rpx;
		font-size: 24rpx;
		color: #DD524D;
		text-align: justify;
	}
</style>
