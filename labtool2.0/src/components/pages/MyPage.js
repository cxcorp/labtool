import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Header, Table, Container, Icon, Segment, Divider, Popup } from 'semantic-ui-react'
import './MyPage.css'
import { Link } from 'react-router-dom'
import { getAllStudentCourses } from '../../services/studentinstances'
import { getAllTeacherCourses } from '../../services/teacherinstances'

/**
 * The main page that is shown after user has logged in.
 */

export class MyPage extends Component {
  componentWillMount() {
    this.props.getAllStudentCourses()
    this.props.getAllTeacherCourses()
  }

  render() {
    const user = { ...this.props.user.user }
    return (
      <div className="MyPage">
        <Segment padded>
          <Container>
            <Header as="h2">
              {user.lastname}, {user.firsts}
            </Header>

            <Table singleLine color="blue" textAlign="left" style={{ color: 'grey' }}>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    <Icon name="user" size="big" style={{ marginRight: 20 }} />
                    <em style={{ color: 'grey' }}>{user.username} </em>
                    <br />
                  </Table.Cell>
                  <Table.Cell />
                </Table.Row>

                <Table.Row>
                  <Table.Cell>
                    <Icon name="id card outline" size="big" style={{ marginRight: 20 }} />
                    {user.studentNumber}
                    <br />
                  </Table.Cell>
                  <Table.Cell />
                </Table.Row>

                <Table.Row>
                  <Table.Cell>
                    <Icon name="mail" size="big" style={{ marginRight: 20 }} tooltip="Add users to your feed" />
                    {user.email}
                    <br />
                  </Table.Cell>
                  <Table.Cell textAlign="right" verticalAlign="bottom">
                    <Link to="/labtool/email">
                      <Popup trigger={<Button circular size="tiny" icon={{ name: 'edit', size: 'large', color: 'blue' }} />} content="Edit email address" />
                    </Link>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Container>
        </Segment>

        <br />
        <br />
        <br />
        <br />

        <Segment padded>
          <Container>
            <Header as="h2" className="CoursesHeader">
              My Courses (Student){' '}
            </Header>

            <Table singleLine key="grey" color="yellow">
              <Table.Body>
                {this.props.studentInstance.map(sinstance => (
                  <Table.Row key={sinstance.id}>
                    <Table.Cell>
                      <Link to={`/labtool/courses/${sinstance.ohid}`}>{sinstance.name}</Link>
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <Link to={`/labtool/courses/${sinstance.ohid}`}>
                        <Popup trigger={<Button circular size="tiny" icon={{ name: 'eye', size: 'large', color: 'blue' }} />} content="View course" />
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            <div>
              <br />
              <Divider horizontal />

              <Container>
                <Header as="h2" className="CoursesHeader">
                  My Courses (Teacher)
                </Header>

                <Table singleLine key="grey" color="yellow">
                  <Table.Body>
                    {this.props.teacherInstance.map(tinstance => (
                      <Table.Row key={tinstance.id}>
                        <Table.Cell>
                          <Link to={`/labtool/courses/${tinstance.ohid}`}>{tinstance.name} </Link>
                        </Table.Cell>
                        <Table.Cell textAlign="right">
                          <Link to={`/labtool/courses/${tinstance.ohid}`}>
                            <Popup trigger={<Button circular size="tiny" icon={{ name: 'eye', size: 'large', color: 'blue' }} />} content="View course" />
                          </Link>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Container>
            </div>
          </Container>
        </Segment>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    studentInstance: state.studentInstance,
    teacherInstance: state.teacherInstance
  }
}

export default connect(
  mapStateToProps,
  { getAllStudentCourses, getAllTeacherCourses }
)(MyPage)
