pragma solidity 0.5.00;

contract Prescription {
    // Model a Candidate
    struct Candidate {
        uint id;
        address pname;
        address dname;
        string data;
    }

    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;

    // voted event
    event Event (
        string _data
    );

    function addCandidate (address _pname,address _dname,string memory _data) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount,_pname,_dname, _data);
    }

    function vote (address _receiver,string memory _data) public {



        addCandidate(_receiver,msg.sender,_data);
        // update candidate vote Count
        // trigger voted event
        emit Event(_data);
    }
}
