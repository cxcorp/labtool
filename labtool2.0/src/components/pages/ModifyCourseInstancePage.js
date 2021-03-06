import React, { Component } from 'react'
import { Form, Input, Button, Grid, Dropdown, Checkbox, Loader, Popup } from 'semantic-ui-react'
import { getOneCI, modifyOneCI } from '../../services/courseInstance'
import { setFinalReview } from '../../reducers/selectedInstanceReducer'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import { clearNotifications } from '../../reducers/notificationReducer'
import { changeCourseField } from '../../reducers/selectedInstanceReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'

import BackButton from '../BackButton'

/**
 *  Page used to modify a courseinstances information. Can only be accessed by teachers.
 */
export class ModifyCourseInstancePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toRemoveCr: [],
      toAddCr: []
    }
  }

  componentWillMount = async () => {
    await this.props.resetLoading()
    this.props.clearNotifications()
    this.props.getOneCI(this.props.courseId)
  }

  changeField = async e => {
    this.props.changeCourseField({
      field: e.target.name,
      value: e.target.value
    })
  }

  handleChange = async e => {
    this.props.changeCourseField({
      field: 'active',
      value: !this.props.selectedInstance.active
    })
  }

  changeFinalReview = () => {
    const newValue = !this.props.selectedInstance.finalReview
    this.props.setFinalReview(newValue)
  }

  handleRemoveChange = (e, { value }) => {
    e.preventDefault()
    this.setState({ toRemoveCr: this.state.toRemoveCr.includes(value) ? this.state.toRemoveCr.filter(cr => cr !== value) : [...this.state.toRemoveCr, value] })
  }

  handleAddChange = (e, { value }) => {
    e.preventDefault()
    this.setState({ toAddCr: value })
  }

  handleSubmit = async e => {
    try {
      e.preventDefault()

      let newCr = this.props.selectedInstance.currentCodeReview.filter(cr => !this.state.toRemoveCr.includes(cr))
      newCr = newCr.concat(this.state.toAddCr)
      const { weekAmount, weekMaxPoints, currentWeek, active, ohid } = this.props.selectedInstance
      const content = {
        weekAmount,
        weekMaxPoints,
        currentWeek,
        active,
        ohid,
        finalReview: this.props.selectedInstance.finalReview,
        newCr
      }
      this.props.addRedirectHook({
        hook: 'CI_MODIFY_ONE_'
      })
      this.props.modifyOneCI(content, this.props.selectedInstance.ohid)
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    if (this.props.redirect && this.props.redirect.redirect) {
      return <Redirect to={`/labtool/courses/${this.props.selectedInstance.ohid}`} />
    }
    const selectedInstance = { ...this.props.selectedInstance }
    return (
      <div>
        <BackButton preset="coursePage" />
        <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <Loader active={this.props.loading.loading} inline="centered" />
          <Grid>
            <Grid.Row centered>
              <h2> Edit course: {selectedInstance.name} </h2>
            </Grid.Row>
          </Grid>
          <Grid>
            <Grid.Row centered>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group inline>
                  <label style={{ width: '125px', textAlign: 'left' }}>Week amount</label>
                  <Input name="weekAmount" required="true" type="text" style={{ maxWidth: '7em' }} value={selectedInstance.weekAmount} className="form-control1" onChange={this.changeField} />
                </Form.Group>

                <Form.Group inline>
                  <label style={{ width: '125px', textAlign: 'left' }}>Weekly maxpoints</label>
                  <Input name="weekMaxPoints" required="true" type="text" style={{ maxWidth: '7em' }} value={selectedInstance.weekMaxPoints} className="form-control2" onChange={this.changeField} />
                </Form.Group>

                <Form.Group inline>
                  <label style={{ width: '125px', textAlign: 'left' }}>Current week</label>
                  <Input name="currentWeek" required="true" type="text" style={{ maxWidth: '7em' }} value={selectedInstance.currentWeek} className="form-control3" onChange={this.changeField} />
                </Form.Group>

                <Form.Group inline>
                  <label style={{ width: '125px', textAlign: 'left' }}>Currently visible code reviews</label>
                  {this.props.selectedInstance.currentCodeReview
                    ? this.props.selectedInstance.currentCodeReview
                        .sort((a, b) => {
                          return a - b
                        })
                        .map(
                          cr =>
                            this.state.toRemoveCr.includes(cr) ? (
                              <Popup
                                key={cr}
                                trigger={
                                  <Button color="red" value={cr} onClick={this.handleRemoveChange} compact>
                                    {cr}
                                  </Button>
                                }
                                content={'This code review will be hidden on save'}
                              />
                            ) : (
                              <Popup
                                key={cr}
                                trigger={
                                  <Button value={cr} onClick={this.handleRemoveChange} compact>
                                    {cr}
                                  </Button>
                                }
                                content={'Click to hide this code review on save'}
                              />
                            )
                        )
                    : null}
                </Form.Group>
                <Form.Group inline>
                  <Dropdown
                    onChange={this.handleAddChange}
                    options={this.props.codeReviewDropdowns}
                    fluid
                    selection
                    multiple={true}
                    placeholder={this.props.selectedInstance.amountOfCodeReviews > 0 ? 'Select code reviews to set visible' : 'No code reviews'}
                  />
                </Form.Group>

                <Form.Group inline>
                  <Checkbox
                    name="finalReview"
                    checked={this.props.selectedInstance.finalReview}
                    onChange={this.changeFinalReview}
                    label="Course has a final review"
                    style={{ width: '150px', textAlign: 'left' }}
                  />
                </Form.Group>

                <Form.Group inline>
                  <Checkbox name="courseActive" label="Activate course" checked={selectedInstance.active} onChange={this.handleChange} style={{ width: '150px', textAlign: 'left' }} />
                </Form.Group>

                <Form.Group>
                  <Button type="Submit" floated="left" color="green" size="huge">
                    Save
                  </Button>

                  <Link to="/labtool/courses">
                    <Button type="Cancel" floated="right" color="red" size="huge">
                      Cancel
                    </Button>
                  </Link>
                </Form.Group>
              </Form>
            </Grid.Row>
          </Grid>

          <Link to={`/labtool/ModifyCourseInstanceStaff/${this.props.selectedInstance.ohid}`}>
            <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
              Manage assistant teachers
            </Button>
          </Link>
          <Link to={`/labtool/ModifyCourseInstanceCodeReviews/${this.props.selectedInstance.ohid}`}>
            <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
              Edit code reviews
            </Button>
          </Link>
          <Link to={`/labtool/checklist/${this.props.selectedInstance.ohid}/create`}>
            <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
              Edit checklists
            </Button>
          </Link>
          <Link to={`/labtool/managetags`}>
            <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
              Edit tags
            </Button>
          </Link>
        </div>
      </div>
    )
  }
}

const createDropdownCodereviews = (amount, current) => {
  let ddCr = []
  let i = 1
  if (amount && current) {
    while (i <= amount) {
      if (!current.includes(i)) {
        ddCr.push({
          value: i,
          text: `Codereview ${i}`
        })
      }
      i++
    }
  }
  return ddCr
}

const mapStateToProps = (state, ownProps) => {
  return {
    selectedInstance: state.selectedInstance,
    notification: state.notification,
    ownProps,
    codeReviewDropdowns: createDropdownCodereviews(state.selectedInstance.amountOfCodeReviews, state.selectedInstance.currentCodeReview),
    loading: state.loading,
    redirect: state.redirect
  }
}

const mapDispatchToProps = {
  getOneCI,
  modifyOneCI,
  clearNotifications,
  changeCourseField,
  resetLoading,
  addRedirectHook,
  setFinalReview
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModifyCourseInstancePage)
