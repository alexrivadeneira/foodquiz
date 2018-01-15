import React, { Component } from 'react';
import './App.css';


let productBarcodes = [
"0016000275713",
"0051000012517",
"0011110001207",
"0020735420959",
"0076186000028",
"0028400090896",
"0070470003023",
"0018894360155",
"0048121277079",
"0077330530057",
"0688267043918",
"0888109110109",
"0037600110754",
"0048500301029",
"0039000081047",
"0085239042311",
];

// let questions = [
// { id: 0
  // questionText: "text",
//   data: "ingredients[0].id",
//   answer: "answer",
//   choices: ["item1", "item2", "item3", "item4"],
// }

// "What is the main ingredient?",
// "What is the percentage daily value in one serving of sodium?",
// "What is the percentage daily value in one serving of fiber?",
// "What is the percentage daily value in one serving of sugar?",
// ];




const URL_BASE = 'https://world.openfoodfacts.org/api/v0/product/';
const URL_SUFF = '.json';

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      product: null,
      questionText: null,
      questionAnswer: null,
      questionChoices: [],
      questionTypes: [],
      score: 0,
      correctResponse: null,
    };

    this.nextQuestion = this.nextQuestion.bind(this);
    this.onChooseResponse = this.onChooseResponse.bind(this);
    this.questionBuilder = this.questionBuilder.bind(this);
    this.setQuestionData = this.setQuestionData.bind(this);
    this.possibleQuestionTypesGen = this.possibleQuestionTypesGen.bind(this);
    this.fetchProductData = this.fetchProductData.bind(this);
    // this.questionGenerator = this.questionGenerator.bind(this);
  }

  fetchProductData(number){
    let url = `${URL_BASE}${number}${URL_SUFF}`;
    fetch(url)
      .then(response => response.json())
      .then(result => this.setQuestionData(result))
      .catch(e => e);
  }

  // setProductData(result){
  //   // console.log("result1: ", result);
  //   this.setState({product: result.product});
  //   console.log("result2:", result.product);
  //   this.questionGenerator(this.state.product);
  // }

  setQuestionData(result){
    // Runs after mounting
    this.setState({product: result.product});

    let questionTypes = this.possibleQuestionTypesGen(this.state.product);
    let randomQuestionIdx = randomSelect(questionTypes.length);

    this.questionBuilder(this.state.product, questionTypes[randomQuestionIdx]);
    // this.setState({questionTypes: questionTypes});
  }

  questionBuilder(data, type){
    // update this to throw errors in case data isn't here
    let questionText, questionAnswer;
    let questionChoices = null;    
    switch(type){
      case "ingredients":
        questionText = "What's the main ingredient?";
        questionAnswer = data.ingredients[0].text.toLowerCase();
        for(let i = 0; i < 4; i++){
          questionChoices.push(data.ingredients[i].text.toLowerCase());
        }        
        break;
      case "protein":
        questionText = "How many grams of protein in a single serving? (Remember: Recommended is 56 g for men, 46 for women)";  
        questionAnswer = data.nutriments.proteins_serving;
        questionChoices = genDistractors(questionAnswer);         
        break;
      case "sugar":
        questionText = "How many grams of sugar in a single serving? (Remember: Recommended is 38g for men, 25g for women)";
        questionAnswer = data.nutriments.sugars_serving; 
        questionChoices = genDistractors(questionAnswer);
        break;
      case "salt":
        questionText = "How many milligrams of salt in a single serving? (Remember:   Recommended is less than 2400 mg per day!)";
        questionAnswer = data.nutriments.sodium_value; 
        questionChoices = genDistractors(questionAnswer);        
        break;
    }

    let shuffledChoices = shuffle(questionChoices);

    this.setState({
      questionText: questionText,
      questionAnswer: questionAnswer,
      questionChoices: questionChoices, 
    })
      
  }

  nextQuestion(){
    //update/reset various state items
    shuffle(productBarcodes);
    // let randomIdx = randomSelect(productBarcodes.length);
    this.fetchProductData(productBarcodes[productBarcodes.length - 1]);
    productBarcodes.pop();
    console.log(productBarcodes);

    this.setState({correctResponse: null});
  }

  possibleQuestionTypesGen(product){
    console.log("running");
    let types = [];
    if(product.ingredients.length >= 4){
      types.push("ingredients");
    }
    if(product.nutriments.proteins_serving){
      types.push("protein");
    }
    if(product.nutriments.salt_serving){
      types.push("salt");
    }
    if(product.nutriments.sugars_serving){
      types.push("sugar");
    }

    return types;
  }

  onChooseResponse(choice){
    console.log(choice, this.state.questionAnswer);
    if(!this.state.correctResponse){
      if(choice === this.state.questionAnswer){
          this.setState({score: this.state.score + 1});
          this.setState({correctResponse: 1});
      } else {
        this.setState({correctResponse: 2});
        console.log(this.state.score);
      }
    }

  }

  componentDidMount(){
    const {product} = this.state;
    let randomIdx = randomSelect(productBarcodes.length);
    this.fetchProductData(productBarcodes[randomIdx]);

  }

  render() {
    const product = this.state.product;
    const questions = this.state.questions;
    const questionText = this.state.questionText;
    const questionChoices = this.state.questionChoices;
    const correctResponse = this.state.correctResponse;
    const questionAnswer = this.state.questionAnswer;

    return (
      <div className="App">
        <div className="score">
          <h4>Current Score: {this.state.score}</h4>
        </div>
        <div>
          {product ? 
            <div className="product">
              <h3>{product.product_name}</h3>
              <img 
                className="productImg"
                src={product.image_small_url}
                alt={product.product_name} 
              />
            </div>
            : <p>Loading...</p>
          }
        </div>
        <div className="questions">
            <p>{questionText}</p> 
            {questionChoices.map(choice =>
              <div key={choice}>
                <button 
                  onClick={() => this.onChooseResponse(choice)}
                  >{choice}
                </button>
              </div>
            )}
        </div>
        <div className="feedback">
          { correctResponse ? 
            ( correctResponse === 1 ? 
              <div>
                <p>Good job!</p>
                <button
                  onClick={ ()=> this.nextQuestion() }
                >Next</button>                
              </div>
              :
              <div>
                <p>WRONG</p>
                <button
                  onClick={ ()=> this.nextQuestion() }
                >Next</button> 
              </div>             
            ) :
            <p>Awaiting result</p>
          }
        </div>
      </div>
    );
  }
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function randomSelect(num){
  return Math.floor(Math.random() * num);
}

function sodiumPercentage(g){
  let mg = parseFloat(g) * 1000;
  return Math.floor(parseFloat(mg) / 2300);
}

function genDistractors(questionAnswer){
  let questionChoices = [];
  questionChoices.push(questionAnswer);
  
  let val = [2,3,5,10,100];
  let modifier = ["add", "sub", "mult", "mult", "mult", "mult", "div", "div"];

  while(questionChoices.length < 4){
    let newdistractor = mod(questionAnswer, val[randomSelect(val.length - 1)], modifier[randomSelect(modifier.length - 1)]);
    console.log("NEWDIS", newdistractor);
    if(!questionChoices.includes(newdistractor)){
      questionChoices.push(newdistractor);
    }
  }

  return questionChoices;

  function mod(start, val, dir){
    switch(dir){
      case "add":
        return start + val;
      case "sub":
        return start - val;
      case "mult":
        return start * val;
      case "div":
        return Math.floor(parseFloat(start) / val);
    }
  }

  
}
export default App;
