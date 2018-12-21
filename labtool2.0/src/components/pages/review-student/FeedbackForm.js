import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Button, Form, Input } from 'semantic-ui-react'

const PointsField = ({ initialPoints, maxPoints, forwardInputRef }) => (
  <Form.Field>
    <label>Points 0-{maxPoints}</label>
    <Input
      ref={forwardInputRef}
      name="points"
      defaultValue={initialPoints}
      type="number"
      step="0.01"
      style={{ width: '150px', align: 'center' }}
    />
  </Form.Field>
)

PointsField.propTypes = {
  forwardInputRef: PropTypes.object,
  initialPoints: PropTypes.number,
  maxPoints: PropTypes.number
}

const FeedbackField = ({ forwardRef, initialText }) => (
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
      style={{ width: '500px', height: '250px' }}
    />
  </div>
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
      <Form.Group inline unstackable>
        <PointsField
          forwardInputRef={forwardReviewPointsRef}
          initialPoints={initialReviewPoints}
          maxPoints={weekMaxPoints}
        />
      </Form.Group>
      <Form.Group inline unstackable>
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
