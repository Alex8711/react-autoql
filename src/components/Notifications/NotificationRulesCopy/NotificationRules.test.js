import React from 'react'
import { shallow } from 'enzyme'

import { findByTestAttr } from '../../../../test/testUtils'
import NotificationRules from './NotificationRules'

const defaultProps = {}

const setup = (props = {}, state = null) => {
  const setupProps = { ...defaultProps, ...props }
  const wrapper = shallow(<NotificationRules {...setupProps} />)
  if (state) {
    wrapper.setState(state)
  }
  return wrapper
}

describe('renders correctly', () => {
  test('renders correctly with equired props', () => {
    const wrapper = setup()
    const notificationRulesComponent = findByTestAttr(
      wrapper,
      'notification-rules'
    )
    expect(notificationRulesComponent.exists()).toBe(true)
  })
})
