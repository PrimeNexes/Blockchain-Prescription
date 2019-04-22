App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

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
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
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

    loader.hide();
    content.show();

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
      return prescriptionInstance.prescriptionCount();
    }).then(function(prescriptionsCount) {
      

      var prescriptionResult = $("#prescriptionResult");
      prescriptionResult.empty();
      var getPaitient = $("#inputPData").val();
      console.log(getPaitient);
      for (var i = 1; i <= prescriptionsCount; i++) {
      
        prescriptionInstance.prescriptions(i).then(function(prescribe) {
          
          var id = prescribe[0];
          var paddress = prescribe[1];
          var daddress = prescribe[2];
          var pname = prescribe[3];
          var dname = prescribe[4];
          var data = prescribe[5];
          var time = new Date(parseInt(prescribe[6])).toUTCString();
          d=JSON.parse(data);
          console.log(data);
          // Render prescribe Result
          // if(getPaitient == pname){
            var prescribeTemplate = "<tr><th>" + id + "</th><td>" + pname + "</td><td>" + dname + "</td><td>"+d.data+"</td><td>" + time + "</td></tr>"
            prescriptionResult.append(prescribeTemplate);
          // }
        });
      }
    })

  },

  castPrescription: function() {
    var d = $('#summernote').summernote('code');
    var data =JSON.stringify({data:d});
    var wallet = $('#inputData').val();
    var name = $('#inputPData').val();
    var time = new Date().getTime().toString();
    App.contracts.Prescription.deployed().then(function(instance) {
      return instance.prescribe(wallet,name,'Strange',data,time, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  getPatient: function() {
    $("#pWallet").append($("#paitientInputData").val());
    $("#content").show();
    $("#loader").hide();
  }
};

$(function() {
  $(window).load(function() {
    $('#summernote').summernote();
    App.init();
  });
});
