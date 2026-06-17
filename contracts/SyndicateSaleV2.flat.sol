// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.24 ^0.8.20;

// lib/openzeppelin-contracts/contracts/utils/Context.sol

// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// lib/openzeppelin-contracts/contracts/utils/Errors.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/Errors.sol)

/**
 * @dev Collection of common custom errors used in multiple contracts
 *
 * IMPORTANT: Backwards compatibility is not guaranteed in future versions of the library.
 * It is recommended to avoid relying on the error API for critical functionality.
 *
 * _Available since v5.1._
 */
library Errors {
    /**
     * @dev The ETH balance of the account is not enough to perform the operation.
     */
    error InsufficientBalance(uint256 balance, uint256 needed);

    /**
     * @dev A call to an address target failed. The target may have reverted.
     */
    error FailedCall();

    /**
     * @dev The deployment failed.
     */
    error FailedDeployment();

    /**
     * @dev A necessary precompile is missing.
     */
    error MissingPrecompile(address);
}

// lib/openzeppelin-contracts/contracts/utils/cryptography/Hashes.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/cryptography/Hashes.sol)

/**
 * @dev Library of standard hash functions.
 *
 * _Available since v5.1._
 */
library Hashes {
    /**
     * @dev Commutative Keccak256 hash of a sorted pair of bytes32. Frequently used when working with merkle proofs.
     *
     * NOTE: Equivalent to the `standardNodeHash` in our https://github.com/OpenZeppelin/merkle-tree[JavaScript library].
     */
    function commutativeKeccak256(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? _efficientKeccak256(a, b) : _efficientKeccak256(b, a);
    }

    /**
     * @dev Implementation of keccak256(abi.encode(a, b)) that doesn't allocate or expand memory.
     */
    function _efficientKeccak256(bytes32 a, bytes32 b) private pure returns (bytes32 value) {
        assembly ("memory-safe") {
            mstore(0x00, a)
            mstore(0x20, b)
            value := keccak256(0x00, 0x40)
        }
    }
}

// lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/introspection/IERC165.sol)

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}

// lib/openzeppelin-contracts/contracts/utils/Address.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/Address.sol)

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev There's no code at `target` (it is not a contract).
     */
    error AddressEmptyCode(address target);

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.8.20/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        if (address(this).balance < amount) {
            revert Errors.InsufficientBalance(address(this).balance, amount);
        }

        (bool success, ) = recipient.call{value: amount}("");
        if (!success) {
            revert Errors.FailedCall();
        }
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason or custom error, it is bubbled
     * up by this function (like regular Solidity function calls). However, if
     * the call reverted with no returned reason, this function reverts with a
     * {Errors.FailedCall} error.
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        if (address(this).balance < value) {
            revert Errors.InsufficientBalance(address(this).balance, value);
        }
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Tool to verify that a low level call to smart-contract was successful, and reverts if the target
     * was not a contract or bubbling up the revert reason (falling back to {Errors.FailedCall}) in case
     * of an unsuccessful call.
     */
    function verifyCallResultFromTarget(
        address target,
        bool success,
        bytes memory returndata
    ) internal view returns (bytes memory) {
        if (!success) {
            _revert(returndata);
        } else {
            // only check if target is a contract if the call was successful and the return data is empty
            // otherwise we already know that it was a contract
            if (returndata.length == 0 && target.code.length == 0) {
                revert AddressEmptyCode(target);
            }
            return returndata;
        }
    }

    /**
     * @dev Tool to verify that a low level call was successful, and reverts if it wasn't, either by bubbling the
     * revert reason or with a default {Errors.FailedCall} error.
     */
    function verifyCallResult(bool success, bytes memory returndata) internal pure returns (bytes memory) {
        if (!success) {
            _revert(returndata);
        } else {
            return returndata;
        }
    }

    /**
     * @dev Reverts with returndata if present. Otherwise reverts with {Errors.FailedCall}.
     */
    function _revert(bytes memory returndata) private pure {
        // Look for revert reason and bubble it up if present
        if (returndata.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            assembly ("memory-safe") {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            revert Errors.FailedCall();
        }
    }
}

// lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol

// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/IERC165.sol)

// lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol

// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/IERC20.sol)

// lib/openzeppelin-contracts/contracts/utils/cryptography/MerkleProof.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/cryptography/MerkleProof.sol)
// This file was procedurally generated from scripts/generate/templates/MerkleProof.js.

/**
 * @dev These functions deal with verification of Merkle Tree proofs.
 *
 * The tree and the proofs can be generated using our
 * https://github.com/OpenZeppelin/merkle-tree[JavaScript library].
 * You will find a quickstart guide in the readme.
 *
 * WARNING: You should avoid using leaf values that are 64 bytes long prior to
 * hashing, or use a hash function other than keccak256 for hashing leaves.
 * This is because the concatenation of a sorted pair of internal nodes in
 * the Merkle tree could be reinterpreted as a leaf value.
 * OpenZeppelin's JavaScript library generates Merkle trees that are safe
 * against this attack out of the box.
 *
 * IMPORTANT: Consider memory side-effects when using custom hashing functions
 * that access memory in an unsafe way.
 *
 * NOTE: This library supports proof verification for merkle trees built using
 * custom _commutative_ hashing functions (i.e. `H(a, b) == H(b, a)`). Proving
 * leaf inclusion in trees built using non-commutative hashing functions requires
 * additional logic that is not supported by this library.
 */
