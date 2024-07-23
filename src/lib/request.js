import axios from 'axios'
import router from '@/router'

const ajax = axios.create({
  baseURL: '/',
  timeout: 6000,
  headers: {}
})

// Add a response interceptor
ajax.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // console.log('ajax error', error)
    if (error.response && error.response.data) {
      let data = error.response.data
      if (data.code != 0 && data.message == 'no login') {
        router.push({
          name: 'login'
        })
      }
    }
    return Promise.reject(error)
  }
)

export default ajax
