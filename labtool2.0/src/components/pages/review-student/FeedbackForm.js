import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Button, Form, Input, Label } from 'semantic-ui-react'

const PointsField = ({ initialPoints, maxPoints, forwardInputRef }) => {
  const label = (
    <Label as="label" htmlFor="points">
      Points 0-{maxPoints}
    </Label>
  )
  return (
    <Form.Field className="foobar">
      <Input
        ref={forwardInputRef}
        name="points"
        id="points"
        defaultValue={initialPoints}
        type="number"
        step="0.01"
        labelPosition="left"
        label={label}
      />
    </Form.Field>
  )
}

PointsField.propTypes = {
  forwardInputRef: PropTypes.object,
  initialPoints: PropTypes.number,
  maxPoints: PropTypes.number
}

const FeedbackField = ({ forwardRef, initialText }) => (
  <Form.Field>
    <label htmlFor="comment" style={{ textAlign: 'left' }}>
      Feedback
    </label>
    <div ref={forwardRef}>
      {/* Do not change the contents of this div.
        * ReviewStudent::copyChecklistOutput relies on its current structure
        * to copy the checks' generated text to the TextArea.
        * TextArea cannot be ref'd directly because it is a stateless
        * component.
        */}
      <Form.TextArea
        defaultValue={initialText}
        name="comment"
        id="comment"
        style={{ width: '500px', height: '250px' }}
      />
    </div>
  </Form.Field>
)

FeedbackField.propTypes = {
  forwardRef: PropTypes.object,
  initialText: PropTypes.string
}

const ButtonControlsField = ({ cancelLinkHref }) => (
  <Form.Field>
    <Button className="ui center floated green button" type="submit">
      Save
    </Button>
    <Link to={cancelLinkHref} type="Cancel">
      <Button className="ui center floated button" type="cancel">
        Cancel
      </Button>
    </Link>
  </Form.Field>
)

ButtonControlsField.propTypes = {
  cancelLinkHref: PropTypes.string
}

/**
 * Feedback form of the weekly student review page.
 *
 * The form and its fields are uncontrolled. The refs to the fields are passed
 * down because the "Copy to review fields" functionality is implemented in
 * ReviewStudent by setting/appending to the uncontrolled fields directly.
 *
 * The values themselves are retrieved when the form is submitted via the fields'
 * names from `e.target`.
 */
const FeedbackForm = ({
  cancelLinkHref,
  forwardReviewPointsRef,
  forwardReviewTextRef,
  initialReviewPoints,
  initialReviewText,
  weekMaxPoints,
  onSubmit
}) => {
  return (
    <Form onSubmit={onSubmit}>
      <Form.Group>
        <PointsField
          forwardInputRef={forwardReviewPointsRef}
          initialPoints={initialReviewPoints}
          maxPoints={weekMaxPoints}
        />
      </Form.Group>
      <Form.Group>
        <FeedbackField
          forwardRef={forwardReviewTextRef}
          initialText={initialReviewText}
        />
      </Form.Group>
      <ButtonControlsField cancelLinkHref={cancelLinkHref} />
    </Form>
  )
}

FeedbackForm.propTypes = {
  cancelLinkHref: PropTypes.string,
  forwardReviewPointsRef: PropTypes.object,
  forwardReviewTextRef: PropTypes.object,
  initialReviewPoints: PropTypes.number,
  initialReviewText: PropTypes.string,
  weekMaxPoints: PropTypes.number,
  onSubmit: PropTypes.func
}

export default FeedbackForm
