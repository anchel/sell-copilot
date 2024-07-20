import axios from 'axios'

const ajax = axios.create({
  baseURL: '/',
  timeout: 6000,
  headers: { 'X-Custom-Header': 'foobar' }
})

export default ajax
