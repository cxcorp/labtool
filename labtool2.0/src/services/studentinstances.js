import { callController } from '../util/apiConnection'
const baseUrl = process.env.REACT_APP_BACKEND_URL + '/api'


export const getAllStudentCourses = () => {
  const route = baseUrl + '/course/student'
  const prefix = 'STUDENT_COURSE_GET_ALL_'
  const method = 'get'
  return callController(route, prefix, null, method)
}


export default { getAllStudentCourses }
