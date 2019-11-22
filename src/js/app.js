const Web3 = require('web3');
var web3 = new Web3();

const mIdNumber = 201690345;
var contracts = {};
var tmpAddress = "";
var selectedContract;

function initWeb3(){
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

    return initContract();
}

function initContract() {
    $.getJSON('js/json/Common.json', function(data) {
      contracts.globalContact = {};
      contracts.globalContact.address = data.globalContact.address;
      contracts.globalContact.abi = data.globalContact.abi;

      var ABI = web3.eth.contract(contracts.globalContact.abi);
      contracts.globalContact.instance = ABI.at(contracts.globalContact.address);
    });

    $.getJSON('js/json/Common.json', function(data) {
      contracts.deploySCContract = {};
      contracts.deploySCContract.address = data.deploySCContract.address;
      contracts.deploySCContract.abi = data.deploySCContract.abi;

      var ABI = web3.eth.contract(contracts.deploySCContract.abi);
      contracts.deploySCContract.instance = ABI.at(contracts.deploySCContract.address);
    });

    $.getJSON('js/json/Common.json', function(data) {
      contracts.summaryContract = {};
      contracts.summaryContract.address = "";
      contracts.summaryContract.abi = data.summaryContract.abi;
    });

    $.getJSON('js/json/Common.json', function(data) {
      contracts.tradingContract = {};
      contracts.tradingContract.address = "";
      contracts.tradingContract.abi = data.tradingContract.abi;
    });
}

// Create new user account
function createNewUser(inUserName, inIDnumber, inUserAddr, inType, inPassword){
  try{
    if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
      var hash =  contracts.deploySCContract.instance.deploy(inUserAddr, {from: web3.eth.coinbase, gas: 2100000});
      while(true){
        if(web3.eth.getTransactionReceipt(hash) != null){
          tmpAddress = contracts.deploySCContract.instance.getAddress();
          alert("Transaction successfully with result:\n" + tmpAddress);
          break;
        }
      }
    }
    if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
      var hash = contracts.globalContact.instance.newRegistor.sendTransaction(inUserName, inIDnumber, inUserAddr, tmpAddress, inType, {from: web3.eth.coinbase, gas: 500000})
      console.log(hash);
    }
  } catch {
    throw "Unknown error!";
  }
}
  
// Get user information
function getUserInfo(inData){
  var type = typeof inData;
  var ret = null;
  if(type == "number"){
      ret = contracts.globalContact.instance.getUserInfoByID(inData);
  } else if(type == "string"){
      ret = contracts.globalContact.instance.getUserInfoByAddr(inData);
  }
  return ret;
}

// Create new contract
function createNewContract(inSellerAddr, inContractName, inPassword){
  try{
    // Get current account sc address
    var address = getUserInfo(web3.eth.coinbase)[2];
    // Create sc instance
    var ABI = web3.eth.contract(contracts.summaryContract.abi);
    var instance = ABI.at(address);
    const prevContractNum = instance.getMainContractLen();

    if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
        var hash = instance.createNewContract.sendTransaction(inSellerAddr, inContractName, {from: web3.eth.coinbase, gas: 1700000})
        console.log(hash);
        while(true){
          if(web3.eth.getTransactionReceipt(hash) != null){
              break;
          }
        }
        if(instance.getMainContractLen() == prevContractNum+1){
          alert("Successfully created new contract!")
        }
    } else {
        throw "Incorrect password!";
    }

    // Get contract address
    var contractAddr = instance.getContractInfoAtIndex(instance.getMainContractLen()-1)[1];
    // Get seller summary contract
    instance = ABI.at(contracts.globalContact.instance.getUserInfoByAddr(inSellerAddr)[2]);
    if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
        hash = instance.addTempContract(contractAddr, inContractName, {from: web3.eth.coinbase, gas: 500000});
        console.log(hash);
    } else {
        throw "Incorrect password!";
    }
  } catch {
    throw "Unknown error";
  }
}

// Get waiting for process contract length
function getTempContractLen(){
  // Create sc instance
  var ABI = web3.eth.contract(contracts.summaryContract.abi);
  var instance = ABI.at(getUserInfo(web3.eth.coinbase)[2]);
  return instance.getTempContractLen();
}

// Get waiting for process contract information at index
function getTempContractAtIndex(inIndex){
  // Create sc instance
  var ABI = web3.eth.contract(contracts.summaryContract.abi);
  var instance = ABI.at(getUserInfo(web3.eth.coinbase)[2]);
  return instance.getTempContractAtIndex(inIndex);
}

// Delete temporary contract at index
function delTempContractAtIndex(inIndex, inPassword){
  // Create sc instance
  var ABI = web3.eth.contract(contracts.summaryContract.abi);
  var instance = ABI.at(getUserInfo(web3.eth.coinbase)[2]);
  const prevContractNum = instance.getTempContractLen();
  if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
      var hash = instance.delTempContractAtIndex(inIndex, {from: web3.eth.coinbase, gas: 200000});
      console.log(hash);
      while(true){
        if(web3.eth.getTransactionReceipt(hash) != null){
            if(instalce.getTempContractLen() == prevContractNum-1){
              alert("Successfully remove temporary contract at " + inIndex);
            }
            break;
        }
      }
  } else {
      throw "Incorrect password!";
  }
}

