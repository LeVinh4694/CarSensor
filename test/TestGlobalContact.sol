pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Contracts.sol";

contract TestGlobalContact {
    GlobalContact globalContact = GlobalContact(DeployedAddresses.GlobalContact());

    string name = "Le Quang Vinh";
    uint64 idNumber = 201690345;
    address accAddr = address(this);
    GlobalContact.UserType eType = GlobalContact.UserType.Normal;

    string oName;
    address oAccAddr;
    address oSCAddr;
    GlobalContact.UserType oType;

    // Testing the createNewUser() function
    function testCreateNewUser() public {
        globalContact.newRegistor(name, idNumber, accAddr, eType);

        (oName, oAccAddr, oSCAddr, oType) = globalContact.getUserInfoByID(idNumber);
        Assert.equal(oName, name, "Name of summary contract shold be matched with expected.");
    }
}