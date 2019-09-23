import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import uuid from 'uuid'

import RGL, { WidthProvider } from 'react-grid-layout'
import gridLayoutStyles from 'react-grid-layout/css/styles.css'

import ReactTooltip from 'react-tooltip'

import { runQuery, runDrilldown, cancelQuery } from '../../js/queryService'
import { formatElement, getgroupByObjectFromTable } from '../../js/Util'
import DashboardTile from './DashboardTile'

import chataTableStyles from '../ChataTable/ChataTable.css'
import styles from './DashboardTile.css'

const ReactGridLayout = WidthProvider(RGL)

export default class ChatDrawer extends React.Component {
  tileRefs = {}

  LIGHT_THEME = {
    '--chata-dashboard-accent-color': '#28a8e0',
    '--chata-dashboard-background-color': '#fff',
    '--chata-dashboard-border-color': '#d3d3d352',
    '--chata-dashboard-hover-color': '#ececec',
    '--chata-dashboard-text-color-primary': '#5d5d5d',
    '--chata-dashboard-text-color-placeholder': '#0000009c'
  }

  DARK_THEME = {
    '--chata-dashboard-accent-color': '#525252', // dark gray
    // '--chata-dashboard-accent-color': '#193a48', // dark blue
    '--chata-dashboard-background-color': '#636363',
    '--chata-dashboard-border-color': '#d3d3d329',
    '--chata-dashboard-hover-color': '#5a5a5a',
    '--chata-dashboard-text-color-primary': '#fff',
    '--chata-dashboard-text-color-placeholder': '#ffffff9c'
  }

  static propTypes = {
    apiKey: PropTypes.string,
    customerId: PropTypes.string,
    userId: PropTypes.string,
    domain: PropTypes.string,
    runDashboardOnMount: PropTypes.bool,
    theme: PropTypes.string,
    enableDrilldowns: PropTypes.bool,
    enableSafetyNet: PropTypes.bool,
    enableAutocomplete: PropTypes.bool,
    enableAutocomplete: PropTypes.bool,
    accentColor: PropTypes.string,
    demo: PropTypes.bool,
    debug: PropTypes.bool,
    chataDashboardState: PropTypes.shape({}),
    isEditing: PropTypes.bool,
    runDashboardOnMount: PropTypes.bool
  }

  static defaultProps = {
    apiKey: undefined,
    customerId: undefined,
    userId: undefined,
    domain: undefined,
    theme: 'light',
    enableDrilldowns: true,
    enableAutocomplete: true,
    accentColor: undefined,
    enableSafetyNet: true,
    enableAutocomplete: true,
    demo: false,
    debug: false,
    runDashboardOnMount: true,
    chataDashboardState: {},
    isEditing: false,
    runDashboardOnMount: true
  }

  state = {
    tiles: [
      {
        key: '0',
        i: '0',
        w: 3,
        h: 2,
        x: 0,
        y: 0,
        maxH: 12,
        minH: 2,
        minW: 3,
        query: 'total profi this month',
        title: 'Profit - Current Month'
      },
      {
        key: '1',
        i: '1',
        w: 3,
        h: 2,
        x: 3,
        y: 0,
        maxH: 12,
        minH: 2,
        minW: 3,
        query: 'total profit last month',
        title: 'Profit - Previous Month'
      },
      {
        key: '2',
        i: '2',
        w: 3,
        h: 2,
        x: 6,
        y: 0,
        maxH: 12,
        minH: 2,
        minW: 3,
        query: 'total profit ytd',
        title: 'Profit - YTD'
      },
      {
        key: '3',
        i: '3',
        w: 3,
        h: 2,
        x: 9,
        y: 0,
        maxH: 12,
        minH: 2,
        minW: 3,
        query: 'last years profit',
        title: 'Profit - Previous Year'
      },
      {
        key: '4',
        i: '4',
        w: 6,
        h: 5,
        x: 0,
        y: 2,
        maxH: 12,
        minW: 3,
        query: 'profit by month ytd',
        displayType: 'line',
        title: 'Monthly YTD Profit'
      },
      {
        key: '5',
        i: '5',
        w: 6,
        h: 5,
        x: 6,
        y: 2,
        maxH: 12,
        minW: 3,
        query: 'profit by month last year',
        displayType: 'line',
        title: '2018 Monthly Profit'
      },
      {
        key: '6',
        i: '6',
        w: 6,
        h: 5,
        x: 0,
        y: 7,
        maxH: 12,
        minH: 2,
        minW: 3,
        query: 'profit by class this year',
        displayType: 'column',
        title: 'Total Profit by Class (2019)'
      },
      {
        key: '7',
        i: '7',
        w: 6,
        h: 5,
        x: 6,
        y: 7,
        maxH: 12,
        minH: 2,
        minW: 3,
        query: 'profit by customer this year',
        displayType: 'bar',
        title: 'Total Profit by Customer (2019)'
      },
      {
        key: '8',
        i: '8',
        w: 6,
        h: 5,
        x: 0,
        y: 12,
        maxH: 12,
        minH: 2,
        minW: 3,
        query: 'total profit by class by month ytd',
        displayType: 'heatmap',
        title: 'Product Profitability'
      },
      {
        key: '9',
        i: '9',
        w: 6,
        h: 5,
        x: 6,
        y: 12,
        maxH: 12,
        minH: 2,
        minW: 3,
        query: 'total profit by customer by month ytd',
        displayType: 'heatmap',
        title: 'Customer Profitability'
      }
    ],
    isDragging: false,
    tileQueryResponses: {},
    ...this.props.chataDashboardState
  }