library MerkleProof {
    /**
     *@dev The multiproof provided is not valid.
     */
    error MerkleProofInvalidMultiproof();

    /**
     * @dev Returns true if a `leaf` can be proved to be a part of a Merkle tree
     * defined by `root`. For this, a `proof` must be provided, containing
     * sibling hashes on the branch from the leaf to the root of the tree. Each
     * pair of leaves and each pair of pre-images are assumed to be sorted.
     *
     * This version handles proofs in memory with the default hashing function.
     */
    function verify(bytes32[] memory proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        return processProof(proof, leaf) == root;
    }

    /**
     * @dev Returns the rebuilt hash obtained by traversing a Merkle tree up
     * from `leaf` using `proof`. A `proof` is valid if and only if the rebuilt
     * hash matches the root of the tree. When processing the proof, the pairs
     * of leaves & pre-images are assumed to be sorted.
     *
     * This version handles proofs in memory with the default hashing function.
     */
    function processProof(bytes32[] memory proof, bytes32 leaf) internal pure returns (bytes32) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            computedHash = Hashes.commutativeKeccak256(computedHash, proof[i]);
        }
        return computedHash;
    }

    /**
     * @dev Returns true if a `leaf` can be proved to be a part of a Merkle tree
     * defined by `root`. For this, a `proof` must be provided, containing
     * sibling hashes on the branch from the leaf to the root of the tree. Each
     * pair of leaves and each pair of pre-images are assumed to be sorted.
     *
     * This version handles proofs in memory with a custom hashing function.
     */
    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf,
        function(bytes32, bytes32) view returns (bytes32) hasher
    ) internal view returns (bool) {
        return processProof(proof, leaf, hasher) == root;
    }

    /**
     * @dev Returns the rebuilt hash obtained by traversing a Merkle tree up
     * from `leaf` using `proof`. A `proof` is valid if and only if the rebuilt
     * hash matches the root of the tree. When processing the proof, the pairs
     * of leaves & pre-images are assumed to be sorted.
     *
     * This version handles proofs in memory with a custom hashing function.
     */
    function processProof(
        bytes32[] memory proof,
        bytes32 leaf,
        function(bytes32, bytes32) view returns (bytes32) hasher
    ) internal view returns (bytes32) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            computedHash = hasher(computedHash, proof[i]);
        }
        return computedHash;
    }

    /**
     * @dev Returns true if a `leaf` can be proved to be a part of a Merkle tree
     * defined by `root`. For this, a `proof` must be provided, containing
     * sibling hashes on the branch from the leaf to the root of the tree. Each
     * pair of leaves and each pair of pre-images are assumed to be sorted.
     *
     * This version handles proofs in calldata with the default hashing function.
     */
    function verifyCalldata(bytes32[] calldata proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        return processProofCalldata(proof, leaf) == root;
    }

    /**
     * @dev Returns the rebuilt hash obtained by traversing a Merkle tree up
     * from `leaf` using `proof`. A `proof` is valid if and only if the rebuilt
     * hash matches the root of the tree. When processing the proof, the pairs
     * of leaves & pre-images are assumed to be sorted.
     *
     * This version handles proofs in calldata with the default hashing function.
     */
    function processProofCalldata(bytes32[] calldata proof, bytes32 leaf) internal pure returns (bytes32) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            computedHash = Hashes.commutativeKeccak256(computedHash, proof[i]);
        }
        return computedHash;
    }

    /**
     * @dev Returns true if a `leaf` can be proved to be a part of a Merkle tree
     * defined by `root`. For this, a `proof` must be provided, containing
     * sibling hashes on the branch from the leaf to the root of the tree. Each
     * pair of leaves and each pair of pre-images are assumed to be sorted.
     *
     * This version handles proofs in calldata with a custom hashing function.
     */
    function verifyCalldata(
        bytes32[] calldata proof,
        bytes32 root,
        bytes32 leaf,
        function(bytes32, bytes32) view returns (bytes32) hasher
    ) internal view returns (bool) {
        return processProofCalldata(proof, leaf, hasher) == root;
    }

    /**
     * @dev Returns the rebuilt hash obtained by traversing a Merkle tree up
     * from `leaf` using `proof`. A `proof` is valid if and only if the rebuilt
     * hash matches the root of the tree. When processing the proof, the pairs
     * of leaves & pre-images are assumed to be sorted.
     *
     * This version handles proofs in calldata with a custom hashing function.
     */
    function processProofCalldata(
        bytes32[] calldata proof,
        bytes32 leaf,
        function(bytes32, bytes32) view returns (bytes32) hasher
    ) internal view returns (bytes32) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            computedHash = hasher(computedHash, proof[i]);
        }
        return computedHash;
    }

    /**
     * @dev Returns true if the `leaves` can be simultaneously proven to be a part of a Merkle tree defined by
     * `root`, according to `proof` and `proofFlags` as described in {processMultiProof}.
     *
     * This version handles multiproofs in memory with the default hashing function.
     *
     * CAUTION: Not all Merkle trees admit multiproofs. See {processMultiProof} for details.
     *
     * NOTE: Consider the case where `root == proof[0] && leaves.length == 0` as it will return `true`.
     * The `leaves` must be validated independently. See {processMultiProof}.
     */
    function multiProofVerify(
        bytes32[] memory proof,
        bool[] memory proofFlags,
        bytes32 root,
        bytes32[] memory leaves
    ) internal pure returns (bool) {
        return processMultiProof(proof, proofFlags, leaves) == root;
    }

    /**
     * @dev Returns the root of a tree reconstructed from `leaves` and sibling nodes in `proof`. The reconstruction
     * proceeds by incrementally reconstructing all inner nodes by combining a leaf/inner node with either another
     * leaf/inner node or a proof sibling node, depending on whether each `proofFlags` item is true or false
     * respectively.
     *
     * This version handles multiproofs in memory with the default hashing function.
     *
     * CAUTION: Not all Merkle trees admit multiproofs. To use multiproofs, it is sufficient to ensure that: 1) the tree
     * is complete (but not necessarily perfect), 2) the leaves to be proven are in the opposite order they are in the
     * tree (i.e., as seen from right to left starting at the deepest layer and continuing at the next layer).
     *
     * NOTE: The _empty set_ (i.e. the case where `proof.length == 1 && leaves.length == 0`) is considered a no-op,
     * and therefore a valid multiproof (i.e. it returns `proof[0]`). Consider disallowing this case if you're not
     * validating the leaves elsewhere.
     */
    function processMultiProof(
        bytes32[] memory proof,
        bool[] memory proofFlags,
        bytes32[] memory leaves
    ) internal pure returns (bytes32 merkleRoot) {
        // This function rebuilds the root hash by traversing the tree up from the leaves. The root is rebuilt by
        // consuming and producing values on a queue. The queue starts with the `leaves` array, then goes onto the
        // `hashes` array. At the end of the process, the last hash in the `hashes` array should contain the root of
        // the Merkle tree.
        uint256 leavesLen = leaves.length;
        uint256 proofFlagsLen = proofFlags.length;

        // Check proof validity.
        if (leavesLen + proof.length != proofFlagsLen + 1) {
            revert MerkleProofInvalidMultiproof();
        }

        // The xxxPos values are "pointers" to the next value to consume in each array. All accesses are done using
        // `xxx[xxxPos++]`, which return the current value and increment the pointer, thus mimicking a queue's "pop".
        bytes32[] memory hashes = new bytes32[](proofFlagsLen);
        uint256 leafPos = 0;
        uint256 hashPos = 0;
        uint256 proofPos = 0;
        // At each step, we compute the next hash using two values:
        // - a value from the "main queue". If not all leaves have been consumed, we get the next leaf, otherwise we
        //   get the next hash.
        // - depending on the flag, either another value from the "main queue" (merging branches) or an element from the
        //   `proof` array.
        for (uint256 i = 0; i < proofFlagsLen; i++) {
            bytes32 a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
            bytes32 b = proofFlags[i]
                ? (leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++])
                : proof[proofPos++];
            hashes[i] = Hashes.commutativeKeccak256(a, b);
        }

        if (proofFlagsLen > 0) {
            if (proofPos != proof.length) {
                revert MerkleProofInvalidMultiproof();
            }
            unchecked {
                return hashes[proofFlagsLen - 1];
            }
        } else if (leavesLen > 0) {
            return leaves[0];
        } else {
            return proof[0];
        }
    }

    /**
     * @dev Returns true if the `leaves` can be simultaneously proven to be a part of a Merkle tree defined by
     * `root`, according to `proof` and `proofFlags` as described in {processMultiProof}.
     *
     * This version handles multiproofs in memory with a custom hashing function.
     *
     * CAUTION: Not all Merkle trees admit multiproofs. See {processMultiProof} for details.
     *
     * NOTE: Consider the case where `root == proof[0] && leaves.length == 0` as it will return `true`.
     * The `leaves` must be validated independently. See {processMultiProof}.
     */
    function multiProofVerify(
        bytes32[] memory proof,
        bool[] memory proofFlags,
        bytes32 root,
        bytes32[] memory leaves,
        function(bytes32, bytes32) view returns (bytes32) hasher
    ) internal view returns (bool) {
        return processMultiProof(proof, proofFlags, leaves, hasher) == root;
    }

    /**
     * @dev Returns the root of a tree reconstructed from `leaves` and sibling nodes in `proof`. The reconstruction
     * proceeds by incrementally reconstructing all inner nodes by combining a leaf/inner node with either another
     * leaf/inner node or a proof sibling node, depending on whether each `proofFlags` item is true or false
     * respectively.
     *
     * This version handles multiproofs in memory with a custom hashing function.
     *
     * CAUTION: Not all Merkle trees admit multiproofs. To use multiproofs, it is sufficient to ensure that: 1) the tree
     * is complete (but not necessarily perfect), 2) the leaves to be proven are in the opposite order they are in the
     * tree (i.e., as seen from right to left starting at the deepest layer and continuing at the next layer).
     *
     * NOTE: The _empty set_ (i.e. the case where `proof.length == 1 && leaves.length == 0`) is considered a no-op,
     * and therefore a valid multiproof (i.e. it returns `proof[0]`). Consider disallowing this case if you're not
     * validating the leaves elsewhere.
     */
    function processMultiProof(
        bytes32[] memory proof,
        bool[] memory proofFlags,
        bytes32[] memory leaves,
        function(bytes32, bytes32) view returns (bytes32) hasher
    ) internal view returns (bytes32 merkleRoot) {
        // This function rebuilds the root hash by traversing the tree up from the leaves. The root is rebuilt by
        // consuming and producing values on a queue. The queue starts with the `leaves` array, then goes onto the
        // `hashes` array. At the end of the process, the last hash in the `hashes` array should contain the root of
        // the Merkle tree.
        uint256 leavesLen = leaves.length;
        uint256 proofFlagsLen = proofFlags.length;

        // Check proof validity.
        if (leavesLen + proof.length != proofFlagsLen + 1) {
            revert MerkleProofInvalidMultiproof();
        }

        // The xxxPos values are "pointers" to the next value to consume in each array. All accesses are done using
        // `xxx[xxxPos++]`, which return the current value and increment the pointer, thus mimicking a queue's "pop".
        bytes32[] memory hashes = new bytes32[](proofFlagsLen);
        uint256 leafPos = 0;
        uint256 hashPos = 0;
        uint256 proofPos = 0;
        // At each step, we compute the next hash using two values:
        // - a value from the "main queue". If not all leaves have been consumed, we get the next leaf, otherwise we
        //   get the next hash.
        // - depending on the flag, either another value from the "main queue" (merging branches) or an element from the
        //   `proof` array.
        for (uint256 i = 0; i < proofFlagsLen; i++) {
            bytes32 a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
            bytes32 b = proofFlags[i]
                ? (leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++])
                : proof[proofPos++];
            hashes[i] = hasher(a, b);
        }

        if (proofFlagsLen > 0) {
            if (proofPos != proof.length) {
                revert MerkleProofInvalidMultiproof();
            }
            unchecked {
                return hashes[proofFlagsLen - 1];
            }
        } else if (leavesLen > 0) {
            return leaves[0];
        } else {
            return proof[0];
        }
    }

    /**
     * @dev Returns true if the `leaves` can be simultaneously proven to be a part of a Merkle tree defined by
     * `root`, according to `proof` and `proofFlags` as described in {processMultiProof}.
     *
     * This version handles multiproofs in calldata with the default hashing function.
     *
     * CAUTION: Not all Merkle trees admit multiproofs. See {processMultiProof} for details.
     *
     * NOTE: Consider the case where `root == proof[0] && leaves.length == 0` as it will return `true`.
     * The `leaves` must be validated independently. See {processMultiProofCalldata}.
     */
    function multiProofVerifyCalldata(
        bytes32[] calldata proof,
        bool[] calldata proofFlags,
        bytes32 root,
        bytes32[] memory leaves
    ) internal pure returns (bool) {
        return processMultiProofCalldata(proof, proofFlags, leaves) == root;
    }

    /**
     * @dev Returns the root of a tree reconstructed from `leaves` and sibling nodes in `proof`. The reconstruction
     * proceeds by incrementally reconstructing all inner nodes by combining a leaf/inner node with either another
     * leaf/inner node or a proof sibling node, depending on whether each `proofFlags` item is true or false
     * respectively.
     *
     * This version handles multiproofs in calldata with the default hashing function.
     *
     * CAUTION: Not all Merkle trees admit multiproofs. To use multiproofs, it is sufficient to ensure that: 1) the tree
     * is complete (but not necessarily perfect), 2) the leaves to be proven are in the opposite order they are in the
     * tree (i.e., as seen from right to left starting at the deepest layer and continuing at the next layer).
     *
     * NOTE: The _empty set_ (i.e. the case where `proof.length == 1 && leaves.length == 0`) is considered a no-op,
     * and therefore a valid multiproof (i.e. it returns `proof[0]`). Consider disallowing this case if you're not
     * validating the leaves elsewhere.
     */
    function processMultiProofCalldata(
        bytes32[] calldata proof,
        bool[] calldata proofFlags,
        bytes32[] memory leaves
    ) internal pure returns (bytes32 merkleRoot) {
        // This function rebuilds the root hash by traversing the tree up from the leaves. The root is rebuilt by
        // consuming and producing values on a queue. The queue starts with the `leaves` array, then goes onto the
        // `hashes` array. At the end of the process, the last hash in the `hashes` array should contain the root of
        // the Merkle tree.
        uint256 leavesLen = leaves.length;
        uint256 proofFlagsLen = proofFlags.length;

        // Check proof validity.
        if (leavesLen + proof.length != proofFlagsLen + 1) {
            revert MerkleProofInvalidMultiproof();
        }

        // The xxxPos values are "pointers" to the next value to consume in each array. All accesses are done using
        // `xxx[xxxPos++]`, which return the current value and increment the pointer, thus mimicking a queue's "pop".
        bytes32[] memory hashes = new bytes32[](proofFlagsLen);
        uint256 leafPos = 0;
        uint256 hashPos = 0;
        uint256 proofPos = 0;
        // At each step, we compute the next hash using two values:
        // - a value from the "main queue". If not all leaves have been consumed, we get the next leaf, otherwise we
        //   get the next hash.
        // - depending on the flag, either another value from the "main queue" (merging branches) or an element from the
        //   `proof` array.
        for (uint256 i = 0; i < proofFlagsLen; i++) {
            bytes32 a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
            bytes32 b = proofFlags[i]
                ? (leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++])
                : proof[proofPos++];
            hashes[i] = Hashes.commutativeKeccak256(a, b);
        }

        if (proofFlagsLen > 0) {
            if (proofPos != proof.length) {
                revert MerkleProofInvalidMultiproof();
            }
            unchecked {
                return hashes[proofFlagsLen - 1];
            }
        } else if (leavesLen > 0) {
            return leaves[0];
        } else {
            return proof[0];
        }
    }

    /**
     * @dev Returns true if the `leaves` can be simultaneously proven to be a part of a Merkle tree defined by
     * `root`, according to `proof` and `proofFlags` as described in {processMultiProof}.
     *
     * This version handles multiproofs in calldata with a custom hashing function.
     *
     * CAUTION: Not all Merkle trees admit multiproofs. See {processMultiProof} for details.
     *
     * NOTE: Consider the case where `root == proof[0] && leaves.length == 0` as it will return `true`.
     * The `leaves` must be validated independently. See {processMultiProofCalldata}.
     */
    function multiProofVerifyCalldata(
        bytes32[] calldata proof,
        bool[] calldata proofFlags,
        bytes32 root,
        bytes32[] memory leaves,
        function(bytes32, bytes32) view returns (bytes32) hasher
    ) internal view returns (bool) {
        return processMultiProofCalldata(proof, proofFlags, leaves, hasher) == root;
    }

    /**
     * @dev Returns the root of a tree reconstructed from `leaves` and sibling nodes in `proof`. The reconstruction
     * proceeds by incrementally reconstructing all inner nodes by combining a leaf/inner node with either another
     * leaf/inner node or a proof sibling node, depending on whether each `proofFlags` item is true or false
     * respectively.
     *
     * This version handles multiproofs in calldata with a custom hashing function.
     *
     * CAUTION: Not all Merkle trees admit multiproofs. To use multiproofs, it is sufficient to ensure that: 1) the tree
     * is complete (but not necessarily perfect), 2) the leaves to be proven are in the opposite order they are in the
     * tree (i.e., as seen from right to left starting at the deepest layer and continuing at the next layer).
     *
     * NOTE: The _empty set_ (i.e. the case where `proof.length == 1 && leaves.length == 0`) is considered a no-op,
     * and therefore a valid multiproof (i.e. it returns `proof[0]`). Consider disallowing this case if you're not
     * validating the leaves elsewhere.
     */
    function processMultiProofCalldata(
        bytes32[] calldata proof,
        bool[] calldata proofFlags,
        bytes32[] memory leaves,
        function(bytes32, bytes32) view returns (bytes32) hasher
    ) internal view returns (bytes32 merkleRoot) {
        // This function rebuilds the root hash by traversing the tree up from the leaves. The root is rebuilt by
        // consuming and producing values on a queue. The queue starts with the `leaves` array, then goes onto the
        // `hashes` array. At the end of the process, the last hash in the `hashes` array should contain the root of
        // the Merkle tree.
        uint256 leavesLen = leaves.length;
        uint256 proofFlagsLen = proofFlags.length;

        // Check proof validity.
        if (leavesLen + proof.length != proofFlagsLen + 1) {
            revert MerkleProofInvalidMultiproof();
        }

        // The xxxPos values are "pointers" to the next value to consume in each array. All accesses are done using
        // `xxx[xxxPos++]`, which return the current value and increment the pointer, thus mimicking a queue's "pop".
        bytes32[] memory hashes = new bytes32[](proofFlagsLen);
        uint256 leafPos = 0;
        uint256 hashPos = 0;
        uint256 proofPos = 0;
        // At each step, we compute the next hash using two values:
        // - a value from the "main queue". If not all leaves have been consumed, we get the next leaf, otherwise we
        //   get the next hash.
        // - depending on the flag, either another value from the "main queue" (merging branches) or an element from the
        //   `proof` array.
        for (uint256 i = 0; i < proofFlagsLen; i++) {
            bytes32 a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
            bytes32 b = proofFlags[i]
                ? (leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++])
                : proof[proofPos++];
            hashes[i] = hasher(a, b);
        }

        if (proofFlagsLen > 0) {
            if (proofPos != proof.length) {
                revert MerkleProofInvalidMultiproof();
            }
            unchecked {
                return hashes[proofFlagsLen - 1];
            }
        } else if (leavesLen > 0) {
            return leaves[0];
        } else {
            return proof[0];
        }
    }
}

