App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Prescription.json", function(prescription) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Prescription = TruffleContract(prescription);
      // Connect provider to interact with contract
      App.contracts.Prescription.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Prescription.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393

      //Change 
      instance.Event({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var prescriptionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account (Doctor) : " + account);
      }
    });

    // Load contract data
    App.contracts.Prescription.deployed().then(function(instance) {
      
      prescriptionInstance = instance;
      return prescriptionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      
      loader.hide();
      content.show();
;
      var prescriptionResult = $("#prescriptionResult");
      prescriptionResult.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        
        prescriptionInstance.candidates(i).then(function(prescribe) {

          var id = prescribe[0];
          var pname = prescribe[1];
          var dname = prescribe[2];
          var data = prescribe[3];
          d=JSON.parse(data);
          // Render prescribe Result
          var prescribeTemplate = "<tr><th>" + id + "</th><td>" + pname + "</td><td>" + dname + "</td><td>"+d.data+"</td></tr>"
          prescriptionResult.append(prescribeTemplate);
        });
      }
    })
  },

  castVote: function() {
    var d = $('#inputData').val();
    var data =JSON.stringify({data:d});
    App.contracts.Prescription.deployed().then(function(instance) {
      return instance.vote(0xbE662B269e3Fd573721286E7d33de192fA1a526B,data, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
