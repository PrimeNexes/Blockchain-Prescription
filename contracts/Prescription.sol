pragma solidity 0.5.0;

contract Prescription {
    // Model a Candidate
    struct Prescriptions {
        uint id;
        address pwallet;
        address dwallet;
        string pname;
        string dname;
        string data;
        string timestamp;
    }

    // Store Candidates
    // Fetch Candidate
    mapping(uint => Prescriptions) public prescriptions;
    // Store Candidates Count
    uint public prescriptionCount;

    // voted event
    event Event (
        string _data
    );

    function addPrescription (string memory _pname,string memory _dname,address _pwallet,address _dwallet,string memory _data,string memory _timestamp) private {
        prescriptionCount ++;
        prescriptions[prescriptionCount] = Prescriptions(prescriptionCount,_pwallet,_dwallet,_pname,_dname, _data,_timestamp);
    }

    function prescribe (address _receiver,string memory _pname,string memory _dname,string memory _data,string memory _timestamp) public {

        addPrescription( _pname,_dname,_receiver,msg.sender,_data,_timestamp);
        // update candidate vote Count
        // trigger voted event
        emit Event(_data);
    }
    
}
