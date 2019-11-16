pragma solidity ^0.4.24;

contract Common{
    enum eImplementer{
        Seller,
        Buyer
    }
    
    enum eContractStatus{
        InProgress,
        Finished,
        Rejected
    }
    
    enum eConfirmStatus{
        None,
        Accept,
        Reject
    }
    
    enum eDiscountType{ Percent, Cash }
    
    eContractStatus eStatus;
    eConfirmStatus[2] eComfirmation;
    
    function getContractStatus()
            public
            view
            returns(eContractStatus)
    {
        return eStatus;
    }
}

contract TradingContract is Common{
    enum eOpState{
        opInsuranceOption,
        opDealling,
        opDocument,
        opTransfer,
        opFinish,
        opReject
    }
    
    struct Price{
        uint32 uPrice;
        uint32 uDiscount;
        eDiscountType etype;
        uint32 uInsurance;
        uint32 uExtraFree;
    } 
    Price price;
    
    struct sDocument{
        string sReceipt;
        string sDoc1;
        string sDoc2;
        string sDoc3;
    }
    sDocument document;
    
    address[2] public aOwnerAddrs;
    bool[3] public bInsuranceOptions;
    bool[4] private fileUploaded;
    
    eOpState public opState;
    
    modifier onlyOwner{
        require(msg.sender == aOwnerAddrs[0] ||
                msg.sender == aOwnerAddrs[1]);
        _;
    }
    
    modifier onlyBuyer{
        require(msg.sender == aOwnerAddrs[0]);
        _;
    }
    
    modifier onlySeller{
        require(msg.sender == aOwnerAddrs[1]);
        _;
    }
    
    modifier onlyInsuranceOption{
        require(opState == eOpState.opInsuranceOption);
        _;
    }
    
    modifier rejectInsuranceOption{
        require(opState != eOpState.opInsuranceOption);
        _;
    }
    
    modifier onlyDealling{
        require(opState == eOpState.opDealling);
        _;
    }
    
    modifier onlyTransferDocument{
        require(opState == eOpState.opDocument);
        _;
    }
    
    modifier restricConfirmation{
        require(eStatus != eContractStatus.Finished);
        _;
    }
    
    modifier checkDeallingValidData{
        require(price.uPrice != 0 &&
                price.uInsurance != 0 &&
                price.uExtraFree != 0);
        _;
    }
    
    modifier restricBuyerModify{
        require(eComfirmation[1] == eConfirmStatus.None);
        _;
    }
    
    modifier restricSellerModify{
        require(eComfirmation[0] == eConfirmStatus.None);
        _;
    }
    
    modifier checkValidDocument{
        require(fileUploaded[0] == true &&
                fileUploaded[1] == true &&
                fileUploaded[2] == true &&
                fileUploaded[3] == true);
        _;
    }
    
    constructor
            (address inSeller) 
            public
    {
        aOwnerAddrs = [msg.sender, inSeller];
        eStatus = eContractStatus.InProgress;
        
        opState = eOpState.opInsuranceOption;
        
        bInsuranceOptions = [false, false, false];
        price = Price(0, 0, eDiscountType.Percent, 0, 0);
        
        document = sDocument("", "", "", "");
        fileUploaded = [false, false, false, false];
    }
    
    function sendConfirmation
            (eConfirmStatus inConfirm)
            restricConfirmation
            onlyOwner
            rejectInsuranceOption
            public
    {
        if(msg.sender == aOwnerAddrs[0]){
            eComfirmation[0] = inConfirm;
        } else if (msg.sender == aOwnerAddrs[1]){
            eComfirmation[1] = inConfirm;
        }
        
        if(eComfirmation[0] == eConfirmStatus.Accept && eComfirmation[1] == eConfirmStatus.Accept){
            if(opState == eOpState.opDealling)              // State 1 (Dealling)
            {
                opState = eOpState.opDocument;
                eComfirmation = [eConfirmStatus.None, eConfirmStatus.None];
            } else if(opState == eOpState.opDocument)       // State 2 (Prepare document and transfer money)
            {
                opState = eOpState.opTransfer;
                eComfirmation = [eConfirmStatus.None, eConfirmStatus.None];
            } else if(opState == eOpState.opTransfer)       // State 3 (Transfer car)
            {
                opState = eOpState.opFinish;
                eStatus = eContractStatus.Finished;
                eComfirmation = [eConfirmStatus.None, eConfirmStatus.None];
            } else{}
        } else if(eComfirmation[0] == eConfirmStatus.Reject || eComfirmation[1] == eConfirmStatus.Reject){
            eStatus = eContractStatus.Rejected;
        }
    }
    
    function updateOption
            (bool[3] inOptions)
            onlyInsuranceOption
            onlyBuyer
            public
    {
        bInsuranceOptions = inOptions;
        opState = eOpState.opDealling;
    }
    
    function getOptions()
            public
            view
            returns(bool[3])
    {
        return bInsuranceOptions;
    }
    
    function updateFixedPrice
            (uint32 inPrice, uint32 inDiscount, eDiscountType inType, uint32 inInsurance, uint32 inExtraFee)
            onlyDealling
            onlySeller
            restricBuyerModify
            public
    {
        price = Price(inPrice, inDiscount, inType, inInsurance, inExtraFee);
    }

    function getFixedPrice()
            public
            view
            returns(uint32, uint32, eDiscountType, uint32, uint32)
    {
        return (price.uPrice, price.uDiscount, price.etype, price.uInsurance, price.uExtraFree);
    }
    
    function updateReceipt
            (string inReceiptInfo)
            onlyTransferDocument
            onlyBuyer
            restricBuyerModify
            public
    {
        document.sReceipt = inReceiptInfo;
        fileUploaded[0] = true;
    }
    
    function updateBuyerDocument
            (string inDoc1, string inDoc2)
            onlyTransferDocument
            onlyBuyer
            restricBuyerModify
            public
    {
        document.sDoc1 = inDoc1;
        fileUploaded[1] = true;
        document.sDoc2 = inDoc2;
        fileUploaded[2] = true;
    }
    
    function updateSellerDocument
            (string inDoc3)
            onlyTransferDocument
            onlySeller
            restricSellerModify
            public
    {
        document.sDoc3 = inDoc3;
        fileUploaded[3] = true;
    }

    function getDocumentInfo()
            public
            view
            returns(string, string, string, string)
    {
        return (document.sReceipt, document.sDoc1, document.sDoc2, document.sDoc3);
    }

    function getConfirmationStatus()
            public
            view
            returns(eConfirmStatus[2])
    {
        return eComfirmation;
    }
}