  componentDidMount = () => {
    this.setStyles()

    // Listen for esc press to cancel queries while they are running
    // document.addEventListener('keydown', this.escFunction, false)

    // There is a bug with react tooltips where it doesnt bind properly right when the component mounts
    // setTimeout(() => {
    //   ReactTooltip.rebuild()
    // }, 100)

    if (this.props.runDashboardOnMount) {
      // Allow tiles to animate into place before running
      setTimeout(() => {
        this.executeDashboard()
      }, 1000)
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.theme && this.props.theme !== prevProps.theme) {
      this.setStyles()
    }
    if (prevProps.isEditing && !this.props.isEditing) {
      // Reset query responses back to null, then trigger an execution
      this.setState({ tileQueryResponses: {}, reloadDashboard: true })
    }
    if (!prevState.reloadDashboard && this.state.reloadDashboard) {
      this.executeDashboard()
      this.setState({ reloadDashboard: false })
    }
    if (prevState.tiles.length < this.state.tiles.length) {
      setTimeout(() => {
        if (this.ref) {
          this.ref.scrollIntoView(false)
        }
      }, 200)
    }
  }

  componentWillUnmount = () => {
    document.removeEventListener('keydown', this.escFunction, false)
  }

  executeDashboard = () => {
    for (var dashboardTile in this.tileRefs) {
      if (this.tileRefs[dashboardTile]) {
        this.tileRefs[dashboardTile].processTile()
      }
    }
  }

  escFunction = event => {
    if (this.props.isVisible && event.keyCode === 27) {
      cancelQuery()
    }
  }

  onMoveStart = () => {
    this.setState({
      isDragging: true
    })
  }

  onMoveEnd = () => {
    setTimeout(() => {
      this.setState({
        isDragging: false
      })
    }, 100)
  }

  setStyles = () => {
    const themeStyles =
      this.props.theme === 'light' ? this.LIGHT_THEME : this.DARK_THEME
    for (let property in themeStyles) {
      document.documentElement.style.setProperty(
        property,
        themeStyles[property]
      )
    }
    if (this.props.accentColor) {
      document.documentElement.style.setProperty(
        '--chata-drawer-accent-color',
        this.props.accentColor
      )
    }
  }

  // onSuggestionClick = suggestion => {
  //   this.addRequestMessage(suggestion)
  //   this.setState({ isChataThinking: true })

  //   if (suggestion === 'None of these') {
  //     setTimeout(() => {
  //       this.addResponseMessage({ content: 'Thank you for your feedback.' })
  //       this.setState({ isChataThinking: false })
  //     }, 1000)
  //     return
  //   }

  //   runQuery(
  //     suggestion,
  //     this.props.demo,
  //     this.props.debug,
  //     this.props.enableSafetyNet,
  //     this.props.domain,
  //     this.props.apiKey,
  //     this.props.customerId,
  //     this.props.userId
  //   )
  //     .then(response => {
  //       this.onResponse(response)
  //     })
  //     .catch(error => {
  //       this.onResponse(error)
  //     })
  // }

  onResponse = response => {
    this.addResponseMessage({ response })
    this.setState({ isChataThinking: false })
    if (this.chatBarRef) {
      this.chatBarRef.focus()
    }
  }

