var DeploySCContract = artifacts.require("DeploySCContract");
module.exports = function(deployer) {
  deployer.deploy(DeploySCContract);
};