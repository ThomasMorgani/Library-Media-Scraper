import axios from 'axios'

const isHttpError = statusCode => {
  const acceptedStatusCodes = [200, 304]
  return !acceptedStatusCodes.includes(statusCode)
}

export default {
  apiGet(url, controller = null, withCredentials = true) {
    return axios({
      // headers: { 'content-type': 'multipart/form-data' },
      // options: {
      signal: controller?.signal || null,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      // },
      method: 'GET',
      url,
      withCredentials,
    }).catch(error => {
      console.log('error from apiPost, run handle error method')
      console.log(error)
      //setup handle error method
      return { message: error.message, status: error.response.status }
    })
  },
  apiPost(url, postData, controller = null) {
    return axios({
      data: postData,
      // headers: { 'content-type': 'multipart/form-data' },
      // options: {
      signal: controller.signal || null,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      // },
      method: 'POST',
      url,
      withCredentials: true,
    }).catch(error => {
      console.log('error from apiPost, run handle error method')
      console.log(error)
      //setup handle error method
      return { error: error.message }
    })
  },

  axiosPostOptions() {
    axios.defaults.withCredentials = true
    var options = {
      mode: 'no-cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      credentials: 'include',
    }
    return options
  },
  axiosUploadOptions() {
    axios.defaults.withCredentials = true
    var options = {
      mode: 'no-cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
      credentials: 'include',
    }
    return options
  },
}
