import React, {Component} from 'react';
import Choice from './Choice.js';

class Question extends Component{
	render(){
		const choiceComponents = this.props.choices.map((choice, index) => {
			return <Choice index={index} choice={choice} />
		});

		return(
			<div className="questions">
				<p>{this.props.questionText}</p>
				<div className="button-container">
					{choiceComponents}
				</div>
			</div>
		);
	}
}

export default Question;