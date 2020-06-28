<template>
	<view class="content">
		<view class="uni-input">排班开始时间：{{date?date:''}}</view>
		<view class="uni-input">排班结束时间：{{dateEnd?dateEnd:''}}</view>
		<!-- <view class="btn-box" v-if="date&&dateEnd">
			<button type="primary" class="add-btn" @tap="showPrompt">添加人员</button>
		</view> -->
		<view v-if="date&&dateEnd&&days>0" class="schedule-box">
			<table class="schedule-content" v-for="(index) in (parseInt(days/7)+1)" :key="index">
				<template>
					<tr class="schedule-week-box">
						<td class="schedule-week-name">
							日期
						</td>
						<td class="schedule-week-day" v-for="(dayIndex) in 7" :key="dayIndex">
							{{dates[(index-1)*7+dayIndex-1].day}}
						</td>
					</tr>
					<tr class="schedule-week-box">
						<td class="schedule-week-name">
							星期
						</td>
						<td class="schedule-week-day" v-for="(day) in 7" :key="day">
							{{weekArray[day-1]}}
						</td>
					</tr>
					<tr class="schedule-worker-box" v-for="(item,key) in scheduleDates" :key="key">
						<td class="schedule-worker-name">
							{{key}}
						</td>
						<template v-for="(day) in 7">
							<td class="schedule-worker-day" :key="day" v-if="(index-1)*7+(day-1)<=scheduleDates[key].length-1">
								{{scheduleDates[key][(index-1)*7+(day-1)].text?scheduleDates[key][(index-1)*7+(day-1)].text:''}}
							</td>
							<td v-else class="schedule-worker-day" style="background: rgba(0,0,0,0);" :key="(day-1)"></td>
						</template>
					</tr>
				</template>
			</table>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 控制弹框输入框显示
				promptVisible: false,
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
				days: 0,
				backgroundColorJson: {
					'-1': '#dddddd',
					'0': '',
					'1': '#F0AD4E'
				},
				schedule:'',
				option:'',
				scheduleDates:{}
			}
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
			getSchedule(id) {
				uniCloud.callFunction({
					name:"schedule",
					data:{
						id:id,
						method:'get'
						}
				}).then((res)=>{
					this.schedule = res.result.data[0];
					console.log(this.schedule)
					this.date = this.schedule.startDate;
					
					this.scheduleDates = this.schedule.schedules;
					this.dateEnd = this.schedule.endDate;
					this.initDates();
					this.$forceUpdate();
					console.log(this)
				});
			},
			initDates() {
				var date = new Date(this.date);
				let day = date.getDay();
				day = (day == 0) ? 7 : day
				for (var i = 1; i < (day); i++) {

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
	page{
		user-select:all;
	}
	.uni-input{
		font-size: 26px;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding-bottom: 200px;
		padding-top: 60px;
	}

	.schedule-start-time {
		width: 680px;
		height: 60px;
		padding-left: 10px;
		line-height: 60px;
		border: 1px solid #DDDDDD;
		border-radius: 10px;
		color: #333333;
		font-size: 26px;
		margin-bottom: 30px;
	}

	.schedule-box {
		width: 550px;
		min-height: 100px;
		color: #666666;
		font-size: 26px;
	}

	.schedule-week-box {
		width: 550px;
		height: 50px;
		line-height: 50px;
		/* background-color: #0a93ee; */
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-between;
		align-items: center;
	}

	.schedule-week-day {
		color: #333333;
		width: 70px;
		height: 50px;
		line-height: 50px;
		font-size: 26px;
		text-align: center;
	}

	.schedule-week-name {
		color: #333333;
		width: 120px;
		height: 50px;
		line-height: 50px;
		font-size: 26px;
		text-align: center;
	}

	.schedule-content {
		min-height: 50px;
		width: 550px;
		display: flex;
		flex-flow: column nowrap;
		align-items: flex-start;
		justify-content: flex-start;
		margin-bottom: 30px;
		border: 1px solid #999999;
	}

	.btn-box {
		margin-top: 30px;
		margin-bottom: 30px;
		width: 550px;
		height: 100px;
		display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		align-items: center;
	}

	.add-btn {
		height: 60px;
		line-height: 60px;
		padding: 0 20px 0 20px;
		/* background-color: #0a93ee !important; */
		font-size: 26px;
	}

	.schedule-worker-box {
		width: 550px;
		height: 50px;
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: space-between;
		margin-top: 4px;
	}

	.schedule-worker-name {
		font-size: 26px;
		color: #333333;
		width: 120px;
		/* background: #F0AD4E; */
		height: 50px;
		line-height: 50px;
		text-align: center;
		border-radius: 6px;
		/* border: 1px solid #999999; */
	}

	.schedule-worker-day {
		border-radius: 6px;
		color: #333333;
		width: 70px;
		height: 50px;
		line-height: 50px;
		font-size: 26px;
		text-align: center;
		/* background: #DD524D; */

	}

</style>
