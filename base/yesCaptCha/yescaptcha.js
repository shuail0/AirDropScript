const axios = require('axios');
const { sleep } = require('../utils');

const clientKey = '0b6bc1b679de0e3c2d2774e3dbe18ec41b97058421535';

// 第一步创建验证码任务

async function createTask(websiteUrl, websiteKey, taskType, pageAction) {
    const url = 'https://api.yescaptcha.com/createTask';
    const params = {
        "clientKey": clientKey,
        "task": {
            "websiteURL": websiteUrl,
            "websiteKey": websiteKey,
            "pageAction": pageAction, // 非必填
            "type": taskType
        },
        "softID": '0b6bc1b679de0e3c2d2774e3dbe18ec41b97058421535'
    }
    const response = await axios.post(url, params);
    return response.data;
}

// 获取验证码结果
async function getTaskResult(taskId) {
    const url = 'https://api.yescaptcha.com/getTaskResult';
    const params = {
        clientKey: clientKey,
        taskId: taskId
    }

    const response = await axios.post(url, params);
        await sleep(0.2);
        if (response.data.status === 'ready') {
            return response.data;

        } else if (response.data.status === 'processing') {
            await getTaskResult(taskId);
        }
}


module.exports = { createTask, getTaskResult };