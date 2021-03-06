import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { getOneCI } from '../../services/courseInstance'
import { coursePageInformation } from '../../services/courseInstance'
import { bulkinsertCodeReviews, removeOneCodeReview } from '../../services/codeReview'
import {
  filterStatesByTags,
  filterByReview,
  initOneReview,
  initOrRemoveRandom,
  initCheckbox,
  initAllCheckboxes,
  randomAssign,
  codeReviewReset,
  selectDropdown,
  toggleCreate,
  createStates
} from '../../reducers/codeReviewReducer'
import { filterByTag } from '../../reducers/coursePageLogicReducer'
import { clearNotifications, showNotification } from '../../reducers/notificationReducer'
import { Button, Table, Checkbox, Loader, Dropdown, Label, Popup, Modal, Icon } from 'semantic-ui-react'
import Notification from '../../components/pages/Notification'
import { resetLoading } from '../../reducers/loadingReducer'

import BackButton from '../BackButton'

export class ModifyCourseInstanceReview extends React.Component {
  state = {
    open: {}
  }
  componentWillMount() {
    this.props.resetLoading()
  }

  componentDidMount() {
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
  }

  componentWillUnmount() {
    this.props.codeReviewReset()
  }

  checkStates = () => {
    this.props.codeReviewLogic.statesCreated ? null : this.props.createStates(this.props.selectedInstance.amountOfCodeReviews)
  }

  handleSubmit = reviewNumber => async e => {
    try {
      e.preventDefault()
      let createTrue = false
      reviewNumber === 'create' ? this.props.toggleCreate() : undefined
      const codeReviews = this.props.codeReviewLogic.codeReviewStates[reviewNumber]
      const courseId = this.props.selectedInstance.id
      reviewNumber === 'create' ? ((reviewNumber = this.props.selectedInstance.amountOfCodeReviews + 1), (createTrue = true)) : reviewNumber

      const data = {
        codeReviews,
        reviewNumber,
        courseId,
        createTrue
      }

      await this.props.bulkinsertCodeReviews(data)
    } catch (error) {
      this.props.showNotification({ message: 'Select a code review!', error: true })
    }
  }

  addCodeReview = (reviewRound, id) => {
    return e => {
      const toReviewId = parseInt(e.target.value, 10)
      const crData = {
        round: reviewRound,
        reviewer: id,
        toReview: toReviewId
      }
      this.props.initOneReview(crData)
    }
  }

  initOrRemoveRandom = id => {
    return async () => {
      await this.props.initCheckbox(id)
      this.props.initOrRemoveRandom(id)
    }
  }

  selectAllCheckboxes = () => {
    return () => {
      let studentTags = []
      let allCheckboxes = {}
      let selectedTags = []
      let unassignedStudentsAsIds = []

      if (this.props.codeReviewLogic.filterActive) {
        unassignedStudentsAsIds = this.props.courseData.data.filter(student => this.isAssignedToReview(student, this.props.codeReviewLogic.selectedDropdown)).map(student => student.id)
      }

      this.props.coursePageLogic.filterByTag.forEach(st => selectedTags.push(st.name))

      if (selectedTags.length) {
        this.props.courseData.data.forEach(student => {
          studentTags = student.Tags.filter(st => selectedTags.includes(st.name))
          if (unassignedStudentsAsIds.length) {
            studentTags = studentTags.filter(st => unassignedStudentsAsIds.includes(st.StudentTag.studentInstanceId))
          }
          studentTags.length ? (allCheckboxes[student.id] = true) : null
          studentTags = []
        })
      } else if (unassignedStudentsAsIds.length) {
        unassignedStudentsAsIds.forEach(studentId => (allCheckboxes[studentId] = true))
      } else {
        this.props.courseData.data.forEach(student => (allCheckboxes[student.id] = true))
      }

      let randoms = Object.keys(allCheckboxes).map(student => parseInt(student, 10))
      this.props.initAllCheckboxes({ data: allCheckboxes, ids: randoms })
    }
  }

  clearAllCheckboxes = () => {
    return () => {
      this.props.initAllCheckboxes({ data: [], ids: [] })
    }
  }

  createDropdown = () => {
    return (e, data) => {
      this.checkStates()
      this.props.selectDropdown(data.value)
      if (this.props.filterActive) {
        this.props.filterByReview(this.props.selectDropdown(data.value))
      }
    }
  }

  toggleCreate = () => {
    this.checkStates()
    this.props.toggleCreate()
  }

  filterUnassigned = review => {
    return async () => {
      if (this.props.codeReviewLogic.filterByReview === review || this.props.codeReviewLogic.filterActive) {
        await this.props.filterByReview(0)
      } else {
        await this.props.filterByReview(review)
      }
    }
  }

