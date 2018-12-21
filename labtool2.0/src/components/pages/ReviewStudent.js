import React, { Component } from 'react'
import { Button, Form, Input, Grid, Card, Loader, Icon } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { createOneWeek } from '../../services/week'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { clearNotifications } from '../../reducers/notificationReducer'
import { toggleCheck, resetChecklist } from '../../reducers/weekReviewReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import store from '../../store'

const CourseNameHeader = ({ name }) => <h2>{name}</h2>
CourseNameHeader.propTypes = {
  name: PropTypes.string
}

const StudentNameHeader = ({ name }) => <h3>{name}</h3>
StudentNameHeader.propTypes = {
  name: PropTypes.string
}

const TotalPoints = ({
  isFinalWeek,
  weekPoints,
  codeReviewPoints,
  ...otherProps
}) => {
  const title = isFinalWeek
    ? 'Points before final review'
    : 'Points from previous weeks'
  const pointsTotal = weekPoints + codeReviewPoints

  return (
    <div {...otherProps}>
      <h3>{`${title}: ${pointsTotal}`}</h3>
      Week points: {weekPoints} <br />
      Code review points: {codeReviewPoints}
    </div>
  )
}

TotalPoints.propTypes = {
  isFinalWeek: PropTypes.bool,
  weekPoints: PropTypes.number,
  codeReviewPoints: PropTypes.number
}

/**
 *  The page which is used by teacher to review submissions,.
 */
export class ReviewStudent extends Component {
  constructor(props) {
    super(props)
    this.reviewPointsRef = React.createRef()
    this.reviewTextRef = React.createRef()
  }

  componentWillMount = async () => {
    await this.props.resetLoading()
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
    this.props.clearNotifications()
  }

  componentWillUnmount() {
    this.props.resetChecklist()
  }

  handleSubmit = async e => {
    try {
      e.preventDefault()
      const content = {
        points: e.target.points.value,
        studentInstanceId: this.props.studentInstance,
        feedback: e.target.comment.value,
        weekNumber: this.props.weekNumber,
        checks: this.props.weekReview.checks
      }
      if (e.target.points.value < 0 || e.target.points.value > this.props.selectedInstance.weekMaxPoints) {
        store.dispatch({ type: 'WEEKS_CREATE_ONEFAILURE' })
      } else {
        this.props.addRedirectHook({
          hook: 'WEEKS_CREATE_ONE'
        })
        await this.props.createOneWeek(content)
      }
    } catch (error) {
      console.log(error)
    }
  }

  toggleCheckbox = (name, studentId, weekNbr) => async e => {
    this.props.toggleCheck(name, studentId, weekNbr)
  }

  copyChecklistOutput = async e => {
    e.preventDefault()
    this.reviewPointsRef.current.inputRef.value = Number(e.target.points.value).toFixed(2)
    /* The below line is as hacky as it is because functional elements cannot directly have refs.
    * This abomination somehow accesses a textarea that is a child of a div that holds the ref.
    */
    this.reviewTextRef.current.children[0].children.comment.value = e.target.text.value
  }

