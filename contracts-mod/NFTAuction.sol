pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTAuction {
    using Counters for Counters.Counter;
    Counters.Counter private totalReturns;

    uint public auctionEndTime;
    uint public highestBid;
    uint public royaltyPercentage = 75; //75 = 7.5%
    address public highestBidder;
    address payable public beneficiary;
    address payable public artist;
    bool ended = false;
    string public auctionEndDate;

    mapping(address => uint) public pendingReturns;
    mapping(uint => Bid) public bids;

    event highestBidIncrease(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    

    struct Bid{uint id; address bidder; uint amount; bool withdrawn;}

    constructor(uint _biddingTime, uint _royaltyPercentage, string memory _auctionEndDate, address payable _beneficiary, address payable _artist) {
      beneficiary = _beneficiary;
      artist = _artist;
      if(_royaltyPercentage != 0) royaltyPercentage = _royaltyPercentage;
      auctionEndTime = block.timestamp + _biddingTime;
      auctionEndDate = _auctionEndDate;
    }

    modifier onlyNotOwner {
      require(msg.sender != beneficiary);
      _;
    }

    function getAllBids() external view returns (Bid[] memory) {
      uint itemCount = totalReturns.current();
      Bid[] memory items = new Bid[](itemCount);
      uint currentIndex = 0;

      for (uint i = 0; i < itemCount; i++) {
        uint currentId = i + 1;
        Bid storage currentItem = bids[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
    }
      return items;
    }

    function bid() onlyNotOwner external payable {
      if(block.timestamp > auctionEndTime) {
        revert("Auction ended");
      }
      if(msg.value <= highestBid) {
        revert("Bid must be higher");
      }
      if(highestBid != 0) {
        pendingReturns[highestBidder] += highestBid;
      }
      highestBidder = msg.sender;
      highestBid = msg.value;
      totalReturns.increment();
      uint256 bidId = totalReturns.current();
      bids[bidId] = Bid(bidId, highestBidder, highestBid, false);
      emit highestBidIncrease(msg.sender, msg.value);
    }

    function withdraw(uint _bidId) external returns (bool) {
      uint amount = pendingReturns[msg.sender];
      if(amount > 0) {
        pendingReturns[msg.sender] = 0;
        bids[_bidId].withdrawn = true;
      } else {
        revert("No pending returns");
      }

      if(!payable(msg.sender).send(amount)) {
        pendingReturns[msg.sender] = amount;
        return false;
      }
      return true;
    }
    
    function auctionEnd() public {
      if(block.timestamp < auctionEndTime) {
        revert("Auction still active");
      }
      if(ended) {
        revert("Auction already ended");
      }
      ended = true;
      uint royalty = highestBid * royaltyPercentage / 1000;

      artist.transfer(royalty);
      beneficiary.transfer(highestBid - royalty);

      emit AuctionEnded(highestBidder, highestBid);
    }

}