  isAssignedToReview = (studentData, reviewWeek) => {
    const studentReviewWeeks = studentData.codeReviews.map(review => review.reviewNumber).filter(review => review === reviewWeek)
    return Array.isArray(studentReviewWeeks) && !studentReviewWeeks.length
  }

  addFilterTag = tag => {
    return async () => {
      await this.props.filterByTag(tag)
      this.props.filterStatesByTags({ tags: this.props.coursePageLogic.filterByTag, students: this.props.courseData.data })
    }
  }

  hasFilteringTags = (studentTagsData, filteringTags) => {
    let studentInstanceTagIds = studentTagsData.map(tag => tag.id)
    let filteringTagIds = filteringTags.map(tag => tag.id)
    for (let i = 0; i < filteringTagIds.length; i++) {
      if (!studentInstanceTagIds.includes(filteringTagIds[i])) {
        return false
      }
    }
    return true
  }

  assignRandomly = reviewNumber => {
    return () => {
      this.props.codeReviewLogic.randomizedCodeReview.length > 1
        ? this.props.randomAssign({ reviewNumber: reviewNumber })
        : this.props.showNotification({ message: 'Select at least two persons to randomize!', error: true })
    }
  }
  getCurrentReviewer = (codeReviewRound, id) => {
    let reviewer = this.props.courseData.data.find(studentId => studentId.id === id)
    let reviewInstance = reviewer.codeReviews.find(cd => cd.reviewNumber === codeReviewRound && cd.studentInstanceId === id)
    if (!reviewInstance) {
      return 'None'
    }
    let reviewee = this.props.dropdownUsers.find(dropDownStudent => dropDownStudent.value === reviewInstance.toReview)
    return reviewee.text
  }

  removeOne = id => {
    return () => {
      try {
        const user = this.props.courseData.data.find(u => u.id === id)
        const cr = user.codeReviews.find(cr => cr.reviewNumber === this.props.codeReviewLogic.selectedDropdown)
        if (cr.points) {
          this.props.showNotification({ message: `Can't delete a graded code review!`, error: true })
          this.toggleModal(id)
          return
        }
        this.props.removeOneCodeReview({ reviewer: cr.studentInstanceId, codeReviewRound: cr.reviewNumber })
        this.toggleModal(id)
      } catch (e) {
        console.log(e)
      }
    }
  }

  toggleModal = id => {
    let s = this.state.open
    !s[id] ? ((s[id] = true), this.setState({ open: s })) : ((s[id] = !s[id]), this.setState({ open: s }))
  }

  visibilityReminder = () =>
    this.props.selectedInstance.currentCodeReview && this.props.codeReviewLogic.selectedDropdown ? (
      this.props.selectedInstance.currentCodeReview.findIndex(cr => cr === this.props.codeReviewLogic.selectedDropdown) === -1 ? (
        <Popup
          trigger={<Icon name="eye" size="large" color="red" />}
          content={
            <span>
              <span>This code review is currently not visible to students. You can make it visible on the </span>
              <Link to={`/labtool/ModifyCourseInstancePage/${this.props.selectedInstance.ohid}`}>course editing page</Link>
              <span>.</span>
            </span>
          }
          hoverable
        />
      ) : null
    ) : null