// lib/openzeppelin-contracts/contracts/access/Ownable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// lib/openzeppelin-contracts/contracts/utils/Pausable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (utils/Pausable.sol)

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    bool private _paused;

    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    /**
     * @dev The operation failed because the contract is paused.
     */
    error EnforcedPause();

    /**
     * @dev The operation failed because the contract is not paused.
     */
    error ExpectedPause();

    /**
     * @dev Initializes the contract in unpaused state.
     */
    constructor() {
        _paused = false;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        if (paused()) {
            revert EnforcedPause();
        }
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        if (!paused()) {
            revert ExpectedPause();
        }
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

// lib/openzeppelin-contracts/contracts/access/Ownable2Step.sol

// OpenZeppelin Contracts (last updated v5.1.0) (access/Ownable2Step.sol)

/**
 * @dev Contract module which provides access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * This extension of the {Ownable} contract includes a two-step mechanism to transfer
 * ownership, where the new owner must call {acceptOwnership} in order to replace the
 * old one. This can help prevent common mistakes, such as transfers of ownership to
 * incorrect accounts, or to contracts that are unable to interact with the
 * permission system.
 *
 * The initial owner is specified at deployment time in the constructor for `Ownable`. This
 * can later be changed with {transferOwnership} and {acceptOwnership}.
 *
 * This module is used through inheritance. It will make available all functions
 * from parent (Ownable).
 */
abstract contract Ownable2Step is Ownable {
    address private _pendingOwner;

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Returns the address of the pending owner.
     */
    function pendingOwner() public view virtual returns (address) {
        return _pendingOwner;
    }

    /**
     * @dev Starts the ownership transfer of the contract to a new account. Replaces the pending transfer if there is one.
     * Can only be called by the current owner.
     *
     * Setting `newOwner` to the zero address is allowed; this can be used to cancel an initiated ownership transfer.
     */
    function transferOwnership(address newOwner) public virtual override onlyOwner {
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner(), newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`) and deletes any pending owner.
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual override {
        delete _pendingOwner;
        super._transferOwnership(newOwner);
    }

    /**
     * @dev The new owner accepts the ownership transfer.
     */
    function acceptOwnership() public virtual {
        address sender = _msgSender();
        if (pendingOwner() != sender) {
            revert OwnableUnauthorizedAccount(sender);
        }
        _transferOwnership(sender);
    }
}

// lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol

// OpenZeppelin Contracts (last updated v5.1.0) (interfaces/IERC1363.sol)

/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol

// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/utils/SafeERC20.sol)

/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Opposedly, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturnBool} that reverts if call fails to meet the requirements.
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            let success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            // bubble errors
            if iszero(success) {
                let ptr := mload(0x40)
                returndatacopy(ptr, 0, returndatasize())
                revert(ptr, returndatasize())
            }
            returnSize := returndatasize()
            returnValue := mload(0)
        }

        if (returnSize == 0 ? address(token).code.length == 0 : returnValue != 1) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silently catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0)
        }
        return success && (returnSize == 0 ? address(token).code.length > 0 : returnValue == 1);
    }
}

// src/SyndicateSaleV2.sol

// =============================================================================
//  SyndicateSaleV2 — PRODUCTION CANDIDATE (pending final review + audit)
//  The Syndicate · Membership Distribution Engine (Sale V2)
// =============================================================================
//  STATUS: Hardened implementation of the FROZEN architecture draft
//          docs/proposals/drafts/SyndicateSaleV2.draft.sol. Stub security
//          primitives have been replaced with audited OpenZeppelin v5 libraries
//          and the Merkle verification was standardized. ECONOMICS, ERA SCHEDULE,
//          CAPS, RESERVE LOGIC AND 70/20/10 ROUTING ARE UNCHANGED.
//
//          STILL UNAUDITED. MUST NOT be deployed (mainnet OR testnet) or wired
//          into the frontend until: external review -> forked-mainnet/Fuji
//          rehearsal -> independent audit -> sign-off.
//
//  HARD CONSTRAINTS HONORED (unchanged):
//    - Does NOT modify Sale V1 (0x0020Df30C127306f0F5B44E6a6E4368D2855842d).
//    - Does NOT touch the SYN token (0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170).
//    - Does NOT migrate funds. It only routes NEW USDC from NEW buys to the
//      EXISTING 70/20/10 wallets and pays SYN out of its own funded balance.
//
//  HARDENING APPLIED IN THIS FILE (vs the draft — no economics touched):
//    H1. SafeERC20 (+ forceApprove) for ALL token movement and router allowances.
//    H2. Ownable2Step (audited 2-step ownership; a multisig owner is recommended).
//    H3. Pausable (audited pause; `pausedAt` retained for the recovery timelock).
//    H4. ReentrancyGuard (buy()).
//    H5. Merkle: OpenZeppelin MerkleProof.verify with a STANDARD double-hashed
//        leaf keccak256(bytes.concat(keccak256(abi.encode(addr)))) — compatible
//        with @openzeppelin/merkle-tree StandardMerkleTree(["address"]). See
//        contracts/README.md for exact V1_MEMBER_ROOT generation.
//
//  Companion design doc:
//    docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md
//    docs/proposals/drafts/SyndicateSaleV2.draft.sol (frozen design)
// =============================================================================

/// @notice Routing payload handed to the CommissionRouter. Duplicated byte-for-byte
///         in contracts/src/CommissionRouterV1.sol — keep in lockstep.
struct CommissionRouteInput {
    address buyer;
    address referrer;
    uint256 gross;
    uint256 vaultAmount;
    uint256 liquidityAmount;
    uint256 opsSlice;
    bool    firstSeat;
    bytes32 campaign;
    bytes32 refTag;
}

/// @notice Minimal interface to the external CommissionRouter V1, which owns ALL
///         referral tier logic + routing. Sale V2 hands it ONLY the Operations
///         slice; the router pulls that slice via transferFrom (Sale V2 pre-approves).
interface ICommissionRouter {
    function route(CommissionRouteInput calldata p)
        external
        returns (uint256 referrerAmount, uint256 operationsAmount);
}

/**
 * @title  SyndicateSaleV2
 * @notice Era-stepped, automatic, immutable membership distribution engine.
 *
 *  DESIGN PILLARS
 *  --------------
 *  1. AUTOMATIC, PRESCRIPTED ERAS. The access rate steps purely as a function
 *     of protocol state (seats issued AND SYN sold per era). No founder switch,
 *     no oracle, no timer. The only privileged power is emergency pause.
 *
 *  2. EXACT INTEGER MATH. Every era's price is an integer number of SYN per
 *     1 USDC (Genesis 100 -> Era IX 1). USDC has 6 decimals, SYN has 18, so:
 *         synOut(18dp) = usdcIn(6dp) * synPerUsdc * 1e12
 *     There is no division in the price path, hence ZERO rounding/precision
 *     loss and no rounding-favoring-buyer drain vector.
 *
 *  3. DUAL-BOUND ERAS (member range AND per-era SYN cap). Each era closes on
 *     whichever comes first: its member-range ceiling is reached, OR its SYN
 *     sold-cap can no longer fit even one minimum entry. This bounds how much
 *     cheap early-era SYN can ever be sold (anti-Sybil at the aggregate level)
 *     WITHOUT physical buckets: caps limit `soldInEra[e]` against ONE global
 *     SYN balance, so unsold early-era capacity simply remains in the pool and
 *     is available to later eras. The era engine NEVER splits a purchase across
 *     two rates: a buy is priced entirely at one era, or it reverts.
 *
 *     IMPORTANT (honesty): per-era caps PRESERVE THE DISTRIBUTION SHAPE and
 *     reduce early depletion. They do NOT by themselves guarantee that exactly
 *     1,000,000 seats are reachable — repeat/upgrade buys can consume a cap
 *     while issuing few seats, advancing the price for everyone. The configurable
 *     immutable RESERVE_THROUGH_SEAT closes this gap when set: it refuses any buy
 *     that would leave too little SYN to seat the remaining members at their OWN
 *     era minimums, so seats are guaranteed up to the chosen seat (default #10,000
 *     => Eras II–IV; #1,000,000 => the full million; 0 => off). Where the reserve
 *     does not cover a seat, "First Million" stays a TARGET bounded by funded
 *     inventory, not a guarantee. See HUMAN REVIEW J13 (cap sizing) / J16 (target).
 *
 *  4. HYBRID PROPORTIONAL PURCHASES. A buyer may pay any amount >= the era
 *     minimum and receives proportional SYN at the current era rate. Whale
 *     accumulation is bounded by THREE independent caps: per-transaction USDC,
 *     per-address-per-era USDC (sized PER ERA, maxUsdcPerAddressPerEra[1..9]),
 *     and the aggregate per-era SYN sold-cap; the optional seat-reserve
 *     (RESERVE_THROUGH_SEAT) adds a fourth, seat-preservation bound.
 *
 *  5. 70 / 20 / 10 PRESERVED, REFERRAL VIA CommissionRouter. Vault (70%) and
 *     Liquidity (20%) are NEVER diluted. Sale V2 no longer computes any referral
 *     rate inline: it pays Vault and Liquidity in full, then hands the ENTIRE 10%
 *     Operations slice to an external CommissionRouter (a timelocked, governance-
 *     set contract) that owns all tier logic, referredCount tracking, push-then-
 *     escrow payout, and the full RAL-compatible Attribution event. If the router
 *     is unset OR its call reverts, the full Operations slice falls back to the
 *     Operations wallet (no referral) so a buy can NEVER be blocked.
 *
 *  6. CONTINUITY WITH V1 (no double-counting). Member numbers are a single
 *     global sequence. V2 is constructed with the final V1 unique-member count
 *     as an immutable offset, AND with an immutable Merkle root of all V1
 *     member addresses. A V1 member who buys (or registers) in V2 is recognized
 *     as an EXISTING member: they get NO new seat and do NOT advance the seat
 *     boundary. Identity (member #N) remains indexer-derived across both
 *     contracts; the Merkle root only prevents double-counting and enables V1
 *     members to act as referrers.
 */
contract SyndicateSaleV2 is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --------------------------------------------------------------- errors
    error ZeroAddress();
    error BadGenesisOffset();
    error BadEraCaps();
    error SaleConcluded();
    error BelowEraMinimum(uint256 min);
    error ExceedsTxMax(uint256 maxTx);
    error AddressEraCapExceeded(uint256 capRemaining);
    error EraInventoryInsufficient(uint256 eraCapRemaining);
    error InsufficientInventory(uint256 available);
    error SlippageExceeded(uint256 got, uint256 minOut);
    error NotWindingDown();
    error RecoveryTimelocked(uint256 readyAt);
    error ProtectedToken();
    error RouterTimelocked(uint256 readyAt);
    error AlreadyKnown();
    error InvalidProof();
    error ReserveFloorViolation(uint256 maxSynOut);

    // ----------------------------------------------- era-advance reason codes
    uint8 internal constant REASON_RANGE = 0; // member-range ceiling reached
    uint8 internal constant REASON_CAP   = 1; // era SYN sold-cap exhausted

    // --------------------------------------------------------------- events
    event Purchased(
        address indexed buyer,
        uint256 indexed memberNumber,   // authoritative only when firstSeat==true
        uint16  indexed era,
        uint256 usdcIn,
        uint256 synOut,
        uint64  synPerUsdc,
        bool    firstSeat
    );
    event Routed(
        uint256 indexed memberNumber,
        uint256 vaultAmount,
        uint256 liquidityAmount,
        uint256 operationsAmount,
        uint256 referralAmount
    );
    event CommissionRouterProposed(address indexed router, uint64 readyAt);
    event CommissionRouterConfirmed(address indexed router);
    event CommissionRouterDisabled(address indexed previousRouter);
    event CommissionRouterFallback(uint256 indexed memberNumber, uint256 operationsAmount);
    // `reason` distinguishes a NATURAL boundary open (range filled, atSeatNumber
    // == first seat of the new era) from a CAP-triggered advance (atSeatNumber
    // == the next seat to be issued, which may be mid-range).
    event EraAdvanced(uint16 indexed fromEra, uint16 indexed toEra, uint256 atSeatNumber, uint8 reason);
    event V1MembershipRecognized(address indexed member);
    event UnsoldSynRecovered(address indexed to, uint256 amount);
    // Pause events (Paused / Unpaused) come from OpenZeppelin Pausable.
    // Ownership events come from OpenZeppelin Ownable / Ownable2Step.

    // ----------------------------------------------------------- immutables
    IERC20  public immutable USDC;            // Avalanche native USDC (6dp)
    IERC20  public immutable SYN;             // SYN token (18dp, fixed supply)
    address public immutable VAULT;           // 70% — 0x205DdC...464
    address public immutable LIQUIDITY;       // 20% — 0xa9b0...e25
    address public immutable OPERATIONS;      // 10% — 0x5cb5...E80
    uint256 public immutable GENESIS_OFFSET;  // final V1 unique-member count
    bytes32 public immutable V1_MEMBER_ROOT;  // Merkle root of V1 member addresses
    uint256 public immutable MAX_USDC_PER_TX; // per-transaction ceiling (6dp)
    // Seat-reserve target (a GLOBAL seat number). 0 = disabled; 10_000 = reserve
    // every Era II-IV seat at its OWN era minimum (RECOMMENDED default); 1_000_000
    // = full hard-reserve guaranteeing all 1,000,000 seats (Option 2 / J16). Set
    // once; the contract must be FUNDED above the initial reserve or the first buy
    // reverts. Per-era anti-whale ADDRESS caps are a mapping set in the constructor
    // (arrays cannot use the `immutable` keyword) -- see `maxUsdcPerAddressPerEra`.
    uint256 public immutable RESERVE_THROUGH_SEAT;

    uint256 private constant GENESIS_END   = 333;
    uint256 private constant FINAL_SEAT    = 1_000_000;
    uint256 private constant SCALE_6_TO_18 = 1e12;
    uint256 public  constant RECOVERY_TIMELOCK = 14 days; // delay on the PAUSED recovery path
    uint256 public  constant ROUTER_TIMELOCK   = 14 days; // delay on SWAPPING the commission router

    // ---------------------------------------------------------------- state
    uint64  public pausedAt;          // timestamp of the last false->true pause
    uint256 public memberCount;       // global; starts at GENESIS_OFFSET
    uint256 public totalUsdcRaised;   // V2 only (6dp)
    uint256 public totalSynSold;      // V2 only (18dp)
    uint16  public activeEra;         // CURRENT sellable era (advanced, never derived-only)

    // Per-era SYN sold-caps (18dp). Immutable after construction (no setter).
    // eraSynCap[e] limits soldInEra[e]; both indexed by era 1..9.
    mapping(uint16 => uint256) public eraSynCap;
    mapping(uint16 => uint256) public soldInEra;

    // Per-era anti-whale ADDRESS caps (USDC 6dp), indexed by era 1..9. Set once
    // in the constructor (no setter). REPLACES the prior single global cap: one
    // value that was safe for a late era let a single wallet drain a tiny early
    // era, so the per-address ceiling is now sized PER ERA (tiny for the cheap
    // early eras, ~$25k-class late). Values are HUMAN REVIEW J3.
    mapping(uint16 => uint256) public maxUsdcPerAddressPerEra;

    mapping(address => bool)    public knownMember;     // V1-proven OR V2-bought
    mapping(address => uint256) public memberNumberOf;  // set for V2-new seats only
    mapping(address => uint256) public usdcContributed; // lifetime, per address (V2)
    mapping(address => mapping(uint16 => uint256)) public usdcByAddressEra; // anti-whale
    // CommissionRouter wiring. The FIRST router may be set ONCE at construction
    // (day-one referral); later SWAPS are timelocked (adding trust is delayed).
    // Disabling is instant (removing trust is always safe). See the admin section.
    address public commissionRouter;
    address public pendingCommissionRouter;
    uint64  public commissionRouterReadyAt;

    // ------------------------------------------------------------ construct
    /**
     * @param genesisOffset  Final V1 unique-member count at handoff. Any value in
     *                       [0, FINAL_SEAT). Model 2: V2 CONTINUES Genesis from
     *                       seat `genesisOffset + 1`; if V1 sealed BELOW the Genesis
     *                       ceiling (333) the remaining Genesis seats are sold by V2
     *                       at Era I pricing, and Era II still opens at seat #334.
     *                       MUST equal the REAL V1 count — the chain cannot verify
     *                       it, so a too-high value would invent phantom seats. See
     *                       HUMAN REVIEW item J1.
     * @param v1MemberRoot   Merkle root of the V1 member address set, frozen at
     *                       handoff. Lets V2 recognize V1 members without
     *                       double-counting seats. See HUMAN REVIEW item J12.
     * @param addrCaps       Per-era anti-whale ADDRESS caps in USDC 6dp units,
     *                       index 0..8 => era 1..9. Each SELLABLE era's cap MUST
     *                       be >= that era's USDC minimum (else no one could clear
     *                       the era min). Size tiny for the cheap early eras and
     *                       larger (~$25k-class) late (J3).
     * @param maxUsdcPerTx   Per-transaction USDC ceiling, 6dp; MUST be >= the
     *                       largest sellable era minimum (J14).
     * @param reserveThroughSeat  Seat-reserve target (a GLOBAL seat number).
     *                       0 = no reserve; 10_000 = reserve every Era II-IV seat
     *                       at its own era minimum (RECOMMENDED); 1_000_000 = full
     *                       hard-reserve for all 1M seats (Option 2 / J16). The
     *                       contract must be FUNDED with >= the resulting initial
     *                       reserve or the first buy reverts.
     * @param eraCaps        Per-era SYN sold-caps (18dp), index 0..8 => era 1..9.
     *                       eraCaps[0] (Era 1 / Genesis) is IGNORED in BOTH paths —
     *                       pass 0. When genesisOffset >= 333 Genesis is V1-sealed;
     *                       under Model 2 (genesisOffset < 333) Genesis is RANGE-
     *                       bounded (this constructor forces eraSynCap[1] =
     *                       type(uint256).max), so it advances to Era II only at seat
     *                       #334, never by aggregate-cap exhaustion — any eraCaps[0]
     *                       value is accepted and discarded. Each SELLABLE era II-IX
     *                       cap MUST fit at least one minimum entry; recommended
     *                       sizing per funding model (J13).
     * @param initialRouter  Optional day-one CommissionRouter (address(0) = launch
     *                       with referral OFF). Granted a max USDC allowance so it
     *                       can PULL the Operations slice during buy(). Later swaps
     *                       go through the timelocked propose/confirm flow.
     *
     *  NOTE: This constructor does NOT pull SYN. The contract must be funded
     *  with its membership-distribution SYN allocation in a SEPARATE,
     *  explicitly-authorized transaction AFTER review (honors "do not migrate
     *  funds" during the design phase). Owner is set to the deployer (transfer to
     *  the governance multisig via the 2-step flow post-deploy).
     */
    constructor(
        address usdc,
        address syn,
        address vault,
        address liquidity,
        address operations,
        uint256 genesisOffset,
        bytes32 v1MemberRoot,
        uint256[9] memory addrCaps,
        uint256 maxUsdcPerTx,
        uint256 reserveThroughSeat,
        uint256[9] memory eraCaps,
        address initialRouter
    ) Ownable(msg.sender) {
        if (
            usdc == address(0) || syn == address(0) || vault == address(0) ||
            liquidity == address(0) || operations == address(0)
        ) revert ZeroAddress();
        // Model 2: genesisOffset may be ANY real V1 count in [0, FINAL_SEAT). When
        // it is below the Genesis ceiling (GENESIS_END = 333), V2 continues selling
        // Genesis seats from `genesisOffset + 1` at Era I pricing (the era-cap loop
        // below then validates the Era I caps). Only the UPPER bound is enforceable
        // on-chain — the chain cannot verify the count is real, so a too-high value
        // (phantom seats) is a deploy-discipline concern, not a contract check. J1.
        if (genesisOffset >= FINAL_SEAT) revert BadGenesisOffset();
        if (maxUsdcPerTx == 0) revert BadEraCaps();
        // Seat-reserve target must be disabled (0) or a real future seat in
        // (GENESIS_END, FINAL_SEAT]. 10_000 = Era II-IV reserve; 1_000_000 = full.
        if (
            reserveThroughSeat != 0 &&
            (reserveThroughSeat <= GENESIS_END || reserveThroughSeat > FINAL_SEAT)
        ) revert BadEraCaps();

        USDC = IERC20(usdc);
        SYN = IERC20(syn);
        VAULT = vault;
        LIQUIDITY = liquidity;
        OPERATIONS = operations;
        GENESIS_OFFSET = genesisOffset;
        V1_MEMBER_ROOT = v1MemberRoot;
        MAX_USDC_PER_TX = maxUsdcPerTx;
        RESERVE_THROUGH_SEAT = reserveThroughSeat;

        memberCount = genesisOffset;
        uint16 startEra = _eraIndexForSeat(genesisOffset + 1);
        activeEra = startEra;

        // Each SELLABLE era must: (a) have a SYN sold-cap that fits at least one
        // minimum entry (else dead-on-arrival), AND (b) have a per-address cap
        // >= its own USDC minimum (else NO buyer could ever clear the era min).
        // The per-tx ceiling must also clear the largest sellable era minimum.
        // Full sizing is J13 (SYN caps) / J3 (address caps) / J14 (per-tx).
        for (uint16 e = startEra; e <= 9; ++e) {
            (, uint256 minU,) = _eraParams(e);
            if (addrCaps[e - 1] < minU) revert BadEraCaps();
            if (maxUsdcPerTx < minU) revert BadEraCaps();
            if (e == 1) {
                // ---- Genesis (Era 1) under Model 2 continuation ----
                // Genesis is bounded by the 333-SEAT RANGE, NOT by an aggregate
                // SYN throttle. The ratified Model 2 invariant is that V2 sells
                // EVERY remaining Genesis seat at Era I pricing and that Era II
                // opens at #334. A FINITE eraCaps[0] would break this: repeat /
                // recognized-V1 buys grow soldInEra[1] WITHOUT advancing
                // memberCount, so the cap could exhaust and `_syncEra` would
                // advance to Era II BEFORE seat #334, mispricing Genesis seats.
                // So the Genesis aggregate cap is set NON-BINDING (max) and
                // eraCaps[0] is IGNORED (a Model 2 deploy may pass 0). Anti-whale
                // for Genesis is the per-address cap (addrCaps[0], e.g. $5 = one
                // seat) + the 333 ceiling + the reserve floor + funded inventory.
                // (When V2 starts in Era II+, startEra > 1 and this branch never
                // runs, so the recommended pause-at-333 path is byte-for-byte
                // unaffected. Eras II-IX keep the per-era SYN throttle below.)
                eraSynCap[e] = type(uint256).max;
            } else {
                // Each SELLABLE era (II-IX) must have a SYN sold-cap that fits at
                // least one minimum entry (else dead-on-arrival).
                uint256 cap = eraCaps[e - 1];
                if (cap < _minEntrySyn(e)) revert BadEraCaps();
                eraSynCap[e] = cap;
            }
            maxUsdcPerAddressPerEra[e] = addrCaps[e - 1];
        }
        // Non-sellable lower eras (e < startEra, e.g. Genesis) keep their cap
        // values verbatim for transparency; they are never sold by V2.
        for (uint16 e = 1; e < startEra; ++e) {
            eraSynCap[e] = eraCaps[e - 1];
            maxUsdcPerAddressPerEra[e] = addrCaps[e - 1];
        }

        // Day-one referral: optionally wire the CommissionRouter at construction and
        // grant it a max USDC allowance so it can PULL the Operations slice during
        // buy(). Pass address(0) to launch with referral OFF (safe base behavior);
        // a router can be added later via the timelocked setter. ALL LATER swaps go
        // through proposeCommissionRouter -> confirmCommissionRouter (timelocked).
        if (initialRouter != address(0)) {
            commissionRouter = initialRouter;
            USDC.forceApprove(initialRouter, type(uint256).max);
            emit CommissionRouterConfirmed(initialRouter);
        }
    }

    // =================================================== V1 recognition
    /// @notice Register as an existing V1 member (e.g. to act as a referrer)
    ///         without buying. Idempotent; reverts if already known or proof bad.
    function claimV1Membership(bytes32[] calldata proof) external {
        if (knownMember[msg.sender]) revert AlreadyKnown();
        if (!_verifyV1(proof, msg.sender)) revert InvalidProof();
        knownMember[msg.sender] = true;
        emit V1MembershipRecognized(msg.sender);
    }

    // ============================================================ purchase
    /**
     * @notice Buy SYN at the CURRENT era rate. Hybrid/proportional, single-era.
     * @param usdcIn    USDC amount (6dp). Must be >= current era minimum and
     *                  <= MAX_USDC_PER_TX, and fit the per-address-per-era cap.
     * @param referrer  Optional referrer (existing member, not self). 0 = none.
     * @param minSynOut Slippage floor.
     * @param v1Proof   Merkle proof that msg.sender is a V1 member. Pass an
     *                  EMPTY array for protocol-newcomers and already-known
     *                  members. Supplying it for a V1 member prevents a new
     *                  (double-counted) seat being issued.
     *
     *  NO SILENT SPLIT / NO PARTIAL FILL: a purchase is priced entirely at one
     *  era. If it cannot fit the active era's remaining SYN cap, it REVERTS
     *  (`EraInventoryInsufficient`) — the buyer sizes down. The era only
     *  advances between buys, automatically, via `_syncEra`.
     */
    function buy(uint256 usdcIn, address referrer, uint256 minSynOut, bytes32[] calldata v1Proof)
        external
        nonReentrant
        whenNotPaused
    {
        // Recognize V1 membership first so a returning V1 member is NOT minted
        // a new seat / does NOT advance the seat boundary.
        if (v1Proof.length > 0 && !knownMember[msg.sender] && _verifyV1(v1Proof, msg.sender)) {
            knownMember[msg.sender] = true;
            emit V1MembershipRecognized(msg.sender);
        }

        // Roll the era forward (emits EraAdvanced per step) and detect conclusion.
        (uint16 era, bool concluded) = _syncEra();
        if (concluded || memberCount >= FINAL_SEAT) revert SaleConcluded();

        (uint64 synPerUsdc, uint256 minUsdc6,) = _eraParams(era);
        if (usdcIn < minUsdc6) revert BelowEraMinimum(minUsdc6);
        if (usdcIn > MAX_USDC_PER_TX) revert ExceedsTxMax(MAX_USDC_PER_TX);

        // anti-whale: per-address, per-era cumulative USDC cap (sized PER ERA)
        uint256 spentThisEra = usdcByAddressEra[msg.sender][era];
        {
            uint256 addrCap = maxUsdcPerAddressPerEra[era];
            if (spentThisEra + usdcIn > addrCap) revert AddressEraCapExceeded(addrCap - spentThisEra);
        }

        // exact pricing (no division)
        uint256 synOut = usdcIn * uint256(synPerUsdc) * SCALE_6_TO_18;
        if (synOut < minSynOut) revert SlippageExceeded(synOut, minSynOut);

        // per-era aggregate SYN sold-cap (NO partial fill — revert if it won't fit)
        uint256 eraRemaining = eraSynCap[era] - soldInEra[era];
        if (synOut > eraRemaining) revert EraInventoryInsufficient(eraRemaining);

        // global inventory (the contract's own funded SYN balance)
        uint256 available = SYN.balanceOf(address(this));
        if (synOut > available) revert InsufficientInventory(available);

        // SEAT-RESERVE invariant: never sell so much SYN that the seats still to
        // be issued (up to RESERVE_THROUGH_SEAT) could no longer be seated at
        // their OWN era minimum. `firstSeat` is computed HERE (after V1
        // recognition) and REUSED in effects; a repeat / recognized-V1 buyer
        // issues no seat, so `mAfter` is unchanged. REVERT (never silent-cap) —
        // consistent with the no-partial-fill doctrine; the buyer sizes down.
        bool firstSeat = !knownMember[msg.sender];
        {
            uint256 reserveAfter = _reserveSyn(memberCount + (firstSeat ? 1 : 0));
            uint256 sellableNow = available > reserveAfter ? available - reserveAfter : 0;
            if (synOut > sellableNow) revert ReserveFloorViolation(sellableNow);
        }

        // splits (70/20/10, remainder-safe). Vault & Liquidity are NEVER diluted;
        // the ENTIRE Operations slice (10%) is routed through the CommissionRouter,
        // which owns ALL referral tier logic. Sale V2 computes NO referral rate.
        uint256 vaultAmt = (usdcIn * 70) / 100;
        uint256 liqAmt = (usdcIn * 20) / 100;
        uint256 opsSlice = usdcIn - vaultAmt - liqAmt; // exact remainder == ~10%

        // ================= EFFECTS (state before interactions) =============
        // `firstSeat` was computed above (reserve check) and is reused here.
        uint256 assignedNumber;
        if (firstSeat) {
            knownMember[msg.sender] = true;
            memberCount += 1;
            memberNumberOf[msg.sender] = memberCount;
            assignedNumber = memberCount;
        } else {
            // 0 for recognized V1 members (indexer is the authoritative source).
            assignedNumber = memberNumberOf[msg.sender];
        }

        soldInEra[era] += synOut;
        usdcByAddressEra[msg.sender][era] = spentThisEra + usdcIn;
        usdcContributed[msg.sender] += usdcIn;
        totalUsdcRaised += usdcIn;
        totalSynSold += synOut;

        // ================= INTERACTIONS ====================================
        // Pull the FULL payment in, THEN fan out. Vault & Liquidity are paid first
        // and IN FULL. The Operations slice is handed to the CommissionRouter,
        // which pays the referrer (tiered, from Operations only) and forwards the
        // remainder to the Operations wallet. If the router is unset OR its call
        // reverts, the FULL Operations slice falls back to the Operations wallet so
        // a buy can NEVER be blocked by the referral path.
        USDC.safeTransferFrom(msg.sender, address(this), usdcIn);
        _send(USDC, VAULT, vaultAmt);
        _send(USDC, LIQUIDITY, liqAmt);

        address router = commissionRouter;
        if (router != address(0)) {
            CommissionRouteInput memory ri = CommissionRouteInput({
                buyer: msg.sender,
                referrer: referrer,
                gross: usdcIn,
                vaultAmount: vaultAmt,
                liquidityAmount: liqAmt,
                opsSlice: opsSlice,
                firstSeat: firstSeat,
                campaign: bytes32(0), // reserved (registered campaign id) — future
                refTag: bytes32(0)    // reserved (raw analytics tag) — future
            });
            // The router PULLS opsSlice via transferFrom (Sale V2 pre-approved it
            // when the router was set). A revert reverts that pull in the SAME
            // frame, so the catch path re-routes the UNTOUCHED slice safely.
            try ICommissionRouter(router).route(ri) returns (uint256 refPaid, uint256 opsPaid) {
                emit Routed(assignedNumber, vaultAmt, liqAmt, opsPaid, refPaid);
            } catch {
                _send(USDC, OPERATIONS, opsSlice);
                emit CommissionRouterFallback(assignedNumber, opsSlice);
                emit Routed(assignedNumber, vaultAmt, liqAmt, opsSlice, 0);
            }
        } else {
            // Router unset — safe base behavior: full Operations slice, no referral.
            _send(USDC, OPERATIONS, opsSlice);
            emit Routed(assignedNumber, vaultAmt, liqAmt, opsSlice, 0);
        }

        _send(SYN, msg.sender, synOut);

        emit Purchased(msg.sender, assignedNumber, era, usdcIn, synOut, synPerUsdc, firstSeat);
    }

    // ================================================================ views
    function quote(uint256 usdcIn)
        external
        view
        returns (
            uint256 synOut,
            uint16 era,
            uint64 synPerUsdc,
            uint256 seatIfFirst,
            uint256 available,
            uint256 eraCapRemaining
        )
    {
        bool concluded;
        (era, concluded) = _resolveEraView();
        if (concluded || memberCount >= FINAL_SEAT) revert SaleConcluded();
        (synPerUsdc,,) = _eraParams(era);
        synOut = usdcIn * uint256(synPerUsdc) * SCALE_6_TO_18;
        seatIfFirst = memberCount + 1;
        available = SYN.balanceOf(address(this));
        eraCapRemaining = eraSynCap[era] - soldInEra[era];
    }

    function currentEra() external view returns (uint16) {
        (uint16 era, bool concluded) = _resolveEraView();
        return concluded ? 0 : era; // 0 == concluded
    }

    function remainingEraCap(uint16 era) external view returns (uint256) {
        uint256 cap = eraSynCap[era];
        uint256 sold = soldInEra[era];
        return cap > sold ? cap - sold : 0;
    }

    function nextSeatNumber() external view returns (uint256) { return memberCount + 1; }
    function availableSyn() external view returns (uint256) { return SYN.balanceOf(address(this)); }

    /// @notice SYN currently sellable to a buyer who WOULD take a new seat,
    ///         without breaching the seat reserve (RESERVE_THROUGH_SEAT). This is
    ///         OPTIMISTIC for a new seat (the buyer's own seat is excluded from
    ///         the reserve); a repeat / recognized-V1 buyer's ceiling is one seat
    ///         LOWER. Frontends must size a buy against this AND the era + address
    ///         caps, then set `minSynOut` from `quote()`. 0 when at the floor.
    function sellableSynForNextSeat() external view returns (uint256) {
        uint256 bal = SYN.balanceOf(address(this));
        uint256 r = _reserveSyn(memberCount + 1);
        return bal > r ? bal - r : 0;
    }

    /// @notice SYN currently reserved to seat the remaining members up to
    ///         RESERVE_THROUGH_SEAT at their own era minimums. 0 when the reserve
    ///         is disabled or the target seat has already been passed.
    function currentReserveFloor() external view returns (uint256) {
        return _reserveSyn(memberCount);
    }

    function isConcluded() public view returns (bool) {
        if (memberCount >= FINAL_SEAT) return true;
        (, bool concluded) = _resolveEraView();
        return concluded;
    }

    /// @notice POSITIONAL preview only — the era a seat WOULD fall in by member
    ///         range alone. NOT the executable price: cap-triggered advances mean
    ///         the live price comes from `currentEra()`/`quote()`, not seat number.
    function eraOfSeat(uint256 seat) external pure returns (uint16) { return _eraIndexForSeat(seat); }

    // ===================================================== era engine (state)
    /// @dev Roll `activeEra` forward while the current era is closed (member
    ///      range reached OR its cap can't fit a minimum entry). Emits one
    ///      EraAdvanced per step with the triggering reason + seat. Mutating
    ///      twin of `_resolveEraView`.
    function _syncEra() internal returns (uint16 era, bool concluded) {
        era = activeEra == 0 ? 1 : activeEra;
        while (true) {
            (uint64 spu, uint256 minU, uint256 endSeat) = _eraParams(era);
            uint256 minEntry = minU * uint256(spu) * SCALE_6_TO_18;
            bool rangeFilled = memberCount >= endSeat;
            bool capExhausted = (eraSynCap[era] - soldInEra[era]) < minEntry;
            if (!rangeFilled && !capExhausted) { concluded = false; break; }
            if (era == 9) { concluded = true; break; }
            uint8 reason = rangeFilled ? REASON_RANGE : REASON_CAP;
            uint256 atSeat = rangeFilled ? endSeat + 1 : memberCount + 1;
            emit EraAdvanced(era, era + 1, atSeat, reason);
            era += 1;
        }
        if (era != activeEra) activeEra = era;
    }

    /// @dev Read-only twin of `_syncEra` for views (no emit, no state write).
    function _resolveEraView() internal view returns (uint16 era, bool concluded) {
        era = activeEra == 0 ? 1 : activeEra;
        while (true) {
            (uint64 spu, uint256 minU, uint256 endSeat) = _eraParams(era);
            uint256 minEntry = minU * uint256(spu) * SCALE_6_TO_18;
            bool rangeFilled = memberCount >= endSeat;
            bool capExhausted = (eraSynCap[era] - soldInEra[era]) < minEntry;
            if (!rangeFilled && !capExhausted) return (era, false);
            if (era == 9) return (9, true);
            era += 1;
        }
    }

    // ============================================================ admin (min)
    function pause() external onlyOwner {
        _pause();
        pausedAt = uint64(block.timestamp);
    }
    function unpause() external onlyOwner {
        _unpause();
        pausedAt = 0;
    }

    // ============================================ commission router (referral)
    /// @notice Propose a NEW CommissionRouter. Two-step + timelocked: ADDING trust
    ///         is delayed (ROUTER_TIMELOCK) so a router swap cannot be slipped in
    ///         silently. address(0) is rejected here — use disableCommissionRouter
    ///         to turn referral OFF instantly. (The FIRST router may instead be set
    ///         once at construction for day-one referral.)
    function proposeCommissionRouter(address router) external onlyOwner {
        if (router == address(0)) revert ZeroAddress();
        pendingCommissionRouter = router;
        commissionRouterReadyAt = uint64(block.timestamp + ROUTER_TIMELOCK);
        emit CommissionRouterProposed(router, commissionRouterReadyAt);
    }

    /// @notice Activate the proposed router after the timelock. Zeroes the OLD
    ///         router's USDC allowance and grants the NEW router a max USDC
    ///         allowance so it can PULL the Operations slice during buy().
    function confirmCommissionRouter() external onlyOwner {
        address router = pendingCommissionRouter;
        if (router == address(0)) revert ZeroAddress();
        uint256 readyAt = commissionRouterReadyAt;
        if (block.timestamp < readyAt) revert RouterTimelocked(readyAt);
        address old = commissionRouter;
        if (old != address(0)) USDC.forceApprove(old, 0);
        commissionRouter = router;
        pendingCommissionRouter = address(0);
        commissionRouterReadyAt = 0;
        USDC.forceApprove(router, type(uint256).max);
        emit CommissionRouterConfirmed(router);
    }

    /// @notice Instantly DISABLE referral routing (no timelock — removing trust is
    ///         always safe). Buys then route the full Operations slice straight to
    ///         the Operations wallet (no referral) until a new router is confirmed.
    function disableCommissionRouter() external onlyOwner {
        address old = commissionRouter;
        if (old != address(0)) USDC.forceApprove(old, 0);
        commissionRouter = address(0);
        pendingCommissionRouter = address(0);
        commissionRouterReadyAt = 0;
        emit CommissionRouterDisabled(old);
    }

    /// @notice Return remaining unsold SYN to the immutable Vault. Allowed when:
    ///           - the sale has CONCLUDED (all seats issued, or era 9 inventory
    ///             can no longer fit a minimum entry); OR
    ///           - the sale has been PAUSED for at least RECOVERY_TIMELOCK
    ///             (deliberate, pre-announced wind-down — e.g. dust below any
    ///             era minimum).
    ///         The timelock blocks an instant pause+sweep; destination is
    ///         Vault-only (no discretionary owner SYN drain exists, ever). A
    ///         multisig owner is recommended (J4/J15).
    function recoverUnsoldSyn() external onlyOwner {
        bool concluded = isConcluded();
        if (!concluded) {
            if (!paused()) revert NotWindingDown();
            uint256 readyAt = uint256(pausedAt) + RECOVERY_TIMELOCK;
            if (pausedAt == 0 || block.timestamp < readyAt) revert RecoveryTimelocked(readyAt);
        }
        uint256 bal = SYN.balanceOf(address(this));
        _send(SYN, VAULT, bal);
        emit UnsoldSynRecovered(VAULT, bal);
    }

    /// @notice Rescue tokens sent here by mistake. CANNOT touch USDC or SYN.
    ///         Destination is the immutable Vault.
    function rescueToken(address token) external onlyOwner {
        if (token == address(USDC) || token == address(SYN)) revert ProtectedToken();
        IERC20 t = IERC20(token);
        _send(t, VAULT, t.balanceOf(address(this)));
    }

    // ====================================================== era schedule (pure)
    // IMMUTABLE, hardcoded in bytecode. Boundaries are GLOBAL seat numbers and
    // match src/lib/eras.ts exactly. synPerUsdc is an exact integer per era.
    // `_eraParams` (indexed by era) is THE single source; `_eraIndexForSeat`
    // derives the positional era from a seat by walking this table.
    function _eraParams(uint16 era)
        internal
        pure
        returns (uint64 synPerUsdc, uint256 minUsdc6, uint256 endSeat)
    {
        if (era == 1) return (100, 5_000_000, 333);       // Genesis
        if (era == 2) return (50, 10_000_000, 1_000);
        if (era == 3) return (40, 10_000_000, 3_333);
        if (era == 4) return (16, 25_000_000, 10_000);
        if (era == 5) return (12, 25_000_000, 25_000);
        if (era == 6) return (6, 50_000_000, 50_000);
        if (era == 7) return (4, 50_000_000, 100_000);
        if (era == 8) return (2, 100_000_000, 250_000);
        if (era == 9) return (1, 100_000_000, 1_000_000);
        revert SaleConcluded();
    }

    /// @dev Minimum-entry SYN (18dp) for an era: minUsdc6 * synPerUsdc * 1e12.
    function _minEntrySyn(uint16 era) internal pure returns (uint256) {
        (uint64 spu, uint256 minU,) = _eraParams(era);
        return minU * uint256(spu) * SCALE_6_TO_18;
    }

    function _eraIndexForSeat(uint256 seat) internal pure returns (uint16) {
        for (uint16 e = 1; e <= 9; ++e) {
            (,, uint256 endSeat) = _eraParams(e);
            if (seat <= endSeat) return e;
        }
        revert SaleConcluded();
    }

    /// @dev SYN that must REMAIN to seat members (m+1 .. RESERVE_THROUGH_SEAT) at
    ///      EACH one's own era minimum. Costs every remaining reservable seat at
    ///      its era's `_minEntrySyn` — NOT a blanket current-era rate (the naive
    ///      blanket formula under/over-reserves once eras differ). O(9): iterates
    ///      eras, not seats. `view` (reads the RESERVE_THROUGH_SEAT immutable),
    ///      not `pure`. Returns 0 when the reserve is disabled or m >= target.
    function _reserveSyn(uint256 m) internal view returns (uint256 reserve) {
        uint256 target = RESERVE_THROUGH_SEAT;
        if (target == 0 || m >= target) return 0;
        uint256 prevEnd = 0;
        for (uint16 e = 1; e <= 9; ++e) {
            (uint64 spu, uint256 minU, uint256 endSeat) = _eraParams(e);
            uint256 segEnd = endSeat < target ? endSeat : target;
            uint256 already = m > prevEnd ? m : prevEnd; // already-seated lower bound
            if (segEnd > already) {
                reserve += (segEnd - already) * (minU * uint256(spu) * SCALE_6_TO_18);
            }
            prevEnd = endSeat;
            if (endSeat >= target) break;
        }
    }

    // ===================================================== merkle (production)
    /// @dev OpenZeppelin MerkleProof.verify with a STANDARD double-hashed leaf:
    ///      keccak256(bytes.concat(keccak256(abi.encode(who)))). This matches the
    ///      OpenZeppelin merkle-tree JS package (StandardMerkleTree) built over
    ///      ["address"] leaves (commutative/sorted-pair hashing). See
    ///      contracts/README.md for the exact V1_MEMBER_ROOT generation procedure.
    function _verifyV1(bytes32[] calldata proof, address who) internal view returns (bool) {
        if (V1_MEMBER_ROOT == bytes32(0)) return false;
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(who))));
        return MerkleProof.verify(proof, V1_MEMBER_ROOT, leaf);
    }

    // ===================================================== safe ERC20 (helper)
    /// @dev SafeERC20 transfer with a zero-amount short-circuit (skips no-op
    ///      transfers; some non-standard rescue tokens revert on zero). USDC/SYN
    ///      movement uses this; the buy-time pull uses safeTransferFrom directly.
    function _send(IERC20 token, address to, uint256 amount) private {
        if (amount == 0) return;
        token.safeTransfer(to, amount);
    }
}
