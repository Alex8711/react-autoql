import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import uuid from 'uuid'

import Drawer from 'rc-drawer'

import ReactTooltip from 'react-tooltip'

import { Scrollbars } from 'react-custom-scrollbars'
import { MdClose } from 'react-icons/md'
import { FaRegTrashAlt } from 'react-icons/fa'

import chataBubblesSVG from '../../images/chata-bubbles.svg'
import { bubblesIcon } from '../../svgIcons.js'

import { ChatBar } from '../ChatBar'
import { ChatMessage } from '../ChatMessage'
import { runQuery, runDrilldown, cancelQuery } from '../../js/queryService'
import { formatElement } from '../../js/Util'

import rcStyles from 'rc-drawer/assets/index.css'
import chataTableStyles from '../ChataTable/ChataTable.css'
import messageStyles from '../ChatMessage/ChatMessage.css'
import styles from './ChatDrawer.css'

export default class ChatDrawer extends React.Component {
  LIGHT_THEME = {
    '--chata-drawer-accent-color': '#28a8e0',
    '--chata-drawer-background-color': '#fff',
    '--chata-drawer-border-color': '#d3d3d352',
    '--chata-drawer-hover-color': '#ececec',
    '--chata-drawer-text-color-primary': '#5d5d5d',
    '--chata-drawer-text-color-placeholder': '#0000009c'
  }

  DARK_THEME = {
    '--chata-drawer-accent-color': '#525252', // dark gray
    // '--chata-drawer-accent-color': '#193a48', // dark blue
    '--chata-drawer-background-color': '#636363',
    '--chata-drawer-border-color': '#d3d3d329',
    '--chata-drawer-hover-color': '#5a5a5a',
    '--chata-drawer-text-color-primary': '#fff',
    '--chata-drawer-text-color-placeholder': '#ffffff9c'
  }

  introMessageObject = {
    id: 'intro',
    isResponse: true,
    type: 'text',
    content: ''
  }

  static propTypes = {
    apiKey: PropTypes.string,
    customerId: PropTypes.string,
    userId: PropTypes.string,
    domain: PropTypes.string,
    placement: PropTypes.string,
    maskClosable: PropTypes.bool,
    onVisibleChange: PropTypes.func,
    isVisible: PropTypes.bool,
    showHandle: PropTypes.bool,
    // customHandle: PropTypes.ReactElement,
    theme: PropTypes.string,
    handleStyles: PropTypes.shape({}),
    shiftScreen: PropTypes.bool,
    enableDrilldowns: PropTypes.bool,
    customerName: PropTypes.string,
    enableAutocomplete: PropTypes.bool,
    clearOnClose: PropTypes.bool,
    accentColor: PropTypes.string,
    enableSafetyNet: PropTypes.bool,
    enableAutocomplete: PropTypes.bool,
    enableVoiceRecord: PropTypes.bool,
    title: PropTypes.string,
    maxMessages: PropTypes.number,
    demo: PropTypes.bool
  }

  static defaultProps = {
    apiKey: undefined,
    customerId: undefined,
    userId: undefined,
    placement: 'right',
    maskClosable: true,
    isVisible: true,
    width: 500,
    height: 350,
    // customHandle: undefined, // not working atm
    showHandle: true,
    theme: 'light',
    handleStyles: {},
    shiftScreen: false,
    enableDrilldowns: true,
    customerName: 'there',
    enableAutocomplete: true,
    clearOnClose: false,
    accentColor: undefined,
    enableSafetyNet: true,
    enableAutocomplete: true,
    enableVoiceRecord: true,
    title: 'chata.ai',
    maxMessages: undefined,
    demo: false,
    introMessage: undefined,
    onHandleClick: () => {},
    onVisibleChange: () => {}
  }

  state = {
    messages: [this.introMessageObject],
    lastMessageId: 'intro'
  }

  componentDidMount = () => {
    this.setStyles()
    this.setIntroMessageObject()

    // Listen for esc press to cancel queries while they are running
    document.addEventListener('keydown', this.escFunction, false)

    // There is a bug with react tooltips where it doesnt bind properly right when the component mounts
    setTimeout(() => {
      ReactTooltip.rebuild()
    }, 100)
  }

  componentDidUpdate = prevProps => {
    if (this.props.isVisible && !prevProps.isVisible) {
      if (this.chatBarRef) {
        this.chatBarRef.focus()
      }
    }
    if (
      !this.props.isVisible &&
      prevProps.isVisible &&
      this.props.clearOnClose
    ) {
      this.clearMessages()
    }
    if (this.props.theme && this.props.theme !== prevProps.theme) {
      this.setStyles()
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction, false)
  }

