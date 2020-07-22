const Migrations = artifacts.require("BeastQuest");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
