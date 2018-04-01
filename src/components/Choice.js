import React, {Component} from 'react';

class Choice extends Component{
	render(){
		return(
			<div className={"button-container-inner"}>
				<button onClick={() => this.onChooseResponse(this.props.choice)}>
					{this.props.choice}
				</button>
			</div>
		);
	}
}

export default Choice;