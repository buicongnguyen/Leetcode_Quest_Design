export default {
  chapters: {
    "1": {
      prerequisites: [
        "Hash-map lookup and the difference between average and worst-case cost",
        "Singly and doubly linked-list insertion and removal",
        "The idea that one record can be indexed by several structures"
      ],
      outcomes: [
        "Derive an eviction structure from lookup, ordering, and tie-break requirements",
        "Name one authoritative record and keep every secondary index synchronized",
        "Use sentinels, lazy state, or rank indexes to remove expensive scans",
        "Prove the public operation budget from primitive container operations"
      ],
      progression: [
        { id: 146, lesson: "Couple direct lookup with one exact recency order." },
        { id: 460, lesson: "Add frequency as a second ordering dimension and preserve LRU ties." },
        { id: 588, lesson: "Move from a flat cache to hierarchical ownership and deterministic traversal." },
        { id: 604, lesson: "Represent future output with a cursor instead of materializing it." },
        { id: 1756, lesson: "Add rank selection and movement without shifting the whole queue." }
      ],
      failureModes: [
        "Updating the primary map but forgetting the ordering or hierarchy index",
        "Letting empty buckets, head/tail cases, or capacity boundaries corrupt invariants",
        "Choosing an advanced structure before writing the required operation costs"
      ],
      practiceProtocol: [
        "Write the public operations and target costs before naming a data structure.",
        "Draw the authoritative record and arrows from every secondary index.",
        "Trace one update, one rejection, and one removal that empties a boundary bucket.",
        "Implement helpers for structural mutation, then make public methods compose them."
      ],
      bridge: "Chapter 2 keeps the same index discipline but replaces recency with event time, rolling windows, expiry, and correction."
    },
    "2": {
      prerequisites: [
        "Queue and deque operations, including amortized analysis",
        "Monotonic timestamps and inclusive/exclusive interval boundaries",
        "Running aggregates and lazy deletion from heaps"
      ],
      outcomes: [
        "Translate a time rule into an exact active interval",
        "Expire each event once while keeping an aggregate synchronized",
        "Coalesce repeated timestamps when event volume is high",
        "Repair corrected records without trusting stale extrema"
      ],
      progression: [
        { id: 346, lesson: "Maintain one fixed-size window and one scalar aggregate." },
        { id: 359, lesson: "Replace a global window with an independent gate per key." },
        { id: 362, lesson: "Coalesce traffic and maintain a rolling total under a time boundary." },
        { id: 933, lesson: "Use monotonic input to prove amortized queue cleanup." },
        { id: 2034, lesson: "Handle corrections by separating authoritative values from lazy extrema indexes." }
      ],
      failureModes: [
        "Using the wrong side of a 300-second or ten-second boundary",
        "Removing an event without repairing the running aggregate",
        "Assuming timestamps are monotonic in a problem that explicitly allows corrections"
      ],
      practiceProtocol: [
        "Write the mathematical interval before implementing cleanup.",
        "Identify whether arrivals are monotonic and which queries can revisit old timestamps.",
        "Trace the exact boundary and a long idle gap.",
        "For lazy indexes, state the condition that proves a top record is still current."
      ],
      bridge: "Chapter 3 removes library comfort: you will implement the queue, hash, random-access, and ordered machinery that earlier designs consumed."
    },
    "3": {
      prerequisites: [
        "Array indexing, modular arithmetic, pointers, and dynamic memory",
        "Hash functions, equality, collisions, and load factor",
        "Expected-value reasoning for randomized structures"
      ],
      outcomes: [
        "Choose a representation whose states map unambiguously to the public API",
        "Implement collision-safe membership and key/value replacement",
        "Combine a dense array with an index to remove arbitrary values in constant time",
        "Explain both expected and worst-case cost for a probabilistic search structure"
      ],
      progression: [
        { id: 622, lesson: "Encode FIFO state in fixed memory without shifting." },
        { id: 705, lesson: "Own hashing, buckets, equality, and collision behavior." },
        { id: 706, lesson: "Extend membership into replacement, retrieval, and missing-key semantics." },
        { id: 380, lesson: "Synchronize a dense random-access array with a reverse index." },
        { id: 1206, lesson: "Build expected logarithmic search with randomized express lanes." }
      ],
      failureModes: [
        "Using pointer positions that cannot distinguish empty from full",
        "Treating a hash value as identity and losing colliding keys",
        "Claiming deterministic logarithmic cost for a probabilistic structure"
      ],
      practiceProtocol: [
        "Enumerate every valid representation state, including empty and full.",
        "Force collisions and duplicate operations in tests.",
        "After moving an element, repair every stored index before returning.",
        "Separate expected, amortized, and worst-case complexity claims."
      ],
      bridge: "Chapter 4 applies these representations to business commands where validation, rejection, and atomic commitment matter as much as lookup speed."
    },
    "4": {
      prerequisites: [
        "Array and hash-map state models",
        "Guard clauses and composite domain keys",
        "The difference between validation, planning, and mutation"
      ],
      outcomes: [
        "Translate business rules into legal state transitions",
        "Make rejected commands leave every field unchanged",
        "Aggregate completed sessions without retaining raw history",
        "Plan a multi-step resource mutation and commit only after full validation"
      ],
      progression: [
        { id: 1603, lesson: "Start with one guarded capacity transition." },
        { id: 1396, lesson: "Pair active sessions and aggregate completed routes." },
        { id: 1797, lesson: "Add expiry, renewal, and lazy cleanup to entity lifecycle." },
        { id: 2043, lesson: "Validate multi-account commands before an atomic balance update." },
        { id: 2241, lesson: "Separate greedy withdrawal planning from inventory commitment." }
      ],
      failureModes: [
        "Mutating state before every validation has passed",
        "Using ambiguous concatenated strings for directed composite keys",
        "Applying a generally optimal algorithm when the business rule mandates a specific policy"
      ],
      practiceProtocol: [
        "Write a precondition table for every public command.",
        "Split each command into validate, plan, and commit phases.",
        "Trace a successful command and every distinct rejection reason.",
        "Check that numeric types can hold the largest accumulated value."
      ],
      bridge: "Chapter 5 scales the same transaction discipline to systems with multiple query indexes, top-k results, and longer entity lifecycles."
    },
    "5": {
      prerequisites: [
        "Heaps, ordered sets, linked buckets, and k-way merging",
        "Bidirectional indexes and lifecycle state machines",
        "Stack-based cursor models and small expression parsers"
      ],
      outcomes: [
        "Choose one canonical lifecycle record and derive several query views",
        "Maintain top-k results without sorting complete histories",
        "Move entities atomically between availability, ownership, or count indexes",
        "Compare eager removal with lazy validation and explain the memory tradeoff"
      ],
      progression: [
        { id: 355, lesson: "Merge bounded recency across a graph-selected set of histories." },
        { id: 1500, lesson: "Maintain bidirectional ownership while recycling the smallest ID." },
        { id: 1912, lesson: "Synchronize canonical inventory with per-key and global ordered views." },
        { id: 2296, lesson: "Represent a mutable cursor with two local buffers." },
        { id: 3484, lesson: "Keep storage and a deliberately narrow formula grammar separate." },
        { id: 432, lesson: "Finish with constant-time movement through an ordered bucket graph." }
      ],
      failureModes: [
        "Leaving stale entries visible after a lifecycle transition",
        "Sorting all history for a query that asks for only a small top-k prefix",
        "Maintaining two independently mutable sources of truth instead of one record plus views"
      ],
      practiceProtocol: [
        "Draw every public query as an arrow to the index that serves it.",
        "Write the exact tuple order, including every tie-break field.",
        "Trace an entity through a complete lifecycle and verify every view after each move.",
        "Compare an eager ordered-set design with a lazy-heap design before coding."
      ],
      bridge: "After this chapter, revisit any earlier quest and redesign it under a changed constraint: larger scale, non-monotonic time, persistence, or concurrency."
    }
  },
  quests: {
    "146": {
      placement: "This is the smallest complete example of one canonical node serving two views: key lookup and recency order.",
      prerequisites: ["Hash-map lookup", "Doubly linked-list detach and insert"],
      outcomes: ["Derive O(1) get/put", "Use sentinels to remove boundary branches", "Keep map and list membership identical"],
      edgeCases: ["Update an existing key without growing size", "Access the current LRU and make it MRU", "Insert when the cache is exactly full"],
      mistakes: ["Storing values in the map instead of node references", "Evicting from the list but not the map", "Moving nodes with special-case head/tail code"],
      alternative: { name: "Language ordered map", useWhen: "The language guarantees move-to-end and pop-oldest operations.", tradeoff: "Much shorter code, but it hides the pointer invariant this foundation quest is meant to teach." },
      tests: [
        { name: "Overwrite", scenario: "Put the same key twice at capacity.", expectation: "Size is unchanged and the key becomes MRU." },
        { name: "Touch victim", scenario: "Read the LRU immediately before inserting another key.", expectation: "The other key is evicted." },
        { name: "Single slot", scenario: "Alternate puts in capacity one.", expectation: "Exactly the newest key remains." }
      ],
      followUps: ["How would you add TTL without making every get scan for expired keys?", "Which invariant changes if get no longer refreshes recency?"]
    },
    "460": {
      placement: "LFU extends the LRU lesson by adding a global frequency order and a recency order inside every frequency.",
      prerequisites: ["LRU cache invariants", "Hash maps of linked buckets"],
      outcomes: ["Coordinate three indexes", "Repair minimum frequency in O(1)", "Apply LRU as an exact tie-break"],
      edgeCases: ["Capacity zero", "Updating an existing key counts as a use", "Promotion empties the minimum-frequency bucket"],
      mistakes: ["Using one heap and accepting logarithmic/stale behavior without saying so", "Incrementing minFrequency on every promotion", "Forgetting recency inside a frequency group"],
      alternative: { name: "Heap with versions", useWhen: "Logarithmic updates are acceptable and implementation simplicity matters more than strict O(1).", tradeoff: "Lazy stale entries simplify movement but add memory and O(log n) cost." },
      tests: [
        { name: "Frequency tie", scenario: "Two keys have equal frequency but different last-use time.", expectation: "The older key is evicted." },
        { name: "Minimum bucket removed", scenario: "Promote the only key in the minimum bucket.", expectation: "minFrequency advances exactly once." },
        { name: "Overwrite", scenario: "Put a new value for an existing key.", expectation: "Value and frequency update without eviction." }
      ],
      followUps: ["How would frequency aging prevent ancient hot keys from living forever?", "What changes if ties use insertion time instead of last-access time?"]
    },
    "588": {
      placement: "The chapter moves from flat keys to hierarchical ownership while preserving direct traversal and deterministic output.",
      prerequisites: ["Tree or trie traversal", "Path tokenization and ordered child lookup"],
      outcomes: ["Separate parsing from traversal", "Represent files and directories with one node type", "Produce deterministic listings"],
      edgeCases: ["List the root directory", "List a file path rather than its parent", "Append content to an existing file"],
      mistakes: ["Returning file-name characters instead of a one-element list", "Mixing path parsing into every public method", "Using unordered children then forgetting to sort ls output"],
      alternative: { name: "Flat map from full path to metadata", useWhen: "Only exact-path lookup is needed and directory enumeration is rare.", tradeoff: "Exact lookup is simple, but subtree creation and child listing require prefix work." },
      tests: [
        { name: "Nested creation", scenario: "Create several missing directories in one mkdir call.", expectation: "Every intermediate node exists." },
        { name: "File listing", scenario: "Call ls on a file.", expectation: "Return only that file's base name." },
        { name: "Append", scenario: "Add content to the same file twice.", expectation: "Reads return concatenated content." }
      ],
      followUps: ["How would move or delete change node ownership and path lookup?", "How would permissions alter traversal without duplicating path logic?"]
    },
    "604": {
      placement: "This quest teaches that an iterator should store only the state needed to produce the next value.",
      prerequisites: ["String scanning", "Iterator state machines"],
      outcomes: ["Parse multi-digit run lengths", "Decode lazily in O(1) extra state", "Define exhaustion behavior explicitly"],
      edgeCases: ["A count with several digits", "The last repetition of a run", "next called after exhaustion"],
      mistakes: ["Expanding the entire string", "Resetting the numeric accumulator at the wrong time", "Advancing to the next character before the current run reaches zero"],
      alternative: { name: "Eager expansion", useWhen: "The decoded size is strictly small and repeated random access is needed.", tradeoff: "Simpler reads but memory grows with decoded rather than encoded length." },
      tests: [
        { name: "Multi-digit", scenario: "Iterate a character with count 12.", expectation: "All 12 copies appear before the next run." },
        { name: "Run boundary", scenario: "Call next across two adjacent runs.", expectation: "The active character changes only after remaining reaches zero." },
        { name: "Exhausted", scenario: "Call hasNext and next after the final value.", expectation: "hasNext is false and next returns the specified sentinel." }
      ],
      followUps: ["How would you support peek without changing the compressed cursor?", "How would the design change if counts arrived as a stream?"]
    },
    "1756": {
      placement: "MRU Queue adds order statistics: locate by live rank, remove that position, and append it to the end.",
      prerequisites: ["Prefix sums", "Fenwick tree order-statistic search"],
      outcomes: ["Convert live positions into prefix counts", "Select the kth live slot", "Move an item by two point updates"],
      edgeCases: ["Fetch the first or last live element", "Fetch the same value after it moves", "Use the maximum published number of fetch calls"],
      mistakes: ["Treating physical position as current rank", "Forgetting to reserve future append positions", "Using binary search without a monotonic prefix-count predicate"],
      alternative: { name: "Square-root decomposed blocks", useWhen: "You want dynamic capacity without relying on a published operation bound.", tradeoff: "Easier storage growth, but each fetch costs about O(sqrt n) rather than O(log n)." },
      tests: [
        { name: "First to end", scenario: "Fetch rank one twice with an intervening fetch.", expectation: "Rank order reflects both moves." },
        { name: "Tail fetch", scenario: "Fetch the last rank.", expectation: "The visible order is unchanged although the physical slot changes." },
        { name: "Capacity bound", scenario: "Perform the maximum number of fetches.", expectation: "Every appended position remains inside allocated Fenwick storage." }
      ],
      followUps: ["How would you remove the fixed future-capacity assumption?", "Can an implicit treap support the same API and what are its tradeoffs?"]
    },
    "346": {
      placement: "This is the minimal rolling-window problem: one queue determines membership and one scalar stores the aggregate.",
      prerequisites: ["FIFO queues", "Running sums"],
      outcomes: ["Avoid rescanning the window", "Handle a partially filled window", "Evict and repair the sum atomically"],
      edgeCases: ["Fewer values than the window size", "The first value that forces eviction", "Negative and positive values cancel"],
      mistakes: ["Dividing by capacity before the window is full", "Popping without subtracting", "Recomputing the sum for every next call"],
      alternative: { name: "Circular array", useWhen: "The window size is fixed and allocation predictability matters.", tradeoff: "O(1) operations with fixed memory, but index/count bookkeeping is more explicit than a deque." },
      tests: [
        { name: "Warm-up", scenario: "Insert fewer than size values.", expectation: "Divide by the number actually present." },
        { name: "First eviction", scenario: "Insert size plus one values.", expectation: "Only the oldest value leaves the sum." },
        { name: "Signed values", scenario: "Mix negative and positive inputs.", expectation: "The running total and average remain exact." }
      ],
      followUps: ["How would you maintain variance as well as mean?", "What changes if the window is defined by time rather than item count?"]
    },
    "359": {
      placement: "Logger Rate Limiter reduces a timing policy to the smallest possible state per independent message.",
      prerequisites: ["Hash maps", "Timestamp boundary comparisons"],
      outcomes: ["Store the next legal time per key", "Apply an exact inclusive boundary", "Discuss optional stale-key cleanup"],
      edgeCases: ["Repeat at nine seconds", "Repeat at exactly ten seconds", "Interleave two independent messages"],
      mistakes: ["Updating the timestamp on a rejected message", "Using one global last time", "Applying greater-than instead of greater-than-or-equal at the boundary"],
      alternative: { name: "Queue plus active set", useWhen: "You need bounded memory and timestamps are monotonic.", tradeoff: "Expired messages can be removed, but every accepted message now participates in a cleanup queue." },
      tests: [
        { name: "Rejected repeat", scenario: "Repeat a message before ten seconds.", expectation: "Return false and keep the original next-allowed time." },
        { name: "Exact boundary", scenario: "Repeat exactly ten seconds after acceptance.", expectation: "Return true." },
        { name: "Independent keys", scenario: "Interleave two messages.", expectation: "Each key has its own gate." }
      ],
      followUps: ["How would you cap memory for an unbounded message vocabulary?", "How would the design change for a sliding limit of k messages per interval?"]
    },
    "362": {
      placement: "Hit Counter adds aggregation and high-volume timestamp coalescing to the chapter's window-cleanup pattern.",
      prerequisites: ["Monotonic queues", "Rolling aggregates"],
      outcomes: ["Coalesce equal timestamps", "Expire counts while repairing a total", "Compare queue and circular-bucket designs"],
      edgeCases: ["Many hits in one second", "A hit exactly 300 seconds old", "A query after a long idle gap"],
      mistakes: ["Storing every hit separately under heavy traffic", "Removing an expired bucket without subtracting its count", "Using a boundary that keeps timestamp current-300"],
      alternative: { name: "300 circular buckets", useWhen: "Timestamp range is large but the window width is fixed and traffic is extremely high.", tradeoff: "Strict O(300) query or O(1) with a maintained total, but bucket timestamps must prevent modulo collisions." },
      tests: [
        { name: "Burst", scenario: "Record many hits at one timestamp.", expectation: "One queue record stores their combined count." },
        { name: "Boundary", scenario: "Query at hit time plus 300.", expectation: "That hit is expired." },
        { name: "Idle gap", scenario: "Query long after all traffic.", expectation: "Total becomes zero." }
      ],
      followUps: ["Which design is better when queries greatly outnumber hits?", "How would out-of-order hits invalidate the monotonic queue approach?"]
    },
    "933": {
      placement: "Recent Counter isolates the amortized proof made possible by strictly increasing call times.",
      prerequisites: ["Deque operations", "Amortized enter-once/leave-once reasoning"],
      outcomes: ["Translate [t-3000,t] exactly", "Exploit monotonic input", "Prove total cleanup work is linear"],
      edgeCases: ["A timestamp exactly t-3000", "Several calls close together", "A gap larger than the whole window"],
      mistakes: ["Removing the inclusive left boundary", "Scanning all prior pings", "Using this design when timestamps can arrive out of order"],
      alternative: { name: "Sorted array with binary search", useWhen: "Inputs remain append-only and you also need historical queries.", tradeoff: "Keeps history and gives logarithmic boundary lookup, but memory never shrinks." },
      tests: [
        { name: "Inclusive left edge", scenario: "Keep a ping exactly 3000 milliseconds behind t.", expectation: "It is counted." },
        { name: "First expired", scenario: "Advance one millisecond farther.", expectation: "The old ping is removed." },
        { name: "Long gap", scenario: "Ping after more than 3000 milliseconds of silence.", expectation: "Only the new ping remains." }
      ],
      followUps: ["How would you answer queries for arbitrary past times?", "What representation supports out-of-order event insertion?"]
    },
    "2034": {
      placement: "Stock Price is the chapter boss because corrections break the simple monotonic-cleanup assumption.",
      prerequisites: ["Hash maps", "Heaps with lazy validation or ordered multisets"],
      outcomes: ["Separate current truth from derived extrema", "Invalidate stale heap records lazily", "Track the latest timestamp independently"],
      edgeCases: ["Correct the latest timestamp", "Correct the current minimum or maximum", "Apply several corrections to one timestamp"],
      mistakes: ["Treating the last update call as the latest timestamp", "Returning a heap top without validating it", "Removing an old price from a multiset without respecting duplicates"],
      alternative: { name: "Ordered multiset plus timestamp map", useWhen: "The language provides an erasable multiset and you want bounded index memory.", tradeoff: "No stale records, but each correction must erase exactly one old price in O(log n)." },
      tests: [
        { name: "Latest correction", scenario: "Correct the price at the largest timestamp.", expectation: "current returns the corrected value." },
        { name: "Stale maximum", scenario: "Lower the value that used to be maximum.", expectation: "maximum skips the stale heap entry." },
        { name: "Duplicate prices", scenario: "Store equal prices at two timestamps, then correct one.", expectation: "The other equal price remains visible." }
      ],
      followUps: ["When would ordered multisets beat lazy heaps in memory and latency?", "How would you add a median-price query?"]
    },
    "622": {
      placement: "Circular Queue starts the workshop with a finite-state representation built directly from an array.",
      prerequisites: ["Arrays", "Modulo arithmetic"],
      outcomes: ["Encode FIFO without shifts", "Distinguish full from empty", "Derive front and rear indices from count"],
      edgeCases: ["Capacity one", "Wrap the insertion index", "Alternate full, dequeue, and enqueue"],
      mistakes: ["Using front==rear for both full and empty", "Computing Rear when count is zero", "Forgetting modulo after advancing front"],
      alternative: { name: "One permanently unused slot", useWhen: "You prefer two pointers without a count field.", tradeoff: "Empty/full tests are simple, but an array of length k+1 is required to store k values." },
      tests: [
        { name: "Wraparound", scenario: "Fill, dequeue several, then enqueue across the array end.", expectation: "FIFO order remains correct." },
        { name: "Capacity one", scenario: "Enqueue, reject another, dequeue, enqueue again.", expectation: "Full and empty never collide." },
        { name: "Read empty", scenario: "Call Front and Rear when empty.", expectation: "Both return the specified sentinel." }
      ],
      followUps: ["How would you make the queue grow dynamically?", "Which fields would need synchronization in a concurrent bounded queue?"]
    },
    "705": {
      placement: "HashSet makes collision handling and equality explicit instead of delegating them to a library.",
      prerequisites: ["Arrays and lists", "Modulo hashing"],
      outcomes: ["Keep colliding keys", "Make duplicate add idempotent", "State average and worst-case costs honestly"],
      edgeCases: ["Several keys in one bucket", "Duplicate add", "Remove an absent key"],
      mistakes: ["Overwriting on collision", "Assuming modulo makes keys unique", "Claiming worst-case O(1) for separate chaining"],
      alternative: { name: "Direct-address table", useWhen: "The key universe is small, dense, and known.", tradeoff: "True constant-time access with simple code, but memory depends on the universe rather than stored keys." },
      tests: [
        { name: "Collision chain", scenario: "Add keys separated by the bucket count.", expectation: "All remain independently searchable." },
        { name: "Duplicate", scenario: "Add the same key repeatedly.", expectation: "Only one logical membership exists." },
        { name: "Absent remove", scenario: "Remove a key that is not stored.", expectation: "Other bucket entries are unchanged." }
      ],
      followUps: ["When should the table resize and how do you rehash safely?", "How does open addressing change deletion semantics?"]
    },
    "706": {
      placement: "HashMap extends collision-safe membership with replacement, retrieval, and a missing-key contract.",
      prerequisites: ["Separate chaining", "Key/value pair mutation"],
      outcomes: ["Replace rather than duplicate a key", "Resolve collisions by equality", "Preserve the missing-value sentinel contract"],
      edgeCases: ["Update an existing key", "Colliding keys with different values", "Remove then reinsert"],
      mistakes: ["Appending a second entry for put on an existing key", "Storing values without their keys in buckets", "Confusing missing with a legitimate stored value outside the stated constraints"],
      alternative: { name: "Open addressing", useWhen: "Cache locality and low allocation overhead matter and load factor is controlled.", tradeoff: "Faster contiguous probes, but deletion needs tombstones and resizing is more delicate." },
      tests: [
        { name: "Replacement", scenario: "Put two values for the same key.", expectation: "get returns only the newer value." },
        { name: "Collision isolation", scenario: "Update one of two colliding keys.", expectation: "The other value is unchanged." },
        { name: "Lifecycle", scenario: "Remove and reinsert a key.", expectation: "Lookup follows the new entry without stale state." }
      ],
      followUps: ["How would you choose and monitor a load-factor threshold?", "What changes are required for generic keys and custom equality?"]
    },
    "380": {
      placement: "RandomizedSet demonstrates how two simple structures can trade ownership to satisfy three incompatible-looking operations.",
      prerequisites: ["Dynamic arrays", "Hash maps and uniform random indexes"],
      outcomes: ["Remove without shifting", "Repair a moved value's index", "Explain why dense indexing gives uniform choice"],
      edgeCases: ["Remove the last value", "Remove the only value", "Reject duplicate insert or absent remove"],
      mistakes: ["Popping before saving the tail value", "Forgetting to update the swapped value's map entry", "Sampling from hash-map iteration and assuming uniformity"],
      alternative: { name: "Array with tombstones", useWhen: "Deletes are rare and compaction can run in batches.", tradeoff: "Simpler deletes initially, but random sampling must skip holes and can degrade badly." },
      tests: [
        { name: "Middle removal", scenario: "Remove a non-tail value.", expectation: "The tail moves and its index is repaired." },
        { name: "Tail removal", scenario: "Remove the current tail.", expectation: "The self-swap path remains correct." },
        { name: "Single value", scenario: "Insert one value, sample, then remove it.", expectation: "Sampling returns it and the set becomes empty." }
      ],
      followUps: ["How would duplicates change the reverse index?", "How would weighted random selection change the array representation?"]
    },
    "1206": {
      placement: "Skiplist closes the workshop with a full ordered structure whose logarithmic behavior is probabilistic rather than rebalanced.",
      prerequisites: ["Linked lists", "Geometric random levels"],
      outcomes: ["Reuse one predecessor path", "Splice a tower across levels", "Separate expected from worst-case complexity"],
      edgeCases: ["Duplicate values", "Erase one of several duplicates", "A node receives the maximum level"],
      mistakes: ["Searching separately for every level", "Using <= when duplicates should remain discoverable", "Claiming guaranteed O(log n)"],
      alternative: { name: "Balanced search tree", useWhen: "Deterministic logarithmic bounds and ordered iteration are required.", tradeoff: "Stronger worst-case guarantees, but rotations and rebalancing are more complex." },
      tests: [
        { name: "Duplicates", scenario: "Add the same value twice and erase once.", expectation: "One occurrence remains searchable." },
        { name: "Missing erase", scenario: "Erase a value between existing nodes.", expectation: "No pointers change." },
        { name: "Deterministic randomness", scenario: "Inject a fixed seed during local tests.", expectation: "Tower shapes become reproducible without changing semantics." }
      ],
      followUps: ["How would you expose lower_bound or range iteration?", "What concurrency advantage can skiplists have over balanced trees?"]
    },
    "1603": {
      placement: "Parking System is the smallest business-state machine: validate one resource counter, then commit one decrement.",
      prerequisites: ["Array indexing", "Guard-before-mutation reasoning"],
      outcomes: ["Encode independent capacities", "Reject without mutation", "Keep one authoritative counter per type"],
      edgeCases: ["A type starts at zero", "Consume the final slot", "Reject repeated cars after capacity is exhausted"],
      mistakes: ["Decrementing before checking", "Mixing one-based car types with zero-based storage", "Tracking both used and remaining counts as separate truth"],
      alternative: { name: "Named fields for three types", useWhen: "Domain readability matters more than generalization.", tradeoff: "Very explicit for exactly three categories, but repetitive and less extensible." },
      tests: [
        { name: "Initially full", scenario: "Request a type with zero capacity.", expectation: "Return false and change nothing." },
        { name: "Final slot", scenario: "Consume the last remaining slot.", expectation: "That call succeeds and the next fails." },
        { name: "Isolation", scenario: "Exhaust one type then add another.", expectation: "Other counters are unaffected." }
      ],
      followUps: ["How would cancellations return capacity safely?", "How would dynamic vehicle categories change the representation?"]
    },
    "1396": {
      placement: "Underground System introduces active-session state plus incremental historical aggregates keyed by a directed route.",
      prerequisites: ["Hash maps", "Composite keys and running averages"],
      outcomes: ["Pair check-in and checkout", "Aggregate without storing every trip", "Keep directed routes distinct"],
      edgeCases: ["Several riders active simultaneously", "Repeated trips on one route", "The reverse route has separate statistics"],
      mistakes: ["Using an ambiguous concatenated route key", "Leaving a rider active after checkout", "Averaging averages instead of total duration and count"],
      alternative: { name: "Store every completed trip", useWhen: "You need percentiles, audits, or later recomputation.", tradeoff: "Supports richer analytics but uses O(number of trips) memory and slower average queries." },
      tests: [
        { name: "Concurrent riders", scenario: "Interleave two riders' sessions.", expectation: "Each checkout pairs with its own check-in." },
        { name: "Directed key", scenario: "Record A→B and B→A.", expectation: "Their aggregates remain independent." },
        { name: "Repeated route", scenario: "Complete multiple A→B trips.", expectation: "Average equals total duration divided by trip count." }
      ],
      followUps: ["How would you add median or percentile travel time?", "How would crash recovery protect active trips and aggregates?"]
    },
    "1797": {
      placement: "Authentication Manager adds expiry and renewal while teaching that a cleanup index may be derived rather than authoritative.",
      prerequisites: ["Hash maps", "Monotonic-time queues and lazy validation"],
      outcomes: ["Apply inclusive expiry", "Ignore stale renewal events", "Amortize cleanup across calls"],
      edgeCases: ["Renew exactly at expiry", "Renew a missing token", "An old expiry event survives after renewal"],
      mistakes: ["Treating expiry==currentTime as live", "Deleting a token for a stale queue event", "Scanning the whole token map on every count"],
      alternative: { name: "Min-heap of expiry events", useWhen: "Expiry times are not naturally appended in order.", tradeoff: "Works without monotonic event order but cleanup costs O(log n) per event." },
      tests: [
        { name: "Inclusive expiry", scenario: "Renew at the exact expiry time.", expectation: "Renewal is rejected." },
        { name: "Stale event", scenario: "Renew before expiry, then clean at the old expiry.", expectation: "The renewed token remains live." },
        { name: "Full cleanup", scenario: "Count after all current expiries.", expectation: "The authoritative map is empty." }
      ],
      followUps: ["How would non-monotonic currentTime calls change cleanup?", "How would you support explicit token revocation?"]
    },
    "2043": {
      placement: "Bank turns validation and atomic commit into an explicit reusable command pattern.",
      prerequisites: ["Array indexing", "Wide integer arithmetic and guard clauses"],
      outcomes: ["Centralize account validation", "Commit transfer atomically", "Prove rejected operations are side-effect free"],
      edgeCases: ["Either transfer account is invalid", "Source has exactly the requested money", "Money and balances exceed 32-bit range"],
      mistakes: ["Debiting before validating the destination", "Using an int for balances or money", "Duplicating account-range logic inconsistently"],
      alternative: { name: "Append-only transaction ledger", useWhen: "Audit history, reconciliation, or recovery is required.", tradeoff: "Balances become derived state and writes are durable/auditable, but queries need snapshots or aggregation." },
      tests: [
        { name: "Invalid destination", scenario: "Transfer from a valid source to an invalid account.", expectation: "Return false and preserve the source balance." },
        { name: "Exact funds", scenario: "Withdraw the complete balance.", expectation: "Succeed and leave zero." },
        { name: "Insufficient transfer", scenario: "Transfer one more than available.", expectation: "Neither account changes." }
      ],
      followUps: ["How would concurrent transfers avoid lost updates or deadlock?", "How would a ledger change failure recovery and balance queries?"]
    },
    "2241": {
      placement: "ATM is the chapter boss because it combines a mandated greedy policy with an all-or-nothing inventory mutation.",
      prerequisites: ["Greedy selection", "Two-phase plan and commit"],
      outcomes: ["Follow the required denomination priority", "Keep failed withdrawals atomic", "Separate policy correctness from general coin-change optimality"],
      edgeCases: ["Greedy leaves a nonzero remainder", "Exact withdrawal uses several denominations", "A failed plan is followed by a valid request"],
      mistakes: ["Subtracting notes while still planning", "Backtracking even though the policy requires largest-first", "Assuming greedy is universally optimal for coin systems"],
      alternative: { name: "Backtracking or bounded dynamic programming", useWhen: "Any valid combination is acceptable rather than a mandated greedy policy.", tradeoff: "Can find combinations greedy misses, but costs substantially more time and violates this API's rule." },
      tests: [
        { name: "Greedy failure", scenario: "Larger notes block a combination that smaller notes could make.", expectation: "Return failure because the required greedy pass cannot complete." },
        { name: "Atomic stock", scenario: "Issue a valid withdrawal after a failed one.", expectation: "The failed plan consumed no notes." },
        { name: "Exact mix", scenario: "Use several denominations with zero remainder.", expectation: "Return counts in denomination order and subtract once." }
      ],
      followUps: ["How would the answer change if any valid combination were allowed?", "How would concurrent withdrawal requests reserve inventory safely?"]
    },
    "355": {
      placement: "Twitter begins the capstone by combining a social graph with several append-only histories and a bounded top-k merge.",
      prerequisites: ["Hash-set graphs", "Heaps and k-way merging"],
      outcomes: ["Keep posting O(1)", "Merge only relevant list tails", "Stop work after ten feed items"],
      edgeCases: ["A user follows or unfollows themself", "Followees have no tweets", "More than ten relevant posts exist"],
      mistakes: ["Sorting every relevant historical tweet", "Forgetting the user's own posts", "Allowing self-unfollow to hide self posts"],
      alternative: { name: "Fan-out on write", useWhen: "Reads dominate and follower counts are bounded enough to precompute feeds.", tradeoff: "Feed reads are cheap, but celebrity posts create expensive writes and consistency work." },
      tests: [
        { name: "Self source", scenario: "Read a feed with no followees.", expectation: "The user's own newest posts appear." },
        { name: "Interleaved authors", scenario: "Several followed users post alternately.", expectation: "Global timestamp order wins." },
        { name: "Bounded feed", scenario: "More than ten eligible tweets exist.", expectation: "Return exactly the newest ten." }
      ],
      followUps: ["When would fan-out on write outperform the k-way merge?", "How would deletion or privacy changes invalidate cached feeds?"]
    },
    "1500": {
      placement: "File Sharing adds reusable identity allocation and bidirectional ownership indexes to the lifecycle discipline.",
      prerequisites: ["Min-heaps", "Bidirectional many-to-many indexes"],
      outcomes: ["Recycle the smallest user ID", "Keep both ownership directions synchronized", "Grant a chunk only when an owner exists"],
      edgeCases: ["Join after several nonconsecutive IDs leave", "Request a chunk with no owners", "Leave after gaining new chunks through requests"],
      mistakes: ["Scanning from ID one on every join", "Cleaning only user→chunks on leave", "Adding the requester before snapshotting returned owners"],
      alternative: { name: "Ordered owner set", useWhen: "Requests are frequent and owner output must already be sorted.", tradeoff: "Avoids sort-on-read, but every ownership mutation costs O(log n) instead of average O(1)." },
      tests: [
        { name: "Smallest recycle", scenario: "Several users leave out of order, then two join.", expectation: "IDs return in ascending recycled order." },
        { name: "No owners", scenario: "Request an unowned chunk.", expectation: "Return empty and do not grant ownership." },
        { name: "Leave cleanup", scenario: "A user leaves after acquiring extra chunks.", expectation: "Every reverse owner set removes that user." }
      ],
      followUps: ["How would you avoid sorting owners on every request?", "How would chunk replication or partial availability change ownership state?"]
    },
    "1912": {
      placement: "Movie Rental is the multi-index lifecycle centerpiece: one copy moves between per-movie availability and global rented order.",
      prerequisites: ["Tuple ordering", "Ordered sets or lazy heaps with versions"],
      outcomes: ["Encode every tie-break in index keys", "Move lifecycle state without stale visibility", "Compare eager and lazy index maintenance"],
      edgeCases: ["Equal prices across shops and movies", "Repeated rent/drop cycles", "Stale heap records precede live records"],
      mistakes: ["Using a tuple missing the final tie-break field", "Updating rented state without the corresponding query index", "Calling lazy-heap cost O(log E) while records grow with updates"],
      alternative: { name: "Ordered sets with eager erase", useWhen: "The language provides reliable ordered sets and bounded memory is important.", tradeoff: "Indexes contain only live records, but every transition must find and erase the exact tuple." },
      tests: [
        { name: "Tie-break chain", scenario: "Create equal prices across several shops and movies.", expectation: "search and report follow their complete tuple orders." },
        { name: "Lifecycle cycle", scenario: "Rent, drop, then rent the same copy.", expectation: "Only the newest lifecycle record is visible." },
        { name: "Top five", scenario: "Create more than five eligible records.", expectation: "Return the smallest five without exposing stale entries." }
      ],
      followUps: ["When do lazy heaps become a memory problem compared with ordered sets?", "How would a price update alter canonical metadata and every index key?"]
    },
    "2296": {
      placement: "Text Editor shows that locality can replace global rebuilding: only characters near the cursor need to move.",
      prerequisites: ["Stacks or dynamic buffers", "Cursor invariants"],
      outcomes: ["Split text at the cursor", "Make edits proportional to changed characters", "Return context without materializing the document"],
      edgeCases: ["Move beyond either document boundary", "Delete more characters than exist to the left", "Alternate left and right moves after insertion"],
      mistakes: ["Editing the middle of one immutable string", "Reversing the right buffer incorrectly", "Returning more than ten characters of left context"],
      alternative: { name: "Gap buffer or rope", useWhen: "The editor needs large documents, many cursors, or logarithmic edits away from one cursor.", tradeoff: "Scales to richer editing workloads, but implementation and balancing are much more complex." },
      tests: [
        { name: "Left boundary", scenario: "Move left farther than the document length.", expectation: "Cursor stops at zero and context is empty." },
        { name: "Large delete", scenario: "Delete more than the left buffer contains.", expectation: "Remove exactly the available characters." },
        { name: "Round trip", scenario: "Move left then right by the same amount.", expectation: "Document order and context are restored." }
      ],
      followUps: ["When would a rope outperform two buffers?", "How would undo/redo change operation ownership and memory usage?"]
    },
    "3484": {
      placement: "Spreadsheet teaches disciplined scope: a deliberately tiny grammar should not become a general expression engine.",
      prerequisites: ["String tokenization", "Array or sparse-map cell storage"],
      outcomes: ["Parse cell references", "Resolve literal and cell operands uniformly", "Keep grammar and storage independent"],
      edgeCases: ["Both operands are literals", "An unset or reset cell is referenced", "Rows have several digits"],
      mistakes: ["Building a recursive parser for a one-plus grammar", "Treating unset cells as missing errors", "Parsing only one digit of the row"],
      alternative: { name: "Sparse hash map", useWhen: "Rows are large and only a small fraction of cells are set.", tradeoff: "Memory follows populated cells, but lookup has hashing overhead compared with a fixed 26-column grid." },
      tests: [
        { name: "Literal pair", scenario: "Evaluate two numeric operands.", expectation: "No cell lookup is attempted." },
        { name: "Mixed pair", scenario: "Add a multi-digit-row cell and a literal.", expectation: "Both token types resolve correctly." },
        { name: "Reset", scenario: "Reset a referenced cell and evaluate again.", expectation: "The cell contributes zero." }
      ],
      followUps: ["How would dependencies and recalculation change the data model?", "At what density does a fixed grid beat sparse storage?"]
    },
    "432": {
      placement: "All O`one is the final synthesis: key lookup, ordered count buckets, and shared-count membership must all update in average O(1).",
      prerequisites: ["Doubly linked lists", "Hash maps and hash sets"],
      outcomes: ["Store only existing count buckets", "Move keys only to adjacent counts", "Read min/max from sentinel-adjacent buckets"],
      edgeCases: ["The first key creates count one", "A decrement deletes the final key in a bucket", "Removing the only key empties the whole structure"],
      mistakes: ["Keeping empty buckets", "Searching for a count bucket instead of using adjacency", "Expecting a deterministic key when any tied key is valid"],
      alternative: { name: "Ordered map from count to key set", useWhen: "O(log n) updates are acceptable and simpler ordered-library code is preferred.", tradeoff: "Min/max remain easy, but every inc/dec loses the required average O(1) bound." },
      tests: [
        { name: "Bucket creation", scenario: "Increment across a missing adjacent count.", expectation: "One correctly ordered bucket is inserted." },
        { name: "Bucket removal", scenario: "Move the last key out of an interior bucket.", expectation: "Neighbors reconnect immediately." },
        { name: "Empty structure", scenario: "Decrement the only count-one key.", expectation: "Both min and max return empty strings." }
      ],
      followUps: ["How would you return all keys tied for minimum or maximum?", "Can the same bucket architecture support incrementing by an arbitrary delta in O(1)?"]
    }
  }
};