  processDrilldown = (rowData, columns, queryID, singleValueResponse) => {
    if (this.props.enableDrilldowns) {
      const groupByObject = getgroupByObjectFromTable(rowData, columns, true)

      if (
        !singleValueResponse &&
        (!groupByObject || JSON.stringify(groupByObject) === JSON.stringify({}))
      ) {
        return
      }

      // This is a hack.
      // How do we get the right text?? Can we make an api call to get the text first?
      const drilldownText = `Drill down on ${columns[0].title} "${formatElement(
        rowData[0],
        columns[0]
      )}"`

      this.addRequestMessage(drilldownText)
      this.setState({ isChataThinking: true })

      runDrilldown(
        queryID,
        groupByObject,
        this.props.demo,
        this.props.debug,
        this.props.apiKey,
        this.props.customerId,
        this.props.userId
      )
        .then(response => {
          this.addResponseMessage({
            response: { ...response, isDrilldownDisabled: true }
          })
          this.setState({ isChataThinking: false })
        })
        .catch(() => {
          this.setState({ isChataThinking: false })
        })
    }
  }

  setChatBarRef = ref => {
    this.chatBarRef = ref
  }

  addTile = () => {
    const tiles = [...this.state.tiles]
    const id = uuid.v4()
    tiles.push({
      key: id,
      i: id,
      w: 6,
      h: 5,
      x: (Object.keys(tiles).length * 6) % 12,
      y: Infinity,
      maxH: 12,
      minH: 2,
      minW: 3,
      query: '',
      title: '',
      isNewTile: true
    })

    this.setState({ tiles })
  }

  deleteTile = id => {
    const tiles = [...this.state.tiles]
    const tileIndex = tiles.map(item => item.i).indexOf(id)
    ~tileIndex && tiles.splice(tileIndex, 1)

    this.setState({ tiles })
  }

  updateTileQuery = (query, id) => {
    const tiles = [...this.state.tiles]
    const tileIndex = tiles.map(item => item.i).indexOf(id)
    tiles[tileIndex].query = query

    this.setState({ tiles })
  }

  updateTileTitle = (title, id) => {
    const tiles = [...this.state.tiles]
    const tileIndex = tiles.map(item => item.i).indexOf(id)
    tiles[tileIndex].title = title

    this.setState({ tiles })
  }

  updateTileLayout = layout => {
    const tiles = this.state.tiles.map((tile, index) => {
      return {
        ...tile,
        ...layout[index]
      }
    })
    this.setState({ tiles })
  }

  setResponseForTile = (response, id) => {
    const tiles = [...this.state.tiles]
    const tileIndex = tiles.map(item => item.i).indexOf(id)
    if (tiles[tileIndex]) {
      tiles[tileIndex].isNewTile = false
      this.setState({
        tileQueryResponses: {
          ...this.state.tileQueryResponses,
          [id]: response
        },
        tiles
      })
    }
  }

  render = () => {
    return (
      <Fragment>
        <style>{`${styles}`}</style>
        <style>{`${chataTableStyles}`}</style>
        <style>{`${gridLayoutStyles}`}</style>
        <div
          ref={ref => (this.ref = ref)}
          className="chata-dashboard-container"
          style={{
            height: '100%',
            width: '100%',
            overflow: 'hidden'
            // overflowY: 'auto'
          }}
        >
          <ReactGridLayout
            onLayoutChange={layout => {
              this.updateTileLayout(layout)
              this.setState({ layout })
            }}
            onDragStart={this.onMoveStart}
            onResizeStart={this.onMoveStart}
            onDragStop={this.onMoveEnd}
            onResizeStop={this.onMoveEnd}
            className="chata-dashboard"
            rowHeight={60}
            cols={12}
            isDraggable={this.props.isEditing}
            isResizable={this.props.isEditing}
            draggableHandle=".chata-dashboard-tile-inner-div"
            layout={this.state.tiles}
            margin={[20, 20]}
          >
            {this.state.tiles.map(tile => (
              <DashboardTile
                className={`chata-dashboard-tile${
                  this.state.isDragging ? ' dragging' : ''
                } ${tile.i}`}
                ref={ref => (this.tileRefs[tile.key] = ref)}
                key={tile.key}
                query={tile.query}
                title={tile.title}
                tileId={tile.i}
                s
                displayType={tile.displayType}
                apiKey={this.props.apiKey}
                customerId={this.props.customerId}
                userId={this.props.userId}
                domain={this.props.domain}
                demo={this.props.demo}
                debug={this.props.demo}
                enableSafetyNet={this.props.enableSafetyNet}
                isEditing={this.props.isEditing}
                isDragging={this.state.isDragging}
                setResponseForTile={this.setResponseForTile}
                deleteTile={this.deleteTile}
                updateTileQuery={this.updateTileQuery}
                updateTileTitle={this.updateTileTitle}
                isNewTile={tile.isNewTile}
                queryResponse={this.state.tileQueryResponses[tile.i]}
              />
            ))}
          </ReactGridLayout>
        </div>
        <ReactTooltip
          className="chata-chart-tooltip"
          id="chart-element-tooltip"
          effect="solid"
          html
        />
      </Fragment>
    )
  }
}