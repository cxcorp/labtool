import courseInstanceService from '../services/courseInstance'

const courseInstancereducer = (store = [], action) => {
  switch (action.type) {
    case 'TEACHER_COURSE_GET_ALL_':
      return action.response
    default:
      return store
  }
}

export default courseInstancereducer