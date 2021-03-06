import React from 'react'
import { shallow } from 'enzyme'

import { findByTestAttr } from '../../../test/testUtils'
import QueryTipsTab from './QueryTipsTab'

const defaultProps = {
  onQueryTipsInputKeyPress: () => {},
  executeQuery: () => {},
  loading: false,
  error: false,
  queryTipsList: []
}

const setup = (props = {}, state = null) => {
  const setupProps = { ...defaultProps, ...props }
  const wrapper = shallow(<QueryTipsTab {...setupProps} />)
  if (state) {
    wrapper.setState(state)
  }
  return wrapper
}

describe('renders correctly', () => {
  test('renders correctly with required props', () => {
    const wrapper = setup()
    const queryTipsComponent = findByTestAttr(wrapper, 'query-tips-tab')
    expect(queryTipsComponent.exists()).toBe(true)
  })
})