contract SummaryContract{
    enum ContractStt
    {
        Disabled,
        InProgress,
        Done
    }
    
    struct ContractInfo
    {
        string sName;
        address aRelatedAddr;
        address aContractAddr;
        uint8 bStatus;
    }
    ContractInfo mCI;

    address public mOwnerAddr;
    ContractInfo[] private mWaitProcessContract;
    ContractInfo[] private mMainContracts;
    
    // Set permission for owner only
    modifier onlyOwner
    {
        require(msg.sender == mOwnerAddr);
        _;
    }

    // Constructor
    constructor
            (address userAddr)
            public
    {
        mOwnerAddr = userAddr;
    }

    // Create new contract
    function createNewContract
            (address inSeller, string inContractName)
            onlyOwner
            public
    {
        mCI.sName = inContractName;
        mCI.aRelatedAddr = inSeller;
        mCI.aContractAddr = new TradingContract(inSeller);
        mCI.bStatus = uint8(ContractStt.InProgress);

        mMainContracts.push(mCI);
    }

    // Add temporary contract to waiting list
    function addTempContract
            (address inContractAddr, string inContractName) 
            public
    {
        mCI.sName = inContractName;
        mCI.aRelatedAddr = msg.sender;
        mCI.aContractAddr = inContractAddr;
        mCI.bStatus = uint8(ContractStt.Disabled);
        
        mWaitProcessContract.push(mCI);
    }
    
    // Get temporary contract list length
    function getTempContractLen() 
            onlyOwner
            public
            view
            returns(uint256)
    {
        return mWaitProcessContract.length;
    }
    
    // Get contract information at index
    function getTempContractAtIndex
            (uint256 inIndex)
            onlyOwner
            public
            view
            returns(string oName, address oRelatedUser, address oContractAddr, uint8 oStatus)
    {
        if(inIndex >= mWaitProcessContract.length ||
            inIndex < 0) return;
        return (mWaitProcessContract[inIndex].sName,
                mWaitProcessContract[inIndex].aRelatedAddr, 
                mWaitProcessContract[inIndex].aContractAddr, 
                mWaitProcessContract[inIndex].bStatus);
    }

    // Remove temporary contract at index
    function delTempContractAtIndex
            (uint256 inIndex)
            onlyOwner
            public
    {
        // Check if index is invalid
        if(inIndex >= mWaitProcessContract.length ||
            inIndex < 0) return;
        // Delete temporary contract at index
        for(uint i = inIndex; i < mWaitProcessContract.length-1; i++){
            mWaitProcessContract[i] = mWaitProcessContract[i+1];
        }
        delete mWaitProcessContract[mWaitProcessContract.length-1];
        mWaitProcessContract.length--;
    }
    
    // Add temporary contract to main contract list
    function addTempContract2List
            (uint256 inIndex)
            onlyOwner
            public
    {
        // Check if index is invalid
        if(inIndex >= mWaitProcessContract.length ||
            inIndex < 0) return;
        mMainContracts.push(mWaitProcessContract[inIndex]);
        mMainContracts[mMainContracts.length-1].bStatus = uint8(ContractStt.InProgress);
        
        // Delete temporary contract at index
        for(uint i = inIndex; i < mWaitProcessContract.length-1; i++){
            mWaitProcessContract[i] = mWaitProcessContract[i+1];
        }
        delete mWaitProcessContract[mWaitProcessContract.length-1];
        mWaitProcessContract.length--;
    }
    
    // Get contract in main list at index
    function getContractInfoAtIndex
            (uint256 inIndex)
            onlyOwner
            public
            view
            returns(string oName, address oRelatedUser, address oContractAddr, uint8 oStatus)
    {
        if(inIndex >= mMainContracts.length ||
            inIndex < 0) return;
        return (mMainContracts[inIndex].sName,
                mMainContracts[inIndex].aRelatedAddr,
                mMainContracts[inIndex].aContractAddr, 
                mMainContracts[inIndex].bStatus);
    }
    
    // Get temporary contract list length
    function getMainContractLen() 
            onlyOwner
            public
            view
            returns(uint256)
    {
        return mMainContracts.length;
    }
    
    // Disable main contract at index
    function disableContractAtIndex
            (uint256 inIndex)
            onlyOwner
            public
    {
        // Check if index is invalid
        if(inIndex >= mMainContracts.length ||
            inIndex < 0) return;
        mMainContracts[inIndex].bStatus = uint8(ContractStt.Disabled);
    }
}