// Add temporary contract to main contract list
function addTempContract2List(inIndex, inPassword){
  // Create sc instance
  var ABI = web3.eth.contract(contracts.summaryContract.abi);
  var instance = ABI.at(getUserInfo(web3.eth.coinbase)[2]);
  var prevTempNum = instance.getTempContractLen();
  var prevMainNum = instance.getMainContractLen();
  if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
    var hash = instance.addTempContract2List(inIndex, {from: web3.eth.coinbase, gas: 300000});
    console.log(hash);
    while(true){
      if(web3.eth.getTransactionReceipt(hash) != null){
        if(instance.getTempContractLen() == prevTempNum-1 && instance.getMainContractLen() == prevMainNum+1){
          alert("Successfully add temporary contract to list");
        }
        break;
      }
    }
  } else {
      throw "Incorrect password!";
  }
}

// Get main contract information at index
function getContractInfoAtIndex(inIndex){
  // Create sc instance
  var ABI = web3.eth.contract(contracts.summaryContract.abi);
  var instance = ABI.at(getUserInfo(web3.eth.coinbase)[2]);
  return instance.getContractInfoAtIndex(inIndex);
}

// Get main contract length
function getMainContractLen(){
  // Create sc instance
  var ABI = web3.eth.contract(contracts.summaryContract.abi);
  var instance = ABI.at(getUserInfo(web3.eth.coinbase)[2]);
  return instance.getMainContractLen();
}

// Disable contract at index
function disableContractAtIndex(inIndex, inPassword){
  // Create sc instance
  var ABI = web3.eth.contract(contracts.summaryContract.abi);
  var instance = ABI.at(getUserInfo(web3.eth.coinbase)[2]);
  if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
    var hash = instance.disableContractAtIndex(inIndex, {from: web3.eth.coinbase, gas: 200000});
    console.log(hash);
    while(true){
      if(web3.eth.getTransactionReceipt(hash) != null){
        if(instance.getContractInfoAtIndex(inIndex)[3] == 0){
          alert("Successfully disable contract!");
        }
        break;
      }
    }
  } else {
      throw "Incorrect password!";
  }
}

// Select contract in list
function selectContractAtIndex(inIndex){
  // Create sc instance
  var ABI = web3.eth.contract(contracts.summaryContract.abi);
  var instance = ABI.at(getUserInfo(web3.eth.coinbase)[2]);
  ABI = web3.eth.contract(contracts.tradingContract.abi);
  selectedContract = ABI.at(instance.getContractInfoAtIndex(inIndex)[2]);
}

// 150000 gas
function sendConfirmation(inConfirm, inPassword){
  if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
    var hash = selectedContract.sendConfirmation(inConfirm, {from: web3.eth.coinbase, gas: 150000})
    while(true){
      if(web3.eth.getTransactionReceipt(hash) != null){
        alert("Successfully update contract!");
        break;
      }
    }
  }
}

// 400000 gas
function updateOption(inOption, inPassword){
  if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
    var hash = selectedContract.updateOption(inOption, {from: web3.eth.coinbase, gas: 400000})
    while(true){
      if(web3.eth.getTransactionReceipt(hash) != null && inOption == selectedContract.getOptions()){
        alert("Successfully update contract!");
        break;
      } else {
        alert("Failed!");
        break;
      }
    }
  }
}

function getOption(){
  return selectedContract.getOptions();
}

// 150000 gas
function updateFixedPrice(inPrice, inDiscount, inType, inInsurance, inExtra, inPassword){
  if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
    var hash = selectedContract.updateFixedPrice(inPrice, inDiscount, inType, inInsurance, inExtra, {from: web3.eth.coinbase, gas: 200000})
    while(true){
      if(web3.eth.getTransactionReceipt(hash) != null){
        alert("Successfully update contract!");
        break;
      }
    }
  }
}

function getFixedPrice(){
  return selectedContract.getFixedPrice();
}

function updateReceipt(inReceipt, inPassword){
  if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
    var hash = selectedContract.updateReceipt(inReceipt, {from: web3.eth.coinbase, gas: 170000})
    while(true){
      if(web3.eth.getTransactionReceipt(hash) != null){
        alert("Successfully update contract!");
        break;
      }
    }
  }
}

function updateBuyerDocument(inDoc1, inDoc2, inPassword){
  if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
    var hash = selectedContract.updateBuyerDocument(inDoc1, inDoc2, {from: web3.eth.coinbase, gas: 180000})
    while(true){
      if(web3.eth.getTransactionReceipt(hash) != null){
        alert("Successfully update contract!");
        break;
      }
    }
  }
}

function updateSellerDocument(inDoc3, inPassword){
  if(web3.personal.unlockAccount(web3.eth.coinbase, inPassword)){
    var hash = selectedContract.updateSellerDocument(inDoc3, {from: web3.eth.coinbase, gas: 170000})
    while(true){
      if(web3.eth.getTransactionReceipt(hash) != null){
        alert("Successfully update contract!");
        break;
      }
    }
  }
}

function getDocumentInfo(){
  return selectedContract.getDocumentInfo();
}

function getConfirmationStatus(){
  return selectedContract.getConfirmationStatus();
}

function getContractStatus(){
  return selectedContract.getContractStatus();
}

initWeb3()
//Display user info
//var myVar = setInterval(timerHandler, 100);
function timerHandler(){
    // Set default account
    // document.getElementById("username").innerHTML = contracts.globalContact.instance.getUserInfoByAddr(web3.eth.coinbase)[0];
    // document.getElementById("balance").innerHTML = web3.fromWei(web3.eth.getBalance(web3.eth.coinbase), 'ether').toFixed(2);
}
