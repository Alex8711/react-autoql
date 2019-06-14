import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import uuid from 'uuid'

import Drawer from 'rc-drawer'

import ScrollToBottom from 'react-scroll-to-bottom'
import { Scrollbars } from 'react-custom-scrollbars'

import { ChatBar } from '../ChatBar'
import { ChatMessage } from '../ChatMessage'
import { ChataTable } from '../ChataTable'
import { ResponseRenderer } from '../ResponseRenderer'
import { runDrilldown } from '../../js/queryService'

import rcStyles from 'rc-drawer/assets/index.css'
import chataTableStyles from '../ChataTable/ChataTable.css'
import styles from './ChatDrawer.css'

export default class ChatDrawer extends React.Component {
  static propTypes = {
    placement: PropTypes.string,
    maskClosable: PropTypes.bool,
    onVisibleChange: PropTypes.func,
    isVisible: PropTypes.bool,
    showHandle: PropTypes.bool,
    // customHandle: PropTypes.ReactElement,
    theme: PropTypes.string,
    handleStyles: PropTypes.shape({}),
    shiftScreen: PropTypes.bool,
    isDrilldownEnabled: PropTypes.bool,
    token: PropTypes.string.isRequired
  }

  static defaultProps = {
    placement: 'right',
    maskClosable: true,
    isVisible: false,
    width: 500,
    height: 350,
    // customHandle: undefined, // not working atm
    showHandle: true,
    theme: 'light',
    handleStyles: {},
    shiftScreen: false,
    isDrilldownEnabled: true,
    onHandleClick: () => {},
    onVisibleChange: () => {}
  }

  state = {
    messages: [
      {
        id: uuid.v4(),
        isResponse: true,
        type: 'text',
        content:
          "Hi there! I'm here to help you access, search and analyze your data."
      }
      // {
      //   content: 'My Response will go here! I will let you view the data in a few different ways. You can also choose to drilldown on the data for more insights!',
      // },
      // {
      //   id: 1,
      //   isResponse: true,
      //   content: <ChataTable />
      // },
      // {
      //   id: 1,
      //   isResponse: false,
      //   text: 'What is my current cash balance?'
      // }
    ]
  }

  componentDidUpdate = prevProps => {
    if (this.props.isVisible && !prevProps.isVisible) {
      if (this.chatBarRef) {
        this.chatBarRef.focus()
      }
    }
  }

  getHandlerProp = () => {
    if (this.props.customHandle !== undefined) {
      return this.props.customHandle
    } else if (this.props.showHandle) {
      return (
        <div className="drawer-handle" style={this.props.handleStyles}>
          <i className="drawer-handle-icon" />
        </div>
      )
    }
    return false
  }

  getHeightProp = () => {
    if (
      this.getPlacementProp() === 'right' ||
      this.getPlacementProp() === 'left'
    ) {
      return null
    }
    return this.props.height
  }

  getWidthProp = () => {
    if (
      this.getPlacementProp() === 'right' ||
      this.getPlacementProp() === 'left'
    ) {
      return this.props.width
    }
    return null
  }

  getPlacementProp = () => {
    const { placement } = this.props
    let formattedPlacement
    if (typeof placement === 'string') {
      formattedPlacement = placement.trim().toLowerCase()
      if (
        formattedPlacement === 'right' ||
        formattedPlacement === 'left' ||
        formattedPlacement === 'bottom' ||
        formattedPlacement === 'top'
      ) {
        return formattedPlacement
      }
    }
    return 'right'
  }

  handleMaskClick = () => {
    if (this.props.maskClosable === false) {
      return
    }
    this.props.onMaskClick()
    this.props.onHandleClick()
  }

  // Required to make animation smooth
  scrollToBottom = () => {
    const self = this
    setTimeout(() => {
      self.scrollComponent.scrollToBottom()
    }, 50)
  }

  onInputSubmit = newMessage => {
    this.addRequestMessage(newMessage)
    this.setState({ isChataThinking: true })
  }

  onResponse = response => {
    this.addResponseMessage(response)
    this.setState({ isChataThinking: false })
    if (this.chatBarRef) {
      this.chatBarRef.focus()
    }
  }

  getGroupByArrayFromTable = (origRowData, origColumns, forceDateAxis) => {
    const jsonData = {}
    let columns = [...origColumns]
    const rowData = origRowData.getData()

    if (forceDateAxis) {
      // swap first two columns if second one is DATE and first is not
      // rowData is already swapped here if necessary so don't swap again.
      if (
        (columns[0].type !== 'DATE' && columns[1].type === 'DATE') ||
        (columns[0].type !== 'DATE_STRING' && columns[1].type === 'DATE_STRING')
      ) {
        columns = [columns[1], columns[0], ...columns.slice(2)]
      }
    }

    columns.forEach((column, index) => {
      if (column.groupable) {
        const columnName = column.name
        if (column.type === 'DATE') {
          jsonData[columnName] = rowData[index]
        } else {
          jsonData[columnName.toLowerCase()] = rowData[index]
        }
      }
    })
    return jsonData
  }

