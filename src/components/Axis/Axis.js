import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Numbro from 'numbro'

import { select } from 'd3-selection'
import { axisLeft, axisBottom } from 'd3-axis'

import dayjs from 'dayjs'

import './Axis.css'

export default class Axis extends Component {
  static propTypes = {
    orient: PropTypes.string,
    tickSizeInner: PropTypes.number,
    translate: PropTypes.string,
    scale: PropTypes.func,
    ticks: PropTypes.array,
    rotateLabels: PropTypes.bool,
    type: PropTypes.string,
    col: PropTypes.shape({})
  }

  static defaultProps = {
    orient: 'Bottom'
  }

  componentDidMount = () => {
    this.renderAxis()
  }

  componentDidUpdate = () => {
    this.renderAxis()
  }

  formatLabel = d => {
    const { col } = this.props
    if (!col || !col.type) {
      return d
    }

    let formattedLabel = d
    switch (col.type) {
      case 'STRING': {
        // do nothing
        break
      }
      case 'DOLLAR_AMT': {
        // We will need to grab the actual currency symbol here. Will that be returned in the query response?
        formattedLabel = Numbro(d).formatCurrency({
          thousandSeparated: true,
          mantissa: 0
        })
        break
      }
      case 'QUANTITY': {
        // if (Number(d) % 1 !== 0) {
        //   formattedLabel = Numbro(d).format('0,0.0')
        // }
        break
      }
      case 'DATE': {
        const title = col.title
        if (title && title.includes('Year')) {
          formattedLabel = dayjs.unix(d).format('YYYY')
        } else if (title && title.includes('Month')) {
          formattedLabel = dayjs.unix(d).format('MMMM YYYY')
        }
        formattedLabel = dayjs.unix(d).format('MMMM D, YYYY')
        break
      }
      case 'PERCENT': {
        if (Number(d)) {
          formattedLabel = Numbro(d).format('0.00%')
        }
        break
      }
      default: {
        break
      }
    }

    if (typeof formattedLabel === 'string' && formattedLabel.length > 25) {
      return `${formattedLabel.substring(0, 25)}...`
    }
    return formattedLabel
  }

  renderAxis = () => {
    const self = this
    const axis = this.props.orient === 'Bottom' ? axisBottom() : axisLeft()

    axis
      .scale(this.props.scale)
      .tickSizeOuter(0)
      .tickFormat(d => {
        return self.formatLabel(d)
      })

    if (this.props.ticks) {
      axis.tickValues(this.props.ticks)
    }

    if (this.props.showGridLines) {
      axis.tickSizeInner(this.props.tickSizeInner)
    }

    select(this.axisElement).call(axis)

    if (this.props.orient === 'Bottom' && this.props.rotateLabels) {
      // translate labels slightly to line up with ticks once rotated
      select(this.axisElement)
        .selectAll('text')
        .attr('dy', '0.5em')
        .attr('dx', '-0.5em')
    }
  }

  render = () => {
    return (
      <g
        className={`axis axis-${this.props.orient}
        ${this.props.rotateLabels ? ' rotated' : ''}
        ${this.props.showGridLines ? ' hide-axis-line' : ''}`}
        ref={el => {
          this.axisElement = el
        }}
        transform={this.props.translate}
      />
    )
  }
}
