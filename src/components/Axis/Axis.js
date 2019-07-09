import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Numbro from 'numbro'

// import * as d3Axis from 'd3-axis'
import { select as d3Select } from 'd3-selection'
import { axisLeft, axisBottom } from 'd3-axis'

import './Axis.css'

export default class Axis extends Component {
  static propTypes = {
    orient: PropTypes.string,
    tickSizeInner: PropTypes.number,
    translate: PropTypes.string,
    scale: PropTypes.func,
    ticks: PropTypes.number,
    rotateLabels: PropTypes.bool,
    type: PropTypes.string,
    col: PropTypes.shape({})
  }

  static defaultProps = {
    orient: 'Bottom'
  }

  componentDidMount = () => {
    if (this.props.orient === 'Bottom') {
      this.renderXAxis()
    } else {
      this.renderYAxis()
    }
  }

  componentDidUpdate = () => {
    if (this.props.orient === 'Bottom') {
      this.renderXAxis()
    } else {
      this.renderYAxis()
    }
  }

  formatLabel = d => {
    const { col } = this.props
    if (!col || !col.type) {
      return d
    } else if (col.type === 'DOLLAR_AMT') {
      return Numbro(d).formatCurrency({
        thousandSeparated: true,
        mantissa: 0
      })
    }
    return d
  }

  renderXAxis = () => {
    // const axisType = `axis${this.props.orient}`
    // const axis = d3Axis[axisType]()
    //   .scale(this.props.scale)
    //   .tickSizeOuter(0)
    //   .ticks([this.props.ticks])
    //   .tickSizeInner(this.props.tickSizeInner)

    const axis = axisBottom()
      .scale(this.props.scale)
      .tickSizeOuter(0)
      .tickValues(this.props.ticks)

    if (this.props.tickValues) {
      axis.tickValues(this.props.tickValues)
    }

    // if (this.props.rotateLabels) {
    //   axis.selectAll('text').attr('transform', 'rotate(-45')
    // }

    d3Select(this.axisElement).call(axis)
  }

  renderYAxis = () => {
    const self = this
    const axis = axisLeft()
      .scale(this.props.scale)
      .tickSizeOuter(0)
      .ticks(6)
      .tickSizeInner(this.props.tickSizeInner)
      .tickFormat(d => {
        return self.formatLabel(d)
      })

    d3Select(this.axisElement).call(axis)
  }

  render = () => {
    return (
      <g
        className={`axis axis-${this.props.orient}${
          this.props.rotateLabels ? ' rotated' : ''
        }`}
        ref={el => {
          this.axisElement = el
        }}
        transform={this.props.translate}
      />
    )
  }
}
