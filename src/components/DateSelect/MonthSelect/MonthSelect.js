import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash.get'
import uuid from 'uuid'

import '../DateSelect.scss'

const days = Array.from({ length: 31 }, (a, b) => b + 1)

export default class MonthSelect extends React.Component {
  COMPONENT_KEY = uuid.v4()

  static propTypes = {
    value: PropTypes.arrayOf(PropTypes.number),
    multiSelect: PropTypes.bool,
    showLastDaySelector: PropTypes.bool,
    onChange: PropTypes.func,
    allowNullValue: PropTypes.bool
  }

  static defaultProps = {
    value: [],
    multiSelect: false,
    showLastDaySelector: true,
    onChange: () => {},
    allowNullValue: false
  }

  onChange = selectedValue => {
    let finalOption = [selectedValue]
    if (this.props.multiSelect) {
      if (this.props.value.includes(selectedValue)) {
        // Its already selected, deselect it
        if (this.props.value.length === 1 && !this.props.allowNullValue) {
          // Do not allow to deselect last value if allowNullValue is false
          return this.props.value
        }
        finalOption = this.props.value.filter(value => value !== selectedValue)
      } else {
        // Select it
        finalOption = [...this.props.value, selectedValue]
      }
    }
    this.props.onChange(finalOption)
  }

  renderLastDaySelector = () => {
    if (!this.props.showLastDaySelector) {
      return null
    }

    let isActive = this.props.value === -1
    if (this.props.multiSelect) {
      isActive = this.props.value.includes(-1)
    }

    return (
      <div
        key={`chata-radio-${this.COMPONENT_KEY}-last-day`}
        className={`chata-radio-btn last-day
          ${isActive ? ' active' : ''}
          ${this.props.outlined ? ' outlined' : ''}`}
        onClick={() => this.onChange(-1)}
      >
        Last Day
      </div>
    )
  }

  getButtonClassNames = (option, i) => {
    let isActive = this.props.value === option
    if (this.props.multiSelect) {
      isActive = this.props.value.includes(option)
    }

    return `${isActive ? ' active' : ''}
    ${this.props.outlined ? ' outlined' : ''}
    ${i === 6 ? ' top-right' : ''}
    ${i === 27 && !this.props.showLastDaySelector ? ' bottom-right' : ''}
    ${i === 28 ? ' bottom-left' : ''}`
  }

  render = () => {
    return (
      <div
        className="chata-radio-btn-container month-select"
        data-test="chata-month-select"
      >
        {days.map((option, i) => {
          return (
            <Fragment>
              <div
                key={`chata-radio-${this.COMPONENT_KEY}-${i}`}
                className={`chata-radio-btn
                  ${this.getButtonClassNames(option, i)}`}
                onClick={() => this.onChange(option)}
              >
                {option}
              </div>
              {i !== 0 && // not the first row
              i !== days.length - 1 && // not the last row
                (i + 1) % 7 === 0 && <br /> // every 7th day
              }
            </Fragment>
          )
        })}
        {this.renderLastDaySelector()}
      </div>
    )
  }
}
