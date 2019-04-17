var Prescription = artifacts.require("./Prescription.sol");

module.exports = function(deployer) {
  deployer.deploy(Prescription);
};
