import React from 'react'
import { Button, Header, Image, Modal } from 'semantic-ui-react'

function forceConfirmReducer(state, action) {
  switch (action.type) {
    case 'CONFIG_CLOSE_ON_DIMMER_CLICK':
      return { ...state, closeOnDimmerClick: action.value }
    case 'CONFIG_CLOSE_ON_ESCAPE':
      return { ...state, closeOnEscape: action.value }
    case 'OPEN_MODAL':
      return { ...state, open: true }
    case 'CLOSE_MODAL':
      return { ...state, open: false }
    default:
      throw new Error()
  }
}



export function LoginModal(props) {
  const [state, dispatch] = React.useReducer(forceConfirmReducer, {
    closeOnEscape: false,
    closeOnDimmerClick: false,
    open: true,
    dimmer: 'blurring',
  })
  const { open, closeOnEscape, closeOnDimmerClick } = state
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
 
  const changeHandler = (e) => {
    if (e.target.name === "username") setUsername(e.target.value)
    if (e.target.name === "password") setPassword(e.target.value)
  }

  let badLogin = null;
    if (props.loginFailed === true) {
      badLogin = (
      <div className="ui message red small " style={{margin: 10}}>
        Login failed &ensp; {props.errMsg}
    </div>
    )
  }

  
  return (
    <Modal
      closeOnEscape={closeOnEscape}
      closeOnDimmerClick={closeOnDimmerClick}
      open={props.loginOpenState}
      onOpen={() => dispatch({ type: 'OPEN_MODAL' })}
      onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
    >
      <Modal.Header>Inventory Login</Modal.Header>
      <Modal.Content>
        <Modal.Description>
        <form onSubmit={(e) => props.login(e) } name="upload">
		      <div className="ui input" style={{margin: 10}}>
            <input required placeholder="Username" value={username} type="text" name="username" maxLength="255" onChange={ (e) => { changeHandler(e); props.updateField(e)}}/>
          </div>
          
		      <div className="ui input" style={{margin: 10}}>
            <input required placeholder="Password" value={password} type="password" name="password" maxLength="255" onChange={ (e) => {changeHandler(e); props.updateField(e)}}/>
          </div>

		      <div className="ui input" style={{margin: 10}}>
            <button className="ui button" onClick={ (e) => props.login(e) }>Login</button>
          </div>
        {badLogin}
        </form>
				

        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>

      </Modal.Actions>
    </Modal>
  )
}



//export default ModalExampleModal