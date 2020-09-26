import React from 'react';
import './App.css';
import $ from 'jquery'
import axios from 'axios'
import '@zoomus/websdk/dist/css/bootstrap.css';
import { ZoomMtg } from '@zoomus/websdk';
import { GET_ZOOM_USER_CREDENTIALS, setLocalKeyValue, getLocalKeyValue } from './Helper'

console.log(ZoomMtg.checkSystemRequirements())

// it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
ZoomMtg.setZoomJSLib('https://source.zoom.us/1.8.0/lib', '/av'); // CDN version default
//ZoomMtg.setZoomJSLib('../node_modules/@zoomus/websdk/dist/lib', '/av'); // Local version default, Angular Project change to use cdn version
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();


export default class App extends React.Component {
	constructor(props) {
		super(props)

		if (window.location.pathname == '/close')
			return window.close();
		// else {
		// 	let params = window.location.pathname.substring(1)

		// 	this.handleRoute(params)
		// }

		this.state = {
			error: { status: false, msg: '' },
			fetching: true,
			systemReq: ZoomMtg.checkSystemRequirements()
		}
	}

	handleRoute = (params) => {
		let origin = window.location.origin
		let keys = params.split('/')

		if (keys.length == 2) {
			setLocalKeyValue('zoom_attachment', keys[0])
			window.location.replace(origin + '/' + keys[1])
		} else {
			try {
				if (!getLocalKeyValue('zoom_attachment', null) || (getLocalKeyValue('zoom_attachment', null) != JSON.parse(atob(params)).attachment_id))
					this.setState({ error: { status: true, msg: 'Invalid Access. Please try again by joining from Lecture.' } })
				else
					this.setState({ params: JSON.parse(atob(params)) }, this.fetchZoomCreds)

			} catch (e) {
				this.setState({ error: { status: true, msg: 'Invalid URL. Please try again by joining from Lecture.' } })

			}

		}
	}

	componentDidMount() {
		if (!this.state.params)
			this.handleRoute(window.location.pathname.substring(1))
	}

	fetchZoomCreds = () => {
		if (this.state.params && this.state.params.host_userid) {
			this.setState({ fetching: true })

			axios.get(GET_ZOOM_USER_CREDENTIALS, {
				params: {
					user_id: this.state.params.host_userid,
					signature: 1,
					meetingNumber: this.state.params.meetingId
				}
			}).then((response) => {
				this.setState({ fetching: false })
				let resp = {}
				if (response && response.data) {
					if (response.data.error)
						resp = { error: { status: true, msg: 'Missing Host Credential' } }
					else
						resp = { keys: JSON.parse(atob(response.data.keys)) }

				} else {
					resp = { error: { status: true, msg: 'Something went wrong' } }
				}
				this.setState(resp)

			})
		} else {
			this.setState({
				error: { status: true, msg: 'Incomplete Meeting Information' }
			})
		}

	}

	handleJoin = () => {
		const meetConfig = {
			apiKey: this.state.keys.apikey,
			signature: this.state.keys.signature,
			//apiSecret: this.state.keys.apisecret,
			meetingNumber: this.state.params.meetingId,
			userName: this.state.params.userName,
			passWord: this.state.params.meetingPwd,
			leaveUrl: '/close',
			role: 0
		};

		// ZoomMtg.generateSignature({
		// 	meetingNumber: meetConfig.meetingNumber,
		// 	apiKey: meetConfig.apiKey,
		// 	apiSecret: meetConfig.apiSecret,
		// 	role: meetConfig.role,
		// 	success(res) {
				//console.log('signature', res.result);
				ZoomMtg.init({
					debug: false,
					leaveUrl: '/close',
					showMeetingHeader: false, 
					disableInvite: true,
					meetingInfo: ['topic','host'],
					success() {
						ZoomMtg.join(
							{
								meetingNumber: meetConfig.meetingNumber,
								userName: meetConfig.userName,
								signature: meetConfig.signature,
								apiKey: meetConfig.apiKey,
								passWord: meetConfig.passWord,
								success() {
									$('#nav-tool').hide();
									ZoomMtg.showInviteFunction({
										show: false
									});
									//console.log('join meeting success');

									//Hide Meeting Information Icon
									$('button.meeting-info-icon__icon-wrap').hide()
									//Hide Info Overlay too
									$('.meeting-info-icon__recreate-paper').hide()
									//Hide Phone Call Option
									$('#dialog-join button[aria-label*="Phone Call"]').hide()
								},
								error(res) {
									//console.log(res);
								}
							}
						);
					},
					error(res) {
						//console.log(res);
					}
				});
		// 	}
		// });
	}

	render() {
		return (
			<nav id="nav-tool" className="navbar navbar-inverse navbar-fixed-top">
				<div className="container">
					{/* <div className="navbar-header">
						Live Classes
					</div> */}
					{this.state.error.status ?
						<h4 className='text-danger text-center' style={{ margin: '60px 0', color: '#ffff00' }}>{this.state.error.msg}</h4>
						:
						<div id="navbar">
							{this.state.systemReq && this.state.systemReq.browserName == 'Safari' ? 
								<h4 className='text-danger text-center' style={{ margin: '30px 0', color: '#ffff00' }}>Safari Browser doesn't support Audio and ScreenShare. Please use another browser eg. Chrome to join Live Class.</h4>
								:
								null
							}
							<div className='text-center' style={{ margin: '15px 0' }}>
								{this.state.fetching ?
									<span style={{ color: '#FFFFFF' }}>Loading...</span>
									:
									<button className="btn btn-primary" onClick={this.handleJoin}>
										<svg className="bi bi-person-plus-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
											<path fillRule="evenodd" d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 100-6 3 3 0 000 6zm7.5-3a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 010-1H13V5.5a.5.5 0 01.5-.5z" clipRule="evenodd" />
											<path fillRule="evenodd" d="M13 7.5a.5.5 0 01.5-.5h2a.5.5 0 010 1H14v1.5a.5.5 0 01-1 0v-2z" clipRule="evenodd" />
										</svg>
										{' Join as ' + this.state.params.userName}
									</button>
								}

							</div>
						</div>
					}
				</div>
			</nav>

		)
	}
}
