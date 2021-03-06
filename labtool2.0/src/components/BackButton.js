import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Button, Icon } from 'semantic-ui-react'

const BackButton = props => (
  <Link to={props.to}>
    <Button compact disabled={!props.enabled}>
      <Icon name="angle left" />
      <span>{props.text}</span>
    </Button>
  </Link>
)

BackButton.propTypes = {
  to: PropTypes.string,
  enabled: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
}

const presets = {
  modifyCIPage: {
    to: state => `/labtool/ModifyCourseInstancePage/${state.selectedInstance.ohid}`,
    text: 'Back to course editing'
  },
  coursePage: {
    to: state => `/labtool/courses/${state.selectedInstance.ohid}`,
    text: 'Back to course page'
  }
}

const mapStateToProps = (state, ownProps) => {
  let to
  try {
    to = presets[ownProps.preset].to(state)
  } catch (e) {
    to = ownProps.to
  }
  let text
  if (presets[ownProps.preset]) {
    text = presets[ownProps.preset].text
  } else {
    text = ownProps.text || 'Back'
  }
  return {
    to,
    text,
    enabled: to !== undefined
  }
}

export default connect(
  mapStateToProps,
  null
)(BackButton)
