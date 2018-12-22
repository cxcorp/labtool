import React from 'react'
import { Card, Form, Grid, Input } from 'semantic-ui-react'

const ChecklistItem = ({ initialChecked, item, createToggleCheckbox }) => (
  <Card.Content className="checklistCardRow">
    <Form.Field>
      <Grid>
        <Grid.Row>
          <Grid.Column width={3}>
            <Input
              type="checkbox"
              defaultChecked={initialChecked}
              onChange={createToggleCheckbox(item.name)}
            />
          </Grid.Column>
          <Grid.Column width={10}>
            <span style={{ flexGrow: 1, textAlign: 'center' }}>
              {item.name}
            </span>
          </Grid.Column>
          <Grid.Column width={3}>
            <span>{`${item.checkedPoints} p / ${item.uncheckedPoints} p`}</span>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Form.Field>
  </Card.Content>
)

const Checklist = ({ checkedItems, name, items, createToggleCheckbox }) => (
  <Card className="checklistCard" fluid color="red">
    <Card.Content header={name} />
    {items.map(item => (
      <ChecklistItem
        key={item.name}
        initialChecked={!!checkedItems[item.name]}
        item={item}
        createToggleCheckbox={createToggleCheckbox}
      />
    ))}
  </Card>
)

const Checklists = ({ lists, checks, createToggleCheckbox }) => {
  return (
    <div>
      {lists.map(({ name, items }) => (
        <Checklist
          key={name}
          name={name}
          items={items}
          checkedItems={checks}
          createToggleCheckbox={createToggleCheckbox}
        />
      ))}
    </div>
  )
}

export default Checklists