  escFunction = event => {
    if (this.props.isVisible && event.keyCode === 27) {
      cancelQuery()
    }
  }

  setIntroMessageObject = () => {
    this.introMessageObject.content = this.props.introMessage
      ? `${this.props.introMessage}`
      : `Hi ${this.props.customerName ||
          'there'}! I'm here to help you access, search and analyze your data.`

    this.setState({ messages: [this.introMessageObject] })
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

  getHandlerProp = () => {
    if (this.props.customHandle !== undefined) {
      return this.props.customHandle
    } else if (this.props.showHandle) {
      return (
        <div
          className={`drawer-handle${this.props.isVisible ? ' hide' : ''}`}
          style={this.props.handleStyles}
        >
          <img
            className="chata-bubbles-icon"
            src={chataBubblesSVG}
            alt="chata.ai"
            height="22px"
            width="22px"
            draggable="false"
          />
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

  scrollToBottom = () => {
    if (this.scrollComponent) {
      this.scrollComponent.scrollToBottom()
    }
    // Required to make animation smooth
    setTimeout(() => {
      if (this.scrollComponent) {
        this.scrollComponent.scrollToBottom()
      }
    }, 50)
  }

  onInputSubmit = text => {
    this.addRequestMessage(text)
    this.setState({ isChataThinking: true })
  }

  onSuggestionClick = suggestion => {
    this.addRequestMessage(suggestion)
    this.setState({ isChataThinking: true })

    if (suggestion === 'None of these') {
      setTimeout(() => {
        this.addResponseMessage({ content: 'Thank you for your feedback.' })
        this.setState({ isChataThinking: false })
      }, 1000)
      return
    }

    runQuery(
      suggestion,
      this.props.demo,
      this.props.enableSafetyNet,
      this.props.domain,
      this.props.apiKey,
      this.props.customerId,
      this.props.userId
    )
      .then(response => {
        this.onResponse(response)
      })
      .catch(error => {
        this.onResponse(error)
      })
  }

  onResponse = response => {
    this.addResponseMessage({ response })
    this.setState({ isChataThinking: false })
    if (this.chatBarRef) {
      this.chatBarRef.focus()
    }
  }

  getgroupByObjectFromTable = (rowData, origColumns, forceDateAxis) => {
    const jsonData = {}
    let columns = [...origColumns]

    if (!columns[0]) {
      return
    }

    if (forceDateAxis) {
      // Swap first two columns if second one is DATE and first is not
      // rowData is already swapped here if necessary so don't swap again.
      if (
        columns[1] &&
        ((columns[0].type !== 'DATE' && columns[1].type === 'DATE') ||
          (columns[0].type !== 'DATE_STRING' &&
            columns[1].type === 'DATE_STRING'))
      ) {
        columns = [columns[1], columns[0], ...columns.slice(2)]
      }
    }

    columns.forEach((column, index) => {
      if (column.groupable) {
        const columnName = column.name
        if (column.type === 'DATE') {
          jsonData[columnName] = `${rowData[index]}`
        } else {
          jsonData[columnName.toLowerCase()] = `${rowData[index]}`
        }
      }
    })
    return jsonData
  }

  processDrilldown = (rowData, columns, queryID, singleValueResponse) => {
    if (this.props.enableDrilldowns) {
      const groupByObject = this.getgroupByObjectFromTable(
        rowData,
        columns,
        true
      )

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

  clearMessages = () => {
    this.setState({
      messages: [this.introMessageObject],
      lastMessageId: 'intro'
    })
  }

  createErrorMessage = content => {
    return {
      content:
        content ||
        'Oops... Something went wrong with this query. Please try again. If the problem persists, please contact the customer success team.',
      id: uuid.v4(),
      type: 'error',
      isResponse: true
    }
  }

  createMessage = (response, content) => {
    const id = uuid.v4()
    this.setState({ lastMessageId: id })
    return {
      content,
      response,
      id,
      type:
        response &&
        response.data &&
        response.data.data &&
        response.data.data.displayType,
      isResponse: true
    }
  }

  updateMessageDisplayType = (id, displayType) => {
    const newMessages = this.state.messages.map(message => {
      if (message.id === id) {
        return {
          ...message,
          displayType
        }
      }
      return message
    })
    this.setState({ messages: newMessages })
  }

  addRequestMessage = text => {
    let currentMessages = this.state.messages
    if (
      this.props.maxMessages > 1 &&
      this.state.messages.length === this.props.maxMessages
    ) {
      // shift item from beginning of messages array
      currentMessages.shift()
    }

    const message = {
      content: text,
      id: uuid.v4(),
      isResponse: false
    }
    this.setState({
      messages: [...currentMessages, message]
    })
    this.scrollToBottom()
  }

  addResponseMessage = ({ response, content }) => {
    let currentMessages = this.state.messages
    if (
      this.props.maxMessages > 1 &&
      this.state.messages.length === this.props.maxMessages
    ) {
      currentMessages.shift()
    }

    let message = {}
    if (response && response.error && response.error === 'cancelled') {
      message = this.createErrorMessage('Query Cancelled.')
    } else if (response && response.error && response.error === 'parse error') {
      // Invalid response JSON
      message = this.createErrorMessage()
    } else if (!response && !content) {
      message = this.createErrorMessage()
    } else {
      message = this.createMessage(response, content)
    }
    this.setState({
      messages: [...currentMessages, message]
    })
    this.scrollToBottom()
  }

  setActiveMessage = id => {
    this.setState({ activeMessageId: id })
  }

  setChatBarRef = ref => {
    this.chatBarRef = ref
  }

  renderHeaderContent = () => {
    return (
      <Fragment>
        <div className="chata-header-left-container">
          <button
            onClick={this.props.onHandleClick}
            className="chata-button close"
            data-tip="Close Drawer"
            data-for="chata-header-tooltip"
          >
            <MdClose />
          </button>
        </div>
        <div className="chata-header-center-container">{this.props.title}</div>
        <div className="chata-header-right-container">
          <button
            onClick={() => {
              this.clearMessages()
              if (this.chatBarRef) {
                this.chatBarRef.focus()
              }
            }}
            className="chata-button clear-all"
            data-tip="Clear Messages"
            data-for="chata-header-tooltip"
          >
            <FaRegTrashAlt />
          </button>
        </div>
      </Fragment>
    )
  }

  render = () => {
    return (
      <Fragment>
        <style>{`${rcStyles}`}</style>
        <style>{`${styles}`}</style>
        <style>{`${chataTableStyles}`}</style>
        <style>{`${messageStyles}`}</style>
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
          keyboard={false}
          // onKeyDown={this.escFunction}
        >
          <div className="chata-drawer-content-container">
            <div className="chat-header-container">
              {this.renderHeaderContent()}
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
                      processDrilldown={this.processDrilldown}
                      isResponse={message.isResponse}
                      isChataThinking={this.state.isChataThinking}
                      onSuggestionClick={this.onSuggestionClick}
                      content={message.content}
                      scrollToBottom={this.scrollToBottom}
                      lastMessageId={this.state.lastMessageId}
                      tableBorderColor={
                        this.props.theme === 'light'
                          ? this.LIGHT_THEME['--chata-drawer-border-color']
                          : this.DARK_THEME['--chata-drawer-border-color']
                      }
                      tableHoverColor={
                        this.props.theme === 'light'
                          ? this.LIGHT_THEME['--chata-drawer-hover-color']
                          : this.DARK_THEME['--chata-drawer-hover-color']
                      }
                      displayType={
                        message.displayType ||
                        (message.response &&
                          message.response.data &&
                          message.response.data.data &&
                          message.response.data.data.displayType)
                      }
                      response={message.response}
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
              <div className="watermark">{bubblesIcon} We run on Chata</div>
              <ChatBar
                ref={this.setChatBarRef}
                apiKey={this.props.apiKey}
                customerId={this.props.customerId}
                userId={this.props.userId}
                domain={this.props.domain}
                demo={this.props.demo}
                className="chat-drawer-chat-bar"
                onSubmit={this.onInputSubmit}
                onResponseCallback={this.onResponse}
                isDisabled={this.state.isChataThinking}
                enableAutocomplete={this.props.enableAutocomplete}
                enableSafetyNet={this.props.enableSafetyNet}
                enableVoiceRecord={this.props.enableVoiceRecord}
                autoCompletePlacement="top"
                showChataIcon={false}
                showLoadingDots={false}
              />
            </div>
          </div>
        </Drawer>
        <ReactTooltip
          className="chata-drawer-tooltip"
          id="chata-header-tooltip"
          effect="solid"
          delayShow={500}
        />
        <ReactTooltip
          className="chata-drawer-tooltip"
          id="chata-toolbar-btn-tooltip"
          effect="solid"
          delayShow={500}
          html
        />
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
