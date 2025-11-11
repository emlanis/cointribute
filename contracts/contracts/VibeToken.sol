// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VibeToken
 * @notice ERC20 governance and reward token for the Cointribute platform
 * @dev Implements minting for donations, staking for governance, and burning for fees
 */
contract VibeToken is ERC20, ERC20Burnable, AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Staking struct
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod; // in seconds
        uint256 rewardRate; // percentage * 100 (e.g., 500 = 5%)
    }

    // Storage
    mapping(address => Stake[]) public stakes;
    mapping(address => uint256) public totalStaked;
    mapping(address => uint256) public rewardsClaimed;

    uint256 public totalStakedSupply;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant REWARD_MULTIPLIER = 10; // 10 VIBE per 1 ETH donated

    // Staking parameters
    uint256 public constant MIN_STAKE = 100 * 10**18; // 100 VIBE minimum
    uint256 public constant BASE_REWARD_RATE = 500; // 5% APY
    uint256 public constant LOCK_PERIOD_30_DAYS = 30 days;
    uint256 public constant LOCK_PERIOD_90_DAYS = 90 days;
    uint256 public constant LOCK_PERIOD_180_DAYS = 180 days;

    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event Staked(
        address indexed user,
        uint256 amount,
        uint256 lockPeriod,
        uint256 rewardRate
    );
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardsClaimed(address indexed user, uint256 amount);

    /**
     * @notice Constructor initializes token with name, symbol, and roles
     * @param _admin Address of the initial admin
     */
    constructor(address _admin) ERC20("Vibe Coin", "VIBE") {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);

        // Mint initial supply to treasury (10% of max supply)
        _mint(_admin, (MAX_SUPPLY * 10) / 100);

        emit TokensMinted(_admin, (MAX_SUPPLY * 10) / 100, "Initial Treasury");
    }

    /**
     * @notice Mint tokens as reward for donations
     * @param _to Recipient address
     * @param _amount Amount to mint
     */
    function mintReward(address _to, uint256 _amount)
        external
        onlyRole(MINTER_ROLE)
    {
        require(_to != address(0), "Cannot mint to zero address");
        require(
            totalSupply() + _amount <= MAX_SUPPLY,
            "Exceeds max supply"
        );

        _mint(_to, _amount);
        emit TokensMinted(_to, _amount, "Donation Reward");
    }

    /**
     * @notice Burn tokens for platform fees
     * @param _from Address to burn from
     * @param _amount Amount to burn
     */
    function burnFee(address _from, uint256 _amount)
        external
        onlyRole(ADMIN_ROLE)
    {
        _burn(_from, _amount);
        emit TokensBurned(_from, _amount, "Platform Fee");
    }

    /**
     * @notice Stake tokens for governance and rewards
     * @param _amount Amount to stake
     * @param _lockPeriod Lock period (must be 30, 90, or 180 days)
     */
    function stake(uint256 _amount, uint256 _lockPeriod)
        external
        nonReentrant
    {
        require(_amount >= MIN_STAKE, "Below minimum stake");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(
            _lockPeriod == LOCK_PERIOD_30_DAYS ||
                _lockPeriod == LOCK_PERIOD_90_DAYS ||
                _lockPeriod == LOCK_PERIOD_180_DAYS,
            "Invalid lock period"
        );

        // Calculate reward rate based on lock period
        uint256 rewardRate = BASE_REWARD_RATE;
        if (_lockPeriod == LOCK_PERIOD_90_DAYS) {
            rewardRate = BASE_REWARD_RATE * 2; // 10% APY
        } else if (_lockPeriod == LOCK_PERIOD_180_DAYS) {
            rewardRate = BASE_REWARD_RATE * 3; // 15% APY
        }

        // Transfer tokens to contract
        _transfer(msg.sender, address(this), _amount);

        // Record stake
        stakes[msg.sender].push(
            Stake({
                amount: _amount,
                timestamp: block.timestamp,
                lockPeriod: _lockPeriod,
                rewardRate: rewardRate
            })
        );

        totalStaked[msg.sender] += _amount;
        totalStakedSupply += _amount;

        emit Staked(msg.sender, _amount, _lockPeriod, rewardRate);
    }

    /**
     * @notice Unstake tokens and claim rewards
     * @param _stakeIndex Index of the stake to unstake
     */
    function unstake(uint256 _stakeIndex) external nonReentrant {
        require(_stakeIndex < stakes[msg.sender].length, "Invalid stake index");

        Stake memory userStake = stakes[msg.sender][_stakeIndex];
        require(
            block.timestamp >= userStake.timestamp + userStake.lockPeriod,
            "Lock period not ended"
        );

        // Calculate rewards
        uint256 stakeDuration = block.timestamp - userStake.timestamp;
        uint256 reward = calculateReward(
            userStake.amount,
            userStake.rewardRate,
            stakeDuration
        );

        // Mint rewards if not exceeding max supply
        if (totalSupply() + reward <= MAX_SUPPLY) {
            _mint(msg.sender, reward);
            rewardsClaimed[msg.sender] += reward;
            emit TokensMinted(msg.sender, reward, "Staking Reward");
        }

        // Transfer staked tokens back
        _transfer(address(this), msg.sender, userStake.amount);

        // Update storage
        totalStaked[msg.sender] -= userStake.amount;
        totalStakedSupply -= userStake.amount;

        // Remove stake from array
        stakes[msg.sender][_stakeIndex] = stakes[msg.sender][
            stakes[msg.sender].length - 1
        ];
        stakes[msg.sender].pop();

        emit Unstaked(msg.sender, userStake.amount, reward);
    }

    /**
     * @notice Calculate staking reward
     * @param _amount Staked amount
     * @param _rewardRate Reward rate (percentage * 100)
     * @param _duration Stake duration in seconds
     * @return reward Calculated reward
     */
    function calculateReward(
        uint256 _amount,
        uint256 _rewardRate,
        uint256 _duration
    ) public pure returns (uint256 reward) {
        // reward = (amount * rate * duration) / (10000 * 365 days)
        reward =
            (_amount * _rewardRate * _duration) /
            (10000 * 365 days);
        return reward;
    }

    /**
     * @notice Get all stakes for a user
     * @param _user User address
     * @return Stake[] Array of user stakes
     */
    function getUserStakes(address _user)
        external
        view
        returns (Stake[] memory)
    {
        return stakes[_user];
    }

    /**
     * @notice Get pending rewards for a specific stake
     * @param _user User address
     * @param _stakeIndex Index of the stake
     * @return reward Pending reward amount
     */
    function getPendingReward(address _user, uint256 _stakeIndex)
        external
        view
        returns (uint256 reward)
    {
        require(_stakeIndex < stakes[_user].length, "Invalid stake index");

        Stake memory userStake = stakes[_user][_stakeIndex];
        uint256 stakeDuration = block.timestamp - userStake.timestamp;

        return
            calculateReward(
                userStake.amount,
                userStake.rewardRate,
                stakeDuration
            );
    }

    /**
     * @notice Get total stakes count for a user
     * @param _user User address
     * @return count Number of active stakes
     */
    function getUserStakeCount(address _user)
        external
        view
        returns (uint256 count)
    {
        return stakes[_user].length;
    }

    /**
     * @notice Get staking info for a user
     * @param _user User address
     * @return totalStakedAmount Total amount staked
     * @return stakeCount Number of stakes
     * @return totalRewardsClaimed Total rewards claimed
     */
    function getStakingInfo(address _user)
        external
        view
        returns (
            uint256 totalStakedAmount,
            uint256 stakeCount,
            uint256 totalRewardsClaimed
        )
    {
        return (
            totalStaked[_user],
            stakes[_user].length,
            rewardsClaimed[_user]
        );
    }

    /**
     * @notice Override transfer to prevent transfers of staked tokens
     * @dev This is already handled by transferring to contract, but added for clarity
     */
    function _update(address from, address to, uint256 value)
        internal
        virtual
        override
    {
        super._update(from, to, value);
    }
}
