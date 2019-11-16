App = {
    web3Provider: null,
    contracts: {},
  
    init: async function() {
      return await App.initWeb3();
    },
  
    initWeb3: async function() {
      // Modern dapp browsers...
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.enable();
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      }
      web3 = new Web3(App.web3Provider);
  
      //document.getElementById("balance").innerHTML = web3.fromWei(web3.eth.getBalance(web3.eth.coinbase), 'ether').toFixed(2);
  
      return App.initContract();
    },
  
    initContract: function() {
      $.getJSON('js/json/GlobalContact.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var globalContactData = data;
        App.contracts.globalContact = TruffleContract(globalContactData);
        App.contracts.globalContact.setProvider(App.web3Provider);
      });
  
      //return App.bindEvents();
    },
  
    createNewUser: function(inName, inIDnumber, inAccAddr, inType, inPassword){
      var globalContractInstance;
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
  
        App.contracts.globalContact.deployed().then(function(instance){
          globalContractInstance = instance;
          if(web3.personal.unlockAccount(account, inPassword)){
            globalContractInstance.newRegistor(inName, inIDnumber, inAccAddr, inType, {from: account});
          }
        }).then(function(result){
          console.log("Success!");
        }).catch(function(err){
          console.log(err.message);
        });
      });
    },
  
    getUserNameByID: function(inIDnumber){
      var globalContractInstance;
  
      App.contracts.globalContact.deployed().then(function(instance){
        globalContractInstance = instance;
        return globalContractInstance.getUserNameByID(inIDnumber);
      }).then(function(result){
        console.log("Success!");
      }).catch(function(err){
        console.log(err.message);
      });
    },
  
    // markAdopted: function(adopters, account) {
    //   /*
    //    * Replace me...
    //    */
    // },
  
    // handleAdopt: function(event) {
    //   event.preventDefault();
  
    //   var petId = parseInt($(event.target).data('id'));
  
    //   /*
    //    * Replace me...
    //    */
    // }
  
  };
  
  App.init()