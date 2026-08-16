export default {
  reviewDate: "2026-08-16",
  chapters: {
    "1": {
      comparison: [
        { decision: "Exact recency", choose: "Hash map + doubly linked list", avoid: "Scanning an array after every access" },
        { decision: "Frequency with recency ties", choose: "Frequency buckets containing LRU order", avoid: "One global order that loses the tie-break" },
        { decision: "Live rank selection", choose: "Fenwick tree, blocks, or an implicit tree", avoid: "Physical indexes after deletions" }
      ],
      assessment: [
        { prompt: "Redesign LRU Cache when reads do not refresh recency.", rubric: ["Name the new ordering event", "Remove the unnecessary mutation from get", "Preserve O(1) lookup and eviction"] },
        { prompt: "Explain why LFU needs more than a key-to-value map.", rubric: ["Locate the key directly", "Locate the minimum frequency directly", "Preserve recency inside a frequency"] },
        { prompt: "Choose between a linked order and a rank index for a new queue API.", rubric: ["Write operation costs first", "Identify whether access is by node or rank", "State the ownership invariant"] }
      ]
    },
    "2": {
      comparison: [
        { decision: "Fixed item window", choose: "Queue + running aggregate", avoid: "Recomputing the entire window" },
        { decision: "Fixed time horizon", choose: "Timestamp queue or circular time buckets", avoid: "Ignoring inclusive boundary semantics" },
        { decision: "Correctable historical values", choose: "Authoritative map + lazy or eager extrema index", avoid: "Trusting stale heap entries" }
      ],
      assessment: [
        { prompt: "Convert a verbal 300-second rule into an exact interval.", rubric: ["Write both endpoints", "Choose the inclusive side", "Trace exactly boundary-300 and boundary-301"] },
        { prompt: "Select queue events or circular buckets for a high-volume counter.", rubric: ["Use the timestamp range", "Account for repeated same-second events", "Compare memory bounds"] },
        { prompt: "Explain why Stock Price cannot use the same cleanup proof as Recent Counter.", rubric: ["Identify correction support", "Reject monotonic arrival as an assumption", "Name the canonical record"] }
      ]
    },
    "3": {
      comparison: [
        { decision: "Circular buffer state", choose: "Head + count or spare slot", avoid: "Equal pointers with no empty/full discriminator" },
        { decision: "Hash collisions", choose: "Separate chaining or open addressing with a policy", avoid: "Treating the hash as identity" },
        { decision: "Ordered expected search", choose: "Skiplist or balanced tree", avoid: "Claiming deterministic balance for random levels" }
      ],
      assessment: [
        { prompt: "Defend one circular-queue encoding against every boundary state.", rubric: ["Represent empty and full uniquely", "Trace wraparound", "Derive each operation cost"] },
        { prompt: "Extend HashSet into HashMap without repeating the entire design.", rubric: ["Keep collision policy", "Add value replacement", "Define missing-key behavior"] },
        { prompt: "Test a randomized structure deterministically.", rubric: ["Control the random source", "Test structural invariants", "Separate functional correctness from height distribution"] }
      ]
    },
    "4": {
      comparison: [
        { decision: "Rejected command", choose: "Validate, then mutate", avoid: "Partial updates followed by rollback" },
        { decision: "Multi-resource command", choose: "Build a complete plan, then commit", avoid: "Consuming resources while still searching" },
        { decision: "Completed activity summary", choose: "Aggregate by a composite domain key", avoid: "Retaining every raw event without need" }
      ],
      assessment: [
        { prompt: "Write a rejection matrix for a transfer command.", rubric: ["Invalid source", "Invalid destination", "Insufficient balance", "No state changes on every failure"] },
        { prompt: "Separate policy from optimization in the ATM design.", rubric: ["State the mandated order", "Do not substitute general coin change", "Commit only a complete plan"] },
        { prompt: "Add concurrency to one chapter system.", rubric: ["Name the protected state", "Choose a lock or transaction boundary", "Explain atomic visibility"] }
      ]
    },
    "5": {
      comparison: [
        { decision: "Small top-k across sorted histories", choose: "K-way heap merge", avoid: "Sorting all historical records" },
        { decision: "Mutable ranked lifecycle", choose: "Ordered set or versioned lazy heap", avoid: "Multiple independent sources of truth" },
        { decision: "Cursor-local editing", choose: "Two buffers or a gap buffer", avoid: "Rebuilding one immutable document string" }
      ],
      assessment: [
        { prompt: "Draw the canonical record and every query index for Movie Rental.", rubric: ["Availability by movie", "Global rented order", "Complete tie-break tuple", "Atomic lifecycle movement"] },
        { prompt: "Compare eager ordered-set removal with versioned lazy heaps.", rubric: ["Update cost", "Stale-memory growth", "Library availability", "Validation rule"] },
        { prompt: "Design one capstone combining identity reuse, ranking, and lifecycle transitions.", rubric: ["One authoritative entity record", "A query index per public read", "A complete failure trace", "An honest complexity table"] }
      ]
    }
  },
  premiumContracts: {
    "588": {
      summary: "Maintain an in-memory rooted hierarchy that supports directory creation, deterministic listing, file append, and file reads.",
      operations: ["ls(path)", "mkdir(path)", "addContentToFile(filePath, content)", "readContentFromFile(filePath)"],
      assumptions: ["Paths are absolute and slash-separated.", "mkdir may create several missing directories.", "Writing appends to an existing file; directory listings are lexicographically ordered."]
    },
    "604": {
      summary: "Expose hasNext and next over run-length encoded text without expanding the decoded output.",
      operations: ["StringIterator(compressedString)", "next()", "hasNext()"],
      assumptions: ["Each run is one character followed by a positive, possibly multi-digit count.", "next returns a space character after exhaustion.", "The encoded cursor must remain proportional to the compressed input."]
    },
    "1756": {
      summary: "Start with values 1 through n; fetch(k) removes the current k-th value, appends it to the most-recent end, and returns it.",
      operations: ["MRUQueue(n)", "fetch(k)"],
      assumptions: ["Ranks are one-based and always valid.", "Relative order of every other value is preserved.", "The published call bound permits reserved future positions; a dynamic alternative should remove that assumption."]
    },
    "346": {
      summary: "Return the mean of the most recent values in a fixed-size stream window.",
      operations: ["MovingAverage(size)", "next(value)"],
      assumptions: ["The configured size is positive.", "Before the window fills, divide by the number of values received.", "Once full, each arrival expires exactly one oldest value."]
    },
    "359": {
      summary: "Accept a message only when the same text has not been accepted during the previous ten seconds.",
      operations: ["Logger()", "shouldPrintMessage(timestamp, message)"],
      assumptions: ["Calls arrive in nondecreasing timestamp order.", "A rejected call does not extend the message's cooldown.", "A timestamp exactly ten seconds after the last accepted call is allowed."]
    },
    "362": {
      summary: "Record hits and return how many occurred in the immediately preceding 300-second window.",
      operations: ["HitCounter()", "hit(timestamp)", "getHits(timestamp)"],
      assumptions: ["Timestamps arrive chronologically.", "Repeated hits at one timestamp are distinct events.", "At time t, retain hits with timestamps strictly greater than t - 300."]
    },
    "1500": {
      summary: "Manage users that own file chunks, reuse the smallest departed user ID, and grant a requested chunk when at least one owner exists.",
      operations: ["FileSharing(m)", "join(ownedChunks)", "leave(userID)", "request(userID, chunkID)"],
      assumptions: ["Chunk IDs range from 1 through m.", "join returns the smallest available positive user ID.", "request returns existing owners in increasing order before granting ownership to the requester."]
    }
  },
  advanced: {
    "460": {
      trace: { scenario: "Promote the last key in the minimum bucket, then insert while capacity is full.", checkpoints: ["Remove the key from its old bucket.", "Delete the empty bucket and advance minFrequency.", "Evict the LRU key from the new minimum bucket.", "Reset minFrequency to one for the inserted key."] },
      python: "OrderedDict provides O(1) end movement and oldest removal, but each frequency bucket must still be deleted when empty.",
      cpp: "Store list iterators per key; iterator validity survives unrelated list operations but not erasing the pointed node.",
      extension: "Add frequency aging and explain how it prevents an ancient hot key from dominating forever."
    },
    "588": {
      trace: { scenario: "List a file path after appending twice, then list its parent directory.", checkpoints: ["The terminal file produces a one-name result.", "The parent lists child names, not file contents.", "Both operations use the same path parser."] },
      python: "A dictionary keeps traversal direct; sorting only at ls time is often clearer than maintaining order during every mutation.",
      cpp: "unique_ptr gives each directory node exclusive ownership of descendants and prevents manual recursive cleanup.",
      extension: "Add move and delete while preserving node ownership and preventing cycles."
    },
    "2034": {
      trace: { scenario: "Correct the latest timestamp after several older heap records have become stale.", checkpoints: ["The timestamp map changes immediately.", "A new heap version is pushed.", "current reads the latest timestamp's authoritative value.", "maximum and minimum discard stale tops independently."] },
      python: "heapq has only a min-heap, so maximum uses negated prices and both heaps require the same stale-record predicate.",
      cpp: "Two priority queues avoid nonstandard ordered-multiset dependencies; pair ordering supplies deterministic price/timestamp ties.",
      extension: "Compare lazy heaps whose memory grows with updates against an eager multiset whose memory stays proportional to live timestamps."
    },
    "1206": {
      trace: { scenario: "Insert duplicate values, erase one occurrence, and search again under an extreme random height.", checkpoints: ["The predecessor path is reused for mutation.", "Only one duplicate node is removed.", "Every touched level bypasses the same node.", "Search still finds the remaining duplicate."] },
      python: "Injecting or seeding the random source makes structural tests reproducible without changing the expected-complexity argument.",
      cpp: "Raw node ownership needs a destructor in production code; the submission focuses on the required online operations.",
      extension: "Measure the observed height distribution and compare it with a balanced tree's deterministic guarantees."
    },
    "2241": {
      trace: { scenario: "A largest-first plan consumes several notes but leaves a remainder.", checkpoints: ["Record counts in a temporary plan.", "Do not subtract inventory during planning.", "Return failure when the remainder is nonzero.", "Verify the next valid withdrawal sees unchanged stock."] },
      python: "Integer floor division keeps the greedy selection exact; copying five counts for a tentative plan is constant space.",
      cpp: "Use long long for denomination multiplication and the remaining amount even though the public amount is an int.",
      extension: "If any valid combination were allowed, replace mandated greedy selection with a bounded feasibility search."
    },
    "1912": {
      trace: { scenario: "Rent, drop, and rent the same copy repeatedly until stale heap records precede the live version.", checkpoints: ["Increment the canonical version on each transition.", "Push only into the destination lifecycle heap.", "Reject records with the wrong version or rented flag.", "Restore temporarily popped live report records."] },
      python: "Tuple comparison naturally encodes every tie-break; versioned heaps trade simpler mutation for memory proportional to updates.",
      cpp: "Pack the shop/movie identity into a collision-free 64-bit key and keep tuple field order identical to the query contract.",
      extension: "Introduce price changes and list every canonical field and index entry that must be replaced."
    },
    "2296": {
      trace: { scenario: "Alternate large left and right cursor moves after deleting past the beginning.", checkpoints: ["Move only characters that exist.", "The right stack's top remains nearest the cursor.", "Return at most ten characters from the left buffer."] },
      python: "Lists are efficient character stacks; joining only the final ten left characters prevents context construction from scanning the document.",
      cpp: "Strings can act as stacks with push_back and pop_back, keeping storage contiguous and cursor-local operations simple.",
      extension: "Compare the two-stack model with a gap buffer, rope, and Unicode grapheme-aware cursor."
    },
    "432": {
      trace: { scenario: "Move the only key out of both an interior bucket and an end bucket.", checkpoints: ["Create only the adjacent target count when absent.", "Update the key-to-bucket pointer.", "Remove the key from its source bucket.", "Delete the source immediately when empty."] },
      python: "Set iteration may return any tied key, exactly matching the API; tests must compare membership rather than one fixed key.",
      cpp: "std::list keeps bucket iterators stable across neighboring insertion and removal, while unordered_set stores tied keys.",
      extension: "Support incrementing by an arbitrary delta and identify why adjacent-bucket O(1) movement no longer suffices."
    }
  }
};
