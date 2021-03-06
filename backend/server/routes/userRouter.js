const userController = require('../controllers').users

module.exports = app => {
  app.get('/api/users', userController.list)
  app.put('/api/users/update', userController.update)
  app.post('/api/users/teacher/create', userController.createTeacher)
  app.post('/api/users/teacher/remove', userController.removeTeacher)
}