  render() {
    if (this.props.loading.loading) {
      return <Loader active />
    }
    if (this.props.loading.redirect) {
      return <Redirect to={`/labtool/courses/${this.props.selectedInstance.ohid}`} />
    }
    if (!Array.isArray(this.props.weekReview.data)) {
      return <Loader active />
    }

    //this.props.studentInstance is a string, therefore casting to number.
    const studentData = this.props.weekReview.data.filter(dataArray => dataArray.id === Number(this.props.studentInstance))
    //this.props.weekNumber is a string, therefore casting to number.
    const weekData = studentData[0].weeks.filter(theWeek => theWeek.weekNumber === Number(this.props.weekNumber))
    const checks = weekData[0] ? weekData[0].checks : {}
    const weekPoints = studentData[0].weeks
      .filter(week => week.weekNumber < this.props.weekNumber)
      .map(week => week.points)
      .reduce((a, b) => {
        return a + b
      }, 0)
    const codeReviewPoints = studentData[0].codeReviews.map(review => review.points).reduce((a, b) => {
      return a + b
    }, 0)
    const checkList = this.props.selectedInstance.checklists.find(checkl => checkl.week === Number(this.props.weekNumber))

    const isChecked = checkName => {
      return this.props.weekReview.checks[checkName] === undefined
        ? !!checks[checkName]
        : this.props.weekReview.checks[checkName]
    }

    const getPointsForCheck = row => {
      const points = isChecked(row.name)
        ? row.checkedPoints
        : row.uncheckedPoints
      return points || 0 // points may be undefined?
    }

    const sum = (a, b) => a + b

    const countChecksPoints = checks => {
      const points = checks.map(getPointsForCheck).reduce(sum, 0)
      if (points < 0) {
        return 0
      }
      // I honestly don't know if weekMaxPoints can be undefined
      // Let's keep the > for now because it's false if it really is undefined
      // If it turns out that it can't be undefined, replace this+above
      // with clamp(points, 0, this.props.selectedInstance.weekMaxPoints)
      if (points > this.props.selectedInstance.weekMaxPoints) {
        return this.props.selectedInstance.weekMaxPoints
      }

      return points
    }

    const generateChecksFeedbackText = checks =>
      checks
        .map(row => (isChecked(row.name) ? row.textWhenOn : row.textWhenOff))
        .filter(text => !!text) // don't include empty text
        .join('\n\n')

    let checklistOutput = ''
    let checklistPoints = 0

    if (checkList) {
      /* checkList.list is a dictionary where the key is the name of the
        * checklist and its value is the array of "checks".
        * e.g. {
        *   "Exercise 1": [],
        *   "Exercise 2": [],
        *   "Overall": []
        * }
        * --> pluck out and flatten the arrays of checks so we can count em
        */
      const allChecks = Object.values(checkList.list).flatMap(sublist =>
        Object.values(sublist)
      )
      checklistPoints = countChecksPoints(allChecks)
      checklistOutput = generateChecksFeedbackText(allChecks)
    }

    const isFinalWeek =
      Number(this.props.weekNumber, 10) >
      this.props.selectedInstance.weekAmount

    return (
      <div className="ReviewStudent" style={{ textAlign: 'center' }}>
        <CourseNameHeader name={this.props.selectedInstance.name} />
        <StudentNameHeader
          name={`${studentData[0].User.firsts} ${studentData[0].User.lastname}`}
        />
        {isFinalWeek ? (
          <h3>Final Review</h3>
        ) : (
          <h3>Viikko {this.props.weekNumber}</h3>
        )}
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column>
              <TotalPoints
                isFinalWeek={isFinalWeek}
                weekPoints={weekPoints}
                codeReviewPoints={codeReviewPoints}
                align="left"
              />
              {isFinalWeek ? <h2>Final Review Points</h2> : <h2>Feedback</h2>}
              <Form onSubmit={this.handleSubmit}>
                <Form.Group inline unstackable>
                  <Form.Field>
                    <label>Points 0-{this.props.selectedInstance.weekMaxPoints}</label>

                    <Input ref={this.reviewPointsRef} name="points" defaultValue={weekData[0] ? weekData[0].points : ''} type="number" step="0.01" style={{ width: '150px', align: 'center' }} />
                  </Form.Field>
                </Form.Group>
                <label> Feedback </label>
                <Form.Group inline unstackable style={{ textAlignVertical: 'top' }}>
                  <div ref={this.reviewTextRef}>
                    {/*Do not add anything else to this div. If you do, you'll break this.copyChecklistOutput.*/}
                    <Form.TextArea defaultValue={weekData[0] ? weekData[0].feedback : ''} name="comment" style={{ width: '500px', height: '250px' }} />
                  </div>
                </Form.Group>
                <Form.Field>
                  <Button className="ui center floated green button" type="submit">
                    Save
                  </Button>
                  <Link to={`/labtool/browsereviews/${this.props.selectedInstance.ohid}/${studentData[0].id}`} type="Cancel">
                    <Button className="ui center floated button" type="cancel">
                      Cancel
                    </Button>
                  </Link>
                </Form.Field>
              </Form>
            </Grid.Column>
            {checkList && checks !== undefined ? (
              <Grid.Column>
                <h2>Checklist</h2>
                {checkList ? (
                  <div className="checklist">
                    {Object.keys(checkList.list).map(cl => (
                      <Card className="checklistCard" fluid color="red" key={cl}>
                        <Card.Content header={cl} />
                        {checkList.list[cl].map(row => (
                          <Card.Content className="checklistCardRow" key={row.name}>
                            <Form.Field>
                              <Grid>
                                <Grid.Row>
                                  <Grid.Column width={3}>
                                    <Input
                                      type="checkbox"
                                      defaultChecked={checks[row.name] !== undefined ? checks[row.name] : false}
                                      onChange={this.toggleCheckbox(row.name, this.props.studentInstance, this.props.weekNumber)}
                                    />
                                  </Grid.Column>
                                  <Grid.Column width={10}>
                                    <span style={{ flexGrow: 1, textAlign: 'center' }}>{row.name}</span>
                                  </Grid.Column>
                                  <Grid.Column width={3}>
                                    <span>{`${row.checkedPoints} p / ${row.uncheckedPoints} p`}</span>
                                  </Grid.Column>
                                </Grid.Row>
                              </Grid>
                            </Form.Field>
                          </Card.Content>
                        ))}
                      </Card>
                    ))}
                    <div>
                      <Form className="checklistOutput" onSubmit={this.copyChecklistOutput}>
                        <Form.TextArea className="checklistOutputText" name="text" value={checklistOutput} style={{ width: '100%', height: '250px' }} />
                        <p className="checklistOutputPoints">points: {checklistPoints.toFixed(2)}</p>
                        <input type="hidden" name="points" value={checklistPoints} />
                        <Button type="submit">Copy to review fields</Button>
                      </Form>
                    </div>
                  </div>
                ) : (
                  <p>There is no checklist for this week.</p>
                )}
              </Grid.Column>
            ) : (
              <div />
            )}
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    selectedInstance: state.selectedInstance,
    notification: state.notification,
    weekReview: state.weekReview,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  createOneWeek,
  getOneCI,
  clearNotifications,
  toggleCheck,
  resetChecklist,
  coursePageInformation,
  resetLoading,
  addRedirectHook
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewStudent)
