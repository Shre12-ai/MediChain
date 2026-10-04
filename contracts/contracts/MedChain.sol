// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MedChain
 * @notice Role-gated medicine batch registry, custody ledger, and reputation/trust scoring system.
 * @dev College Mini Project (BCS-554)
 */
contract MedChain {
    // --- ROLES & ENUMS ---
    enum Role { None, Manufacturer, Distributor, Wholesaler, Pharmacist, Customer }
    enum BatchStatus { Genuine, Flagged, Expired }

    struct CustodyRecord {
        address from;
        address to;
        Role fromRole;
        Role toRole;
        uint256 timestamp;
        string notes;
    }

    struct Batch {
        string batchNumber;
        string medicineName;
        uint256 mfgDate;
        uint256 expDate;
        bytes32 batchHash;
        address manufacturer;
        address currentCustodian;
        Role currentRole;
        BatchStatus status;
        bool isFinalized; // marked true when dispensed to customer
        uint256 scanCount;
        uint256 reportCount;
        uint256 createdAt;
    }

    struct Report {
        string batchNumber;
        address reporter;
        address attributedNode; // Supply chain node that held custody before report
        Role reporterRole;
        string reason;
        uint256 timestamp;
    }

    struct NodeMetrics {
        uint256 cleanVerifications;
        uint256 reportsFiledAgainst;
        bool isRegistered;
        Role role;
        string name;
    }

    // --- STATE VARIABLES ---
    address public owner;

    // batchNumber => Batch
    mapping(string => Batch) private batches;
    // batchNumber => CustodyRecord[]
    mapping(string => CustodyRecord[]) private custodyTrails;
    // batchNumber => Report[]
    mapping(string => Report[]) private batchReports;
    // List of all registered batch numbers
    string[] private allBatchNumbers;

    // Address => Role
    mapping(address => Role) public userRoles;
    // Address => NodeMetrics
    mapping(address => NodeMetrics) public nodeMetrics;
    // List of tracked supply chain node addresses
    address[] private registeredNodes;

    // --- EVENTS ---
    event RoleAssigned(address indexed account, Role role, string name);
    event BatchRegistered(string indexed batchNumber, bytes32 batchHash, address indexed manufacturer, uint256 mfgDate, uint256 expDate);
    event CustodyTransferred(string indexed batchNumber, address indexed from, address indexed to, Role fromRole, Role toRole, uint256 timestamp);
    event BatchVerified(string indexed batchNumber, bool isAuthentic, bool isExpired, address indexed verifier, uint256 timestamp);
    event BatchFlagged(string indexed batchNumber, string reason, address indexed flaggedBy, uint256 timestamp);
    event ReportFiled(string indexed batchNumber, address indexed reporter, address indexed attributedNode, string reason, uint256 timestamp);
    event TrustAlertTriggered(address indexed node, uint256 trustScore, string warning);

    // --- MODIFIERS ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can execute");
        _;
    }

    modifier onlyRole(Role expectedRole) {
        require(userRoles[msg.sender] == expectedRole, "Caller does not have required role");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Default contract deployer is assigned Manufacturer for initial convenience
        _assignRole(msg.sender, Role.Manufacturer, "Genesis Manufacturer");
    }

    // --- RBAC MANAGEMENT ---
    function assignRole(address account, Role role, string calldata name) external onlyOwner {
        require(account != address(0), "Invalid address");
        require(role != Role.None, "Invalid role");
        _assignRole(account, role, name);
    }

    function _assignRole(address account, Role role, string memory name) internal {
        userRoles[account] = role;
        if (!nodeMetrics[account].isRegistered) {
            nodeMetrics[account].isRegistered = true;
            registeredNodes.push(account);
        }
        nodeMetrics[account].role = role;
        nodeMetrics[account].name = name;
        emit RoleAssigned(account, role, name);
    }

    // --- HASH COMPUTATION ---
    function computeBatchHash(
        string memory batchNumber,
        uint256 mfgDate,
        uint256 expDate
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(batchNumber, mfgDate, expDate));
    }

    // --- 1. BATCH REGISTRATION ---
    function registerBatch(
        string calldata batchNumber,
        string calldata medicineName,
        uint256 mfgDate,
        uint256 expDate
    ) external {
        Role callerRole = userRoles[msg.sender];
        require(callerRole == Role.Manufacturer, "Only Manufacturer can register a batch");
        require(bytes(batchNumber).length > 0, "Batch number cannot be empty");
        require(batches[batchNumber].createdAt == 0, "Batch number already exists on-chain");
        require(expDate > mfgDate, "Expiry date must be after manufacturing date");

        bytes32 expectedHash = computeBatchHash(batchNumber, mfgDate, expDate);

        Batch storage newBatch = batches[batchNumber];
        newBatch.batchNumber = batchNumber;
        newBatch.medicineName = medicineName;
        newBatch.mfgDate = mfgDate;
        newBatch.expDate = expDate;
        newBatch.batchHash = expectedHash;
        newBatch.manufacturer = msg.sender;
        newBatch.currentCustodian = msg.sender;
        newBatch.currentRole = Role.Manufacturer;
        newBatch.status = (block.timestamp >= expDate) ? BatchStatus.Expired : BatchStatus.Genuine;
        newBatch.isFinalized = false;
        newBatch.scanCount = 0;
        newBatch.reportCount = 0;
        newBatch.createdAt = block.timestamp;

        allBatchNumbers.push(batchNumber);

        // Initial Genesis custody record
        custodyTrails[batchNumber].push(CustodyRecord({
            from: address(0),
            to: msg.sender,
            fromRole: Role.None,
            toRole: Role.Manufacturer,
            timestamp: block.timestamp,
            notes: "Batch manufactured and anchored to ledger"
        }));

        emit BatchRegistered(batchNumber, expectedHash, msg.sender, mfgDate, expDate);
    }

    // --- 2. CUSTODY TRANSFER ---
    function transferCustody(
        string calldata batchNumber,
        address to,
        string calldata notes
    ) external {
        Batch storage b = batches[batchNumber];
        require(b.createdAt > 0, "Batch does not exist");
        require(!b.isFinalized, "Batch custody already finalized with customer");
        require(b.currentCustodian == msg.sender, "Caller is not current recorded custodian");
        require(to != address(0) && to != msg.sender, "Invalid recipient address");

        Role fromRole = b.currentRole;
        Role toRole = userRoles[to];

        // Enforce strict one-way sequential flow:
        // Manufacturer (1) -> Distributor (2) -> Wholesaler (3) -> Pharmacist (4) -> Customer (5)
        if (fromRole == Role.Manufacturer) {
            require(toRole == Role.Distributor, "Manufacturer must hand off to Distributor");
        } else if (fromRole == Role.Distributor) {
            require(toRole == Role.Wholesaler, "Distributor must hand off to Wholesaler");
        } else if (fromRole == Role.Wholesaler) {
            require(toRole == Role.Pharmacist, "Wholesaler must hand off to Pharmacist");
        } else if (fromRole == Role.Pharmacist) {
            require(toRole == Role.Customer, "Pharmacist must hand off to Customer");
        } else {
            revert("Illegal custody state transition");
        }

        b.currentCustodian = to;
        b.currentRole = toRole;

        if (toRole == Role.Customer) {
            b.isFinalized = true;
        }

        custodyTrails[batchNumber].push(CustodyRecord({
            from: msg.sender,
            to: to,
            fromRole: fromRole,
            toRole: toRole,
            timestamp: block.timestamp,
            notes: notes
        }));

        emit CustodyTransferred(batchNumber, msg.sender, to, fromRole, toRole, block.timestamp);
    }

    // --- 3. VERIFICATION & INTEGRITY CHECK ---
    function verifyBatch(string calldata batchNumber) external returns (
        bool isAuthentic,
        bool isExpired,
        bool isDuplicateScan,
        BatchStatus status,
        bytes32 storedHash,
        bytes32 calculatedHash
    ) {
        Batch storage b = batches[batchNumber];
        require(b.createdAt > 0, "Batch record not found on ledger");

        // Recompute cryptographic hash from raw on-chain data
        calculatedHash = computeBatchHash(b.batchNumber, b.mfgDate, b.expDate);
        storedHash = b.batchHash;

        isAuthentic = (calculatedHash == storedHash);
        isExpired = (block.timestamp >= b.expDate);

        // Check duplicate scan if already finalized/dispensed
        isDuplicateScan = false;
        if (b.isFinalized && b.scanCount > 0) {
            isDuplicateScan = true;
        }

        b.scanCount += 1;

        // Auto-flagging logic
        if (!isAuthentic || isDuplicateScan) {
            b.status = BatchStatus.Flagged;
            emit BatchFlagged(batchNumber, !isAuthentic ? "Cryptographic hash mismatch" : "Duplicate scan alert", msg.sender, block.timestamp);
        } else if (isExpired) {
            b.status = BatchStatus.Expired;
        }

        // Trust score update: clean verification credits the last supply chain custodian
        if (isAuthentic && !isExpired && !isDuplicateScan) {
            address lastCustodian = _getLastSupplyChainNode(batchNumber);
            if (lastCustodian != address(0) && nodeMetrics[lastCustodian].isRegistered) {
                nodeMetrics[lastCustodian].cleanVerifications += 1;
            }
        }

        status = b.status;
        emit BatchVerified(batchNumber, isAuthentic, isExpired, msg.sender, block.timestamp);
    }

    // --- 4. CROWDSOURCED REPORTING ---
    function reportSuspiciousBatch(string calldata batchNumber, string calldata reason) external {
        Batch storage b = batches[batchNumber];
        require(b.createdAt > 0, "Batch does not exist");
        require(bytes(reason).length > 0, "Reason required");

        Role reporterRole = userRoles[msg.sender];
        // Rules specify Pharmacist or Customer can report
        require(reporterRole == Role.Pharmacist || reporterRole == Role.Customer || reporterRole == Role.None, "Unauthorized to report");

        address attributedNode = _getLastSupplyChainNode(batchNumber);
        require(attributedNode != address(0), "No node found in custody trail");

        b.reportCount += 1;
        b.status = BatchStatus.Flagged;

        batchReports[batchNumber].push(Report({
            batchNumber: batchNumber,
            reporter: msg.sender,
            attributedNode: attributedNode,
            reporterRole: reporterRole,
            reason: reason,
            timestamp: block.timestamp
        }));

        if (nodeMetrics[attributedNode].isRegistered) {
            nodeMetrics[attributedNode].reportsFiledAgainst += 1;
            uint256 score = calculateTrustScore(attributedNode);
            if (score < 70) {
                emit TrustAlertTriggered(attributedNode, score, "Trust score dropped below safety threshold (70%)");
            }
        }

        emit ReportFiled(batchNumber, msg.sender, attributedNode, reason, block.timestamp);
        emit BatchFlagged(batchNumber, string(abi.encodePacked("Report filed: ", reason)), msg.sender, block.timestamp);
    }

    // --- 5. TRUST SCORING ---
    function calculateTrustScore(address node) public view returns (uint256) {
        NodeMetrics storage m = nodeMetrics[node];
        if (!m.isRegistered) return 0;
        uint256 clean = m.cleanVerifications;
        uint256 reports = m.reportsFiledAgainst;

        if (clean == 0 && reports == 0) {
            return 100; // default clean initial score
        }

        // Formula: score = (clean * 100) / (clean + reports * 5)
        uint256 penalty = reports * 5;
        uint256 denominator = clean + penalty;
        if (denominator == 0) return 100;
        return (clean * 100) / denominator;
    }

    // --- 6. READ HELPERS ---
    function getBatch(string calldata batchNumber) external view returns (Batch memory) {
        require(batches[batchNumber].createdAt > 0, "Batch not found");
        return batches[batchNumber];
    }

    function getCustodyTrail(string calldata batchNumber) external view returns (CustodyRecord[] memory) {
        require(batches[batchNumber].createdAt > 0, "Batch not found");
        return custodyTrails[batchNumber];
    }

    function getBatchReports(string calldata batchNumber) external view returns (Report[] memory) {
        require(batches[batchNumber].createdAt > 0, "Batch not found");
        return batchReports[batchNumber];
    }

    function getAllBatches() external view returns (string[] memory) {
        return allBatchNumbers;
    }

    function getRegisteredNodes() external view returns (address[] memory) {
        return registeredNodes;
    }

    function _getLastSupplyChainNode(string memory batchNumber) internal view returns (address) {
        CustodyRecord[] storage trail = custodyTrails[batchNumber];
        for (int256 i = int256(trail.length) - 1; i >= 0; i--) {
            CustodyRecord storage rec = trail[uint256(i)];
            if (rec.toRole != Role.Customer && rec.to != address(0)) {
                return rec.to;
            }
        }
        return batches[batchNumber].manufacturer;
    }
}
