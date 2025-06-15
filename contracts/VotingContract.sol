
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecureVoting {
    struct Vote {
        string electionId;
        string candidateId;
        bytes32 voterHash;
        uint256 timestamp;
        bool verified;
    }
    
    struct Election {
        string id;
        string title;
        uint256 startTime;
        uint256 endTime;
        bool active;
        mapping(string => uint256) candidateVotes;
        mapping(bytes32 => bool) voterParticipated;
        string[] candidates;
    }
    
    mapping(string => Election) public elections;
    mapping(bytes32 => Vote) public votes;
    mapping(address => bool) public authorizedAdmins;
    
    address public owner;
    uint256 public totalVotes;
    
    event VoteCast(
        string indexed electionId,
        string indexed candidateId,
        bytes32 indexed voterHash,
        bytes32 voteHash,
        uint256 timestamp
    );
    
    event ElectionCreated(
        string indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedAdmins[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedAdmins[msg.sender] = true;
    }
    
    function createElection(
        string memory _electionId,
        string memory _title,
        uint256 _startTime,
        uint256 _endTime,
        string[] memory _candidates
    ) public onlyAuthorized {
        require(_startTime < _endTime, "Invalid time range");
        require(_candidates.length > 0, "Must have candidates");
        
        Election storage newElection = elections[_electionId];
        newElection.id = _electionId;
        newElection.title = _title;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.active = true;
        newElection.candidates = _candidates;
        
        emit ElectionCreated(_electionId, _title, _startTime, _endTime);
    }
    
    function castVote(
        string memory _electionId,
        string memory _candidateId,
        bytes32 _voterHash
    ) public returns (bytes32) {
        Election storage election = elections[_electionId];
        require(election.active, "Election not active");
        require(block.timestamp >= election.startTime, "Election not started");
        require(block.timestamp <= election.endTime, "Election ended");
        require(!election.voterParticipated[_voterHash], "Already voted");
        
        bytes32 voteHash = keccak256(abi.encodePacked(
            _electionId,
            _candidateId,
            _voterHash,
            block.timestamp,
            block.number
        ));
        
        votes[voteHash] = Vote({
            electionId: _electionId,
            candidateId: _candidateId,
            voterHash: _voterHash,
            timestamp: block.timestamp,
            verified: true
        });
        
        election.candidateVotes[_candidateId]++;
        election.voterParticipated[_voterHash] = true;
        totalVotes++;
        
        emit VoteCast(_electionId, _candidateId, _voterHash, voteHash, block.timestamp);
        
        return voteHash;
    }
    
    function getVoteCount(string memory _electionId, string memory _candidateId) 
        public view returns (uint256) {
        return elections[_electionId].candidateVotes[_candidateId];
    }
    
    function verifyVote(bytes32 _voteHash) 
        public view returns (bool, string memory, string memory, uint256) {
        Vote memory vote = votes[_voteHash];
        return (vote.verified, vote.electionId, vote.candidateId, vote.timestamp);
    }
    
    function hasVoted(string memory _electionId, bytes32 _voterHash) 
        public view returns (bool) {
        return elections[_electionId].voterParticipated[_voterHash];
    }
}