  render() {
    if (this.props.loading.loading) {
      return <Loader active />
    }
    return (
      <div className="ModifyCourseInstanceCodeReviews" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <div className="ui grid">
          <BackButton preset="modifyCIPage" />
          <div className="sixteen wide column">
            <h2>{this.props.selectedInstance.name}</h2> <br />
          </div>
          <div>
            {this.props.codeReviewLogic.selectedDropdown === null ? (
              <Button
                disabled
                toggle
                compact
                className={`tiny ui button`}
                active={this.props.codeReviewLogic.filterActive}
                onClick={this.filterUnassigned(this.props.codeReviewLogic.selectedDropdown)}
              >
                Show unassigned students
              </Button>
            ) : (
              <Button toggle compact className={`tiny ui button`} active={this.props.codeReviewLogic.filterActive} onClick={this.filterUnassigned(this.props.codeReviewLogic.selectedDropdown)}>
                Show unassigned students
              </Button>
            )}
          </div>
          {this.props.coursePageLogic.filterByTag.length > 0 ? (
            <div>
              <span> Tag filters: </span>
              {this.props.coursePageLogic.filterByTag.map(tag => (
                <span key={tag.id}>
                  <Button compact className={`mini ui ${tag.color} button`} onClick={this.addFilterTag(tag)}>
                    {tag.name}
                  </Button>
                </span>
              ))}
            </div>
          ) : (
            <div>
              Tag filters: <Label>none</Label>
            </div>
          )}
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  {' '}
                  <Button compact size="mini" onClick={this.selectAllCheckboxes()}>
                    All
                  </Button>
                  <Button compact size="mini" onClick={this.clearAllCheckboxes()}>
                    None
                  </Button>
                </Table.HeaderCell>
                <Table.HeaderCell>Reviewer</Table.HeaderCell>
                <Table.HeaderCell>Project Info</Table.HeaderCell>
                <Table.HeaderCell key={1}>
                  <div style={{ display: 'flex' }}>
                    <this.visibilityReminder />
                    <Dropdown
                      onChange={this.createDropdown()}
                      defaultValue={this.props.codeReviewLogic.selectedDropdown}
                      noResultsMessage={'Try another search.'}
                      placeholder={Object.keys(this.props.dropdownCodeReviews).length > 0 ? 'Select code review' : 'No code reviews'}
                      fluid
                      options={this.props.dropdownCodeReviews}
                    />
                  </div>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {this.props.codeReviewLogic.showCreate ? (
                    <div>
                      Create new code review ( {this.props.selectedInstance.amountOfCodeReviews + 1} )
                      <Button size="tiny" style={{ float: 'right' }} onClick={() => this.toggleCreate()} compact>
                        Hide
                      </Button>
                    </div>
                  ) : (
                    <Button size="tiny" onClick={() => this.toggleCreate()} compact>
                      +
                    </Button>
                  )}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.props.courseData.data !== undefined
                ? this.props.courseData.data
                    .filter(data => {
                      return this.props.coursePageLogic.filterByTag.length === 0 || this.hasFilteringTags(data.Tags, this.props.coursePageLogic.filterByTag)
                    })
                    .filter(data => {
                      return this.props.codeReviewLogic.filterByReview === 0 || this.isAssignedToReview(data, this.props.codeReviewLogic.selectedDropdown)
                    })
                    .map(data => (
                      <Table.Row key={data.id}>
                        <Table.Cell>
                          {this.props.codeReviewLogic.checkBoxStates[data.id] === true ? (
                            <Checkbox checked onChange={this.initOrRemoveRandom(data.id)} />
                          ) : (
                            <Checkbox onChange={this.initOrRemoveRandom(data.id)} />
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {data.User.firsts} {data.User.lastname}
                        </Table.Cell>
                        <Table.Cell>
                          <p>
                            {data.projectName}
                            <br />
                            <a href={data.github} target="_blank" rel="noopener noreferrer">
                              {data.github}
                            </a>
                          </p>
                          {data.Tags.map(tag => (
                            <div key={tag.id}>
                              <Button compact floated="left" className={`mini ui ${tag.color} button`} onClick={this.addFilterTag(tag)}>
                                {tag.name}
                              </Button>
                            </div>
                          ))}
                        </Table.Cell>
                        <Table.Cell>
                          {this.props.codeReviewLogic.selectedDropdown ? (
                            <div>
                              <p>
                                Current review: {this.getCurrentReviewer(this.props.codeReviewLogic.selectedDropdown, data.id)}
                                {data.codeReviews.find(cr => cr.reviewNumber === this.props.codeReviewLogic.selectedDropdown) ? (
                                  !data.codeReviews.find(cr => cr.reviewNumber === this.props.codeReviewLogic.selectedDropdown).points ? (
                                    <Modal
                                      size="tiny"
                                      open={this.state.open[data.id]}
                                      onClose={() => this.toggleModal(data.id)}
                                      trigger={
                                        <Popup
                                          trigger={<Icon id="tag" onClick={() => this.toggleModal(data.id)} name="window close" size="large" color="red" style={{ float: 'right' }} />}
                                          content="Remove code review"
                                        />
                                      }
                                    >
                                      <Modal.Content image>
                                        <Modal.Description>
                                          <p>Do you wish to remove the following code review:</p>
                                          <p>
                                            {data.User.firsts} {data.User.lastname} reviewing {this.getCurrentReviewer(this.props.codeReviewLogic.selectedDropdown, data.id)}
                                          </p>
                                        </Modal.Description>
                                      </Modal.Content>
                                      <Modal.Actions>
                                        <Button negative icon="close" labelPosition="right" color="red" content="No" onClick={() => this.toggleModal(data.id)} />
                                        <Button positive icon="checkmark" labelPosition="right" content="Yes" onClick={this.removeOne(data.id)} />
                                      </Modal.Actions>
                                    </Modal>
                                  ) : (
                                    <Modal
                                      size="tiny"
                                      open={this.state.open[data.id]}
                                      onClose={() => this.toggleModal(data.id)}
                                      trigger={
                                        <Popup
                                          trigger={<Icon id="tag" onClick={() => this.toggleModal(data.id)} name="window close" size="large" color="red" style={{ float: 'right' }} />}
                                          content="Remove code review"
                                        />
                                      }
                                    >
                                      <Modal.Content image>
                                        <Modal.Description>
                                          <p>Can not remove a code review that is graded.</p>
                                          <p> Grade: {data.codeReviews.find(cr => cr.reviewNumber === this.props.codeReviewLogic.selectedDropdown).points} points</p>
                                        </Modal.Description>
                                      </Modal.Content>
                                      <Modal.Actions>
                                        <Button positive icon="checkmark" labelPosition="right" color="green" content="Ok" onClick={() => this.toggleModal(data.id)} />
                                      </Modal.Actions>
                                    </Modal>
                                  )
                                ) : null}
                              </p>
                              <select className="toReviewDropdown" onChange={this.addCodeReview(this.props.codeReviewLogic.selectedDropdown, data.id)}>
                                {this.props.dropdownUsers.map(
                                  d =>
                                    d.value !== data.id ? (
                                      this.props.codeReviewLogic.currentSelections[this.props.codeReviewLogic.selectedDropdown][data.id] == d.value ? (
                                        <option selected="selected" key={d.value} value={d.value}>
                                          {d.text}
                                        </option>
                                      ) : (
                                        <option key={d.value} value={d.value}>
                                          {d.text}
                                        </option>
                                      )
                                    ) : null
                                )}
                              </select>
                            </div>
                          ) : null}
                        </Table.Cell>
                        <Table.Cell>
                          {this.props.codeReviewLogic.showCreate ? (
                            <select className="toReviewDropdown" onChange={this.addCodeReview('create', data.id)}>
                              {this.props.dropdownUsers.map(
                                d =>
                                  d.value !== data.id ? (
                                    this.props.codeReviewLogic.currentSelections['create'][data.id] === d.value ? (
                                      <option selected="selected" key={d.value} value={d.value}>
                                        {d.text}
                                      </option>
                                    ) : (
                                      <option key={d.value} value={d.value}>
                                        {d.text}
                                      </option>
                                    )
                                  ) : null
                              )}
                              ))
                            </select>
                          ) : null}
                        </Table.Cell>
                      </Table.Row>
                    ))
                : null}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell>
                  <Button compact size="mini" onClick={this.selectAllCheckboxes()}>
                    All
                  </Button>
                  <Button compact size="mini" onClick={this.clearAllCheckboxes()}>
                    None
                  </Button>
                </Table.HeaderCell>
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell>
                  <Button compact onClick={this.assignRandomly(this.props.codeReviewLogic.selectedDropdown)} size="small" style={{ float: 'left' }}>
                    Assign selected randomly
                  </Button>
                  <Button compact size="small" style={{ float: 'right' }} onClick={this.handleSubmit(this.props.codeReviewLogic.selectedDropdown)}>
                    Save
                  </Button>
                </Table.HeaderCell>
                <Table.HeaderCell style={{ display: this.props.codeReviewLogic.showCreate ? '' : 'none' }}>
                  <Button compact onClick={this.assignRandomly('create')} size="small" style={{ float: 'left' }}>
                    Assign selected randomly
                  </Button>
                  <Button compact size="small" style={{ float: 'right' }} onClick={this.handleSubmit('create')}>
                    Create
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </div>
        <Notification />
      </div>
    )
  }
}

