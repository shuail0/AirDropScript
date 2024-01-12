/**
 * tasks200: 签到项目任务控制程序
 * 1. 遍历执行列表中的钱都任务
 * 2. 每个任务执行完毕后，随机休息0.1-0.2分钟
 * 3. 任务执行完毕后，切换账户
 * 注意： 
 *  - tasks201 首次执行只能先领取抽奖券，第二天再开始领奖励
 *  - task202 后面需要claim积分，需要时再开启，积分只能在BSC领取
 *  - task203 初次运行需要先mintPass，只做一次，所有地址跑完之后注释掉mint程序
 *  - task204 手动mintId后再开始跑程序
 * 
 * 
 */


const tasks = require('.');
const { sleep, getRandomFloat } = require('../base/utils');

// 执行函数
const executeTask = async (taskTag, params) => {
    // 转换taskTag为字符串形式
    const taskName = "task" + taskTag;
    // 检查任务是否存在
    if (typeof tasks[taskName] === "function") {
        await tasks[taskName](params);
    } else {
        console.log(`Task ${taskName} not found!`);
    }
};

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

module.exports = async (params) => {

    const taskList = [201, 202, 203, 204];
    const shuffleTaskList = shuffleArray(taskList)
    // 打印任务列表
    console.log('任务列表：', shuffleTaskList);

    // 遍历执行任务
    for (let i = 0; i < shuffleTaskList.length; i++) {
        const taskTag = shuffleTaskList[i];
        // 打印任务标签
        console.log('当前任务标签：', taskTag, '，开始执行任务');
        await executeTask(taskTag, params);
        // 随机休息
        const interval = getRandomFloat(0.1, 0.2);
        console.log(`任务完成，线程暂停${interval}分钟`);
        await sleep(interval);
    };
    console.log('任务已完成，切换新账户。')

};