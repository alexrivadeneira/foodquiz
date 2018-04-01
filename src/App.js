import React, { Component } from 'react';
import './App.css';
import Question from './components/Question.js';

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
// "0085239042311",

];

const URL_BASE = 'https://world.openfoodfacts.org/api/v0/product/';
const URL_SUFF = '.json';
const QUIZ_LENGTH = 10;

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
      quizLength: QUIZ_LENGTH,
      productBarcodes: barcodes.slice(""),
      revealed: false,
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
    this.setState({
      productBarcodes: [...barcodes],
      endGame: false,
      score: 0,
      correctResponse: null,
      questionsAttempted: 0,
      revealed: false,
    }, function(){
      this.nextQuestion();
    });
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
        questionText = "How many grams of protein in a single serving? (Remember: Recommended daily intake is 56g for men, 46g for women)";  
        questionAnswer = data.nutriments.proteins_serving;
        questionChoices = genDistractors(questionAnswer);  
        this.setState({questionAnswer: parseInt(questionAnswer, 10)});   
        break;
      case "sugar":
        questionText = "How many grams of sugar in a single serving? According to the American Heart Association, the recommended daily intake is max 150 calories per day (37.5g or 9 teaspoons) for men, max 100 calories per day (25g or 6 teaspoons) for women.";
        questionAnswer = data.nutriments.sugars_serving; 
        questionChoices = genDistractors(questionAnswer);
        this.setState({questionAnswer: parseInt(questionAnswer, 10)});
        break;
      case "salt":
        questionText = "How many milligrams of salt in a single serving? The American Heart Association recommends no more than 2300mg a day and an ideal limit of no more than 1500mg per day for most adults. 2300mg is just about one teaspoon of salt.";
        questionAnswer = data.nutriments.sodium_value; 
        questionChoices = genDistractors(questionAnswer);  
        this.setState({questionAnswer: parseInt(questionAnswer, 10)});      
        break;
      default:
      //
    }

    this.setState({
      questionText: questionText,
      questionChoices: shuffle(questionChoices), 
    })
      
  }

  nextQuestion(){
    //update/reset various state items
    const {productBarcodes} = this.state;
    let shuffledBarcodes = shuffle(productBarcodes);
    this.setState({productBarcodes: shuffledBarcodes, revealed: false});
    // let randomIdx = randomSelect(productBarcodes.length);
    let randomProduct = this.chooseRandomProduct();
    this.fetchProductData(randomProduct);
    this.removeLastProduct();
    this.setState({correctResponse: null});
    
  }

  chooseRandomProduct(){
    const {productBarcodes} = this.state;
    let shuffledBarcodes = shuffle(productBarcodes);
    this.setState({productBarcodes: shuffledBarcodes});
    return productBarcodes[0]; 
  }

  removeLastProduct(){
    const {productBarcodes} = this.state;
    let lessBarcodes = productBarcodes;
    lessBarcodes.splice(0,1);
    this.setState({productBarcodes: lessBarcodes});  

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
    if(!this.state.correctResponse && !this.state.endGame){
      if(choice === this.state.questionAnswer){
          this.setState({score: this.state.score + 1});
          this.setState({correctResponse: 1});
          this.setState({revealed: true});
      } else {
        this.setState({correctResponse: 2});
        this.setState({revealed: true});
      }
      let questionsAttempted = this.state.questionsAttempted + 1;
      if(questionsAttempted >= this.state.quizLength){
        this.setState({endGame: true});
      }
      this.setState({questionsAttempted: questionsAttempted});
    }
  }

  componentDidMount(){
    let randomProduct = this.chooseRandomProduct();
    this.fetchProductData(randomProduct);
    this.removeLastProduct();
  }

  render() {
    const {revealed, product, questionText, questionChoices, correctResponse, endGame, score, quizLength, questionAnswer} = this.state;
    return (
      <div className="App">
      <h3 className="gameTitle shadow"><em>Nutrition Facts Quiz</em></h3>

        <Question 
          questionText={questionText} 
          choices={questionChoices} 
        />

        <div>
          { endGame &&
            <div className="endgame">
              <h2>You got {score} out of {quizLength} questions correct!</h2>
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
                <h3 className="foodTitle shadow"><em>{product.product_name}</em></h3>
                <img 
                  className={"productImg fancy-border"}
                  src={product.image_small_url}
                  alt={product.product_name} 
                />
              </div>
              : <p>Loading...</p>
            }
          </div>

          {revealed ? 
          <div className="questions">
              <p>{questionText}</p> 
              <div className="button-container">
                {questionChoices.map(choice =>
                  <div key={choice} 
                    className={"button-container-inner"}
                    >
                    <button 
                      className= { (choice === questionAnswer ? ' button-correct' : 'button-fail')}
                      onClick={() => this.onChooseResponse(choice)}
                      >{choice}
                    </button>
                  </div>
                )}
              </div>
          </div>
        :
          <div className="questions">
              <p>{questionText}</p> 
              <div className="button-container">
                {questionChoices.map(choice =>
                  <div key={choice} 
                    className={"button-container-inner"}
                    >
                    <button 
                      onClick={() => this.onChooseResponse(choice)}
                      >{choice}
                    </button>
                  </div>
                )}
              </div>
          </div>        
        }
          <div>
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
                  <p>Wrong answer!</p>
                  <button
                    onClick={ ()=> this.nextQuestion() }
                  >Next</button> 
                </div>             
              ) : <p></p>
            }
          </div>
        </div>
        }
        <div className="legal">
        <p>The food products data and pictures come from the collaborative, free and open <a href="http://openfoodfacts.org/" target="_blank"  rel="noopener noreferrer" >Open Food Facts</a> database. The data is available under the licence Open Database License and the photos are licensed under the licence Creative Commons Attribution Share-Alike.</p>
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

function genDistractors(questionAnswer){
  let questionChoices = [];
  questionChoices.push(parseInt(questionAnswer, 10));
  
  let val = [2,3,5,10,100];
  let modifier = ["mult", "mult", "mult", "mult", "div", "div"];

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
    // console.log(start, val, dir);
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
