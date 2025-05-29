// api.ts
import { request } from '/@/utils/service';
import {PageQuery, AddReq, DelReq, EditReq, InfoReq} from '@fast-crud/fast-crud';
// import axios from 'axios';
import axios, { AxiosResponse, AxiosError } from 'axios';
export const apiPrefix = '/api/system/sales/';
// -----------------------




export function GetList(query: PageQuery) {
    console.log("--------**********-------");
    console.log(query);
    console.log(apiPrefix);
    return request({
        url: apiPrefix,
        method: 'get',
        params: query,
    });
}

export function GetObj(id: InfoReq) {
    return request({
        url: apiPrefix + id + '/',
        method: 'get',
    });
}

/**
 * 获取自己接收的消息
 * @param query
 * @returns {*}
 * @constructor
 */
export function GetSelfReceive (query:PageQuery) {
    return request({
        url: apiPrefix + 'get_self_receive/',
        method: 'get',
        params: query
    })
}

export function AddObj(obj: AddReq) {
    return request({
        url: apiPrefix,
        method: 'post',
        data: obj,
    });
}




export function UpdateObj(obj: EditReq) {
    return request({
        url: apiPrefix + obj.id + '/',
        method: 'put',
        data: obj,
    });
}

export function DelObj(id: DelReq) {
    return request({
        url: apiPrefix + id + '/',
        method: 'delete',
        data: {id},
    });
}


///下面屏蔽
// export const fetchExternalData = async () => {
//     try {
//       const response = await axios.get("http://172.16.158.15:8090/wbService/wbDept/1/ ");
//       console.log("下面是数据。。。");
//       console.log(response.data);
//       return response.data; // 返回获取到的数据
      
//     } catch (error) {
//       console.error("获取外部数据失败:", error);
//       throw error; // 抛出错误，供调用方处理
//     }
//   };

///下面是方法：
// export const fetchExternalData = async () => {
//     try {
//         // 修改为触发 Celery 任务的后端 API
//         // const response = await axios.post('/api/dvadmin_celery/export_data/');
//         const response = await axios.post('http://172.16.158.15:8000/api/dvadmin_celery/export_data/');
//         console.log("任务已触发，返回的任务 ID：");
//         console.log(response.data);
//         return response.data; // 返回获取到的任务 ID
//     } catch (error) {
//         console.error("触发任务失败:", error);
//         throw error; // 抛出错误，供调用方处理
//     }
// };

export async function fetchExternalData(queryParams: Record<string, any>): Promise<string> {
    const url = '/api/dvadmin_celery/export_data/'; // 后端 API 的相对路径
    try {
        console.log("----------fetchExternalData: 发起请求--------------");
        console.log("请求参数:", queryParams);

        const response = await request({
            url: url,
            method: 'post',
            data: queryParams, // 传递查询参数
        });

        console.log("----------fetchExternalData: 请求成功--------------");
        console.log("响应数据:", response);
        if (!response || typeof response !== 'object' || !response.taskId) {
            throw new Error('API 返回数据为空或格式不正确');
        }
        return response.taskId; // 返回任务 ID
    } catch (error: unknown) { // 使用 unknown 类型捕获错误
        console.error("----------fetchExternalData: 请求失败--------------");
        if (error instanceof AxiosError) { // 检查是否为 AxiosError
            console.error("触发任务失败:", error.message);
        } else {
            console.error("未知错误:", error);
        }
        throw error; // 抛出错误，供调用方处理
    }
}