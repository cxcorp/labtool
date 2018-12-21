import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Button, Form, Input } from 'semantic-ui-react'

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
        <Form.Field>
          <label>Points 0-{weekMaxPoints}</label>
          <Input
            ref={forwardReviewPointsRef}
            name="points"
            defaultValue={initialReviewPoints}
            type="number"
            step="0.01"
            style={{ width: '150px', align: 'center' }}
          />
        </Form.Field>
      </Form.Group>
      <label>Feedback</label>
      <Form.Group inline unstackable>
        <div ref={forwardReviewTextRef}>
          {/*Do not add anything else to this div. If you do, you'll break this.copyChecklistOutput.*/}
          <Form.TextArea
            defaultValue={initialReviewText}
            name="comment"
            style={{ width: '500px', height: '250px' }}
          />
        </div>
      </Form.Group>
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