  processDrilldown = (rowData, columns, queryID) => {
    if (this.props.isDrilldownEnabled) {
      // make drilldowncall

      const groupByArray = this.getGroupByArrayFromTable(rowData, columns, true)
      console.log('group by array')
      console.log(groupByArray)
      const bodyJSON = {
        id: queryID,
        group_bys: groupByArray
      }

      const drilldownText = `Drill down on ${Object.keys(groupByArray)[0]} ${
        groupByArray[Object.keys(groupByArray)[0]]
      }`

      this.addRequestMessage(drilldownText)
      this.setState({ isChataThinking: true })

      runDrilldown(bodyJSON, this.props.token)
        .then(response => {
          // this.addResponseMessage({ type: 'drilldown', text: '' })
          this.addResponseMessage({ ...response, isDrilldown: true })
          this.setState({ isChataThinking: false })
        })
        .catch(() => {
          this.setState({ isChataThinking: false })
        })
    }
  }

  clearMessages = () => {
    this.setState({ messages: [] })
  }

  createErrorMessage = () => {
    return {
      content: 'This is an error message.',
      id: uuid.v4(),
      type: 'error',
      isResponse: true
    }
  }

  createDrilldownMessage = () => {
    return {
      content: 'Drilldown Response goes here.',
      id: uuid.v4(),
      type: 'drilldown',
      isResponse: true
    }
  }

  createMessage = response => {
    return {
      content: (
        <ResponseRenderer
          processDrilldown={this.processDrilldown}
          response={response}
          isDrilldown={!!response.isDrilldown}
        />
      ),
      id: uuid.v4(),
      type: response.data.display_type,
      isResponse: true
    }
  }

  addRequestMessage = newMessage => {
    if (this.state.messages.length > 10) {
      // shift item from beginning of messages array
    }
    const message = {
      content: newMessage,
      id: uuid.v4(),
      isResponse: false
    }
    this.setState({
      messages: [...this.state.messages, message]
    })
    this.scrollToBottom()
  }

  addResponseMessage = response => {
    if (this.state.messages.length > 10) {
      // shift item from beginning of messages array
    }
    let message = {}
    if (!response) {
      console.log(
        'something went wrong.... probably a network error displaying general error message'
      )
      message = this.createErrorMessage()
    } else {
      message = this.createMessage(response)
    }
    this.setState({
      messages: [...this.state.messages, message]
    })
    this.scrollToBottom()
  }

  setActiveMessage = id => {
    this.setState({ activeMessageId: id })
  }

  setChatBarRef = ref => {
    this.chatBarRef = ref
  }

  render = () => {
    return (
      <Fragment>
        <style>{`${rcStyles}`}</style>
        <style>{`${styles}`}</style>
        <style>{`${chataTableStyles}`}</style>
        <Drawer
          data-test="chata-drawer-test"
          className="chata-drawer"
          open={this.props.isVisible}
          showMask={this.props.showMask}
          placement={this.getPlacementProp()}
          width={this.getWidthProp()}
          height={this.getHeightProp()}
          onMaskClick={this.handleMaskClick}
          onHandleClick={this.props.onHandleClick}
          afterVisibleChange={this.props.onVisibleChange}
          handler={this.getHandlerProp()}
          level={this.props.shiftScreen ? 'all' : null}
        >
          <div className="chata-drawer-content-container">
            <div className="chat-header-container">
              {!!this.state.activeMessageId && (
                <Fragment>
                  <button className="chata-drawer-header-button">A</button>
                  <button className="chata-drawer-header-button">B</button>
                  <button className="chata-drawer-header-button">C</button>
                  <button className="chata-drawer-header-button">D</button>
                </Fragment>
              )}
            </div>
            <Scrollbars
              ref={c => {
                this.scrollComponent = c
              }}
              className="chat-message-container"
            >
              {this.state.messages.length > 0 &&
                this.state.messages.map(message => {
                  return (
                    <ChatMessage
                      setActiveMessage={this.setActiveMessage}
                      isActive={this.state.activeMessageId === message.id}
                      isResponse={message.isResponse}
                      content={message.content}
                      type={message.type}
                      key={message.id}
                      id={message.id}
                    />
                  )
                })}
            </Scrollbars>
            {this.state.isChataThinking && (
              <div className="response-loading-container">
                <div className="response-loading">
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              </div>
            )}
            <div className="chat-bar-container">
              <ChatBar
                ref={this.setChatBarRef}
                className="chat-drawer-chat-bar"
                onSubmit={this.onInputSubmit}
                onResponseCallback={this.onResponse}
                isDisabled={this.state.isChataThinking}
                token={this.props.token}
                enableVoiceRecord
              />
            </div>
          </div>
        </Drawer>
      </Fragment>
    )
  }
}
