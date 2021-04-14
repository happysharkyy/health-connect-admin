import axios from '../axios'

/* 
 * 用户管理模块
 */

// 保存
export const save = (data) => {
    return axios({
        url: '/post/save',
        method: 'post',
        data
    })
}
export const findByName = (data) => {
    return axios({
        url: '/post/getByUserName/'+data,
        method: 'get',
    })
}
// 删除
export const batchDelete = (data) => {
    return axios({
        url: '/post/delete',
        method: 'post',
        data
    })
}
// 分页查询
export const findPage = (data) => {
    return axios({
        url: '/post/findPage',
        method: 'post',
        data
    })
}
// 浏览
// 浏览
export function getTopic(id) {
    return axios({
      url: '/post/findById/'+id,
      method: 'get',
    })
}