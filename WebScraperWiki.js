var url = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=Programming_language';
var urlJson = 'https://gist.githubusercontent.com/Thessiah/fb969b429b4d6173916628c7d92bf6e4/raw/fb30bf33cbade43fd667c45437d4937b53ce868a/top1k.json';

//this function retrieves the words that we must ban from our lists
// The data is returned in an array of strings

const retrieveBannedWords = fetch(urlJson)
  .then((response) => response.json())
  .then((data) => data);

//This function scrapes the entire article and retrieves all the <p> 
//elements; Since WikiAPI is being used here to retrieve the response
//in a json format, we only need to use regular expression strategy
//to clear up the words within the articles

// this function retrieves the 1,000 word that we must ban
const retrieveArticleWords = fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(response){
    html_code = response["parse"]["text"]["*"];
    parser = new DOMParser();
    html = parser.parseFromString(html_code, "text/html");
    var nodeList = html.querySelectorAll(".mw-parser-output p");
    const nodeListArray = [... nodeList];
    let nodeListTest = nodeListArray.map(x => x.innerHTML);
    
    //we can now assign regular expression matching due to having the contents of the page as a string
    let regex = /(<(.*?)>)/g;
    let nodeListMod = nodeListTest.map(x => x.replace(regex,''));
    let sentences = nodeListMod.map(x => x.split(' '));
    var words = [];
    for (let i = 0; i < sentences.length; i++){
      words = words.concat(sentences[i])
    }
    //clear up the digits or any other strings that are not regular 
    //words
    words = words.map(x=> x.replace(/\W/g,''));
    
    //Lower casing enables us to have robustness with capital/lowecase 
    //letters
    words = words.map(x => x.toLowerCase());
    words.shift();
    
    //The dictionary is used to count the occurence of each word
    var glossary = {};
    

    for(let i = 0; i<words.length; i++){
      if (glossary.hasOwnProperty(words[i])){
        glossary[words[i]]++;
      } else{
        glossary[words[i]] = 1;
      }
    }
  
    let keys = Object.keys(glossary);
    let referenceArr = [];
    let lowestPossible = 0;
    for (let j = 0; j<keys.length; j++){
      referenceArr.push([glossary[keys[j]], keys[j]]);
    }
    //this is the array that returns a 2-dimmensional array that has 
    //around 1,000 entries. Each entry has two entires which is a   
    //string and an integer. String represents the word in the article, 
    // and the integer represents the number of occurences.
    return referenceArr;
  });
    

  
const replaceCommonText = async(str) => {
  const removeWordsList = await retrieveBannedWords;
  const articleWordsList = await retrieveArticleWords;
  var filteredList = [];
  //this for loop removes words that are in the top 1,000 words json
  for(let i = 0; i<articleWordsList.length; i++){
    if (removeWordsList.indexOf(articleWordsList[i][1]) === -1){
      filteredList.push(articleWordsList[i]);
    }
  }
  var finalWords = [];
  //threshold determines how many occurences should be the lower bound of picking up words
  // chose this value through testing the code until reaching an array of 25 words
  let threshold = 8;
  for(let i = 0; i<filteredList.length; i++){
    if(filteredList[i][0]>threshold){
      finalWords.push(filteredList[i]);
    }
  }
  //Removing any possible single-char strings
  finalWords = finalWords.filter(x => x[1].length > 1)
  
  str = str.toLowerCase();
  let arr = str.split(' ');
  let wordsOnly = [];
  for(let i = 0; i < finalWords.length; i++){
    wordsOnly.push(finalWords[i][1]);
  }
  //A dictionary to count the number of occurences of the twenty five words we have retrieved
  var counterGlossary = {};
  for(let i = 0; i < arr.length; i++){
    if(wordsOnly.indexOf(arr[i])!== -1){
      if(counterGlossary.hasOwnProperty(arr[i])){
        counterGlossary[arr[i]]++;
      } else{
        counterGlossary[arr[i]] = 1;
      }
    }
  }
  let wordCounter = [];
  let wordCounterWordsOnly = [];
  for(const prop in counterGlossary){
    wordCounterWordsOnly.push(prop);
    wordCounter.push([prop, counterGlossary[prop]]);
  }
  console.log(wordCounterWordsOnly)
  let modifiedWords = [];
  // this loop changes the words to the number of times they have occurred within the string
  for(let i = 0; i < arr.length; i++){
    if(wordCounterWordsOnly.indexOf(arr[i]) !== -1){
      let replacedWord = wordCounter.filter(x => x[0]==arr[i]);
      modifiedWords.push(replacedWord[0][1]);
    } else{
      modifiedWords.push(arr[i]);
    }
  }
  let modifiedString = modifiedWords.join(' ');
  
  
  console.log(modifiedString)
  
}

replaceCommonText("A PROGRAMMING language is a formal language comprising a set of strings that produce various kinds of machine code output. Programming languages are one kind of computer language, and are used in computer programming to implement algorithms.Most programming languages consist of instructions for computers. There are programmable machines that use a set of specific instructions, rather than general programming languages. Since the early 1800s, programs have been used to direct the behavior of machines such as Jacquard looms, music boxes and player pianos.[1] The programs for these machines (such as a player piano's scrolls) did not produce different behavior in response to different inputs or conditions.Thousands of different programming languages have been created, and more are being created every year. Many programming languages are written in an imperative form (i.e., as a sequence of operations to perform) while other languages use the declarative form (i.e. the desired result is specified, not how to achieve it).The description of a programming language is usually split into the two components of syntax (form) and semantics (meaning). Some languages are defined by a specification document (for example, the C programming language is specified by an ISO Standard) while other languages (such as Perl) have a dominant implementation that is treated as a reference. Some languages have both, with the basic language d");