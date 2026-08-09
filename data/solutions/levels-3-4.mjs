export default {
  "622": {
    inputModel: "The constructor receives capacity k. Later calls insert one integer, remove the oldest integer, inspect either end, or ask whether the queue is empty or full.",
    outputModel: "Mutation calls return whether they succeeded; Front and Rear return the requested value or -1 for an empty queue; state queries return booleans.",
    example: {
      input: "MyCircularQueue(4), enQueue(11), enQueue(22), deQueue(), enQueue(33), enQueue(44), enQueue(55), Front(), Rear(), enQueue(66)",
      output: "null, true, true, true, true, true, true, 22, 55, false",
      trace: [
        { call: "enQueue(11), enQueue(22)", state: "logical=[11,22], head=0, size=2", result: "true, true" },
        { call: "deQueue()", state: "logical=[22], head=1, size=1", result: "true" },
        { call: "enQueue(33), enQueue(44)", state: "logical=[22,33,44], head=1, size=3", result: "true, true" },
        { call: "enQueue(55)", state: "physical=[55,22,33,44], logical=[22,33,44,55]", result: "true" },
        { call: "enQueue(66)", state: "size=4 equals capacity; state unchanged", result: "false" }
      ]
    },
    intuition: "A fixed array already has every slot we need. Instead of shifting after a dequeue, let the logical front move and wrap around. A separate size counter removes the usual full-versus-empty pointer ambiguity.",
    approach: [
      "Store k array slots, the index of the logical front, and the number of live values.",
      "Insert at (head + size) modulo k, so the logical tail wraps into reclaimed slots.",
      "Dequeue by advancing head modulo k and reducing size; read the rear at (head + size - 1) modulo k."
    ],
    invariants: [
      "Exactly size consecutive logical positions starting at head contain the queue values in FIFO order.",
      "The queue is empty exactly when size is zero and full exactly when size equals capacity."
    ],
    diagram: {
      caption: "Logical order can cross the physical end of the ring.",
      nodes: [
        { id: "head", label: "head: oldest" },
        { id: "live", label: "size live slots" },
        { id: "tail", label: "insert at (head + size) % k" },
        { id: "wrap", label: "wrap to index 0" }
      ],
      edges: [
        { from: "head", to: "live", label: "FIFO scan" },
        { from: "live", to: "tail", label: "next free slot" },
        { from: "tail", to: "wrap", label: "modulo k" }
      ]
    },
    pseudocode: `initialize array[k], head = 0, size = 0

enqueue(value):
  if size == k: return false
  array[(head + size) mod k] = value
  size += 1
  return true

dequeue():
  if size == 0: return false
  head = (head + 1) mod k
  size -= 1
  return true`,
    proof: [
      "Insertion writes immediately after the current logical sequence, so it preserves every old value and appends the new value at the rear.",
      "Dequeue advances past exactly the oldest logical slot; therefore the remaining sequence is unchanged and its next value becomes the front."
    ],
    complexity: [
      { operation: "All public operations", time: "O(1)", reason: "Each uses a constant number of index, arithmetic, and array operations." },
      { operation: "Storage", time: "O(k)", reason: "The ring owns exactly k array slots." }
    ],
    python: `class MyCircularQueue:
    def __init__(self, k: int):
        self.capacity = k
        self.data = [0] * k
        self.head = 0
        self.size = 0

    def enQueue(self, value: int) -> bool:
        if self.isFull():
            return False
        tail = (self.head + self.size) % self.capacity
        self.data[tail] = value
        self.size += 1
        return True

    def deQueue(self) -> bool:
        if self.isEmpty():
            return False
        self.head = (self.head + 1) % self.capacity
        self.size -= 1
        return True

    def Front(self) -> int:
        if self.isEmpty():
            return -1
        return self.data[self.head]

    def Rear(self) -> int:
        if self.isEmpty():
            return -1
        tail = (self.head + self.size - 1) % self.capacity
        return self.data[tail]

    def isEmpty(self) -> bool:
        return self.size == 0

    def isFull(self) -> bool:
        return self.size == self.capacity`,
    cpp: `#include <vector>
using namespace std;

class MyCircularQueue {
    vector<int> data;
    int head;
    int count;
    int capacity;

public:
    MyCircularQueue(int k) : data(k), head(0), count(0), capacity(k) {}

    bool enQueue(int value) {
        if (isFull()) return false;
        int tail = (head + count) % capacity;
        data[tail] = value;
        ++count;
        return true;
    }

    bool deQueue() {
        if (isEmpty()) return false;
        head = (head + 1) % capacity;
        --count;
        return true;
    }

    int Front() {
        return isEmpty() ? -1 : data[head];
    }

    int Rear() {
        return isEmpty() ? -1 : data[(head + count - 1) % capacity];
    }

    bool isEmpty() {
        return count == 0;
    }

    bool isFull() {
        return count == capacity;
    }
};`
  },
  "705": {
    inputModel: "The object starts empty and receives add(key), remove(key), and contains(key) calls for integer keys.",
    outputModel: "add and remove mutate membership without returning a value; contains returns true exactly when the key is currently stored.",
    example: {
      input: "MyHashSet(), add(1539), add(770), contains(1), add(1), remove(770), contains(1539), contains(770)",
      output: "null, null, null, false, null, null, true, false",
      trace: [
        { call: "add(1539)", state: "bucket 1 contains [1539]", result: "null" },
        { call: "add(770)", state: "bucket 1 contains [1539,770]", result: "null" },
        { call: "contains(1)", state: "scan bucket 1 but neither stored key equals 1", result: "false" },
        { call: "add(1)", state: "bucket 1 contains [1539,770,1]", result: "null" },
        { call: "remove(770)", state: "bucket 1 contains [1539,1]", result: "null" },
        { call: "contains(1539), contains(770)", state: "compare full keys inside bucket 1", result: "true, false" }
      ]
    },
    intuition: "A hash function narrows a large key range to one small bucket. Collisions are not errors: each bucket keeps a short chain and compares the original keys before deciding membership.",
    approach: [
      "Choose a prime bucket count and map each key with key modulo bucket count.",
      "Search only the selected bucket; append a key only when it is absent.",
      "Remove the matching key from its bucket while leaving colliding keys untouched."
    ],
    invariants: [
      "A stored key appears in exactly one bucket: the bucket selected by its hash.",
      "No bucket contains duplicate copies of the same key."
    ],
    diagram: {
      caption: "Separate chaining preserves distinct keys that share a hash.",
      nodes: [
        { id: "key", label: "key" },
        { id: "hash", label: "key % 769" },
        { id: "bucket", label: "selected bucket" },
        { id: "chain", label: "collision chain" }
      ],
      edges: [
        { from: "key", to: "hash", label: "compute" },
        { from: "hash", to: "bucket", label: "index" },
        { from: "bucket", to: "chain", label: "compare keys" }
      ]
    },
    pseudocode: `bucket(key) = key mod bucket_count

add(key):
  chain = buckets[bucket(key)]
  if key is absent from chain: append key

remove(key):
  delete key from its chain if present

contains(key):
  return whether key occurs in its chain`,
    proof: [
      "Every operation examines the only bucket to which the hash function can assign the key, so it cannot miss a stored key.",
      "add checks for equality before appending and remove deletes only the equal key, so set membership remains exact even under collisions."
    ],
    complexity: [
      { operation: "add, remove, contains", time: "Expected O(1), worst O(n)", reason: "A well-distributed hash keeps chains short; all keys could collide in the worst case." },
      { operation: "Storage", time: "O(n + B)", reason: "n keys are stored across B fixed buckets." }
    ],
    python: `class MyHashSet:
    def __init__(self):
        self.bucket_count = 769
        self.buckets = [[] for _ in range(self.bucket_count)]

    def _bucket(self, key: int):
        return self.buckets[key % self.bucket_count]

    def add(self, key: int) -> None:
        bucket = self._bucket(key)
        if key not in bucket:
            bucket.append(key)

    def remove(self, key: int) -> None:
        bucket = self._bucket(key)
        for index, value in enumerate(bucket):
            if value == key:
                bucket.pop(index)
                return

    def contains(self, key: int) -> bool:
        return key in self._bucket(key)`,
    cpp: `#include <algorithm>
#include <list>
#include <vector>
using namespace std;

class MyHashSet {
    static const int BUCKET_COUNT = 769;
    vector<list<int>> buckets;

    int hashKey(int key) const {
        return key % BUCKET_COUNT;
    }

public:
    MyHashSet() : buckets(BUCKET_COUNT) {}

    void add(int key) {
        auto& bucket = buckets[hashKey(key)];
        if (find(bucket.begin(), bucket.end(), key) == bucket.end()) {
            bucket.push_back(key);
        }
    }

    void remove(int key) {
        auto& bucket = buckets[hashKey(key)];
        auto it = find(bucket.begin(), bucket.end(), key);
        if (it != bucket.end()) bucket.erase(it);
    }

    bool contains(int key) {
        auto& bucket = buckets[hashKey(key)];
        return find(bucket.begin(), bucket.end(), key) != bucket.end();
    }
};`
  },
  "706": {
    inputModel: "The empty object receives put(key, value), get(key), and remove(key) calls. Putting an existing key replaces its value.",
    outputModel: "get returns the current value or -1 when the key is absent; put and remove only mutate the map.",
    example: {
      input: "MyHashMap(), put(1539, 8), put(770, 21), get(1), put(1539, 34), remove(770), get(1539), get(770)",
      output: "null, null, null, -1, null, null, 34, -1",
      trace: [
        { call: "put(1539, 8)", state: "bucket 1: [(1539,8)]", result: "null" },
        { call: "put(770, 21)", state: "bucket 1: [(1539,8),(770,21)]", result: "null" },
        { call: "get(1)", state: "bucket 1 has collisions but no key 1", result: "-1" },
        { call: "put(1539, 34)", state: "bucket 1: [(1539,34),(770,21)]", result: "null" },
        { call: "remove(770)", state: "bucket 1: [(1539,34)]", result: "null" }
      ]
    },
    intuition: "The hash chooses where to search, but the original key establishes identity. Store key-value pairs in collision chains so replacement, lookup, and deletion can all resolve equal hashes correctly.",
    approach: [
      "Hash a key into one of a prime number of buckets.",
      "For put, scan that bucket and replace the value if the key exists; otherwise append a new pair.",
      "For get or remove, compare full keys inside the selected bucket and handle absence explicitly."
    ],
    invariants: [
      "Each live key has exactly one pair in its hashed bucket.",
      "The value stored beside a key is the value from its most recent put call."
    ],
    diagram: {
      caption: "Hashing locates a chain; equality locates the exact pair.",
      nodes: [
        { id: "pair", label: "(key, value)" },
        { id: "hash", label: "key % 769" },
        { id: "bucket", label: "pair chain" },
        { id: "match", label: "matching key" }
      ],
      edges: [
        { from: "pair", to: "hash", label: "key" },
        { from: "hash", to: "bucket", label: "select" },
        { from: "bucket", to: "match", label: "scan equality" }
      ]
    },
    pseudocode: `put(key, value):
  chain = buckets[key mod bucket_count]
  if pair with key exists: replace its value
  else append (key, value)

get(key):
  return matching value, or -1 if no pair matches

remove(key):
  erase the matching pair if it exists`,
    proof: [
      "All pairs for a key's hash are searched, so an existing equal key is found despite collisions.",
      "put never creates a second pair for an existing key and updates the first one instead; therefore get observes exactly the latest mapping."
    ],
    complexity: [
      { operation: "put, get, remove", time: "Expected O(1), worst O(n)", reason: "Expected chain length is constant with a useful hash distribution; one chain can contain every key in the worst case." },
      { operation: "Storage", time: "O(n + B)", reason: "The map stores n pairs plus B bucket containers." }
    ],
    python: `class MyHashMap:
    def __init__(self):
        self.bucket_count = 769
        self.buckets = [[] for _ in range(self.bucket_count)]

    def _bucket(self, key: int):
        return self.buckets[key % self.bucket_count]

    def put(self, key: int, value: int) -> None:
        bucket = self._bucket(key)
        for pair in bucket:
            if pair[0] == key:
                pair[1] = value
                return
        bucket.append([key, value])

    def get(self, key: int) -> int:
        for stored_key, value in self._bucket(key):
            if stored_key == key:
                return value
        return -1

    def remove(self, key: int) -> None:
        bucket = self._bucket(key)
        for index, pair in enumerate(bucket):
            if pair[0] == key:
                bucket.pop(index)
                return`,
    cpp: `#include <list>
#include <utility>
#include <vector>
using namespace std;

class MyHashMap {
    static const int BUCKET_COUNT = 769;
    vector<list<pair<int, int>>> buckets;

    int hashKey(int key) const {
        return key % BUCKET_COUNT;
    }

public:
    MyHashMap() : buckets(BUCKET_COUNT) {}

    void put(int key, int value) {
        auto& bucket = buckets[hashKey(key)];
        for (auto& entry : bucket) {
            if (entry.first == key) {
                entry.second = value;
                return;
            }
        }
        bucket.push_back({key, value});
    }

    int get(int key) {
        auto& bucket = buckets[hashKey(key)];
        for (const auto& entry : bucket) {
            if (entry.first == key) return entry.second;
        }
        return -1;
    }

    void remove(int key) {
        auto& bucket = buckets[hashKey(key)];
        for (auto it = bucket.begin(); it != bucket.end(); ++it) {
            if (it->first == key) {
                bucket.erase(it);
                return;
            }
        }
    }
};`
  },
  "380": {
    inputModel: "The object receives insert(val), remove(val), and getRandom() calls. Random lookup is called only while at least one value exists.",
    outputModel: "insert and remove report whether they changed the set; getRandom returns one current value with equal probability among all current values.",
    example: {
      input: "RandomizedSet(), insert(-7), insert(14), remove(-7), insert(23), insert(14), getRandom()",
      output: "null, true, true, true, true, false, either 14 or 23",
      trace: [
        { call: "insert(-7), insert(14)", state: "values=[-7,14], index={-7:0,14:1}", result: "true, true" },
        { call: "remove(-7)", state: "move 14 into index 0; values=[14], index={14:0}", result: "true" },
        { call: "insert(23)", state: "values=[14,23], index={14:0,23:1}", result: "true" },
        { call: "insert(14)", state: "14 already has an index; state unchanged", result: "false" },
        { call: "getRandom()", state: "sample uniform index 0 or 1", result: "14 or 23" }
      ]
    },
    intuition: "Uniform random choice wants a dense array, while membership wants a hash map. The only obstacle is deleting from the middle of the array; fill that hole with the last value, repair its recorded index, and pop the tail.",
    approach: [
      "Keep every value once in a dense array and map each value to its array index.",
      "Insert by appending and recording the new final index.",
      "Remove by moving the array tail into the removed slot, updating that moved value's index, then popping and deleting the old mapping.",
      "Choose a uniformly random array position for getRandom."
    ],
    invariants: [
      "For every array index i, index[values[i]] equals i.",
      "The dense array and index map contain exactly the same distinct values."
    ],
    diagram: {
      caption: "Tail swap turns an arbitrary deletion into constant work.",
      nodes: [
        { id: "map", label: "value → index" },
        { id: "hole", label: "removed index" },
        { id: "tail", label: "last array value" },
        { id: "dense", label: "dense array after pop" }
      ],
      edges: [
        { from: "map", to: "hole", label: "locate" },
        { from: "tail", to: "hole", label: "move" },
        { from: "hole", to: "dense", label: "repair map + pop" }
      ]
    },
    pseudocode: `insert(value):
  if value in index: return false
  index[value] = values.length
  append value to values
  return true

remove(value):
  if value absent: return false
  i = index[value]
  moved = values.last
  values[i] = moved
  index[moved] = i
  pop values; delete index[value]
  return true

getRandom(): return values[random uniform index]`,
    proof: [
      "Insert appends one new value and records its exact index; removal repairs the only mapping changed by the tail move, so the array-map invariant is preserved.",
      "The array has one slot per current value, so uniform sampling of an array index gives every value probability 1/n."
    ],
    complexity: [
      { operation: "insert, remove, getRandom", time: "Average O(1)", reason: "Hash access, tail updates, and random array indexing are constant on average." },
      { operation: "Storage", time: "O(n)", reason: "Each live value occupies one array slot and one map entry." }
    ],
    python: `import random

class RandomizedSet:
    def __init__(self):
        self.values = []
        self.index = {}

    def insert(self, val: int) -> bool:
        if val in self.index:
            return False
        self.index[val] = len(self.values)
        self.values.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.index:
            return False
        remove_index = self.index[val]
        last_value = self.values[-1]
        self.values[remove_index] = last_value
        self.index[last_value] = remove_index
        self.values.pop()
        del self.index[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.values)`,
    cpp: `#include <random>
#include <unordered_map>
#include <vector>
using namespace std;

class RandomizedSet {
    vector<int> values;
    unordered_map<int, int> index;
    mt19937 generator;

public:
    RandomizedSet() : generator(random_device{}()) {}

    bool insert(int val) {
        if (index.count(val)) return false;
        index[val] = static_cast<int>(values.size());
        values.push_back(val);
        return true;
    }

    bool remove(int val) {
        auto it = index.find(val);
        if (it == index.end()) return false;

        int removeIndex = it->second;
        int lastValue = values.back();
        values[removeIndex] = lastValue;
        index[lastValue] = removeIndex;
        values.pop_back();
        index.erase(it);
        return true;
    }

    int getRandom() {
        uniform_int_distribution<int> pick(0, static_cast<int>(values.size()) - 1);
        return values[pick(generator)];
    }
};`
  },
  "1206": {
    inputModel: "The structure receives search(target), add(num), and erase(num). Equal numbers may be inserted more than once, and erase removes one occurrence.",
    outputModel: "search reports whether at least one occurrence exists; add returns nothing; erase reports whether one occurrence was removed.",
    example: {
      input: "Skiplist(), add(8), add(2), add(8), search(5), erase(8), search(8), erase(2), search(2)",
      output: "null, null, null, null, false, true, true, true, false",
      trace: [
        { call: "add(8), add(2)", state: "base level: head → 2 → 8", result: "null, null" },
        { call: "add(8)", state: "base level: head → 2 → 8 → 8", result: "null" },
        { call: "search(5)", state: "predecessor path stops at 2; next value is 8", result: "false" },
        { call: "erase(8)", state: "one 8 tower is unlinked; one occurrence remains", result: "true" },
        { call: "search(8)", state: "base successor still equals 8", result: "true" },
        { call: "erase(2), search(2)", state: "base now contains only 8", result: "true, false" }
      ]
    },
    intuition: "A sorted linked list updates cheaply but searches slowly. Randomly promoted nodes create sparse express lanes. One top-down walk records the predecessor at every level, and that same path is enough to insert or unlink a whole node tower.",
    approach: [
      "Use a sentinel with a forward pointer per level; every node participates in level zero and in a random number of higher levels.",
      "Walk from the highest level down, moving right only while the next value is smaller; record each stopping node.",
      "For insertion, choose a random height and splice a new node after the recorded predecessors.",
      "For deletion, locate the first equal base node and unlink that exact node wherever its tower appears."
    ],
    invariants: [
      "Every level is sorted, and each higher-level sequence is a subsequence of level zero.",
      "All forward pointers for one inserted occurrence belong to one node object, so erase can remove exactly that occurrence."
    ],
    diagram: {
      caption: "Sparse upper lanes skip ranges while level zero keeps every value.",
      nodes: [
        { id: "top", label: "top: head → 7" },
        { id: "mid", label: "middle: head → 3 → 7" },
        { id: "base", label: "base: head → 3 → 5 → 7" },
        { id: "path", label: "recorded predecessors" }
      ],
      edges: [
        { from: "top", to: "mid", label: "descend" },
        { from: "mid", to: "base", label: "descend" },
        { from: "path", to: "base", label: "splice tower" }
      ]
    },
    pseudocode: `find_predecessors(target):
  current = head
  for level from highest down to zero:
    while current.next[level].value < target: move right
    predecessor[level] = current

search(target):
  predecessors = find_predecessors(target)
  return predecessors[0].next[0] has target

add(value):
  predecessors = find_predecessors(value)
  height = random geometric height
  splice one new node into levels [0, height)

erase(value):
  predecessors = find_predecessors(value)
  victim = predecessors[0].next[0]
  if victim is not value: return false
  unlink victim at every level that points to it
  return true`,
    proof: [
      "At each level the walk stops at the rightmost value smaller than the target; descending cannot skip a valid predecessor because higher levels are subsequences of lower ones.",
      "Splicing between each predecessor and successor preserves sorted order, while unlinking the same victim reconnects those neighbors and leaves every other occurrence intact."
    ],
    complexity: [
      { operation: "search, add, erase", time: "Expected O(log n), worst O(n)", reason: "Geometric promotion yields logarithmic expected paths; an unlucky random shape can degenerate." },
      { operation: "Storage", time: "Expected O(n)", reason: "The expected number of forward pointers per inserted value is constant." }
    ],
    python: `import random

class _Node:
    def __init__(self, value: int, level: int):
        self.value = value
        self.next = [None] * level


class Skiplist:
    MAX_LEVEL = 20

    def __init__(self):
        self.head = _Node(-1, self.MAX_LEVEL)

    def _predecessors(self, target: int):
        update = [None] * self.MAX_LEVEL
        current = self.head
        for level in range(self.MAX_LEVEL - 1, -1, -1):
            while current.next[level] and current.next[level].value < target:
                current = current.next[level]
            update[level] = current
        return update

    def _random_level(self):
        level = 1
        while level < self.MAX_LEVEL and random.getrandbits(1):
            level += 1
        return level

    def search(self, target: int) -> bool:
        update = self._predecessors(target)
        candidate = update[0].next[0]
        return candidate is not None and candidate.value == target

    def add(self, num: int) -> None:
        update = self._predecessors(num)
        level_count = self._random_level()
        node = _Node(num, level_count)
        for level in range(level_count):
            node.next[level] = update[level].next[level]
            update[level].next[level] = node

    def erase(self, num: int) -> bool:
        update = self._predecessors(num)
        victim = update[0].next[0]
        if victim is None or victim.value != num:
            return False
        for level in range(len(victim.next)):
            if update[level].next[level] is victim:
                update[level].next[level] = victim.next[level]
        return True`,
    cpp: `#include <random>
#include <vector>
using namespace std;

class Skiplist {
    struct Node {
        int value;
        vector<Node*> next;
        Node(int value, int levels) : value(value), next(levels, nullptr) {}
    };

    static const int MAX_LEVEL = 20;
    Node* head;
    mt19937 generator;

    vector<Node*> predecessors(int target) {
        vector<Node*> update(MAX_LEVEL);
        Node* current = head;
        for (int level = MAX_LEVEL - 1; level >= 0; --level) {
            while (current->next[level] && current->next[level]->value < target) {
                current = current->next[level];
            }
            update[level] = current;
        }
        return update;
    }

    int randomLevel() {
        int levels = 1;
        uniform_int_distribution<int> coin(0, 1);
        while (levels < MAX_LEVEL && coin(generator) == 1) ++levels;
        return levels;
    }

public:
    Skiplist() : head(new Node(-1, MAX_LEVEL)), generator(random_device{}()) {}

    bool search(int target) {
        vector<Node*> update = predecessors(target);
        Node* candidate = update[0]->next[0];
        return candidate && candidate->value == target;
    }

    void add(int num) {
        vector<Node*> update = predecessors(num);
        int levels = randomLevel();
        Node* node = new Node(num, levels);
        for (int level = 0; level < levels; ++level) {
            node->next[level] = update[level]->next[level];
            update[level]->next[level] = node;
        }
    }

    bool erase(int num) {
        vector<Node*> update = predecessors(num);
        Node* victim = update[0]->next[0];
        if (!victim || victim->value != num) return false;
        for (int level = 0; level < static_cast<int>(victim->next.size()); ++level) {
            if (update[level]->next[level] == victim) {
                update[level]->next[level] = victim->next[level];
            }
        }
        delete victim;
        return true;
    }
};`
  },
  "1603": {
    inputModel: "The constructor gives the number of big, medium, and small spaces. Each addCar(carType) call requests the matching type, encoded as 1, 2, or 3.",
    outputModel: "addCar returns true and consumes one matching space when capacity remains; otherwise it returns false without changing state.",
    example: {
      input: "ParkingSystem(2, 0, 1), addCar(2), addCar(1), addCar(1), addCar(3), addCar(1)",
      output: "null, false, true, true, true, false",
      trace: [
        { call: "addCar(2)", state: "medium starts at zero; all counters unchanged", result: "false" },
        { call: "addCar(1)", state: "remaining big=1, medium=0, small=1", result: "true" },
        { call: "addCar(1)", state: "remaining big=0, medium=0, small=1", result: "true" },
        { call: "addCar(3)", state: "remaining big=0, medium=0, small=0", result: "true" },
        { call: "addCar(1)", state: "no big slot remains; state unchanged", result: "false" }
      ]
    },
    intuition: "There is no cross-type assignment or departure operation, so the complete system state is just three remaining-capacity counters. A rejected request must be checked before decrementing.",
    approach: [
      "Store available counts in positions 1 through 3 so carType can index directly.",
      "If the selected counter is zero, reject without mutation.",
      "Otherwise decrement that one counter and accept."
    ],
    invariants: [
      "Every remaining-space counter is nonnegative.",
      "A successful request changes exactly its matching counter by minus one; a failed request changes nothing."
    ],
    diagram: {
      caption: "The request type selects exactly one independent capacity counter.",
      nodes: [
        { id: "request", label: "carType 1 / 2 / 3" },
        { id: "counter", label: "matching remaining count" },
        { id: "accept", label: "decrement + true" },
        { id: "reject", label: "unchanged + false" }
      ],
      edges: [
        { from: "request", to: "counter", label: "index" },
        { from: "counter", to: "accept", label: "count > 0" },
        { from: "counter", to: "reject", label: "count = 0" }
      ]
    },
    pseudocode: `initialize remaining = [unused, big, medium, small]

addCar(type):
  if remaining[type] == 0:
    return false
  remaining[type] -= 1
  return true`,
    proof: [
      "When the matching counter is positive, decrementing it reserves one real space and cannot make capacity negative.",
      "When it is zero, no legal matching space exists; returning false without mutation preserves the exact remaining capacities."
    ],
    complexity: [
      { operation: "addCar", time: "O(1)", reason: "One array lookup, comparison, and optional decrement are performed." },
      { operation: "Storage", time: "O(1)", reason: "Only three capacity counters are retained." }
    ],
    python: `class ParkingSystem:
    def __init__(self, big: int, medium: int, small: int):
        self.remaining = [0, big, medium, small]

    def addCar(self, carType: int) -> bool:
        if self.remaining[carType] == 0:
            return False
        self.remaining[carType] -= 1
        return True`,
    cpp: `#include <vector>
using namespace std;

class ParkingSystem {
    vector<int> remaining;

public:
    ParkingSystem(int big, int medium, int small)
        : remaining{0, big, medium, small} {}

    bool addCar(int carType) {
        if (remaining[carType] == 0) return false;
        --remaining[carType];
        return true;
    }
};`
  },
  "1396": {
    inputModel: "checkIn records a passenger id, origin, and time; checkOut supplies the same id, destination, and later time; getAverageTime asks about one directed origin-destination route.",
    outputModel: "Event calls return nothing. A route query returns the arithmetic mean duration of all completed trips on that directed route.",
    example: {
      input: "UndergroundSystem(), checkIn(314, Quartz, 11), checkIn(271, Harbor9, 14), checkOut(271, Cedar, 29), checkOut(314, Cedar, 34), checkIn(808, Quartz, 50), checkOut(808, Cedar, 69), getAverageTime(Quartz, Cedar)",
      output: "null, null, null, null, null, null, null, 21.0",
      trace: [
        { call: "checkIn(314, Quartz, 11), checkIn(271, Harbor9, 14)", state: "active sessions are keyed independently by 314 and 271", result: "null, null" },
        { call: "checkOut(271, Cedar, 29)", state: "route (Harbor9,Cedar): total=15, trips=1", result: "null" },
        { call: "checkOut(314, Cedar, 34)", state: "route (Quartz,Cedar): total=23, trips=1", result: "null" },
        { call: "checkIn(808, Quartz, 50)", state: "active[808]=(Quartz,50)", result: "null" },
        { call: "checkOut(808, Cedar, 69)", state: "route (Quartz,Cedar): total=42, trips=2", result: "null" },
        { call: "getAverageTime(Quartz, Cedar)", state: "divide total 42 by count 2", result: "21.0" }
      ]
    },
    intuition: "An unfinished trip belongs to a passenger, while a finished statistic belongs to a directed route. Two maps reflect those two lifecycles. Keeping total duration and trip count avoids saving history or rescanning it for every average.",
    approach: [
      "Map each active passenger id to its start station and check-in time.",
      "At checkout, remove that active record, compute the duration, and select a directed (start, end) route key.",
      "Accumulate duration sum and trip count for the route; answer an average by one division."
    ],
    invariants: [
      "Each checked-in passenger has exactly one active record, and checkout removes it.",
      "For every route, total equals the sum of all completed durations and count equals their number."
    ],
    diagram: {
      caption: "A checkout moves information from passenger session state into a route aggregate.",
      nodes: [
        { id: "checkin", label: "id → (start, time)" },
        { id: "checkout", label: "end, later time" },
        { id: "route", label: "(start, end)" },
        { id: "aggregate", label: "total duration + count" }
      ],
      edges: [
        { from: "checkin", to: "checkout", label: "match by id" },
        { from: "checkout", to: "route", label: "form directed key" },
        { from: "route", to: "aggregate", label: "add duration" }
      ]
    },
    pseudocode: `checkIn(id, station, time):
  active[id] = (station, time)

checkOut(id, destination, time):
  (origin, start) = remove active[id]
  duration = time - start
  routes[(origin, destination)].total += duration
  routes[(origin, destination)].count += 1

getAverageTime(origin, destination):
  aggregate = routes[(origin, destination)]
  return aggregate.total / aggregate.count`,
    proof: [
      "Consistent calls guarantee checkout finds the unique active record, so its subtraction produces exactly that passenger's trip duration and its route key has the correct direction.",
      "Adding each completed duration once maintains the sum-and-count invariant; dividing those two values is therefore the requested average."
    ],
    complexity: [
      { operation: "checkIn, checkOut, getAverageTime", time: "Average O(1)", reason: "Each operation uses a constant number of hash-map accesses and arithmetic operations." },
      { operation: "Storage", time: "O(A + R)", reason: "A is the number of active passengers and R is the number of distinct completed routes." }
    ],
    python: `from collections import defaultdict

class UndergroundSystem:
    def __init__(self):
        self.active = {}
        self.routes = defaultdict(lambda: [0, 0])

    def checkIn(self, id: int, stationName: str, t: int) -> None:
        self.active[id] = (stationName, t)

    def checkOut(self, id: int, stationName: str, t: int) -> None:
        start_station, start_time = self.active.pop(id)
        aggregate = self.routes[(start_station, stationName)]
        aggregate[0] += t - start_time
        aggregate[1] += 1

    def getAverageTime(self, startStation: str, endStation: str) -> float:
        total, count = self.routes[(startStation, endStation)]
        return total / count`,
    cpp: `#include <string>
#include <unordered_map>
#include <utility>
using namespace std;

class UndergroundSystem {
    unordered_map<int, pair<string, int>> active;
    unordered_map<string, unordered_map<string, pair<long long, int>>> routes;

public:
    UndergroundSystem() {}

    void checkIn(int id, string stationName, int t) {
        active[id] = {stationName, t};
    }

    void checkOut(int id, string stationName, int t) {
        auto trip = active[id];
        active.erase(id);
        auto& aggregate = routes[trip.first][stationName];
        aggregate.first += t - trip.second;
        ++aggregate.second;
    }

    double getAverageTime(string startStation, string endStation) {
        const auto& aggregate = routes[startStation][endStation];
        return static_cast<double>(aggregate.first) / aggregate.second;
    }
};`
  },
  "1797": {
    inputModel: "The constructor fixes a time-to-live. Calls generate or renew a token at currentTime, and countUnexpiredTokens asks how many expirations are strictly later than currentTime. Call times increase globally.",
    outputModel: "generate and renew return nothing; countUnexpiredTokens returns the number of live token ids. Renewing a missing or already expired token has no effect.",
    example: {
      input: "AuthenticationManager(11), generate(kiwi,3), generate(plum,8), renew(kiwi,13), countUnexpiredTokens(17), renew(plum,19), generate(mint,21), countUnexpiredTokens(24)",
      output: "null, null, null, null, 2, null, null, 1",
      trace: [
        { call: "generate(kiwi, 3)", state: "expires[kiwi]=14; queue=(14,kiwi)", result: "null" },
        { call: "generate(plum, 8)", state: "expires[plum]=19; queue appends (19,plum)", result: "null" },
        { call: "renew(kiwi, 13)", state: "expires[kiwi]=24; queue appends (24,kiwi)", result: "null" },
        { call: "countUnexpiredTokens(17)", state: "old (14,kiwi) is stale; kiwi and plum remain live", result: "2" },
        { call: "renew(plum, 19)", state: "plum expires at time 19, so cleanup removes it and renewal is ignored", result: "null" },
        { call: "generate(mint, 21)", state: "expires[mint]=32; kiwi and mint are live", result: "null" },
        { call: "countUnexpiredTokens(24)", state: "kiwi expires at time 24; only mint remains", result: "1" }
      ]
    },
    intuition: "A map answers the current expiry for a token. Because times increase and TTL is fixed, newly created expiries also increase, so a queue can clean old events from the front. Renewals leave stale queue events, distinguished by comparing them with the map's current expiry.",
    approach: [
      "Map every live token id to its latest expiration time.",
      "Append each generated or renewed (expiration, token) event to a chronological queue.",
      "Before an operation, pop events whose expiration is at most currentTime; delete a token only when the event still equals its latest mapped expiration.",
      "After cleanup, renew only a token still in the map and count with the map size."
    ],
    invariants: [
      "After cleanup at time t, the map contains exactly tokens with latest expiration greater than t.",
      "Queue events are ordered by expiration, and the map value identifies which event is authoritative after renewal."
    ],
    diagram: {
      caption: "The map owns current truth; the queue schedules cleanup and may contain stale renewal records.",
      nodes: [
        { id: "call", label: "generate / renew" },
        { id: "map", label: "token → latest expiry" },
        { id: "queue", label: "ordered expiry events" },
        { id: "clean", label: "pop expiry ≤ now" }
      ],
      edges: [
        { from: "call", to: "map", label: "write latest" },
        { from: "call", to: "queue", label: "append event" },
        { from: "queue", to: "clean", label: "front first" },
        { from: "clean", to: "map", label: "delete only if equal" }
      ]
    },
    pseudocode: `clean(now):
  while queue.front.expiry <= now:
    (expiry, token) = pop front
    if latest[token] == expiry:
      delete latest[token]

generate(token, now):
  clean(now)
  expiry = now + ttl
  latest[token] = expiry
  append (expiry, token)

renew(token, now):
  clean(now)
  if token absent: return
  assign and append now + ttl

count(now):
  clean(now)
  return latest.size`,
    proof: [
      "Since call times increase and TTL is constant, appended expiry events are nondecreasing; therefore cleanup can safely stop at the first future event.",
      "An expired event deletes its token only when it matches the token's latest expiry, so stale pre-renewal events cannot remove a renewed token; all genuinely expired latest events are removed."
    ],
    complexity: [
      { operation: "generate, renew, count", time: "Amortized O(1)", reason: "Each expiry event is appended once and removed once, plus average constant-time map work." },
      { operation: "Storage", time: "O(q)", reason: "At most one queue record per not-yet-cleaned generation or renewal is retained." }
    ],
    python: `from collections import deque

class AuthenticationManager:
    def __init__(self, timeToLive: int):
        self.ttl = timeToLive
        self.expires_at = {}
        self.events = deque()

    def _clean(self, current_time: int) -> None:
        while self.events and self.events[0][0] <= current_time:
            expiry, token = self.events.popleft()
            if self.expires_at.get(token) == expiry:
                del self.expires_at[token]

    def generate(self, tokenId: str, currentTime: int) -> None:
        self._clean(currentTime)
        expiry = currentTime + self.ttl
        self.expires_at[tokenId] = expiry
        self.events.append((expiry, tokenId))

    def renew(self, tokenId: str, currentTime: int) -> None:
        self._clean(currentTime)
        if tokenId not in self.expires_at:
            return
        expiry = currentTime + self.ttl
        self.expires_at[tokenId] = expiry
        self.events.append((expiry, tokenId))

    def countUnexpiredTokens(self, currentTime: int) -> int:
        self._clean(currentTime)
        return len(self.expires_at)`,
    cpp: `#include <queue>
#include <string>
#include <unordered_map>
#include <utility>
using namespace std;

class AuthenticationManager {
    int ttl;
    unordered_map<string, int> expiresAt;
    queue<pair<int, string>> events;

    void clean(int currentTime) {
        while (!events.empty() && events.front().first <= currentTime) {
            int expiry = events.front().first;
            string token = events.front().second;
            events.pop();
            auto it = expiresAt.find(token);
            if (it != expiresAt.end() && it->second == expiry) {
                expiresAt.erase(it);
            }
        }
    }

public:
    AuthenticationManager(int timeToLive) : ttl(timeToLive) {}

    void generate(string tokenId, int currentTime) {
        clean(currentTime);
        int expiry = currentTime + ttl;
        expiresAt[tokenId] = expiry;
        events.push({expiry, tokenId});
    }

    void renew(string tokenId, int currentTime) {
        clean(currentTime);
        if (!expiresAt.count(tokenId)) return;
        int expiry = currentTime + ttl;
        expiresAt[tokenId] = expiry;
        events.push({expiry, tokenId});
    }

    int countUnexpiredTokens(int currentTime) {
        clean(currentTime);
        return static_cast<int>(expiresAt.size());
    }
};`
  },
  "2043": {
    inputModel: "The constructor receives balances for accounts numbered 1 through n. Calls transfer, deposit, or withdraw name one or two account numbers and a nonnegative money amount.",
    outputModel: "Every transaction returns true only when all referenced accounts exist and the source has enough money when required; rejected transactions leave every balance unchanged.",
    example: {
      input: "Bank([91,4,207,63,18,0]), withdraw(3,57), transfer(1,6,90), deposit(2,38), transfer(5,4,19), withdraw(7,1), transfer(6,5,44), deposit(1,99)",
      output: "null, true, true, true, false, false, true, true",
      trace: [
        { call: "withdraw(3,57)", state: "balances=[91,4,150,63,18,0]", result: "true" },
        { call: "transfer(1,6,90)", state: "balances=[1,4,150,63,18,90]", result: "true" },
        { call: "deposit(2,38)", state: "balances=[1,42,150,63,18,90]", result: "true" },
        { call: "transfer(5,4,19)", state: "account 5 has only 18; balances unchanged", result: "false" },
        { call: "withdraw(7,1)", state: "account 7 is invalid; balances unchanged", result: "false" },
        { call: "transfer(6,5,44)", state: "balances=[1,42,150,63,62,46]", result: "true" },
        { call: "deposit(1,99)", state: "balances=[100,42,150,63,62,46]", result: "true" }
      ]
    },
    intuition: "The array is already the canonical ledger. The important design rule is validate first and mutate second, especially for transfers that touch two balances. Converting account numbers only after validation avoids invalid indexing.",
    approach: [
      "Keep the supplied balance array and validate an account with 1 <= account <= n.",
      "For deposit, validate then add money to account - 1.",
      "For withdraw, also confirm sufficient funds before subtracting.",
      "For transfer, validate both endpoints and source funds before changing either balance, then debit and credit as one accepted action."
    ],
    invariants: [
      "Balances reflect exactly the initial money plus all successful transaction deltas.",
      "No failed transaction changes any account, and no successful withdrawal or transfer makes its source negative."
    ],
    diagram: {
      caption: "A transaction passes every guard before reaching the mutation boundary.",
      nodes: [
        { id: "request", label: "transaction request" },
        { id: "accounts", label: "validate account ids" },
        { id: "funds", label: "validate source funds" },
        { id: "commit", label: "apply all balance deltas" },
        { id: "reject", label: "false, no mutation" }
      ],
      edges: [
        { from: "request", to: "accounts", label: "first guard" },
        { from: "accounts", to: "funds", label: "valid ids" },
        { from: "accounts", to: "reject", label: "invalid id" },
        { from: "funds", to: "commit", label: "enough money" },
        { from: "funds", to: "reject", label: "insufficient" }
      ]
    },
    pseudocode: `valid(account): return 1 <= account <= number of balances

transfer(a, b, money):
  if either account invalid or balance[a] < money: return false
  balance[a] -= money
  balance[b] += money
  return true

deposit(a, money):
  if a invalid: return false
  balance[a] += money; return true

withdraw(a, money):
  if a invalid or balance[a] < money: return false
  balance[a] -= money; return true`,
    proof: [
      "Each method checks every condition from the transaction contract before its first write, so a rejected request cannot partially change the ledger.",
      "For an accepted transfer, equal debit and credit preserve total money; accepted deposits and withdrawals apply exactly their specified single-account delta."
    ],
    complexity: [
      { operation: "transfer, deposit, withdraw", time: "O(1)", reason: "Each transaction validates and updates a constant number of array positions." },
      { operation: "Storage", time: "O(n)", reason: "One balance is retained for each account." }
    ],
    python: `from typing import List

class Bank:
    def __init__(self, balance: List[int]):
        self.balance = balance
        self.n = len(balance)

    def _valid(self, account: int) -> bool:
        return 1 <= account <= self.n

    def transfer(self, account1: int, account2: int, money: int) -> bool:
        if not self._valid(account1) or not self._valid(account2):
            return False
        if self.balance[account1 - 1] < money:
            return False
        self.balance[account1 - 1] -= money
        self.balance[account2 - 1] += money
        return True

    def deposit(self, account: int, money: int) -> bool:
        if not self._valid(account):
            return False
        self.balance[account - 1] += money
        return True

    def withdraw(self, account: int, money: int) -> bool:
        if not self._valid(account) or self.balance[account - 1] < money:
            return False
        self.balance[account - 1] -= money
        return True`,
    cpp: `#include <vector>
using namespace std;

class Bank {
    vector<long long> balances;

    bool valid(int account) const {
        return account >= 1 && account <= static_cast<int>(balances.size());
    }

public:
    Bank(vector<long long>& balance) : balances(balance) {}

    bool transfer(int account1, int account2, long long money) {
        if (!valid(account1) || !valid(account2)) return false;
        if (balances[account1 - 1] < money) return false;
        balances[account1 - 1] -= money;
        balances[account2 - 1] += money;
        return true;
    }

    bool deposit(int account, long long money) {
        if (!valid(account)) return false;
        balances[account - 1] += money;
        return true;
    }

    bool withdraw(int account, long long money) {
        if (!valid(account) || balances[account - 1] < money) return false;
        balances[account - 1] -= money;
        return true;
    }
};`
  },
  "2241": {
    inputModel: "The ATM starts empty. deposit receives counts in denomination order [20, 50, 100, 200, 500]. withdraw receives an amount and must try larger banknotes before smaller ones.",
    outputModel: "deposit returns nothing. A successful withdrawal returns five dispensed counts in ascending denomination order and commits them; failure returns [-1] and preserves inventory.",
    example: {
      input: "ATM(), deposit([3,2,0,1,2]), withdraw(870), withdraw(750), deposit([0,0,3,0,0]), withdraw(620)",
      output: "null, null, [-1], [0,1,0,1,1], null, [1,0,1,0,1]",
      trace: [
        { call: "deposit([3,2,0,1,2])", state: "stock=[3,2,0,1,2]", result: "null" },
        { call: "withdraw(870)", state: "greedy plan leaves 10 after using 500, 200, two 50s, and three 20s; stock unchanged", result: "[-1]" },
        { call: "withdraw(750)", state: "use one 500, one 200, one 50; stock=[3,1,0,0,1]", result: "[0,1,0,1,1]" },
        { call: "deposit([0,0,3,0,0])", state: "stock=[3,1,3,0,1]", result: "null" },
        { call: "withdraw(620)", state: "use one 500, one 100, one 20; stock=[2,1,2,0,0]", result: "[1,0,1,0,1]" }
      ]
    },
    intuition: "The machine's rule is a deterministic greedy policy, not a general coin-change search. Build a tentative plan from 500 downward. Inventory must not change until the plan reaches exactly zero, because a failed greedy attempt is required to roll back completely.",
    approach: [
      "Store counts aligned with the five fixed denomination values.",
      "Deposit by adding each supplied count to inventory.",
      "For withdrawal, scan denominations from largest to smallest and tentatively take the minimum of available notes and the amount quotient.",
      "If a remainder survives, return [-1]; otherwise subtract every planned count and return the plan in the required order."
    ],
    invariants: [
      "Inventory counts are never negative and equal deposits minus successful withdrawals.",
      "At each greedy step, the tentative plan takes the maximum possible count of the current denomination before considering smaller notes."
    ],
    diagram: {
      caption: "Plan first, then cross one commit boundary only after the remainder reaches zero.",
      nodes: [
        { id: "amount", label: "requested amount" },
        { id: "greedy", label: "500 → 200 → 100 → 50 → 20" },
        { id: "plan", label: "tentative note counts" },
        { id: "commit", label: "subtract inventory" },
        { id: "fail", label: "[-1], inventory unchanged" }
      ],
      edges: [
        { from: "amount", to: "greedy", label: "remaining" },
        { from: "greedy", to: "plan", label: "take maximum available" },
        { from: "plan", to: "commit", label: "remainder = 0" },
        { from: "plan", to: "fail", label: "remainder > 0" }
      ]
    },
    pseudocode: `deposit(counts):
  for each denomination i: stock[i] += counts[i]

withdraw(amount):
  used = five zeros
  remaining = amount
  for i from denomination 500 down to 20:
    used[i] = min(stock[i], remaining / denomination[i])
    remaining -= used[i] * denomination[i]
  if remaining != 0: return [-1]
  for each i: stock[i] -= used[i]
  return used`,
    proof: [
      "At every denomination the algorithm takes exactly as many notes as the priority rule permits, so the tentative sequence is the machine's required larger-first attempt.",
      "A zero remainder proves the planned notes sum to the request and available-count caps prevent overdrawing stock; otherwise no mutation has occurred, so failure preserves inventory."
    ],
    complexity: [
      { operation: "deposit, withdraw", time: "O(1)", reason: "Both scan exactly five denominations." },
      { operation: "Storage", time: "O(1)", reason: "Inventory and a withdrawal plan each contain five counters." }
    ],
    python: `from typing import List

class ATM:
    def __init__(self):
        self.denominations = [20, 50, 100, 200, 500]
        self.stock = [0] * 5

    def deposit(self, banknotesCount: List[int]) -> None:
        for index in range(5):
            self.stock[index] += banknotesCount[index]

    def withdraw(self, amount: int) -> List[int]:
        used = [0] * 5
        remaining = amount
        for index in range(4, -1, -1):
            used[index] = min(self.stock[index], remaining // self.denominations[index])
            remaining -= used[index] * self.denominations[index]

        if remaining != 0:
            return [-1]

        for index in range(5):
            self.stock[index] -= used[index]
        return used`,
    cpp: `#include <algorithm>
#include <vector>
using namespace std;

class ATM {
    vector<long long> stock;
    const vector<int> denominations{20, 50, 100, 200, 500};

public:
    ATM() : stock(5, 0) {}

    void deposit(vector<int> banknotesCount) {
        for (int i = 0; i < 5; ++i) stock[i] += banknotesCount[i];
    }

    vector<int> withdraw(int amount) {
        vector<long long> used(5, 0);
        long long remaining = amount;

        for (int i = 4; i >= 0; --i) {
            used[i] = min(stock[i], remaining / denominations[i]);
            remaining -= used[i] * denominations[i];
        }

        if (remaining != 0) return {-1};

        vector<int> answer(5);
        for (int i = 0; i < 5; ++i) {
            stock[i] -= used[i];
            answer[i] = static_cast<int>(used[i]);
        }
        return answer;
    }
};`
  }
};
