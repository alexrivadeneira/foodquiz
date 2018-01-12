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
    };

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
    console.log("product from state", this.state.product);

    let questionTypes = this.possibleQuestionTypesGen(this.state.product);
    let randomQuestionIdx = randomSelect(questionTypes.length);

    this.questionBuilder(this.state.product, questionTypes[randomQuestionIdx]);
    console.log(questionTypes);
    // this.setState({questionTypes: questionTypes});
  }

  questionBuilder(data, type){
    // update this to throw errors in case data isn't here
    let questionText, questionAnswer;
    let questionChoices = [];    
    switch(type){
      case "ingredients":
        questionText = "What's the main ingredient?";
        questionAnswer = data.ingredients[0].text;
        for(let i = 0; i < 4; i++){
          questionChoices.push(data.ingredients[i].text.toLowerCase());
        }        
        break;
      case "protein":
        questionText = "How many grams of protein? (Recommended is 56 g for men, 46 for women)";  
        questionAnswer = data.nutriments.proteins_serving;
        questionChoices.push(questionAnswer);
        questionChoices.push(questionAnswer + 5);
        questionChoices.push(questionAnswer +10);
        questionChoices.push(Math.floor(parseFloat(questionAnswer) / 2) + 15); 
        break;
      case "sugar":
        questionText = "How much sugar? (Recommended is 38g for men, 25g for women)";
        questionAnswer = data.nutriments.sugars_serving; 
        questionChoices.push(questionAnswer);
        questionChoices.push(questionAnswer + 5);
        questionChoices.push(questionAnswer +10);
        questionChoices.push(Math.floor(parseFloat(questionAnswer) / 2) + 15);
        break;
      case "salt":
        questionText = "How many milligrams of salt? (Recommended is less than 2400 mg per day!)";
        questionAnswer = data.nutriments.sodium_value; 
        questionChoices.push(questionAnswer);
        questionChoices.push(questionAnswer + 5);
        questionChoices.push(questionAnswer +10);
        questionChoices.push(Math.floor(parseFloat(questionAnswer) / 2) + 15 );        
        break;
    }

    console.log(questionAnswer);
    let shuffledChoices = shuffle(questionChoices);

    this.setState({
      questionText: questionText,
      questionAnswer: questionAnswer,
      questionChoices: questionChoices, 
    })
      
  }

  // questionGenerator(data){

  //   this.setState({questionText: "What is the main ingredient?"});
    
  //   let questionChoices = [];
  //   for(let i = 0; i < 4; i++){
  //     console.log("running");
  //     questionChoices.push(data.ingredients[i].text.toLowerCase());
  //   }
  //   let shuffledQuestionChoices = shuffle(questionChoices);
  //   this.setState({questionChoices: shuffledQuestionChoices});

  //   let questionAnswer = data.ingredients[0].text;
  //   this.setState({questionAnswer: questionAnswer});

  // }

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

    return (
      <div className="App">
      <div>
        {product ? 
          <div className="product">
            <h2>{product.product_name}</h2>
            <img 
              src={product.image_small_url}
              alt={product.product_name} 
            />
          </div>
          : <p>Loading...</p>
        }
      </div>
      <div className="questions">
          <h3>{questionText}</h3> 
          {questionChoices.map(choice =>
            <div key={choice}>
              <p>{choice}</p>
            </div>
          )}
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
export default App;