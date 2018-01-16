import React, { Component } from 'react';
import './App.css';

let barcodes = [
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
      endGame: false,
      questionsAttempted: 0,
      quizLength: 2,
      productBarcodes: barcodes,
    };

    this.removeLastProduct = this.removeLastProduct.bind(this);
    this.chooseRandomProduct = this.chooseRandomProduct.bind(this);
    this.resetQuiz = this.resetQuiz.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.onChooseResponse = this.onChooseResponse.bind(this);
    this.questionBuilder = this.questionBuilder.bind(this);
    this.setQuestionData = this.setQuestionData.bind(this);
    this.possibleQuestionTypesGen = this.possibleQuestionTypesGen.bind(this);
    this.fetchProductData = this.fetchProductData.bind(this);
  }

  fetchProductData(number){
    let url = `${URL_BASE}${number}${URL_SUFF}`;
    fetch(url)
      .then(response => response.json())
      .then(result => this.setQuestionData(result))
      .catch(e => e);
  }

  setQuestionData(result){
    // Runs after mounting
    this.setState({product: result.product});
    let questionTypes = this.possibleQuestionTypesGen(this.state.product);
    let randomQuestionIdx = randomSelect(questionTypes.length);
    this.questionBuilder(this.state.product, questionTypes[randomQuestionIdx]);
  }

  resetQuiz(){
    console.log("Resetting");
  }

  questionBuilder(data, type){
    // update this to throw errors in case data isn't here
    let questionText, questionAnswer;
    let questionChoices = [];    
    switch(type){
      case "ingredients":
        questionText = "What's the main ingredient?";
        questionAnswer = data.ingredients[0].text.toLowerCase();
        for(let i = 0; i < 4; i++){
          questionChoices.push(data.ingredients[i].text.toLowerCase());
        }        
        this.setState({questionAnswer: questionAnswer});
        break;
      case "protein":
        questionText = "How many grams of protein in a single serving? (Remember: Recommended is 56 g for men, 46 for women)";  
        questionAnswer = data.nutriments.proteins_serving;
        questionChoices = genDistractors(questionAnswer);  
        this.setState({questionAnswer: parseInt(questionAnswer, 10)});   
        break;
      case "sugar":
        questionText = "How many grams of sugar in a single serving? (Remember: Recommended is 38g for men, 25g for women)";
        questionAnswer = data.nutriments.sugars_serving; 
        questionChoices = genDistractors(questionAnswer);
        this.setState({questionAnswer: parseInt(questionAnswer, 10)});
        break;
      case "salt":
        questionText = "How many milligrams of salt in a single serving? (Remember:   Recommended is less than 2400 mg per day!)";
        questionAnswer = data.nutriments.sodium_value; 
        questionChoices = genDistractors(questionAnswer);  
        this.setState({questionAnswer: parseInt(questionAnswer, 10)});      
        break;
      default:
      //
    }

    this.setState({
      questionText: questionText,
      questionChoices: questionChoices, 
    })
      
  }

  nextQuestion(){
    //update/reset various state items
    const {productBarcodes} = this.state;
    let shuffledBarcodes = shuffle(productBarcodes);
    this.setState({productBarcodes: shuffledBarcodes});
    // let randomIdx = randomSelect(productBarcodes.length);
    let randomProduct = this.chooseRandomProduct();
    this.fetchProductData(randomProduct);
    this.removeLastProduct();
  }

  chooseRandomProduct(){
    const {productBarcodes} = this.state;
    let shuffledBarcodes = shuffle(productBarcodes);
    this.setState({productBarcodes: shuffledBarcodes});
    console.log(productBarcodes);
    return productBarcodes[0]; 
  }

  removeLastProduct(){
    const {productBarcodes} = this.state;
    let lessBarcodes = productBarcodes;
    lessBarcodes.splice(0,1);
    this.setState({productBarcodes: lessBarcodes});  
    console.log(productBarcodes);

  }

  possibleQuestionTypesGen(product){
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
    if(!this.state.correctResponse && !this.state.endGame){
      if(choice === this.state.questionAnswer){
          this.setState({score: this.state.score + 1});
          this.setState({correctResponse: 1});
      } else {
        this.setState({correctResponse: 2});
        console.log(this.state.score);
      }
      let questionsAttempted = this.state.questionsAttempted + 1;
      if(questionsAttempted > this.state.quizLength){
        this.setState({endGame: true});
      }
      this.setState({questionsAttempted: questionsAttempted});

      console.log("ATTEMPT:", questionsAttempted);
    }
  }

  componentDidMount(){
    const {productBarcodes} = this.state;
    let randomProduct = this.chooseRandomProduct();
    this.fetchProductData(randomProduct);
    this.removeLastProduct();
  }

  render() {
    const product = this.state.product;
    const questionText = this.state.questionText;
    const questionChoices = this.state.questionChoices;
    const correctResponse = this.state.correctResponse;
    const endGame = this.state.endGame;

    return (
      <div className="App">
        <div>
          { endGame &&
            <div className="endgame">
              <h2>You got {correctResponse} out of 10 questions correct!</h2>
              <button
                onClick = {() => this.resetQuiz()}
              >Retake the Quiz
              </button>
            </div>
          }
        </div>

        {!endGame &&
        <div>
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
              ) : <p></p>
            }
          </div>
        </div>
        }
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



function genDistractors(questionAnswer){
  let questionChoices = [];
  questionChoices.push(parseInt(questionAnswer, 10));
  
  let val = [2,3,5,10,100];
  let modifier = ["add", "sub", "mult", "mult", "mult", "mult", "div", "div"];

  while(questionChoices.length < 4){

    let newdistractor = mod(questionAnswer, val[randomSelect(val.length - 1)], modifier[randomSelect(modifier.length - 1)]);
    if(newdistractor > 0){
      if(!questionChoices.includes(parseInt(newdistractor,10))){
        questionChoices.push(parseInt(newdistractor, 10));
      }  
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
      default:
        //
    }
  }

  
}
export default App;