export const userHelper = data => {
  let users = []
  if (data) {
    users.push({
      value: null,
      text: 'Select student'
    })
    data.map(d =>
      users.push({
        value: d.id,
        text: d.User.firsts + ' ' + d.User.lastname
      })
    )
  }

  return users
}

const codeReviewHelper = data => {
  let codeReviews = []
  let i = 1
  while (i <= data) {
    codeReviews.push({
      value: i,
      text: `Code review ${i}`
    })
    i++
  }
  return codeReviews
}

const mapStateToProps = (state, ownProps) => {
  return {
    courseId: ownProps.courseId,
    courseData: state.coursePage,
    selectedInstance: state.selectedInstance,
    codeReviewLogic: state.codeReviewLogic,
    dropdownUsers: userHelper(state.coursePage.data),
    dropdownCodeReviews: codeReviewHelper(state.selectedInstance.amountOfCodeReviews),
    coursePageLogic: state.coursePageLogic,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  getOneCI,
  clearNotifications,
  coursePageInformation,
  initOneReview,
  initOrRemoveRandom,
  initCheckbox,
  initAllCheckboxes,
  bulkinsertCodeReviews,
  randomAssign,
  codeReviewReset,
  filterByTag,
  resetLoading,
  selectDropdown,
  toggleCreate,
  createStates,
  filterStatesByTags,
  filterByReview,
  showNotification,
  removeOneCodeReview
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModifyCourseInstanceReview)