contract GlobalContact{
    enum UserType
    {
        Normal,
        Insurer
    }

    address public mOwnerAddr;
    
    struct RC{
        string name;
        uint64 id_number;
        address accAddr;
        address SContract;
        UserType uType;
    }
    RC rc;
    
    mapping(uint64 => RC) private userByID;
    mapping(address => RC) private userByAddr;
    
    modifier onlyOwner{
        require(msg.sender == mOwnerAddr);
        _;
    }
    
    constructor() public{
        mOwnerAddr = msg.sender;
    }
    
    function newRegistor
            (string name, uint64 id_number, address accAddr, UserType inType) 
            onlyOwner 
            public
    {
        rc.name = name;
        rc.id_number = id_number;
        rc.accAddr = accAddr;
        rc.SContract = new SummaryContract(accAddr);
        rc.uType = inType;
        
        userByID[id_number] = rc;
        userByAddr[accAddr] = rc;
    }
    
    function getUserInfoByID
            (uint64 id_number) 
            public 
            view 
            returns(string, address, address, UserType)
    {
        return (userByID[id_number].name,
                userByID[id_number].accAddr,
                userByID[id_number].SContract,
                userByID[id_number].uType);
    }

    function getUserInfoByAddr
            (address inUserAddr)
            public
            view
            returns(string, uint64, address, UserType)
    {
        return (userByAddr[inUserAddr].name,
                userByAddr[inUserAddr].id_number,
                userByAddr[inUserAddr].SContract,
                userByAddr[inUserAddr].uType);
    }
}