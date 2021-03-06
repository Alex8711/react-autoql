import React from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash.get'
import _isEqual from 'lodash.isequal'
import uuid from 'uuid'

import { themeConfigType } from '../../props/types'
import { themeConfigDefault, getThemeConfig } from '../../props/defaults'
import { setCSSVars } from '../../js/Util'
import ErrorBoundary from '../../containers/ErrorHOC/ErrorHOC'

import './Radio.scss'

export default class Radio extends React.Component {
  COMPONENT_KEY = uuid.v4()

  static propTypes = {
    themeConfig: themeConfigType,
    options: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    value: PropTypes.string,
    multiSelect: PropTypes.bool,
    type: PropTypes.string,
  }

  static defaultProps = {
    themeConfig: themeConfigDefault,
    options: [],
    multiSelect: false,
    value: undefined,
    type: 'original',
    onChange: () => {},
  }

  componentDidMount = () => {
    setCSSVars(getThemeConfig(this.props.themeConfig))
  }

  componentDidUpdate = (prevProps) => {
    if (
      !_isEqual(
        getThemeConfig(this.props.themeConfig),
        getThemeConfig(prevProps.themeConfig)
      )
    ) {
      setCSSVars(getThemeConfig(this.props.themeConfig))
    }
  }

  renderButtonType = () => {
    return (
      <ErrorBoundary>
        <div
          className="react-autoql-radio-btn-container"
          data-test="react-autoql-radio"
        >
          {this.props.options.map((option, i) => {
            let isActive = this.props.value === option
            if (this.props.multiSelect) {
              isActive = this.props.value.includes(option)
            }
            return (
              <div
                key={`react-autoql-radio-${this.COMPONENT_KEY}-${i}`}
                className={`react-autoql-radio-btn
                  ${isActive ? ' active' : ''}`}
                onClick={() => this.props.onChange(option)}
              >
                {option}
              </div>
            )
          })}
        </div>
      </ErrorBoundary>
    )
  }

  renderOriginalType = () => {
    return (
      <ErrorBoundary>
        <div
          className="react-autoql-radio-btn-container"
          data-test="react-autoql-radio"
        >
          {this.props.options.map((option, i) => {
            let isActive = this.props.value === option
            if (this.props.multiSelect) {
              isActive = this.props.value.includes(option)
            }
            return (
              <p key={`react-autoql-radio-${this.COMPONENT_KEY}-${i}`}>
                <input
                  id={`react-autoql-radio-${this.COMPONENT_KEY}-${i}`}
                  name={`react-autoql-radio-${this.COMPONENT_KEY}`}
                  type="radio"
                  defaultChecked={isActive}
                />
                <label
                  htmlFor={`react-autoql-radio-${this.COMPONENT_KEY}-${i}`}
                  onClick={() => this.props.onChange(option)}
                >
                  {option}
                </label>
              </p>
            )
          })}
        </div>
      </ErrorBoundary>
    )
  }

  render = () => {
    if (!_get(this.props.options, 'length')) {
      return null
    }

    if (this.props.type === 'button') {
      return this.renderButtonType()
    }

    return this.renderOriginalType()
  }
}
