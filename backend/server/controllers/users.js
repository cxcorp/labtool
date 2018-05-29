const User = require('../models').User
const jwt = require('jsonwebtoken')
const CourseInstance = require('../models').CourseInstance
const TeacherInstance = require('../models').TeacherInstance
const helper = require('../helpers/users_controller_helper')

module.exports = {
  /**
   *
   * @param req
   * @param res
   * @returns {*}
   */
  update(req, res) {
    helper.controller_before_auth_check_action(req, res)

    if (!req.body.email || req.body.email.length < 1) {
      const error = { error: 'Email was too short... Implementing valid email check can be done here' }
      res.status(400).send(error)
    } else {
      User.update({ email: req.body.email }, { where: { id: req.decoded.id } }).then(
        User.findById(req.decoded.id)
          .then(user => {
            const returnedUser = {
              email: req.body.email,
              firsts: user.firsts,
              lastname: user.lastname,
              studentNumber: user.studentNumber,
              username: user.username
            }
            res.status(201).send(returnedUser)
          })
          .catch(error => res.status(400).send(error))
      )
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<Array<Model>>}
   */
  async list(req, res) {
    helper.controller_before_auth_check_action(req, res)

    try {
      const users = await User.findAll()
      return res.status(200).send(users)
    } catch (exception) {
      return res.status(400).send(exception)
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<*|Promise<T>>}
   */
  async createTeacherInstance(req, res) {
    helper.controller_before_auth_check_action(req, res)

    const courseInstance = await CourseInstance.findOne({
      where: {
        ohid: req.body.ohid
      }
    })

    const user = await User.findOne({
      where: {
        username: req.body.adTunnus
      }
    })

    if (courseInstance !== null && user !== null) {
      return TeacherInstance.create({
        userId: user.id,
        courseInstanceId: courseInstance.id,
        admin: true
      })
        .then(teacher => res.status(200).send(teacher))
        .catch(error => res.status(400).send(error))
    } else {
      res.status(404).send('not found')
    }
  }
}
